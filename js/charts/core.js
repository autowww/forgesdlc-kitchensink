/**
 * Forge Charts Core — shared tokens and SVG helpers for KS BI chart modules.
 */
(function (global) {
  'use strict';

  var MUTED = 'var(--forge-muted,#94a3b8)';
  var GRID = 'rgba(148,163,184,0.22)';
  var BAR_CYAN = 'rgba(6,182,212,0.85)';
  var BAR_CYAN2 = 'rgba(6,182,212,0.88)';
  var BAR_AMBER = 'rgba(245,158,11,0.88)';
  var DONUT_COLORS = [
    'rgba(6,182,212,0.92)', 'rgba(245,158,11,0.9)', 'rgba(148,163,184,0.9)',
    'rgba(34,197,94,0.85)', 'rgba(168,85,247,0.85)', 'rgba(236,72,153,0.85)',
    'rgba(59,130,246,0.88)', 'rgba(234,179,8,0.88)'
  ];

  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function emptyMsg(text) {
    return '<p class="forge-support mb-0">' + esc(text || 'No data.') + '</p>';
  }

  function svgOpen(w, h, label) {
    var aria = label ? ' role="img" aria-label="' + esc(label) + '"' : ' role="img"';
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '"' + aria +
      ' style="width:100%;max-width:' + w + 'px;height:auto">' +
      '<rect width="100%" height="100%" fill="transparent"/>';
  }

  function linearScale(domainMin, domainMax, rangeMin, rangeMax) {
    var span = domainMax - domainMin || 1;
    return function (v) {
      var t = (v - domainMin) / span;
      return rangeMin + t * (rangeMax - rangeMin);
    };
  }

  function niceMax(val) {
    if (!val || val <= 0) return 1;
    var pow = Math.pow(10, Math.floor(Math.log10(val)));
    var norm = val / pow;
    var nice = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10;
    return nice * pow;
  }

  global.ForgeChartsCore = {
    esc: esc,
    MUTED: MUTED,
    GRID: GRID,
    BAR_CYAN: BAR_CYAN,
    BAR_CYAN2: BAR_CYAN2,
    BAR_AMBER: BAR_AMBER,
    DONUT_COLORS: DONUT_COLORS,
    emptyMsg: emptyMsg,
    svgOpen: svgOpen,
    linearScale: linearScale,
    niceMax: niceMax
  };
})(typeof window !== 'undefined' ? window : this);
