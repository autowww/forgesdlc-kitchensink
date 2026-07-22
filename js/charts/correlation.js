/**
 * Forge Charts Correlation — scatter, bubble.
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

  function parsePoints(data) {
    var pts = (data && data.points) || [];
    return pts.map(function (p) {
      return { x: +p.x, y: +p.y, z: +(p.z || p.size || 6), label: p.label || '' };
    }).filter(function (p) { return !isNaN(p.x) && !isNaN(p.y); });
  }

  function scatterBase(data, opts, label, bubble) {
    var pts = parsePoints(data);
    if (!pts.length) return { empty: emptyMsg('No scatter data.') };
    var w = (opts && opts.width) || 480;
    var h = (opts && opts.height) || 280;
    var mL = 48, mR = 16, mT = 20, mB = 40;
    var innerW = w - mL - mR, innerH = h - mT - mB;
    var xmin = Math.min.apply(null, pts.map(function (p) { return p.x; }));
    var xmax = niceMax(Math.max.apply(null, pts.map(function (p) { return p.x; })));
    var ymin = Math.min.apply(null, pts.map(function (p) { return p.y; }));
    var ymax = niceMax(Math.max.apply(null, pts.map(function (p) { return p.y; })));
    var xScale = linearScale(xmin, xmax, mL, mL + innerW);
    var yScale = linearScale(ymin, ymax, mT + innerH, mT);
    var zmax = Math.max.apply(null, pts.map(function (p) { return p.z; }).concat([1]));
    return { pts: pts, w: w, h: h, mL: mL, mT: mT, innerH: innerH, innerW: innerW, mR: mR, mB: mB, xScale: xScale, yScale: yScale, zmax: zmax, label: label, bubble: bubble };
  }

  function scatter(data, opts) {
    var b = scatterBase(data, opts, 'Scatter plot', false);
    if (b.empty) return b.empty;
    var parts = [svgOpen(b.w, b.h, b.label)];
    parts.push('<line x1="' + b.mL + '" y1="' + (b.mT + b.innerH) + '" x2="' + (b.w - b.mR) + '" y2="' + (b.mT + b.innerH) + '" stroke="' + GRID + '"/>');
    parts.push('<line x1="' + b.mL + '" y1="' + b.mT + '" x2="' + b.mL + '" y2="' + (b.mT + b.innerH) + '" stroke="' + GRID + '"/>');
    b.pts.forEach(function (p, i) {
      parts.push('<circle cx="' + b.xScale(p.x).toFixed(1) + '" cy="' + b.yScale(p.y).toFixed(1) + '" r="4" fill="' + COLORS[i % COLORS.length] + '"><title>' + esc(p.label || (p.x + ', ' + p.y)) + '</title></circle>');
    });
    parts.push('</svg>');
    return parts.join('');
  }

  function bubble(data, opts) {
    var b = scatterBase(data, opts, 'Bubble chart', true);
    if (b.empty) return b.empty;
    var parts = [svgOpen(b.w, b.h, b.label)];
    parts.push('<line x1="' + b.mL + '" y1="' + (b.mT + b.innerH) + '" x2="' + (b.w - b.mR) + '" y2="' + (b.mT + b.innerH) + '" stroke="' + GRID + '"/>');
    b.pts.forEach(function (p, i) {
      var r = 4 + (p.z / b.zmax) * 16;
      parts.push('<circle cx="' + b.xScale(p.x).toFixed(1) + '" cy="' + b.yScale(p.y).toFixed(1) + '" r="' + r.toFixed(1) + '" fill="' + COLORS[i % COLORS.length] + '" opacity="0.75" stroke="' + BAR_CYAN + '"><title>' + esc(p.label || '') + ': ' + p.z + '</title></circle>');
    });
    parts.push('</svg>');
    return parts.join('');
  }

  global.ForgeChartsCorrelation = {
    scatter: scatter,
    bubble: bubble,
    _demo: { scatter: { points: [{ x: 1, y: 2 }, { x: 3, y: 5 }, { x: 5, y: 4 }] }, bubble: { points: [{ x: 2, y: 3, z: 20 }, { x: 4, y: 6, z: 40 }] } }
  };
})(typeof window !== 'undefined' ? window : this);
