/**
 * View Transitions API demo — opt-in with reduced-motion guard.
 */
(function () {
  "use strict";

  var mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  function init(root) {
    if (root.dataset.ksViewTransitionBound) return;
    root.dataset.ksViewTransitionBound = "1";
    var trigger = root.querySelector("[data-ks-vt-trigger]");
    var hero = root.querySelector(".ks-view-transition__hero");
    var detail = root.querySelector(".ks-view-transition__detail");
    if (!trigger || !hero || !detail) return;

    trigger.addEventListener("click", function () {
      function swap() {
        hero.hidden = true;
        detail.hidden = false;
      }
      if (mqReduce.matches || !document.startViewTransition) {
        swap();
        return;
      }
      document.startViewTransition(swap);
    });
  }

  function boot() {
    document.querySelectorAll("[data-ks-view-transition]").forEach(init);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
