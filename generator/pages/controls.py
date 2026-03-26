"""Controls page — buttons, badges, callouts, code blocks, forms, dropdowns."""
from __future__ import annotations

from components import (
    render_form_check,
    render_form_input,
    render_form_select,
    render_form_stack,
    render_form_switch,
    render_form_textarea,
    render_topic_preview_trigger,
)

PAGE = {
    "slug": "controls",
    "title": "Controls",
    "intro": "Buttons, badges, callouts, forms, and Bootstrap menus styled for Forge.",
    "family": "Components",
    "layout": "showcase",
    "order": 3,
    "toc": [
        ("sec-buttons", "Buttons"),
        ("sec-badges", "Badges"),
        ("sec-callouts", "Callouts"),
        ("sec-code", "Code blocks"),
        ("sec-forms-fields", "Form fields"),
        ("sec-forms-validation", "Validation"),
        ("sec-dropdown", "Action dropdown"),
        ("sec-advanced-widgets", "Beyond Bootstrap"),
        ("sec-topic-preview", "Topic preview card"),
    ],
}


def extra_css() -> str:
    """Product-site card + embed rules live in forgesdlc-theme (loaded after forge-theme)."""
    return '  <link rel="stylesheet" href="assets/forgesdlc-theme.css" />\n'


def render() -> str:
    topic_preview_demo = render_topic_preview_trigger(
        href="preview-product.html",
        title="Product layout (embed demo)",
        description="Opens preview in a modal: iframe uses ?fs-embed=1&fs-preview-rail=1 — site chrome hidden inside the frame; Markdown .toc is cloned into a right-hand rail when present.",
        eyebrow="Product site",
    )

    input_group_block = """
<div class="mb-3">
  <label class="form-label" for="ks-demo-url">Endpoint</label>
  <div class="input-group">
    <span class="input-group-text">https://</span>
    <input type="text" class="form-control" id="ks-demo-url" name="endpoint" placeholder="api.example.com" autocomplete="off" />
  </div>
  <div class="form-text">Use <code>.input-group</code> for prefixed or suffixed fields.</div>
</div>
""".strip()

    range_block = """
<div class="mb-0">
  <label for="ks-demo-range" class="form-label">Priority</label>
  <input type="range" class="form-range" id="ks-demo-range" name="priority" min="0" max="5" value="2" aria-valuemin="0" aria-valuemax="5" aria-valuenow="2" aria-label="Priority" />
  <div class="form-text">Range input uses the cyan accent on the thumb.</div>
</div>
""".strip()

    floating_block = """
<div class="form-floating mb-0">
  <input type="text" class="form-control" id="ks-demo-floating" name="floating" placeholder="Project code" />
  <label for="ks-demo-floating">Project code</label>
</div>
""".strip()

    forms_fields_demo = render_form_stack(
        render_form_input(
            "ks-demo-name",
            "name",
            label="Display name",
            placeholder="Jane Creator",
            help_text="Shown on profile cards and audit trails.",
            autocomplete="name",
        ),
        render_form_select(
            "ks-demo-team",
            "team",
            label="Team",
            options=[("", "Choose…"), ("alpha", "Alpha squad"), ("beta", "Beta squad")],
            help_text="Native select; use a JS plugin for search or multi-select.",
        ),
        render_form_textarea(
            "ks-demo-notes",
            "notes",
            label="Notes",
            placeholder="Optional context for reviewers",
            rows=3,
        ),
        render_form_check("ks-demo-agree", "agree", label="I agree to the toolkit terms"),
        render_form_switch("ks-demo-notify", "notify", label="Email me when batch jobs finish"),
        input_group_block,
        range_block,
        floating_block,
    )

    forms_validation_block = """
<div class="forge-form-panel mt-2">
  <div class="mb-3">
    <label class="form-label" for="ks-val-bad">Work email</label>
    <input type="email" class="form-control is-invalid" id="ks-val-bad" value="not-an-email" autocomplete="off" aria-invalid="true" aria-describedby="ks-val-bad-inv" />
    <div id="ks-val-bad-inv" class="invalid-feedback">Enter a valid email address.</div>
  </div>
  <div class="mb-0">
    <label class="form-label" for="ks-val-ok">Artifact ID</label>
    <input type="text" class="form-control is-valid" id="ks-val-ok" value="KS-2048" readonly aria-describedby="ks-val-okfb" />
    <div id="ks-val-okfb" class="valid-feedback">Synced with registry.</div>
  </div>
</div>
""".strip()

    action_dropdown_block = """
<div class="dropdown">
  <button type="button" class="btn btn-cyan-outline dropdown-toggle" id="ksDemoActions" data-bs-toggle="dropdown" aria-expanded="false" aria-haspopup="true">Row actions</button>
  <ul class="dropdown-menu forge-dropdown-menu" aria-labelledby="ksDemoActions">
    <li><button type="button" class="dropdown-item">Duplicate</button></li>
    <li><button type="button" class="dropdown-item">Archive</button></li>
    <li><hr class="dropdown-divider" /></li>
    <li><button type="button" class="dropdown-item text-danger">Delete</button></li>
  </ul>
</div>
""".strip()

    advanced_widgets_block = """
<p class="forge-support mb-3">
  Bootstrap covers primitives; data-heavy apps usually add focused libraries. Scope third-party roots inside
  <code>.forge-widget-host</code> so overrides stay predictable.
</p>
<div class="forge-widget-host mb-4" role="region" aria-label="Placeholder widget host">
  <p class="small text-secondary mb-0">Example host — drop a grid, picker, or combobox mount node here.</p>
</div>
<div class="forge-table-wrap mt-2">
  <table class="table table-sm mb-0">
    <thead><tr>
      <th scope="col">Need</th>
      <th scope="col">Bootstrap 5.3</th>
      <th scope="col">Typical add-on</th>
    </tr></thead>
    <tbody>
      <tr>
        <td>Editable / spreadsheet grid</td>
        <td>Read-only table styles only</td>
        <td>Tabulator, Handsontable, AG Grid (+ KS CSS wrapper)</td>
      </tr>
      <tr>
        <td>Searchable or multi-select field</td>
        <td><code>&lt;select&gt;</code> or static dropdown</td>
        <td>Tom Select, Choices.js, Select2</td>
      </tr>
      <tr>
        <td>Date / time picking</td>
        <td>None in core</td>
        <td>Flatpickr, Tempus Dominus, or native <code>type="date"</code></td>
      </tr>
      <tr>
        <td>Sortable data tables (remote data)</td>
        <td>None</td>
        <td>Same grid libraries + thin fetch layer</td>
      </tr>
    </tbody>
  </table>
</div>
""".strip()

    return f"""\
<section id="sec-buttons" class="ks-section">
  <h2 class="ks-section-title">Buttons</h2>
  <p class="forge-support mb-3">Three button variants built on Bootstrap's <code>.btn</code> base.</p>
  <div class="d-flex flex-wrap gap-3 align-items-center mb-3">
    <button class="btn btn-forge">Primary (Forge)</button>
    <button class="btn btn-forge-outline">Outline amber</button>
    <button class="btn btn-cyan-outline">Outline cyan</button>
  </div>
  <div class="forge-callout forge-callout-surface mt-3">
    <p class="callout-label">Classes</p>
    <p class="mb-0"><code>.btn-forge</code> · <code>.btn-forge-outline</code> · <code>.btn-cyan-outline</code></p>
  </div>
</section>

<section id="sec-badges" class="ks-section">
  <h2 class="ks-section-title">Badges</h2>
  <p class="forge-support mb-3">Compact labels with color-coded backgrounds.</p>
  <div class="d-flex flex-wrap gap-2 mb-3">
    <span class="forge-badge badge-cyan">Cyan</span>
    <span class="forge-badge badge-amber">Amber</span>
    <span class="forge-badge badge-emerald">Emerald</span>
    <span class="forge-badge badge-red">Red</span>
    <span class="forge-badge badge-dim">Dim</span>
  </div>
  <div class="forge-callout forge-callout-surface mt-3">
    <p class="callout-label">Classes</p>
    <p class="mb-0"><code>.forge-badge</code> + <code>.badge-cyan</code> / <code>.badge-amber</code> / <code>.badge-emerald</code> / <code>.badge-red</code> / <code>.badge-dim</code></p>
  </div>
</section>

<section id="sec-callouts" class="ks-section">
  <h2 class="ks-section-title">Callouts / Alerts</h2>
  <p class="forge-support mb-3">Contextual callout boxes for tips, warnings, and status messages.</p>
  <div class="forge-callout forge-callout-cyan mb-3">
    <p class="callout-label text-cyan">Info</p>
    <p class="mb-0">Cyan callout — informational context or tips.</p>
  </div>
  <div class="forge-callout forge-callout-amber mb-3">
    <p class="callout-label text-amber">Warning</p>
    <p class="mb-0">Amber callout — caution or important notes.</p>
  </div>
  <div class="forge-callout forge-callout-emerald mb-3">
    <p class="callout-label" style="color:var(--forge-emerald)">Success</p>
    <p class="mb-0">Emerald callout — success or positive outcome.</p>
  </div>
  <div class="forge-callout forge-callout-red mb-3">
    <p class="callout-label" style="color:#EF4444">Error</p>
    <p class="mb-0">Red callout — errors or critical warnings.</p>
  </div>
  <div class="forge-callout forge-callout-surface">
    <p class="callout-label">Surface</p>
    <p class="mb-0">Surface callout — neutral container.</p>
  </div>
</section>

<section id="sec-code" class="ks-section">
  <h2 class="ks-section-title">Code Blocks &amp; Inline</h2>
  <p class="forge-support mb-3">Inline <code>code</code> and <kbd>Ctrl+K</kbd> keyboard shortcut styling.</p>
  <div class="forge-code">
<span class="keyword">def</span> forge_spark(backlog, agent):
    <span class="comment"># AI-native delivery loop</span>
    task = backlog.<span class="highlight">pop</span>()
    result = agent.execute(task)
    <span class="keyword">return</span> result
  </div>
  <div class="forge-callout forge-callout-surface mt-3">
    <p class="callout-label">Classes</p>
    <p class="mb-0"><code>.forge-code</code> · <code>.keyword</code> · <code>.highlight</code> · <code>.comment</code></p>
  </div>
</section>

<section id="sec-forms-fields" class="ks-section">
  <h2 class="ks-section-title">Form fields</h2>
  <p class="forge-support mb-3">
    Forge maps Bootstrap 5.3 form variables to design tokens (<code>:root</code> in <code>forge-theme.css</code>).
    Use <code>.forge-form-panel</code> to group settings-style blocks. Python helpers live in
    <code>components.components</code> for generators.
  </p>
  {forms_fields_demo}
  <div class="forge-callout forge-callout-surface mt-3">
    <p class="callout-label">Python / API</p>
    <p class="mb-0"><code>render_form_stack()</code> · <code>render_form_input()</code> · <code>render_form_select()</code> · <code>render_form_textarea()</code> · <code>render_form_check()</code> · <code>render_form_switch()</code> · <code>render_form_group()</code></p>
  </div>
</section>

<section id="sec-forms-validation" class="ks-section">
  <h2 class="ks-section-title">Validation states</h2>
  <p class="forge-support mb-3">
    Use <code>.is-invalid</code> / <code>.is-valid</code> with <code>.invalid-feedback</code> and <code>.valid-feedback</code>,
    or <code>.was-validated</code> on a <code>&lt;form&gt;</code> for browser constraint hints.
  </p>
  {forms_validation_block}
</section>

<section id="sec-dropdown" class="ks-section">
  <h2 class="ks-section-title">Action dropdown</h2>
  <p class="forge-support mb-3">
    Generic menus use Bootstrap's dropdown JS. Add <code>.forge-dropdown-menu</code> on <code>.dropdown-menu</code>
    for the glass surface (distinct from the fixed theme capsule in the corner).
  </p>
  <div class="mb-3">{action_dropdown_block}</div>
  <div class="forge-callout forge-callout-surface mt-3">
    <p class="callout-label">Classes</p>
    <p class="mb-0"><code>.dropdown</code> · <code>.dropdown-menu.forge-dropdown-menu</code> · <code>data-bs-toggle="dropdown"</code></p>
  </div>
</section>

<section id="sec-advanced-widgets" class="ks-section">
  <h2 class="ks-section-title">Beyond Bootstrap</h2>
  {advanced_widgets_block}
</section>

<section id="sec-topic-preview" class="ks-section">
  <h2 class="ks-section-title">Topic preview card</h2>
  <p class="forge-support mb-3">
    For product sites that load <code>forge-theme.js</code> + <code>forgesdlc-theme.css</code>, use
    <code>render_topic_preview_trigger()</code> (or an <code>&lt;a class="fs-topic-preview-card" href="…"&gt;</code>)
    to open a page in a same-tab modal. The iframe requests <code>?fs-embed=1</code> and <code>fs-preview-rail=1</code>; <code>forge-theme.js</code> adds matching <code>html</code> classes so global chrome (sidebar, primary nav, mobile bar, offcanvas, theme dropdown) is hidden inside the iframe. A Markdown <code>.toc</code>, if present, is hoisted into the modal&rsquo;s right rail; otherwise it stays in-article (embed-only without the rail flag). The modal shell uses a minimal top-right toolbar (open full page + close).
  </p>
  <p class="forge-support mb-3">This page loads product CSS only for this section — see <strong>For Agents</strong> if tokens clash on a handbook-themed page.</p>
  <div class="mb-3">
    {topic_preview_demo}
  </div>
  <div class="forge-callout forge-callout-surface mt-3">
    <p class="callout-label">Python / API</p>
    <p class="mb-0"><code>render_topic_preview_trigger(href=…, title=…, description=…, eyebrow=…)</code> · JS: <code>openTopicPreviewModal</code> · query: <code>fs-embed=1</code> + <code>fs-preview-rail=1</code></p>
  </div>
</section>"""
