/**
 * Controls for svg-backgrounds showcase page.
 */
(function () {
  'use strict';

  var GALLERY_KICK_OPTS = { useViewportBatching: true };

  function ksDebugBgEnabled() {
    try {
      var q = window.location.search || '';
      var h = window.location.hash || '';
      /* Query after # (e.g. #asset-foo?ksDebugBg=1) is in the hash, not location.search */
      return /\bksDebugBg=1\b/.test(q) || /\bksDebugBg=1\b/.test(h);
    } catch (_e) {
      return false;
    }
  }

  var root = document.getElementById('ks-bg-gallery-root');
  if (!root) return;

  function logDebugAmbientState() {
    if (!ksDebugBgEnabled() || typeof console === 'undefined' || !console.info) return;
    var reduced = false;
    try {
      reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (_e2) {}
    var svgs = root.querySelectorAll('.ks-ambient-bg > svg');
    var one = svgs[0];
    var at = one && one.querySelector && one.querySelector('animateTransform');
    console.info('[ksDebugBg] prefers-reduced-motion: reduce ===', reduced);
    console.info('[ksDebugBg] .ks-ambient-bg > svg count', svgs.length);
    if (one) {
      console.info('[ksDebugBg] sample svg.animationsPaused', typeof one.animationsPaused === 'function' ? one.animationsPaused() : '(no API)');
      console.info('[ksDebugBg] sample unpauseAnimations', typeof one.unpauseAnimations);
      console.info(
        '[ksDebugBg] sample animateTransform.beginElement',
        at && typeof at.beginElement
      );
    }
  }

  var overlaySel = document.getElementById('ks-bg-gallery-overlay');
  var densitySel = document.getElementById('ks-bg-gallery-density');
  var suppressBtn = document.getElementById('ks-bg-gallery-toggle-bg');
  var pauseBtn = document.getElementById('ks-bg-gallery-pause');

  var suppressed = false;
  var paused = false;

  function applyOverlay() {
    if (!overlaySel) return;
    root.classList.remove(
      'ks-bg-overlay--none',
      'ks-bg-overlay--soft',
      'ks-bg-overlay--medium',
      'ks-bg-overlay--strong'
    );
    root.classList.add('ks-bg-overlay--' + overlaySel.value);
  }

  function applyDensity() {
    if (!densitySel) return;
    root.classList.remove('ks-bg-density--low', 'ks-bg-density--medium', 'ks-bg-density--high');
    root.classList.add('ks-bg-density--' + densitySel.value);
  }

  function applySuppress() {
    root.classList.toggle('ks-bg-suppressed', suppressed);
    if (suppressBtn) suppressBtn.setAttribute('aria-pressed', suppressed ? 'true' : 'false');
    if (suppressBtn) suppressBtn.textContent = suppressed ? 'Show backgrounds' : 'Hide backgrounds';
  }

  function setPaused(p) {
    paused = p;
    root.classList.toggle('ks-bg-gallery--animations-paused', paused);
    if (typeof KsAmbientBg !== 'undefined') {
      if (paused) {
        if (KsAmbientBg.pauseAllIn) KsAmbientBg.pauseAllIn(root, true);
      } else if (KsAmbientBg.restartSmilTimelineIn) {
        KsAmbientBg.restartSmilTimelineIn(root, GALLERY_KICK_OPTS);
      }
    }
    if (pauseBtn) {
      pauseBtn.setAttribute('aria-pressed', paused ? 'true' : 'false');
      pauseBtn.textContent = paused ? 'Play animations' : 'Pause animations';
    }
  }

  if (overlaySel) overlaySel.addEventListener('change', applyOverlay);
  if (densitySel) densitySel.addEventListener('change', applyDensity);

  if (suppressBtn) {
    suppressBtn.addEventListener('click', function () {
      suppressed = !suppressed;
      applySuppress();
    });
  }

  if (pauseBtn) {
    pauseBtn.addEventListener('click', function () {
      setPaused(!paused);
    });
  }

  var motionMq = null;
  try {
    motionMq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motionMq.matches) {
      setPaused(true);
    }
  } catch (_e) {}

  if (motionMq) {
    try {
      if (typeof motionMq.addEventListener === 'function') {
        motionMq.addEventListener('change', function () {
          setPaused(motionMq.matches);
        });
      } else if (typeof motionMq.addListener === 'function') {
        motionMq.addListener(function () {
          setPaused(motionMq.matches);
        });
      }
    } catch (_eMq) {}
  }

  /* Explain static first frame when OS / browser requests reduced motion */
  try {
    if (motionMq && motionMq.matches) {
      var hint = document.createElement('p');
      hint.className = 'forge-support mb-0 w-100';
      hint.style.fontSize = '0.78rem';
      hint.setAttribute('role', 'note');
      hint.textContent =
        'Reduced motion is enabled in your system or browser — ambient SMIL starts paused. Use “Play animations” to preview loops in this gallery.';
      var tb = root.querySelector('.ks-bg-gallery-toolbar');
      if (tb && tb.firstChild) tb.insertBefore(hint, tb.firstChild);
    }
  } catch (_e2) {}

  applyOverlay();
  applyDensity();

  if (typeof KsAmbientBg !== 'undefined' && KsAmbientBg.init) {
    KsAmbientBg.init(root).then(function () {
      if (paused) setPaused(true);
      else if (KsAmbientBg.ensureSmilUnpausedIn) KsAmbientBg.ensureSmilUnpausedIn(root, GALLERY_KICK_OPTS);
      logDebugAmbientState();
    });
  }

  /* After full load (fonts, late layout): unpause only — beginElement stays viewport-batched */
  window.addEventListener('load', function () {
    if (paused || typeof KsAmbientBg === 'undefined') return;
    if (KsAmbientBg.kickSmilLightUnpauseIn) KsAmbientBg.kickSmilLightUnpauseIn(root);
  });
})();
