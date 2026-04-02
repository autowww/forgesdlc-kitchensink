/**
 * Forge data charts — client-side SVG from JSON (lenses API or static payloads).
 * See forge-data-charts.md for the JSON contract.
 */
(function (global) {
  'use strict';

  var MUTED = 'var(--forge-muted,#94a3b8)';
  var GRID = 'rgba(148,163,184,0.22)';
  var BAR_CYAN = 'rgba(6,182,212,0.85)';
  var BAR_CYAN2 = 'rgba(6,182,212,0.88)';
  var BAR_AMBER = 'rgba(245,158,11,0.88)';

  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function setLoading(el, on) {
    if (!el) return;
    if (on) {
      el.innerHTML = '<p class="forge-support ks-chart-loading mb-0">Loading chart…</p>';
      el.setAttribute('data-ks-chart-state', 'loading');
    }
  }

  function renderCommitWeekly(data, opts) {
    var series = (data && data.series) || [];
    if (!series.length) {
      return '<p class="forge-support mb-0">No commits in the last 90 days.</p>';
    }
    var w = (opts && opts.width) || 720;
    var h = (opts && opts.height) || 200;
    var values = series.map(function (r) { return +r.count; });
    var labels = series.map(function (r) { return String(r.week || ''); });
    var vmax = Math.max.apply(null, values.concat([1]));
    var n = values.length;
    var marginL = 44, marginR = 12, marginT = 26, marginB = 28;
    var innerW = w - marginL - marginR;
    var innerH = h - marginT - marginB;
    var bw = Math.max(2, (innerW / n) * 0.72);
    var gap = Math.max(0.5, (innerW / n) * 0.28);
    var yBase = marginT + innerH;
    var parts = [
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="Commits by week" style="width:100%;max-width:' + w + 'px;height:auto">',
      '<rect width="100%" height="100%" fill="transparent"/>'
    ];
    function yForCount(c) {
      if (vmax <= 0) return yBase;
      return marginT + innerH - (c / vmax) * innerH;
    }
    var half = vmax > 1 ? Math.floor(vmax / 2) : 0;
    var tickSpecs = [[vmax, yForCount(vmax)], [half, yForCount(half)], [0, yBase]];
    var drawn = {};
    tickSpecs.forEach(function (spec) {
      var tval = spec[0], yp = spec[1];
      var key = Math.round(yp * 10) / 10;
      if (drawn[key]) return;
      drawn[key] = 1;
      parts.push('<line x1="' + marginL.toFixed(1) + '" y1="' + yp.toFixed(1) + '" x2="' + (w - marginR).toFixed(1) + '" y2="' + yp.toFixed(1) + '" stroke="' + GRID + '" stroke-width="1"/>');
      parts.push('<line x1="' + (marginL - 4).toFixed(1) + '" y1="' + yp.toFixed(1) + '" x2="' + marginL.toFixed(1) + '" y2="' + yp.toFixed(1) + '" stroke="' + MUTED + '" stroke-width="1"/>');
      var ty = Math.min(yp + 3.5, yBase + 2);
      parts.push('<text x="' + (marginL - 6).toFixed(1) + '" y="' + ty.toFixed(1) + '" text-anchor="end" fill="' + MUTED + '" font-size="9">' + tval + '</text>');
    });
    for (var i = 0; i < n; i++) {
      var v = values[i];
      var x = marginL + i * (bw + gap) + gap * 0.25;
      var barH = vmax ? (v / vmax) * innerH : 0;
      var y = marginT + innerH - barH;
      var bh = Math.max(barH, 1);
      parts.push('<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + bh.toFixed(1) + '" fill="' + BAR_CYAN + '" rx="2"><title>' + esc(labels[i]) + ': ' + v + ' commits</title></rect>');
      var cx = x + bw / 2;
      var vy = y > marginT + 10 ? y - 3 : marginT + 10;
      parts.push('<text x="' + cx.toFixed(1) + '" y="' + vy.toFixed(1) + '" text-anchor="middle" fill="' + MUTED + '" font-size="9">' + v + '</text>');
    }
    var tickIdx = n > 2 ? [0, Math.floor(n / 2), n - 1] : [];
    for (var j = 0; j < tickIdx.length; j++) {
      var idx = tickIdx[j];
      if (idx < 0 || idx >= n) continue;
      var x2 = marginL + idx * (bw + gap) + gap * 0.25 + bw / 2;
      parts.push('<text x="' + x2.toFixed(1) + '" y="' + (h - 6) + '" text-anchor="middle" fill="' + MUTED + '" font-size="10">' + esc(labels[idx]) + '</text>');
    }
    parts.push('</svg>');
    return parts.join('');
  }

  function renderCommitDaily(data, opts) {
    var series = (data && data.series) || [];
    if (!series.length) {
      return '<p class="forge-support mb-0">No commits in the window.</p>';
    }
    var w0 = (opts && opts.width) || 520;
    var h = (opts && opts.height) || 200;
    var values = series.map(function (r) { return +r.count; });
    var labels = series.map(function (r) { return String(r.day || ''); });
    var vmax = Math.max.apply(null, values.concat([1]));
    var n = values.length;
    var marginL = 40, marginR = 12, marginT = 26, marginB = 36;
    /* Long windows (month/quarter): widen past default 520px so ~8px bars + gaps fit. */
    var w = Math.min(1600, Math.max(w0, marginL + marginR + n * 10 + 24));
    var innerW = w - marginL - marginR;
    var innerH = h - marginT - marginB;
    var bw = Math.max(8, (innerW / n) * 0.65);
    var gap = Math.max(2, (innerW / n) * 0.35);
    var parts = [
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="Commits by day" style="width:100%;max-width:' + w + 'px;height:auto">',
      '<rect width="100%" height="100%" fill="transparent"/>'
    ];
    for (var i = 0; i < n; i++) {
      var v = values[i];
      var x = marginL + i * (bw + gap) + gap * 0.2;
      var barH = vmax ? (v / vmax) * innerH : 0;
      var y = marginT + innerH - barH;
      var bh = Math.max(barH, 1);
      var shortLbl = labels[i].length >= 10 ? labels[i].slice(5) : labels[i];
      parts.push('<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + bh.toFixed(1) + '" fill="' + BAR_CYAN2 + '" rx="2"><title>' + esc(labels[i]) + ': ' + v + ' commits</title></rect>');
      var cx = x + bw / 2;
      var vy = y > marginT + 10 ? y - 3 : marginT + 10;
      parts.push('<text x="' + cx.toFixed(1) + '" y="' + vy.toFixed(1) + '" text-anchor="middle" fill="' + MUTED + '" font-size="9">' + v + '</text>');
      parts.push('<text x="' + cx.toFixed(1) + '" y="' + (h - 8) + '" text-anchor="middle" fill="' + MUTED + '" font-size="9">' + esc(shortLbl) + '</text>');
    }
    parts.push('</svg>');
    return parts.join('');
  }

  function renderLocHorizontal(data, opts, color) {
    var rows = (data && data.rows) || [];
    if (!rows.length) {
      return '<p class="forge-support mb-0">No data.</p>';
    }
    var width = (opts && opts.width) || 680;
    var rowH = (opts && opts.row_height) || 26;
    var labelW = (opts && opts.label_width) || 168;
    var marginR = (opts && opts.margin_r) || 56;
    var barColor = color || BAR_CYAN2;
    var vals = rows.map(function (r) {
      return typeof r.value === 'number' ? r.value : (Array.isArray(r) ? +r[1] : +r.value);
    });
    var names = rows.map(function (r) {
      return typeof r.name === 'string' ? r.name : String(r[0] || '');
    });
    var vmax = Math.max.apply(null, vals.concat([1]));
    var n = rows.length;
    var height = 28 + n * rowH;
    var innerW = width - labelW - marginR - 16;
    var parts = [
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + width + ' ' + height + '" role="img" style="width:100%;max-width:' + width + 'px;height:auto">',
      '<rect width="100%" height="100%" fill="transparent"/>'
    ];
    for (var i = 0; i < n; i++) {
      var v = Math.max(0, vals[i] | 0);
      var y = 20 + i * rowH;
      var bw = vmax ? (v / vmax) * innerW : 0;
      bw = v > 0 ? Math.max(bw, 1) : 0;
      parts.push('<text x="4" y="' + (y + 14) + '" fill="' + MUTED + '" font-size="11" text-anchor="start">' + esc(names[i].slice(0, 48)) + '</text>');
      parts.push('<rect x="' + labelW.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + (rowH - 8) + '" fill="' + barColor + '" rx="3"><title>' + esc(names[i]) + ': ' + v + '</title></rect>');
      parts.push('<text x="' + (labelW + innerW + 6).toFixed(1) + '" y="' + (y + 14) + '" fill="' + MUTED + '" font-size="11">' + v + '</text>');
    }
    parts.push('</svg>');
    return parts.join('');
  }

  function renderComplianceBars(data, opts) {
    var rows = (data && data.rows) || [];
    if (!rows.length) {
      return '<p class="forge-support mb-0">No repositories to score.</p>';
    }
    var pairs = rows.map(function (r) {
      if (Array.isArray(r)) return [String(r[0]), +r[1]];
      return [String(r.name || ''), +r.score];
    });
    var width = (opts && opts.width) || 680;
    var rowH = (opts && opts.row_height) || 26;
    var labelW = (opts && opts.label_width) || 168;
    var marginR = 48;
    var n = pairs.length;
    var height = 28 + n * rowH;
    var innerW = width - labelW - marginR - 16;
    var parts = [
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + width + ' ' + height + '" role="img" style="width:100%;max-width:' + width + 'px;height:auto">',
      '<rect width="100%" height="100%" fill="transparent"/>'
    ];
    for (var i = 0; i < n; i++) {
      var name = pairs[i][0];
      var v = Math.max(0, Math.min(100, pairs[i][1] | 0));
      var y = 20 + i * rowH;
      var color = v >= 85 ? 'rgba(34,197,94,0.85)' : (v >= 55 ? 'rgba(245,158,11,0.88)' : 'rgba(239,68,68,0.75)');
      var bw = (v / 100) * innerW;
      bw = v > 0 ? Math.max(bw, 1) : 0;
      parts.push('<text x="4" y="' + (y + 14) + '" fill="' + MUTED + '" font-size="11">' + esc(name.slice(0, 48)) + '</text>');
      parts.push('<rect x="' + labelW.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + (rowH - 8) + '" fill="' + color + '" rx="3"/>');
      parts.push('<text x="' + (labelW + innerW + 6).toFixed(1) + '" y="' + (y + 14) + '" fill="' + MUTED + '" font-size="11">' + v + '</text>');
    }
    parts.push('</svg>');
    return parts.join('');
  }

  var DONUT_COLORS = [
    'rgba(6,182,212,0.92)', 'rgba(245,158,11,0.9)', 'rgba(148,163,184,0.9)',
    'rgba(34,197,94,0.85)', 'rgba(168,85,247,0.85)', 'rgba(236,72,153,0.85)',
    'rgba(59,130,246,0.88)', 'rgba(234,179,8,0.88)'
  ];

  function renderLocDonut(data) {
    var rowsIn = (data && data.rows) || [];
    var topN = (data && data.top_n) || 8;
    var pairs = rowsIn.map(function (r) {
      if (Array.isArray(r)) return [String(r[0]), Math.max(0, +r[1])];
      return [String(r.name || ''), Math.max(0, +r.value)];
    }).filter(function (p) { return p[1] > 0; });
    pairs.sort(function (a, b) { return b[1] - a[1]; });
    if (!pairs.length) {
      return '<p class="forge-support mb-0">No line counts for donut.</p>';
    }
    var totalAll = pairs.reduce(function (s, p) { return s + p[1]; }, 0);
    if (totalAll <= 0) {
      return '<p class="forge-support mb-0">No line counts for donut.</p>';
    }
    var top = pairs.slice(0, topN);
    var otherSum = pairs.slice(topN).reduce(function (s, p) { return s + p[1]; }, 0);
    var slices = [];
    for (var i = 0; i < top.length; i++) {
      slices.push({ name: top[i][0], val: top[i][1], fill: DONUT_COLORS[i % DONUT_COLORS.length] });
    }
    if (otherSum > 0) {
      slices.push({ name: 'Other', val: otherSum, fill: 'rgba(71,85,105,0.85)' });
    }
    var size = 240;
    var rOuter = 92;
    var rInner = 52;
    var cx = size / 2;
    var cy = size / 2;
    var parts = [
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + size + ' ' + size + '" role="img" style="width:100%;max-width:' + size + 'px;height:auto">',
      '<rect width="100%" height="100%" fill="transparent"/>'
    ];
    var ang = -Math.PI / 2;
    for (var j = 0; j < slices.length; j++) {
      var sl = slices[j];
      var frac = sl.val / totalAll;
      if (frac <= 0) continue;
      var sweep = 2 * Math.PI * frac;
      var a0 = ang;
      var a1 = ang + sweep;
      var x1o = cx + rOuter * Math.cos(a0);
      var y1o = cy + rOuter * Math.sin(a0);
      var x2o = cx + rOuter * Math.cos(a1);
      var y2o = cy + rOuter * Math.sin(a1);
      var x1i = cx + rInner * Math.cos(a1);
      var y1i = cy + rInner * Math.sin(a1);
      var x2i = cx + rInner * Math.cos(a0);
      var y2i = cy + rInner * Math.sin(a0);
      var large = sweep > Math.PI ? 1 : 0;
      var d = 'M ' + x1o.toFixed(2) + ' ' + y1o.toFixed(2) +
        ' A ' + rOuter + ' ' + rOuter + ' 0 ' + large + ' 1 ' + x2o.toFixed(2) + ' ' + y2o.toFixed(2) +
        ' L ' + x1i.toFixed(2) + ' ' + y1i.toFixed(2) +
        ' A ' + rInner + ' ' + rInner + ' 0 ' + large + ' 0 ' + x2i.toFixed(2) + ' ' + y2i.toFixed(2) + ' Z';
      var pct = (100 * frac).toFixed(1);
      parts.push('<path d="' + d + '" fill="' + sl.fill + '"><title>' + esc(sl.name) + ': ' + sl.val + ' lines (' + pct + '%)</title></path>');
      ang = a1;
    }
    parts.push('</svg>');
    var leg = ['<div class="lenses-overview-donut-legend small mt-2">'];
    for (var k = 0; k < slices.length; k++) {
      var s2 = slices[k];
      var pct2 = (100 * s2.val / totalAll).toFixed(1);
      leg.push(
        '<div class="d-flex align-items-center gap-2 mb-1">' +
        '<span class="lenses-overview-donut-swatch" style="background:' + s2.fill + '"></span>' +
        '<span>' + esc(s2.name.slice(0, 32)) + '</span>' +
        '<span class="text-muted ms-auto">' + pct2 + '%</span></div>'
      );
    }
    leg.push('</div>');
    return parts.join('') + '\n' + leg.join('');
  }

  function renderExtensionHeatmap(data) {
    var ext = (data && data.extensions) || [];
    var totalFiles = +(data && data.tracked_files) || 0;
    if (!ext.length || totalFiles <= 0) {
      return '<p class="forge-support mb-0">No tracked files.</p>';
    }
    var html = [];
    for (var i = 0; i < ext.length; i++) {
      var row = ext[i];
      var name = Array.isArray(row) ? row[0] : row.extension;
      var cnt = Array.isArray(row) ? +row[1] : +row.count;
      var pct = (100 * cnt / totalFiles);
      var wbar = Math.max(4, pct);
      html.push(
        '<div class="mb-2"><div class="d-flex justify-content-between small mb-1">' +
        '<span><code>' + esc(String(name)) + '</code></span><span>' + cnt + '</span></div>' +
        '<div class="lenses-ext-bar" style="width:' + wbar.toFixed(1) + '%"></div></div>'
      );
    }
    return html.join('');
  }

  function renderContributorsTable(data) {
    var rows = (data && data.rows) || [];
    if (!rows.length) {
      return '<p class="forge-support mb-0">No contributors.</p>';
    }
    var tr = rows.map(function (r) {
      var a = Array.isArray(r) ? r[0] : r.commits;
      var b = Array.isArray(r) ? r[1] : r.name;
      return '<tr><td>' + esc(String(a)) + '</td><td>' + esc(String(b)) + '</td></tr>';
    }).join('');
    return (
      '<div class="forge-table-wrap mt-2"><table class="table table-sm mb-0">' +
      '<thead><tr><th>Commits</th><th>Author</th></tr></thead><tbody>' + tr + '</tbody></table></div>'
    );
  }

  function renderSubmoduleLayout(data) {
    if (data && data.svg_fragment) {
      return data.svg_fragment;
    }
    return '<p class="forge-support mb-0">No submodule diagram.</p>';
  }

  var RENDERERS = {
    commit_weekly: renderCommitWeekly,
    commit_daily: renderCommitDaily,
    loc_added_horizontal: function (d, o) { return renderLocHorizontal(d, o, BAR_CYAN2); },
    loc_total_bars: function (d, o) { return renderLocHorizontal(d, o, BAR_AMBER); },
    loc_share_donut: renderLocDonut,
    compliance_bars: renderComplianceBars,
    extension_heatmap: renderExtensionHeatmap,
    contributors: renderContributorsTable,
    submodule_layout: renderSubmoduleLayout
  };

  function mount(container, spec) {
    if (!container) return;
    var kind = spec.kind;
    var opts = spec.options || {};
    function applyPayload(payload) {
      var fn = RENDERERS[kind];
      if (!fn) {
        container.innerHTML = '<p class="text-warning small">Unknown chart kind: ' + esc(kind) + '</p>';
        return;
      }
      try {
        container.innerHTML = fn(payload, opts);
        container.setAttribute('data-ks-chart-state', 'ready');
      } catch (e) {
        container.innerHTML = '<p class="text-danger small">Chart error</p>';
        container.setAttribute('data-ks-chart-state', 'error');
      }
    }
    if (spec.data) {
      applyPayload(spec.data);
      return;
    }
    if (spec.url) {
      setLoading(container, true);
      var u = spec.url;
      fetch(u, { credentials: 'same-origin', cache: 'no-store' })
        .then(function (r) {
          if (!r.ok) throw new Error('HTTP ' + r.status);
          return r.json();
        })
        .then(function (json) {
          var charts = json.charts || json;
          var payload = charts[kind] !== undefined ? charts[kind] : json;
          applyPayload(payload);
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
      var url = n.getAttribute('data-ks-chart-url');
      var inline = n.getAttribute('data-ks-chart-json');
      var spec = { kind: kind };
      if (inline) {
        try {
          spec.data = JSON.parse(inline);
        } catch (e) {
          n.innerHTML = '<p class="text-danger small">Bad data-ks-chart-json</p>';
          continue;
        }
      } else if (url) {
        spec.url = url;
      }
      mount(n, spec);
    }
  }

  global.ForgeDataCharts = {
    mount: mount,
    mountAll: mountAll,
    renderers: RENDERERS
  };
})(typeof window !== 'undefined' ? window : this);
