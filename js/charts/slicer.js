/**
 * Forge Charts Slicer — filter UI and shared slicer bus.
 */
(function (global) {
  'use strict';

  var C = global.ForgeChartsCore || {};
  var esc = C.esc || function (s) { return String(s); };
  var emptyMsg = C.emptyMsg || function (t) { return '<p>' + t + '</p>'; };

  var listeners = [];

  function renderSlicerList(spec) {
    var field = (spec && spec.field) || 'category';
    var options = (spec && spec.options) || [];
    var selected = (spec && spec.selected) || [];
    if (!options.length) return emptyMsg('No slicer options.');
    var items = options.map(function (opt) {
      var val = typeof opt === 'string' ? opt : String(opt.value || opt.label || '');
      var label = typeof opt === 'string' ? opt : String(opt.label || val);
      var checked = selected.indexOf(val) >= 0 ? ' checked' : '';
      return '<label class="forge-slicer-item d-flex align-items-center gap-2 mb-1">' +
        '<input type="checkbox" class="forge-slicer-check" data-field="' + esc(field) + '" value="' + esc(val) + '"' + checked + '/>' +
        '<span>' + esc(label) + '</span></label>';
    }).join('');
    return '<div class="forge-slicer forge-slicer-list" data-slicer-field="' + esc(field) + '">' + items + '</div>';
  }

  function renderSlicerDropdown(spec) {
    var field = (spec && spec.field) || 'category';
    var options = (spec && spec.options) || [];
    var selected = (spec && spec.selected) || '';
    if (!options.length) return emptyMsg('No slicer options.');
    var opts = options.map(function (opt) {
      var val = typeof opt === 'string' ? opt : String(opt.value || opt.label || '');
      var label = typeof opt === 'string' ? opt : String(opt.label || val);
      var sel = val === selected ? ' selected' : '';
      return '<option value="' + esc(val) + '"' + sel + '>' + esc(label) + '</option>';
    }).join('');
    return '<div class="forge-slicer forge-slicer-dropdown" data-slicer-field="' + esc(field) + '">' +
      '<select class="form-select form-select-sm forge-slicer-select" data-field="' + esc(field) + '">' + opts + '</select></div>';
  }

  function renderSlicerDateRange(spec) {
    var field = (spec && spec.field) || 'date';
    var start = (spec && spec.start) || '';
    var end = (spec && spec.end) || '';
    return (
      '<div class="forge-slicer forge-slicer-date d-flex gap-2 align-items-center" data-slicer-field="' + esc(field) + '">' +
      '<label class="small text-muted">From<input type="date" class="form-control form-control-sm forge-slicer-start" data-field="' + esc(field) + '" value="' + esc(start) + '"/></label>' +
      '<label class="small text-muted">To<input type="date" class="form-control form-control-sm forge-slicer-end" data-field="' + esc(field) + '" value="' + esc(end) + '"/></label>' +
      '</div>'
    );
  }

  function readSlicerValues(root) {
    var filters = {};
    if (!root) return filters;
    root.querySelectorAll('.forge-slicer-check:checked').forEach(function (el) {
      var f = el.getAttribute('data-field') || 'category';
      if (!filters[f]) filters[f] = [];
      filters[f].push(el.value);
    });
    root.querySelectorAll('.forge-slicer-select').forEach(function (el) {
      var f = el.getAttribute('data-field') || 'category';
      if (el.value) filters[f] = el.value;
    });
    root.querySelectorAll('.forge-slicer-date').forEach(function (wrap) {
      var f = wrap.getAttribute('data-slicer-field') || 'date';
      var s = wrap.querySelector('.forge-slicer-start');
      var e = wrap.querySelector('.forge-slicer-end');
      filters[f] = { start: s ? s.value : '', end: e ? e.value : '' };
    });
    return filters;
  }

  global.ForgeDataChartsSlicerBus = {
    filters: {},

    subscribe: function (fn) {
      if (typeof fn === 'function') listeners.push(fn);
      return function () {
        listeners = listeners.filter(function (l) { return l !== fn; });
      };
    },

    setFilter: function (field, value) {
      if (!field) return;
      this.filters[field] = value;
      listeners.forEach(function (fn) {
        try { fn(global.ForgeDataChartsSlicerBus.filters); } catch (e) { /* noop */ }
      });
    },

    applyToData: function (rows, fieldMap) {
      var filters = this.filters;
      var list = Array.isArray(rows) ? rows.slice() : [];
      if (!Object.keys(filters).length) return list;
      fieldMap = fieldMap || {};
      return list.filter(function (row) {
        for (var field in filters) {
          if (!Object.prototype.hasOwnProperty.call(filters, field)) continue;
          var val = filters[field];
          var key = fieldMap[field] || field;
          var cell = row[key];
          if (Array.isArray(val)) {
            if (val.length && val.indexOf(String(cell)) < 0) return false;
          } else if (val && typeof val === 'object' && (val.start || val.end)) {
            var d = String(cell || '');
            if (val.start && d < val.start) return false;
            if (val.end && d > val.end) return false;
          } else if (val != null && val !== '' && String(cell) !== String(val)) {
            return false;
          }
        }
        return true;
      });
    },

    mountSlicers: function (container, specs, onChange) {
      if (!container) return;
      var html = (specs || []).map(function (spec) {
        var kind = spec.kind || 'list';
        if (kind === 'dropdown') return renderSlicerDropdown(spec);
        if (kind === 'date') return renderSlicerDateRange(spec);
        return renderSlicerList(spec);
      }).join('');
      container.innerHTML = html;
      var bus = global.ForgeDataChartsSlicerBus;
      function sync() {
        bus.filters = readSlicerValues(container);
        if (typeof onChange === 'function') onChange(bus.filters);
        listeners.forEach(function (fn) {
          try { fn(bus.filters); } catch (e) { /* noop */ }
        });
      }
      container.addEventListener('change', sync);
      container.addEventListener('input', sync);
      sync();
    }
  };

  global.ForgeChartsSlicer = {
    renderSlicerList: renderSlicerList,
    renderSlicerDropdown: renderSlicerDropdown,
    renderSlicerDateRange: renderSlicerDateRange,
    _demo: {
      list: { field: 'repo', options: ['forge', 'bpw'], selected: ['forge'] },
      dropdown: { field: 'env', options: ['dev', 'prod'], selected: 'dev' }
    }
  };
})(typeof window !== 'undefined' ? window : this);
