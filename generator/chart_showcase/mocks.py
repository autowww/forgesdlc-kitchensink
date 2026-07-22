"""Write per-kind API mock JSON files for chart showcase."""
from __future__ import annotations

import json
from pathlib import Path

from chart_showcase.demos import API_SAMPLE_URL, all_chart_demos, api_sample_bundle


def write_api_mocks(assets_dir: Path) -> int:
    """Emit assets/data-charts-mocks/<kind>.json and refresh the bundle."""
    mocks_dir = assets_dir / "data-charts-mocks"
    mocks_dir.mkdir(parents=True, exist_ok=True)
    count = 0
    for demo in all_chart_demos():
        kind = demo["kind"]
        if kind.startswith("slicer_"):
            continue
        payload = {
            "version": 2,
            "scope": "mock",
            "charts": {kind: demo["data"]},
        }
        (mocks_dir / f"{kind}.json").write_text(
            json.dumps(payload, indent=2) + "\n",
            encoding="utf-8",
        )
        count += 1
    bundle_path = assets_dir / "data-charts-api-sample.json"
    bundle_path.write_text(
        json.dumps(api_sample_bundle(), indent=2) + "\n",
        encoding="utf-8",
    )
    return count
