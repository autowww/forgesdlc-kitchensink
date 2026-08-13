---
rule_id: DET.FORM.LABEL_ERROR_SUMMARY
lane: deterministic
title: Form labels and error summary
summary: Multi-field forms expose visible labels, inline field errors, and a submit-time error summary.
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-form-label-error-summary
registry_status: implemented
page_version: ff733229fa88cc37c75e966866c1f02f28af0b0ff4bf873f3065ae00584bd0d3
registry_fingerprint: aef1de6082cf0f50d463783c843dee0ffb9132fbd5ed4ea6e5bb3f031f359c72
generated_at: 2026-08-13T02:31:57.071Z
---

## Purpose

Governed enterprise forms must not rely on placeholder-only labels or scattered inline errors alone. Operators need **visible labels**, **field-level errors** tied to inputs, and on multi-field submit failures an **error summary** region listing what to fix—especially in `ForgeGovernedForm` / `Swz` flows (ENT.APP.04).

## Passing signals

- Every required input has a visible `<label>` or `aria-label` / `aria-labelledby`.
- Required fields are marked in text—not color alone.
- Invalid fields set `aria-invalid="true"` and reference error text via `aria-describedby`.
- On failed submit, a summary region (e.g. `role="alert"` or `aria-live="assertive"`) lists errors with links or focus moves to the first invalid field.
- Primary submit stays enabled only when validation policy allows; disabled submit shows reason (`DET.APP.DISABLED_REASON`).

## Failing signals

- Placeholder text is the only label.
- Errors appear only in a toast with no field association.
- Multiple invalid fields with no summary heading on submit.
- Error text conveyed by border color only.
- Summary duplicates toast but fields lack `aria-describedby`.

## Before example

```html
<form class="forge-form" data-studio-workspace="approval">
  <input type="text" placeholder="Cost center" class="form-control" />
  <input type="text" placeholder="Amount" class="form-control is-invalid" />
  <p class="text-danger small">Invalid amount</p>
  <button type="submit" class="btn btn-primary">Submit</button>
</form>
```

## After example

```html
<form class="forge-form" data-studio-workspace="approval" novalidate>
  <div class="alert alert-danger" role="alert" id="form-errors-summary">
    <h2 class="h6 mb-2">Fix 2 fields to continue</h2>
    <ul class="mb-0">
      <li><a href="#cost-center">Cost center is required</a></li>
      <li><a href="#amount">Amount must be a positive number</a></li>
    </ul>
  </div>
  <div class="mb-3">
    <label class="form-label" for="cost-center">Cost center</label>
    <input type="text" id="cost-center" name="cost-center" class="form-control"
           aria-invalid="true" aria-describedby="cost-center-error" required />
    <p class="invalid-feedback" id="cost-center-error">Cost center is required.</p>
  </div>
  <div class="mb-3">
    <label class="form-label" for="amount">Amount</label>
    <input type="text" id="amount" name="amount" class="form-control"
           aria-invalid="true" aria-describedby="amount-error" inputmode="decimal" />
    <p class="invalid-feedback" id="amount-error">Amount must be a positive number.</p>
  </div>
  <button type="submit" class="btn btn-primary" data-studio-primary-cta>Submit</button>
</form>
```

## Evidence and remediation

- DOM: count inputs without labels; detect submit without `#form-errors-summary` or equivalent when ≥2 `aria-invalid`.
- Remediation: use `createFormController` + `Swz` step validation; add summary region at form top; wire `DET.APP.DISABLED_REASON` on gated submit.
- ENT.APP.04 contract: `docs/design/enterprise-app/rules/ENT.APP.04.yaml`.
- Run `tools/website-ux-auditor/auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.FORM.LABEL_ERROR_SUMMARY` when harness wired.

## Related rules

- `DET.APP.DISABLED_REASON` — explain why submit is disabled.
- `DET.CTA.LABEL_NONEMPTY` — submit button accessible name.
- `DET.APP.MODAL_DISMISSAL_GUARD` — unsaved changes on dismiss from governed forms.
