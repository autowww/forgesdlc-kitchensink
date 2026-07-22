/**
 * Cursor-driven perspective tilt / parallax for tiles.
 * Uses ks-pointer-depth.js when available.
 *
 * Markup: .ks-tilt-wrap[data-ks-tilt] + child .ks-tilt-inner
 * Optional: data-ks-tilt-max (degrees, default 10, cap 24).
 */
(function () {
  "use strict";

  var KPD = typeof window !== "undefined" ? window.KsPointerDepth : null;

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

  function bindLegacy(wrap, inner, maxDeg) {
    function off() {
      return KPD ? KPD.disabled() : false;
    }

    function onMove(ev) {
      if (off()) return;
      setTracking(wrap, true);
      var r = wrap.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) return;
      var p = KPD
        ? KPD.normalizedPointer(r, ev.clientX, ev.clientY)
        : { mx: 0, my: 0 };
      if (!KPD) {
        var mx = ((ev.clientX - r.left) / r.width - 0.5) * 2;
        var my = ((ev.clientY - r.top) / r.height - 0.5) * 2;
        p = {
          mx: Math.max(-1, Math.min(1, mx)),
          my: Math.max(-1, Math.min(1, my)),
        };
      }
      var t = KPD
        ? KPD.tiltDegrees(p.mx, p.my, maxDeg)
        : { rx: -p.my * maxDeg, ry: p.mx * maxDeg };
      inner.style.transform =
        "rotateX(" + t.rx + "deg) rotateY(" + t.ry + "deg) translateZ(8px)";
    }

    function onLeave() {
      setTracking(wrap, false);
      inner.style.transform = "";
    }

    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerleave", onLeave);
    wrap.addEventListener("pointercancel", onLeave);
  }

  function bind(wrap) {
    if (wrap.dataset.ksTileParallaxBound) return;
    wrap.dataset.ksTileParallaxBound = "1";
    var inner = findInner(wrap);
    if (!inner) return;

    var maxDeg = KPD ? KPD.parseMaxDeg(wrap, 10) : 10;

    if (KPD) {
      KPD.bind(wrap, {
        inner: inner,
        maxDeg: maxDeg,
        onTransform: function (transform) {
          if (transform) setTracking(wrap, true);
          else setTracking(wrap, false);
        },
      });
      return;
    }

    bindLegacy(wrap, inner, maxDeg);
  }

  function init() {
    document.querySelectorAll("[data-ks-tilt], [data-ks-parallax]").forEach(bind);
    document
      .querySelectorAll("[data-ks-holo], [data-ks-pointer-depth]")
      .forEach(function (el) {
        if (!KPD || el.dataset.ksPointerDepthBound) return;
        KPD.bind(el, { mode: "css-vars", maxDeg: KPD.parseMaxDeg(el, 12) });
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
