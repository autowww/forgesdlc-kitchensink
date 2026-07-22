/**
 * Editorial peek rail — keyboard arrow scroll on fs-rail--peek.
 */
(function () {
  "use strict";

  function init(root) {
    if (root.dataset.ksPeekRailBound) return;
    root.dataset.ksPeekRailBound = "1";
    var scroller = root.querySelector(".fs-rail__scroller") || root;
    var prev = root.querySelector(".ks-editorial-peek-rail__prev");
    var next = root.querySelector(".ks-editorial-peek-rail__next");
    var step = 200;

    if (prev) {
      prev.addEventListener("click", function () {
        scroller.scrollBy({ left: -step, behavior: "smooth" });
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        scroller.scrollBy({ left: step, behavior: "smooth" });
      });
    }

    root.addEventListener("keydown", function (ev) {
      if (ev.key === "ArrowLeft") scroller.scrollBy({ left: -step, behavior: "smooth" });
      if (ev.key === "ArrowRight") scroller.scrollBy({ left: step, behavior: "smooth" });
    });
  }

  function boot() {
    document.querySelectorAll("[data-ks-peek-rail]").forEach(init);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
