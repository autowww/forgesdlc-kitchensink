/**
 * Tab swimlane sync — tabs scroll to sections; swimlanes init when present.
 */
(function () {
  "use strict";

  function init(root) {
    if (root.dataset.ksTabSwimlaneBound) return;
    root.dataset.ksTabSwimlaneBound = "1";
    var tabs = root.querySelectorAll(".ks-tab-swimlane__tab");
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        var target = tab.getAttribute("data-ks-tab-target");
        tabs.forEach(function (t) {
          t.classList.toggle("is-active", t === tab);
        });
        if (target) {
          var el = root.querySelector(target) || document.querySelector(target);
          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });
    if (window.ForgeSectionSwimlanes && root.querySelector("[data-fs-section-lane]")) {
      window.ForgeSectionSwimlanes.init({
        dockSelector: "#" + root.id + " .ks-tab-swimlane__dock",
        headerSelector: ".site-header",
      });
    }
  }

  function boot() {
    document.querySelectorAll("[data-ks-tab-swimlane]").forEach(init);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
