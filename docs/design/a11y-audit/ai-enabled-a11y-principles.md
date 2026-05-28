# AI-enabled accessibility principles (`AI.A11Y.*`)

Judgment overlays run when `--enable-ai`, `--lanes ai`, or the remediation loop invokes the AI auditor. Prompts live under `tools/website-a11y-auditor/design-rules/ai/prompts/generated/`.

Each finding should include **`candidateDeterministicRule`** when the issue is repeatable (maps to a `DET.A11Y.*` rule for fixer routing).

**Not legal conformance.** AI assists review; manual testing and Studio evidence may still be required for `manual_expected` catalog criteria.

## Generic (`AI.A11Y.GENERIC.*`)

| Rule ID | Principle |
|---------|-----------|
| `AI.A11Y.GENERIC.KEYBOARD_TASK_FLOW` | Primary task completable by keyboard with visible focus |
| `AI.A11Y.GENERIC.FORM_ERROR_ASSOCIATION` | Errors associated with fields / announced clearly |
| `AI.A11Y.GENERIC.MEDIA_ALTERNATIVES` | Captions, AD, transcripts for time-based media |
| `AI.A11Y.GENERIC.SENSORY_INSTRUCTIONS` | Instructions not sensory-only |
| `AI.A11Y.GENERIC.AUDIO_CONTROL` | Control over autoplay / background audio |
| `AI.A11Y.GENERIC.TIMING_ADJUSTABLE` | Adjustable or extendable time limits |
| `AI.A11Y.GENERIC.MULTIPLE_WAYS` | Multiple ways to find pages |
| `AI.A11Y.GENERIC.POINTER_GESTURES_JUDGMENT` | Single-pointer alternative to path gestures |
| `AI.A11Y.GENERIC.CONSISTENT_NAV_JUDGMENT` | Consistent navigation across pages |
| `AI.A11Y.GENERIC.ERROR_PREVENTION` | Confirm/review on legal/financial/data submissions |
| `AI.A11Y.GENERIC.UNUSUAL_WORDS` | Unusual words / abbreviations explained |
| `AI.A11Y.GENERIC.READING_LEVEL` | Readable for intended audience |
| `AI.A11Y.GENERIC.PRONUNCIATION` | Pronunciation for ambiguous words |
| `AI.A11Y.GENERIC.CONTEXT_HELP` | Context-sensitive help on complex tasks |
| `AI.A11Y.GENERIC.INTERRUPTIONS` | Postponable interruptions |
| `AI.A11Y.GENERIC.VISUAL_PRESENTATION` | User control of text presentation (AAA) |
| `AI.A11Y.GENERIC.CHANGE_ON_REQUEST` | Context changes on request only (AAA) |
| `AI.A11Y.GENERIC.RE_AUTHENTICATION` | Data preserved across re-authentication (AAA) |
| `AI.A11Y.GENERIC.KEYBOARD_NO_EXCEPTION` | Full keyboard operability (AAA) |

## Kitchen Sink (`AI.A11Y.KS.*`)

| Rule ID | Principle |
|---------|-----------|
| `AI.A11Y.KS.HANDBOOK_SIDEBAR_LABELS` | Truncated sidebar links expose full titles |
| `AI.A11Y.KS.REGION_LABELING` | `data-ks-name` regions have accessible names |

AI prompts **must** use `-generic-` or `-ks-` in the filename per scope.
