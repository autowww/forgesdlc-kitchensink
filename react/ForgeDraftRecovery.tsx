import { ksReactPrimitiveAttrs } from './ksVisualAttrs'

export type ForgeDraftItem = {
  id: string
  title: string
  updatedAt: string
  scope?: string
}

export type ForgeDraftRecoveryProps = {
  drafts: ForgeDraftItem[]
  onRecover: (id: string) => void
  onDiscard: (id: string) => void
  className?: string
}

/**
 * Recover interrupted work — draft list with recover/discard actions.
 */
export function ForgeDraftRecovery({
  drafts,
  onRecover,
  onDiscard,
  className = '',
}: ForgeDraftRecoveryProps) {
  if (!drafts.length) return null

  return (
    <section
      className={`ks-fe-draft-recovery ${className}`.trim()}
      aria-label="Recover draft work"
      {...ksReactPrimitiveAttrs('ForgeDraftRecovery')}
    >
      <h3 className="ks-fe-draft-recovery__title">Recover unsaved work</h3>
      <ul className="ks-fe-draft-recovery__list">
        {drafts.map((draft) => (
          <li key={draft.id} className="ks-fe-draft-recovery__row">
            <div className="ks-fe-draft-recovery__meta">
              <strong className="ks-fe-draft-recovery__name">{draft.title}</strong>
              {draft.scope ? (
                <span className="ks-fe-draft-recovery__scope">{draft.scope}</span>
              ) : null}
              <time className="ks-fe-draft-recovery__time" dateTime={draft.updatedAt}>
                {draft.updatedAt}
              </time>
            </div>
            <div className="ks-fe-draft-recovery__actions">
              <button type="button" className="le-btn le-btn--small le-btn--primary" onClick={() => onRecover(draft.id)}>
                Recover
              </button>
              <button type="button" className="le-btn le-btn--small le-btn--ghost" onClick={() => onDiscard(draft.id)}>
                Discard
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
