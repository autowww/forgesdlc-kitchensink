# Definition of Ready — Remediation script

## Purpose

The **remediation script** (agent loop) is ready when the full `run-website-ux-remediation-loop.sh` can run with optional Cursor agent against an existing fixture campaign.

## Upstream dependencies

- **Fixture** DoR met.
- **Auditor** DoR met (detection already proven on Before).

## Ready checklist

- [ ] `FORGE_UX_RULESET_FIXTURE_ROOT` points at an existing detection campaign (not an empty rebuild).
- [ ] CLI `agent` quota probe passes when `--enable-agents` is used.
- [ ] `FORGE_UX_CURSOR_AGENT_MODEL` set (e.g. `auto`).
- [ ] `harness-remediation.prompt.md` present in `auditor-tests/`.
- [ ] `UX_AUDIT_OUT_DIR` writable for `remediation-agent.log` when logging enabled.

## Evidence

- `agent -p --model auto "Reply with exactly: QUOTA_OK"` succeeds (documented in closure checklist).

## Next gate

`invoke-det-ruleset-harness.sh --enable-agents --only-rule <ID>` or agent pilot scripts.
