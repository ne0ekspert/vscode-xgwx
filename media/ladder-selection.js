export function ladderPositionKey(position) {
  return `${position.rawY}:${position.column}`;
}

export function moveLadderPosition(rowValues, position, key, columnCount = 10) {
  if (!rowValues.length || !position) return null;
  const currentRow = Math.max(0, rowValues.indexOf(position.rawY));
  let rowIndex = currentRow;
  let column = Math.max(0, Math.min(columnCount - 1, position.column));
  if (key === "ArrowUp") rowIndex -= 1;
  if (key === "ArrowDown") rowIndex += 1;
  if (key === "ArrowLeft") column -= 1;
  if (key === "ArrowRight") column += 1;
  rowIndex = Math.max(0, Math.min(rowValues.length - 1, rowIndex));
  column = Math.max(0, Math.min(columnCount - 1, column));
  return { rawY: rowValues[rowIndex], rowIndex, column };
}

export function ladderSelectionKeys(rowValues, anchor, focus) {
  const keys = new Set();
  if (!anchor || !focus || !rowValues.length) return keys;
  const anchorRow = rowValues.indexOf(anchor.rawY);
  const focusRow = rowValues.indexOf(focus.rawY);
  if (anchorRow < 0 || focusRow < 0) return keys;
  const firstRow = Math.min(anchorRow, focusRow);
  const lastRow = Math.max(anchorRow, focusRow);
  const firstColumn = Math.min(anchor.column, focus.column);
  const lastColumn = Math.max(anchor.column, focus.column);
  for (let rowIndex = firstRow; rowIndex <= lastRow; rowIndex += 1) {
    for (let column = firstColumn; column <= lastColumn; column += 1) {
      keys.add(ladderPositionKey({ rawY: rowValues[rowIndex], column }));
    }
  }
  return keys;
}

export function blankLadderCellText(sourceText) {
  return " ".repeat(String(sourceText).length);
}
