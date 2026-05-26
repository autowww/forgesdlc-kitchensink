import assert from 'node:assert/strict';
import test from 'node:test';

import { evaluateCrawlHalt } from '../lib/crawl.js';
import { DEFAULT_QUALITY_GATE_THRESHOLDS } from '../lib/quality-gate.js';

test('evaluateCrawlHalt stops at backlog_threshold when finding count exceeds limit', () => {
  const r = evaluateCrawlHalt({
    findingAccum: 11,
    majorPlusAccum: 0,
    stopAfterBacklog: 10,
    stopAfterMajorPlus: 99,
    stopDisabled: false,
  });
  assert.equal(r.halt, true);
  assert.equal(r.reason, 'backlog_threshold');
});

test('evaluateCrawlHalt does not stop at exactly backlog limit', () => {
  const r = evaluateCrawlHalt({
    findingAccum: 10,
    majorPlusAccum: 0,
    stopAfterBacklog: 10,
    stopAfterMajorPlus: 99,
    stopDisabled: false,
  });
  assert.equal(r.halt, false);
});

test('evaluateCrawlHalt stops on quality_gate_threshold when gate violation units exceed budget', () => {
  const r = evaluateCrawlHalt({
    findingAccum: 3,
    majorPlusAccum: 0,
    stopAfterBacklog: 99,
    stopAfterMajorPlus: 99,
    stopAfterGateViolationUnits: 10,
    stopDisabled: false,
    haltOnQualityGate: true,
    severityCounts: { blocker: 0, critical: 0, major: 3, warn: 16, minor: 0, trivial: 0, cosmetic: 0 },
    qualityGateThresholds: DEFAULT_QUALITY_GATE_THRESHOLDS,
  });
  assert.equal(r.halt, true);
  assert.equal(r.reason, 'quality_gate_threshold');
  assert.ok((r.gateViolationUnits ?? 0) > 10);
});

test('evaluateCrawlHalt prefers quality gate before backlog when both would fire', () => {
  const r = evaluateCrawlHalt({
    findingAccum: 20,
    majorPlusAccum: 0,
    stopAfterBacklog: 10,
    stopAfterMajorPlus: 99,
    stopAfterGateViolationUnits: 10,
    stopDisabled: false,
    haltOnQualityGate: true,
    severityCounts: { blocker: 0, critical: 0, major: 3, warn: 16, minor: 0, trivial: 0, cosmetic: 0 },
    qualityGateThresholds: DEFAULT_QUALITY_GATE_THRESHOLDS,
  });
  assert.equal(r.reason, 'quality_gate_threshold');
});

test('evaluateCrawlHalt prefers backlog before major+ when both would fire', () => {
  const r = evaluateCrawlHalt({
    findingAccum: 20,
    majorPlusAccum: 100,
    stopAfterBacklog: 10,
    stopAfterMajorPlus: 5,
    stopDisabled: false,
  });
  assert.equal(r.reason, 'backlog_threshold');
});
