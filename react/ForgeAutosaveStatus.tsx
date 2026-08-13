import { ksReactPrimitiveAttrs } from './ksVisualAttrs'

export type ForgeAutosaveState = 'saved' | 'saving' | 'dirty' | 'error'

export type ForgeAutosaveStatusProps = {
  state: ForgeAutosaveState
  lastSavedAt?: string
  errorMessage?: string
  className?: string
}

const STATE_LABEL: Record<ForgeAutosaveState, string> = {
  saved: 'All changes saved',
  saving: 'Saving…',
  dirty: 'Unsaved changes',
  error: 'Save failed',
}

/**
 * Visible autosave/draft state for long forms and workbenches.
 */
export function ForgeAutosaveStatus({
  state,
  lastSavedAt,
  errorMessage,
  className = '',
}: ForgeAutosaveStatusProps) {
  const detail =
    state === 'saved' && lastSavedAt
      ? `Last saved ${lastSavedAt}`
      : state === 'error' && errorMessage
        ? errorMessage
        : null

  return (
    <div
      className={`ks-fe-autosave ks-fe-autosave--${state} ${className}`.trim()}
      role="status"
      aria-live="polite"
      aria-busy={state === 'saving'}
      {...ksReactPrimitiveAttrs('ForgeAutosaveStatus')}
    >
      <span className="ks-fe-autosave__dot" aria-hidden="true" />
      <span className="ks-fe-autosave__label">{STATE_LABEL[state]}</span>
      {detail ? <span className="ks-fe-autosave__detail">{detail}</span> : null}
    </div>
  )
}
