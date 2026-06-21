/** Minimum confidence to apply JSX/TSX or entry-point patches. */
export const CONFIDENCE_HIGH = 0.85;
export const CONFIDENCE_MEDIUM = 0.6;
export const CONFIDENCE_LOW = 0.35;

/**
 * @param {number} confidence
 * @param {number} [min=CONFIDENCE_MEDIUM]
 */
export function shouldRefusePatch(confidence, min = CONFIDENCE_MEDIUM) {
  return confidence < min;
}

/**
 * @param {number} score
 */
export function labelConfidence(score) {
  if (score >= CONFIDENCE_HIGH) return 'high';
  if (score >= CONFIDENCE_MEDIUM) return 'medium';
  if (score >= CONFIDENCE_LOW) return 'low';
  return 'none';
}
