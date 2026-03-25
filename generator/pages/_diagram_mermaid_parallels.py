"""Mermaid diagram-as-code approximations for each SVG template key in _diagram_gallery."""
from __future__ import annotations

from components import e_content, render_mermaid_block

from pages._diagram_gallery import _FAMILIES, family_section_id

# Raw Mermaid source per gallery key. Omitted keys use the prose fallback in render().
_MERMAID: dict[str, str] = {
    "linear": """flowchart LR
  A[Backlog] --> B[In progress] --> C[Done]""",
    "loop": """flowchart LR
  Plan --> Build --> Measure --> Plan""",
    "gate": """flowchart LR
  A[Draft] --> G1{Review?}
  G1 -->|Pass| B[Ship]
  G1 -->|Fail| A""",
    "swimlane": """flowchart TB
  subgraph Design["Design"]
    D1[Spec] --> D2[Mockups]
  end
  subgraph Eng["Engineering"]
    E1[Build] --> E2[Test]
  end
  D2 --> E1""",
    "decision": """flowchart TD
  Start --> Q{On track?}
  Q -->|Yes| Ship[Release]
  Q -->|No| Rework[Iterate]
  Rework --> Q""",
    "funnel": """flowchart TD
  L[Leads] --> Q[Qualified]
  Q --> O[Opportunities]
  O --> W[Wins]""",
    "tree": """flowchart TD
  Root --> A[Branch A]
  Root --> B[Branch B]
  A --> A1[Leaf]
  A --> A2[Leaf]
  B --> B1[Leaf]""",
    "orgchart": """flowchart TD
  CEO([CEO])
  CEO --> VPE[VP Engineering]
  CEO --> VPP[VP Product]
  VPE --> ENG[Staff Engineer]
  VPP --> DES[Senior Designer]""",
    "board": """flowchart LR
  subgraph Todo["Todo"]
    T[Ticket]
  end
  subgraph Doing["Doing"]
    D[Ticket]
  end
  subgraph Done["Done"]
    X[Ticket]
  end
  T --> D --> X""",
    "checklist": """flowchart TD
  C1[Define scope] --> C2[Build]
  C2 --> C3[Verify]
  C3 --> C4[Ship]""",
    "network": """flowchart LR
  S1[Service A] --- S2[Service B]
  S2 --- S3[Service C]
  S1 --- S3""",
    "gantt": """gantt
  title Roadmap slice
  dateFormat YYYY-MM-DD
  section Track
  Alpha :a1, 2024-01-01, 14d
  Beta :a2, after a1, 10d""",
    "timeline": """timeline
  title Releases
  section 2024
    Q1 GA : milestone
    Q2 Patch : milestone""",
    "roadmap": """timeline
  title Themes
  section Now
    Hardening : milestone
  section Next
    Scale-out : milestone""",
    "bar": """xychart-beta
  title "Throughput"
  x-axis [Jan, Feb, Mar]
  y-axis "Items" 0 --> 120
  bar [40, 70, 95]""",
    "line": """xychart-beta
  title "Latency trend"
  x-axis [w1, w2, w3, w4]
  y-axis "ms" 0 --> 200
  line [120, 100, 85, 72]""",
    "pie": """pie showData
  title Mix
  "Done" : 55
  "Active" : 30
  "Queued" : 15""",
    "stacked": """xychart-beta
  title "Two series (grouped, not stacked)"
  x-axis [A, B, C]
  y-axis "Units" 0 --> 80
  bar [20, 35, 40]
  bar [15, 25, 30]""",
    "area": """xychart-beta
  title "Line proxy for area charts"
  x-axis [t1, t2, t3, t4]
  y-axis "Value" 0 --> 100
  line [20, 45, 40, 70]""",
    "scatter": """quadrantChart
  title Experiment results
  x-axis Low cost --> High cost
  y-axis Low yield --> High yield
  Run A: [0.25, 0.8]
  Run B: [0.6, 0.35]
  Run C: [0.45, 0.55]""",
    "quadrant": """quadrantChart
  title Portfolio
  x-axis Low effort --> High effort
  y-axis Low impact --> High impact
  quadrant-1 Quick wins
  quadrant-2 Bets
  quadrant-3 Fill-ins
  quadrant-4 Sinks
  Item A: [0.2, 0.75]
  Item B: [0.7, 0.4]""",
}

_NO_MERMAID_KEYS = frozenset({"venn", "gauge", "kpi", "heatmap"})


def render_mermaid_parallels_html() -> str:
    """Section: one live Mermaid block (or note) per SVG template key, grouped by family."""
    blocks: list[str] = [
        '<section id="sec-diagram-mermaid" class="ks-section">',
        '  <h2 class="ks-section-title">Mermaid parallels</h2>',
        '  <p class="forge-support mb-3">Each block is <strong>diagram-as-code</strong> with the same '
        "<code>render_mermaid_block</code> wrapper as handbook and product pages. Use it when you want "
        "editable source; use the <strong>SVG cards above</strong> when you need exact Forge styling. "
        'Some archetypes have no close Mermaid grammar — keep the static template or use BI/design tools.</p>',
        '  <p class="forge-support mb-4">For the full Mermaid 10 catalog (C4, ER, Sankey, Git graph, …), '
        'see <a href="mermaid-examples.html">Mermaid diagram examples</a>.</p>',
    ]

    for fam in _FAMILIES:
        fam_anchor = family_section_id(fam)
        blocks.append(
            f'  <h4 class="mt-4 mb-2" style="color:var(--forge-amber)">{e_content(fam["name"])}</h4>'
        )
        for item in fam["items"]:
            key = item["key"]
            label = item["label"]
            cap = (
                f'  <div class="mb-4 ks-mermaid-parallel" data-diagram-key="{key}">\n'
                f'    <p class="section-label mb-2">{e_content(label)} '
                f'<span class="text-dim font-monospace small">({key})</span> · '
                f'<a class="text-cyan" href="#{fam_anchor}" style="text-decoration:none">SVG family</a></p>\n'
            )
            if key in _NO_MERMAID_KEYS:
                cap += (
                    "    <p class=\"forge-support small mb-0\">No stock Mermaid type matches this archetype; "
                    "use the SVG template card or an external graphic.</p>\n"
                )
            elif key in _MERMAID:
                cap += f"    {render_mermaid_block(_MERMAID[key])}\n"
            else:
                cap += (
                    "    <p class=\"forge-support small mb-0\">No sample wired for this key yet.</p>\n"
                )
            cap += "  </div>"
            blocks.append(cap)

    blocks.append("</section>")
    return "\n".join(blocks)
