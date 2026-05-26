# Harness — local LLM micro-agent path

Alternative to Cursor CLI (`agent -p`) for AI ruleset detection checks.

## Prerequisites

- **forge-workcells** installed (`pip install -e` from sibling clone or KS `forge-workcells/` submodule).
- **forge-lcdl** profile in a secrets env file (`LLM_BASE_URL`, `LLM_API_KEY`, `LLM_MODEL`).
- **Playwright** browsers for evidence (`npm install` under `tools/website-ux-auditor/`; `npx playwright install chromium`).

## Run

```bash
cd tools/website-ux-auditor/auditor-tests
./invoke-ai-ruleset-harness.sh --only-rule AI.VISUAL.HIERARCHY \
  --llm --llm-env=/path/to/forge-certificator-secrets.env
```

Quota gate: `python3 ../../../forge-lcdl/scripts/gateway_probe_lcdl.py --env-file /path/to/lcdl.env --minimal-only`

## Artifacts per rule

| File | Role |
|------|------|
| `context.json` | Assembled micro-agent input |
| `audit-out/audit-data.json` | Deterministic audit slice source |
| `workcells-out/arun_*/agent-output.txt` | Raw model JSON (stdout mirrored to `ai-agent.log`) |
| `ai-findings.json` | Parsed via `parse-ai-agent-findings.mjs` |

See [Forge micro-agent](https://github.com/autowww/forge-platform/blob/main/docs/forge-micro-agent.md) on **forge-platform**.
