/**
 * KS roadmap dynamic drill-down — mount on `[data-ks-roadmap]` / `[data-ks-nested-roadmap]`.
 * Expects modal `#ksNestedRoadmapModal` unless overridden.
 */
(function () {
  'use strict';

  var TONES = ['cyan', 'emerald', 'amber', 'violet'];
  var TOOLTIP_DELAY_MS = 220;
  var TOOLTIP_MAX_ITEMS = 8;

  function hasDrillChild(bar) {
    var c = bar && bar.child;
    return Boolean(c && Array.isArray(c.bars) && c.bars.length > 0);
  }

  function columnIndexMap(level) {
    var m = {};
    var cols = level.columns || [];
    for (var i = 0; i < cols.length; i++) {
      m[cols[i].id] = i;
    }
    return m;
  }

  function barGridColumn(level, bar) {
    var cmap = columnIndexMap(level);
    var s = cmap[bar.startColumnId];
    var e = cmap[bar.endColumnId];
    if (typeof s !== 'number' || typeof e !== 'number' || s > e) {
      return '1 / 2';
    }
    return String(s + 1) + ' / ' + String(e + 2);
  }

  function renderGridHTML(level, mini) {
    var cols = level.columns || [];
    var tracks = level.tracks || [];
    var bars = level.bars || [];
    var n = cols.length;
    var cl = mini ? 'ks-nrm-grid ks-nrm-grid--mini' : 'ks-nrm-grid';
    var html = '<div class="' + cl + '" style="--ks-nrm-cols:' + n + '">';
    html += '<div class="ks-nrm-corner" aria-hidden="true"></div>';
    for (var ci = 0; ci < cols.length; ci++) {
      html += '<div class="ks-nrm-col-head">' + esc(cols[ci].label) + '</div>';
    }
    var barsByTrack = {};
    for (var bi = 0; bi < bars.length; bi++) {
      var b = bars[bi];
      var tid = b.trackId || '';
      if (!barsByTrack[tid]) barsByTrack[tid] = [];
      barsByTrack[tid].push(b);
    }
    for (var ti = 0; ti < tracks.length; ti++) {
      var tr = tracks[ti];
      html += '<div class="ks-nrm-track-label">' + esc(tr.label) + '</div>';
      html += '<div class="ks-nrm-lane">';
      var rowBars = barsByTrack[tr.id] || [];
      for (var ri = 0; ri < rowBars.length; ri++) {
        var bar = rowBars[ri];
        var drill = hasDrillChild(bar);
        var tone = TONES[(biHash(bar.id) % TONES.length + ri) % TONES.length];
        var gc = barGridColumn(level, bar);
        var nest = drill
          ? '<span class="ks-nrm-bar__nest-icon" aria-hidden="true"></span>'
          : '';
        var extraLabel = drill ? 'Contains nested roadmap. ' : '';
        if (drill) {
          html +=
            '<button type="button" class="ks-nrm-bar ks-nrm-bar--drill ks-nrm-bar--' +
            tone +
            '" style="grid-column:' +
            gc +
            '" data-ks-nrm-bar-id="' +
            escAttr(bar.id) +
            '" aria-haspopup="dialog" aria-expanded="false" aria-label="' +
            escAttr(extraLabel + bar.label) +
            '">';
          html += '<span class="ks-nrm-bar__label">' + esc(bar.label) + '</span>' + nest;
          html += '</button>';
        } else {
          html +=
            '<div class="ks-nrm-bar ks-nrm-bar--leaf ks-nrm-bar--' +
            tone +
            '" style="grid-column:' +
            gc +
            '" role="group" aria-label="' +
            escAttr(bar.label) +
            '">';
          html += '<span class="ks-nrm-bar__label">' + esc(bar.label) + '</span>';
          html += '</div>';
        }
      }
      html += '</div>';
    }
    html += '</div>';
    return html;
  }

  function biHash(s) {
    var h = 0;
    var str = String(s || '');
    for (var i = 0; i < str.length; i++) {
      h = (h * 31 + str.charCodeAt(i)) | 0;
    }
    return Math.abs(h);
  }

  function esc(s) {
    var d = document.createElement('div');
    d.textContent = s == null ? '' : String(s);
    return d.innerHTML;
  }

  function escAttr(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function tooltipHTML(bar) {
    var c = bar.child;
    if (!c) return '';
    var innerBars = c.bars || [];
    var title = '<div class="ks-nrm-tooltip__title">' + esc(c.title || 'Nested roadmap') + '</div>';
    var list = '<ul>';
    var lim = Math.min(innerBars.length, TOOLTIP_MAX_ITEMS);
    for (var i = 0; i < lim; i++) {
      list += '<li>' + esc(innerBars[i].label || innerBars[i].id) + '</li>';
    }
    if (innerBars.length > TOOLTIP_MAX_ITEMS) {
      list += '<li>… and ' + (innerBars.length - TOOLTIP_MAX_ITEMS) + ' more</li>';
    }
    list += '</ul>';
    return title + list;
  }

  function mountRoadmap(root) {
    var script = root.querySelector('script[data-ks-nrm-config]');
    if (!script || !script.textContent) return;

    var config;
    try {
      config = JSON.parse(script.textContent);
    } catch (err) {
      return;
    }

    var modalId = root.getAttribute('data-ks-nrm-modal') || 'ksNestedRoadmapModal';
    var backdrop = document.getElementById(modalId);
    if (!backdrop) return;

    var viewport = root.querySelector('[data-ks-nrm-viewport]');
    var bcEl = root.querySelector('[data-ks-nrm-bc]');
    var btnUp = root.querySelector('[data-ks-nrm-up]');
    var btnRoot = root.querySelector('[data-ks-nrm-root]');
    var tooltipEl = document.getElementById('ksNestedRoadmapTooltip');

    var trail = [{ title: config.title || 'Roadmap', level: config }];
    var tooltipTimer = null;
    var lastFocusEl = null;

    var titleEl = backdrop.querySelector('.ks-nrm-dialog__title');
    var summaryEl = backdrop.querySelector('#' + modalId + '-summary');
    var detailEl = backdrop.querySelector('#' + modalId + '-detail');
    var previewWrap = backdrop.querySelector('#' + modalId + '-preview-wrap');
    var previewEl = backdrop.querySelector('#' + modalId + '-preview');
    var drillBtn = backdrop.querySelector('#' + modalId + '-drill');
    var closeBtn = backdrop.querySelector('[data-ks-nrm-close]');

    var pendingBar = null;

    function currentLevel() {
      return trail[trail.length - 1].level;
    }

    function syncNavButtons() {
      if (btnUp) {
        if (trail.length > 1) {
          btnUp.removeAttribute('hidden');
        } else {
          btnUp.setAttribute('hidden', '');
        }
      }
      if (btnRoot) {
        if (trail.length > 2) {
          btnRoot.removeAttribute('hidden');
        } else {
          btnRoot.setAttribute('hidden', '');
        }
      }
    }

    function renderBreadcrumb() {
      if (!bcEl) return;
      var parts = [];
      for (var i = 0; i < trail.length; i++) {
        var seg = trail[i].title || 'Level';
        if (i < trail.length - 1) {
          parts.push(
            '<button type="button" class="ks-nested-roadmap__bc-btn" data-ks-nrm-bc-idx="' +
              i +
              '">' +
              esc(seg) +
              '</button>'
          );
          parts.push('<span class="ks-nested-roadmap__bc-sep" aria-hidden="true">›</span>');
        } else {
          parts.push('<span class="ks-nested-roadmap__bc-current">' + esc(seg) + '</span>');
        }
      }
      bcEl.innerHTML = parts.join(' ');
    }

    function paintViewport() {
      if (!viewport) return;
      viewport.innerHTML = renderGridHTML(currentLevel(), false);
      wireBars();
      renderBreadcrumb();
      syncNavButtons();
    }

    function wireBars() {
      var buttons = viewport.querySelectorAll('button[data-ks-nrm-bar-id]');
      for (var i = 0; i < buttons.length; i++) {
        (function (btn) {
          btn.addEventListener('click', function () {
            var id = btn.getAttribute('data-ks-nrm-bar-id');
            var bar = findBarById(currentLevel(), id);
            if (!bar || !hasDrillChild(bar)) return;
            openModalForBar(bar, btn);
          });
          btn.addEventListener('keydown', function (ev) {
            if (ev.key === 'Enter' || ev.key === ' ') {
              ev.preventDefault();
              btn.click();
            }
          });
          btn.addEventListener('mouseenter', function (ev) {
            var id = btn.getAttribute('data-ks-nrm-bar-id');
            var bar = findBarById(currentLevel(), id);
            if (!bar || !hasDrillChild(bar)) return;
            clearTimeout(tooltipTimer);
            tooltipTimer = setTimeout(function () {
              showTooltip(ev, bar);
            }, TOOLTIP_DELAY_MS);
          });
          btn.addEventListener('mouseleave', function () {
            clearTimeout(tooltipTimer);
            hideTooltip();
          });
          btn.addEventListener('mousemove', function (ev) {
            if (!tooltipEl || tooltipEl.hasAttribute('hidden')) return;
            positionTooltip(ev.clientX, ev.clientY);
          });
        })(buttons[i]);
      }
    }

    function findBarById(level, id) {
      var bars = level.bars || [];
      for (var i = 0; i < bars.length; i++) {
        if (bars[i].id === id) return bars[i];
      }
      return null;
    }

    function showTooltip(ev, bar) {
      if (!tooltipEl) return;
      tooltipEl.innerHTML = tooltipHTML(bar);
      tooltipEl.removeAttribute('hidden');
      positionTooltip(ev.clientX, ev.clientY);
    }

    function hideTooltip() {
      if (tooltipEl) tooltipEl.setAttribute('hidden', '');
    }

    function positionTooltip(x, y) {
      if (!tooltipEl) return;
      var pad = 12;
      tooltipEl.style.left = Math.min(x + pad, window.innerWidth - tooltipEl.offsetWidth - 8) + 'px';
      tooltipEl.style.top = Math.min(y + pad, window.innerHeight - tooltipEl.offsetHeight - 8) + 'px';
    }

    function openModalForBar(bar, triggerEl) {
      pendingBar = bar;
      lastFocusEl = triggerEl || document.activeElement;
      if (titleEl) titleEl.textContent = bar.label || bar.id || 'Item';
      if (summaryEl) {
        if (bar.summary) {
          summaryEl.textContent = bar.summary;
          summaryEl.removeAttribute('hidden');
        } else {
          summaryEl.textContent = '';
          summaryEl.setAttribute('hidden', '');
        }
      }
      if (detailEl) {
        if (bar.detailHtml) {
          detailEl.innerHTML = bar.detailHtml;
          detailEl.removeAttribute('hidden');
        } else {
          detailEl.innerHTML = '';
          detailEl.setAttribute('hidden', '');
        }
      }
      if (previewWrap && previewEl) {
        if (hasDrillChild(bar)) {
          previewEl.innerHTML = renderGridHTML(bar.child, true);
          previewWrap.removeAttribute('hidden');
        } else {
          previewEl.innerHTML = '';
          previewWrap.setAttribute('hidden', '');
        }
      }
      if (drillBtn) {
        drillBtn.disabled = !hasDrillChild(bar);
      }
      backdrop.classList.add('ks-nrm-backdrop--open');
      backdrop.removeAttribute('hidden');
      backdrop.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      var focusables = getFocusables(backdrop);
      if (focusables.length) focusables[0].focus();
      document.addEventListener('keydown', onDocKeydown);
    }

    function closeModal() {
      document.removeEventListener('keydown', onDocKeydown);
      backdrop.classList.remove('ks-nrm-backdrop--open');
      backdrop.setAttribute('hidden', '');
      backdrop.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (drillBtn) drillBtn.disabled = true;
      if (detailEl) {
        detailEl.innerHTML = '';
        detailEl.setAttribute('hidden', '');
      }
      hideTooltip();
      if (lastFocusEl && typeof lastFocusEl.focus === 'function') {
        lastFocusEl.focus();
      }
      pendingBar = null;
    }

    function onDocKeydown(ev) {
      if (ev.key === 'Escape') {
        ev.preventDefault();
        closeModal();
        return;
      }
      if (ev.key !== 'Tab' || !backdrop.classList.contains('ks-nrm-backdrop--open')) return;
      var focusables = getFocusables(backdrop);
      if (!focusables.length) return;
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (ev.shiftKey) {
        if (document.activeElement === first) {
          ev.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          ev.preventDefault();
          first.focus();
        }
      }
    }

    function getFocusables(rootEl) {
      var sel =
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
      var list = [];
      var nodes = rootEl.querySelectorAll(sel);
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        var r = n.getBoundingClientRect();
        if (r.width > 0 && r.height > 0) list.push(n);
      }
      return list;
    }

    function drillFromModal() {
      var bar = pendingBar;
      if (!bar || !hasDrillChild(bar)) return;
      trail.push({ title: bar.label || bar.id, level: bar.child });
      closeModal();
      paintViewport();
    }

    function goToTrailIndex(idx) {
      if (idx < 0 || idx >= trail.length - 1) return;
      trail = trail.slice(0, idx + 1);
      paintViewport();
    }

    if (bcEl) {
      bcEl.addEventListener('click', function (ev) {
        var t = ev.target;
        if (t && t.getAttribute && t.hasAttribute('data-ks-nrm-bc-idx')) {
          var idx = parseInt(t.getAttribute('data-ks-nrm-bc-idx'), 10);
          goToTrailIndex(idx);
        }
      });
    }
    if (btnUp) {
      btnUp.addEventListener('click', function () {
        if (trail.length > 1) {
          trail.pop();
          paintViewport();
        }
      });
    }
    if (btnRoot) {
      btnRoot.addEventListener('click', function () {
        if (trail.length > 1) {
          trail = [trail[0]];
          paintViewport();
        }
      });
    }
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (drillBtn) drillBtn.addEventListener('click', drillFromModal);
    backdrop.addEventListener('click', function (ev) {
      if (ev.target === backdrop) closeModal();
    });

    paintViewport();
  }

  function boot() {
    var roots = document.querySelectorAll('[data-ks-nested-roadmap], [data-ks-roadmap]');
    for (var i = 0; i < roots.length; i++) {
      if (roots[i].getAttribute('data-ks-roadmap-editable')) continue;
      mountRoadmap(roots[i]);
    }
  }

  window.KsRoadmapGrid = {
    renderGridHTML: renderGridHTML,
    hasDrillChild: hasDrillChild,
    barGridColumn: barGridColumn,
    esc: esc,
    escAttr: escAttr,
    TONES: TONES,
    biHash: biHash,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
