# Fgf — Forge governed form

**Hash:** `Fgf` · **Type:** composition · **Family:** enterprise-app · **Status:** active

Form controller with submit-time error summary and guarded primary CTA. Implemented in `js/ks-governed-form.js`. Showcase: `enterprise-app-compositions.html` `#sec-eac-form`.

## Purpose

Governed form shell for ENT.APP.04—validate early, surface a linked error summary, and block double submit until the action completes.

## Expected look

- Error summary panel at top (hidden when valid) with field count heading and jump links.
- Injected form markup in the body; primary submit button in a footer actions row.
- Summary uses destructive border/background; invalid fields receive focus on summary link click.

## Root element

```html
<div class="forge-governed-form" hash="Fgf" data-ks-hash="Fgf"
     data-ks-type="composition" data-ks-name="forge-governed-form"
     data-studio-workspace="governed-form">
```

## Accessibility

- Error summary uses `role="alert"` and `aria-live="assertive"`.
- Summary links move focus to the named field control.
- Submit button carries `data-studio-primary-cta` for primary-action audits.
- Every field in `formHtml` must ship with a visible `<label>` or `aria-label`.

## Deterministic checks

- Root `[data-ks-hash="Fgf"]` visible with `data-studio-workspace="governed-form"`.
- Failed submit reveals `.forge-governed-form__summary` with list of field errors (`DET.FORM.LABEL_ERROR_SUMMARY`).
- Submit button disabled while `submitting` (guard against duplicate posts).
- Valid submit clears summary and hides the alert region.

## Enterprise use

| Enterprise use | Related ENT.APP | Related DET |
|----------------|-----------------|-------------|
| Prevent errors first with submit-time summary | ENT.APP.04 | `DET.FORM.LABEL_ERROR_SUMMARY`, `DET.APP.PRIMARY_CTA` |
| Explain why submit is blocked during async post | ENT.APP.04 | `DET.APP.DISABLED_REASON` |
| Pair success with reversible `Fut` toast | ENT.APP.04 | `DET.APP.TOAST_LIFECYCLE` |

Contract: [`enterprise-app/rules/ENT.APP.04.yaml`](../../enterprise-app/rules/ENT.APP.04.yaml).
