#!/usr/bin/env node
import { copyFileSync, mkdirSync, readFileSync, existsSync, unlinkSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const src = join(
  root,
  "tools/website-ux-auditor/docs/design/ux-audit/rule-pages/det-app-persistent-chrome.md",
);
const dest = join(
  root,
  "docs/design/ux-audit/rule-pages/det-app-persistent-chrome.md",
);
mkdirSync(dirname(dest), { recursive: true });
copyFileSync(src, dest);
if (!existsSync(dest)) {
  console.error("DEST_MISSING");
  process.exit(1);
}
unlinkSync(src);
const text = readFileSync(dest, "utf8");
const lines = text.split("\n").length;
const m = text.match(/^page_version:\s*(.+)$/m);
console.log(JSON.stringify({ ok: true, lines, page_version: m ? m[1].trim() : null, dest }));