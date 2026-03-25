"""Mermaid diagram-as-code approximations for each SVG template key in _diagram_gallery."""
from __future__ import annotations

from components import e_content, render_mermaid_block

from pages._diagram_gallery import _FAMILIES, family_section_id

# Raw Mermaid source per gallery key. Omitted keys use the prose fallback in render().
_MERMAID: dict[str, str] = {
    "linear": """flowchart LR
  subgraph Plan["Plan"]
    A[Backlog] --> B[Refine]
  end
  subgraph Build["Build"]
    B --> C[Implement]
    C --> D[Test]
  end
  D --> E[Release]""",
    "loop": """flowchart LR
  subgraph Cycle["Improvement loop"]
    Plan[Plan] --> Build[Build]
    Build --> Measure[Measure]
    Measure --> Learn[Learn]
    Learn --> Plan
  end""",
    "gate": """flowchart TD
  Draft[Draft artifact] --> G1{Peer review?}
  G1 -->|Fail| Revise[Revise]
  Revise --> Draft
  G1 -->|Pass| G2{Policy check?}
  G2 -->|Fail| Revise
  G2 -->|Pass| Ship[Ship]""",
    "swimlane": """flowchart TB
  subgraph Design["Design"]
    D1[Spec] --> D2[Mockups]
    D2 --> D3[Review]
  end
  subgraph Eng["Engineering"]
    E1[Build] --> E2[Test]
    E2 --> E3[Deploy prep]
  end
  D3 --> E1""",
    "decision": """flowchart TD
  Start([Start]) --> Q1{On track?}
  Q1 -->|Yes| Q2{Scope stable?}
  Q2 -->|Yes| Ship[Release]
  Q2 -->|No| Negotiate[Re-scope]
  Negotiate --> Q1
  Q1 -->|No| Rework[Iterate]
  Rework --> Q1""",
    "funnel": """flowchart TD
  L[Leads] --> Q[Qualified]
  Q --> O[Opportunities]
  O --> P[Proposals]
  P --> W[Wins]
  Q -.->|Nurture| L""",
    "tree": """flowchart TD
  Root[Root capability] --> A[Branch A]
  Root --> B[Branch B]
  Root --> C[Branch C]
  A --> A1[Leaf]
  A --> A2[Leaf]
  B --> B1[Leaf]
  C --> C1[Leaf]""",
    "orgchart": """flowchart TD
  CEO([CEO])
  CEO --> CTO[Chief Technology Officer]
  CEO --> CFO[Chief Financial Officer]
  CTO --> VPE[VP Engineering]
  CTO --> VPP[VP Product]
  VPE --> TL1[Platform lead]
  VPE --> TL2[App lead]
  CFO --> CTL[Controller]""",
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
  C1[Define scope] --> C2[Design]
  C2 --> C3[Build]
  C3 --> C4[Verify]
  C4 --> C5[Ship]
  C4 -->|Fail| C3""",
    "network": """flowchart LR
  GW[Gateway] --> S1[Service A]
  GW --> S2[Service B]
  S1 --- S3[Service C]
  S2 --- S3
  S1 --- DB[(Data)]""",
    "gantt": """gantt
  title Roadmap slice
  dateFormat YYYY-MM-DD
  axisFormat %b %d
  section Discovery
  Research :done, a0, 2024-01-01, 7d
  section Build
  Alpha :a1, after a0, 14d
  Beta :a2, after a1, 10d
  section Release
  GA :crit, a3, after a2, 5d""",
    "timeline": """timeline
  title Releases
  section 2023
    Alpha : milestone
    Beta launch : milestone
  section 2024
    GA : milestone
    Patch train : milestone""",
    "roadmap": """timeline
  title Product themes
  section Now
    Hardening : milestone
    Reliability : milestone
  section Next
    Scale-out : milestone
  section Later
    New markets : milestone""",
    "bar": """xychart-beta
  title "Quarterly throughput"
  x-axis [Q1, Q2, Q3, Q4]
  y-axis "Items" 0 --> 120
  bar [40, 55, 70, 90]""",
    "line": """xychart-beta
  title "Latency trend"
  x-axis [w1, w2, w3, w4]
  y-axis "ms" 0 --> 200
  line [120, 100, 85, 72]""",
    "pie": """pie showData
  title Work mix
  "Build" : 45
  "Review" : 25
  "Plan" : 20
  "Ops" : 10""",
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
  quadrant-1 Scale
  quadrant-2 Investigate
  quadrant-3 Low priority
  quadrant-4 Quick experiments
  Run A: [0.25, 0.8]
  Run B: [0.6, 0.35]
  Run C: [0.45, 0.55]
  Run D: [0.15, 0.25]""",
    "quadrant": """quadrantChart
  title Prioritization
  x-axis Low effort --> High effort
  y-axis Low impact --> High impact
  quadrant-1 Quick wins
  quadrant-2 Major bets
  quadrant-3 Fill-ins
  quadrant-4 Time sinks
  Feature A: [0.2, 0.75]
  Feature B: [0.65, 0.35]
  Feature C: [0.4, 0.5]""",
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
        "<strong>Click a rendered diagram</strong> to open it in the lightbox (same as expandable Mermaid on handbook pages). "
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
                cap += f"    {render_mermaid_block(_MERMAID[key], expandable=True)}\n"
            else:
                cap += (
                    "    <p class=\"forge-support small mb-0\">No sample wired for this key yet.</p>\n"
                )
            cap += "  </div>"
            blocks.append(cap)

    blocks.append("</section>")
    return "\n".join(blocks)
