#!/usr/bin/env node
/**
 * Merge audit slice + playwright evidence + rule prompt into context.json.
 * usage: node ux-assemble-context.mjs --rule-id AI.X --url URL --rule-prompt PATH \
 *   --audit-slice PATH --playwright PATH --out context.json
 */
import fs from 'node:fs/promises';
import path from 'node:path';

const argv = process.argv.slice(2);
const args = {
  ruleId: '',
  url: '',
  rulePrompt: '',
  auditSlice: '',
  playwright: '',
  out: '',
};
for (let i = 0; i < argv.length; i += 1) {
  const k = argv[i];
  const n = argv[i + 1];
  if (k === '--rule-id') args.ruleId = n || '';
  else if (k === '--url') args.url = n || '';
  else if (k === '--rule-prompt') args.rulePrompt = n || '';
  else if (k === '--audit-slice') args.auditSlice = n || '';
  else if (k === '--playwright') args.playwright = n || '';
  else if (k === '--out') args.out = n || '';
}
if (!args.ruleId || !args.url || !args.out) {
  console.error(
    'usage: node ux-assemble-context.mjs --rule-id AI.X --url URL --rule-prompt P --audit-slice P --playwright P --out context.json',
  );
  process.exit(2);
}

const promptExcerpt = args.rulePrompt
  ? (await fs.readFile(path.resolve(args.rulePrompt), 'utf8')).slice(0, 8000)
  : '';
const auditSlice = args.auditSlice
  ? JSON.parse(await fs.readFile(path.resolve(args.auditSlice), 'utf8'))
  : {};
const playwrightEvidence = args.playwright
  ? JSON.parse(await fs.readFile(path.resolve(args.playwright), 'utf8'))
  : {};

const context = {
  ruleId: args.ruleId,
  urls: [args.url],
  rulePromptExcerpt: promptExcerpt,
  auditSlice,
  playwrightEvidence,
};
const outPath = path.resolve(args.out);
await fs.mkdir(path.dirname(outPath), { recursive: true });
await fs.writeFile(outPath, `${JSON.stringify(context, null, 2)}\n`, 'utf8');
