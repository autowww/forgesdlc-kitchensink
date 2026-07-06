"""Render page-contract ``agent_contract`` frontmatter as a styled handbook panel.

Visual governance: emits ``hash="Agt"`` / ``data-ks-hash="Agt"`` (see
``docs/design/catalog/visual-registry.yaml`` in forgesdlc-kitchensink).
"""
from __future__ import annotations

import html as _html

KS_HASH = "Agt"

_LIST_SECTIONS: list[tuple[str, str, str]] = [
    ("allowed_actions", "Allowed actions", "bi-check2-circle"),
    ("safe_to_infer", "Safe to infer", "bi-lightbulb"),
    ("do_not_infer", "Do not infer", "bi-slash-circle"),
    ("key_artifacts", "Key artifacts", "bi-file-earmark-code"),
]


def render_agent_contract_panel(agent_contract: dict) -> str:
    """Return panel HTML for a parsed ``agent_contract`` frontmatter block.

    Returns an empty string when the block has no renderable content.
    """
    if not isinstance(agent_contract, dict):
        return ""
    sections_html: list[str] = []
    for key, label, icon in _LIST_SECTIONS:
        values = agent_contract.get(key)
        if not isinstance(values, list) or not values:
            continue
        items = "\n".join(
            f'        <li class="mb-1">{_html.escape(str(v))}</li>' for v in values
        )
        sections_html.append(
            f'    <div class="col-12 col-md-6 mb-3">\n'
            f'      <div class="fw-semibold small text-uppercase mb-1">'
            f'<i class="bi {icon} me-1" aria-hidden="true"></i>{_html.escape(label)}</div>\n'
            f'      <ul class="small mb-0 ps-3">\n{items}\n      </ul>\n'
            f"    </div>"
        )
    if not sections_html:
        return ""
    body = "\n".join(sections_html)
    return (
        f'<section class="forge-agent-contract card border-info-subtle my-4" '
        f'hash="{KS_HASH}" data-ks-hash="{KS_HASH}" data-ks-type="component" '
        f'data-ks-name="agent-contract-panel" aria-labelledby="agent-contract-heading">\n'
        f'  <div class="card-header bg-info-subtle py-2">\n'
        f'    <h2 id="agent-contract-heading" class="h6 mb-0">'
        f'<i class="bi bi-robot me-2" aria-hidden="true"></i>Agent contract</h2>\n'
        f"  </div>\n"
        f'  <div class="card-body pb-1"><div class="row">\n{body}\n  </div>\n'
        f'  <p class="small text-body-secondary mb-2">Machine-readable guidance from this page\'s '
        f"frontmatter: what automated consumers may do, infer, and must not infer.</p>\n"
        f"  </div>\n"
        f"</section>"
    )
