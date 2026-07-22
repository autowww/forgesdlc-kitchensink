/**
 * Forge Charts Part-to-Whole — pie, donut, treemap.
 */
(function (global) {
  'use strict';

  var C = global.ForgeChartsCore || {};
  var esc = C.esc || function (s) { return String(s); };
  var MUTED = C.MUTED || '#94a3b8';
  var DONUT_COLORS = C.DONUT_COLORS || ['rgba(6,182,212,0.92)'];
  var emptyMsg = C.emptyMsg || function (t) { return '<p>' + t + '</p>'; };
  var svgOpen = C.svgOpen || function (w, h) { return '<svg viewBox="0 0 ' + w + ' ' + h + '">'; };

  function parseSlices(data) {
    var rows = (data && data.rows) || (data && data.slices) || [];
    return rows.map(function (r) {
      if (Array.isArray(r)) return { name: String(r[0]), val: Math.max(0, +r[1]) };
      return { name: String(r.name || r.label || ''), val: Math.max(0, +(r.value || r.val || 0)) };
    }).filter(function (s) { return s.val > 0; });
  }

  function arcSlices(slices, cx, cy, rOuter, rInner) {
    var total = slices.reduce(function (s, sl) { return s + sl.val; }, 0);
    if (total <= 0) return [];
    var ang = -Math.PI / 2;
    var paths = [];
    for (var j = 0; j < slices.length; j++) {
      var sl = slices[j];
      var frac = sl.val / total;
      var sweep = 2 * Math.PI * frac;
      var a0 = ang, a1 = ang + sweep;
      var x1o = cx + rOuter * Math.cos(a0), y1o = cy + rOuter * Math.sin(a0);
      var x2o = cx + rOuter * Math.cos(a1), y2o = cy + rOuter * Math.sin(a1);
      var large = sweep > Math.PI ? 1 : 0;
      var d;
      if (rInner > 0) {
        var x1i = cx + rInner * Math.cos(a1), y1i = cy + rInner * Math.sin(a1);
        var x2i = cx + rInner * Math.cos(a0), y2i = cy + rInner * Math.sin(a0);
        d = 'M ' + x1o.toFixed(2) + ' ' + y1o.toFixed(2) + ' A ' + rOuter + ' ' + rOuter + ' 0 ' + large + ' 1 ' + x2o.toFixed(2) + ' ' + y2o.toFixed(2) +
          ' L ' + x1i.toFixed(2) + ' ' + y1i.toFixed(2) + ' A ' + rInner + ' ' + rInner + ' 0 ' + large + ' 0 ' + x2i.toFixed(2) + ' ' + y2i.toFixed(2) + ' Z';
      } else {
        d = 'M ' + cx + ' ' + cy + ' L ' + x1o.toFixed(2) + ' ' + y1o.toFixed(2) + ' A ' + rOuter + ' ' + rOuter + ' 0 ' + large + ' 1 ' + x2o.toFixed(2) + ' ' + y2o.toFixed(2) + ' Z';
      }
      paths.push({ d: d, sl: sl, pct: (100 * frac).toFixed(1) });
      ang = a1;
    }
    return paths;
  }

  function pie(data) {
    var slices = parseSlices(data);
    if (!slices.length) return emptyMsg('No pie data.');
    var size = 220, cx = size / 2, cy = size / 2, r = 90;
    var parts = [svgOpen(size, size, 'Pie chart')];
    arcSlices(slices.map(function (s, i) {
      return { name: s.name, val: s.val, fill: DONUT_COLORS[i % DONUT_COLORS.length] };
    }), cx, cy, r, 0).forEach(function (p, i) {
      parts.push('<path d="' + p.d + '" fill="' + DONUT_COLORS[i % DONUT_COLORS.length] + '"><title>' + esc(p.sl.name) + ': ' + p.pct + '%</title></path>');
    });
    parts.push('</svg>');
    return parts.join('');
  }

  function donut(data) {
    var slices = parseSlices(data);
    if (!slices.length) return emptyMsg('No donut data.');
    var size = 240, cx = size / 2, cy = size / 2;
    var parts = [svgOpen(size, size, 'Donut chart')];
    arcSlices(slices, cx, cy, 92, 52).forEach(function (p, i) {
      parts.push('<path d="' + p.d + '" fill="' + DONUT_COLORS[i % DONUT_COLORS.length] + '"><title>' + esc(p.sl.name) + ': ' + p.pct + '%</title></path>');
    });
    var total = slices.reduce(function (s, sl) { return s + sl.val; }, 0);
    parts.push('<text x="' + cx + '" y="' + (cy + 4) + '" text-anchor="middle" fill="' + MUTED + '" font-size="14">' + total + '</text></svg>');
    return parts.join('');
  }

  function treemap(data) {
    var nodes = parseSlices(data);
    if (!nodes.length) return emptyMsg('No treemap data.');
    var w = 400, h = 240;
    var total = nodes.reduce(function (s, n) { return s + n.val; }, 0);
    var parts = [svgOpen(w, h, 'Treemap')];
    var x = 0, y = 0, rowH = h;
    nodes.forEach(function (n, i) {
      var frac = n.val / total;
      var nw = Math.max(20, w * frac);
      parts.push('<rect x="' + x.toFixed(1) + '" y="' + y + '" width="' + nw.toFixed(1) + '" height="' + rowH + '" fill="' + DONUT_COLORS[i % DONUT_COLORS.length] + '" stroke="#0A0E17" stroke-width="1"><title>' + esc(n.name) + ': ' + n.val + '</title></rect>');
      parts.push('<text x="' + (x + 4) + '" y="' + (y + 14) + '" fill="#e2e8f0" font-size="10">' + esc(n.name.slice(0, 12)) + '</text>');
      x += nw;
    });
    parts.push('</svg>');
    return parts.join('');
  }

  var Legacy = global.ForgeChartsLegacy;
  global.ForgeChartsPartToWhole = {
    pie: pie,
    donut: donut,
    treemap: treemap,
    loc_share_donut: Legacy && Legacy.loc_share_donut ? Legacy.loc_share_donut : donut,
    _demo: { donut: { rows: [['Code', 420], ['Docs', 180], ['Tests', 95]] } }
  };
})(typeof window !== 'undefined' ? window : this);
