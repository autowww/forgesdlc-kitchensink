/**
 * Living background — scroll + pointer → CSS vars on #ks-living-scene; SMIL via KsAmbientBg.
 * Scroll ratio is eased for parallax; desktop pointer nudge; reduced depth on mobile/coarse.
 */
(function (global) {
  'use strict';

  var scene = null;
  var rafScheduled = false;
  var lastScrollRatio = 0;
  var pointerEnabled = false;
  var ptrRaf = 0;
  var lastPtrX = 0;
  var lastPtrY = 0;

  function prefersReducedMotion() {
    try {
      return global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (_e) {
      return false;
    }
  }

  function isCoarseOrNarrow() {
    try {
      if (global.matchMedia && global.matchMedia('(pointer: coarse)').matches) return true;
      if (global.innerWidth < 768) return true;
    } catch (_e2) {}
    return false;
  }

  function clamp(n, a, b) {
    return Math.max(a, Math.min(b, n));
  }

  function scrollRatio() {
    var el = global.document.documentElement;
    var sh = el.scrollHeight - global.innerHeight;
    if (sh <= 0) return 0;
    return clamp(global.scrollY / sh, 0, 1);
  }

  /** Ease scroll so parallax accelerates gently (less linear). */
  function easeScrollRatio(r) {
    if (r <= 0) return 0;
    if (r >= 1) return 1;
    return Math.pow(r, 0.88);
  }

  function applyScroll() {
    if (!scene) return;
    lastScrollRatio = easeScrollRatio(scrollRatio());
    scene.style.setProperty('--ks-living-scroll', String(lastScrollRatio.toFixed(5)));
    rafScheduled = false;
  }

  function onScroll() {
    if (prefersReducedMotion()) return;
    if (rafScheduled) return;
    rafScheduled = true;
    if (typeof global.requestAnimationFrame === 'function') {
      global.requestAnimationFrame(applyScroll);
    } else {
      applyScroll();
    }
  }

  function applyPointer() {
    if (!scene || !pointerEnabled) return;
    var w = global.innerWidth || 1;
    var h = global.innerHeight || 1;
    var nx = (lastPtrX / w - 0.5) * 2;
    var ny = (lastPtrY / h - 0.5) * 2;
    scene.style.setProperty('--ks-living-parallax-x', (nx * 0.35).toFixed(4));
    scene.style.setProperty('--ks-living-parallax-y', (ny * 0.35).toFixed(4));
    ptrRaf = 0;
  }

  function onPointerMove(ev) {
    if (!pointerEnabled || prefersReducedMotion()) return;
    lastPtrX = ev.clientX;
    lastPtrY = ev.clientY;
    if (ptrRaf) return;
    ptrRaf =
      typeof global.requestAnimationFrame === 'function'
        ? global.requestAnimationFrame(applyPointer)
        : 0;
    if (!ptrRaf) applyPointer();
  }

  function initAmbient() {
    var K = global.KsAmbientBg;
    if (!K || typeof K.init !== 'function') return;
    K.init(document);
    if (typeof K.ensureSmilUnpausedIn === 'function') {
      K.ensureSmilUnpausedIn(document, { useViewportBatching: true });
    }
  }

  function setParallaxDepth() {
    if (!scene) return;
    if (isCoarseOrNarrow()) {
      scene.setAttribute('data-ks-living-parallax-depth', 'reduced');
    } else {
      scene.removeAttribute('data-ks-living-parallax-depth');
    }
  }

  function boot() {
    scene = document.getElementById('ks-living-scene');
    if (!scene) return;

    initAmbient();
    setParallaxDepth();

    if (!prefersReducedMotion()) {
      applyScroll();
      global.addEventListener('scroll', onScroll, { passive: true });
      global.addEventListener('resize', function () {
        setParallaxDepth();
        onScroll();
      }, { passive: true });
    } else {
      scene.style.setProperty('--ks-living-scroll', '0');
      scene.style.setProperty('--ks-living-parallax-x', '0');
      scene.style.setProperty('--ks-living-parallax-y', '0');
    }

    pointerEnabled = !prefersReducedMotion() && !isCoarseOrNarrow();
    if (pointerEnabled) {
      global.addEventListener('mousemove', onPointerMove, { passive: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})(typeof window !== 'undefined' ? window : this);
