#!/usr/bin/env node
/**
 * Parse Cursor agent stdout/transcript into normalized findings JSON.
 * Usage: node parse-ai-agent-findings.mjs --in TRANSCRIPT --out findings.json [--rule-id AI.X]
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  extractJsonFromAgentText,
  normalizeAiFinding,
} from '../lib/ai-audit-batches.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function usage() {
  console.error(
    'usage: node parse-ai-agent-findings.mjs --in TRANSCRIPT --out OUT.json [--rule-id AI.X]',
  );
}

const argv = process.argv.slice(2);
const args = { in: '', out: '', ruleId: '' };
for (let i = 0; i < argv.length; i += 1) {
  const key = argv[i];
  const next = argv[i + 1];
  if (key === '--in') args.in = next || '';
  else if (key === '--out') args.out = next || '';
  else if (key === '--rule-id') args.ruleId = next || '';
}
if (!args.in || !args.out) {
  usage();
  process.exit(2);
}

const raw = await fs.readFile(path.resolve(args.in), 'utf8');
const parsed = extractJsonFromAgentText(raw);
const findings = (parsed?.findings || [])
  .map((item) => normalizeAiFinding(item))
  .filter(Boolean);

const payload = {
  schemaVersion: 1,
  parseOk: Boolean(parsed),
  summary: String(parsed?.summary || '').trim(),
  findings,
  matchedCount: args.ruleId
    ? findings.filter((f) => f.principleId === args.ruleId).length
    : findings.length,
};

await fs.mkdir(path.dirname(path.resolve(args.out)), { recursive: true });
await fs.writeFile(path.resolve(args.out), `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
process.stdout.write(String(payload.matchedCount));
