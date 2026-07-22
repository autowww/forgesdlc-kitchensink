/**
 * Forge data charts — registry + mount lifecycle (modules in js/charts/*).
 * See forge-data-charts.md for the JSON contract.
 */
(function (global) {
  'use strict';

  function mergeRenderers() {
    var out = {};
    var mods = [
      global.ForgeChartsLegacy,
      global.ForgeChartsComparison,
      global.ForgeChartsTrend,
      global.ForgeChartsPartToWhole,
      global.ForgeChartsDistribution,
      global.ForgeChartsFlow,
      global.ForgeChartsCorrelation,
      global.ForgeChartsKpi,
      global.ForgeChartsTable
    ];
    mods.forEach(function (m) {
      if (!m) return;
      Object.keys(m).forEach(function (k) { out[k] = m[k]; });
    });
    var S = global.ForgeChartsSlicer;
    if (S) {
      out.slicer_list = function (data) {
        return S.renderSlicerList({
          field: data.field || 'category',
          options: data.values || data.options || [],
          selected: data.selected || []
        });
      };
      out.slicer_dropdown = function (data) {
        return S.renderSlicerDropdown({
          field: data.field || 'category',
          options: data.values || data.options || [],
          selected: data.selected || ''
        });
      };
      out.slicer_date_range = function (data) {
        return S.renderSlicerDateRange({
          field: data.field || 'date',
          start: data.start || '',
          end: data.end || ''
        });
      };
    }
    return out;
  }

  var RENDERERS = mergeRenderers();

  function setLoading(el, on) {
    if (!el) return;
    if (on) {
      el.innerHTML = '<p class="forge-support ks-chart-loading mb-0">Loading chart…</p>';
      el.setAttribute('data-ks-chart-state', 'loading');
    }
  }

  function mount(container, spec) {
    if (!container) return;
    var kind = (spec && spec.kind) || container.getAttribute('data-ks-chart-kind') || '';
    var fn = RENDERERS[kind];
    var opts = (spec && spec.options) || {};
    var group = container.getAttribute('data-ks-chart-group') || '';

    function applyPayload(payload) {
      if (!fn) {
        container.innerHTML = '<p class="text-warning small">Unknown chart kind: ' + kind + '</p>';
        container.setAttribute('data-ks-chart-state', 'error');
        return;
      }
      try {
        var bus = global.ForgeDataChartsSlicerBus;
        if (bus && group && payload && Array.isArray(payload.series) && bus.filters && Object.keys(bus.filters).length) {
          var filtered = Object.assign({}, payload);
          filtered.series = bus.applyToData(payload.series, { region: 'region', day: 'day', product: 'product' });
          payload = filtered;
        }
        container.innerHTML = fn(payload, opts);
        container.setAttribute('data-ks-chart-state', 'ready');
        if (kind.indexOf('slicer_') === 0 && global.ForgeDataChartsSlicerBus) {
          var field = (payload && payload.field) || 'category';
          container.querySelectorAll('input, select').forEach(function (el) {
            el.addEventListener('change', function () {
              var filters = {};
              if (kind === 'slicer_list') {
                var vals = [];
                container.querySelectorAll('.forge-slicer-check:checked').forEach(function (cb) { vals.push(cb.value); });
                filters[field] = vals;
              } else if (kind === 'slicer_dropdown') {
                var sel = container.querySelector('select');
                if (sel) filters[field] = sel.value;
              } else if (kind === 'slicer_date_range') {
                var s = container.querySelector('.forge-slicer-start');
                var e2 = container.querySelector('.forge-slicer-end');
                filters[field] = { start: s ? s.value : '', end: e2 ? e2.value : '' };
              }
              global.ForgeDataChartsSlicerBus.filters = filters;
              document.querySelectorAll('[data-ks-chart-group="' + group + '"][data-ks-chart-kind]').forEach(function (node) {
                if ((node.getAttribute('data-ks-chart-kind') || '').indexOf('slicer_') === 0) return;
                var inline = node.getAttribute('data-ks-chart-json');
                var url = node.getAttribute('data-ks-chart-url');
                var ckind = node.getAttribute('data-ks-chart-kind');
                if (inline) {
                  try { mount(node, { kind: ckind, data: JSON.parse(inline) }); } catch (e) { /* noop */ }
                } else if (url) {
                  mount(node, { kind: ckind, url: url });
                }
              });
            });
          });
        }
      } catch (e) {
        container.innerHTML = '<p class="text-danger small">Chart error</p>';
        container.setAttribute('data-ks-chart-state', 'error');
      }
    }

    if (spec && spec.data) { applyPayload(spec.data); return; }
    if (spec && spec.url) {
      setLoading(container, true);
      fetch(spec.url, { credentials: 'same-origin', cache: 'no-store' })
        .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
        .then(function (json) {
          var charts = json.charts || json;
          applyPayload(charts[kind] !== undefined ? charts[kind] : json);
        })
        .catch(function () {
          container.innerHTML = '<p class="text-danger small">Failed to load chart data.</p>';
          container.setAttribute('data-ks-chart-state', 'error');
        });
      return;
    }
    container.innerHTML = '<p class="text-warning small">mountChart: need data or url</p>';
  }

  function mountAll(root) {
    var el = root || document;
    var nodes = el.querySelectorAll('[data-ks-chart][data-ks-chart-kind]');
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      var kind = n.getAttribute('data-ks-chart-kind') || '';
      var spec = { kind: kind };
      var inline = n.getAttribute('data-ks-chart-json');
      var url = n.getAttribute('data-ks-chart-url');
      if (inline) {
        try { spec.data = JSON.parse(inline); } catch (e) { n.innerHTML = '<p class="text-danger small">Bad data-ks-chart-json</p>'; continue; }
      } else if (url) { spec.url = url; }
      mount(n, spec);
    }
  }

  global.ForgeDataCharts = { mount: mount, mountAll: mountAll, renderers: RENDERERS, SlicerBus: global.ForgeDataChartsSlicerBus };
})(typeof window !== 'undefined' ? window : this);
