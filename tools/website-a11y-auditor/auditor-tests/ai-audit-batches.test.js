import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  extractJsonFromAgentText,
  normalizeAiFinding,
} from '../lib/ai-audit-batches.js';

describe('ai-audit-batches', () => {
  it('extractJsonFromAgentText parses fenced JSON', () => {
    const raw = 'Here:\n```json\n{"summary":"ok","findings":[{"principleId":"AI.A11Y.GENERIC.LANG","severity":"warn","message":"missing lang"}]}\n```\n';
    const parsed = extractJsonFromAgentText(raw);
    assert.equal(parsed?.findings?.length, 1);
  });

  it('normalizeAiFinding maps candidateDeterministicRule to checkId', () => {
    const f = normalizeAiFinding({
      principleId: 'AI.A11Y.GENERIC.SENSORY_INSTRUCTIONS',
      candidateDeterministicRule: 'DET.A11Y.GENERIC.SENSORY_CUES',
      severity: 'warn',
      message: 'Color-only cue',
    });
    assert.equal(f?.checkId, 'DET.A11Y.GENERIC.SENSORY_CUES');
    assert.equal(f?.candidateDeterministicRule, 'DET.A11Y.GENERIC.SENSORY_CUES');
  });
});
