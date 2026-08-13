import { ksReactPrimitiveAttrs } from './ksVisualAttrs'

export type ForgeSavedView = {
  id: string
  name: string
  shared?: boolean
  active?: boolean
}

export type ForgeSavedViewManagerProps = {
  views: ForgeSavedView[]
  onApply: (id: string) => void
  onSaveCurrent?: () => void
  onDelete?: (id: string) => void
  className?: string
}

/**
 * Saved and shared table/workbench views.
 */
export function ForgeSavedViewManager({
  views,
  onApply,
  onSaveCurrent,
  onDelete,
  className = '',
}: ForgeSavedViewManagerProps) {
  return (
    <div
      className={`ks-fe-saved-views ${className}`.trim()}
      role="group"
      aria-label="Saved views"
      {...ksReactPrimitiveAttrs('ForgeSavedViewManager')}
    >
      <div className="ks-fe-saved-views__header">
        <span className="ks-fe-saved-views__label">Views</span>
        {onSaveCurrent ? (
          <button type="button" className="le-btn le-btn--small le-btn--ghost" onClick={onSaveCurrent}>
            Save current
          </button>
        ) : null}
      </div>
      <ul className="ks-fe-saved-views__list" role="listbox" aria-label="Saved view list">
        {views.map((view) => (
          <li key={view.id} className="ks-fe-saved-views__item">
            <button
              type="button"
              role="option"
              aria-selected={view.active ? 'true' : 'false'}
              className={`ks-fe-saved-views__btn${view.active ? ' ks-fe-saved-views__btn--active' : ''}`}
              onClick={() => onApply(view.id)}
            >
              {view.name}
              {view.shared ? <span className="ks-fe-saved-views__shared">Shared</span> : null}
            </button>
            {onDelete && !view.active ? (
              <button
                type="button"
                className="ks-fe-saved-views__delete"
                aria-label={`Delete view ${view.name}`}
                onClick={() => onDelete(view.id)}
              >
                ×
              </button>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  )
}
