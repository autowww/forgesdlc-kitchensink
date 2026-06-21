/**
 * @param {{
 *   ruleId: string,
 *   fixerId?: string,
 *   applied: boolean,
 *   filesTouched?: number,
 *   confidence?: number,
 *   verifyCommand?: string,
 *   fallbackReason?: string,
 *   adapter?: string,
 *   error?: string,
 *   planOnly?: boolean,
 *   [key: string]: unknown,
 * }} opts
 */
export function fixerResult(opts) {
  const {
    ruleId,
    fixerId = 'handbook_html_patch',
    applied,
    filesTouched = 0,
    confidence,
    verifyCommand,
    fallbackReason,
    adapter,
    error,
    planOnly,
    ...rest
  } = opts;
  return {
    ruleId,
    fixerId,
    applied,
    filesTouched,
    ...(confidence != null ? { confidence } : {}),
    ...(verifyCommand ? { verifyCommand } : {}),
    ...(fallbackReason ? { fallbackReason } : {}),
    ...(adapter ? { adapter } : {}),
    ...(error ? { error } : {}),
    ...(planOnly ? { planOnly: true } : {}),
    ...rest,
  };
}

/**
 * @param {string} ruleId
 * @param {string} [auditDataPath]
 */
export function defaultVerifyCommand(ruleId, auditDataPath = '') {
  const audit = auditDataPath || '${AUDIT_DATA}';
  return `bash auditor-tests/expect-rule-clean.sh ${audit} ${ruleId}`;
}
