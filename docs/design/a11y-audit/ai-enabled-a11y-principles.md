# AI-enabled accessibility principles (`AI.A11Y.*`)

Judgment overlays run when `--enable-ai` / `FORGE_A11Y_ENABLE_AI_AUDIT=1`. Prompts live under `tools/website-a11y-auditor/design-rules/ai/prompts/generated/`.

Each finding should include **`candidateDeterministicRule`** when the issue is repeatable.

## Generic (`AI.A11Y.GENERIC.*`)

| Rule ID | Principle |
|---------|-----------|
| `AI.A11Y.GENERIC.KEYBOARD_TASK_FLOW` | Primary task completable by keyboard with visible focus |
| `AI.A11Y.GENERIC.FORM_ERROR_ASSOCIATION` | Errors associated with fields / announced clearly |

## Kitchen Sink (`AI.A11Y.KS.*`)

| Rule ID | Principle |
|---------|-----------|
| `AI.A11Y.KS.HANDBOOK_SIDEBAR_LABELS` | Truncated sidebar links expose full titles |
| `AI.A11Y.KS.REGION_LABELING` | `data-ks-name` regions have accessible names |

AI prompts **must** use `-generic-` or `-ks-` in the filename per scope.
