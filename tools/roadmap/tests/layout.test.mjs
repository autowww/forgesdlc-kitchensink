import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import vm from "node:vm";

const layoutPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../js/ks-roadmap-layout.js"
);

function loadLayout() {
  const sandbox = { window: {}, globalThis: {} };
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  const code = createRequire(import.meta.url)("fs").readFileSync(layoutPath, "utf8");
  vm.runInNewContext(code, sandbox);
  return sandbox.KsRoadmapLayout;
}

const L = loadLayout();

const columns = [
  { id: "q1", label: "Q1", start: "2026-01-01", end: "2026-03-31" },
  { id: "q2", label: "Q2", start: "2026-04-01", end: "2026-06-30" },
  { id: "q3", label: "Q3", start: "2026-07-01", end: "2026-09-30" },
];

const level = {
  columns,
  tracks: [{ id: "eng", label: "Engineering" }],
  bars: [
    {
      id: "b1",
      epic_id: "b1",
      label: "Epic",
      trackId: "eng",
      startColumnId: "q1",
      endColumnId: "q2",
    },
  ],
};

test("barGridColumn spans correct columns", () => {
  const gc = L.barGridColumn(level, level.bars[0]);
  assert.equal(gc, "1 / 3");
});

test("moveBarColumns preserves span", () => {
  const bar = { ...level.bars[0] };
  L.moveBarColumns(level, bar, 1);
  assert.equal(bar.startColumnId, "q2");
  assert.equal(bar.endColumnId, "q3");
});

test("datesFromBar reads column start/end", () => {
  const dates = L.datesFromBar(level, level.bars[0]);
  assert.equal(dates.target_start, "2026-01-01");
  assert.equal(dates.target_end, "2026-06-30");
});

test("columnsForDateRange maps target dates to columns", () => {
  const cols = L.columnsForDateRange(columns, "2026-04-01", "2026-08-01");
  assert.ok(cols);
  assert.equal(cols.startColumnId, "q2");
  assert.equal(cols.endColumnId, "q3");
});

test("syncBarFromDateRow updates bar columns", () => {
  const bars = [
    {
      id: "b1",
      epic_id: "b1",
      startColumnId: "q1",
      endColumnId: "q1",
    },
  ];
  const row = {
    epic_id: "b1",
    target_start: "2026-07-01",
    target_end: "2026-09-30",
  };
  L.syncBarFromDateRow(level, row, bars);
  assert.equal(bars[0].startColumnId, "q3");
  assert.equal(bars[0].endColumnId, "q3");
});
