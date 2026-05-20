# Default Theme Deterministic Rules

The default theme inherits the canonical `DET.*` rule set from
`docs/design/ux-audit/deterministic-design-rules.md`.

Theme-specific defaults:

| Rule ID | Default theme expectation |
|---------|---------------------------|
| `DET.THEME.CONTRAST_MIN` | Body text/background pairs meet WCAG AA contrast unless decorative or disabled. |
| `DET.THEME.FONT_STACK` | Display, body, and mono roles use the approved Forge stacks from `tokens.json`. |
| `DET.TOKEN.NO_DRIFT` | Consumer-bound surfaces avoid raw hex values outside the theme token allowlist. |
| `DET.VISUAL.RHYTHM` | Major sections use repeated spacing tokens rather than one-off vertical gaps. |
| `DET.CTA.HIERARCHY` | One primary CTA per logical viewport region. |
| `DET.CONTEXT.BURDEN` | First-screen navigation, controls, and dense technical artifacts remain below the Forge standard budgets. |
