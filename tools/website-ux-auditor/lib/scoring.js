import { SCORE_WEIGHTS } from './severity.js';

export function scorePage(metrics, findings) {
  const penalty = (findings || []).filter(Boolean).reduce((sum, f) => sum + (SCORE_WEIGHTS[f.severity] || 8), 0);
  const raw = Math.max(0, 100 - penalty);
  const bonuses = [
    metrics.firstH1 ? 4 : 0,
    metrics.topCtas?.length >= 1 && metrics.topCtas.length <= 2 ? 5 : 0,
    metrics.trustTermCount >= 6 ? 4 : 0,
    metrics.ecosystemTermCount >= 3 ? 3 : 0,
    metrics.wordCount <= 1200 ? 4 : 0,
  ].reduce((a, b) => a + b, 0);
  return Math.min(100, raw + bonuses);
}
