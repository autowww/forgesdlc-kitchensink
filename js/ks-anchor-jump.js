/**
 * Horizontal anchor jump menu — sticky bar with scroll-spy.
 */
(function () {
  "use strict";

  function init(root) {
    if (root.dataset.ksAnchorJumpBound) return;
    root.dataset.ksAnchorJumpBound = "1";
    var links = root.querySelectorAll(".ks-anchor-jump__link");
    var sections = root.querySelectorAll(".ks-section[id]");

    links.forEach(function (link) {
      link.addEventListener("click", function (ev) {
        var href = link.getAttribute("href");
        if (!href || href.charAt(0) !== "#") return;
        var target = document.querySelector(href);
        if (target) {
          ev.preventDefault();
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });

    if (!sections.length) return;
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var id = "#" + entry.target.id;
          links.forEach(function (a) {
            a.classList.toggle("is-active", a.getAttribute("href") === id);
          });
        });
      },
      { rootMargin: "-30% 0px -55% 0px" }
    );
    sections.forEach(function (sec) {
      observer.observe(sec);
    });
  }

  function boot() {
    document.querySelectorAll("[data-ks-anchor-jump]").forEach(init);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
