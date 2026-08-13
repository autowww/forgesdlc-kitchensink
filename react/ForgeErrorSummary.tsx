import { ksReactPrimitiveAttrs } from './ksVisualAttrs'

export type ForgeFormFieldError = {
  fieldId: string
  label: string
  message: string
}

export type ForgeErrorSummaryProps = {
  errors: ForgeFormFieldError[]
  title?: string
  className?: string
  onFieldClick?: (fieldId: string) => void
}

/**
 * Multi-field form error summary — pairs with DET.FORM.LABEL_ERROR_SUMMARY.
 */
export function ForgeErrorSummary({
  errors,
  title,
  className = '',
  onFieldClick,
}: ForgeErrorSummaryProps) {
  if (!errors.length) return null

  const heading = title ?? `Fix ${errors.length} field${errors.length === 1 ? '' : 's'} to continue`

  return (
    <div
      className={`ks-fe-error-summary ${className}`.trim()}
      role="alert"
      aria-live="assertive"
      {...ksReactPrimitiveAttrs('ForgeErrorSummary')}
    >
      <h2 className="ks-fe-error-summary__title">{heading}</h2>
      <ul className="ks-fe-error-summary__list">
        {errors.map((err) => (
          <li key={err.fieldId} className="ks-fe-error-summary__item">
            {onFieldClick ? (
              <button
                type="button"
                className="ks-fe-error-summary__link"
                onClick={() => onFieldClick(err.fieldId)}
              >
                {err.label}: {err.message}
              </button>
            ) : (
              <span>
                <strong>{err.label}</strong>: {err.message}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
