/**
 * Draggable 3D cube with dynamic face lighting (opacity from angle).
 */
(function () {
  "use strict";

  var mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  function bindCube(root) {
    if (root.dataset.ksSpatialCubeBound) return;
    root.dataset.ksSpatialCubeBound = "1";
    var scene = root.querySelector(".ks-cube--draggable__scene");
    if (!scene) return;

    var faces = scene.querySelectorAll(".ks-cube--draggable__face");
    var size = 80;
    var rotX = -18;
    var rotY = 24;
    var dragging = false;
    var lastX = 0;
    var lastY = 0;

    function applyTransform() {
      scene.style.transform =
        "rotateX(" + rotX + "deg) rotateY(" + rotY + "deg)";
      faces.forEach(function (face, i) {
        var opacity = 0.35 + 0.65 * Math.abs(Math.cos((rotY + i * 60) * 0.017));
        face.style.opacity = String(Math.min(1, opacity));
      });
    }

    function setFaceTransforms() {
      var transforms = [
        "translateZ(" + size + "px)",
        "rotateY(180deg) translateZ(" + size + "px)",
        "rotateY(90deg) translateZ(" + size + "px)",
        "rotateY(-90deg) translateZ(" + size + "px)",
        "rotateX(90deg) translateZ(" + size + "px)",
        "rotateX(-90deg) translateZ(" + size + "px)",
      ];
      faces.forEach(function (face, i) {
        face.style.transform = transforms[i] || transforms[0];
      });
    }

    setFaceTransforms();
    applyTransform();

    if (mqReduce.matches) return;

    function onDown(ev) {
      dragging = true;
      lastX = ev.clientX;
      lastY = ev.clientY;
      root.setPointerCapture(ev.pointerId);
    }
    function onMove(ev) {
      if (!dragging) return;
      rotY += (ev.clientX - lastX) * 0.4;
      rotX -= (ev.clientY - lastY) * 0.4;
      rotX = Math.max(-60, Math.min(60, rotX));
      lastX = ev.clientX;
      lastY = ev.clientY;
      applyTransform();
    }
    function onUp(ev) {
      dragging = false;
      try {
        root.releasePointerCapture(ev.pointerId);
      } catch (_e) {
        /* ignore */
      }
    }

    root.addEventListener("pointerdown", onDown);
    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerup", onUp);
    root.addEventListener("pointercancel", onUp);
  }

  function init() {
    document.querySelectorAll(".ks-cube--draggable").forEach(bindCube);
    document.querySelectorAll(".ks-cube-gallery").forEach(function (gal) {
      var scene = gal.querySelector(".ks-cube-gallery__scene");
      if (!scene || gal.dataset.ksCubeGalleryBound) return;
      gal.dataset.ksCubeGalleryBound = "1";
      gal.addEventListener("pointermove", function (ev) {
        if (mqReduce.matches) return;
        var r = gal.getBoundingClientRect();
        var mx = ((ev.clientX - r.left) / r.width - 0.5) * 60;
        scene.style.setProperty("--ks-cube-y", mx.toFixed(1) + "deg");
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
