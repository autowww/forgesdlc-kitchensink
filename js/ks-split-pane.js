/**
 * Split-pane resizer — drag gutter to resize columns.
 */
(function () {
  "use strict";

  function init(root) {
    if (root.dataset.ksSplitPaneBound) return;
    root.dataset.ksSplitPaneBound = "1";
    var gutter = root.querySelector(".ks-split-pane__gutter");
    var primary = root.querySelector(".ks-split-pane__primary");
    if (!gutter || !primary) return;

    var dragging = false;
    var startX = 0;
    var startW = 0;

    function onMove(ev) {
      if (!dragging) return;
      var delta = ev.clientX - startX;
      var next = Math.max(120, Math.min(root.clientWidth - 120, startW + delta));
      root.style.setProperty("--ks-split-primary", next + "px");
    }

    function onUp() {
      dragging = false;
      document.body.style.cursor = "";
    }

    gutter.addEventListener("pointerdown", function (ev) {
      dragging = true;
      startX = ev.clientX;
      startW = primary.getBoundingClientRect().width;
      document.body.style.cursor = "col-resize";
      gutter.setPointerCapture(ev.pointerId);
    });
    gutter.addEventListener("pointermove", onMove);
    gutter.addEventListener("pointerup", onUp);
    gutter.addEventListener("pointercancel", onUp);
  }

  function boot() {
    document.querySelectorAll("[data-ks-split-pane]").forEach(init);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
