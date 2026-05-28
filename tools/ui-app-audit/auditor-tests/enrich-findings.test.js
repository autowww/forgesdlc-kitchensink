import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import { enrichAuditData } from '../lib/enrich-findings.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test('enrichAuditData attaches sources from traceability', async () => {
  const traceability = JSON.parse(
    await fs.readFile(path.join(__dirname, 'fixtures', 'mini-traceability.json'), 'utf8'),
  );
  const audit = {
    pages: [
      {
        scenarioId: 'registry-overview',
        url: 'http://127.0.0.1:8765/#registry-section',
        findings: [
          {
            checkId: 'DET.TEST',
            severity: 'minor',
            selector: '#registry-heading',
            message: 'test',
          },
        ],
      },
    ],
  };
  const out = enrichAuditData(audit, traceability);
  const f = out.pages[0].findings[0];
  assert.equal(f.traceabilityId, 'a11y.studio.registry-overview');
  assert.ok(f.sources?.length >= 1);
});
