# AI.A11Y.KS.HANDBOOK_SIDEBAR_LABELS

Judgment overlay for **Kitchen Sink handbook** sites. Scope: **ks** — runs when KS detection is on or `--rules-scope ks|all`.

## Principle

Handbook sidebar navigation (`aside[data-ks-name="doc-sidebar"]`, `.doc-sidebar-link`) exposes section context in accessible names — especially when labels truncate.

## Review

- Truncated nav items have `title` or `aria-label` with full section title.
- `<nav>` inside the sidebar has an accessible name matching the handbook section.

## Output

Propose deterministic candidates such as `DET.A11Y.KS.NAV_TRUNCATION_TITLE` when repeatable.
