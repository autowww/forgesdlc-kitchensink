"""Diagram-as-code examples — live grammar samples in the showcase shell."""
from __future__ import annotations

from components import render_mermaid_block
from pages._diagram_gallery import render_diagram_modal_html

PAGE = {
    "slug": "diagram-code-examples",
    "title": "Diagram-as-code examples",
    "intro": "Broad grammar catalog (stable + beta) with Forge wrappers.",
    "family": "Diagrams & charts",
    "layout": "showcase",
    "order": 11,
    "has_mermaid": True,
    "toc": [
        ("sec-diagcode-intro", "Overview"),
        ("sec-diagcode-flowchart", "Flowchart"),
        ("sec-diagcode-orgchart", "Org chart"),
        ("sec-diagcode-sequence", "Sequence"),
        ("sec-diagcode-state", "State"),
        ("sec-diagcode-class", "Class"),
        ("sec-diagcode-er", "Entity–relationship"),
        ("sec-diagcode-pie", "Pie"),
        ("sec-diagcode-mindmap", "Mindmap"),
        ("sec-diagcode-gantt", "Gantt"),
        ("sec-diagcode-timeline", "Timeline"),
        ("sec-diagcode-requirement", "Requirement"),
        ("sec-diagcode-quadrant", "Quadrant chart"),
        ("sec-diagcode-xychart", "XY chart"),
        ("sec-diagcode-git", "Git graph"),
        ("sec-diagcode-journey", "User journey"),
        ("sec-diagcode-sankey", "Sankey"),
        ("sec-diagcode-block", "Block"),
        ("sec-diagcode-c4", "C4 context"),
        ("sec-diagcode-expandable", "Expandable"),
    ],
}

_STABLE_FOOTER = (
    '<p class="forge-support mb-3">Rendered when JavaScript runs; theme follows Forge light/dark '
    "via <code>forgeMermaidRefresh</code>.</p>"
)


def _block(sid: str, title: str, inner: str) -> str:
    return f"""\
<section id="{sid}" class="ks-section">
  <h2 class="ks-section-title">{title}</h2>
  {_STABLE_FOOTER}
  {inner}
</section>"""


def _beta_block(sid: str, title: str, inner: str) -> str:
    return f"""\
<section id="{sid}" class="ks-section">
  <h2 class="ks-section-title">{title}</h2>
  <p class="forge-support mb-2"><span class="section-label text-amber">Beta</span> This grammar is beta and may change between minor releases.</p>
  {_STABLE_FOOTER}
  {inner}
</section>"""


