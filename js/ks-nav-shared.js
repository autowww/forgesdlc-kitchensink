/**
 * KS nav & layout — shared focus trap and reduced-motion helpers.
 */
(function (global) {
  "use strict";

  var mqReduce = global.matchMedia("(prefers-reduced-motion: reduce)");

  function disabled() {
    return mqReduce.matches;
  }

  function trapFocus(container, ev) {
    if (ev.key !== "Tab" || !container) return;
    var focusable = container.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (!focusable.length) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (ev.shiftKey && document.activeElement === first) {
      ev.preventDefault();
      last.focus();
    } else if (!ev.shiftKey && document.activeElement === last) {
      ev.preventDefault();
      first.focus();
    }
  }

  global.KsNavShared = {
    disabled: disabled,
    trapFocus: trapFocus,
  };

  function headerSelectorForDock() {
    if (document.querySelector(".site-header")) return ".site-header";
    if (document.querySelector(".swim-demo-header")) return ".swim-demo-header";
    return ".cap-header";
  }

  function initDocks() {
    if (!global.ForgeSectionSwimlanes) return;
    document.querySelectorAll(".ks-nav-dock").forEach(function (el) {
      var dock = el.querySelector(".fs-section-swimlanes");
      if (!dock || !dock.id || dock.dataset.ksNavDockBound) return;
      dock.dataset.ksNavDockBound = "1";
      global.ForgeSectionSwimlanes.init({
        dockSelector: "#" + dock.id,
        headerSelector: headerSelectorForDock(),
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initDocks);
  } else {
    initDocks();
  }
})(typeof window !== "undefined" ? window : globalThis);
