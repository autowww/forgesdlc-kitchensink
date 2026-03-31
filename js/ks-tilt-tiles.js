/**
 * Cursor-driven perspective tilt / parallax for tiles.
 *
 * Markup (tilt): <div class="ks-tilt-wrap" data-ks-tilt> + child .ks-tilt-inner
 * Markup (parallax alias): <div class="ks-parallax-wrap" data-ks-parallax> + child .ks-parallax-inner
 * Optional: data-ks-tilt-max / data-ks-parallax-max (degrees, default 10, cap 24).
 *
 * Skipped when prefers-reduced-motion is set or pointer is coarse.
 */
(function () {
  "use strict";

  var mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var mqCoarse = window.matchMedia("(pointer: coarse)");

  function parseMax(wrap) {
    var v =
      wrap.getAttribute("data-ks-parallax-max") ||
      wrap.getAttribute("data-ks-tilt-max");
    var n = v != null ? parseFloat(v) : 10;
    if (!isFinite(n) || n <= 0) return 10;
    return Math.min(n, 24);
  }

  function findInner(wrap) {
    return (
      wrap.querySelector(".ks-parallax-inner") ||
      wrap.querySelector(".ks-tilt-inner")
    );
  }

  function setTracking(wrap, on) {
    if (wrap.classList.contains("ks-parallax-wrap")) {
      wrap.classList.toggle("ks-parallax-wrap--tracking", on);
    } else {
      wrap.classList.toggle("ks-tilt-wrap--tracking", on);
    }
  }

  function bind(wrap) {
    if (wrap.dataset.ksTileParallaxBound) return;
    wrap.dataset.ksTileParallaxBound = "1";
    var inner = findInner(wrap);
    if (!inner) return;

    var maxDeg = parseMax(wrap);

    function off() {
      return mqReduce.matches || mqCoarse.matches;
    }

    function onMove(ev) {
      if (off()) return;
      setTracking(wrap, true);
      var r = wrap.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) return;
      var mx = ((ev.clientX - r.left) / r.width - 0.5) * 2;
      var my = ((ev.clientY - r.top) / r.height - 0.5) * 2;
      mx = Math.max(-1, Math.min(1, mx));
      my = Math.max(-1, Math.min(1, my));
      var rx = -my * maxDeg;
      var ry = mx * maxDeg;
      inner.style.transform =
        "rotateX(" + rx + "deg) rotateY(" + ry + "deg) translateZ(8px)";
    }

    function onLeave() {
      setTracking(wrap, false);
      inner.style.transform = "";
    }

    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerleave", onLeave);
    wrap.addEventListener("pointercancel", onLeave);
  }

  function init() {
    document.querySelectorAll("[data-ks-tilt], [data-ks-parallax]").forEach(bind);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
