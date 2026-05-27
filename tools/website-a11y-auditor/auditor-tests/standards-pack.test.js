import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import { STANDARDS_PACKS_DIR, validateStandardsPack } from '../lib/build-standards-pack.js';
import { loadStandardsPack } from '../lib/compliance-score.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOOL_ROOT = path.resolve(__dirname, '..');

describe('standards-pack', () => {
  it('wcag20aa pack exists after blend', () => {
    const packPath = path.join(STANDARDS_PACKS_DIR, 'wcag20aa.pack.json');
    assert.ok(fs.existsSync(packPath), 'run npm run blend-rules');
    const pack = JSON.parse(fs.readFileSync(packPath, 'utf8'));
    assert.equal(pack.packId, 'wcag20aa');
    assert.equal(pack.wcagVersion, '2.0');
    assert.equal(pack.summary.totalCriteria, 38);
    assert.deepEqual(pack.axeTags, ['wcag2a', 'wcag2aa']);
    const ids = pack.criteria.map((c) => c.id);
    assert.ok(!ids.includes('1.4.12'));
  });

  it('every criterion has tooling or is uncovered', () => {
    const pack = loadStandardsPack('wcag20aa');
    const uncovered = new Set(pack.validation.uncoveredCriteria || []);
    for (const c of pack.criteria) {
      const hasTooling = (c.tooling || []).length > 0;
      assert.ok(hasTooling || uncovered.has(c.id), `criterion ${c.id} has no tooling path`);
    }
  });

  it('validateStandardsPack passes for wcag21aa with allowManualOnly when uncovered', () => {
    const pack = loadStandardsPack('wcag21aa');
    const result = validateStandardsPack(pack, { allowManualOnly: true });
    assert.equal(result.ok, true);
  });

  it('wcag20aa pack has zero uncovered after DET gap rules', () => {
    const pack = loadStandardsPack('wcag20aa');
    const result = validateStandardsPack(pack, { allowManualOnly: true, strict: true });
    assert.equal(result.ok, true, result.errors?.join('; '));
    assert.deepEqual(pack.validation.uncoveredCriteria || [], []);
  });

  it('wcag20aa has no axe-only criteria after max DET pass', () => {
    const pack = loadStandardsPack('wcag20aa');
    const axeOnly = pack.criteria.filter(
      (c) => c.gap === 'covered' && c.tooling.includes('axe') && !c.tooling.includes('det'),
    );
    assert.equal(axeOnly.length, 0, `axe-only: ${axeOnly.map((c) => c.id).join(', ')}`);
  });

  it('wcag20aaa pack has zero uncovered after DET gap rules', () => {
    const pack = loadStandardsPack('wcag20aaa');
    const result = validateStandardsPack(pack, { allowManualOnly: true, strict: true });
    assert.equal(result.ok, true, result.errors?.join('; '));
    assert.deepEqual(pack.validation.uncoveredCriteria || [], []);
  });

  it('wcag21a pack has zero uncovered after 2.1 DET rules', () => {
    const pack = loadStandardsPack('wcag21a');
    const result = validateStandardsPack(pack, { allowManualOnly: true, strict: true });
    assert.equal(result.ok, true, result.errors?.join('; '));
    assert.deepEqual(pack.validation.uncoveredCriteria || [], []);
  });

  it('wcag21aa pack has zero uncovered and no axe-only after 2.1 DET rules', () => {
    const pack = loadStandardsPack('wcag21aa');
    const result = validateStandardsPack(pack, { allowManualOnly: true, strict: true });
    assert.equal(result.ok, true, result.errors?.join('; '));
    assert.deepEqual(pack.validation.uncoveredCriteria || [], []);
    const axeOnly = pack.criteria.filter(
      (c) => c.gap === 'covered' && c.tooling.includes('axe') && !c.tooling.includes('det'),
    );
    assert.equal(axeOnly.length, 0, `axe-only: ${axeOnly.map((c) => c.id).join(', ')}`);
  });

  it('wcag21aaa pack has zero uncovered after AAA DET rules', () => {
    const pack = loadStandardsPack('wcag21aaa');
    const result = validateStandardsPack(pack, { allowManualOnly: true, strict: true });
    assert.equal(result.ok, true, result.errors?.join('; '));
    assert.deepEqual(pack.validation.uncoveredCriteria || [], []);
  });

  it('wcag22aa pack has zero uncovered after 2.2 DET rules', () => {
    const pack = loadStandardsPack('wcag22aa');
    const result = validateStandardsPack(pack, { allowManualOnly: true, strict: true });
    assert.equal(result.ok, true, result.errors?.join('; '));
    assert.deepEqual(pack.validation.uncoveredCriteria || [], []);
  });
});
