import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  collectAgentMetricsFromOutDir,
  formatTokenCount,
  formatWatchAgentMetricsLines,
  parseCursorResultLine,
  parseUxAgentUsageSummaryLine,
  parseUxLlmUsageLine,
  sumCursorUsageTokens,
} from '../lib/loop-watch-agent-metrics.js';

test('sumCursorUsageTokens aggregates usage fields', () => {
  assert.equal(
    sumCursorUsageTokens({
      inputTokens: 100,
      outputTokens: 50,
      cacheReadTokens: 1000,
      cacheWriteTokens: 0,
    }),
    1150,
  );
});

test('parseCursorResultLine reads NDJSON result usage', () => {
  const line = JSON.stringify({
    type: 'result',
    subtype: 'success',
    is_error: false,
    request_id: 'req-1',
    usage: { inputTokens: 10, outputTokens: 5, cacheReadTokens: 100, cacheWriteTokens: 0 },
  });
  const p = parseCursorResultLine(line);
  assert.ok(p);
  assert.equal(p.ok, true);
  assert.equal(sumCursorUsageTokens(p.usage), 115);
  assert.equal(p.requestId, 'req-1');
});

test('parseUxAgentUsageSummaryLine reads compact summary', () => {
  const p = parseUxAgentUsageSummaryLine('[ux-agent] usage in=210341 out=17236 cacheR=2917824 cacheW=0');
  assert.ok(p);
  assert.equal(sumCursorUsageTokens(p.usage), 210341 + 17236 + 2917824);
});

test('parseUxLlmUsageLine splits local vs cloud', () => {
  const local = parseUxLlmUsageLine('[ux-llm] provider=local in=500 out=200');
  assert.equal(local?.provider, 'local');
  assert.equal(local?.tokens, 700);
  const cloud = parseUxLlmUsageLine('[ux-llm] provider=cloud total=1200');
  assert.equal(cloud?.provider, 'cloud');
  assert.equal(cloud?.tokens, 1200);
});

test('formatTokenCount compact labels', () => {
  assert.equal(formatTokenCount(0), '0');
  assert.equal(formatTokenCount(999), '999');
  assert.equal(formatTokenCount(1500), '1.5k');
  assert.equal(formatTokenCount(12000), '12k');
  assert.equal(formatTokenCount(3_100_000), '3.1M');
});

test('collectAgentMetricsFromOutDir scans remediation log', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ux-metrics-'));
  const usage = { inputTokens: 1000, outputTokens: 200, cacheReadTokens: 0, cacheWriteTokens: 0 };
  const row = JSON.stringify({
    type: 'result',
    subtype: 'success',
    is_error: false,
    request_id: 'a',
    usage,
  });
  fs.writeFileSync(path.join(dir, 'remediation-agent.log'), `${row}\n`, 'utf8');
  const m = collectAgentMetricsFromOutDir(dir);
  assert.equal(m.runs.total, 1);
  assert.equal(m.runs.remediation, 1);
  assert.equal(m.tokens.cursor, 1200);
  const lines = formatWatchAgentMetricsLines(m, 80);
  assert.match(lines[0], /Agents 1/);
  assert.match(lines[0], /Cursor/);
  assert.match(lines[1], /LLM local/);
});
