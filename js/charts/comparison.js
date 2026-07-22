/**
 * Forge Charts Comparison — clustered and stacked bar/column charts.
 */
(function (global) {
  'use strict';

  var C = global.ForgeChartsCore || {};
  var esc = C.esc || function (s) { return String(s); };
  var MUTED = C.MUTED || '#94a3b8';
  var GRID = C.GRID || 'rgba(148,163,184,0.22)';
  var COLORS = C.DONUT_COLORS || ['rgba(6,182,212,0.92)'];
  var emptyMsg = C.emptyMsg || function (t) { return '<p>' + t + '</p>'; };
  var svgOpen = C.svgOpen || function (w, h) { return '<svg viewBox="0 0 ' + w + ' ' + h + '">'; };
  var niceMax = C.niceMax || function (v) { return v || 1; };

  function normalizeCategories(data) {
    if (data.categories && data.series) {
      return { categories: data.categories, series: data.series };
    }
    if (data.series && data.series.length && data.series[0].x !== undefined) {
      var cats = data.series.map(function (p) { return String(p.x); });
      return { categories: cats, series: [{ name: 'Series', values: data.series.map(function (p) { return +p.y; }) }] };
    }
    if (data.categories && data.values) {
      return { categories: data.categories, series: [{ name: 'Series', values: data.values.map(Number) }] };
    }
    return null;
  }

  function column_clustered(data, opts) {
    var norm = normalizeCategories(data);
    if (!norm || !norm.categories.length) return emptyMsg('No comparison data.');
    var cats = norm.categories;
    var series = norm.series;
    var w = (opts && opts.width) || 640;
    var h = (opts && opts.height) || 220;
    var mL = 44, mR = 12, mT = 24, mB = 36;
    var innerW = w - mL - mR, innerH = h - mT - mB;
    var vmax = niceMax(Math.max.apply(null, series.reduce(function (a, s) {
      return a.concat((s.values || []).map(Number));
    }, []).concat([1])));
    var n = cats.length, sc = series.length;
    var groupW = innerW / n;
    var barW = Math.max(4, (groupW / sc) * 0.7);
    var parts = [svgOpen(w, h, 'Clustered columns')];
    [0, vmax / 2, vmax].forEach(function (tv) {
      var yp = mT + innerH - (tv / vmax) * innerH;
      parts.push('<line x1="' + mL + '" y1="' + yp.toFixed(1) + '" x2="' + (w - mR) + '" y2="' + yp.toFixed(1) + '" stroke="' + GRID + '"/>');
      parts.push('<text x="' + (mL - 6) + '" y="' + (yp + 3) + '" text-anchor="end" fill="' + MUTED + '" font-size="9">' + Math.round(tv) + '</text>');
    });
    for (var i = 0; i < n; i++) {
      for (var s = 0; s < sc; s++) {
        var v = +(series[s].values || [])[i] || 0;
        var x = mL + i * groupW + s * barW + (groupW - sc * barW) / 2;
        var bh = vmax ? (v / vmax) * innerH : 0;
        var y = mT + innerH - bh;
        parts.push('<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + barW.toFixed(1) + '" height="' + Math.max(bh, v > 0 ? 1 : 0).toFixed(1) + '" fill="' + COLORS[s % COLORS.length] + '" rx="2"><title>' + esc(cats[i]) + ' / ' + esc(series[s].name || '') + ': ' + v + '</title></rect>');
      }
      parts.push('<text x="' + (mL + i * groupW + groupW / 2) + '" y="' + (h - 8) + '" text-anchor="middle" fill="' + MUTED + '" font-size="9">' + esc(String(cats[i]).slice(0, 10)) + '</text>');
    }
    parts.push('</svg>');
    return parts.join('');
  }

  function stackedBars(data, opts, vertical) {
    var cats = (data && data.categories) || [];
    var series = (data && data.series) || [];
    if (!cats.length || !series.length) return emptyMsg('No stacked data.');
    var w = (opts && opts.width) || 640;
    var h = (opts && opts.height) || 220;
    var mL = 44, mR = 12, mT = 24, mB = 36;
    var innerW = w - mL - mR, innerH = h - mT - mB;
    var totals = cats.map(function (_, i) {
      return series.reduce(function (s, ser) { return s + (+(ser.values || [])[i] || 0); }, 0);
    });
    var vmax = niceMax(Math.max.apply(null, totals.concat([1])));
    var pct100 = opts && opts.pct100;
    var n = cats.length;
    var barSpan = vertical ? innerW / n : innerH / n;
    var barThick = Math.max(6, barSpan * 0.65);
    var parts = [svgOpen(w, h, vertical ? 'Stacked columns' : 'Stacked bars')];
    for (var i = 0; i < n; i++) {
      var acc = 0;
      var denom = pct100 ? (totals[i] || 1) : vmax;
      for (var s = 0; s < series.length; s++) {
        var v = +(series[s].values || [])[i] || 0;
        var frac = denom ? v / denom : 0;
        if (vertical) {
          var x = mL + i * barSpan + (barSpan - barThick) / 2;
          var bh = frac * innerH;
          var y = mT + innerH - acc - bh;
          parts.push('<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + barThick.toFixed(1) + '" height="' + Math.max(bh, v > 0 ? 1 : 0).toFixed(1) + '" fill="' + COLORS[s % COLORS.length] + '" rx="1"><title>' + esc(cats[i]) + ': ' + v + '</title></rect>');
          acc += bh;
        } else {
          var y2 = mT + i * barSpan + (barSpan - barThick) / 2;
          var bw = frac * innerW;
          var x2 = mL + acc;
          parts.push('<rect x="' + x2.toFixed(1) + '" y="' + y2.toFixed(1) + '" width="' + Math.max(bw, v > 0 ? 1 : 0).toFixed(1) + '" height="' + barThick.toFixed(1) + '" fill="' + COLORS[s % COLORS.length] + '" rx="1"><title>' + esc(cats[i]) + ': ' + v + '</title></rect>');
          acc += bw;
        }
      }
      if (vertical) {
        parts.push('<text x="' + (mL + i * barSpan + barSpan / 2) + '" y="' + (h - 8) + '" text-anchor="middle" fill="' + MUTED + '" font-size="9">' + esc(String(cats[i]).slice(0, 10)) + '</text>');
      } else {
        parts.push('<text x="' + (mL - 6) + '" y="' + (mT + i * barSpan + barSpan / 2 + 4) + '" text-anchor="end" fill="' + MUTED + '" font-size="9">' + esc(String(cats[i]).slice(0, 12)) + '</text>');
      }
    }
    parts.push('</svg>');
    return parts.join('');
  }

  global.ForgeChartsComparison = {
    column_clustered: column_clustered,
    bar_stacked: function (d, o) { return stackedBars(d, o, false); },
    column_stacked: function (d, o) { return stackedBars(d, o, true); },
    bar_stacked_100: function (d, o) { return stackedBars(d, Object.assign({}, o || {}, { pct100: true }), false); },
    column_stacked_100: function (d, o) { return stackedBars(d, Object.assign({}, o || {}, { pct100: true }), true); },
    _demo: {
      column_clustered: { categories: ['Q1', 'Q2', 'Q3'], series: [{ name: 'A', values: [12, 18, 9] }, { name: 'B', values: [8, 14, 11] }] },
      bar_stacked: { categories: ['East', 'West'], series: [{ name: 'New', values: [40, 30] }, { name: 'Renew', values: [25, 35] }] }
    }
  };
})(typeof window !== 'undefined' ? window : this);
