/**
 * Mega-menu panel toggle with Escape and focus trap.
 */
(function () {
  "use strict";

  var KNS = window.KsNavShared;

  function init(root) {
    if (root.dataset.ksMegaMenuBound) return;
    root.dataset.ksMegaMenuBound = "1";
    var btn = root.querySelector(".ks-mega-menu__trigger");
    var panel = root.querySelector(".ks-mega-menu__panel");
    if (!btn || !panel) return;

    function open() {
      panel.hidden = false;
      btn.setAttribute("aria-expanded", "true");
      var first = panel.querySelector("a, button");
      if (first) first.focus();
    }

    function close() {
      panel.hidden = true;
      btn.setAttribute("aria-expanded", "false");
      btn.focus();
    }

    btn.addEventListener("click", function () {
      if (panel.hidden) open();
      else close();
    });

    document.addEventListener("keydown", function (ev) {
      if (!panel.hidden && ev.key === "Escape") close();
      if (!panel.hidden && ev.key === "Tab" && KNS) KNS.trapFocus(panel, ev);
    });

    document.addEventListener("click", function (ev) {
      if (!root.contains(ev.target) && !panel.hidden) close();
    });
  }

  function boot() {
    document.querySelectorAll("[data-ks-mega-menu]").forEach(init);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
