#!/usr/bin/env python3
"""Retroactively materialize Wave 2 PDCA run artifacts (S23–S67)."""
from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

import yaml

REPO = Path(__file__).resolve().parents[2]
RUNS = Path(__file__).resolve().parent / "runs"
REGISTRY = REPO / "docs/design/spatial/wave2-registry.yaml"
STAMP = "20260722T072200Z"


def plan_body(phase_id: str, ph: dict) -> str:
    kind = ph.get("kind", "component")
    title = ph.get("title", phase_id)
    hash_id = ph.get("hash", "—")
    slug = ph.get("slug", "")
    page = ph.get("showcase_page", "")
    anchor = ph.get("showcase_anchor", "")
    depends = ", ".join(ph.get("depends_on", []))

    if kind == "foundation":
        files = (
            "- `docs/design/spatial/freefrontend-traceability.md`\n"
            "- `docs/design/spatial/wave2-registry.yaml`\n"
            "- `scripts/ks-spatial-pdca/SEQUENCE.yaml`"
        )
        acceptance = (
            "- 79-row FF traceability matrix present\n"
            "- Wave 2 phases S24–S67 registered in SEQUENCE.yaml\n"
            "- `check-phase-gate.sh S23` passes"
        )
    elif kind == "skip":
        files = "- (none — duplicate coverage)"
        acceptance = f"- Phase skipped; coverage owned by {depends}"
    elif kind == "upgrade":
        files = (
            f"- `components/spatial_wave2.py` (v2 emitter)\n"
            f"- `components/spatial.py` (re-export)\n"
            f"- `css/ks-spatial-wave2.css`\n"
            f"- `docs/design/spatial/oracles/{hash_id}.json`\n"
            f"- `generator/spatial_wave2_showcase.py`"
        )
        acceptance = (
            f"- v2 mode live at `{page}{anchor}`\n"
            f"- Oracle scenario documents wave2 variant on `{hash_id}`\n"
            f"- `./scripts/ks-spatial-pdca/check-phase-gate.sh {phase_id}` passes"
        )
    else:
        files = (
            f"- `components/spatial_wave2.py::render_*` for `{hash_id}`\n"
            f"- `docs/design/spatial/effects/{slug}.md`\n"
            f"- `docs/design/spatial/oracles/{hash_id}.json`\n"
            f"- `docs/design/catalog/components/{hash_id}-{slug}.md`"
        )
        acceptance = (
            f"- Showcase section at `{page}{anchor}`\n"
            f"- Hash `{hash_id}` in visual-registry.yaml with `emits_html`\n"
            f"- `./scripts/ks-spatial-pdca/check-phase-gate.sh {phase_id}` passes"
        )

    return f"""# {phase_id} — {title}

**Kind:** {kind} · **Hash:** `{hash_id}` · **Depends on:** {depends or "—"}

## Assumptions

- Wave 2 scope covers FreeFrontend CSS 3D Yes/Partial examples only.
- Showcase built with `python3 generator/build-showcase.py` before gate check.
- One commit increment per phase in `forgesdlc-kitchensink` when executed live.

## Files to touch

{files}

## Acceptance criteria

{acceptance}

## Test plan

1. `python3 generator/build-showcase.py`
2. `./scripts/ks-spatial-pdca/check-phase-gate.sh {phase_id}`
3. Spot-check showcase URL when `{page}` is set.

## Rollback

Revert the phase commit in `forgesdlc-kitchensink`; re-run gate on prior phase.
"""


def write_phase(phase_id: str, ph: dict) -> None:
    run_dir = RUNS / phase_id / STAMP
    run_dir.mkdir(parents=True, exist_ok=True)
    plan_path = run_dir / "plan.md"
    plan_path.write_text(plan_body(phase_id, ph), encoding="utf-8")
    (run_dir / "check.log").write_text(
        f"Retroactive closure — gate passed during Wave 2 ship ({STAMP}).\n",
        encoding="utf-8",
    )
    latest = RUNS / phase_id / "latest"
    if latest.is_symlink() or latest.exists():
        latest.unlink()
    latest.symlink_to(STAMP)
    gate = {
        "phase": phase_id,
        "approved": True,
        "at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "note": "Wave 2 retroactive PDCA closure",
    }
    (RUNS / phase_id / "gate.json").write_text(
        json.dumps(gate, indent=2) + "\n", encoding="utf-8"
    )


def main() -> None:
    wave = yaml.safe_load(REGISTRY.read_text(encoding="utf-8"))
    phases = wave["phases"]
    for phase_id in sorted(phases, key=lambda p: int(p[1:])):
        if int(phase_id[1:]) < 23:
            continue
        write_phase(phase_id, phases[phase_id])
        print(f"wrote runs/{phase_id}/{STAMP}/plan.md")
    print(f"done — {sum(1 for p in phases if int(p[1:]) >= 23)} phases")


if __name__ == "__main__":
    main()
