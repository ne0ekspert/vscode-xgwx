import {
  COIL_ELEMENT_CHOICES,
  CONTACT_ELEMENT_CHOICES,
} from "./ladder-elements.js";

const CONTACT_KINDS = new Set(CONTACT_ELEMENT_CHOICES.map(([kind]) => kind));
const COIL_KINDS = new Set(COIL_ELEMENT_CHOICES.map(([kind]) => kind));

function selectionBounds(rowValues, anchor, focus) {
  const anchorRow = rowValues.indexOf(anchor?.rawY);
  const focusRow = rowValues.indexOf(focus?.rawY);
  if (anchorRow < 0 || focusRow < 0) throw new Error("Select a ladder cell first");
  return {
    firstRow: Math.min(anchorRow, focusRow),
    lastRow: Math.max(anchorRow, focusRow),
    firstColumn: Math.min(anchor.column, focus.column),
    lastColumn: Math.max(anchor.column, focus.column),
  };
}

function cellKey(rawY, column) {
  return `${rawY}:${column}`;
}

export function captureLadderSelection(rowValues, anchor, focus, cells) {
  const bounds = selectionBounds(rowValues, anchor, focus);
  const captured = [];
  for (const cell of cells) {
    const rowIndex = rowValues.indexOf(cell.rawY);
    if (rowIndex < bounds.firstRow || rowIndex > bounds.lastRow
      || cell.column < bounds.firstColumn || cell.column > bounds.lastColumn) continue;
    if (!cell.element) throw new Error("The selection contains a read-only instruction");
    captured.push({
      rowOffset: rowIndex - bounds.firstRow,
      columnOffset: cell.column - bounds.firstColumn,
      element: { ...cell.element },
    });
  }
  if (!captured.length) throw new Error("The selection contains no editable elements");
  return {
    rowCount: bounds.lastRow - bounds.firstRow + 1,
    columnCount: bounds.lastColumn - bounds.firstColumn + 1,
    cells: captured,
  };
}

export function planLadderPaste(clipboard, rowValues, target, cells, columnCount = 10) {
  if (!clipboard?.cells?.length) throw new Error("Copy or cut ladder cells first");
  const firstRow = rowValues.indexOf(target?.rawY);
  if (firstRow < 0) throw new Error("Select a paste destination first");
  if (firstRow + clipboard.rowCount > rowValues.length
    || target.column + clipboard.columnCount > columnCount) {
    throw new Error("The copied cells do not fit at this position");
  }

  const source = new Map(clipboard.cells.map((cell) => (
    [cellKey(cell.rowOffset, cell.columnOffset), cell.element]
  )));
  const destination = new Map(cells.map((cell) => (
    [cellKey(cell.rawY, cell.column), cell]
  )));
  const edits = [];
  for (let rowOffset = 0; rowOffset < clipboard.rowCount; rowOffset += 1) {
    const rawY = rowValues[firstRow + rowOffset];
    for (let columnOffset = 0; columnOffset < clipboard.columnCount; columnOffset += 1) {
      const column = target.column + columnOffset;
      const replacement = source.get(cellKey(rowOffset, columnOffset)) || null;
      const occupied = destination.get(cellKey(rawY, column));
      if (occupied && !occupied.element) {
        throw new Error("The paste area contains a read-only instruction");
      }
      if (replacement) {
        const validKind = column === columnCount - 1
          ? COIL_KINDS.has(replacement.kind)
          : CONTACT_KINDS.has(replacement.kind);
        if (!validKind) throw new Error("Contacts and coils must stay in compatible columns");
      }
      const expected = occupied?.element || null;
      if (expected || replacement) {
        edits.push({ rawY, column, expected, replacement: replacement ? { ...replacement } : null });
      }
    }
  }
  return edits;
}
