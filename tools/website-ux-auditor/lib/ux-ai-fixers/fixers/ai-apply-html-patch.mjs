import { patchHtmlFiles } from '../../ux-deterministic-fixers/fixers/patches/shared.mjs';

/**
 * @param {{ repoRoot: string, findings: object[], transform: (html: string) => string, fixerId: string }} opts
 */
export async function runHtmlPatchFixer(opts) {
  if (!opts.repoRoot) {
    return { applied: false, fixerId: opts.fixerId, reason: 'missing_repo_root' };
  }
  if (!opts.findings?.length) {
    return { applied: false, fixerId: opts.fixerId, reason: 'no_findings' };
  }
  const touched = await patchHtmlFiles(opts.repoRoot, opts.findings, opts.transform);
  return {
    applied: touched > 0,
    fixerId: opts.fixerId,
    filesTouched: touched,
  };
}
