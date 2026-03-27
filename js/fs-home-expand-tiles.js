/**
 * Homepage expand tiles: pointer hover (with leave delay), focus-within,
 * Escape to close; narrow viewports and coarse pointers toggle via tap.
 */
(function () {
  "use strict";

  var LEAVE_DELAY_MS = 200;
  var POINTER_FOCUS_GUARD_MS = 450;
  var mqNarrow = window.matchMedia("(max-width: 991.98px)");
  var mqCoarse = window.matchMedia("(pointer: coarse)");
  var lastPointerDown = 0;

  document.addEventListener(
    "pointerdown",
    function () {
      lastPointerDown = Date.now();
    },
    true
  );

  function setExpanded(tile, open) {
    var inner = tile.querySelector(".fs-expand-tile__panel-inner");
    if (open) {
      tile.classList.add("fs-expand-tile--expanded");
      tile.setAttribute("aria-expanded", "true");
      if (inner) inner.removeAttribute("inert");
    } else {
      tile.classList.remove("fs-expand-tile--expanded");
      tile.setAttribute("aria-expanded", "false");
      if (inner) inner.setAttribute("inert", "");
    }
  }

  function bindTile(tile) {
    if (tile.dataset.fsExpandTileBound) return;
    tile.dataset.fsExpandTileBound = "1";

    var inner = tile.querySelector(".fs-expand-tile__panel-inner");
    if (inner && !tile.classList.contains("fs-expand-tile--expanded")) {
      inner.setAttribute("inert", "");
    }

    var leaveTimer = null;

    function cancelLeaveTimer() {
      if (leaveTimer) {
        clearTimeout(leaveTimer);
        leaveTimer = null;
      }
    }

    function schedulePointerClose() {
      if (mqNarrow.matches || mqCoarse.matches) return;
      cancelLeaveTimer();
      leaveTimer = setTimeout(function () {
        leaveTimer = null;
        setExpanded(tile, false);
      }, LEAVE_DELAY_MS);
    }

    function pointerOpen() {
      if (mqNarrow.matches || mqCoarse.matches) return;
      cancelLeaveTimer();
      setExpanded(tile, true);
    }

    tile.addEventListener("mouseenter", pointerOpen);
    tile.addEventListener("mouseleave", schedulePointerClose);

    tile.addEventListener("focusin", function () {
      cancelLeaveTimer();
      if (mqNarrow.matches || mqCoarse.matches) {
        if (Date.now() - lastPointerDown < POINTER_FOCUS_GUARD_MS) return;
      }
      setExpanded(tile, true);
    });

    tile.addEventListener("focusout", function (ev) {
      if (tile.contains(ev.relatedTarget)) return;
      cancelLeaveTimer();
      requestAnimationFrame(function () {
        if (!tile.contains(document.activeElement)) setExpanded(tile, false);
      });
    });

    tile.addEventListener("keydown", function (ev) {
      if (ev.key !== "Escape") return;
      if (!tile.classList.contains("fs-expand-tile--expanded")) return;
      ev.stopPropagation();
      cancelLeaveTimer();
      setExpanded(tile, false);
      if (typeof tile.focus === "function") tile.focus();
    });

    tile.addEventListener(
      "click",
      function (ev) {
        if (!mqNarrow.matches && !mqCoarse.matches) return;
        if (ev.target.closest && ev.target.closest("a[href]")) return;
        ev.preventDefault();
        var next = !tile.classList.contains("fs-expand-tile--expanded");
        cancelLeaveTimer();
        setExpanded(tile, next);
      },
      true
    );
  }

  function init() {
    document.querySelectorAll("[data-fs-expand-tile]").forEach(bindTile);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
