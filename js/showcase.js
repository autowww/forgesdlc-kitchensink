/**
 * showcase.js — Forge Design System showcase mini-site runtime.
 *
 * Provides:
 *  1. Scroll-spy for sidebar + right-rail ToC highlighting
 *  2. Diagram modal with fetch/inline SVG + interactive node hovers
 */

/* global bootstrap */
(function () {
  'use strict';

  // -----------------------------------------------------------------
  // 1. Scroll-spy  (highlights sidebar + right-rail ToC links)
  // -----------------------------------------------------------------
  var sections = document.querySelectorAll('.ks-section[id]');
  var tocLinks = document.querySelectorAll('.forge-toc .nav-link');
  var sideLinks = document.querySelectorAll('#ks-sidebar-nav a[href^="#"]');

  function setActive(id) {
    var sel = '#' + id;
    tocLinks.forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('href') === sel);
    });
    sideLinks.forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('href') === sel);
    });
  }

  if (sections.length) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    }, { rootMargin: '-20% 0px -60% 0px' });

    sections.forEach(function (sec) { observer.observe(sec); });
  }

  // -----------------------------------------------------------------
  // 2. Diagram details data (title + node descriptions per template)
  // -----------------------------------------------------------------
  var DIAGRAM_DETAILS = {
    linear: {
      title: 'Linear Flow',
      items: [
        { node: 'Step A', color: 'cyan',  desc: 'First stage in a sequential process. Replace [subtitle] with the specific activity.' },
        { node: 'Step B', color: 'cyan',  desc: 'Second stage. Each box represents a discrete phase with a clear handoff.' },
        { node: 'Step C', color: 'amber', desc: 'Third stage. Connectors show the direction of flow between steps.' },
        { node: 'Step D', color: 'amber', desc: 'Final stage. Use the footer note for caveats (e.g. "iterate as needed").' }
      ]
    },
    loop: {
      title: 'Loop / Cycle',
      items: [
        { node: 'Phase 1', color: 'cyan',  desc: 'First phase of the iterative cycle (e.g. Plan). The cycle restarts after the last phase.' },
        { node: 'Phase 2', color: 'cyan',  desc: 'Second phase (e.g. Execute). Connectors trace a circular path.' },
        { node: 'Phase 3', color: 'amber', desc: 'Third phase (e.g. Review). Feedback flows back into the next iteration.' },
        { node: 'Phase 4', color: 'amber', desc: 'Fourth phase (e.g. Adapt). The "repeat" label indicates continuous cycling.' }
      ]
    },
    gate: {
      title: 'Gate Chain',
      items: [
        { node: 'Stage 1', color: 'cyan',    desc: 'First activity block. Work happens here until the gate checkpoint.' },
        { node: 'Gate 1',  color: 'amber',   desc: 'First gate (diamond). Criteria must be met before proceeding to the next stage.' },
        { node: 'Stage 2', color: 'emerald', desc: 'Second activity block, entered only after passing the first gate.' },
        { node: 'Gate 2',  color: 'amber',   desc: 'Second gate checkpoint before the final stage.' },
        { node: 'Stage 3', color: 'amber',   desc: 'Final activity. The pill shape indicates successful completion.' }
      ]
    },
    swimlane: {
      title: 'Swimlane',
      items: [
        { node: 'Step A', color: 'cyan',    desc: 'Begins in Role A\'s lane. Horizontal lanes group steps by responsibility.' },
        { node: 'Step B', color: 'emerald', desc: 'Handed off to Role B. Cross-lane arrows show handoff points.' },
        { node: 'Step C', color: 'amber',   desc: 'Parallel work in Role C\'s lane. Multiple lanes can be active simultaneously.' },
        { node: 'Step D', color: 'cyan',    desc: 'Returns to Role A. Steps can move freely across lanes.' },
        { node: 'Step E', color: 'emerald', desc: 'Second step in Role B. The pattern continues until the process completes.' },
        { node: 'Step F', color: 'amber',   desc: 'Final step in Role C. Footer notes describe handoff policies.' }
      ]
    },
    decision: {
      title: 'Decision Flow',
      items: [
        { node: 'Start',      color: 'emerald', desc: 'Rounded terminal marking the process entry point.' },
        { node: 'Process A',  color: 'cyan',    desc: 'Action step (rectangle). Represents a concrete activity.' },
        { node: 'Condition?', color: 'amber',   desc: 'Decision diamond. The flow branches based on a yes/no condition.' },
        { node: 'Process B',  color: 'cyan',    desc: 'Yes-branch action. Taken when the condition is satisfied.' },
        { node: 'Process C',  color: 'emerald', desc: 'No-branch action. Taken when the condition fails.' },
        { node: 'End',        color: 'amber',   desc: 'Terminal node. Both branches converge here.' }
      ]
    },
    funnel: {
      title: 'Funnel',
      items: [
        { node: 'Stage 1', color: 'cyan',    desc: 'Widest top stage (100%). Everything enters here.' },
        { node: 'Stage 2', color: 'cyan',    desc: 'Narrower stage (65%). Volume decreases as items are filtered.' },
        { node: 'Stage 3', color: 'emerald', desc: 'Further narrowing (30%). Each stage has drop-off metrics.' },
        { node: 'Stage 4', color: 'amber',   desc: 'Narrowest stage (12%). The final conversion output.' }
      ]
    },
    tree: {
      title: 'Tree / Hierarchy',
      items: [
        { node: '[Root]',     color: 'cyan',  desc: 'Top-level root node. Everything branches from here.' },
        { node: '[Branch A]', color: 'cyan',  desc: 'First branch. Sub-branches and leaves nest below.' },
        { node: '[Branch B]', color: 'amber', desc: 'Second branch with a different accent color (purple).' },
        { node: '[Branch C]', color: 'amber', desc: 'Third branch. Single leaf child shown.' }
      ]
    },
    orgchart: {
      title: 'Org chart (people cards)',
      items: [
        { node: 'CEO card', color: 'cyan', desc: 'Executive card: avatar circle (photo or initials), full name, title, org/team line. Strong cyan border for top role.' },
        { node: 'VP Engineering', color: 'cyan', desc: 'Manager card with same chrome; connects to individual contributors. Replace placeholders with real names and titles.' },
        { node: 'VP Product', color: 'amber', desc: 'Peer manager card; amber accent can denote a different division or product line.' },
        { node: 'Engineer', color: 'cyan', desc: 'IC card: smaller avatar, role title, squad or ladder (e.g. Platform). Extend for peers in the same subtree.' },
        { node: 'Designer', color: 'amber', desc: 'IC card under product leadership; use for design, PM, or other disciplines with the same slot pattern.' },
        { node: 'Reporting lines', color: 'emerald', desc: 'Solid connectors show direct reporting. Use dashed lines in content for dotted-line or matrix relationships (not shown in the template).' }
      ]
    },
    board: {
      title: 'Board / Columns',
      items: [
        { node: 'Column A', color: 'cyan',    desc: 'First column (e.g. Backlog). Cards pile up inside each column.' },
        { node: 'Column B', color: 'emerald', desc: 'Second column. Items flow left to right across columns.' },
        { node: 'Column C', color: 'amber',   desc: 'Third column with dashed border indicating a constraint (e.g. WIP limit).' },
        { node: 'Column D', color: 'amber',   desc: 'Final column (e.g. Done). Purple accent marks the endpoint.' }
      ]
    },
    checklist: {
      title: 'Checklist',
      items: [
        { node: '[Criterion A', color: 'cyan', desc: 'First criterion with check mark. All items must hold for acceptance.' },
        { node: '[Criterion B', color: 'cyan', desc: 'Second criterion. Consistent styling for each row.' },
        { node: '[Criterion C', color: 'cyan', desc: 'Third criterion. Extend the list as needed.' },
        { node: '[Criterion D', color: 'cyan', desc: 'Fourth criterion. Use for DoD, acceptance criteria, or audit checklists.' },
        { node: '[Criterion E', color: 'cyan', desc: 'Fifth criterion. Footer note explains pass/fail rules.' }
      ]
    },
    network: {
      title: 'Network / Topology',
      items: [
        { node: 'Hub',    color: 'cyan',    desc: 'Central hub node with connections radiating to all peers.' },
        { node: 'Node A', color: 'cyan',    desc: 'Peer node. Edges show direct connections between nodes.' },
        { node: 'Node B', color: 'emerald', desc: 'Another peer. Different stroke colors distinguish node types.' },
        { node: 'Node C', color: 'amber',   desc: 'Inner node with purple accent. Connected to multiple neighbors.' },
        { node: 'Node D', color: 'amber',   desc: 'Leaf-level node. Amber accent for emphasis.' },
        { node: 'Node E', color: 'amber',   desc: 'Edge node connected to its neighbor. Footer describes connection semantics.' }
      ]
    },
    venn: {
      title: 'Venn Diagram',
      items: [
        { node: 'Set A', color: 'cyan',  desc: 'First circle. Overlaps with Set B at the top and Set C at the left.' },
        { node: 'Set B', color: 'cyan',  desc: 'Second circle. Overlaps with Set A at the top and Set C at the right.' },
        { node: 'Set C', color: 'amber', desc: 'Third circle. Overlaps with both A and B. Triple intersection highlighted in amber.' }
      ]
    },
    gantt: {
      title: 'Gantt Chart',
      items: [
        { node: 'Task A', color: 'cyan',    desc: 'First task bar spanning weeks 1-2. Horizontal position shows timing.' },
        { node: 'Task B', color: 'cyan',    desc: 'Second task starting in week 2. Dependency arrow links from Task A.' },
        { node: 'Task C', color: 'emerald', desc: 'Third task spanning weeks 3-4. Bars can overlap across rows.' },
        { node: 'Task D', color: 'amber',   desc: 'Fourth task in the later phase. The milestone diamond marks a checkpoint.' },
        { node: 'Task E', color: 'amber',   desc: 'Final task. Color variations indicate different work streams.' }
      ]
    },
    timeline: {
      title: 'Timeline',
      items: [
        { node: 'Event A', color: 'cyan',  desc: 'First milestone on the axis. Labels alternate above and below for readability.' },
        { node: 'Event B', color: 'cyan',  desc: 'Second event. Date labels sit opposite the event description.' },
        { node: 'Event C', color: 'cyan',  desc: 'Mid-timeline event. Circles mark the exact point on the axis.' },
        { node: 'Event D', color: 'amber', desc: 'Later event with amber accent. Highlights a notable milestone.' },
        { node: 'Event E', color: 'amber', desc: 'Final event. Purple accent for the terminus.' }
      ]
    },
    roadmap: {
      title: 'Roadmap',
      items: [
        { node: 'Feature 1', color: 'cyan',    desc: 'First feature bar in Track A. Horizontal span shows duration across quarters.' },
        { node: 'Feature 2', color: 'cyan',    desc: 'Second feature in Track A, later in the timeline.' },
        { node: 'Feature 3', color: 'emerald', desc: 'Long-running feature in Track B spanning multiple quarters.' },
        { node: 'Feature 4', color: 'amber',   desc: 'Short feature in Track C. Multiple bars per track show parallel efforts.' },
        { node: 'Feature 5', color: 'amber',   desc: 'Another short feature in Track C.' },
        { node: 'Feature 6', color: 'amber',   desc: 'Final feature with purple accent. Milestone diamond marks a key date.' }
      ]
    },
    bar: {
      title: 'Bar Chart',
      items: [
        { node: 'Cat A', color: 'cyan',    desc: 'First category bar (85). Bar height maps to the Y-axis value.' },
        { node: 'Cat B', color: 'cyan',    desc: 'Second category (60). Values above each bar for quick reading.' },
        { node: 'Cat C', color: 'emerald', desc: 'Tallest bar (92). Color distinguishes different categories.' },
        { node: 'Cat D', color: 'amber',   desc: 'Shortest bar (45). The Y-axis grid provides scale reference.' },
        { node: 'Cat E', color: 'amber',   desc: 'Fifth bar (72). Footer note describes the unit of measure.' }
      ]
    },
    line: {
      title: 'Line Chart',
      items: [
        { node: 'Series A', color: 'cyan',  desc: 'Primary trend line (solid cyan). Data points are marked with dots.' },
        { node: 'Series B', color: 'amber', desc: 'Secondary series (dashed amber). Dash style differentiates multiple lines.' }
      ]
    },
    pie: {
      title: 'Pie / Donut',
      items: [
        { node: 'Slice A', color: 'cyan',    desc: 'Largest segment (35%). Donut ring technique with center label.' },
        { node: 'Slice B', color: 'cyan',    desc: 'Second segment (25%). Legend below maps colors to labels.' },
        { node: 'Slice C', color: 'emerald', desc: 'Third segment (22%). Consistent color coding across the palette.' },
        { node: 'Slice D', color: 'amber',   desc: 'Smallest segment (18%). Percentages sum to 100%.' }
      ]
    },
    radar: {
      title: 'Radar / spider',
      items: [
        { node: 'Series A (current)', color: 'cyan',  desc: 'Filled polygon (solid stroke) — one profile across axes (e.g. current state).' },
        { node: 'Series B (target)', color: 'amber', desc: 'Second polygon (dashed) — compare targets, benchmarks, or peers.' },
        { node: '[A]–[F]', color: 'emerald', desc: 'Axis labels around the grid; replace with criteria or dimensions.' }
      ]
    },
    'nested-donut': {
      title: 'Nested donut',
      items: [
        { node: 'Outer W', color: 'cyan',    desc: 'Outer ring segment — first level of the breakdown (e.g. region).' },
        { node: 'Outer X', color: 'cyan',    desc: 'Adjacent outer segment; legend maps ring color to category.' },
        { node: 'Outer Y', color: 'emerald', desc: 'Third outer segment; proportions sum to the outer ring.' },
        { node: 'Outer Z', color: 'amber',   desc: 'Fourth outer segment; often the smallest share.' },
        { node: 'Inner P', color: 'cyan',    desc: 'Inner ring — second-level split (e.g. product within region).' },
        { node: 'Inner Q', color: 'cyan',    desc: 'Second inner segment.' },
        { node: 'Inner R', color: 'amber',   desc: 'Third inner segment; center label shows total or headline %.' }
      ]
    },
    stacked: {
      title: 'Stacked Bar',
      items: [
        { node: 'Group A', color: 'cyan',    desc: 'First stacked bar. Each bar is subdivided into colored layers.' },
        { node: 'Group B', color: 'cyan',    desc: 'Second bar. Layer proportions vary to show composition differences.' },
        { node: 'Group C', color: 'emerald', desc: 'Third bar. Legend maps each layer color to its meaning.' },
        { node: 'Group D', color: 'amber',   desc: 'Fourth bar. Total height shows the aggregate value.' }
      ]
    },
    area: {
      title: 'Area Chart',
      items: [
        { node: 'Area A', color: 'cyan',  desc: 'Primary area (cyan fill). Filled region shows cumulative volume.' },
        { node: 'Area B', color: 'amber', desc: 'Secondary area (amber fill, dashed). Overlapping areas show two series.' }
      ]
    },
    scatter: {
      title: 'Scatter Plot',
      items: [
        { node: 'Group A', color: 'cyan',  desc: 'Cyan dots showing one group. Dot size can encode a third dimension.' },
        { node: 'Group B', color: 'amber', desc: 'Amber dots for a second group. Position on X/Y axes shows correlation.' }
      ]
    },
    waterfall: {
      title: 'Waterfall / bridge',
      items: [
        { node: 'Start', color: 'cyan',    desc: 'Baseline column (e.g. opening balance). Height anchors the bridge.' },
        { node: 'Chg Revenue', color: 'emerald', desc: 'Positive floating bar — increases the running total.' },
        { node: 'Chg Cost', color: 'amber',   desc: 'Negative floating bar — decreases the running total.' },
        { node: 'Chg Risk', color: 'emerald', desc: 'Another step; connector lines show where each bar lands.' },
        { node: 'Total', color: 'cyan',    desc: 'End column — sum or closing position after all steps.' }
      ]
    },
    sequence: {
      title: 'Sequence diagram',
      items: [
        { node: 'Client', color: 'cyan', desc: 'Calling actor at the left lifeline. Replace with your UI, gateway, or user system.' },
        { node: 'Service', color: 'cyan', desc: 'Middle tier handling orchestration and business rules.' },
        { node: 'Store', color: 'amber', desc: 'Downstream dependency (database, queue, or external API).' },
        { node: 'Call one', color: 'cyan', desc: 'First synchronous or async message from Client to Service.' },
        { node: 'Call two', color: 'amber', desc: 'Nested call from Service to Store.' },
        { node: 'Return data', color: 'emerald', desc: 'Response from Store back to Service.' },
        { node: 'Final reply', color: 'cyan', desc: 'Consolidated response to the original caller.' }
      ]
    },
    state: {
      title: 'State machine',
      items: [
        { node: 'Idle', color: 'cyan', desc: 'Initial / waiting state before work starts.' },
        { node: 'Active', color: 'cyan', desc: 'Work in progress; substates can nest in content instances.' },
        { node: 'Succeeded', color: 'emerald', desc: 'Terminal success state (rounded pill).' },
        { node: 'Failed', color: 'amber', desc: 'Error or rejection path; often loops back via Retry to Idle or Active.' }
      ]
    },
    quadrant: {
      title: 'Quadrant Matrix',
      items: [
        { node: 'Quadrant A', color: 'cyan',    desc: 'Top-left quadrant. Label and description customize each zone.' },
        { node: 'Quadrant B', color: 'cyan',    desc: 'Top-right quadrant. Dots represent data points positioned by two criteria.' },
        { node: 'Quadrant C', color: 'amber',   desc: 'Bottom-left quadrant. Axis labels define the evaluation dimensions.' },
        { node: 'Quadrant D', color: 'emerald', desc: 'Bottom-right quadrant. Footer describes the decision framework.' }
      ]
    },
    gauge: {
      title: 'Gauge / Meter',
      items: [
        { node: '75%',    color: 'cyan',  desc: 'Current value displayed prominently. Needle position maps to the arc.' },
        { node: 'Target', color: 'amber', desc: 'Dashed target line for comparison. Red/amber/green zones show health bands.' }
      ]
    },
    kpi: {
      title: 'KPI Card',
      items: [
        { node: '1,234', color: 'cyan',    desc: 'Big number — the primary metric. Designed for dashboard tiles.' },
        { node: '+12%',  color: 'emerald', desc: 'Trend indicator with direction arrow. Green = positive, red = negative.' }
      ]
    },
    bullet: {
      title: 'Bullet chart',
      items: [
        { node: 'Range bands', color: 'cyan',    desc: 'Background zones (poor / fair / good) — qualitative thresholds along the scale.' },
        { node: 'Comparative', color: 'emerald', desc: 'Thin bar (e.g. prior period) behind the actual for quick comparison.' },
        { node: 'Actual', color: 'cyan',        desc: 'Thick bar — current performance against the scale.' },
        { node: 'Target', color: 'amber',       desc: 'Vertical marker — goal or commitment to hit.' }
      ]
    },
    heatmap: {
      title: 'Heatmap',
      items: [
        { node: 'Row 1', color: 'cyan',  desc: 'First data row — five cells across columns A–E. Intensity (opacity) maps to the value.' },
        { node: 'Row 2', color: 'cyan',  desc: 'Second row. Compare cells left-to-right within the row.' },
        { node: 'Row 3', color: 'cyan',  desc: 'Third row. Brighter cells indicate higher scores in this template.' },
        { node: 'Row 4', color: 'amber', desc: 'Fourth row. The gradient legend below shows the intensity scale.' }
      ]
    }
  };

  /** Page layout schematics (layouts.html) — same modal + hover wiring as diagrams. */
  var LAYOUT_DETAILS = {
    'layout-showcase': {
      title: 'showcase_page — structure',
      items: [
        { node: 'Site header', color: 'cyan', desc: 'Sticky header row: brand column + breadcrumb and page title. Implemented as .site-header + two Bootstrap columns.' },
        { node: 'Sidebar', color: 'cyan', desc: 'Left rail navigation (.forge-sidebar). Fills viewport below the header; scrolls independently.' },
        { node: 'Main content', color: 'amber', desc: 'Primary reading column (body_html). Typically max-width ~56rem inside the main column.' },
        { node: 'ToC', color: 'emerald', desc: 'Optional right rail (.forge-toc) when toc_html is provided; hidden or reordered on small screens.' }
      ]
    },
    'layout-landing': {
      title: 'landing_page — structure',
      items: [
        { node: 'Top nav', color: 'cyan', desc: 'Full-width sticky bar: brand + nav_links_html. No sidebar column.' },
        { node: 'Hero', color: 'amber', desc: 'Centered hero region (hero_html) — headline, CTAs, illustration.' },
        { node: 'Body', color: 'emerald', desc: 'Main prose / cards below the hero (body_html).' },
        { node: 'Footer', color: 'cyan', desc: 'Optional footer_html after main content.' }
      ]
    },
    'layout-gallery': {
      title: 'gallery_page — structure',
      items: [
        { node: 'Site header', color: 'cyan', desc: 'Same showcase header pattern: title + breadcrumb in the top bar.' },
        { node: 'Sidebar', color: 'cyan', desc: 'Same left rail as showcase; navigation only.' },
        { node: 'Main grid', color: 'amber', desc: 'Wide content column for card grids / bento (body_html). No right ToC column by default.' }
      ]
    },
    'layout-split': {
      title: 'split_page — structure',
      items: [
        { node: 'Site header', color: 'cyan', desc: 'Shared showcase header above the split region.' },
        { node: 'Sidebar', color: 'cyan', desc: 'Documentation nav, same as other showcase-family pages.' },
        { node: 'Example panel', color: 'amber', desc: 'Left column (left_html): live demo, iframe, or component preview.' },
        { node: 'Docs panel', color: 'emerald', desc: 'Right column (right_html): API, props, usage. Stacks above the example on narrow viewports.' }
      ]
    },
    'layout-handbook': {
      title: 'handbook_page — structure',
      items: [
        { node: 'Sidebar', color: 'cyan', desc: 'Server-rendered chapter list (sidebar_html). Full-height rail; no separate sticky “site header” band like showcase.' },
        { node: 'Main article', color: 'amber', desc: 'Handbook article body (body_html) with H1 + Markdown output.' },
        { node: 'ToC', color: 'emerald', desc: 'Right-hand section headings (toc_html / toc_sidebar_html).' }
      ]
    },
    'layout-chapter': {
      title: 'chapter_page — structure',
      items: [
        { node: 'Sidebar', color: 'cyan', desc: 'Same grid cell as handbook, but nav links are injected client-side (e.g. docs-nav.js) into #doc-sidebar-nav.' },
        { node: 'Main article', color: 'amber', desc: 'Chapter content (main_sections) — methodology pages using docs-theme.css.' },
        { node: 'ToC', color: 'emerald', desc: 'Right-rail scroll-spy ToC; pairs with chapter content anchors.' }
      ]
    },
    'layout-product': {
      title: 'product_page — structure',
      items: [
        { node: 'Mobile bar', color: 'cyan', desc: 'Compact sticky strip + offcanvas menu on small screens (fs-mobile-bar).' },
        { node: 'Product sidebar', color: 'amber', desc: 'Tier-grouped product navigation (sidebar_html / nav_html) with fs-* styling.' },
        { node: 'Article', color: 'emerald', desc: 'Main column: cross_refs_html + body_html + footer_html inside .fs-main.' }
      ]
    }
  };

  function getDetailData(key) {
    return DIAGRAM_DETAILS[key] || LAYOUT_DETAILS[key];
  }

  /** Relative URLs for layouts.html modal — live HTML pages (iframe), not SVG. */
  var LAYOUT_PREVIEW_URLS = {
    'layout-showcase': 'tokens.html',
    'layout-landing': 'index.html',
    'layout-gallery': 'diagrams.html',
    'layout-split': 'preview-split.html',
    'layout-handbook': 'preview-handbook.html',
    'layout-chapter': 'preview-chapter.html',
    'layout-product': 'preview-product.html'
  };

  var colorMap = {
    cyan:    'var(--forge-cyan)',
    amber:   'var(--forge-amber)',
    emerald: 'var(--forge-emerald)'
  };

  // -----------------------------------------------------------------
  // 3. Diagram modal  (open / close / render)
  // -----------------------------------------------------------------

  function looksLikeSvgText(s) {
    return Boolean(s && typeof s === 'string' && s.indexOf('<svg') !== -1);
  }

  /**
   * Load raw SVG markup: XHR, then fetch, then <object> (helps some file:// cases).
   * img-only fallback has no DOM — wireSvgHovers cannot attach.
   */
  function loadSvgText(url, onSuccess, onFail) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onload = function () {
      var t = xhr.responseText;
      if ((xhr.status === 200 || xhr.status === 0) && looksLikeSvgText(t)) {
        onSuccess(t);
        return;
      }
      tryFetch();
    };
    xhr.onerror = tryFetch;

    function tryFetch() {
      if (typeof fetch === 'undefined') {
        tryObjectEmbed();
        return;
      }
      fetch(url, { cache: 'no-store' })
        .then(function (r) {
          return r.ok ? r.text() : Promise.reject(new Error('fetch not ok'));
        })
        .then(function (t) {
          if (looksLikeSvgText(t)) onSuccess(t);
          else tryObjectEmbed();
        })
        .catch(function () {
          tryObjectEmbed();
        });
    }

    var objTimer;
    function tryObjectEmbed() {
      var obj = document.createElement('object');
      obj.type = 'image/svg+xml';
      obj.data = url;
      obj.setAttribute('aria-hidden', 'true');
      obj.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px;opacity:0;pointer-events:none';
      objTimer = setTimeout(function () {
        cleanup();
        onFail();
      }, 5000);
      function cleanup() {
        clearTimeout(objTimer);
        if (obj.parentNode) obj.parentNode.removeChild(obj);
      }
      obj.onload = function () {
        setTimeout(function () {
          try {
            var doc = obj.contentDocument;
            var svgEl = doc && doc.querySelector('svg');
            if (svgEl) {
              cleanup();
              onSuccess(svgEl.outerHTML);
              return;
            }
          } catch (e) {}
          cleanup();
          onFail();
        }, 0);
      };
      obj.onerror = function () {
        cleanup();
        onFail();
      };
      document.body.appendChild(obj);
    }

    try {
      xhr.send();
    } catch (e) {
      tryFetch();
    }
  }

  /**
   * Open layout documentation modal with an embedded example page (iframe).
   * Used from layouts.html; diagrams still use openDiagramWithDetail + SVG.
   */
  window.openLayoutPreview = function (key) {
    var url = LAYOUT_PREVIEW_URLS[key];
    var canvas = document.getElementById('diagramModalCanvas');
    var detail = document.getElementById('diagramModalDetail');
    var titleEl = document.getElementById('diagramModalTitle');
    var modal = document.getElementById('diagramModal');
    if (!canvas || !modal) return;

    var data = getDetailData(key);
    if (detail) detail.innerHTML = renderDetailPanel(key);
    if (titleEl && data) titleEl.textContent = data.title;

    canvas.innerHTML = '';
    if (!url) {
      canvas.innerHTML =
        '<p class="forge-support p-3 mb-0">No live preview URL is configured for this layout.</p>';
    } else {
      var iframe = document.createElement('iframe');
      iframe.className = 'layout-preview-iframe';
      iframe.setAttribute('title', data ? data.title : 'Layout preview');
      iframe.setAttribute('loading', 'lazy');
      iframe.referrerPolicy = 'no-referrer-when-downgrade';
      iframe.src = url;
      canvas.appendChild(iframe);
    }
    diagramModalHover.clear();
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    if (typeof window.forgeMountDiagramModalZoom === 'function') {
      window.forgeMountDiagramModalZoom(canvas);
    }
  };

  function renderDetailPanel(key) {
    var data = getDetailData(key);
    if (!data) return '';
    var html = '<p class="detail-title">' + data.title + '</p>';
    for (var i = 0; i < data.items.length; i++) {
      var item = data.items[i];
      html += '<div class="detail-item" data-node="' + item.node + '">';
      html += '<p class="detail-term" style="color:' + (colorMap[item.color] || colorMap.cyan) + ';">' + item.node + '</p>';
      html += '<p class="detail-desc">' + item.desc + '</p>';
      html += '</div>';
    }
    return html;
  }

  /** Legend + live focus slot for Mermaid expand when trigger sits under ``[data-diagram-key]`` (diagrams parallels). */
  function renderMermaidParallelModalDetail(key) {
    if (!getDetailData(key)) return '';
    var intro =
      '<p class="detail-mermaid-note forge-support small mb-3">' +
      'Same <strong>legend</strong> as the SVG template card above. Mermaid uses its own labels as a diagram-as-code sample — ' +
      'hover shapes to match the legend when names align, or read the focus line.</p>';
    var live =
      '<div id="diagramModalMermaidLive" class="detail-mermaid-live detail-item" hidden>' +
      '<p class="detail-term text-cyan">Focused shape</p>' +
      '<p class="detail-desc mb-0" id="diagramModalMermaidLiveText"></p>' +
      '</div>';
    return intro + live + renderDetailPanel(key);
  }

  window.openDiagramWithDetail = function (trigger, key) {
    var img = trigger.querySelector('img');
    if (!img) return;

    var canvas = document.getElementById('diagramModalCanvas');
    var detail = document.getElementById('diagramModalDetail');
    var title  = document.getElementById('diagramModalTitle');
    if (!canvas) return;

    if (detail) detail.innerHTML = renderDetailPanel(key);
    if (title && getDetailData(key)) title.textContent = getDetailData(key).title;

    /* Bind once; must run after diagrams page has #diagramModalDetail in DOM. */
    ensureDiagramModalDetailHover();

    document.getElementById('diagramModal').classList.add('active');
    document.body.style.overflow = 'hidden';

    function inlineSvg(svgText) {
      canvas.innerHTML = svgText;
      var svg = canvas.querySelector('svg');
      if (svg) {
        svg.removeAttribute('width');
        svg.removeAttribute('height');
        svg.style.width = '100%';
        svg.style.height = 'auto';
        svg.style.maxHeight = '100%';
      }
      wireSvgHovers(canvas, detail, key);
      if (typeof window.forgeMountDiagramModalZoom === 'function') {
        window.forgeMountDiagramModalZoom(canvas);
      }
    }

    function showStaticHint() {
      var existing = canvas.querySelector('.diagram-modal-static-hint');
      if (existing) return;
      var hint = document.createElement('div');
      hint.className = 'diagram-modal-static-hint';
      hint.setAttribute('role', 'status');
      hint.innerHTML =
        '<strong>Static image only</strong> — hover highlights need inline SVG. ' +
        'Opening as <code>file://</code> usually blocks loading the SVG file. ' +
        'Run a local server from the <code>showcase</code> folder, e.g. ' +
        '<code>python3 -m http.server 8080</code>, then open ' +
        '<code>http://localhost:8080/diagrams.html</code>.';
      canvas.insertBefore(hint, canvas.firstChild);
    }

    function showImgFallback() {
      canvas.innerHTML = '';
      showStaticHint();
      var clone = img.cloneNode(true);
      clone.style.width = '100%';
      clone.style.maxWidth = '100%';
      clone.style.height = 'auto';
      clone.style.maxHeight = 'min(52vh, 480px)';
      clone.style.objectFit = 'contain';
      canvas.appendChild(clone);
      if (typeof window.forgeMountDiagramModalZoom === 'function') {
        window.forgeMountDiagramModalZoom(canvas);
      }
    }

    loadSvgText(img.src, inlineSvg, showImgFallback);
  };

  window.closeDiagramModal = function () {
    var modal = document.getElementById('diagramModal');
    if (modal) modal.classList.remove('active');
    document.body.style.overflow = '';
    diagramModalHover.clear();
    var canvas = document.getElementById('diagramModalCanvas');
    if (canvas) {
      var iframe = canvas.querySelector('iframe.layout-preview-iframe');
      if (iframe) iframe.src = 'about:blank';
      canvas.innerHTML = '';
    }
  };

  // Close on backdrop click
  var backdrop = document.getElementById('diagramModal');
  if (backdrop) {
    backdrop.addEventListener('click', function (ev) {
      if (ev.target === backdrop) window.closeDiagramModal();
    });
  }

  // -----------------------------------------------------------------
  // 4. SVG hover wiring  (bidirectional highlight between SVG + detail)
  // -----------------------------------------------------------------

  function normLabel(s) {
    return String(s).replace(/\s+/g, ' ').trim();
  }

  function findDetailItem(detailRoot, nodeName) {
    var items = detailRoot.querySelectorAll('.detail-item');
    for (var i = 0; i < items.length; i++) {
      if (items[i].getAttribute('data-node') === nodeName) return items[i];
    }
    return null;
  }

  function findElementByDataNode(svg, nodeName) {
    var els = svg.querySelectorAll('[data-node]');
    var i;
    for (i = 0; i < els.length; i++) {
      if (els[i].getAttribute('data-node') === nodeName) return els[i];
    }
    return null;
  }

  function findLabelElement(svg, nodeName) {
    var want = normLabel(nodeName);
    var texts = svg.querySelectorAll('text');
    var i;
    for (i = 0; i < texts.length; i++) {
      var tn = normLabel(texts[i].textContent);
      if (tn === want) return texts[i];
      /* SVG often has longer placeholder text than the detail key (e.g. "[Criterion A" vs "[Criterion A - …") */
      if (want.length >= 2 && tn.indexOf(want) === 0) return texts[i];
    }
    var tspans = svg.querySelectorAll('tspan');
    for (i = 0; i < tspans.length; i++) {
      var sn = normLabel(tspans[i].textContent);
      if (sn === want) return tspans[i];
      if (want.length >= 2 && sn.indexOf(want) === 0) return tspans[i];
    }
    return null;
  }

  function labelCenter(el) {
    try {
      var bb = el.getBBox();
      return { x: bb.x + bb.width / 2, y: bb.y + bb.height / 2 };
    } catch (e) {
      var x = parseFloat(el.getAttribute('x') || 0);
      var y = parseFloat(el.getAttribute('y') || 0);
      return { x: x, y: y };
    }
  }

  function shapeBBox(s) {
    var bbox;
    if (s.tagName === 'rect') {
      var wAttr = s.getAttribute('width') || '';
      var hAttr = s.getAttribute('height') || '';
      if (wAttr.indexOf('%') >= 0 || hAttr.indexOf('%') >= 0) return null;
      var rx = parseFloat(s.getAttribute('x') || 0);
      var ry = parseFloat(s.getAttribute('y') || 0);
      var rw = parseFloat(s.getAttribute('width') || 0);
      var rh = parseFloat(s.getAttribute('height') || 0);
      if (rw < 8 || rh < 8) return null;
      bbox = { x: rx, y: ry, w: rw, h: rh };
    } else if (s.tagName === 'polygon') {
      var pts = s.getAttribute('points');
      if (!pts) return null;
      var coords = pts.trim().split(/[\s,]+/).map(Number);
      var minX = Infinity; var minY = Infinity; var maxX = -Infinity; var maxY = -Infinity;
      var j;
      for (j = 0; j < coords.length; j += 2) {
        if (coords[j] < minX) minX = coords[j];
        if (coords[j] > maxX) maxX = coords[j];
        if (coords[j + 1] < minY) minY = coords[j + 1];
        if (coords[j + 1] > maxY) maxY = coords[j + 1];
      }
      bbox = { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
      if (bbox.w < 8 || bbox.h < 8) return null;
    } else if (s.tagName === 'polyline') {
      var pts2 = s.getAttribute('points');
      if (!pts2) return null;
      var coords2 = pts2.trim().split(/[\s,]+/).map(Number);
      var pminX = Infinity; var pminY = Infinity; var pmaxX = -Infinity; var pmaxY = -Infinity;
      var k;
      for (k = 0; k < coords2.length; k += 2) {
        if (coords2[k] < pminX) pminX = coords2[k];
        if (coords2[k] > pmaxX) pmaxX = coords2[k];
        if (coords2[k + 1] < pminY) pminY = coords2[k + 1];
        if (coords2[k + 1] > pmaxY) pmaxY = coords2[k + 1];
      }
      bbox = { x: pminX, y: pminY, w: pmaxX - pminX, h: pmaxY - pminY };
      if (bbox.w < 8) bbox.w = 8;
      if (bbox.h < 8) bbox.h = 8;
    } else if (s.tagName === 'circle') {
      var ccx = parseFloat(s.getAttribute('cx') || 0);
      var ccy = parseFloat(s.getAttribute('cy') || 0);
      var cr = parseFloat(s.getAttribute('r') || 0);
      if (cr < 4) return null;
      bbox = { x: ccx - cr, y: ccy - cr, w: cr * 2, h: cr * 2 };
    } else if (s.tagName === 'ellipse') {
      var ex = parseFloat(s.getAttribute('cx') || 0);
      var ey = parseFloat(s.getAttribute('cy') || 0);
      var erx = parseFloat(s.getAttribute('rx') || 0);
      var ery = parseFloat(s.getAttribute('ry') || 0);
      if (erx < 4 || ery < 4) return null;
      bbox = { x: ex - erx, y: ey - ery, w: erx * 2, h: ery * 2 };
    } else if (s.tagName === 'line') {
      var lx1 = parseFloat(s.getAttribute('x1') || 0);
      var ly1 = parseFloat(s.getAttribute('y1') || 0);
      var lx2 = parseFloat(s.getAttribute('x2') || 0);
      var ly2 = parseFloat(s.getAttribute('y2') || 0);
      var lminX = Math.min(lx1, lx2);
      var lmaxX = Math.max(lx1, lx2);
      var lminY = Math.min(ly1, ly2);
      var lmaxY = Math.max(ly1, ly2);
      var sw = parseFloat(s.getAttribute('stroke-width') || 2);
      bbox = {
        x: lminX - sw,
        y: lminY - sw,
        w: Math.max(lmaxX - lminX + sw * 2, 8),
        h: Math.max(lmaxY - lminY + sw * 2, 8)
      };
    } else if (s.tagName === 'path') {
      try {
        var pb = s.getBBox();
        bbox = { x: pb.x, y: pb.y, w: pb.width, h: pb.height };
      } catch (e2) { return null; }
      if (bbox.w < 4 || bbox.h < 4) return null;
    } else {
      return null;
    }
    return bbox;
  }

  function closestSvgNodeZone(el, root) {
    while (el && el !== root) {
      if (el.classList && el.classList.contains('svg-node-zone')) return el;
      el = el.parentNode;
    }
    return null;
  }

  function findZoneByNodeName(canvas, nodeName) {
    var zones = canvas.querySelectorAll('.svg-node-zone');
    var i;
    for (i = 0; i < zones.length; i++) {
      if (zones[i].getAttribute('data-node') === nodeName) return zones[i];
    }
    return null;
  }

  /**
   * Single source of truth for diagram modal SVG ↔ detail highlight.
   * (Per-invocation closures in wireSvgHovers broke after reopening the modal.)
   */
  var diagramModalHover = {
    activeZone: null,
    clear: function () {
      var z = this.activeZone;
      if (!z) return;
      try {
        z.classList.remove('active');
      } catch (e) {}
      var detail = document.getElementById('diagramModalDetail');
      var node = z.getAttribute('data-node');
      if (detail && node) {
        var di = findDetailItem(detail, node);
        if (di) di.classList.remove('highlight');
      }
      this.activeZone = null;
    },
    set: function (zone) {
      if (!zone) return;
      if (this.activeZone === zone) return;
      this.clear();
      this.activeZone = zone;
      zone.classList.add('active');
      var detail = document.getElementById('diagramModalDetail');
      var node = zone.getAttribute('data-node');
      if (detail && node) {
        var di = findDetailItem(detail, node);
        if (di) {
          di.classList.add('highlight');
          di.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
      }
    }
  };

  /**
   * Detail panel → SVG zone (one delegation; guard so we never stack listeners).
   * Also invoked from openDiagramWithDetail so binding always happens after modal markup exists.
   */
  function ensureDiagramModalDetailHover() {
    var detail = document.getElementById('diagramModalDetail');
    if (!detail || detail.getAttribute('data-forge-detail-hover') === '1') return;
    detail.setAttribute('data-forge-detail-hover', '1');

    detail.addEventListener('mouseover', function (ev) {
      var modal = document.getElementById('diagramModal');
      if (!modal || !modal.classList.contains('active')) return;
      var item = ev.target.closest ? ev.target.closest('.detail-item') : null;
      if (!item) return;
      var canvas = document.getElementById('diagramModalCanvas');
      if (!canvas) return;
      var zone = findZoneByNodeName(canvas, item.getAttribute('data-node'));
      if (zone) diagramModalHover.set(zone);
    });

    detail.addEventListener('mouseout', function (ev) {
      var modal = document.getElementById('diagramModal');
      if (!modal || !modal.classList.contains('active')) return;
      var item = ev.target.closest ? ev.target.closest('.detail-item') : null;
      if (!item) return;
      var rel = ev.relatedTarget;
      if (rel && item.contains(rel)) return;
      var canvas = document.getElementById('diagramModalCanvas');
      if (!canvas) return;
      var zone = findZoneByNodeName(canvas, item.getAttribute('data-node'));
      if (zone && diagramModalHover.activeZone === zone) diagramModalHover.clear();
    });
  }

  function wireSvgHovers(canvas, detail, key) {
    var data = getDetailData(key);
    if (!data || !canvas || !detail) return;

    var nodeNames = data.items.map(function (it) { return it.node; });
    var svg = canvas.querySelector('svg');
    if (!svg) return;

    var allShapes = Array.from(
      svg.querySelectorAll('rect, polygon, polyline, line, circle, ellipse, path')
    );

    nodeNames.forEach(function (nodeName) {
      /* Explicit grouping in SVG (e.g. line/area series): <g data-node="Series A">…</g> */
      var explicit = findElementByDataNode(svg, nodeName);
      if (explicit && explicit.tagName.toLowerCase() === 'g') {
        if (explicit.classList) {
          explicit.classList.add('svg-node-zone');
        } else {
          explicit.setAttribute('class', 'svg-node-zone');
        }
        explicit.setAttribute('data-node', nodeName);
        explicit.setAttribute('pointer-events', 'all');
        return;
      }

      var matchEl = findLabelElement(svg, nodeName);
      if (!matchEl) return;
      /* Prefer the owning <text> so we move the whole label block (tspan lives under text). */
      var matchText = matchEl.closest ? (matchEl.closest('text') || matchEl) : matchEl;

      var pt = labelCenter(matchText);
      var tx = pt.x;
      var ty = pt.y;

      var bestShape = null;
      var bestDist = Infinity;
      allShapes.forEach(function (s) {
        var bbox = shapeBBox(s);
        if (!bbox) return;

        if (tx >= bbox.x - 8 && tx <= bbox.x + bbox.w + 8 &&
            ty >= bbox.y - 8 && ty <= bbox.y + bbox.h + 8) {
          var cx = bbox.x + bbox.w / 2;
          var cy = bbox.y + bbox.h / 2;
          var dist = Math.abs(tx - cx) + Math.abs(ty - cy);
          if (dist < bestDist) { bestDist = dist; bestShape = s; }
        }
      });

      var zone = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      zone.setAttribute('class', 'svg-node-zone');
      zone.setAttribute('data-node', nodeName);
      zone.setAttribute('pointer-events', 'all');

      if (bestShape && bestShape.parentNode) {
        bestShape.parentNode.insertBefore(zone, bestShape);
        zone.appendChild(bestShape);
      } else if (matchText.parentNode) {
        matchText.parentNode.insertBefore(zone, matchText);
      }

      var sibling = matchText.nextElementSibling;
      if (matchText.parentNode) {
        matchText.parentNode.removeChild(matchText);
        zone.appendChild(matchText);
      }
      if (sibling && sibling.tagName === 'text' && sibling.parentNode) {
        sibling.parentNode.removeChild(sibling);
        zone.appendChild(sibling);
      }
    });

    /* -----------------------------------------------------------------
     * Hover wiring:
     * - Do NOT rely on mouseover + target.closest('.svg-node-zone') on
     *   the root <svg> — many browsers do not implement Element.closest
     *   correctly for SVG sub-elements, so the zone is never found.
     * - Bubbling mouseover/mouseout on each zone <g> (pointer-events=all) with
     *   relatedTarget checks — avoids per-shape pointer bugs in SVG engines.
     * ----------------------------------------------------------------- */

    function bindZoneHover(zone) {
      zone.addEventListener('mouseover', function (e) {
        var rel = e.relatedTarget;
        if (rel && zone.contains(rel)) return;
        diagramModalHover.set(zone);
      });
      zone.addEventListener('mouseout', function (e) {
        var rel = e.relatedTarget;
        if (rel && zone.contains(rel)) return;
        if (diagramModalHover.activeZone === zone) diagramModalHover.clear();
      });
    }

    var allZones = canvas.querySelectorAll('.svg-node-zone');
    var zi;
    for (zi = 0; zi < allZones.length; zi++) {
      bindZoneHover(allZones[zi]);
    }
  }

  var _forgeOpenDiagramModal = window.openDiagramModal;
  if (typeof _forgeOpenDiagramModal === 'function') {
    window.openDiagramModal = function (trigger) {
      var host = trigger.closest ? trigger.closest('[data-diagram-key]') : null;
      var key = host && host.getAttribute('data-diagram-key');
      var detail = document.getElementById('diagramModalDetail');
      var titleEl = document.getElementById('diagramModalTitle');
      if (key && detail && getDetailData(key)) {
        detail.innerHTML = renderMermaidParallelModalDetail(key);
        if (titleEl) titleEl.textContent = getDetailData(key).title;
        ensureDiagramModalDetailHover();
      } else if (detail) {
        detail.innerHTML = '';
        if (titleEl) titleEl.textContent = 'Diagram';
      }
      _forgeOpenDiagramModal(trigger);
    };
  }

  ensureDiagramModalDetailHover();
})();
