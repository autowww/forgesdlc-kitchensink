/**
 * KS roadmap bar drag — move along columns + resize handles (editable dynamic only).
 */
(function () {
  "use strict";

  var L = window.KsRoadmapLayout;
  var G = window.KsRoadmapGrid;

  function colWidth(viewport) {
    var grid = viewport.querySelector(".ks-nrm-grid");
    if (!grid) return 80;
    var heads = grid.querySelectorAll(".ks-nrm-col-head");
    if (!heads.length) return 80;
    return heads[0].getBoundingClientRect().width || 80;
  }

  function bindDrag(ctx) {
    if (!ctx.draggable || !L || !G) return;
    var viewport = ctx.viewport;
    if (!viewport) return;

    viewport.addEventListener("pointerdown", function (ev) {
      var handle = ev.target.closest(".ks-roadmap__resize-handle");
      var barEl = ev.target.closest("[data-ks-rm-bar-id]");
      if (!barEl) return;
      var barId = barEl.getAttribute("data-ks-rm-bar-id");
      var bar = ctx.findBar(barId);
      if (!bar) return;

      var mode = handle
        ? handle.getAttribute("data-ks-rm-resize")
        : "move";
      ev.preventDefault();
      barEl.setPointerCapture(ev.pointerId);
      barEl.classList.add("is-dragging");
      ctx.selectBar(barId);

      var startX = ev.clientX;
      var cmap = L.columnIndexMap(ctx.level.columns);
      var startIdx = cmap[bar.startColumnId];
      var endIdx = cmap[bar.endColumnId];
      var span = endIdx - startIdx;

      function onMove(e) {
        var cw = colWidth(viewport);
        var delta = Math.round((e.clientX - startX) / cw);
        if (mode === "move") {
          var ns = Math.max(
            0,
            Math.min(startIdx + delta, ctx.level.columns.length - 1 - span)
          );
          bar.startColumnId = ctx.level.columns[ns].id;
          bar.endColumnId = ctx.level.columns[ns + span].id;
        } else if (mode === "start") {
          L.resizeBarColumn(ctx.level, bar, "start", delta);
        } else if (mode === "end") {
          L.resizeBarColumn(ctx.level, bar, "end", delta);
        }
        ctx.paint();
        L.syncDateRowFromBar(ctx.level, bar, ctx.doc.date_rows);
        ctx.syncDateInputs();
      }

      function onUp() {
        barEl.classList.remove("is-dragging");
        barEl.removeEventListener("pointermove", onMove);
        barEl.removeEventListener("pointerup", onUp);
        barEl.removeEventListener("pointercancel", onUp);
      }

      barEl.addEventListener("pointermove", onMove);
      barEl.addEventListener("pointerup", onUp);
      barEl.addEventListener("pointercancel", onUp);
    });

    viewport.addEventListener("keydown", function (ev) {
      var barEl = ev.target.closest("[data-ks-rm-bar-id]");
      if (!barEl || !ctx.selectedBarId) return;
      var bar = ctx.findBar(ctx.selectedBarId);
      if (!bar) return;
      var delta = 0;
      if (ev.key === "ArrowLeft") delta = -1;
      if (ev.key === "ArrowRight") delta = 1;
      if (!delta) return;
      ev.preventDefault();
      if (ev.shiftKey) {
        L.resizeBarColumn(ctx.level, bar, ev.altKey ? "start" : "end", delta);
      } else {
        L.moveBarColumns(ctx.level, bar, delta);
      }
      ctx.paint();
      L.syncDateRowFromBar(ctx.level, bar, ctx.doc.date_rows);
      ctx.syncDateInputs();
    });
  }

  window.KsRoadmapDrag = { bindDrag: bindDrag };
})();
