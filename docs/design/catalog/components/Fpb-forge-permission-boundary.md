# Fpb — Forge permission boundary

**Hash:** `Fpb` · **Type:** composition · **Family:** enterprise-app · **Status:** active

Access reason notice with read-only field group wrapper. Implemented in `js/ks-permission-boundary.js`. Showcase: `enterprise-app-compositions.html` `#sec-eac-permission`.

## Purpose

Separate authorization from preferences (ENT.APP.06)—state why access is limited, optionally offer a request action, and enforce read-only fields without using badges as ACL.

## Expected look

- Optional “Demo / sample data” line when `demo: true`.
- Notice block with mode label (Read-only, Access denied, Limited access), reason copy, and optional action button.
- Content region below; inputs disabled in `read-only` and `denied` modes.
- Notice modifier classes: `--read-only`, `--denied`, `--partial`.

## Root element

```html
<div class="forge-permission-boundary" hash="Fpb" data-ks-hash="Fpb"
     data-ks-type="composition" data-ks-name="forge-permission-boundary"
     data-studio-workspace="permission">
```

## Accessibility

- Access notice uses `role="note"` with readable mode label and reason text.
- Disabled fields set `readonly`, `disabled`, and `aria-disabled="true"` (not color-only).
- Demo disclosure uses `data-demo` on the demo line (`DET.APP.DEMO_DISCLOSURE`).
- Action button is optional; when present it must name the remediation (e.g. “Request access”).

## Deterministic checks

- Root `[data-ks-hash="Fpb"]` visible with notice class matching `mode`.
- `read-only` / `denied` modes disable `input`, `select`, and `textarea` in content (not action buttons).
- `demo: true` renders `[data-demo]` disclosure before the notice.
- Reason text is non-empty plain language (not badge-only).

## Enterprise use

| Enterprise use | Related ENT.APP | Related DET |
|----------------|-----------------|-------------|
| Explain authorization limits separately from role defaults | ENT.APP.06 | `DET.APP.DISABLED_REASON` |
| Mark sample/demo data explicitly | ENT.APP.06 | `DET.APP.DEMO_DISCLOSURE` |
| Read-only field groups without badge-as-ACL anti-pattern | ENT.APP.06 | `DET.APP.DISABLED_REASON` |

Contract: [`enterprise-app/rules/ENT.APP.06.yaml`](../../enterprise-app/rules/ENT.APP.06.yaml).
