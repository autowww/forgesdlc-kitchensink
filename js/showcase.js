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
        { node: 'G',       color: 'amber',   desc: 'Gate checkpoint (diamond). Criteria must be met before proceeding.' },
        { node: 'Stage 2', color: 'emerald', desc: 'Second activity block, entered only after passing the gate.' },
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
    heatmap: {
      title: 'Heatmap',
      items: [
        { node: 'Col A', color: 'cyan',  desc: 'Column header. Cell intensity (opacity) maps to the value.' },
        { node: 'Col B', color: 'cyan',  desc: 'Second column. Higher values are brighter; lower values are dimmer.' },
        { node: 'Col C', color: 'cyan',  desc: 'Third column. The gradient legend at the bottom shows the scale.' },
        { node: 'Row 1', color: 'amber', desc: 'Row label. Each cell shows its numeric value inside.' },
        { node: 'Row 2', color: 'amber', desc: 'Second row. The grid pattern works for correlation matrices, coverage maps, etc.' }
      ]
    }
  };

  var colorMap = {
    cyan:    'var(--forge-cyan)',
    amber:   'var(--forge-amber)',
    emerald: 'var(--forge-emerald)'
  };

  // -----------------------------------------------------------------
  // 3. Diagram modal  (open / close / render)
  // -----------------------------------------------------------------

  function renderDetailPanel(key) {
    var data = DIAGRAM_DETAILS[key];
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

  window.openDiagramWithDetail = function (trigger, key) {
    var img = trigger.querySelector('img');
    if (!img) return;

    var canvas = document.getElementById('diagramModalCanvas');
    var detail = document.getElementById('diagramModalDetail');
    var title  = document.getElementById('diagramModalTitle');
    if (!canvas) return;

    if (detail) detail.innerHTML = renderDetailPanel(key);
    if (title && DIAGRAM_DETAILS[key]) title.textContent = DIAGRAM_DETAILS[key].title;

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
        svg.style.minHeight = '40vh';
      }
      wireSvgHovers(canvas, detail, key);
    }

    function showImgFallback() {
      var clone = img.cloneNode(true);
      clone.style.width = '100%';
      clone.style.height = 'auto';
      clone.style.minHeight = '40vh';
      clone.style.objectFit = 'contain';
      canvas.innerHTML = '';
      canvas.appendChild(clone);
    }

    var xhr = new XMLHttpRequest();
    xhr.open('GET', img.src, true);
    xhr.onload = function () {
      if (xhr.status === 200 || xhr.status === 0) {
        inlineSvg(xhr.responseText);
      } else {
        showImgFallback();
      }
    };
    xhr.onerror = function () { showImgFallback(); };
    try { xhr.send(); } catch (e) { showImgFallback(); }
  };

  window.closeDiagramModal = function () {
    var modal = document.getElementById('diagramModal');
    if (modal) modal.classList.remove('active');
    document.body.style.overflow = '';
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

  function wireSvgHovers(canvas, detail, key) {
    var data = DIAGRAM_DETAILS[key];
    if (!data || !canvas || !detail) return;

    var nodeNames = data.items.map(function (it) { return it.node; });
    var svg = canvas.querySelector('svg');
    if (!svg) return;

    var allShapes = Array.from(svg.querySelectorAll('rect, polygon, circle, ellipse, path'));

    nodeNames.forEach(function (nodeName) {
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

      var detailItem = findDetailItem(detail, nodeName);

      zone.addEventListener('mouseenter', function () {
        zone.classList.add('active');
        if (detailItem) {
          detailItem.classList.add('highlight');
          detailItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
      });
      zone.addEventListener('mouseleave', function () {
        zone.classList.remove('active');
        if (detailItem) detailItem.classList.remove('highlight');
      });

      if (detailItem) {
        detailItem.addEventListener('mouseenter', function () {
          detailItem.classList.add('highlight');
          zone.classList.add('active');
        });
        detailItem.addEventListener('mouseleave', function () {
          detailItem.classList.remove('highlight');
          zone.classList.remove('active');
        });
      }
    });
  }
})();
