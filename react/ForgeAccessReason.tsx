import { ksReactPrimitiveAttrs } from './ksVisualAttrs'

export type ForgeAccessMode = 'read-only' | 'denied' | 'partial'

export type ForgeAccessReasonProps = {
  mode: ForgeAccessMode
  reason: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

const MODE_LABEL: Record<ForgeAccessMode, string> = {
  'read-only': 'Read-only',
  denied: 'Access denied',
  partial: 'Limited access',
}

/**
 * Explains why a field or action is restricted — badge is not ACL (ENT.APP.06).
 */
export function ForgeAccessReason({
  mode,
  reason,
  actionLabel,
  onAction,
  className = '',
}: ForgeAccessReasonProps) {
  return (
    <div
      className={`ks-fe-access-reason ks-fe-access-reason--${mode} ${className}`.trim()}
      role="note"
      {...ksReactPrimitiveAttrs('ForgeAccessReason')}
    >
      <strong className="ks-fe-access-reason__mode">{MODE_LABEL[mode]}</strong>
      <p className="ks-fe-access-reason__text">{reason}</p>
      {actionLabel && onAction ? (
        <button type="button" className="le-btn le-btn--small le-btn--ghost" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  )
}
