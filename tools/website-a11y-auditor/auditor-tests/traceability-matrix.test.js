import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import { buildAxeRuleCatalog } from '../lib/axe-rule-catalog.js';
import {
  buildStandardsTraceability,
  resolveProfileCriteria,
  resolveRtmProfileId,
  traceabilitySummaryForProfile,
} from '../lib/build-traceability-matrix.js';
import { parseWcagCriterionFromAxeTag, wcagCriteriaFromAxeTags } from '../lib/wcag-tag-parse.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOOL_ROOT = path.resolve(__dirname, '..');
const CATALOG_PATH = path.resolve(
  TOOL_ROOT,
  '../../docs/design/a11y-audit/wcag-criteria-catalog.json',
);
const REGISTRY_PATH = path.resolve(TOOL_ROOT, 'design-rules/registry.generated.json');
const MATRIX_PATH = path.resolve(TOOL_ROOT, 'design-rules/standards-traceability.generated.json');

describe('wcag-tag-parse', () => {
  it('parses wcag143 to 1.4.3', () => {
    assert.equal(parseWcagCriterionFromAxeTag('wcag143'), '1.4.3');
    assert.equal(parseWcagCriterionFromAxeTag('wcag21aa'), null);
  });

  it('parses four-digit axe tags such as wcag1412', () => {
    assert.equal(parseWcagCriterionFromAxeTag('wcag1412'), '1.4.12');
    assert.equal(parseWcagCriterionFromAxeTag('wcag2411'), '2.4.11');
  });

  it('collects criteria from tag list', () => {
    assert.deepEqual(wcagCriteriaFromAxeTags(['wcag111', 'wcag2aa', 'wcag412']), ['1.1.1', '4.1.2']);
    assert.ok(wcagCriteriaFromAxeTags(['wcag1412', 'wcag21aa']).includes('1.4.12'));
  });
});

describe('traceability-matrix', () => {
  const catalogJson = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
  const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));

  it('wcag22aa includes 2.2-only criteria', () => {
    const criteria = resolveProfileCriteria(catalogJson, 'wcag22aa');
    const ids = criteria.map((c) => c.id);
    assert.ok(ids.includes('2.4.11'));
    assert.ok(ids.includes('3.3.8'));
    assert.ok(ids.length > resolveProfileCriteria(catalogJson, 'wcag21aa').length);
  });

  it('maps DET.A11Y.GENERIC.LANG to 3.1.1', () => {
    const matrix = buildStandardsTraceability({
      catalogJson,
      registry,
      axeCatalog: buildAxeRuleCatalog(),
    });
    const row = matrix.profiles.wcag21aa.criteria.find((c) => c.criterionId === '3.1.1');
    assert.ok(row);
    assert.ok(row.detRules.includes('DET.A11Y.GENERIC.LANG'));
  });

  it('excludes forge_only from untiedRules', () => {
    const matrix = buildStandardsTraceability({
      catalogJson,
      registry,
      axeCatalog: buildAxeRuleCatalog(),
    });
    const untiedIds = matrix.profiles.wcag21aa.gaps.untiedRules.map((u) => u.ruleId);
    assert.ok(!untiedIds.includes('DET.A11Y.KS.HASH_MARKERS'));
    assert.ok(!untiedIds.includes('DET.A11Y.KS.PY_HASH_ATTRS'));
    assert.ok(matrix.profiles.wcag21aa.gaps.forgeOnlyRules.includes('DET.A11Y.KS.HASH_MARKERS'));
  });

  it('uncovered count is between zero and total', () => {
    const matrix = buildStandardsTraceability({
      catalogJson,
      registry,
      axeCatalog: buildAxeRuleCatalog(),
    });
    const s = matrix.profiles.wcag21aa.summary;
    assert.ok(s.uncovered >= 0);
    assert.ok(s.uncovered <= s.totalCriteria);
    assert.ok(s.covered > 0);
    assert.equal(s.uncovered, 0, 'wcag21aa RTM should be closed after 2.1 DET rules');
  });

  it('resolveRtmProfileId maps ADA to wcag21aa', () => {
    assert.equal(resolveRtmProfileId('ada-title-ii-wcag21aa'), 'wcag21aa');
    assert.equal(resolveRtmProfileId('wcag22aa'), 'wcag22aa');
    assert.equal(resolveRtmProfileId('wcag20aa'), 'wcag20aa');
    assert.equal(resolveRtmProfileId('wcag20aaa'), 'wcag20aaa');
    assert.equal(resolveRtmProfileId('wcag20a'), 'wcag20a');
  });

  it('wcag20aa excludes WCAG 2.1-only criteria', () => {
    const criteria = resolveProfileCriteria(catalogJson, 'wcag20aa');
    const ids = criteria.map((c) => c.id);
    assert.equal(criteria.length, 38);
    assert.ok(!ids.includes('1.4.12'));
    assert.ok(!ids.includes('4.1.3'));
    assert.ok(ids.includes('4.1.1'));
  });

  it('wcag20a is level A subset of wcag20aa', () => {
    const a = resolveProfileCriteria(catalogJson, 'wcag20a');
    assert.ok(a.length > 0);
    assert.ok(a.every((c) => c.level === 'A'));
  });

  it('wcag20aaa includes AAA criteria', () => {
    const criteria = resolveProfileCriteria(catalogJson, 'wcag20aaa');
    assert.equal(criteria.length, 61);
    assert.ok(criteria.some((c) => c.id === '1.4.6' && c.level === 'AAA'));
  });

  it('generated matrix file exists after blend', () => {
    assert.ok(fs.existsSync(MATRIX_PATH));
    const matrix = JSON.parse(fs.readFileSync(MATRIX_PATH, 'utf8'));
    const summary = traceabilitySummaryForProfile(matrix, 'wcag22aa');
    assert.ok(summary);
    assert.equal(summary.rtmProfileId, 'wcag22aa');
    assert.equal(summary.totalCriteria, 56);
  });

  it('axe rule 28 maps to 1.4.12 and is not untied', () => {
    const matrix = buildStandardsTraceability({
      catalogJson,
      registry,
      axeCatalog: buildAxeRuleCatalog(),
    });
    const row = matrix.profiles.wcag21aa.criteria.find((c) => c.criterionId === '1.4.12');
    assert.ok(row?.axeRules?.includes('AXE.28'));
    const untiedIds = matrix.profiles.wcag21aa.gaps.untiedRules.map((u) => u.ruleId);
    assert.ok(!untiedIds.includes('AXE.28'));
  });

  it('wcag21aa catalog has 50 success criteria', () => {
    const criteria = resolveProfileCriteria(catalogJson, 'wcag21aa');
    assert.equal(criteria.length, 50);
  });
});
