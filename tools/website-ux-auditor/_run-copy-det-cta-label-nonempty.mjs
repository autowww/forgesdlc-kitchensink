#!/usr/bin/env node
import { copyFileSync, mkdirSync, readFileSync, existsSync, unlinkSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const src = join(
  root,
  "tools/website-ux-auditor/forgesdlc-kitchensink/docs/design/ux-audit/rule-pages/det-cta-label-nonempty.md",
);
const dest = join(
  root,
  "docs/design/ux-audit/rule-pages/det-cta-label-nonempty.md",
);
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
for (const extra of [
  join(
    root,
    "tools/website-ux-auditor/docs/design/ux-audit/rule-pages/det-cta-label-nonempty.md",
  ),
]) {
  if (existsSync(extra)) unlinkSync(extra);
}
const m = destText.match(/^page_version:\s*(.+)$/m);
console.log(
  JSON.stringify({
    ok: true,
    source_exists: existsSync(src),
    dest_exists: existsSync(dest),
    page_version_line: m ? `page_version: ${m[1].trim()}` : null,
    dest,
  }),
);
