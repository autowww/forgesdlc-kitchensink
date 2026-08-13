import { ksReactPrimitiveAttrs } from './ksVisualAttrs'

export type ForgeOperationStatus = 'idle' | 'running' | 'success' | 'error' | 'partial'

export type ForgeOperationProgressProps = {
  status: ForgeOperationStatus
  label: string
  detail?: string
  percent?: number
  className?: string
}

/**
 * Long-running job / async operation progress with labeled bar.
 */
export function ForgeOperationProgress({
  status,
  label,
  detail,
  percent = 0,
  className = '',
}: ForgeOperationProgressProps) {
  const clamped = Math.min(100, Math.max(0, percent))
  const showBar = status === 'running' || status === 'partial'

  return (
    <div
      className={`ks-fe-op-progress ks-fe-op-progress--${status} ${className}`.trim()}
      role={status === 'running' ? 'progressbar' : 'status'}
      aria-valuenow={showBar ? clamped : undefined}
      aria-valuemin={showBar ? 0 : undefined}
      aria-valuemax={showBar ? 100 : undefined}
      aria-busy={status === 'running'}
      aria-live="polite"
      {...ksReactPrimitiveAttrs('ForgeOperationProgress')}
    >
      <div className="ks-fe-op-progress__header">
        <strong className="ks-fe-op-progress__label">{label}</strong>
        {showBar ? <span className="ks-fe-op-progress__pct">{clamped}%</span> : null}
      </div>
      {detail ? <p className="ks-fe-op-progress__detail">{detail}</p> : null}
      {showBar ? (
        <div className="ks-fe-op-progress__track" aria-hidden="true">
          <div className="ks-fe-op-progress__fill" style={{ width: `${clamped}%` }} />
        </div>
      ) : null}
    </div>
  )
}
