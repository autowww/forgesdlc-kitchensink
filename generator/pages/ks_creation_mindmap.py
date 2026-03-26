"""PoC: mind-map of themes in prompts and plans that shaped Kitchen Sink."""
from __future__ import annotations

from components import render_mermaid_block

PAGE = {
    "slug": "ks-creation-mindmap",
    "title": "KS creation mind-map (PoC)",
    "intro": "Illustrative mind-map of prompt and plan themes behind the design system — not a literal transcript.",
    "family": "Patterns",
    "layout": "showcase",
    "order": 5.55,
    "has_mermaid": True,
    "toc": [
        ("sec-poc-intro", "About this PoC"),
        ("sec-mindmap-prompts-plans", "Prompts and plans"),
        ("sec-mindmap-delivery", "What shipped"),
    ],
}


def render() -> str:
    intro = """\
<section id="sec-poc-intro" class="ks-section">
  <h2 class="ks-section-title">About this PoC</h2>
  <p class="forge-support mb-3">This page is a <strong>proof of concept</strong>: one place in the showcase to visualize how <strong>iterative prompts</strong> (goals, constraints, “make it match the handbook”) and <strong>planning threads</strong> (layout inventory, submodule workflow, build scripts) converged into the Kitchen Sink repo. The tree is <strong>reconstructed</strong> from typical themes, not an exported chat log.</p>
  <p class="forge-support mb-0">Diagrams use Mermaid <code>mindmap</code> via <code>render_mermaid_block</code>, same as <a href="mermaid-examples.html#sec-mermaid-mindmap">Mermaid diagram examples</a>. Use the expand control on a block to open the modal viewer.</p>
</section>"""

    prompts_plans = render_mermaid_block(
        """mindmap
  root((Kitchen Sink))
    Prompt themes
      One shared repo
      Submodule to sites
      Match Forge palette
      Docs shell parity
      Diagrams as code
      Agent-facing rules
    Planning
      Audit duplication
      Token and surfaces
      layouts.py inventory
      Generator embed pattern
      Showcase as reference
      Propagation story""",
        expandable=True,
    )

    delivery = render_mermaid_block(
        """mindmap
  root((What shipped))
    Python
      components package
      layouts showcase split
      transforms markdown
    Assets
      forge-theme.css
      forge-theme.js
      svg templates
    Tooling
      build-showcase.py
      layout previews
    Consumers
      blueprints-website
      forgesdlc product site""",
        expandable=True,
    )

    return f"""\
{intro}

<section id="sec-mindmap-prompts-plans" class="ks-section">
  <h2 class="ks-section-title">Prompts and plans</h2>
  <p class="forge-support mb-3">Branches group <strong>recurring ask patterns</strong> (left) and <strong>planning arcs</strong> (right) that usually appear when standing up a design system for static generators.</p>
  {prompts_plans}
</section>

<section id="sec-mindmap-delivery" class="ks-section">
  <h2 class="ks-section-title">What shipped</h2>
  <p class="forge-support mb-3">Second map ties those threads to <strong>concrete areas</strong> in this repository — useful when explaining KS to newcomers.</p>
  {delivery}
</section>"""
