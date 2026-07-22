/**
 * KS dynamic mind-map — collapse, reflow, keyboard toggle.
 */
(function () {
  "use strict";

  var L = window.KsMindmapLayout;
  if (!L) return;

  var mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = s == null ? "" : String(s);
    return d.innerHTML;
  }

  function parseData(mount) {
    var script = mount.querySelector("[data-ks-mindmap-data]");
    if (!script) return null;
    try {
      return JSON.parse(script.textContent || "{}");
    } catch (e) {
      return null;
    }
  }

  function posMap(nodes) {
    var m = {};
    for (var i = 0; i < nodes.length; i++) {
      m[nodes[i].id] = nodes[i];
    }
    return m;
  }

  function renderSvg(mount, root, collapsed, containerWidth) {
    var viewport = mount.querySelector("[data-ks-mindmap-viewport]");
    if (!viewport || !root) return;

    var layout = L.layoutTree(root, collapsed, containerWidth);
    var pmap = posMap(layout.nodes);
    var lines = [];
    L.buildConnectors(root, pmap, collapsed, lines);

    var parts = [];
    parts.push(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' +
        layout.width +
        " " +
        layout.height +
        '" width="' +
        layout.width +
        '" height="' +
        layout.height +
        '" role="img">'
    );
    parts.push('<rect width="100%" height="100%" fill="#ffffff"/>');

    for (var li = 0; li < lines.length; li++) {
      parts.push(
        '<path d="' +
          lines[li].d +
          '" fill="none" stroke="#94a3b8" stroke-width="1.25"/>'
      );
    }

    for (var ni = 0; ni < layout.nodes.length; ni++) {
      var n = layout.nodes[ni];
      var rx = n.isRoot ? 6 : 4;
      var stroke = n.isRoot ? "#0f766e" : "#cbd5e1";
      var fill = n.isRoot ? "#f0fdfa" : "#ffffff";
      var fw = n.depth <= 1 ? "700" : "600";
      var fs = n.isRoot ? 12 : 10.5;
      var tab = n.hasChildren ? "0" : "-1";
      parts.push(
        '<g class="ks-mindmap__node" data-ks-mm-node="' +
          esc(n.id) +
          '" tabindex="' +
          tab +
          '" role="treeitem" aria-expanded="' +
          (n.collapsed ? "false" : "true") +
          '">'
      );
      parts.push(
        '<rect x="' +
          n.x.toFixed(1) +
          '" y="' +
          n.y.toFixed(1) +
          '" width="' +
          n.w.toFixed(1) +
          '" height="' +
          n.h.toFixed(1) +
          '" rx="' +
          rx +
          '" fill="' +
          fill +
          '" stroke="' +
          stroke +
          '" stroke-width="1.25"/>'
      );
      if (n.hasChildren) {
        var cx = n.x + n.w - 14;
        var cy = n.y + n.h / 2;
        var chev = n.collapsed ? "▸" : "▾";
        parts.push(
          '<text class="ks-mindmap__chevron" data-ks-mm-chevron="' +
            esc(n.id) +
            '" x="' +
            cx.toFixed(1) +
            '" y="' +
            (cy + 4).toFixed(1) +
            '" font-size="10" fill="#64748b">' +
            chev +
            "</text>"
        );
      }
      parts.push(
        '<text x="' +
          (n.x + n.w / 2).toFixed(1) +
          '" y="' +
          (n.y + n.h / 2 + 4).toFixed(1) +
          '" text-anchor="middle" font-family="system-ui,sans-serif" font-size="' +
          fs +
          '" font-weight="' +
          fw +
          '" fill="#0f172a" pointer-events="none">' +
          esc(n.label) +
          "</text>"
      );
      parts.push("</g>");
    }
    parts.push("</svg>");
    viewport.innerHTML = parts.join("");

    mount.classList.toggle("ks-mindmap--narrow", layout.mode === "narrow");
  }

  function toggleNode(state, nodeId) {
    if (state.collapsed[nodeId]) {
      delete state.collapsed[nodeId];
    } else {
      state.collapsed[nodeId] = true;
    }
  }

  function bindInteractions(mount, state) {
    var viewport = mount.querySelector("[data-ks-mindmap-viewport]");
    if (!viewport) return;

    function reflow() {
      var w = mount.getBoundingClientRect().width;
      renderSvg(mount, state.root, state.collapsed, w);
      bindInteractions(mount, state);
    }

    viewport.addEventListener("click", function (ev) {
      var chev = ev.target.closest("[data-ks-mm-chevron]");
      var node = ev.target.closest("[data-ks-mm-node]");
      var id = chev
        ? chev.getAttribute("data-ks-mm-chevron")
        : node
          ? node.getAttribute("data-ks-mm-node")
          : null;
      if (!id || !state.collapsible) return;
      var target = ev.target.closest("[data-ks-mm-node]");
      if (!target) return;
      var hit = findNode(state.root, id);
      if (!hit || !(hit.children || []).length) return;
      toggleNode(state, id);
      reflow();
    });

    viewport.addEventListener("keydown", function (ev) {
      if (ev.key !== "Enter" && ev.key !== " ") return;
      var node = ev.target.closest("[data-ks-mm-node]");
      if (!node || !state.collapsible) return;
      ev.preventDefault();
      var id = node.getAttribute("data-ks-mm-node");
      toggleNode(state, id);
      reflow();
    });
  }

  function findNode(node, id) {
    if (!node) return null;
    if (node.id === id) return node;
    var kids = node.children || [];
    for (var i = 0; i < kids.length; i++) {
      var found = findNode(kids[i], id);
      if (found) return found;
    }
    return null;
  }

  function initMount(mount) {
    var data = parseData(mount);
    if (!data || !data.root) return;
    var collapsible = mount.getAttribute("data-ks-mindmap-collapsible") !== "0";
    var initialDepth = parseInt(
      mount.getAttribute("data-ks-mindmap-initial-depth") || "1",
      10
    );
    var state = {
      root: data.root,
      collapsible: collapsible,
      collapsed: collapsible
        ? L.initialCollapsedState(data.root, initialDepth)
        : {},
    };

    function reflow() {
      var w = mount.getBoundingClientRect().width;
      renderSvg(mount, state.root, state.collapsed, w);
      bindInteractions(mount, state);
    }

    reflow();

    if (typeof ResizeObserver !== "undefined") {
      var ro = new ResizeObserver(function () {
        reflow();
      });
      ro.observe(mount);
    } else {
      window.addEventListener("resize", reflow, { passive: true });
    }
  }

  function init() {
    var mounts = document.querySelectorAll("[data-ks-mindmap]");
    for (var i = 0; i < mounts.length; i++) {
      if (mounts[i].getAttribute("data-ks-mindmap-editable")) continue;
      initMount(mounts[i]);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
