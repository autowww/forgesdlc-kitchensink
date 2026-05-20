import assert from 'node:assert/strict';
import test from 'node:test';

import {
  MIN_SLOT_BODY_CHARS,
  MIN_VISIBLE_SLOT_HEIGHT,
  classifyOptionalSlotViolation,
  findingsFromOptionalRegionsReport,
  run,
} from '../design-rules/deterministic/generated/det-py-optional-regions.check.js';

test('classifyOptionalSlotViolation passes collapsed or populated slots', () => {
  assert.equal(classifyOptionalSlotViolation({ height: 4, headingChars: 8, bodyChars: 0, bodyNodes: 0 }), null);
  assert.equal(
    classifyOptionalSlotViolation({ height: 40, headingChars: 8, bodyChars: 24, bodyNodes: 1 }),
    null,
  );
});

test('classifyOptionalSlotViolation flags ghost headings and empty visible slots', () => {
  assert.equal(
    classifyOptionalSlotViolation({ height: 48, headingChars: 7, bodyChars: 0, bodyNodes: 0 }),
    'ghost-heading',
  );
  assert.equal(
    classifyOptionalSlotViolation({ height: 32, headingChars: 0, bodyChars: 0, bodyNodes: 0 }),
    'empty-visible-slot',
  );
});

test('findingsFromOptionalRegionsReport maps violations to IA findings', () => {
  const findings = findingsFromOptionalRegionsReport({
    violations: [
      {
        kind: 'ghost-heading',
        slot: 'listing-sidebar',
        selectorHint: 'aside.fs-listing-shell__sidebar',
        headingChars: 7,
        bodyChars: 0,
      },
    ],
  }, 'https://example.test/listing');
  assert.equal(findings.length, 1);
  assert.equal(findings[0].severity, 'warn');
  assert.ok(findings[0].message.includes('heading'));
  assert.ok(findings[0].evidence.includes('optional_region_ghost-heading'));
  assert.ok(findings[0].evidence.includes('url=https://example.test/listing'));
  assert.ok(findings[0].remediation.includes('render_listing_shell'));
});

test('findingsFromOptionalRegionsReport returns empty when clean', () => {
  assert.deepEqual(findingsFromOptionalRegionsReport({ violations: [] }), []);
});

test('run returns empty without report or page', async () => {
  assert.deepEqual(await run({ metrics: {}, url: 'https://example.test/' }), []);
});

test('run uses metrics.optionalRegionsReport when provided', async () => {
  const findings = await run({
    metrics: {
      url: 'https://example.test/marketing',
      optionalRegionsReport: {
        optionalSlotCount: 1,
        violations: [
          {
            kind: 'empty-visible-slot',
            slot: 'site-announcement',
            selectorHint: 'div.fs-site-announcement',
            headingChars: 0,
            bodyChars: 0,
          },
        ],
      },
    },
    url: 'https://example.test/marketing',
  });
  assert.equal(findings.length, 1);
  assert.ok(findings[0].message.includes('empty'));
  assert.equal(MIN_SLOT_BODY_CHARS, 3);
  assert.equal(MIN_VISIBLE_SLOT_HEIGHT, 8);
});
