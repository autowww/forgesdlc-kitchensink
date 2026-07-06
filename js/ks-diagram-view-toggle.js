/**
 * Toggle SVG diagram tiles vs monospace ASCII fallback inside .forge-diagram-dual figures.
 */
(function () {
  "use strict";

  function bindFigure(fig) {
    var btn = fig.querySelector(".forge-diagram-view-toggle");
    if (!btn || btn.dataset.ksDiagramToggleBound === "1") {
      return;
    }
    btn.dataset.ksDiagramToggleBound = "1";
    var svgPanel = fig.querySelector('[data-panel="svg"]');
    var asciiPanel = fig.querySelector('[data-panel="ascii"]');
    if (!svgPanel || !asciiPanel) {
      return;
    }
    var labelAscii = btn.getAttribute("data-label-ascii") || "ASCII view";
    var labelSvg = btn.getAttribute("data-label-svg") || "Diagram view";

    btn.addEventListener("click", function () {
      var isAscii = fig.getAttribute("data-diagram-view") === "ascii";
      if (isAscii) {
        fig.setAttribute("data-diagram-view", "svg");
        svgPanel.hidden = false;
        asciiPanel.hidden = true;
        btn.setAttribute("aria-pressed", "false");
        btn.textContent = labelAscii;
      } else {
        fig.setAttribute("data-diagram-view", "ascii");
        svgPanel.hidden = true;
        asciiPanel.hidden = false;
        btn.setAttribute("aria-pressed", "true");
        btn.textContent = labelSvg;
      }
    });
  }

  function init() {
    document.querySelectorAll(".forge-diagram-dual").forEach(bindFigure);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
