#!/usr/bin/env node
/** Assemble cycle archive zip from iteration folder. */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const FILES = [
  "before.png",
  "after.png",
  "page.json",
  "description.md",
  "wiki-context.md",
  "assessment.json",
  "pdca-prompt.md",
  "scores.json",
  "changes-summary.md",
  "cursor-agent.log",
  "gates.json",
];

function main() {
  const cycleDir = process.argv[2];
  if (!cycleDir) {
    console.error("usage: build-page-bundle.mjs <cycleDir>");
    process.exit(2);
  }
  const abs = path.resolve(cycleDir);
  const existing = FILES.filter((f) => fs.existsSync(path.join(abs, f)));
  const zipPath = path.join(abs, "cycle.zip");
  if (existing.length === 0) {
    console.error("no artifacts to bundle");
    process.exit(1);
  }
  execFileSync("zip", ["-j", zipPath, ...existing.map((f) => path.join(abs, f))], {
    cwd: abs,
    stdio: "inherit",
  });
  const cycle = {
    schema: "forge.studio_ux_cycle.v1",
    cycle_dir: abs,
    cycle_zip: zipPath,
    artifacts: Object.fromEntries(existing.map((f) => [f.replace(/\./g, "_"), path.join(abs, f)])),
    bundled_at: new Date().toISOString(),
  };
  fs.writeFileSync(path.join(abs, "cycle-manifest.json"), `${JSON.stringify(cycle, null, 2)}\n`);
  console.log(JSON.stringify({ ok: true, cycle_zip: zipPath }));
}

main();
