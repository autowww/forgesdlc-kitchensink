# Forge micro-agent packs (Kitchen Sink)

Domain **micro-packs** for bounded local-LLM runs. Runners live in private **forge-workcells** (`autowww/forge-workcells`).

## Layout

```text
tools/forge-micro-agent/packs/<pack-id>/
  manifest.yaml
  prompt.md
  context-schema.json
```

## Consumer setup

1. Clone **forge-workcells** beside this repo or add git submodule (SSH + org access):

   `git submodule add git@github.com:autowww/forge-workcells.git forge-workcells`

2. `pip install -e forge-workcells` and `pip install -e ../forge-lcdl`

3. Run harness: see `docs/design/ux-audit/harness/local-llm-micro-agent.md`

## Pipeline smoke (no live LLM)

```bash
tools/website-ux-auditor/auditor-tests/run-micro-agent-pipeline-smoke.sh
```
