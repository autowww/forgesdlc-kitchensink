(function () {
  'use strict';

  var script = document.currentScript;
  var root = (script && script.getAttribute('data-root')) || '..';

  var AREAS = [
    { id: 'forge',       label: 'ForgeSDLC',     href: root + '/docs/forge-home.html' },
    { id: 'methodology', label: 'Methodology',   href: root + '/docs/forge-methodology.html' },
    { id: 'ai-native',   label: 'AI-Native',     href: root + '/docs/forge-ai-native.html' },
    { id: 'blueprints',  label: 'Blueprints',    href: root + '/docs/forge-blueprints.html' },
    { id: 'sdlc',        label: 'SDLC',          href: root + '/sdlc/docs/index.html' },
    { id: 'pdlc',        label: 'PDLC',          href: root + '/pdlc/docs/index.html' },
    { id: 'disciplines', label: 'Disciplines',   href: root + '/docs/index.html#disciplines' }
  ];

  var path = window.location.pathname;
  var hash = window.location.hash;
  function detectActive() {
    if (/forge-home\.html/.test(path))                        return 'forge';
    if (/forge-methodology\.html/.test(path))                 return 'methodology';
    if (/forge-ai-native\.html/.test(path))                   return 'ai-native';
    if (/forge-blueprints\.html/.test(path))                  return 'blueprints';
    if (/forge-vs-traditional\.html/.test(path))              return 'methodology';
    if (/forge-roles-value\.html/.test(path))                 return 'methodology';
    if (/forge-manifesto\.html/.test(path))                   return 'forge';
    if (/forge-adopt\.html/.test(path))                       return 'forge';
    if (/forge-community\.html/.test(path))                   return 'forge';
    if (/\/sdlc\/docs\//.test(path))                          return 'sdlc';
    if (/\/pdlc\/docs\//.test(path))                          return 'pdlc';
    if (/\/docs\/index\.html/.test(path) && hash === '#disciplines') return 'disciplines';
    if (/\/docs\/index\.html/.test(path))                     return 'blueprints';
    return '';
  }
  var active = detectActive();

  var style = document.createElement('style');
  style.textContent = [
    '#bp-portal-nav{position:fixed;top:0;left:0;right:0;z-index:9999;height:44px;',
    'background:#0f172a;display:flex;align-items:center;padding:0 16px;',
    'font-family:"Open Sans",system-ui,-apple-system,sans-serif;font-size:13px;box-shadow:0 1px 3px rgba(0,0,0,.25)}',
    '#bp-portal-nav a{color:rgba(255,255,255,.72);text-decoration:none;padding:6px 12px;',
    'border-radius:6px;transition:background .15s,color .15s;white-space:nowrap}',
    '#bp-portal-nav a:hover{color:#fff;background:rgba(255,255,255,.1)}',
    '#bp-portal-nav a.bp-active{color:#fff;background:rgba(245,158,11,.3);font-weight:600}',
    '#bp-portal-nav .bp-brand{font-family:"Proxima Nova Black","Proxima Nova","proxima-nova","Open Sans",system-ui,sans-serif;font-weight:900;font-size:14px;color:#fff;margin-right:12px;',
    'padding:6px 0;letter-spacing:-.03em}',
    '#bp-portal-nav .bp-links{display:flex;gap:2px;overflow-x:auto;-webkit-overflow-scrolling:touch}',
    '#bp-portal-nav .bp-sep{width:1px;height:20px;background:rgba(255,255,255,.15);margin:0 4px;flex-shrink:0}',
    '#bp-portal-toggle{display:none;background:none;border:none;color:#fff;cursor:pointer;padding:6px;margin-left:auto}',
    '@media(max-width:640px){',
    '#bp-portal-nav .bp-links{display:none;position:absolute;top:44px;left:0;right:0;',
    'background:#0f172a;flex-direction:column;padding:8px;gap:2px;box-shadow:0 4px 8px rgba(0,0,0,.3)}',
    '#bp-portal-nav .bp-links.bp-open{display:flex}',
    '#bp-portal-toggle{display:block}}',
    'body{padding-top:44px !important}'
  ].join('\n');
  document.head.appendChild(style);

  var nav = document.createElement('nav');
  nav.id = 'bp-portal-nav';
  nav.setAttribute('aria-label', 'Blueprint areas');

  var brand = document.createElement('a');
  brand.className = 'bp-brand';
  brand.textContent = 'ForgeSDLC';
  brand.href = root + '/docs/forge-home.html';
  brand.style.textDecoration = 'none';
  brand.style.color = '#fff';
  nav.appendChild(brand);

  var links = document.createElement('div');
  links.className = 'bp-links';

  for (var i = 0; i < AREAS.length; i++) {
    if (AREAS[i].id === 'sdlc') {
      var sep = document.createElement('span');
      sep.className = 'bp-sep';
      sep.setAttribute('aria-hidden', 'true');
      links.appendChild(sep);
    }
    var a = document.createElement('a');
    a.href = AREAS[i].href;
    a.textContent = AREAS[i].label;
    if (AREAS[i].id === active) a.className = 'bp-active';
    links.appendChild(a);
  }
  nav.appendChild(links);

  var toggle = document.createElement('button');
  toggle.id = 'bp-portal-toggle';
  toggle.setAttribute('aria-label', 'Toggle navigation');
  toggle.innerHTML = '<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>';
  toggle.addEventListener('click', function () {
    links.classList.toggle('bp-open');
  });
  nav.appendChild(toggle);

  document.body.insertBefore(nav, document.body.firstChild);
})();
