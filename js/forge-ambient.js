/**
 * Forge ambient — KsAmbientBg init for pages using forge-ambient-bg; pause SMIL for .forge-ambient--still.
 */
(function () {
  'use strict';

  var KICK_OPTS = { useViewportBatching: true };

  function pauseSvg(svg) {
    try {
      if (svg && typeof svg.pauseAnimations === 'function') svg.pauseAnimations();
    } catch (_e) {}
  }

  function pauseStillSections(root) {
    var scope = root || document;
    scope.querySelectorAll('.forge-ambient--still .forge-ambient-bg svg').forEach(pauseSvg);
  }

  function afterInject(el) {
    if (!el || !el.closest) return;
    if (el.closest('.forge-ambient--still')) {
      var svg = el.querySelector('svg');
      pauseSvg(svg);
    }
  }

  function startAmbient() {
    var K = typeof window !== 'undefined' ? window.KsAmbientBg : null;
    if (!K || !K.init) return;
    K.init(document).then(function () {
      if (K.prefersReducedMotion && K.prefersReducedMotion()) return;
      if (K.ensureSmilUnpausedIn) K.ensureSmilUnpausedIn(document, KICK_OPTS);
      pauseStillSections(document);
    });
    window.addEventListener('load', function () {
      var K2 = window.KsAmbientBg;
      if (!K2 || (K2.prefersReducedMotion && K2.prefersReducedMotion())) return;
      if (K2.kickSmilLightUnpauseIn) K2.kickSmilLightUnpauseIn(document);
      pauseStillSections(document);
    });
  }

  document.addEventListener('ks-ambient-bg-injected', function (ev) {
    afterInject(ev.detail && ev.detail.element);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startAmbient);
  } else {
    startAmbient();
  }
})();
