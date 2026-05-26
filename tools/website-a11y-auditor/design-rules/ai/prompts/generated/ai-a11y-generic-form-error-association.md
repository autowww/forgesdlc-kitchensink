# AI.A11Y.GENERIC.FORM_ERROR_ASSOCIATION

Judgment overlay for **generic** sites. Scope: **generic**.

## Principle

Form validation errors are programmatically associated with fields (labels, `aria-describedby`, or live regions) so assistive tech users understand what to fix.

## Review

- Error text is not color-only.
- Each invalid field has an accessible name and error reference.
- Submit failures announce without stealing focus unexpectedly.

## Output

Propose `DET.A11Y.GENERIC.*` candidates when the pattern repeats across pages.
