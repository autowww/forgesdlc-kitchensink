/**
 * KS roadmap layout — column snap, date↔column mapping, bar move/resize.
 */
(function (global) {
  "use strict";

  function columnIndexMap(columns) {
    var m = {};
    for (var i = 0; i < (columns || []).length; i++) {
      m[columns[i].id] = i;
    }
    return m;
  }

  function barGridColumn(level, bar) {
    var cmap = columnIndexMap(level.columns);
    var s = cmap[bar.startColumnId];
    var e = cmap[bar.endColumnId];
    if (typeof s !== "number" || typeof e !== "number" || s > e) {
      return "1 / 2";
    }
    return String(s + 1) + " / " + String(e + 2);
  }

  function columnById(columns, id) {
    for (var i = 0; i < (columns || []).length; i++) {
      if (columns[i].id === id) return columns[i];
    }
    return null;
  }

  function datesFromBar(level, bar) {
    var sc = columnById(level.columns, bar.startColumnId);
    var ec = columnById(level.columns, bar.endColumnId);
    return {
      target_start: (sc && sc.start) || "",
      target_end: (ec && ec.end) || "",
    };
  }

  function columnsForDateRange(columns, startDate, endDate) {
    if (!startDate || !endDate) return null;
    var startIdx = -1;
    var endIdx = -1;
    for (var i = 0; i < columns.length; i++) {
      var c = columns[i];
      if (!c.start || !c.end) continue;
      if (startDate >= c.start && startDate <= c.end) startIdx = i;
      if (endDate >= c.start && endDate <= c.end) endIdx = i;
    }
    if (startIdx < 0 || endIdx < 0) {
      for (var j = 0; j < columns.length; j++) {
        if (columns[j].start && startDate < columns[j].start && startIdx < 0) {
          startIdx = j;
        }
      }
      if (startIdx < 0) startIdx = 0;
      endIdx = Math.max(startIdx, endIdx >= 0 ? endIdx : startIdx);
    }
    if (startIdx > endIdx) {
      var t = startIdx;
      startIdx = endIdx;
      endIdx = t;
    }
    return {
      startColumnId: columns[startIdx].id,
      endColumnId: columns[endIdx].id,
    };
  }

  function moveBarColumns(level, bar, deltaCols) {
    var cmap = columnIndexMap(level.columns);
    var s = cmap[bar.startColumnId];
    var e = cmap[bar.endColumnId];
    if (typeof s !== "number" || typeof e !== "number") return false;
    var span = e - s;
    var ns = Math.max(0, Math.min(s + deltaCols, (level.columns.length - 1) - span));
    var ne = ns + span;
    bar.startColumnId = level.columns[ns].id;
    bar.endColumnId = level.columns[ne].id;
    return true;
  }

  function resizeBarColumn(level, bar, edge, deltaCols) {
    var cmap = columnIndexMap(level.columns);
    var s = cmap[bar.startColumnId];
    var e = cmap[bar.endColumnId];
    if (typeof s !== "number" || typeof e !== "number") return false;
    if (edge === "start") {
      var ns = Math.max(0, Math.min(s + deltaCols, e));
      bar.startColumnId = level.columns[ns].id;
    } else {
      var ne = Math.min(level.columns.length - 1, Math.max(e + deltaCols, s));
      bar.endColumnId = level.columns[ne].id;
    }
    return true;
  }

  function syncDateRowFromBar(level, bar, dateRows) {
    var eid = bar.epic_id || bar.id;
    var dates = datesFromBar(level, bar);
    for (var i = 0; i < dateRows.length; i++) {
      if (dateRows[i].epic_id === eid) {
        dateRows[i].target_start = dates.target_start;
        dateRows[i].target_end = dates.target_end;
        return dateRows[i];
      }
    }
    return null;
  }

  function syncBarFromDateRow(level, row, bars) {
    var cols = columnsForDateRange(
      level.columns,
      row.target_start,
      row.target_end
    );
    if (!cols) return null;
    for (var i = 0; i < bars.length; i++) {
      if (bars[i].epic_id === row.epic_id || bars[i].id === row.epic_id) {
        bars[i].startColumnId = cols.startColumnId;
        bars[i].endColumnId = cols.endColumnId;
        return bars[i];
      }
    }
    return null;
  }

  global.KsRoadmapLayout = {
    columnIndexMap: columnIndexMap,
    barGridColumn: barGridColumn,
    datesFromBar: datesFromBar,
    columnsForDateRange: columnsForDateRange,
    moveBarColumns: moveBarColumns,
    resizeBarColumn: resizeBarColumn,
    syncDateRowFromBar: syncDateRowFromBar,
    syncBarFromDateRow: syncBarFromDateRow,
  };
})(typeof window !== "undefined" ? window : globalThis);