def render() -> str:
    intro = """\
<section id="sec-diagcode-intro" class="ks-section">
  <h2 class="ks-section-title">Overview</h2>
  <p class="forge-support mb-3">This page aims for <strong>broad coverage</strong> of diagram grammars shipped with the pinned <code>mermaid@10.9.x</code> ESM build from jsDelivr (same init as <code>layouts.py</code>). Each block uses <code>render_mermaid_block</code> — the same <code>.forge-diagram</code> + <code>.mermaid</code> pattern as Markdown <code>language-mermaid</code> fences after <code>convert_mermaid_blocks</code>.</p>
  <p class="forge-support mb-3"><strong>Beta</strong> grammars (Sankey, Block, Treemap, Kanban, Packet, Architecture, XY chart) may render differently or break on runtime upgrades; treat them as previews.</p>
  <p class="forge-support mb-3">For <strong>static SVG archetypes</strong> (no runtime library) and <strong>per-template diagram-as-code parallels</strong>, see <a href="diagrams.html">Diagram templates</a>. Diagrams that need <strong>external registration</strong> (e.g. some ZenUML bundles) are not shown here.</p>
  <p class="forge-support mb-3"><strong>Not in this build:</strong> Treemap, Kanban, Packet, and Architecture beta grammars are not registered in the default <code>mermaid@10.9.x</code> ESM bundle from jsDelivr (they do not resolve with the stock parser). Upgrade the runtime or register external diagram types if you need those.</p>
  <p class="forge-support mb-0">The diagram runtime loads when the page sets <code>has_mermaid</code> in its <code>PAGE</code> dict so the showcase build injects the shared script.</p>
</section>"""

    flow = render_mermaid_block(
        """flowchart LR
  subgraph Plan["Plan"]
    A["Backlog"] --> B["Refine"]
  end
  subgraph Build["Build"]
    B --> C["Implement"]
    C --> D["Test"]
  end
  D --> E["Release"]"""
    )

    orgchart = render_mermaid_block(
        """flowchart TD
  CEO([CEO])
  CEO --> CTO[Chief Technology Officer]
  CEO --> CFO[Chief Financial Officer]
  CTO --> VPE[VP Engineering]
  CTO --> VPP[VP Product]
  VPE --> TL1[Platform lead]
  VPE --> TL2[App lead]
  CFO --> CTL[Controller]"""
    )

    seq = render_mermaid_block(
        """sequenceDiagram
  participant Web as Client
  participant API as API
  Web->>API: POST /session
  API-->>Web: 201 + token
  Web->>API: GET /resource
  API-->>Web: 200 JSON"""
    )

    state = render_mermaid_block(
        """stateDiagram-v2
  [*] --> Draft
  Draft --> Review: submit
  Review --> Draft: changes
  Review --> Published: approve
  Published --> [*]"""
    )

    klass = render_mermaid_block(
        """classDiagram
  class Repository {
    +list()
    +get(id)
  }
  class Service {
    -repo Repository
    +run()
  }
  Service --> Repository"""
    )

    er = render_mermaid_block(
        """erDiagram
  CUSTOMER ||--o{ ORDER : places
  ORDER ||--|{ LINE_ITEM : contains
  PRODUCT ||--o{ LINE_ITEM : "ordered in"
  CUSTOMER {
    string id
    string name
  }
  ORDER {
    string id
    date created
  }"""
    )

    pie = render_mermaid_block(
        """pie showData
  title Work mix
  "Build" : 45
  "Review" : 25
  "Plan" : 20
  "Ops" : 10"""
    )

    mind = render_mermaid_block(
        """mindmap
  root((Product))
    Discovery
      Interviews
      Analytics
    Delivery
      Design
      Engineering"""
    )

    gantt = render_mermaid_block(
        """gantt
  title Program Gantt
  dateFormat YYYY-MM-DD
  axisFormat %b %d
  section Discovery
  Research and design :done, disc1, 2024-01-02, 10d
  section Build
  Core implementation :active, build1, after disc1, 14d
  Hardening and QA :build2, after build1, 9d
  section Release
  Launch prep :crit, rel1, after build2, 5d
  GA ship :milestone, m1, after rel1, 0d"""
    )

    timeline = render_mermaid_block(
        """timeline
  title Product eras
  section 2023
    Alpha : milestone
    Beta launch : milestone
  section 2024
    GA release : milestone"""
    )

    requirement = render_mermaid_block(
        """requirementDiagram

requirement req_auth {
  id: 1
  text: Authenticate users before sensitive actions.
  risk: high
  verifymethod: test
}

element portal {
  type: design
}

portal - satisfies -> req_auth"""
    )

    quadrant = render_mermaid_block(
        """quadrantChart
  title Prioritization
  x-axis Low effort --> High effort
  y-axis Low impact --> High impact
  quadrant-1 Quick wins
  quadrant-2 Major bets
  quadrant-3 Fill-ins
  quadrant-4 Time sinks
  Feature A: [0.2, 0.75]
  Feature B: [0.65, 0.35]"""
    )

    xychart = render_mermaid_block(
        """xychart-beta
  title "Quarterly throughput"
  x-axis [Q1, Q2, Q3, Q4]
  y-axis "Items" 0 --> 120
  bar [40, 55, 70, 90]
  line [35, 50, 65, 85]"""
    )

    git = render_mermaid_block(
        """gitGraph
  commit id: "init"
  branch develop
  checkout develop
  commit id: "feature"
  checkout main
  merge develop
  commit id: "tag" """
    )

    journey = render_mermaid_block(
        """journey
  title Onboarding
  section Sign up
    Visit site: 5: User
    Create account: 4: User
  section First value
    Complete profile: 3: User, App
    See dashboard: 5: User"""
    )

    sankey = render_mermaid_block(
        """sankey-beta

Alpha,Gamma,30
Alpha,Beta,20
Beta,Delta,15
Gamma,Delta,25"""
    )

    block_beta = render_mermaid_block(
        """block-beta
columns 1
  block:chain:2
    A["Step A"]
    B["Step B"]
  end
  block
    C["Done"]
  end"""
    )

    c4 = render_mermaid_block(
        """C4Context
  title System context
  Person(user, "User", "Uses the product")
  System(sys, "Core system", "Primary application")
  Rel(user, sys, "HTTPS")"""
    )

    expandable = render_mermaid_block(
        """flowchart TD
  A[Click this frame] --> B[Modal shows SVG]
  B --> C[Same forge-diagram styling]""",
        expandable=True,
    )

    flowchart_section = f"""\
<section id="sec-diagcode-flowchart" class="ks-section">
  <h2 class="ks-section-title">Flowchart</h2>
  {_STABLE_FOOTER}
  <p class="forge-support small mb-2"><code>graph TD</code> / <code>graph LR</code> are aliases of <code>flowchart</code>; prefer <code>flowchart</code> in new content.</p>
  {flow}
</section>"""

    orgchart_section = f"""\
<section id="sec-diagcode-orgchart" class="ks-section">
  <h2 class="ks-section-title">Org chart</h2>
  {_STABLE_FOOTER}
  <p class="forge-support small mb-2">Stock <code>mermaid@10</code> does not ship a separate <code>orgChart</code> type; model reporting lines with <code>flowchart TD</code> (or <code>LR</code>). Shape styles such as <code>([ ])</code> round the top role.</p>
  {orgchart}
</section>"""

    parts = [
        intro,
        flowchart_section,
        orgchart_section,
        _block("sec-diagcode-sequence", "Sequence", seq),
        _block("sec-diagcode-state", "State diagram", state),
        _block("sec-diagcode-class", "Class diagram", klass),
        _block("sec-diagcode-er", "Entity–relationship", er),
        _block("sec-diagcode-pie", "Pie chart", pie),
        _block("sec-diagcode-mindmap", "Mindmap", mind),
        _block("sec-diagcode-gantt", "Gantt", gantt),
        _block("sec-diagcode-timeline", "Timeline", timeline),
        _block("sec-diagcode-requirement", "Requirement", requirement),
        _block("sec-diagcode-quadrant", "Quadrant chart", quadrant),
        _beta_block("sec-diagcode-xychart", "XY chart", xychart),
        _block("sec-diagcode-git", "Git graph", git),
        _block("sec-diagcode-journey", "User journey", journey),
        _beta_block("sec-diagcode-sankey", "Sankey", sankey),
        _beta_block("sec-diagcode-block", "Block", block_beta),
        _block("sec-diagcode-c4", "C4 context", c4),
        f"""\
<section id="sec-diagcode-expandable" class="ks-section">
  <h2 class="ks-section-title">Expandable diagram</h2>
  <p class="forge-support mb-3"><code>render_mermaid_block(..., expandable=True)</code> adds <code>forge-diagram-trigger</code> and <code>openDiagramModal</code> (from <code>forge-theme.js</code>) after the runtime draws SVG into the container.</p>
  {expandable}
</section>""",
        render_diagram_modal_html(),
    ]
    return "\n".join(parts)
