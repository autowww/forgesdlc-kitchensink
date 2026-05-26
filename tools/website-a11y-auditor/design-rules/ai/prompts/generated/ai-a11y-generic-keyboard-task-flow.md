# AI.A11Y.GENERIC.KEYBOARD_TASK_FLOW

Judgment overlay for **generic** sites (any web UI). Scope: **generic** — runs when `--rules-scope` includes generic rules.

## Principle

A keyboard-only user can complete the primary task on the page (navigation, form submit, dismiss modal) without traps or invisible focus.

## Review

- Tab order follows visual reading order for the primary task.
- Focus is visible on every interactive control used in the task.
- Modals/menus return focus to a sensible trigger on close.

## Output

Return findings with `candidateDeterministicRule` when the issue is repeatable (e.g. missing focus ring on `.btn-primary`).
