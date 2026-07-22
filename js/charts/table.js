/**
 * Forge Charts Table — generic table and matrix pivot.
 */
(function (global) {
  'use strict';

  var C = global.ForgeChartsCore || {};
  var esc = C.esc || function (s) { return String(s); };
  var emptyMsg = C.emptyMsg || function (t) { return '<p>' + t + '</p>'; };

  function table(data) {
    var columns = (data && data.columns) || [];
    var rows = (data && data.rows) || [];
    if (!columns.length && rows.length && Array.isArray(rows[0])) {
      columns = rows[0].map(function (_, i) { return 'Col ' + (i + 1); });
    }
    if (!columns.length || !rows.length) return emptyMsg('No table data.');
    var head = columns.map(function (c) {
      var label = typeof c === 'string' ? c : (c.label || c.key || '');
      return '<th>' + esc(label) + '</th>';
    }).join('');
    var body = rows.map(function (row) {
      var cells;
      if (Array.isArray(row)) {
        cells = row;
      } else {
        cells = columns.map(function (c) {
          var key = typeof c === 'string' ? c : (c.key || c.label || '');
          return row[key];
        });
      }
      return '<tr>' + cells.map(function (cell) { return '<td>' + esc(cell == null ? '' : cell) + '</td>'; }).join('') + '</tr>';
    }).join('');
    return (
      '<div class="forge-table-wrap"><table class="table table-sm mb-0">' +
      '<thead><tr>' + head + '</tr></thead><tbody>' + body + '</tbody></table></div>'
    );
  }

  function matrix(data) {
    var rowHeaders = (data && data.rowHeaders) || (data && data.rows) || [];
    var colHeaders = (data && data.colHeaders) || (data && data.cols) || [];
    var cells = (data && data.cells) || [];
    if (!rowHeaders.length || !colHeaders.length) return emptyMsg('No matrix data.');
    var head = '<th></th>' + colHeaders.map(function (c) { return '<th>' + esc(String(c)) + '</th>'; }).join('');
    var body = rowHeaders.map(function (rh, ri) {
      var rowCells = cells[ri] || [];
      var tds = colHeaders.map(function (_, ci) {
        var val = rowCells[ci];
        return '<td>' + esc(val == null ? '' : val) + '</td>';
      }).join('');
      return '<tr><th scope="row">' + esc(String(rh)) + '</th>' + tds + '</tr>';
    }).join('');
    return (
      '<div class="forge-table-wrap"><table class="table table-sm table-bordered mb-0">' +
      '<thead><tr>' + head + '</tr></thead><tbody>' + body + '</tbody></table></div>'
    );
  }

  global.ForgeChartsTable = {
    table: table,
    matrix: matrix,
    _demo: {
      table: { columns: ['Name', 'Score'], rows: [['Alpha', 92], ['Beta', 78]] },
      matrix: { rowHeaders: ['R1'], colHeaders: ['C1', 'C2'], cells: [[1, 2]] }
    }
  };
})(typeof window !== 'undefined' ? window : this);
