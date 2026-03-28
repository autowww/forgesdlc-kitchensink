/**
 * Inline fetched SVG into .ks-ambient-bg / .forge-ambient-bg so document CSS variables apply.
 */
(function (global) {
  'use strict';

  var VP_BATCH = 4;
  var vpKickQueue = [];
  var vpKickDrainScheduled = false;
  var galleryIo = null;
  var galleryIoRoot = null;

  function prefersReducedMotion() {
    try {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (_e) {
      return false;
    }
  }

  /**
   * @param {ParentNode} [root]
   * @returns {Promise<void>}
   */
  function resolveUrl(src) {
    try {
      return new URL(src, document.baseURI || window.location.href).href;
    } catch (_e) {
      return src;
    }
  }

  function injectSvg(el, text) {
    var trimmed = (text || '').trim();
    if (!trimmed || trimmed.indexOf('<svg') === -1) {
      throw new Error('not an svg');
    }
    var svg = null;
    try {
      var doc = new DOMParser().parseFromString(trimmed, 'image/svg+xml');
      var rootNode = doc.documentElement;
      if (rootNode && rootNode.localName === 'svg' && !rootNode.querySelector('parsererror')) {
        svg = document.importNode(rootNode, true);
      }
    } catch (_e) {
      /* fall through */
    }
    if (svg) {
      el.textContent = '';
      el.appendChild(svg);
    } else {
      el.innerHTML = trimmed;
      svg = el.querySelector('svg');
    }
    return svg;
  }

  function initAmbientBackgrounds(root) {
    var scope = root || document;
    var nodes = scope.querySelectorAll(
      '.ks-ambient-bg[data-ks-bg-src], .forge-ambient-bg[data-ks-bg-src]'
    );
    var tasks = [];
    nodes.forEach(function (el) {
      var src = el.getAttribute('data-ks-bg-src');
      if (!src || el.querySelector('svg')) return;
      var url = resolveUrl(src);
      tasks.push(
        fetch(url, { credentials: 'same-origin' })
          .then(function (r) {
            if (!r.ok) throw new Error('HTTP ' + r.status);
            return r.text();
          })
          .then(function (text) {
            var svg = injectSvg(el, text);
            if (svg && prefersReducedMotion()) {
              svg.pauseAnimations && svg.pauseAnimations();
            } else if (svg && el.closest && el.closest('.forge-ambient--still')) {
              svg.pauseAnimations && svg.pauseAnimations();
            }
            try {
              el.dispatchEvent(
                new CustomEvent('ks-ambient-bg-injected', { bubbles: true, detail: { element: el } })
              );
            } catch (_e) {}
          })
          .catch(function () {
            el.setAttribute('data-ks-bg-error', '1');
          })
      );
    });
    return Promise.all(tasks);
  }

  function forEachAmbientSvg(root, fn) {
    var scope = root || document;
    scope.querySelectorAll('.ks-ambient-bg > svg, .forge-ambient-bg > svg').forEach(fn);
  }

  function pauseAllIn(root, paused) {
    forEachAmbientSvg(root, function (svg) {
      try {
        if (paused) {
          if (typeof svg.pauseAnimations === 'function') svg.pauseAnimations();
        } else if (typeof svg.unpauseAnimations === 'function') {
          svg.unpauseAnimations();
        }
      } catch (_e) {}
    });
  }

  function unpauseAllAmbient(root) {
    forEachAmbientSvg(root, function (svg) {
      try {
        if (typeof svg.unpauseAnimations === 'function') svg.unpauseAnimations();
      } catch (_e) {}
    });
  }

  function resetGallerySmilKick(root) {
    vpKickQueue.length = 0;
    vpKickDrainScheduled = false;
    if (!root) return;
    root.querySelectorAll('.ks-ambient-bg > svg, .forge-ambient-bg > svg').forEach(function (svg) {
      delete svg.dataset.ksSmilKicked;
    });
  }

  function scheduleVpKickDrain() {
    if (vpKickDrainScheduled) return;
    if (typeof requestAnimationFrame !== 'function') {
      while (vpKickQueue.length) {
        var s = vpKickQueue.shift();
        beginElementAllSmilUnder(s);
      }
      return;
    }
    vpKickDrainScheduled = true;
    requestAnimationFrame(function vpDrainFrame() {
      vpKickDrainScheduled = false;
      var n = 0;
      while (n < VP_BATCH && vpKickQueue.length) {
        var svg = vpKickQueue.shift();
        beginElementAllSmilUnder(svg);
        n++;
      }
      if (vpKickQueue.length) scheduleVpKickDrain();
    });
  }

  function enqueueVpBegin(svg) {
    if (!svg || vpKickQueue.indexOf(svg) !== -1) return;
    vpKickQueue.push(svg);
    scheduleVpKickDrain();
  }

  function syncEnqueueIntersectingAmbientSvgs(root) {
    if (!root || !root.querySelectorAll) return;
    var vh = typeof window.innerHeight === 'number' ? window.innerHeight : 0;
    var vw = typeof window.innerWidth === 'number' ? window.innerWidth : 0;
    var my = vh * 0.5;
    var mx = vw * 0.5;
    root.querySelectorAll('.ks-ambient-bg, .forge-ambient-bg').forEach(function (wrap) {
      var r = wrap.getBoundingClientRect();
      if (r.bottom < -my || r.top > vh + my || r.right < -mx || r.left > vw + mx) return;
      var svg = wrap.querySelector(':scope > svg');
      if (!svg || svg.dataset.ksSmilKicked) return;
      svg.dataset.ksSmilKicked = '1';
      enqueueVpBegin(svg);
    });
  }

  function disconnectGalleryIo() {
    if (galleryIo) {
      try {
        galleryIo.disconnect();
      } catch (_e) {}
      galleryIo = null;
    }
    galleryIoRoot = null;
  }

  function ensureGalleryViewportKick(root) {
    if (!root || typeof IntersectionObserver === 'undefined') return;
    if (galleryIoRoot === root && galleryIo) return;
    disconnectGalleryIo();
    galleryIoRoot = root;
    galleryIo = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var wrap = entry.target;
          var svg = wrap.querySelector(':scope > svg');
          if (!svg) return;
          if (entry.isIntersecting) {
            if (!svg.dataset.ksSmilKicked) {
              svg.dataset.ksSmilKicked = '1';
              enqueueVpBegin(svg);
            }
          } else {
            delete svg.dataset.ksSmilKicked;
          }
        });
      },
      { root: null, rootMargin: '50%', threshold: 0.01 }
    );
    root.querySelectorAll('.ks-ambient-bg, .forge-ambient-bg').forEach(function (w) {
      galleryIo.observe(w);
    });
  }

  /**
   * Unpause SMIL now plus two rAF passes (inline SVG timelines sometimes ignore the first call),
   * then beginElement on each SMIL node so indefinite loops start reliably in Chromium/WebKit.
   * Do not call setCurrentTime here — any root seek can stall repeatCount=indefinite SMIL in Chromium/WebKit.
   */
  function beginElementAllSmilUnder(svg) {
    try {
      var nodes = svg.querySelectorAll('animate, animateTransform, animateMotion');
      for (var i = 0; i < nodes.length; i++) {
        var el = nodes[i];
        if (typeof el.beginElement === 'function') {
          try {
            el.beginElement();
          } catch (_e) {}
        }
      }
    } catch (_e2) {}
  }

  function restartSmilBeginElementsIn(root) {
    forEachAmbientSvg(root, beginElementAllSmilUnder);
  }

  /**
   * @param {ParentNode} [root]
   * @param {{ useViewportBatching?: boolean, lightUnpauseOnly?: boolean }} [opts]
   */
  function kickSmilUnpausedIn(root, opts) {
    var options = opts || {};
    if (options.lightUnpauseOnly) {
      unpauseAllAmbient(root);
      if (typeof requestAnimationFrame !== 'function') return;
      requestAnimationFrame(function () {
        unpauseAllAmbient(root);
        requestAnimationFrame(function () {
          unpauseAllAmbient(root);
        });
      });
      return;
    }

    var useVp = !!options.useViewportBatching;

    unpauseAllAmbient(root);

    function afterUnpause() {
      if (useVp) {
        if (typeof IntersectionObserver !== 'undefined') {
          ensureGalleryViewportKick(root);
          syncEnqueueIntersectingAmbientSvgs(root);
          scheduleVpKickDrain();
        } else {
          forEachAmbientSvg(root, function (svg) {
            enqueueVpBegin(svg);
          });
        }
      } else {
        restartSmilBeginElementsIn(root);
      }
    }

    if (typeof requestAnimationFrame !== 'function') {
      afterUnpause();
      return;
    }
    requestAnimationFrame(function () {
      unpauseAllAmbient(root);
      requestAnimationFrame(function () {
        unpauseAllAmbient(root);
        afterUnpause();
      });
    });
  }

  /** Unpause only (fonts/layout); no beginElement blast — use after full load with viewport batching. */
  function kickSmilLightUnpauseIn(root) {
    kickSmilUnpausedIn(root, { lightUnpauseOnly: true });
  }

  /**
   * @param {ParentNode} [root]
   * @param {{ useViewportBatching?: boolean }} [opts]
   */
  function ensureSmilUnpausedIn(root, opts) {
    kickSmilUnpausedIn(root, opts);
  }

  /**
   * @param {ParentNode} [root]
   * @param {{ useViewportBatching?: boolean }} [opts]
   */
  function restartSmilTimelineIn(root, opts) {
    var o = opts || {};
    if (o.useViewportBatching) {
      resetGallerySmilKick(root);
    }
    kickSmilUnpausedIn(root, o);
  }

  global.KsAmbientBg = {
    init: initAmbientBackgrounds,
    pauseAllIn: pauseAllIn,
    ensureSmilUnpausedIn: ensureSmilUnpausedIn,
    restartSmilTimelineIn: restartSmilTimelineIn,
    kickSmilUnpausedIn: kickSmilUnpausedIn,
    kickSmilLightUnpauseIn: kickSmilLightUnpauseIn,
    restartSmilBeginElementsIn: restartSmilBeginElementsIn,
    prefersReducedMotion: prefersReducedMotion,
  };
})(typeof window !== 'undefined' ? window : this);
