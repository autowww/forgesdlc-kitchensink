# Fut — Forge undo toast

**Hash:** `Fut` · **Type:** component · **Family:** enterprise-app · **Status:** active

Transient result with reversible action. Implemented in `js/ks-undo-toast.js`. Showcase: `enterprise-app-compositions.html` `#sec-eac-toast`.

## Purpose

Make recovery inexpensive after reversible operations (ENT.APP.04)—surface a short result message with Undo and Dismiss without blocking primary workspace chrome.

## Expected look

- Fixed bottom-right toast host stacking multiple toasts vertically.
- Each toast: message text, optional Undo button, and Dismiss link-style control.
- Dark panel with border and shadow; auto-dismiss after `durationMs` (default 8s).

## Root element

```html
<div class="ks-undo-toast" role="status" hash="Fut" data-ks-hash="Fut"
     data-ks-type="component" data-ks-name="undo-toast">
```

Host element (appended to `document.body`):

```html
<div class="ks-undo-toast-host" aria-live="polite" aria-relevant="additions">
```

## Accessibility

- Toast uses `role="status"`; host uses `aria-live="polite"` and `aria-relevant="additions"`.
- Dismiss button has `aria-label="Dismiss"`.
- Undo is a native `<button type="button">` with visible label.
- Toasts must not cover the page primary CTA (`DET.APP.TOAST_LIFECYCLE`).

## Deterministic checks

- Toast root `[data-ks-hash="Fut"]` visible after `createUndoToast`.
- Host `.ks-undo-toast-host` exists with `aria-live="polite"`.
- Undo invokes `onUndo` then removes the toast; Dismiss removes without undo.
- Auto-dismiss clears toast after `durationMs` when no interaction.

## Enterprise use

| Enterprise use | Related ENT.APP | Related DET |
|----------------|-----------------|-------------|
| Offer undo after reversible bulk or form actions | ENT.APP.04 | `DET.APP.TOAST_LIFECYCLE` |
| Transient status without replacing primary state banner | ENT.APP.03, ENT.APP.04 | `DET.APP.TOAST_LIFECYCLE`, `DET.APP.PRIMARY_STATE` |
| Post-submit receipt paired with `Fgf` governed form | ENT.APP.04 | `DET.APP.TOAST_LIFECYCLE`, `DET.FORM.LABEL_ERROR_SUMMARY` |

Contract: [`enterprise-app/rules/ENT.APP.04.yaml`](../../enterprise-app/rules/ENT.APP.04.yaml).
