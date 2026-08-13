import { ksReactPrimitiveAttrs } from './ksVisualAttrs'

export type ForgeFreshnessState = 'fresh' | 'stale' | 'unknown' | 'refreshing'

export type ForgeFreshnessIndicatorProps = {
  state: ForgeFreshnessState
  updatedAt?: string
  onRefresh?: () => void
  className?: string
}

const STATE_LABEL: Record<ForgeFreshnessState, string> = {
  fresh: 'Data is current',
  stale: 'Data may be stale',
  unknown: 'Freshness unknown',
  refreshing: 'Refreshing…',
}

/**
 * Stale-data signal with optional refresh action (DET.APP.DATA_REFRESH_STALENESS).
 */
export function ForgeFreshnessIndicator({
  state,
  updatedAt,
  onRefresh,
  className = '',
}: ForgeFreshnessIndicatorProps) {
  return (
    <div
      className={`ks-fe-freshness ks-fe-freshness--${state} ${className}`.trim()}
      role="status"
      aria-live="polite"
      {...ksReactPrimitiveAttrs('ForgeFreshnessIndicator')}
    >
      <span className="ks-fe-freshness__label">{STATE_LABEL[state]}</span>
      {updatedAt ? (
        <time className="ks-fe-freshness__time" dateTime={updatedAt}>
          Updated {updatedAt}
        </time>
      ) : null}
      {onRefresh ? (
        <button
          type="button"
          className="le-btn le-btn--small le-btn--ghost ks-fe-freshness__refresh"
          onClick={onRefresh}
          disabled={state === 'refreshing'}
        >
          Refresh
        </button>
      ) : null}
    </div>
  )
}
