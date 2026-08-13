#!/usr/bin/env node
/**
 * Playwright full-page capture for Studio UX PDCA.
 * Screenshots nested scroll roots (e.g. main.fc-main), not only the viewport.
 * Usage: node capture-page.mjs <baseUrl> <pageJson> <outDir> [--mode before|after]
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function resolvePlaywright() {
  const require = createRequire(import.meta.url);
  const candidates = [
    process.env.FORGE_STUDIO_UX_PLAYWRIGHT_ROOT,
    process.env.STUDIO_UI_ROOT,
    path.join(process.env.CONSUMER_REPO_ROOT || "", "studio-ui"),
    path.join(__dirname, "../../../forge-market/studio-ui"),
  ].filter(Boolean);
  for (const root of candidates) {
    const pkg = path.join(root, "node_modules", "playwright");
    if (fs.existsSync(pkg)) {
      return require(path.join(pkg, "index.js"));
    }
  }
  return null;
}

const playwrightModule = resolvePlaywright();
if (!playwrightModule) {
  console.error("playwright not found — set CONSUMER_REPO_ROOT or STUDIO_UI_ROOT");
  process.exit(1);
}
const { chromium } = playwrightModule;

async function applyActions(page, actions = []) {
  for (const action of actions) {
    if (action.type === "wait") {
      await page.waitForTimeout(action.ms ?? 500);
      continue;
    }
    if (action.type === "click") {
      const root = action.within ? page.locator(action.within) : page;
      if (action.name_regex) {
        const role = action.role || "button";
        await root.getByRole(role, { name: new RegExp(action.name_regex) }).first().click();
      } else if (action.role && action.name) {
        const loc = root.getByRole(action.role, {
          name: action.name,
          exact: action.exact === true,
        });
        if ((await loc.count()) > 1) {
          await loc.first().click();
        } else {
          await loc.click();
        }
      } else if (action.selector) {
        const loc = root.locator(action.selector);
        if (action.first !== false) {
          await loc.first().click();
        } else {
          await loc.click();
        }
      }
      continue;
    }
    if (action.type === "goto_tab" && action.name) {
      const tab = page.getByRole("tab", { name: action.name, exact: false });
      if ((await tab.count()) > 0) {
        await tab.first().click();
      } else {
        await page.getByRole("button", { name: action.name, exact: false }).first().click();
      }
      continue;
    }
    if (action.type === "goto_rail" && action.name) {
      const btn = page.getByRole("button", { name: action.name, exact: false });
      if ((await btn.count()) > 0) {
        await btn.first().click();
      } else {
        await page.locator(".fc-chip", { hasText: action.name }).first().click();
      }
      continue;
    }
    if (action.type === "fill" && action.selector) {
      const loc = page.locator(action.selector);
      if (action.first !== false) {
        await loc.first().fill(action.value ?? "");
      } else {
        await loc.fill(action.value ?? "");
      }
    }
  }
}

function extractDomFacts(page, title) {
  return page.evaluate((pageTitle) => {
    const hashes = [...document.querySelectorAll("[data-ks-hash]")].map((el) =>
      el.getAttribute("data-ks-hash"),
    );
    const h1 = document.querySelector("h1")?.textContent?.trim() ?? "";
    const activeRail =
      document.querySelector(".fc-app-rail__btn--active .fc-app-rail__label")?.textContent?.trim() ??
      document.querySelector('[aria-current="page"]')?.textContent?.trim() ??
      "";
    const nav = [...document.querySelectorAll(".fc-app-rail__label, nav a, [role='navigation'] a")]
      .map((a) => a.textContent?.trim())
      .filter(Boolean)
      .slice(0, 20);
    const buttons = [...document.querySelectorAll("button, a.btn, .ks-button, .fc-btn")];
    const ctas = buttons.map((el) => el.textContent?.trim()).filter(Boolean).slice(0, 30);
    const primaryCtas = buttons.filter(
      (el) =>
        el.classList.contains("fc-btn") &&
        !el.classList.contains("fc-btn--ghost") &&
        el.offsetParent !== null,
    ).length;
    const h2Count = document.querySelectorAll("h2").length;
    const hasTablist = Boolean(document.querySelector("[role='tablist']"));
    const actionRows = [
      ...document.querySelectorAll(".fc-header-actions, .fm-compare-actions, .fm-tab-primary-actions"),
    ].map((row) => row.querySelectorAll("button:not([hidden])").length);
    const maxActionRow = actionRows.length ? Math.max(...actionRows) : 0;
    const lead =
      document.querySelector("h1 + p, h1 + .text-muted")?.textContent?.trim() ?? "";
    const testids = [...document.querySelectorAll("[data-testid]")]
      .map((el) => el.getAttribute("data-testid"))
      .filter(Boolean)
      .slice(0, 40);
    const scrollRoot =
      document.querySelector("main.fc-main") ||
      document.querySelector("[data-studio-scroll]") ||
      document.scrollingElement ||
      document.documentElement;
    return {
      document_title: document.title,
      page_title: pageTitle,
      h1,
      active_rail_label: activeRail,
      nav_labels: nav,
      cta_labels: ctas,
      primary_cta_count: primaryCtas,
      h2_count: h2Count,
      has_tablist: hasTablist,
      max_action_row_buttons: maxActionRow,
      lead_text: lead,
      ks_hash_count: hashes.length,
      ks_hashes: [...new Set(hashes)],
      testid_count: document.querySelectorAll("[data-testid]").length,
      testids,
      url: location.href,
      scroll_height: scrollRoot.scrollHeight || 0,
      client_height: scrollRoot.clientHeight || 0,
    };
  }, title);
}

async function captureFullScroll(page, shotPath, viewportPath) {
  await page.screenshot({ path: viewportPath, fullPage: false });

  const metrics = await page.evaluate(() => {
    const root =
      document.querySelector("main.fc-main") ||
      document.querySelector("[data-studio-scroll]") ||
      document.scrollingElement ||
      document.documentElement;
    return {
      selector: root.matches?.("main.fc-main")
        ? "main.fc-main"
        : root.getAttribute?.("data-studio-scroll") != null
          ? "[data-studio-scroll]"
          : null,
      scrollHeight: root.scrollHeight,
      clientHeight: root.clientHeight,
    };
  });

  // Expand nested scroll root so Playwright can see full content.
  const restore = await page.evaluate(() => {
    const root =
      document.querySelector("main.fc-main") ||
      document.querySelector("[data-studio-scroll]");
    if (!root) return null;
    const chain = [];
    let el = root;
    while (el && el !== document.documentElement) {
      chain.push({
        el,
        overflow: el.style.overflow,
        height: el.style.height,
        maxHeight: el.style.maxHeight,
        flex: el.style.flex,
      });
      el.style.overflow = "visible";
      el.style.height = "auto";
      el.style.maxHeight = "none";
      el = el.parentElement;
    }
    for (const node of [document.documentElement, document.body, document.getElementById("root")]) {
      if (!node) continue;
      chain.push({
        el: node,
        overflow: node.style.overflow,
        height: node.style.height,
        maxHeight: node.style.maxHeight,
        flex: node.style.flex,
      });
      node.style.overflow = "visible";
      node.style.height = "auto";
    }
    const shell = document.querySelector(".fc-shell");
    if (shell) {
      chain.push({
        el: shell,
        overflow: shell.style.overflow,
        height: shell.style.height,
        maxHeight: shell.style.maxHeight,
        flex: shell.style.flex,
      });
      shell.style.overflow = "visible";
      shell.style.height = "auto";
    }
    return chain.map((c) => ({
      path: c.el === document.documentElement ? "html" : c.el === document.body ? "body" : c.el.id === "root" ? "#root" : c.el.className,
      overflow: c.overflow,
      height: c.height,
      maxHeight: c.maxHeight,
      flex: c.flex,
    }));
  });

  await page.waitForTimeout(200);

  const maxCapture = parseInt(process.env.STUDIO_UX_MAX_CAPTURE_HEIGHT || "6000", 10);
  let captureCapped = false;
  if (maxCapture > 0 && metrics.scrollHeight > maxCapture) {
    captureCapped = true;
    await page.evaluate((maxH) => {
      const root =
        document.querySelector("main.fc-main") ||
        document.querySelector("[data-studio-scroll]") ||
        document.scrollingElement;
      if (root) {
        root.style.maxHeight = `${maxH}px`;
        root.style.overflow = "hidden";
      }
      for (const node of [document.documentElement, document.body, document.getElementById("root")]) {
        if (node) node.style.maxHeight = `${maxH}px`;
      }
    }, maxCapture);
    await page.waitForTimeout(150);
  }

  await page.screenshot({ path: shotPath, fullPage: true });

  // Best-effort restore (page is discarded after capture).
  void restore;

  const dims = await page.evaluate(() => ({
    screenshot_doc_height: document.documentElement.scrollHeight,
  }));

  return {
    scroll_height: metrics.scrollHeight,
    client_height: metrics.clientHeight,
    screenshot_height: dims.screenshot_doc_height,
    capture_capped: captureCapped,
    capture_cap_px: captureCapped ? maxCapture : null,
  };
}

function writeDescription(outDir, facts, mode) {
  const lines = [
    `# Page capture (${mode})`,
    "",
    `- **URL:** ${facts.url}`,
    `- **Title:** ${facts.document_title}`,
    `- **H1:** ${facts.h1 || "(none)"}`,
    `- **Active rail:** ${facts.active_rail_label || "(none)"}`,
    `- **H2 count:** ${facts.h2_count}`,
    `- **Has tablist:** ${facts.has_tablist}`,
    `- **Primary CTAs:** ${facts.primary_cta_count}`,
    `- **Max action-row buttons:** ${facts.max_action_row_buttons}`,
    `- **Scroll height:** ${facts.scroll_height}`,
    `- **Screenshot height:** ${facts.screenshot_height}`,
    `- **KS hashes:** ${facts.ks_hash_count} (${facts.ks_hashes.join(", ") || "none"})`,
    `- **data-testid count:** ${facts.testid_count}`,
    "",
    "## data-testid hooks",
    ...(facts.testids?.length ? facts.testids.map((t) => `- ${t}`) : ["- (none)"]),
    "",
    "## Lead",
    facts.lead_text || "(none)",
    "",
    "## Navigation labels",
    ...(facts.nav_labels.length ? facts.nav_labels.map((l) => `- ${l}`) : ["- (none)"]),
    "",
    "## Visible CTAs",
    ...(facts.cta_labels.length ? facts.cta_labels.map((l) => `- ${l}`) : ["- (none)"]),
    "",
  ];
  fs.writeFileSync(path.join(outDir, "description.md"), `${lines.join("\n")}\n`);
}

async function main() {
  const baseUrl = process.argv[2];
  const pageJsonPath = process.argv[3];
  const outDir = process.argv[4];
  const modeIdx = process.argv.indexOf("--mode");
  const mode = modeIdx !== -1 ? process.argv[modeIdx + 1] : "before";
  if (!baseUrl || !pageJsonPath || !outDir) {
    console.error("usage: capture-page.mjs <baseUrl> <page.json> <outDir> [--mode before|after]");
    process.exit(2);
  }
  const pageDef = JSON.parse(fs.readFileSync(pageJsonPath, "utf8"));
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const target = new URL(pageDef.path, baseUrl).toString();
  await page.goto(target, { waitUntil: "networkidle", timeout: 90_000 });
  await applyActions(page, pageDef.actions);
  await page.waitForTimeout(800);

  const shotName = mode === "after" ? "after.png" : "before.png";
  const shotPath = path.join(outDir, shotName);
  const viewportName = mode === "after" ? "after-viewport.png" : "before-viewport.png";
  const viewportPath = path.join(outDir, viewportName);

  const shotMeta = await captureFullScroll(page, shotPath, viewportPath);
  const facts = await extractDomFacts(page, pageDef.title);
  facts.screenshot_height = shotMeta.screenshot_height || shotMeta.scroll_height;
  facts.scroll_height = shotMeta.scroll_height || facts.scroll_height;
  facts.capture_capped = Boolean(shotMeta.capture_capped);
  facts.capture_cap_px = shotMeta.capture_cap_px ?? null;

  if (
    facts.scroll_height > 900 &&
    facts.screenshot_height > 0 &&
    facts.screenshot_height < facts.scroll_height * 0.9 &&
    !facts.capture_capped
  ) {
    console.error(
      JSON.stringify({
        ok: false,
        error: "FULLPAGE_SHOT_TOO_SHORT",
        scroll_height: facts.scroll_height,
        screenshot_height: facts.screenshot_height,
      }),
    );
    await browser.close();
    process.exit(1);
  }

  const pageJson = {
    slug: pageDef.slug,
    path: pageDef.path,
    title: pageDef.title,
    requires_dual_wiki_gate: Boolean(pageDef.requires_dual_wiki_gate),
    mode,
    captured_at: new Date().toISOString(),
    screenshot: shotName,
    viewport_screenshot: viewportName,
    ...facts,
  };
  const jsonName = mode === "after" ? "after-page.json" : "page.json";
  fs.writeFileSync(path.join(outDir, jsonName), `${JSON.stringify(pageJson, null, 2)}\n`);
  writeDescription(outDir, facts, mode);
  await browser.close();
  console.log(
    JSON.stringify({
      ok: true,
      screenshot_path: shotPath,
      page_json_path: path.join(outDir, jsonName),
      screenshot_height: facts.screenshot_height,
      scroll_height: facts.scroll_height,
    }),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
