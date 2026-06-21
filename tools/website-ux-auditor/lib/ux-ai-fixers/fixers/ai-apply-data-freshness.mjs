import { runHtmlPatchFixer } from './ai-apply-html-patch.mjs';

/**
 * @param {{ ruleId: string, findings: object[], repoRoot?: string }} ctx
 */
export async function runAiApplyDataFreshnessFixer(ctx) {
  return runHtmlPatchFixer({
    repoRoot: ctx.repoRoot,
    findings: ctx.findings,
    fixerId: 'ai_apply_data_freshness',
    transform: (html) => {
      if (/\bdata-last-updated\b/i.test(html) || /\bdata-freshness\b/i.test(html)) return html;
      if (!/<table\b/i.test(html) && !/\bks-chart-mount\b/i.test(html)) return html;
      const stamp = `<p class="data-freshness" data-freshness="stale-unknown">Last updated: review source pipeline</p>`;
      if (html.includes('data-freshness')) return html;
      return html.replace(/<main\b/i, `<main data-last-updated="unknown" `).replace(
        /<table\b/i,
        `${stamp}\n<table`,
      );
    },
  });
}
