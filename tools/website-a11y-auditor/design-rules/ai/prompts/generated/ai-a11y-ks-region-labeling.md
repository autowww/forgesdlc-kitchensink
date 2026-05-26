# AI.A11Y.KS.REGION_LABELING

Judgment overlay for **KS-driven** pages. Scope: **ks**.

## Principle

Regions emitted with `data-ks-name` (handbook chapter, doc sidebar, hero bands) have clear accessible names or headings so screen reader users can orient.

## Review

- `data-ks-name` regions map to visible headings or `aria-label`.
- Duplicate hero/title text does not create redundant landmarks.

## Output

Reference affected `data-ks-hash` values when known; propose KS deterministic rules when failures repeat.
