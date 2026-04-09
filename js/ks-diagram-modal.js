/**
 * KS static diagram modal — openDiagramWithDetail + SVG/detail hover wiring for product & handbook.
 * Requires ks-diagram-catalog.js first (window.__FORGE_KS_DIAGRAM_CATALOG).
 * Load after forge-theme.js (patches closeDiagramModal).
 */
(function () {
  'use strict';

  function getKsDetailData(key) {
    var c = window.__FORGE_KS_DIAGRAM_CATALOG;
    return c && c[key] ? c[key] : null;
  }

  var colorMap = {
    cyan:    'var(--forge-cyan)',
    amber:   'var(--forge-amber)',
    emerald: 'var(--forge-emerald)'
  };

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

  function renderDetailPanel(key) {
    var data = getKsDetailData(key);
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
    if (title) {
      var ksData = getKsDetailData(key);
      if (ksData) title.textContent = ksData.title;
      else if (img) {
        var alt = (img.getAttribute('alt') || '').trim();
        title.textContent = alt || 'Expanded diagram';
      }
    }

    /* Bind once; must run after diagrams page has #diagramModalDetail in DOM. */
    ensureDiagramModalDetailHover();

    if (typeof window.forgeApplyDiagramModalOpen === 'function') {
      window.forgeApplyDiagramModalOpen();
    } else {
      var dmOpen = document.getElementById('diagramModal');
      if (dmOpen) {
        dmOpen.classList.add('active');
        dmOpen.removeAttribute('hidden');
        dmOpen.setAttribute('aria-hidden', 'false');
      }
    }
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
  window.forgeKsDiagramModalHover = diagramModalHover;

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
    var data = getKsDetailData(key);
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

  var _prevCloseDiagramModal = window.closeDiagramModal;
  window.closeDiagramModal = function () {
    if (window.forgeKsDiagramModalHover && window.forgeKsDiagramModalHover.clear) {
      window.forgeKsDiagramModalHover.clear();
    }
    var canvas = document.getElementById('diagramModalCanvas');
    if (canvas) {
      var iframe = canvas.querySelector('iframe.layout-preview-iframe');
      if (iframe) iframe.src = 'about:blank';
      canvas.innerHTML = '';
    }
    var detail = document.getElementById('diagramModalDetail');
    if (detail) {
      detail.removeAttribute('data-forge-detail-hover');
      detail.innerHTML = '';
    }
    if (typeof _prevCloseDiagramModal === 'function') {
      _prevCloseDiagramModal();
    } else {
      var modal = document.getElementById('diagramModal');
      if (modal) {
        modal.classList.remove('active');
        modal.setAttribute('hidden', '');
        modal.setAttribute('aria-hidden', 'true');
      }
      var t = document.getElementById('diagramModalTitle');
      if (t) t.textContent = '';
      document.body.style.overflow = '';
    }
  };

  ensureDiagramModalDetailHover();
})();
