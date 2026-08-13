import type { ReactNode } from 'react'
import { ksReactPrimitiveAttrs } from './ksVisualAttrs'

export type ForgeObjectInspectorProps = {
  title: string
  subtitle?: string
  children: ReactNode
  onClose?: () => void
  className?: string
}

/**
 * Desktop side-panel inspector — not a bottom sheet (ENT.APP.08).
 */
export function ForgeObjectInspector({
  title,
  subtitle,
  children,
  onClose,
  className = '',
}: ForgeObjectInspectorProps) {
  return (
    <aside
      className={`ks-fe-inspector ${className}`.trim()}
      aria-label={title}
      {...ksReactPrimitiveAttrs('ForgeObjectInspector')}
    >
      <header className="ks-fe-inspector__header">
        <div className="ks-fe-inspector__titles">
          <h2 className="ks-fe-inspector__title">{title}</h2>
          {subtitle ? <p className="ks-fe-inspector__subtitle">{subtitle}</p> : null}
        </div>
        {onClose ? (
          <button
            type="button"
            className="le-btn le-btn--small le-btn--ghost ks-fe-inspector__close"
            aria-label="Close inspector"
            onClick={onClose}
          >
            Close
          </button>
        ) : null}
      </header>
      <div className="ks-fe-inspector__body">{children}</div>
    </aside>
  )
}
