#!/usr/bin/env node
import { copyFileSync, mkdirSync, readFileSync, existsSync, unlinkSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const EXPECTED =
  "8b47ef1cec520e036dadd4f0ae3e9fb630d0f96e8be3c9728b373c131624629c";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const src = join(
  root,
  "tools/website-ux-auditor/docs/design/ux-audit/rule-pages/det-card-action-limit.md",
);
const dest = join(
  root,
  "docs/design/ux-audit/rule-pages/det-card-action-limit.md",
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
unlinkSync(src);
const m = destText.match(/^page_version:\s*(.+)$/m);
const pageVersion = m ? m[1].trim() : null;
if (pageVersion !== EXPECTED) {
  console.error(
    JSON.stringify({ ok: false, reason: "page_version_mismatch", pageVersion, expected: EXPECTED }),
  );
  process.exit(1);
}
console.log(
  JSON.stringify({
    ok: true,
    source_exists: existsSync(src),
    dest_exists: existsSync(dest),
    page_version_line: m ? `page_version: ${pageVersion}` : null,
    dest,
  }),
);
