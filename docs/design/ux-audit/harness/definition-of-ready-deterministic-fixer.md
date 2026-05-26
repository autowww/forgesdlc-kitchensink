# Definition of Ready — Deterministic fixer

A **deterministic fixer** is ready when the team can apply an automated repair for a pilot `DET.*` rule before invoking the Cursor remediation agent.

## Ready when

| Criterion | Evidence |
|-----------|----------|
| Rule is in pilot registry | Entry in `tools/website-ux-auditor/lib/ux-deterministic-fixers/pilot-registry.json` with `fixerId` and `verifyMode` |
| Fixer implementation exists | `handbook_after` (Python adapter), `repo_overlay` (Node), or `page_title` / `hash_markers` for production fallback |
| Detection check passes on defect fixture | Prior harness detection campaign `detection_ok` for the rule |
| Handbook After or overlay spec is valid | Rule page has After HTML (standalone) or `remediate_repo_overlay` path documented for overlay rules |
| Verify gate defined | `expect_rule_clean` via `expect-rule-clean.sh` or post-fixer re-audit in production loop |
| Production adapter (when not harness) | All **50** implemented DET rules in `pilot-registry.json` (regenerate: `npm run fixers:generate-pilot-registry` in `tools/website-ux-auditor`). Dispatch: `fixers/patch-registry.mjs` → `handbook_html_patch`. Excluded stub: `DET.THEME.FONT_STACK`. |

## Not required for Ready

- Full Node port of all 50 DET rules (handbook After adapter is sufficient for harness)
- Blender `fixerModulePath` in `registry.generated.json` (v2)
- AI-lane fixers

## References

- Runner: `lib/ux-deterministic-fixers/run-deterministic-fixers.mjs`
- Production hook: `run-website-ux-remediation-loop.sh` (`FORGE_UX_FIXERS=1`)
- Harness: `invoke-det-ruleset-remediation-verify.sh` (fixer before audit)
