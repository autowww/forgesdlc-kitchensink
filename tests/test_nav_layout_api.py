"""Nav-layout dynamic UI emitter tests."""
from __future__ import annotations

import json
import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "components"))

from nav_layout import (  # noqa: E402
    render_filter_chip_scroller,
    render_governed_combobox,
    render_pagination_tactile,
    render_sticky_action_bar,
)


@pytest.mark.parametrize(
    "html,needle",
    [
        (render_pagination_tactile(page=2, total_pages=5), 'data-ks-pagination'),
        (render_pagination_tactile(), 'data-page="1"'),
        (render_filter_chip_scroller(), "data-ks-filter-chips"),
        (render_filter_chip_scroller(chips=[("a", "A")], value="a"), 'data-value="a"'),
        (render_governed_combobox(), "data-ks-combobox"),
        (render_governed_combobox(items=[("x", "X")]), "data-ks-combobox-data"),
        (render_sticky_action_bar(), "data-ks-sticky-action-bar"),
    ],
)
def test_emitters_include_dynamic_mount_attrs(html: str, needle: str) -> None:
    assert needle in html


def test_governed_combobox_json_payload() -> None:
    html = render_governed_combobox(items=[("sdlc", "SDLC")])
    assert "application/json" in html
    start = html.index("{", html.index("data-ks-combobox-data"))
    end = html.index("</script>", start)
    payload = json.loads(html[start:end])
    assert payload["items"][0]["value"] == "sdlc"


def test_sticky_action_bar_actions_json() -> None:
    html = render_sticky_action_bar(actions=[("go", "Go", "primary")])
    assert "go" in html
    assert "Go" in html
