import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import vm from "node:vm";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const layoutPath = path.resolve(__dirname, "../../../js/ks-mindmap-layout.js");

function loadLayout() {
  const sandbox = { window: {}, globalThis: {} };
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  const code = createRequire(import.meta.url)("fs").readFileSync(layoutPath, "utf8");
  vm.runInNewContext(code, sandbox);
  return sandbox.KsMindmapLayout;
}

const L = loadLayout();

const demoRoot = {
  id: "root",
  label: "Kitchen Sink",
  children: [
    {
      id: "a",
      label: "Branch A",
      children: [
        { id: "a1", label: "Leaf A1" },
        { id: "a2", label: "Leaf A2" },
      ],
    },
    {
      id: "b",
      label: "Branch B",
      children: [{ id: "b1", label: "Leaf B1" }],
    },
  ],
};

test("layoutTree assigns positions for all visible nodes", () => {
  const layout = L.layoutTree(demoRoot, {}, 900);
  assert.equal(layout.nodes.length, 6);
  assert.ok(layout.width >= 320);
  assert.ok(layout.height > 100);
  const ids = layout.nodes.map((n) => n.id);
  for (const id of ["a", "a1", "a2", "b", "b1", "root"]) {
    assert.ok(ids.includes(id), "missing node " + id);
  }
});

test("collapsed subtree omitted from layout", () => {
  const collapsed = { a: true };
  const layout = L.layoutTree(demoRoot, collapsed, 900);
  const ids = layout.nodes.map((n) => n.id);
  assert.ok(ids.includes("root"));
  assert.ok(ids.includes("a"));
  assert.ok(!ids.includes("a1"));
  assert.ok(!ids.includes("a2"));
  assert.ok(ids.includes("b"));
  assert.ok(ids.includes("b1"));
});

test("narrow layout regroups vertically", () => {
  const layout = L.layoutTree(demoRoot, {}, 400);
  assert.equal(layout.mode, "narrow");
  assert.equal(layout.nodes.length, 6);
  for (let i = 1; i < layout.nodes.length; i++) {
    assert.ok(layout.nodes[i].y > layout.nodes[i - 1].y);
  }
});

test("initialCollapsedState collapses below initial depth", () => {
  const collapsed = L.initialCollapsedState(demoRoot, 1);
  assert.equal(collapsed.root, undefined);
  assert.equal(collapsed.a, true);
  assert.equal(collapsed.b, true);
});

test("buildConnectors skips collapsed branches", () => {
  const collapsed = { a: true };
  const layout = L.layoutTree(demoRoot, collapsed, 900);
  const pmap = {};
  layout.nodes.forEach((n) => {
    pmap[n.id] = n;
  });
  const lines = [];
  L.buildConnectors(demoRoot, pmap, collapsed, lines);
  const hasA1 = lines.some((l) => l.d.includes("a1"));
  assert.equal(hasA1, false);
});
