/**
 * Forge Charts KPI — cards, gauge, bullet, sparkline.
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

  function kpi_card(data) {
    if (!data || data.value === undefined) return emptyMsg('No KPI value.');
    var label = String(data.label || data.title || 'KPI');
    var value = data.value;
    var delta = data.delta != null ? String(data.delta) : '';
    var trend = data.trend || (delta.indexOf('-') === 0 ? 'down' : delta ? 'up' : '');
    var trendCls = trend === 'down' ? 'text-danger' : (trend === 'up' ? 'text-success' : 'text-muted');
    return (
      '<div class="forge-kpi-card p-3 border rounded" data-ks-chart="kpi">' +
      '<div class="small text-muted mb-1">' + esc(label) + '</div>' +
      '<div class="fs-3 fw-semibold">' + esc(String(value)) + '</div>' +
      (delta ? '<div class="small ' + trendCls + ' mt-1">' + esc(delta) + '</div>' : '') +
      '</div>'
    );
  }

  function gauge(data, opts) {
    var val = +(data && data.value);
    var min = +(data && data.min) || 0;
    var max = +(data && data.max) || 100;
    if (isNaN(val)) return emptyMsg('No gauge value.');
    var w = 200, h = 120, cx = w / 2, cy = h - 8, r = 72;
    var frac = Math.max(0, Math.min(1, (val - min) / (max - min || 1)));
    var start = Math.PI, end = 2 * Math.PI;
    var needleAng = start + frac * Math.PI;
    var nx = cx + (r - 12) * Math.cos(needleAng);
    var ny = cy + (r - 12) * Math.sin(needleAng);
    var parts = [svgOpen(w, h, 'Gauge')];
    parts.push('<path d="M ' + (cx - r) + ' ' + cy + ' A ' + r + ' ' + r + ' 0 0 1 ' + (cx + r) + ' ' + cy + '" fill="none" stroke="rgba(148,163,184,0.25)" stroke-width="10" stroke-linecap="round"/>');
    var arcEnd = start + frac * Math.PI;
    var x2 = cx + r * Math.cos(arcEnd), y2 = cy + r * Math.sin(arcEnd);
    parts.push('<path d="M ' + (cx - r) + ' ' + cy + ' A ' + r + ' ' + r + ' 0 ' + (frac > 0.5 ? 1 : 0) + ' 1 ' + x2.toFixed(1) + ' ' + y2.toFixed(1) + '" fill="none" stroke="' + BAR_CYAN + '" stroke-width="10" stroke-linecap="round"/>');
    parts.push('<line x1="' + cx + '" y1="' + cy + '" x2="' + nx.toFixed(1) + '" y2="' + ny.toFixed(1) + '" stroke="#e2e8f0" stroke-width="2"/>');
    parts.push('<text x="' + cx + '" y="' + (cy - 10) + '" text-anchor="middle" fill="' + MUTED + '" font-size="16">' + val + '</text></svg>');
    return parts.join('');
  }

  function bullet(data, opts) {
    var val = +(data && data.value);
    var target = +(data && data.target);
    var max = +(data && data.max) || 100;
    if (isNaN(val)) return emptyMsg('No bullet data.');
    var w = (opts && opts.width) || 320, h = 36;
    var mL = 8, mR = 8;
    var innerW = w - mL - mR;
    var parts = [svgOpen(w, h, 'Bullet chart')];
    parts.push('<rect x="' + mL + '" y="14" width="' + innerW + '" height="8" fill="rgba(148,163,184,0.2)" rx="2"/>');
    parts.push('<rect x="' + mL + '" y="14" width="' + (innerW * val / max).toFixed(1) + '" height="8" fill="' + BAR_CYAN + '" rx="2"/>');
    if (!isNaN(target)) {
      parts.push('<line x1="' + (mL + innerW * target / max).toFixed(1) + '" y1="10" x2="' + (mL + innerW * target / max).toFixed(1) + '" y2="26" stroke="' + BAR_AMBER + '" stroke-width="2"/>');
    }
    parts.push('<text x="' + (w - mR) + '" y="12" text-anchor="end" fill="' + MUTED + '" font-size="10">' + val + '</text></svg>');
    return parts.join('');
  }

  function sparkline(data, opts) {
    var values = (data && data.values) || [];
    if (!values.length) return emptyMsg('No sparkline data.');
    var w = (opts && opts.width) || 120, h = (opts && opts.height) || 32;
    var min = Math.min.apply(null, values);
    var max = Math.max.apply(null, values);
    var span = max - min || 1;
    var step = w / Math.max(values.length - 1, 1);
    var d = values.map(function (v, i) {
      var x = i * step;
      var y = h - 4 - ((v - min) / span) * (h - 8);
      return (i ? 'L' : 'M') + ' ' + x.toFixed(1) + ' ' + y.toFixed(1);
    }).join(' ');
    return svgOpen(w, h, 'Sparkline') + '<path d="' + d + '" fill="none" stroke="' + BAR_CYAN + '" stroke-width="1.5"/>' + '</svg>';
  }

  global.ForgeChartsKpi = {
    kpi_card: kpi_card,
    gauge: gauge,
    bullet: bullet,
    sparkline: sparkline,
    _demo: { kpi_card: { label: 'Commits', value: 128, delta: '+12%' }, gauge: { value: 72, min: 0, max: 100 } }
  };
})(typeof window !== 'undefined' ? window : this);
