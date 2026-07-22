/**
 * KS mind-map layout — layered tree positions with collapse + narrow regroup.
 * Pure functions exported for unit tests via global.KsMindmapLayout.
 */
(function (global) {
  "use strict";

  var NODE_W = 148;
  var NODE_H = 34;
  var H_GAP = 20;
  var V_GAP = 52;
  var PAD = 24;
  var NARROW_BREAK = 480;

  function leafSpan(node, collapsed) {
    if (collapsed[node.id]) return 1;
    var kids = node.children || [];
    if (!kids.length) return 1;
    var total = 0;
    for (var i = 0; i < kids.length; i++) {
      total += leafSpan(kids[i], collapsed);
    }
    return total;
  }

  function layoutHorizontal(node, depth, xCenter, collapsed, out) {
    var kids = node.children || [];
    var y = PAD + depth * (NODE_H + V_GAP);
    out.push({
      id: node.id,
      label: node.label || "",
      depth: depth,
      x: xCenter - NODE_W / 2,
      y: y,
      w: NODE_W,
      h: NODE_H,
      isRoot: depth === 0,
      hasChildren: kids.length > 0,
      collapsed: !!collapsed[node.id],
    });
    if (!kids.length || collapsed[node.id]) return;
    var totalSpan = 0;
    for (var i = 0; i < kids.length; i++) {
      totalSpan += leafSpan(kids[i], collapsed);
    }
    var cursor =
      xCenter - (totalSpan * (NODE_W + H_GAP)) / 2 + (NODE_W + H_GAP) / 2;
    for (var j = 0; j < kids.length; j++) {
      var span = leafSpan(kids[j], collapsed);
      var childCenter = cursor + (span * (NODE_W + H_GAP) - H_GAP) / 2;
      layoutHorizontal(kids[j], depth + 1, childCenter, collapsed, out);
      cursor += span * (NODE_W + H_GAP);
    }
  }

  function layoutNarrow(root, collapsed) {
    var out = [];
    var y = PAD;
    function walk(node, depth) {
      var kids = node.children || [];
      out.push({
        id: node.id,
        label: node.label || "",
        depth: depth,
        x: PAD,
        y: y,
        w: NODE_W,
        h: NODE_H,
        isRoot: depth === 0,
        hasChildren: kids.length > 0,
        collapsed: !!collapsed[node.id],
      });
      y += NODE_H + 16;
      if (collapsed[node.id]) return;
      for (var i = 0; i < kids.length; i++) {
        walk(kids[i], depth + 1);
      }
    }
    walk(root, 0);
    var width = NODE_W + PAD * 2;
    var height = y + PAD;
    return { nodes: out, width: width, height: height, mode: "narrow" };
  }

  function layoutTree(root, collapsed, containerWidth) {
    collapsed = collapsed || {};
    if (!root) {
      return { nodes: [], width: 320, height: 120, mode: "horizontal" };
    }
    if (containerWidth > 0 && containerWidth < NARROW_BREAK) {
      return layoutNarrow(root, collapsed);
    }
    var nodes = [];
    layoutHorizontal(root, 0, PAD + NODE_W, collapsed, nodes);
    if (nodes.length) {
      var minX = nodes[0].x;
      for (var mi = 1; mi < nodes.length; mi++) {
        minX = Math.min(minX, nodes[mi].x);
      }
      if (minX < PAD) {
        var shift = PAD - minX;
        for (var si = 0; si < nodes.length; si++) {
          nodes[si].x += shift;
        }
      }
    }
    var maxX = PAD;
    var maxY = PAD + NODE_H;
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      maxX = Math.max(maxX, n.x + n.w);
      maxY = Math.max(maxY, n.y + n.h);
    }
    return {
      nodes: nodes,
      width: Math.max(Math.ceil(maxX + PAD), 320),
      height: Math.ceil(maxY + PAD),
      mode: "horizontal",
    };
  }

  function buildConnectors(root, posMap, collapsed, lines) {
    if (!root || collapsed[root.id]) return;
    var parent = posMap[root.id];
    if (!parent) return;
    var px = parent.x + parent.w / 2;
    var py = parent.y + parent.h;
    var kids = root.children || [];
    for (var i = 0; i < kids.length; i++) {
      var child = kids[i];
      var cpos = posMap[child.id];
      if (!cpos) continue;
      var cx = cpos.x + cpos.w / 2;
      var cy = cpos.y;
      var midY = py + (cy - py) / 2;
      lines.push({
        d:
          "M " +
          px.toFixed(1) +
          " " +
          py.toFixed(1) +
          " L " +
          px.toFixed(1) +
          " " +
          midY.toFixed(1) +
          " L " +
          cx.toFixed(1) +
          " " +
          midY.toFixed(1) +
          " L " +
          cx.toFixed(1) +
          " " +
          cy.toFixed(1),
      });
      buildConnectors(child, posMap, collapsed, lines);
    }
  }

  function initialCollapsedState(root, maxDepth) {
    var collapsed = {};
    function walk(node, depth) {
      var kids = node.children || [];
      if (kids.length && depth >= maxDepth) {
        collapsed[node.id] = true;
      }
      for (var i = 0; i < kids.length; i++) {
        walk(kids[i], depth + 1);
      }
    }
    if (root) walk(root, 0);
    return collapsed;
  }

  global.KsMindmapLayout = {
    NODE_W: NODE_W,
    NODE_H: NODE_H,
    H_GAP: H_GAP,
    V_GAP: V_GAP,
    PAD: PAD,
    NARROW_BREAK: NARROW_BREAK,
    leafSpan: leafSpan,
    layoutTree: layoutTree,
    buildConnectors: buildConnectors,
    initialCollapsedState: initialCollapsedState,
  };
})(typeof window !== "undefined" ? window : globalThis);
