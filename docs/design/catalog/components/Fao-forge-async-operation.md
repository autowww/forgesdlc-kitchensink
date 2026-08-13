# Fao — Forge async operation

**Hash:** `Fao` · **Type:** composition · **Family:** enterprise-app · **Status:** active

Operational banner, progress bar, and freshness region for long-running jobs. Implemented in `js/ks-async-operation.js`. Showcase: `enterprise-app-compositions.html` `#sec-eac-async`.

## Purpose

Make system state, data freshness, and consequences visible (ENT.APP.03) for async pipelines—idle, running, partial, success, and error with retry.

## Expected look

- Status banner with title, optional detail, and retry button on error.
- Progress track visible only for `running` or `partial` status.
- Freshness row with `<time>` stamp and optional Refresh control.
- Banner modifier classes: `--idle`, `--running`, `--success`, `--error`, `--partial`.

## Root element

```html
<div class="forge-async-operation" hash="Fao" data-ks-hash="Fao"
     data-ks-type="composition" data-ks-name="forge-async-operation"
     data-studio-workspace="async-operation" data-studio-primary-state="idle">
```

## Accessibility

- Banner uses `role="status"` and `aria-live="polite"`.
- Progress bar exposes `role="progressbar"` with `aria-valuenow` / `aria-valuemin` / `aria-valuemax`.
- Retry and Refresh are native `<button type="button">` controls.
- `data-studio-primary-state` mirrors the current operational state for audits.

## Deterministic checks

- Root `[data-ks-hash="Fao"]` visible; `data-studio-primary-state` matches rendered status.
- `running` / `partial` shows progress bar; `idle` / `success` / `error` hide it when percent is 0.
- Freshness includes `<time datetime="…">` when `updatedAt` is set (`DET.APP.DATA_REFRESH_STALENESS`).
- Error state with `onRetry` renders a Retry button (`DET.APP.EMPTY_LOADING_ERROR_SUCCESS`).

## Enterprise use

| Enterprise use | Related ENT.APP | Related DET |
|----------------|-----------------|-------------|
| Expose primary operational state for background jobs | ENT.APP.03 | `DET.APP.PRIMARY_STATE`, `DET.APP.EMPTY_LOADING_ERROR_SUCCESS` |
| Signal staleness and offer refresh | ENT.APP.03, ENT.APP.10 | `DET.APP.DATA_REFRESH_STALENESS` |
| Transient completion feedback without blocking chrome | ENT.APP.03, ENT.APP.04 | `DET.APP.TOAST_LIFECYCLE` |

Contract: [`enterprise-app/rules/ENT.APP.03.yaml`](../../enterprise-app/rules/ENT.APP.03.yaml).
