/**
 * Command palette — / shortcut, overlay focus trap.
 */
(function () {
  "use strict";

  var KNS = window.KsNavShared;

  function init(root) {
    if (root.dataset.ksCommandPaletteBound) return;
    root.dataset.ksCommandPaletteBound = "1";
    var overlay = root.querySelector(".ks-command-palette__overlay");
    var openBtn = root.querySelector("[data-ks-cmd-open]");
    var input = overlay ? overlay.querySelector("input") : null;
    if (!overlay) return;

    function open() {
      overlay.hidden = false;
      if (input) input.focus();
    }

    function close() {
      overlay.hidden = true;
      if (openBtn) openBtn.focus();
    }

    if (openBtn) openBtn.addEventListener("click", open);
    overlay.addEventListener("click", function (ev) {
      if (ev.target === overlay) close();
    });

    document.addEventListener("keydown", function (ev) {
      if (ev.key === "/" && !ev.target.matches("input, textarea")) {
        ev.preventDefault();
        open();
      }
      if (!overlay.hidden && ev.key === "Escape") close();
      if (!overlay.hidden && ev.key === "Tab" && KNS) {
        KNS.trapFocus(overlay.querySelector(".ks-command-palette__dialog"), ev);
      }
    });
  }

  function boot() {
    document.querySelectorAll("[data-ks-command-palette]").forEach(init);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
