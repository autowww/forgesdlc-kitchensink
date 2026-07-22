/**
 * Dynamic UI test harness smoke test.
 * Run: node --test tools/dynamic-ui/tests/*.test.mjs
 */
import test from "node:test";
import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createMinimalDocument, installGlobals, resetGlobals } from "./dom-fixture.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = join(__dirname, "../../..");

test("createPaginationTactile exports and returns API", async () => {
  const fixture = createMinimalDocument();
  installGlobals(fixture);
  try {
    const mod = await import(pathToFileURL(join(REPO, "js/ks-pagination-tactile.js")).href);
    const container = fixture.document.createElement("div");
    const api = mod.createPaginationTactile(container, { page: 1, totalPages: 3 });
    assert.equal(typeof api.getValue, "function");
    assert.equal(api.getValue().page, 1);
    api.setValue({ page: 2 });
    assert.equal(api.getValue().page, 2);
    api.destroy();
    assert.equal(container.innerHTML, "");
  } finally {
    resetGlobals();
  }
});

test("createFilterChipScroller single-select", async () => {
  const fixture = createMinimalDocument();
  installGlobals(fixture);
  try {
    const mod = await import(pathToFileURL(join(REPO, "js/ks-filter-chip-scroller.js")).href);
    const container = fixture.document.createElement("div");
    const changes = [];
    const api = mod.createFilterChipScroller(container, {
      chips: [
        { value: "a", label: "A" },
        { value: "b", label: "B" },
      ],
      value: "a",
      onChange: (s) => changes.push(s.value),
    });
    assert.equal(api.getValue(), "a");
    api.setValue("b");
    assert.equal(api.getValue(), "b");
    api.destroy();
    assert.equal(changes.length, 0);
  } finally {
    resetGlobals();
  }
});
