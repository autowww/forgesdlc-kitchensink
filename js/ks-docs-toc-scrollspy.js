/**
 * Scroll-spy for .forge-toc inside [data-ks-scroll-spy].
 */
(function () {
  "use strict";

  function init(root) {
    if (root.dataset.ksScrollSpyBound) return;
    root.dataset.ksScrollSpyBound = "1";
    var sections = root.querySelectorAll(".ks-section[id]");
    var links = root.querySelectorAll(".forge-toc .nav-link");
    if (!sections.length || !links.length) return;

    function setActive(id) {
      var sel = "#" + id;
      links.forEach(function (a) {
        a.classList.toggle("active", a.getAttribute("href") === sel);
      });
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-20% 0px -60% 0px" }
    );
    sections.forEach(function (sec) {
      observer.observe(sec);
    });
  }

  function boot() {
    document.querySelectorAll("[data-ks-scroll-spy]").forEach(init);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
