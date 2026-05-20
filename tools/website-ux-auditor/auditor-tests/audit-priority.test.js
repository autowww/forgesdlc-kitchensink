import assert from 'node:assert/strict';
import test from 'node:test';

import { RulePageTraceStore } from '../lib/audit-backlog-trace.js';
import {
  computeAdaptiveRuleOrder,
  pickHighestPriorityQueueItem,
  planAuditorPagePriority,
} from '../lib/audit-priority.js';

test('planAuditorPagePriority prefers low score URLs', () => {
  const scoreJson = {
    pages: [
      { url: 'http://site/low', score: 30 },
      { url: 'http://site/high', score: 95 },
    ],
  };
  const plan = planAuditorPagePriority(null, scoreJson, []);
  assert.equal(plan.orderedUrls[0], 'http://site/low');
});

test('pickHighestPriorityQueueItem dequeues high-priority href', () => {
  const queue = [
    { href: 'http://site/a', depth: 0 },
    { href: 'http://site/b', depth: 0 },
  ];
  const item = pickHighestPriorityQueueItem(queue, {
    'http://site/b': 100,
    'http://site/a': 10,
  });
  assert.equal(item?.href, 'http://site/b');
  assert.equal(queue.length, 1);
});

test('computeAdaptiveRuleOrder moves cold rules to deprioritized', () => {
  const store = new RulePageTraceStore({ disabled: false });
  store.registryFingerprint = 'fp';
  const ruleMeta = {
    id: 'DET.COLD',
    status: 'implemented',
    modulePath: 'x.check.js',
    sourceRule: 'x',
  };
  for (let i = 0; i < 5; i += 1) {
    store.record({
      url: `http://site/p${i}`,
      ruleMeta,
      pageContentFingerprint: `fp${i}`,
      status: 'ran',
      findingsCount: 0,
      findings: [],
    });
  }
  const { deprioritizedRuleIds } = computeAdaptiveRuleOrder(
    store,
    [],
    ['DET.COLD', 'DET.HOT'],
    { deprioritizeAfterPages: 4 },
  );
  assert.ok(deprioritizedRuleIds.includes('DET.COLD'));
  assert.ok(!deprioritizedRuleIds.includes('DET.HOT'));
});
