/**
 * Forge Charts Flow — waterfall, funnel.
 */
(function (global) {
  'use strict';

  var C = global.ForgeChartsCore || {};
  var esc = C.esc || function (s) { return String(s); };
  var MUTED = C.MUTED || '#94a3b8';
  var BAR_CYAN = C.BAR_CYAN || 'rgba(6,182,212,0.85)';
  var BAR_AMBER = C.BAR_AMBER || 'rgba(245,158,11,0.88)';
  var emptyMsg = C.emptyMsg || function (t) { return '<p>' + t + '</p>'; };
  var svgOpen = C.svgOpen || function (w, h) { return '<svg viewBox="0 0 ' + w + ' ' + h + '">'; };
  var niceMax = C.niceMax || function (v) { return v || 1; };

  function waterfall(data, opts) {
    var steps = (data && data.steps) || [];
    if (!steps.length) return emptyMsg('No waterfall data.');
    var w = (opts && opts.width) || 560;
    var h = (opts && opts.height) || 220;
    var mL = 44, mR = 12, mT = 24, mB = 40;
    var innerW = w - mL - mR, innerH = h - mT - mB;
    var running = 0;
    var anchors = steps.map(function (s) {
      var v = +s.value || 0;
      var start = s.type === 'total' ? 0 : running;
      if (s.type !== 'total') running += v;
      var end = s.type === 'total' ? v : running;
      return { name: String(s.name || ''), start: start, end: end, v: v, type: s.type };
    });
    var vals = anchors.reduce(function (a, s) { return a.concat([s.start, s.end]); }, []);
    var ymin = Math.min(0, Math.min.apply(null, vals));
    var ymax = niceMax(Math.max.apply(null, vals.concat([1])));
    var span = ymax - ymin || 1;
    var yScale = function (v) { return mT + innerH - ((v - ymin) / span) * innerH; };
    var n = anchors.length;
    var bw = Math.max(20, (innerW / n) * 0.6);
    var gap = (innerW / n) * 0.4;
    var parts = [svgOpen(w, h, 'Waterfall')];
    anchors.forEach(function (s, i) {
      var x = mL + i * (bw + gap);
      var yTop = yScale(Math.max(s.start, s.end));
      var yBot = yScale(Math.min(s.start, s.end));
      var color = s.type === 'total' ? BAR_CYAN : (s.v >= 0 ? 'rgba(34,197,94,0.85)' : 'rgba(239,68,68,0.75)');
      parts.push('<rect x="' + x.toFixed(1) + '" y="' + yTop.toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + Math.max(yBot - yTop, 1).toFixed(1) + '" fill="' + color + '" rx="2"><title>' + esc(s.name) + ': ' + s.v + '</title></rect>');
      parts.push('<text x="' + (x + bw / 2) + '" y="' + (h - 8) + '" text-anchor="middle" fill="' + MUTED + '" font-size="9">' + esc(s.name.slice(0, 8)) + '</text>');
    });
    parts.push('</svg>');
    return parts.join('');
  }

  function funnel(data, opts) {
    var stages = (data && data.stages) || [];
    if (!stages.length) return emptyMsg('No funnel data.');
    var w = (opts && opts.width) || 360;
    var h = (opts && opts.height) || 280;
    var maxVal = Math.max.apply(null, stages.map(function (s) { return +(s.value || s.count || 0); }).concat([1]));
    var stageH = (h - 40) / stages.length;
    var parts = [svgOpen(w, h, 'Funnel')];
    stages.forEach(function (s, i) {
      var v = +(s.value || s.count || 0);
      var name = String(s.name || s.stage || 'Stage ' + (i + 1));
      var frac = v / maxVal;
      var topW = w * (0.35 + frac * 0.55);
      var y = 20 + i * stageH;
      var x = (w - topW) / 2;
      parts.push('<polygon points="' + x.toFixed(1) + ',' + y + ' ' + (x + topW).toFixed(1) + ',' + y + ' ' + (x + topW * 0.88).toFixed(1) + ',' + (y + stageH - 4) + ' ' + (x + topW * 0.12).toFixed(1) + ',' + (y + stageH - 4) + '" fill="' + (i % 2 ? BAR_AMBER : BAR_CYAN) + '" opacity="0.9"><title>' + esc(name) + ': ' + v + '</title></polygon>');
      parts.push('<text x="' + (w / 2) + '" y="' + (y + stageH / 2 + 4) + '" text-anchor="middle" fill="#e2e8f0" font-size="11">' + esc(name.slice(0, 16)) + ' (' + v + ')</text>');
    });
    parts.push('</svg>');
    return parts.join('');
  }

  global.ForgeChartsFlow = {
    waterfall: waterfall,
    funnel: funnel,
    _demo: {
      waterfall: { steps: [{ name: 'Start', value: 100, type: 'total' }, { name: 'Add', value: 30 }, { name: 'Loss', value: -15 }, { name: 'End', value: 115, type: 'total' }] },
      funnel: { stages: [{ name: 'Visits', value: 1000 }, { name: 'Signups', value: 320 }, { name: 'Paid', value: 48 }] }
    }
  };
})(typeof window !== 'undefined' ? window : this);
