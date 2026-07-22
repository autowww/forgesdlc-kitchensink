/**
 * Forge Charts Legacy — original forge-data-charts renderers.
 */
(function (global) {
  'use strict';

  var C = global.ForgeChartsCore || {};
  var esc = C.esc || function (s) { return String(s); };
  var MUTED = C.MUTED || '#94a3b8';
  var GRID = C.GRID || 'rgba(148,163,184,0.22)';
  var BAR_CYAN = C.BAR_CYAN || 'rgba(6,182,212,0.85)';
  var BAR_CYAN2 = C.BAR_CYAN2 || 'rgba(6,182,212,0.88)';
  var BAR_AMBER = C.BAR_AMBER || 'rgba(245,158,11,0.88)';
  var DONUT_COLORS = C.DONUT_COLORS || ['rgba(6,182,212,0.92)'];
  var emptyMsg = C.emptyMsg || function (t) { return '<p class="forge-support mb-0">' + t + '</p>'; };

  function commit_weekly(data, opts) {
    var series = (data && data.series) || [];
    if (!series.length) return emptyMsg('No commits in the last 90 days.');
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
    var parts = [C.svgOpen ? C.svgOpen(w, h, 'Commits by week') : '<svg>'];
    function yForCount(c) { return vmax <= 0 ? yBase : marginT + innerH - (c / vmax) * innerH; }
    var half = vmax > 1 ? Math.floor(vmax / 2) : 0;
    [[vmax, yForCount(vmax)], [half, yForCount(half)], [0, yBase]].forEach(function (spec) {
      var yp = spec[1];
      parts.push('<line x1="' + marginL + '" y1="' + yp.toFixed(1) + '" x2="' + (w - marginR) + '" y2="' + yp.toFixed(1) + '" stroke="' + GRID + '" stroke-width="1"/>');
      parts.push('<text x="' + (marginL - 6) + '" y="' + Math.min(yp + 3.5, yBase + 2).toFixed(1) + '" text-anchor="end" fill="' + MUTED + '" font-size="9">' + spec[0] + '</text>');
    });
    for (var i = 0; i < n; i++) {
      var v = values[i];
      var x = marginL + i * (bw + gap) + gap * 0.25;
      var barH = vmax ? (v / vmax) * innerH : 0;
      var y = marginT + innerH - barH;
      parts.push('<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + Math.max(barH, 1).toFixed(1) + '" fill="' + BAR_CYAN + '" rx="2"><title>' + esc(labels[i]) + ': ' + v + '</title></rect>');
      parts.push('<text x="' + (x + bw / 2).toFixed(1) + '" y="' + (y > marginT + 10 ? y - 3 : marginT + 10).toFixed(1) + '" text-anchor="middle" fill="' + MUTED + '" font-size="9">' + v + '</text>');
    }
    var tickIdx = n > 2 ? [0, Math.floor(n / 2), n - 1] : [];
    for (var j = 0; j < tickIdx.length; j++) {
      var idx = tickIdx[j];
      var x2 = marginL + idx * (bw + gap) + gap * 0.25 + bw / 2;
      parts.push('<text x="' + x2.toFixed(1) + '" y="' + (h - 6) + '" text-anchor="middle" fill="' + MUTED + '" font-size="10">' + esc(labels[idx]) + '</text>');
    }
    parts.push('</svg>');
    return parts.join('');
  }

  function commit_daily(data, opts) {
    var series = (data && data.series) || [];
    if (!series.length) return emptyMsg('No commits in the window.');
    var w0 = (opts && opts.width) || 520;
    var h = (opts && opts.height) || 200;
    var values = series.map(function (r) { return +r.count; });
    var labels = series.map(function (r) { return String(r.day || ''); });
    var vmax = Math.max.apply(null, values.concat([1]));
    var n = values.length;
    var marginL = 40, marginR = 12, marginT = 26, marginB = 36;
    var w = Math.min(1600, Math.max(w0, marginL + marginR + n * 10 + 24));
    var innerW = w - marginL - marginR;
    var innerH = h - marginT - marginB;
    var bw = Math.max(8, (innerW / n) * 0.65);
    var gap = Math.max(2, (innerW / n) * 0.35);
    var parts = [C.svgOpen ? C.svgOpen(w, h, 'Commits by day') : '<svg>'];
    for (var i = 0; i < n; i++) {
      var v = values[i];
      var x = marginL + i * (bw + gap) + gap * 0.2;
      var barH = vmax ? (v / vmax) * innerH : 0;
      var y = marginT + innerH - barH;
      var shortLbl = labels[i].length >= 10 ? labels[i].slice(5) : labels[i];
      parts.push('<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + Math.max(barH, 1).toFixed(1) + '" fill="' + BAR_CYAN2 + '" rx="2"><title>' + esc(labels[i]) + ': ' + v + '</title></rect>');
      parts.push('<text x="' + (x + bw / 2).toFixed(1) + '" y="' + (y > marginT + 10 ? y - 3 : marginT + 10).toFixed(1) + '" text-anchor="middle" fill="' + MUTED + '" font-size="9">' + v + '</text>');
      parts.push('<text x="' + (x + bw / 2).toFixed(1) + '" y="' + (h - 8) + '" text-anchor="middle" fill="' + MUTED + '" font-size="9">' + esc(shortLbl) + '</text>');
    }
    parts.push('</svg>');
    return parts.join('');
  }

  function locHorizontal(data, opts, color) {
    var rows = (data && data.rows) || [];
    if (!rows.length) return emptyMsg('No data.');
    var width = (opts && opts.width) || 680;
    var rowH = (opts && opts.row_height) || 26;
    var labelW = (opts && opts.label_width) || 168;
    var marginR = (opts && opts.margin_r) || 56;
    var barColor = color || BAR_CYAN2;
    var vals = rows.map(function (r) { return typeof r.value === 'number' ? r.value : (Array.isArray(r) ? +r[1] : +r.value); });
    var names = rows.map(function (r) { return typeof r.name === 'string' ? r.name : String(r[0] || ''); });
    var vmax = Math.max.apply(null, vals.concat([1]));
    var n = rows.length;
    var height = 28 + n * rowH;
    var innerW = width - labelW - marginR - 16;
    var parts = [C.svgOpen ? C.svgOpen(width, height, 'Horizontal bars') : '<svg>'];
    for (var i = 0; i < n; i++) {
      var v = Math.max(0, vals[i] | 0);
      var y = 20 + i * rowH;
      var bw = vmax ? Math.max((v / vmax) * innerW, v > 0 ? 1 : 0) : 0;
      parts.push('<text x="4" y="' + (y + 14) + '" fill="' + MUTED + '" font-size="11">' + esc(names[i].slice(0, 48)) + '</text>');
      parts.push('<rect x="' + labelW + '" y="' + y + '" width="' + bw.toFixed(1) + '" height="' + (rowH - 8) + '" fill="' + barColor + '" rx="3"><title>' + esc(names[i]) + ': ' + v + '</title></rect>');
      parts.push('<text x="' + (labelW + innerW + 6) + '" y="' + (y + 14) + '" fill="' + MUTED + '" font-size="11">' + v + '</text>');
    }
    parts.push('</svg>');
    return parts.join('');
  }

  function compliance_bars(data, opts) {
    var rows = (data && data.rows) || [];
    if (!rows.length) return emptyMsg('No repositories to score.');
    var pairs = rows.map(function (r) {
      return Array.isArray(r) ? [String(r[0]), +r[1]] : [String(r.name || ''), +r.score];
    });
    var width = (opts && opts.width) || 680;
    var rowH = (opts && opts.row_height) || 26;
    var labelW = (opts && opts.label_width) || 168;
    var marginR = 48;
    var n = pairs.length;
    var height = 28 + n * rowH;
    var innerW = width - labelW - marginR - 16;
    var parts = [C.svgOpen ? C.svgOpen(width, height, 'Compliance scores') : '<svg>'];
    for (var i = 0; i < n; i++) {
      var name = pairs[i][0];
      var v = Math.max(0, Math.min(100, pairs[i][1] | 0));
      var y = 20 + i * rowH;
      var color = v >= 85 ? 'rgba(34,197,94,0.85)' : (v >= 55 ? 'rgba(245,158,11,0.88)' : 'rgba(239,68,68,0.75)');
      var bw = v > 0 ? Math.max((v / 100) * innerW, 1) : 0;
      parts.push('<text x="4" y="' + (y + 14) + '" fill="' + MUTED + '" font-size="11">' + esc(name.slice(0, 48)) + '</text>');
      parts.push('<rect x="' + labelW + '" y="' + y + '" width="' + bw.toFixed(1) + '" height="' + (rowH - 8) + '" fill="' + color + '" rx="3"/>');
      parts.push('<text x="' + (labelW + innerW + 6) + '" y="' + (y + 14) + '" fill="' + MUTED + '" font-size="11">' + v + '</text>');
    }
    parts.push('</svg>');
    return parts.join('');
  }

  function loc_share_donut(data) {
    var rowsIn = (data && data.rows) || [];
    var topN = (data && data.top_n) || 8;
    var pairs = rowsIn.map(function (r) {
      return Array.isArray(r) ? [String(r[0]), Math.max(0, +r[1])] : [String(r.name || ''), Math.max(0, +r.value)];
    }).filter(function (p) { return p[1] > 0; });
    pairs.sort(function (a, b) { return b[1] - a[1]; });
    if (!pairs.length) return emptyMsg('No line counts for donut.');
    var totalAll = pairs.reduce(function (s, p) { return s + p[1]; }, 0);
    if (totalAll <= 0) return emptyMsg('No line counts for donut.');
    var top = pairs.slice(0, topN);
    var otherSum = pairs.slice(topN).reduce(function (s, p) { return s + p[1]; }, 0);
    var slices = [];
    for (var i = 0; i < top.length; i++) {
      slices.push({ name: top[i][0], val: top[i][1], fill: DONUT_COLORS[i % DONUT_COLORS.length] });
    }
    if (otherSum > 0) slices.push({ name: 'Other', val: otherSum, fill: 'rgba(71,85,105,0.85)' });
    var size = 240, rOuter = 92, rInner = 52, cx = size / 2, cy = size / 2;
    var parts = [C.svgOpen ? C.svgOpen(size, size, 'Share donut') : '<svg>'];
    var ang = -Math.PI / 2;
    for (var j = 0; j < slices.length; j++) {
      var sl = slices[j];
      var frac = sl.val / totalAll;
      if (frac <= 0) continue;
      var sweep = 2 * Math.PI * frac;
      var a0 = ang, a1 = ang + sweep;
      var x1o = cx + rOuter * Math.cos(a0), y1o = cy + rOuter * Math.sin(a0);
      var x2o = cx + rOuter * Math.cos(a1), y2o = cy + rOuter * Math.sin(a1);
      var x1i = cx + rInner * Math.cos(a1), y1i = cy + rInner * Math.sin(a1);
      var x2i = cx + rInner * Math.cos(a0), y2i = cy + rInner * Math.sin(a0);
      var large = sweep > Math.PI ? 1 : 0;
      var d = 'M ' + x1o.toFixed(2) + ' ' + y1o.toFixed(2) + ' A ' + rOuter + ' ' + rOuter + ' 0 ' + large + ' 1 ' + x2o.toFixed(2) + ' ' + y2o.toFixed(2) +
        ' L ' + x1i.toFixed(2) + ' ' + y1i.toFixed(2) + ' A ' + rInner + ' ' + rInner + ' 0 ' + large + ' 0 ' + x2i.toFixed(2) + ' ' + y2i.toFixed(2) + ' Z';
      parts.push('<path d="' + d + '" fill="' + sl.fill + '"><title>' + esc(sl.name) + ': ' + sl.val + '</title></path>');
      ang = a1;
    }
    parts.push('</svg>');
    var leg = ['<div class="lenses-overview-donut-legend small mt-2">'];
    for (var k = 0; k < slices.length; k++) {
      var s2 = slices[k];
      var pct2 = (100 * s2.val / totalAll).toFixed(1);
      leg.push('<div class="d-flex align-items-center gap-2 mb-1"><span class="lenses-overview-donut-swatch" style="background:' + s2.fill + '"></span><span>' + esc(s2.name.slice(0, 32)) + '</span><span class="text-muted ms-auto">' + pct2 + '%</span></div>');
    }
    leg.push('</div>');
    return parts.join('') + '\n' + leg.join('');
  }

  function extension_heatmap(data) {
    var ext = (data && data.extensions) || [];
    var totalFiles = +(data && data.tracked_files) || 0;
    if (!ext.length || totalFiles <= 0) return emptyMsg('No tracked files.');
    var html = [];
    for (var i = 0; i < ext.length; i++) {
      var row = ext[i];
      var name = Array.isArray(row) ? row[0] : row.extension;
      var cnt = Array.isArray(row) ? +row[1] : +row.count;
      var pct = (100 * cnt / totalFiles);
      html.push('<div class="mb-2"><div class="d-flex justify-content-between small mb-1"><span><code>' + esc(String(name)) + '</code></span><span>' + cnt + '</span></div><div class="lenses-ext-bar" style="width:' + Math.max(4, pct).toFixed(1) + '%"></div></div>');
    }
    return html.join('');
  }

  function contributors(data) {
    var rows = (data && data.rows) || [];
    if (!rows.length) return emptyMsg('No contributors.');
    var tr = rows.map(function (r) {
      var a = Array.isArray(r) ? r[0] : r.commits;
      var b = Array.isArray(r) ? r[1] : r.name;
      return '<tr><td>' + esc(String(a)) + '</td><td>' + esc(String(b)) + '</td></tr>';
    }).join('');
    return '<div class="forge-table-wrap mt-2"><table class="table table-sm mb-0"><thead><tr><th>Commits</th><th>Author</th></tr></thead><tbody>' + tr + '</tbody></table></div>';
  }

  function submodule_layout(data) {
    if (data && data.svg_fragment) return data.svg_fragment;
    return emptyMsg('No submodule diagram.');
  }

  function matrix_heatmap(data) {
    var rows = (data && data.rows) || [];
    var cols = (data && data.cols) || [];
    var cells = (data && data.cells) || [];
    var label = (data && data.ariaLabel) || 'Matrix heatmap';
    if (!rows.length || !cols.length) return emptyMsg('No matrix data.');
    var maxVal = 0;
    for (var ri = 0; ri < cells.length; ri++) {
      var rowCells = cells[ri] || [];
      for (var ci = 0; ci < rowCells.length; ci++) maxVal = Math.max(maxVal, +rowCells[ci] || 0);
    }
    if (maxVal <= 0) return emptyMsg('No matrix values.');
    var cellW = 36, cellH = 28, labelW = 88, headerH = 52;
    var w = labelW + cols.length * cellW + 12;
    var h = headerH + rows.length * cellH + 12;
    var parts = [C.svgOpen ? C.svgOpen(w, h, label) : '<svg>'];
    for (var c = 0; c < cols.length; c++) {
      var hx = labelW + c * cellW + cellW / 2;
      parts.push('<text x="' + hx + '" y="14" text-anchor="middle" fill="' + MUTED + '" font-size="8" transform="rotate(-35 ' + hx + ' 14)">' + esc(String(cols[c]).slice(0, 14)) + '</text>');
    }
    for (var r = 0; r < rows.length; r++) {
      var y = headerH + r * cellH;
      parts.push('<text x="' + (labelW - 6) + '" y="' + (y + cellH * 0.62) + '" text-anchor="end" fill="' + MUTED + '" font-size="9">' + esc(String(rows[r]).slice(0, 12)) + '</text>');
      var rowCells2 = cells[r] || [];
      for (var c2 = 0; c2 < cols.length; c2++) {
        var val = +(rowCells2[c2] || 0);
        var intensity = val / maxVal;
        var fill = 'rgba(6,182,212,' + (0.12 + intensity * 0.78).toFixed(2) + ')';
        var x = labelW + c2 * cellW;
        parts.push('<rect x="' + x + '" y="' + y + '" width="' + (cellW - 2) + '" height="' + (cellH - 2) + '" fill="' + fill + '" rx="2"><title>' + esc(rows[r]) + ' × ' + esc(cols[c2]) + ': ' + val + '</title></rect>');
        if (val > 0) parts.push('<text x="' + (x + cellW / 2) + '" y="' + (y + cellH * 0.62) + '" text-anchor="middle" fill="#e2e8f0" font-size="8">' + val + '</text>');
      }
    }
    parts.push('</svg>');
    return parts.join('');
  }

  global.ForgeChartsLegacy = {
    commit_weekly: commit_weekly,
    commit_daily: commit_daily,
    loc_added_horizontal: function (d, o) { return locHorizontal(d, o, BAR_CYAN2); },
    loc_total_bars: function (d, o) { return locHorizontal(d, o, BAR_AMBER); },
    loc_share_donut: loc_share_donut,
    compliance_bars: compliance_bars,
    extension_heatmap: extension_heatmap,
    matrix_heatmap: matrix_heatmap,
    contributors: contributors,
    submodule_layout: submodule_layout
  };
})(typeof window !== 'undefined' ? window : this);
