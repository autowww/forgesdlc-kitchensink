"""Tests for the agent-contract panel renderer (ks hash Agt)."""
from __future__ import annotations

from forge_autodoc.agent_contract import KS_HASH, render_agent_contract_panel

CONTRACT = {
    "allowed_actions": ["summarize this page", "cross-reference claims"],
    "safe_to_infer": ["the boundary is intended design"],
    "do_not_infer": ["production readiness beyond stated maturity"],
    "key_artifacts": ["docs-governance/content_registry.yaml"],
}


def test_panel_emits_hash_markers():
    html = render_agent_contract_panel(CONTRACT)
    assert f'hash="{KS_HASH}"' in html
    assert f'data-ks-hash="{KS_HASH}"' in html
    assert 'data-ks-type="component"' in html
    assert 'data-ks-name="agent-contract-panel"' in html


def test_panel_renders_all_sections():
    html = render_agent_contract_panel(CONTRACT)
    for label in ("Allowed actions", "Safe to infer", "Do not infer", "Key artifacts"):
        assert label in html
    assert "summarize this page" in html


def test_empty_or_invalid_contract_renders_nothing():
    assert render_agent_contract_panel({}) == ""
    assert render_agent_contract_panel({"allowed_actions": []}) == ""
    assert render_agent_contract_panel("not-a-dict") == ""


def test_values_are_escaped():
    html = render_agent_contract_panel({"allowed_actions": ["<script>alert(1)</script>"]})
    assert "<script>" not in html
    assert "&lt;script&gt;" in html
