/**
 * Scroll-linked spatial typography (floating header / display depth).
 */
(function () {
  "use strict";

  var mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  function updateFloat(el) {
    var text = el.querySelector(".ks-display--depth__text");
    if (!text) return;
    var rect = el.getBoundingClientRect();
    var vh = window.innerHeight || 1;
    var center = rect.top + rect.height * 0.5;
    var progress = 1 - Math.min(1, Math.max(0, center / vh));
    var rx = 6 + progress * 10;
    var tz = 16 + progress * 20;
    text.style.transform =
      "rotateX(" + rx.toFixed(2) + "deg) translateZ(" + tz.toFixed(1) + "px)";
  }

  function init() {
    var els = document.querySelectorAll(".ks-display--depth--float");
    if (!els.length || mqReduce.matches) return;

    els.forEach(function (el) {
      el.classList.add("is-scroll-tilt");
    });

    function onScroll() {
      els.forEach(updateFloat);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    onScroll();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
