/**
 * Bottom sheet — slide-up panel with backdrop dismiss.
 */
(function () {
  "use strict";

  function init(root) {
    if (root.dataset.ksBottomSheetBound) return;
    root.dataset.ksBottomSheetBound = "1";
    var panel = root.querySelector(".ks-bottom-sheet__panel");
    var backdrop = root.querySelector(".ks-bottom-sheet__backdrop");
    var openBtn = root.querySelector("[data-ks-sheet-open]");
    var closeBtn = root.querySelector("[data-ks-sheet-close]");

    function open() {
      if (panel) panel.hidden = false;
      if (backdrop) backdrop.hidden = false;
    }

    function close() {
      if (panel) panel.hidden = true;
      if (backdrop) backdrop.hidden = true;
    }

    if (openBtn) openBtn.addEventListener("click", open);
    if (closeBtn) closeBtn.addEventListener("click", close);
    if (backdrop) backdrop.addEventListener("click", close);
  }

  function boot() {
    document.querySelectorAll("[data-ks-bottom-sheet]").forEach(init);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
