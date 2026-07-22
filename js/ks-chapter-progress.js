/**
 * Chapter reading progress bar.
 */
(function () {
  "use strict";

  function update(el) {
    var doc = document.documentElement;
    var scrollTop = doc.scrollTop || document.body.scrollTop;
    var height = doc.scrollHeight - doc.clientHeight;
    var pct = height > 0 ? (scrollTop / height) * 100 : 0;
    el.style.setProperty("--ks-read-progress", pct.toFixed(1) + "%");
    var bar = el.querySelector(".ks-chapter-progress__bar");
    if (bar) bar.style.width = pct.toFixed(1) + "%";
  }

  function init() {
    document.querySelectorAll("[data-ks-chapter-progress]").forEach(function (el) {
      if (el.dataset.ksChapterProgressBound) return;
      el.dataset.ksChapterProgressBound = "1";
      function onScroll() {
        update(el);
      }
      window.addEventListener("scroll", onScroll, { passive: true });
      update(el);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
