#!/usr/bin/env node
import { copyFileSync, mkdirSync, readFileSync, existsSync, unlinkSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const src = join(
  root,
  "tools/website-ux-auditor/docs/design/ux-audit/rule-pages/det-card-title.md",
);
const dest = join(root, "docs/design/ux-audit/rule-pages/det-card-title.md");
mkdirSync(dirname(dest), { recursive: true });
copyFileSync(src, dest);
if (!existsSync(dest)) {
  console.error("DEST_MISSING");
  process.exit(1);
}
const srcText = readFileSync(src, "utf8");
const destText = readFileSync(dest, "utf8");
if (srcText !== destText) {
  console.error("MISMATCH");
  process.exit(1);
}
unlinkSync(src);
const m = destText.match(/^page_version:\s*(.+)$/m);
const lines = destText.split("\n").length;
const expected =
  "ee28367724421799c6bb05f9eddada3934bfdcfbdc953a16fcf32156ff285354";
const pageVersion = m ? m[1].trim() : null;
console.log(
  JSON.stringify({
    ok: pageVersion === expected && existsSync(dest),
    dest_exists: existsSync(dest),
    page_version: pageVersion,
    line_count: lines,
    dest,
  }),
);
