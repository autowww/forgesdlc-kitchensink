/**
 * Diagram expand modal: fit / zoom / pan / keyboard (Ctrl+/-/0) / Ctrl+wheel.
 * Mount after content is placed in #diagramModalCanvas; chains closeDiagramModal for teardown.
 */
(function () {
  'use strict';

  var ZOOM_MIN = 0.15;
  var ZOOM_MAX = 6;
  var ZOOM_STEP = 1.15;
  var TOOLBAR_CLASS = 'diagram-modal-zoom-toolbar';
  var VIEWPORT_CLASS = 'diagram-modal-zoom-viewport';
  var CONTENT_CLASS = 'diagram-modal-zoom-content';

  var abortCtl = null;
  var resizeObs = null;
  var activeCanvas = null;

  function isDiagramModalActive() {
    var m = document.getElementById('diagramModal');
    return m && m.classList.contains('active');
  }

  function teardownDiagramZoom() {
    if (abortCtl) {
      abortCtl.abort();
      abortCtl = null;
    }
    if (resizeObs) {
      try {
        resizeObs.disconnect();
      } catch (e) {}
      resizeObs = null;
    }
    activeCanvas = null;
  }

  function wrapCloseDiagramModalOnLoad() {
    if (wrapCloseDiagramModalOnLoad._done) return;
    wrapCloseDiagramModalOnLoad._done = true;
    var prev = window.closeDiagramModal;
    window.closeDiagramModal = function () {
      teardownDiagramZoom();
      if (typeof prev === 'function') {
        return prev.apply(this, arguments);
      }
    };
  }

  wrapCloseDiagramModalOnLoad();

  function stripSizingForMeasure(el) {
    if (!el || !el.style) return;
    if (el.tagName === 'SVG' || el.tagName === 'svg') {
      el.style.width = '';
      el.style.height = '';
      el.style.maxHeight = '';
      el.style.maxWidth = '';
      el.removeAttribute('width');
      el.removeAttribute('height');
    }
    if (el.tagName === 'IMG' || el.tagName === 'img') {
      el.style.width = '';
      el.style.height = '';
      el.style.maxWidth = '';
      el.style.maxHeight = '';
      el.style.objectFit = '';
    }
  }

  function measureContentSize(content) {
    var prev = content.style.transform;
    content.style.transform = 'none';
    var kids = content.children;
    var i;
    for (i = 0; i < kids.length; i++) {
      stripSizingForMeasure(kids[i]);
    }
    var w = content.scrollWidth;
    var h = content.scrollHeight;
    if (w < 2) w = 2;
    if (h < 2) h = 2;
    content.style.transform = prev;
    return { w: w, h: h };
  }

  function clampPan(state, vw, vh, cw, ch) {
    var sw = cw * state.s;
    var sh = ch * state.s;
    if (sw <= vw) {
      state.tx = (vw - sw) / 2;
    } else {
      var minX = vw - sw;
      if (state.tx > 0) state.tx = 0;
      if (state.tx < minX) state.tx = minX;
    }
    if (sh <= vh) {
      state.ty = (vh - sh) / 2;
    } else {
      var minY = vh - sh;
      if (state.ty > 0) state.ty = 0;
      if (state.ty < minY) state.ty = minY;
    }
  }

  function applyTransform(content, state) {
    content.style.transform =
      'translate(' + state.tx + 'px,' + state.ty + 'px) scale(' + state.s + ')';
  }

  function updatePctLabel(toolbar, s) {
    var el = toolbar.querySelector('.diagram-modal-zoom-pct');
    if (el) el.textContent = Math.round(s * 100) + '%';
  }

  function snapScale(s) {
    var pct = Math.round(s * 100);
    pct = Math.round(pct / 5) * 5;
    pct = Math.max(Math.round(ZOOM_MIN * 100), Math.min(Math.round(ZOOM_MAX * 100), pct));
    return pct / 100;
  }

  window.forgeUnmountDiagramModalZoom = teardownDiagramZoom;

  window.forgeMountDiagramModalZoom = function (canvas) {
    if (!canvas || canvas.id !== 'diagramModalCanvas') return;

    var modal = document.getElementById('diagramModal');
    if (!modal || !modal.classList.contains('active')) return;

    teardownDiagramZoom();

    var nodes = [];
    var ch = canvas.firstChild;
    while (ch) {
      var next = ch.nextSibling;
      if (ch.nodeType === 1) {
        nodes.push(ch);
      }
      ch = next;
    }
    if (nodes.length === 0) return;

    var toolbar = document.createElement('div');
    toolbar.className = TOOLBAR_CLASS;
    toolbar.setAttribute('role', 'toolbar');
    toolbar.setAttribute('aria-label', 'Diagram zoom');
    toolbar.innerHTML =
      '<button type="button" class="diagram-modal-zoom-btn" data-zoom-act="out" aria-label="Zoom out">\u2212</button>' +
      '<span class="diagram-modal-zoom-pct" aria-live="polite">100%</span>' +
      '<button type="button" class="diagram-modal-zoom-btn" data-zoom-act="in" aria-label="Zoom in">+</button>' +
      '<button type="button" class="diagram-modal-zoom-btn diagram-modal-zoom-btn--text" data-zoom-act="fit">Fit</button>' +
      '<button type="button" class="diagram-modal-zoom-btn diagram-modal-zoom-btn--text" data-zoom-act="actual">100%</button>';

    var viewport = document.createElement('div');
    viewport.className = VIEWPORT_CLASS;

    var content = document.createElement('div');
    content.className = CONTENT_CLASS;

    var i;
    for (i = 0; i < nodes.length; i++) {
      content.appendChild(nodes[i]);
    }

    viewport.appendChild(content);
    canvas.appendChild(toolbar);
    canvas.appendChild(viewport);

    activeCanvas = canvas;
    abortCtl = new AbortController();
    var signal = abortCtl.signal;

    var state = { s: 1, tx: 0, ty: 0, cw: 100, ch: 100 };

    function viewportSize() {
      return { vw: viewport.clientWidth, vh: viewport.clientHeight };
    }

    function syncMeasure() {
      var m = measureContentSize(content);
      state.cw = m.w;
      state.ch = m.h;
      return m;
    }

    function doFit() {
      syncMeasure();
      var vs = viewportSize();
      if (vs.vw < 2 || vs.vh < 2) return;
      state.s = Math.min(vs.vw / state.cw, vs.vh / state.ch);
      if (!isFinite(state.s) || state.s <= 0) state.s = 1;
      state.tx = (vs.vw - state.cw * state.s) / 2;
      state.ty = (vs.vh - state.ch * state.s) / 2;
      clampPan(state, vs.vw, vs.vh, state.cw, state.ch);
      applyTransform(content, state);
      updatePctLabel(toolbar, state.s);
    }

    function doActualSize() {
      syncMeasure();
      var vs = viewportSize();
      state.s = 1;
      state.tx = (vs.vw - state.cw) / 2;
      state.ty = (vs.vh - state.ch) / 2;
      clampPan(state, vs.vw, vs.vh, state.cw, state.ch);
      applyTransform(content, state);
      updatePctLabel(toolbar, state.s);
    }

    function zoomAt(factor, anchorVx, anchorVy, opts) {
      syncMeasure();
      var vs = viewportSize();
      var oldS = state.s;
      var next = state.s * factor;
      if (opts && opts.snap) next = snapScale(next);
      state.s = next;
      state.s = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, state.s));
      if (anchorVx == null) {
        anchorVx = vs.vw / 2;
        anchorVy = vs.vh / 2;
      }
      var wx = (anchorVx - state.tx) / oldS;
      var wy = (anchorVy - state.ty) / oldS;
      state.tx = anchorVx - wx * state.s;
      state.ty = anchorVy - wy * state.s;
      clampPan(state, vs.vw, vs.vh, state.cw, state.ch);
      applyTransform(content, state);
      updatePctLabel(toolbar, state.s);
    }

    toolbar.addEventListener(
      'click',
      function (ev) {
        var btn = ev.target.closest('[data-zoom-act]');
        if (!btn || !toolbar.contains(btn)) return;
        var act = btn.getAttribute('data-zoom-act');
        if (act === 'in') zoomAt(ZOOM_STEP, null, null, { snap: true });
        else if (act === 'out') zoomAt(1 / ZOOM_STEP, null, null, { snap: true });
        else if (act === 'fit') doFit();
        else if (act === 'actual') doActualSize();
      },
      { signal: signal }
    );

    viewport.addEventListener(
      'wheel',
      function (ev) {
        if (!ev.ctrlKey && !ev.metaKey) return;
        ev.preventDefault();
        var rect = viewport.getBoundingClientRect();
        var vx = ev.clientX - rect.left;
        var vy = ev.clientY - rect.top;
        var factor = ev.deltaY < 0 ? ZOOM_STEP : 1 / ZOOM_STEP;
        zoomAt(factor, vx, vy);
      },
      { signal: signal, passive: false }
    );

    var drag = null;
    viewport.addEventListener(
      'pointerdown',
      function (ev) {
        if (ev.button !== 0) return;
        drag = {
          pid: ev.pointerId,
          lx: ev.clientX,
          ly: ev.clientY,
          ox: state.tx,
          oy: state.ty
        };
        viewport.setPointerCapture(ev.pointerId);
        viewport.classList.add('diagram-modal-zoom-viewport--dragging');
      },
      { signal: signal }
    );

    viewport.addEventListener(
      'pointermove',
      function (ev) {
        if (!drag || ev.pointerId !== drag.pid) return;
        var dx = ev.clientX - drag.lx;
        var dy = ev.clientY - drag.ly;
        state.tx = drag.ox + dx;
        state.ty = drag.oy + dy;
        syncMeasure();
        var vs = viewportSize();
        clampPan(state, vs.vw, vs.vh, state.cw, state.ch);
        applyTransform(content, state);
      },
      { signal: signal }
    );

    function endDrag(ev) {
      if (!drag || ev.pointerId !== drag.pid) return;
      viewport.releasePointerCapture(ev.pointerId);
      viewport.classList.remove('diagram-modal-zoom-viewport--dragging');
      drag = null;
    }

    viewport.addEventListener('pointerup', endDrag, { signal: signal });
    viewport.addEventListener('pointercancel', endDrag, { signal: signal });

    function onKeyDown(ev) {
      if (!isDiagramModalActive()) return;
      if (!ev.ctrlKey && !ev.metaKey) return;
      var k = ev.key;
      var code = ev.code;
      var zoomIn =
        k === '+' ||
        code === 'NumpadAdd' ||
        (k === '=' && ev.shiftKey) ||
        (code === 'Equal' && ev.shiftKey);
      var zoomOut = k === '-' || code === 'NumpadSubtract';
      var zoomReset = k === '0' || code === 'Numpad0';

      if (zoomIn) {
        ev.preventDefault();
        zoomAt(ZOOM_STEP, null, null, null);
      } else if (zoomOut) {
        ev.preventDefault();
        zoomAt(1 / ZOOM_STEP, null, null, null);
      } else if (zoomReset) {
        ev.preventDefault();
        doFit();
      }
    }

    document.addEventListener('keydown', onKeyDown, { signal: signal, capture: true });

    function onResize() {
      if (!isDiagramModalActive() || !document.body.contains(canvas)) return;
      syncMeasure();
      var vs = viewportSize();
      clampPan(state, vs.vw, vs.vh, state.cw, state.ch);
      applyTransform(content, state);
      updatePctLabel(toolbar, state.s);
    }

    window.addEventListener('resize', onResize, { signal: signal });

    if (typeof ResizeObserver !== 'undefined') {
      resizeObs = new ResizeObserver(function () {
        onResize();
      });
      resizeObs.observe(viewport);
    }

    requestAnimationFrame(function () {
      requestAnimationFrame(doFit);
    });
  };
})();
