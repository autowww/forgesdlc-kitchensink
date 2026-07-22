/**
 * Shared pointer → depth CSS variables for spatial KS components.
 * Exposes window.KsPointerDepth for ks-tilt-tiles.js and holo surfaces.
 */
(function (global) {
  "use strict";

  var mqReduce = global.matchMedia("(prefers-reduced-motion: reduce)");
  var mqCoarse = global.matchMedia("(pointer: coarse)");

  function disabled() {
    return mqReduce.matches || mqCoarse.matches;
  }

  /**
   * Normalized pointer position in [-1, 1] relative to element rect.
   * @param {DOMRect} rect
   * @param {number} clientX
   * @param {number} clientY
   */
  function normalizedPointer(rect, clientX, clientY) {
    if (rect.width < 1 || rect.height < 1) {
      return { mx: 0, my: 0 };
    }
    var mx = ((clientX - rect.left) / rect.width - 0.5) * 2;
    var my = ((clientY - rect.top) / rect.height - 0.5) * 2;
    return {
      mx: Math.max(-1, Math.min(1, mx)),
      my: Math.max(-1, Math.min(1, my)),
    };
  }

  /**
   * @param {number} mx
   * @param {number} my
   * @param {number} maxDeg
   */
  function tiltDegrees(mx, my, maxDeg) {
    return {
      rx: -my * maxDeg,
      ry: mx * maxDeg,
    };
  }

  function parseMaxDeg(el, fallback) {
    var v =
      el.getAttribute("data-ks-parallax-max") ||
      el.getAttribute("data-ks-tilt-max") ||
      el.getAttribute("data-ks-pointer-max");
    var n = v != null ? parseFloat(v) : fallback;
    if (!isFinite(n) || n <= 0) return fallback;
    return Math.min(n, 24);
  }

  /**
   * Apply CSS variables on element for holo / pointer-depth surfaces.
   * @param {HTMLElement} el
   * @param {number} mx
   * @param {number} my
   * @param {number} maxDeg
   */
  function applyCssVars(el, mx, my, maxDeg) {
    var t = tiltDegrees(mx, my, maxDeg);
    el.style.setProperty("--ks-rx", t.rx.toFixed(2) + "deg");
    el.style.setProperty("--ks-ry", t.ry.toFixed(2) + "deg");
    el.style.setProperty("--ks-glare-x", ((mx + 1) * 50).toFixed(1) + "%");
    el.style.setProperty("--ks-glare-y", ((my + 1) * 50).toFixed(1) + "%");
    el.style.setProperty(
      "--ks-light-angle",
      (135 + mx * 30 + my * 20).toFixed(0) + "deg"
    );
    el.style.setProperty("--holo-angle", (120 + mx * 40).toFixed(0) + "deg");
  }

  function clearCssVars(el) {
    el.style.removeProperty("--ks-rx");
    el.style.removeProperty("--ks-ry");
    el.style.removeProperty("--ks-glare-x");
    el.style.removeProperty("--ks-glare-y");
    el.style.removeProperty("--ks-light-angle");
    el.style.removeProperty("--holo-angle");
  }

  /**
   * Bind pointer tracking on wrap; optional inner receives transform string.
   * @param {HTMLElement} wrap
   * @param {{ inner?: HTMLElement, maxDeg?: number, onTransform?: function, mode?: string }} opts
   */
  function bind(wrap, opts) {
    if (wrap.dataset.ksPointerDepthBound) return;
    wrap.dataset.ksPointerDepthBound = "1";
    var inner = (opts && opts.inner) || null;
    var maxDeg = (opts && opts.maxDeg) || parseMaxDeg(wrap, 10);
    var onTransform = opts && opts.onTransform;
    var mode = (opts && opts.mode) || "transform";

    function onMove(ev) {
      if (disabled()) return;
      var rect = wrap.getBoundingClientRect();
      var p = normalizedPointer(rect, ev.clientX, ev.clientY);
      if (mode === "css-vars") {
        applyCssVars(wrap, p.mx, p.my, maxDeg);
        return;
      }
      var t = tiltDegrees(p.mx, p.my, maxDeg);
      var transform =
        "rotateX(" +
        t.rx +
        "deg) rotateY(" +
        t.ry +
        "deg) translateZ(8px)";
      if (onTransform) {
        onTransform(transform, p);
      } else if (inner) {
        inner.style.transform = transform;
      }
    }

    function onLeave() {
      if (mode === "css-vars") {
        clearCssVars(wrap);
      } else if (inner) {
        inner.style.transform = "";
      }
      if (onTransform) onTransform("", { mx: 0, my: 0 });
    }

    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerleave", onLeave);
    wrap.addEventListener("pointercancel", onLeave);
  }

  global.KsPointerDepth = {
    disabled: disabled,
    normalizedPointer: normalizedPointer,
    tiltDegrees: tiltDegrees,
    parseMaxDeg: parseMaxDeg,
    applyCssVars: applyCssVars,
    clearCssVars: clearCssVars,
    bind: bind,
  };
})(typeof window !== "undefined" ? window : globalThis);
