#!/usr/bin/env node
import { copyFileSync, mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const src = join(
  root,
  "tools/website-ux-auditor/docs/design/ux-audit/rule-pages/det-chart-alt-summary.md",
);
const dest = join(root, "docs/design/ux-audit/rule-pages/det-chart-alt-summary.md");
mkdirSync(dirname(dest), { recursive: true });
copyFileSync(src, dest);
let text = readFileSync(dest, "utf8");
text = text.replace(/motion\/div#ks-cw/g, "div#ks-cw");
writeFileSync(dest, text);
const m = text.match(/^page_version:\s*(.+)$/m);
console.log(
  JSON.stringify({
    ok: existsSync(src) && existsSync(dest),
    src_exists: existsSync(src),
    dest_exists: existsSync(dest),
    page_version: m ? m[1].trim() : null,
    line125: text.split("\n")[124],
    dest,
    src,
  }),
);
