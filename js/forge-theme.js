/**
 * Forge — AI-native theme interactions
 * =====================================
 * Color scheme (cookie ``forge_color_scheme``: light | dark | auto),
 * ``data-bs-theme`` on ``<html>``, diagram modal expand/collapse,
 * node ↔ detail hover wiring, cluster/subgraph breathing, and SVG scaling.
 *
 * Include after Bootstrap JS and before </body>.
 */
(function () {
  'use strict';

  /* Product / landing: in-page preview iframe (?fs-embed=1, optional ?fs-preview-rail=1) */
  try {
    if (typeof location !== 'undefined') {
      var _params = new URLSearchParams(location.search);
      if (_params.get('fs-embed') === '1') {
        document.documentElement.classList.add('fs-embed');
      }
      if (_params.get('fs-preview-rail') === '1') {
        document.documentElement.classList.add('fs-preview-rail');
      }
    }
  } catch (_e) { /* ignore */ }

  /* ------------------------------------------------------------------
   * Color scheme (Bootstrap data-bs-theme + cookie)
   * ---------------------------------------------------------------- */
  var COOKIE = 'forge_color_scheme';
  var COOKIE_MAX_AGE = 31536000;

  function readCookie(name) {
    var m = document.cookie.match(
      new RegExp('(?:^|; )' + name.replace(/[-[\]{}()*+?.\\^$|]/g, '\\$&') + '=([^;]*)')
    );
    return m ? decodeURIComponent(m[1].trim()) : '';
  }

  function writeCookie(name, val) {
    var secure = typeof location !== 'undefined' && location.protocol === 'https:' ? '; Secure' : '';
    document.cookie =
      name +
      '=' +
      encodeURIComponent(val) +
      '; Path=/; Max-Age=' +
      COOKIE_MAX_AGE +
      '; SameSite=Lax' +
      secure;
  }

  function mediaDark() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  function storedPreference() {
    var v = readCookie(COOKIE);
    if (v === 'light' || v === 'dark' || v === 'auto') return v;
    return null;
  }

  function effectiveTheme() {
    var pref = storedPreference();
    if (pref === 'light') return 'light';
    if (pref === 'dark') return 'dark';
    if (pref === 'auto') return mediaDark() ? 'dark' : 'light';
    return 'dark';
  }

  function syncToggleUi() {
    var pref = storedPreference();
    var labelKey = pref === 'light' || pref === 'dark' || pref === 'auto' ? pref : 'dark';
    var labels = { light: 'Light', dark: 'Dark', auto: 'System' };
    document.querySelectorAll('.forge-theme-dropdown').forEach(function (root) {
      root.setAttribute('data-forge-pref', labelKey);
    });
    document.querySelectorAll('[data-forge-color-scheme]').forEach(function (el) {
      var m = el.getAttribute('data-forge-color-scheme');
      var isSel = m === labelKey;
      el.classList.toggle('active', isSel);
    });
    document.querySelectorAll('.forge-theme-current').forEach(function (el) {
      el.textContent = labels[labelKey] || 'Dark';
    });
  }

  function applyColorScheme() {
    var t = effectiveTheme();
    document.documentElement.setAttribute('data-bs-theme', t);
    try {
      window.dispatchEvent(
        new CustomEvent('forge-theme-applied', { detail: { effective: t, preference: storedPreference() || 'dark' } })
      );
    } catch (err) { /* ignore */ }
    syncToggleUi();
  }

  function setPreference(mode) {
    if (mode !== 'light' && mode !== 'dark' && mode !== 'auto') return;
    writeCookie(COOKIE, mode);
    applyColorScheme();
  }

  window.forgeSetColorScheme = setPreference;
  window.forgeGetColorSchemePreference = storedPreference;
  window.forgeGetEffectiveColorScheme = effectiveTheme;

  var forgeMermaidRefreshTimer = null;
  window.addEventListener('forge-theme-applied', function () {
    if (typeof window.forgeMermaidRefresh !== 'function') return;
    clearTimeout(forgeMermaidRefreshTimer);
    forgeMermaidRefreshTimer = setTimeout(function () {
      window.forgeMermaidRefresh().catch(function () {});
    }, 120);
  });

  document.addEventListener('DOMContentLoaded', function () {
    applyColorScheme();
    document.querySelectorAll('[data-forge-color-scheme]').forEach(function (el) {
      el.addEventListener('click', function (ev) {
        ev.preventDefault();
        var m = el.getAttribute('data-forge-color-scheme');
        if (m) setPreference(m);
      });
    });
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () {
        if (storedPreference() === 'auto') applyColorScheme();
      });
    }
    function topicPreviewTitleFromAnchor(a) {
      var tCard = a.querySelector('.fs-topic-preview-card__title');
      if (tCard) return (tCard.textContent || '').trim();
      return (a.textContent || '').trim().replace(/\s+/g, ' ');
    }

    function wireLandingPageTopicPreviews() {
      if (!document.body.classList.contains('fs-landing-topic-preview-active')) return;
      document.body.addEventListener('click', function (ev) {
        if (ev.ctrlKey || ev.metaKey || ev.shiftKey || ev.altKey) return;
        var a = ev.target.closest('a');
        if (!a) return;
        if (a.classList.contains('fs-topic-preview-external')) return;
        if (a.closest('.landing-header')) return;
        if (a.closest('#topicPreviewModal')) return;
        if (a.classList.contains('topic-preview-open-full')) return;
        if (a.getAttribute('download')) return;
        var href = a.getAttribute('href');
        if (!href) return;
        if (/^\s*#/.test(href)) return;
        if (/^javascript:/i.test(href.trim())) return;
        if (/^mailto:/i.test(href.trim()) || /^tel:/i.test(href.trim())) return;
        var url;
        try {
          url = new URL(href, window.location.href);
        } catch (err) {
          return;
        }
        if (url.origin !== window.location.origin) return;
        if (!/\.html$/i.test(url.pathname)) return;
        var cur = new URL(window.location.href);
        function landingPath(p) {
          return p === '/' || /\/index\.html$/i.test(p);
        }
        var samePath = url.pathname === cur.pathname && url.search === cur.search;
        var bothLanding =
          landingPath(url.pathname) &&
          landingPath(cur.pathname) &&
          url.search === cur.search;
        if (samePath || bothLanding) return;
        ev.preventDefault();
        var titleText = topicPreviewTitleFromAnchor(a);
        if (!titleText) {
          titleText =
            url.pathname.replace(/^.*\//, '').replace(/\.html$/i, '') || 'Preview';
        }
        window.openTopicPreviewModal(url.pathname + url.search + url.hash, titleText);
      });
    }

    wireLandingPageTopicPreviews();

    document.querySelectorAll('a.fs-topic-preview-card').forEach(function (el) {
      if (document.body.classList.contains('fs-landing-topic-preview-active')) return;
      el.addEventListener('click', function (ev) {
        ev.preventDefault();
        var href = el.getAttribute('href');
        if (!href) return;
        var tEl = el.querySelector('.fs-topic-preview-card__title');
        var titleText = tEl ? (tEl.textContent || '').trim() : '';
        window.openTopicPreviewModal(href, titleText);
      });
    });
  });

  /* ------------------------------------------------------------------
   * Diagram expand modal
   * ---------------------------------------------------------------- */
  window.openDiagramModal = function (trigger) {
    var svg = trigger.querySelector('svg');
    if (!svg) return;
    var canvas = document.getElementById('diagramModalCanvas');
    if (!canvas) return;
    canvas.innerHTML = svg.outerHTML;
    var modalSvg = canvas.querySelector('svg');
    if (modalSvg) {
      modalSvg.removeAttribute('width');
      modalSvg.removeAttribute('height');
      modalSvg.style.width = '100%';
      modalSvg.style.height = 'auto';
      modalSvg.style.maxHeight = '';
      modalSvg.style.minHeight = '';

      var vb = modalSvg.getAttribute('viewBox');
      if (!vb) {
        var bbox = svg.getBBox ? svg.getBBox() : null;
        if (bbox && bbox.width > 0) {
          modalSvg.setAttribute('viewBox', '0 0 ' + bbox.width + ' ' + bbox.height);
        }
      }
    }
    var dm = document.getElementById('diagramModal');
    if (dm) {
      dm.classList.add('active');
      dm.setAttribute('aria-hidden', 'false');
    }
    document.body.style.overflow = 'hidden';
    wireDiagramHovers();
    if (typeof window.forgeMountDiagramModalZoom === 'function') {
      window.forgeMountDiagramModalZoom(canvas);
    }
  };

  window.closeDiagramModal = function () {
    var modal = document.getElementById('diagramModal');
    if (modal) {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
    }
    document.body.style.overflow = '';
  };

  /* ------------------------------------------------------------------
   * Find the enclosing cluster(s) for a node
   * ---------------------------------------------------------------- */
  function findParentClusters(nodeEl) {
    var clusters = [];
    var parent = nodeEl.parentElement;
    while (parent) {
      if (parent.classList && parent.classList.contains('cluster')) {
        clusters.push(parent);
      }
      parent = parent.parentElement;
    }
    return clusters;
  }

  /* ------------------------------------------------------------------
   * Node ↔ detail hover wiring (bidirectional) + cluster breathing
   * ---------------------------------------------------------------- */
  function wireDiagramHovers() {
    var canvas = document.getElementById('diagramModalCanvas');
    var detail = document.getElementById('diagramModalDetail');
    if (!canvas || !detail) return;

    var nodes = canvas.querySelectorAll('.node');
    var clusters = canvas.querySelectorAll('.cluster');
    var detailItems = detail.querySelectorAll('.detail-item[data-node]');

    function hideMermaidLiveFocus() {
      var live = document.getElementById('diagramModalMermaidLive');
      var liveText = document.getElementById('diagramModalMermaidLiveText');
      if (live) {
        live.hidden = true;
        live.classList.remove('highlight');
      }
      if (liveText) liveText.textContent = '';
    }

    function showMermaidLiveFocus(label) {
      var live = document.getElementById('diagramModalMermaidLive');
      var liveText = document.getElementById('diagramModalMermaidLiveText');
      if (!live || !liveText) return;
      liveText.textContent =
        '"' +
        label +
        '" — runtime label; compare with the SVG template legend below when names differ.';
      live.hidden = false;
      live.classList.add('highlight');
      live.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }

    nodes.forEach(function (node) {
      var labelEl = node.querySelector('.nodeLabel') ||
                    node.querySelector('text') ||
                    node.querySelector('span');
      if (!labelEl) return;
      var label = (labelEl.textContent || '').trim();

      node.addEventListener('mouseenter', function () {
        node.classList.add('node-glow');

        var parentClusters = findParentClusters(node);
        parentClusters.forEach(function (c) { c.classList.add('cluster-glow'); });

        var matched = false;
        detailItems.forEach(function (item) {
          if (item.getAttribute('data-node') === label) {
            matched = true;
            item.classList.add('highlight');
            item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          }
        });
        if (!matched && label.length >= 2) {
          var lnorm = label.toLowerCase().replace(/\s+/g, ' ');
          detailItems.forEach(function (item) {
            var dn = (item.getAttribute('data-node') || '').trim();
            if (dn.length < 2) return;
            var dnLow = dn.toLowerCase();
            if (lnorm.indexOf(dnLow) !== -1 || dnLow.indexOf(lnorm) !== -1) {
              matched = true;
              item.classList.add('highlight');
              item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
          });
        }
        if (matched) {
          hideMermaidLiveFocus();
        } else if (label) {
          showMermaidLiveFocus(label);
        }
      });
      node.addEventListener('mouseleave', function () {
        node.classList.remove('node-glow');
        clusters.forEach(function (c) { c.classList.remove('cluster-glow'); });
        detailItems.forEach(function (item) { item.classList.remove('highlight'); });
        hideMermaidLiveFocus();
      });
    });

    clusters.forEach(function (cluster) {
      cluster.addEventListener('mouseenter', function () {
        cluster.classList.add('cluster-glow');
      });
      cluster.addEventListener('mouseleave', function () {
        cluster.classList.remove('cluster-glow');
      });
    });

    detailItems.forEach(function (item) {
      var nodeName = item.getAttribute('data-node');
      item.addEventListener('mouseenter', function () {
        item.classList.add('highlight');
        nodes.forEach(function (node) {
          var labelEl = node.querySelector('.nodeLabel') ||
                        node.querySelector('text') ||
                        node.querySelector('span');
          if (labelEl && (labelEl.textContent || '').trim() === nodeName) {
            node.classList.add('node-glow');
            var parentClusters = findParentClusters(node);
            parentClusters.forEach(function (c) { c.classList.add('cluster-glow'); });
          }
        });
      });
      item.addEventListener('mouseleave', function () {
        item.classList.remove('highlight');
        nodes.forEach(function (node) { node.classList.remove('node-glow'); });
        clusters.forEach(function (c) { c.classList.remove('cluster-glow'); });
      });
    });
  }

  /* ------------------------------------------------------------------
   * Topic preview modal (same-page reader; iframe loads ?fs-embed=1)
   * ---------------------------------------------------------------- */
  function topicPreviewUrlWithEmbed(href) {
    try {
      var u = new URL(href, window.location.href);
      u.searchParams.set('fs-embed', '1');
      u.searchParams.set('fs-preview-rail', '1');
      return u.pathname + u.search + u.hash;
    } catch (err) {
      var sep = href.indexOf('?') >= 0 ? '&' : '?';
      var tail = 'fs-embed=1&fs-preview-rail=1';
      return href + sep + tail;
    }
  }

  function resetTopicPreviewTocRail(modal) {
    var body = modal.querySelector('.topic-preview-modal-body');
    var rail = document.getElementById('topicPreviewTocRail');
    if (body) body.classList.remove('topic-preview-modal-body--with-rail');
    if (rail) {
      rail.innerHTML = '';
      rail.hidden = true;
    }
  }

  function syncTopicPreviewTocFromIframe(iframe, modal) {
    var rail = document.getElementById('topicPreviewTocRail');
    var body = modal.querySelector('.topic-preview-modal-body');
    if (!rail || !body) return;
    rail.innerHTML = '';
    rail.hidden = true;
    body.classList.remove('topic-preview-modal-body--with-rail');
    try {
      var doc = iframe.contentDocument;
      if (!doc) return;
      var toc = doc.querySelector('.fs-main .toc');
      if (!toc) return;
      var inner = toc.cloneNode(true);
      inner.removeAttribute('id');
      var wrap = document.createElement('div');
      wrap.className = 'topic-preview-toc-rail__inner';
      wrap.appendChild(inner);
      rail.appendChild(wrap);
      rail.hidden = false;
      body.classList.add('topic-preview-modal-body--with-rail');
    } catch (_err) {
      /* cross-origin or parse error */
    }
  }

  function ensureTopicPreviewModal() {
    var existing = document.getElementById('topicPreviewModal');
    if (existing) return existing;
    var wrap = document.createElement('div');
    wrap.id = 'topicPreviewModal';
    wrap.className = 'diagram-modal-backdrop topic-preview-modal-backdrop';
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-modal', 'true');
    wrap.setAttribute('aria-labelledby', 'topicPreviewModalTitle');
    wrap.innerHTML =
      '<div class="diagram-modal topic-preview-modal-dialog">' +
      '<h3 id="topicPreviewModalTitle" class="topic-preview-modal-sr-title">Preview</h3>' +
      '<div class="topic-preview-modal-toolbar">' +
      '<a id="topicPreviewOpenFull" class="topic-preview-open-full" href="#" target="_blank" rel="noopener">Open full page</a>' +
      '<button type="button" class="diagram-modal-close topic-preview-modal-close" data-topic-preview-close aria-label="Close">&times;</button>' +
      '</div>' +
      '<div class="diagram-modal-body topic-preview-modal-body">' +
      '<div id="topicPreviewModalCanvas" class="diagram-modal-canvas topic-preview-modal-canvas"></div>' +
      '<nav id="topicPreviewTocRail" class="topic-preview-toc-rail" aria-label="On this page" hidden></nav>' +
      '</div></div>';
    document.body.appendChild(wrap);
    wrap.addEventListener('click', function (e) {
      if (e.target === wrap) window.closeTopicPreviewModal();
    });
    wrap.querySelector('[data-topic-preview-close]').addEventListener('click', function () {
      window.closeTopicPreviewModal();
    });
    var rail = document.getElementById('topicPreviewTocRail');
    if (rail) {
      rail.addEventListener('click', function (e) {
        var a = e.target.closest('a');
        if (!a || !rail.contains(a)) return;
        var href = a.getAttribute('href');
        if (!href || href.charAt(0) !== '#') return;
        e.preventDefault();
        var iframe = wrap.querySelector('.topic-preview-iframe');
        if (!iframe || !iframe.contentWindow || !iframe.contentWindow.document) return;
        var id = decodeURIComponent(href.slice(1).replace(/\+/g, ' '));
        var target = iframe.contentWindow.document.getElementById(id);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          try {
            iframe.contentWindow.location.hash = href;
          } catch (_h) { /* ignore */ }
        }
      });
    }
    return wrap;
  }

  window.closeTopicPreviewModal = function () {
    var modal = document.getElementById('topicPreviewModal');
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = '';
    var iframe = modal.querySelector('.topic-preview-iframe');
    if (iframe) {
      iframe.onload = null;
      iframe.src = 'about:blank';
    }
    resetTopicPreviewTocRail(modal);
  };

  window.openTopicPreviewModal = function (href, titleText) {
    if (!href) return;
    var modal = ensureTopicPreviewModal();
    var titleEl = document.getElementById('topicPreviewModalTitle');
    var fullLink = document.getElementById('topicPreviewOpenFull');
    var canvas = document.getElementById('topicPreviewModalCanvas');
    if (!canvas) return;
    var src = topicPreviewUrlWithEmbed(href);
    if (titleEl) titleEl.textContent = titleText || 'Preview';
    if (fullLink) {
      try {
        var ru = new URL(href, window.location.href);
        fullLink.href = ru.pathname + ru.search + ru.hash;
      } catch (e2) {
        fullLink.href = href;
      }
    }
    resetTopicPreviewTocRail(modal);
    canvas.innerHTML = '';
    var iframe = document.createElement('iframe');
    iframe.className = 'topic-preview-iframe';
    iframe.setAttribute('title', titleText ? titleText + ' (preview)' : 'Topic preview');
    iframe.setAttribute('loading', 'lazy');
    iframe.referrerPolicy = 'no-referrer-when-downgrade';
    iframe.onload = function () {
      syncTopicPreviewTocFromIframe(iframe, modal);
    };
    iframe.src = src;
    canvas.appendChild(iframe);
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  /* ------------------------------------------------------------------
   * Keyboard & backdrop close
   * ---------------------------------------------------------------- */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    var tp = document.getElementById('topicPreviewModal');
    if (tp && tp.classList.contains('active')) {
      window.closeTopicPreviewModal();
      return;
    }
    window.closeDiagramModal();
  });
  var backdrop = document.getElementById('diagramModal');
  if (backdrop) {
    backdrop.addEventListener('click', function (e) {
      if (e.target === this) window.closeDiagramModal();
    });
  }

  /* Sidebar: exclusive accordion for <details name="lenses-sidebar-tier"> (fallback where name grouping is unsupported). */
  document.addEventListener('DOMContentLoaded', function () {
    var tierDetails = document.querySelectorAll(
      '.nav-tier-accordion details[name="lenses-sidebar-tier"]'
    );
    if (!tierDetails.length) return;
    tierDetails.forEach(function (d) {
      d.addEventListener('toggle', function () {
        if (!d.open) return;
        tierDetails.forEach(function (other) {
          if (other !== d) other.open = false;
        });
      });
    });
  });
})();
