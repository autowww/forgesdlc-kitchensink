# Definition of Ready — Auditor

## Purpose

The **auditor** invocation is ready when Playwright, env flags, and fixture URL are set for a single-rule harness gate.

## Upstream dependencies

- **Fixture** DoR met.

## Ready checklist

- [ ] Playwright and auditor deps installed (`npm install` in `tools/website-ux-auditor`).
- [ ] Fixture URL reachable (local static server from harness loop).
- [ ] `UX_AUDIT_OUT_DIR` set for campaign artifacts.
- [ ] `LOOP_REPO` set correctly: `fixture-website` for isolated DET scan, or overlay path for `repo_overlay`.
- [ ] `UX_AUDIT_SKIP_SCORER=1` when only detection/clean gates matter (typical per-rule harness).
- [ ] Multi-page rules: `--stop-disable` or equivalent so unrelated DET findings do not truncate crawl.

## Evidence

- Prior successful `analyze-website-ux.mjs` run on another rule in the same campaign, or dry-run listing from harness script.

## Next gate

Run detection (`expect-rule-detection.sh`) or post-remediation clean (`expect-rule-clean.sh`).
