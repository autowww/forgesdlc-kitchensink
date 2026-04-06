"""Load Kitchen Sink chrome strings (handbook / shared UI) from JSON bundles."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Mapping


def load_chrome_bundle(
    kitchensink_root: Path,
    locale: str = "en",
    *,
    overrides: Mapping[str, str] | None = None,
) -> dict[str, str]:
    """Load ``locale/chrome.<locale>.json``; fall back to ``chrome.en.json``.

    *overrides* are merged last (e.g. from tests or a generator flag).
    """
    loc = locale.strip() or "en"
    preferred = kitchensink_root / "locale" / f"chrome.{loc}.json"
    fallback = kitchensink_root / "locale" / "chrome.en.json"
    path = preferred if preferred.is_file() else fallback
    data: dict[str, str] = {}
    if path.is_file():
        raw = json.loads(path.read_text(encoding="utf-8"))
        if isinstance(raw, dict):
            data = {str(k): str(v) for k, v in raw.items()}
    if overrides:
        data.update(dict(overrides))
    return data
