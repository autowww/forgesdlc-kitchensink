/**
 * Forge Charts Distribution — histogram, box plot.
 */
(function (global) {
  'use strict';

  var C = global.ForgeChartsCore || {};
  var esc = C.esc || function (s) { return String(s); };
  var MUTED = C.MUTED || '#94a3b8';
  var GRID = C.GRID || 'rgba(148,163,184,0.22)';
  var BAR_CYAN = C.BAR_CYAN || 'rgba(6,182,212,0.85)';
  var emptyMsg = C.emptyMsg || function (t) { return '<p>' + t + '</p>'; };
  var svgOpen = C.svgOpen || function (w, h) { return '<svg viewBox="0 0 ' + w + ' ' + h + '">'; };
  var niceMax = C.niceMax || function (v) { return v || 1; };

  function histogram(data, opts) {
    var bins = (data && data.bins) || [];
    if (!bins.length) {
      var values = (data && data.values) || [];
      if (!values.length) return emptyMsg('No histogram data.');
      var min = Math.min.apply(null, values);
      var max = Math.max.apply(null, values);
      var count = (opts && opts.binCount) || 8;
      var step = (max - min) / count || 1;
      bins = [];
      for (var b = 0; b < count; b++) {
        var lo = min + b * step;
        var hi = lo + step;
        var freq = values.filter(function (v) { return v >= lo && (b === count - 1 ? v <= hi : v < hi); }).length;
        bins.push({ label: lo.toFixed(0) + '–' + hi.toFixed(0), count: freq });
      }
    }
    var w = (opts && opts.width) || 560;
    var h = (opts && opts.height) || 200;
    var mL = 44, mR = 12, mT = 20, mB = 36;
    var innerW = w - mL - mR, innerH = h - mT - mB;
    var vmax = niceMax(Math.max.apply(null, bins.map(function (b) { return +b.count; }).concat([1])));
    var n = bins.length;
    var bw = Math.max(4, (innerW / n) * 0.8);
    var gap = (innerW / n) * 0.2;
    var parts = [svgOpen(w, h, 'Histogram')];
    parts.push('<line x1="' + mL + '" y1="' + (mT + innerH) + '" x2="' + (w - mR) + '" y2="' + (mT + innerH) + '" stroke="' + GRID + '"/>');
    for (var i = 0; i < n; i++) {
      var v = +bins[i].count || 0;
      var x = mL + i * (bw + gap);
      var bh = vmax ? (v / vmax) * innerH : 0;
      var y = mT + innerH - bh;
      parts.push('<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + Math.max(bh, v > 0 ? 1 : 0).toFixed(1) + '" fill="' + BAR_CYAN + '" rx="1"><title>' + esc(bins[i].label || '') + ': ' + v + '</title></rect>');
      parts.push('<text x="' + (x + bw / 2) + '" y="' + (h - 8) + '" text-anchor="middle" fill="' + MUTED + '" font-size="8">' + esc(String(bins[i].label || '').slice(0, 8)) + '</text>');
    }
    parts.push('</svg>');
    return parts.join('');
  }

  function box_plot(data, opts) {
    var series = (data && data.series) || [];
    if (!series.length) return emptyMsg('No box plot data.');
    var w = (opts && opts.width) || 480;
    var h = (opts && opts.height) || 200;
    var mL = 48, mR = 12, mT = 20, mB = 32;
    var innerW = w - mL - mR, innerH = h - mT - mB;
    var all = [];
    series.forEach(function (s) { all.push(s.min, s.q1, s.median, s.q3, s.max); });
    var ymin = Math.min.apply(null, all);
    var ymax = niceMax(Math.max.apply(null, all));
    var yScale = function (v) { return mT + innerH - ((v - ymin) / (ymax - ymin || 1)) * innerH; };
    var slotW = innerW / series.length;
    var parts = [svgOpen(w, h, 'Box plot')];
    for (var i = 0; i < series.length; i++) {
      var s = series[i];
      var cx = mL + i * slotW + slotW / 2;
      var bw = Math.min(40, slotW * 0.5);
      var yQ1 = yScale(s.q1), yQ3 = yScale(s.q3), yMed = yScale(s.median);
      parts.push('<line x1="' + cx + '" y1="' + yScale(s.min).toFixed(1) + '" x2="' + cx + '" y2="' + yScale(s.max).toFixed(1) + '" stroke="' + MUTED + '" stroke-width="1"/>');
      parts.push('<rect x="' + (cx - bw / 2).toFixed(1) + '" y="' + yQ3.toFixed(1) + '" width="' + bw + '" height="' + Math.max(yQ1 - yQ3, 1).toFixed(1) + '" fill="rgba(6,182,212,0.35)" stroke="' + BAR_CYAN + '"/>');
      parts.push('<line x1="' + (cx - bw / 2) + '" y1="' + yMed.toFixed(1) + '" x2="' + (cx + bw / 2) + '" y2="' + yMed.toFixed(1) + '" stroke="#e2e8f0" stroke-width="2"/>');
      parts.push('<text x="' + cx + '" y="' + (h - 8) + '" text-anchor="middle" fill="' + MUTED + '" font-size="9">' + esc(String(s.name || 'S' + (i + 1)).slice(0, 10)) + '</text>');
    }
    parts.push('</svg>');
    return parts.join('');
  }

  global.ForgeChartsDistribution = {
    histogram: histogram,
    box_plot: box_plot,
    _demo: {
      histogram: { values: [2, 3, 3, 4, 5, 5, 5, 6, 7, 8, 9, 12] },
      box_plot: { series: [{ name: 'A', min: 2, q1: 4, median: 6, q3: 8, max: 11 }] }
    }
  };
})(typeof window !== 'undefined' ? window : this);
