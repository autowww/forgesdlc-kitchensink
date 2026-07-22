/**
 * Forge Charts Trend — line, area, combo, ribbon.
 */
(function (global) {
  'use strict';

  var C = global.ForgeChartsCore || {};
  var esc = C.esc || function (s) { return String(s); };
  var MUTED = C.MUTED || '#94a3b8';
  var GRID = C.GRID || 'rgba(148,163,184,0.22)';
  var BAR_CYAN = C.BAR_CYAN || 'rgba(6,182,212,0.85)';
  var COLORS = C.DONUT_COLORS || ['rgba(6,182,212,0.92)'];
  var emptyMsg = C.emptyMsg || function (t) { return '<p>' + t + '</p>'; };
  var svgOpen = C.svgOpen || function (w, h) { return '<svg viewBox="0 0 ' + w + ' ' + h + '">'; };
  var niceMax = C.niceMax || function (v) { return v || 1; };
  var linearScale = C.linearScale || function (a, b, c, d) { return function (v) { return c + (v - a) / (b - a || 1) * (d - c); }; };

  function extractPoints(data) {
    var pts = (data && data.points) || (data && data.series) || [];
    if (!pts.length) return [];
    if (pts[0].x !== undefined) return pts.map(function (p) { return { x: String(p.x), y: +p.y }; });
    return pts.map(function (p, i) { return { x: String(i), y: +p }; });
  }

  function trendBase(data, opts, label) {
    var pts = extractPoints(data);
    if (!pts.length) return { empty: emptyMsg('No trend data.') };
    var w = (opts && opts.width) || 640;
    var h = (opts && opts.height) || 200;
    var mL = 44, mR = 12, mT = 20, mB = 32;
    var innerW = w - mL - mR, innerH = h - mT - mB;
    var ymax = niceMax(Math.max.apply(null, pts.map(function (p) { return p.y; }).concat([1])));
    var xScale = linearScale(0, Math.max(pts.length - 1, 1), mL, mL + innerW);
    var yScale = linearScale(0, ymax, mT + innerH, mT);
    return { pts: pts, w: w, h: h, mL: mL, mR: mR, mT: mT, mB: mB, innerH: innerH, ymax: ymax, xScale: xScale, yScale: yScale, label: label };
  }

  function line(data, opts) {
    var b = trendBase(data, opts, 'Line chart');
    if (b.empty) return b.empty;
    var parts = [svgOpen(b.w, b.h, b.label)];
    parts.push('<line x1="' + b.mL + '" y1="' + (b.mT + b.innerH) + '" x2="' + (b.w - b.mR) + '" y2="' + (b.mT + b.innerH) + '" stroke="' + GRID + '"/>');
    var d = b.pts.map(function (p, i) {
      return (i ? 'L' : 'M') + ' ' + b.xScale(i).toFixed(1) + ' ' + b.yScale(p.y).toFixed(1);
    }).join(' ');
    parts.push('<path d="' + d + '" fill="none" stroke="' + BAR_CYAN + '" stroke-width="2"/>');
    b.pts.forEach(function (p, i) {
      parts.push('<circle cx="' + b.xScale(i).toFixed(1) + '" cy="' + b.yScale(p.y).toFixed(1) + '" r="3" fill="' + BAR_CYAN + '"><title>' + esc(p.x) + ': ' + p.y + '</title></circle>');
    });
    parts.push('</svg>');
    return parts.join('');
  }

  function area(data, opts) {
    var b = trendBase(data, opts, 'Area chart');
    if (b.empty) return b.empty;
    var baseY = b.mT + b.innerH;
    var lineD = b.pts.map(function (p, i) { return (i ? 'L' : 'M') + ' ' + b.xScale(i).toFixed(1) + ' ' + b.yScale(p.y).toFixed(1); }).join(' ');
    var areaD = lineD + ' L ' + b.xScale(b.pts.length - 1).toFixed(1) + ' ' + baseY + ' L ' + b.xScale(0).toFixed(1) + ' ' + baseY + ' Z';
    var parts = [svgOpen(b.w, b.h, b.label), '<path d="' + areaD + '" fill="rgba(6,182,212,0.25)" stroke="' + BAR_CYAN + '" stroke-width="1.5"/>', '</svg>'];
    return parts.join('');
  }

  function area_stacked(data, opts) {
    var series = (data && data.series) || [];
    var cats = (data && data.categories) || [];
    if (!series.length || !cats.length) return emptyMsg('No stacked area data.');
    var w = (opts && opts.width) || 640, h = (opts && opts.height) || 200;
    var mL = 44, mR = 12, mT = 20, mB = 32;
    var innerW = w - mL - mR, innerH = h - mT - mB;
    var stacks = cats.map(function (_, i) {
      return series.reduce(function (s, ser) { return s + (+(ser.values || [])[i] || 0); }, 0);
    });
    var ymax = niceMax(Math.max.apply(null, stacks.concat([1])));
    var xScale = linearScale(0, Math.max(cats.length - 1, 1), mL, mL + innerW);
    var yScale = linearScale(0, ymax, mT + innerH, mT);
    var parts = [svgOpen(w, h, 'Stacked area')];
    for (var s = series.length - 1; s >= 0; s--) {
      var acc = cats.map(function () { return 0; });
      for (var t = 0; t < s; t++) {
        for (var i = 0; i < cats.length; i++) acc[i] += +(series[t].values || [])[i] || 0;
      }
      var top = cats.map(function (_, i) { return acc[i] + (+(series[s].values || [])[i] || 0); });
      var bot = acc;
      var topD = top.map(function (v, i) { return (i ? 'L' : 'M') + ' ' + xScale(i).toFixed(1) + ' ' + yScale(v).toFixed(1); }).join(' ');
      var botD = bot.slice().reverse().map(function (v, ri) {
        var i = cats.length - 1 - ri;
        return 'L ' + xScale(i).toFixed(1) + ' ' + yScale(v).toFixed(1);
      }).join(' ');
      parts.push('<path d="' + topD + ' ' + botD + ' Z" fill="' + COLORS[s % COLORS.length] + '" opacity="0.75"/>');
    }
    parts.push('</svg>');
    return parts.join('');
  }

  function combo_line_column(data, opts) {
    var cats = (data && data.categories) || [];
    var bars = (data && data.bars) || [];
    var line = (data && data.line) || [];
    if (!cats.length) return emptyMsg('No combo data.');
    var w = (opts && opts.width) || 640, h = (opts && opts.height) || 220;
    var mL = 44, mR = 44, mT = 20, mB = 32;
    var innerW = w - mL - mR, innerH = h - mT - mB;
    var ymax = niceMax(Math.max.apply(null, bars.concat(line).concat([1])));
    var n = cats.length;
    var bw = Math.max(8, (innerW / n) * 0.5);
    var xScale = linearScale(0, Math.max(n - 1, 1), mL + bw / 2, mL + innerW - bw / 2);
    var yScale = linearScale(0, ymax, mT + innerH, mT);
    var parts = [svgOpen(w, h, 'Combo line column')];
    for (var i = 0; i < n; i++) {
      var v = +bars[i] || 0;
      var x = mL + i * (innerW / n) + (innerW / n - bw) / 2;
      var bh = ymax ? (v / ymax) * innerH : 0;
      parts.push('<rect x="' + x.toFixed(1) + '" y="' + (mT + innerH - bh).toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + Math.max(bh, 1).toFixed(1) + '" fill="' + BAR_CYAN + '" rx="2"/>');
    }
    var ld = line.map(function (v, i) { return (i ? 'L' : 'M') + ' ' + xScale(i).toFixed(1) + ' ' + yScale(+v || 0).toFixed(1); }).join(' ');
    parts.push('<path d="' + ld + '" fill="none" stroke="' + COLORS[1] + '" stroke-width="2"/>');
    parts.push('</svg>');
    return parts.join('');
  }

  function ribbon(data, opts) {
    var upper = (data && data.upper) || [];
    var lower = (data && data.lower) || [];
    if (!upper.length || upper.length !== lower.length) return emptyMsg('No ribbon data.');
    var w = (opts && opts.width) || 640, h = (opts && opts.height) || 200;
    var mL = 44, mR = 12, mT = 20, mB = 32;
    var innerW = w - mL - mR, innerH = h - mT - mB;
    var all = upper.concat(lower);
    var ymin = Math.min.apply(null, all);
    var ymax = niceMax(Math.max.apply(null, all));
    var xScale = linearScale(0, Math.max(upper.length - 1, 1), mL, mL + innerW);
    var yScale = linearScale(ymin, ymax, mT + innerH, mT);
    var topD = upper.map(function (v, i) { return (i ? 'L' : 'M') + ' ' + xScale(i).toFixed(1) + ' ' + yScale(v).toFixed(1); }).join(' ');
    var botD = lower.slice().reverse().map(function (v, ri) {
      var i = lower.length - 1 - ri;
      return 'L ' + xScale(i).toFixed(1) + ' ' + yScale(v).toFixed(1);
    }).join(' ');
    return svgOpen(w, h, 'Ribbon chart') + '<path d="' + topD + ' ' + botD + ' Z" fill="rgba(6,182,212,0.2)" stroke="' + BAR_CYAN + '" stroke-width="1"/>' + '</svg>';
  }

  global.ForgeChartsTrend = {
    line: line,
    area: area,
    area_stacked: area_stacked,
    combo_line_column: combo_line_column,
    ribbon: ribbon,
    _demo: { line: { points: [{ x: 'Jan', y: 4 }, { x: 'Feb', y: 7 }, { x: 'Mar', y: 5 }] } }
  };
})(typeof window !== 'undefined' ? window : this);
