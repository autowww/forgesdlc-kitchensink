import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  extractAfterExampleHtml,
  kebabFromRuleId,
  loadAfterHtmlForRule,
} from './handbook-loader.mjs';

describe('handbook-loader', () => {
  it('kebabFromRuleId maps DET.PAGE.TITLE', () => {
    assert.equal(kebabFromRuleId('DET.PAGE.TITLE'), 'det-page-title');
  });

  it('extractAfterExampleHtml reads fenced HTML', () => {
    const md = `---
rule_id: DET.TEST
---
## After example

\`\`\`html
<nav class="ks-doc-breadcrumb"></nav>
\`\`\`
`;
    assert.match(extractAfterExampleHtml(md), /ks-doc-breadcrumb/);
  });

  it('loadAfterHtmlForRule loads DET.PAGE.TITLE handbook', async () => {
    const html = await loadAfterHtmlForRule('DET.PAGE.TITLE');
    assert.ok(html.length > 20);
  });
});
