/**
 * Toggle SVG diagram tiles vs monospace ASCII fallback inside .forge-diagram-dual figures.
 */
(function () {
  "use strict";

  function showAsciiView(fig, btn, svgPanel, asciiPanel, labelSvg) {
    fig.setAttribute("data-diagram-view", "ascii");
    svgPanel.hidden = true;
    asciiPanel.hidden = false;
    btn.setAttribute("aria-pressed", "true");
    btn.textContent = labelSvg;
  }

  function showSvgView(fig, btn, svgPanel, asciiPanel, labelAscii) {
    fig.setAttribute("data-diagram-view", "svg");
    svgPanel.hidden = false;
    asciiPanel.hidden = true;
    btn.setAttribute("aria-pressed", "false");
    btn.textContent = labelAscii;
  }

  function svgTileFailed(img) {
    return !img || img.naturalWidth === 0 || img.naturalHeight === 0;
  }

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
    var img = svgPanel.querySelector("img");

    function maybeFallbackToAscii() {
      if (fig.getAttribute("data-diagram-view") !== "svg") {
        return;
      }
      if (!svgTileFailed(img)) {
        return;
      }
      fig.classList.add("forge-diagram-dual--svg-unavailable");
      showAsciiView(fig, btn, svgPanel, asciiPanel, labelSvg);
    }

    if (img) {
      var probeAttempts = 0;
      function probeSvg() {
        probeAttempts += 1;
        if (!svgTileFailed(img)) {
          return;
        }
        if (probeAttempts < 8) {
          window.setTimeout(probeSvg, 200);
          return;
        }
        maybeFallbackToAscii();
      }
      img.addEventListener("error", maybeFallbackToAscii);
      if (img.complete) {
        probeSvg();
      } else {
        img.addEventListener("load", probeSvg);
      }
    }

    btn.addEventListener("click", function () {
      var isAscii = fig.getAttribute("data-diagram-view") === "ascii";
      if (isAscii) {
        showSvgView(fig, btn, svgPanel, asciiPanel, labelAscii);
      } else {
        showAsciiView(fig, btn, svgPanel, asciiPanel, labelSvg);
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
