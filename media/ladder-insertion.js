// Prefer the current cell, then search successive rings out to two cells.
// IEC columns are three native x units apart; XGK rows are four y units apart.
export function nearbyInsertionPosition(position, { iec = false, test }) {
  const row = iec ? 'rowIndex' : 'rawY';
  const column = iec ? 'rawX' : 'column';
  const step = iec ? 3 : 1;
  const offsets = [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1],
    [1, 1], [-1, 1], [1, -1], [-1, -1]];
  // Finish the one-cell ring before considering any two-cell neighbor.
  const outer = [];
  for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
    if (Math.max(Math.abs(dx), Math.abs(dy)) === 2) outer.push([dx, dy]);
  }
  outer.sort((a, b) => a[0] ** 2 + a[1] ** 2 - b[0] ** 2 - b[1] ** 2);
  offsets.push(...outer);
  for (const [dx, dy] of offsets) {
    const candidate = { ...position, [row]: position[row] + dy * (iec ? 1 : 4), [column]: position[column] + dx * step };
    if (candidate[row] < 0 || candidate[row] > (iec ? 16382 : 262136)
      || candidate[column] < (iec ? 1 : 0) || candidate[column] > (iec ? 97 : 9)) continue;
    if (!iec && Number.isInteger(position.rowIndex)) candidate.rowIndex = position.rowIndex + dy;
    if (test(candidate)) return candidate;
  }
  return null;
}

// Only placement collisions trigger relocation. Invalid operands and unsupported
// native layouts retain their original error instead of moving the cursor.
export function nearbyInsertionEdit(position, { iec = false, build }) {
  let originalError;
  try { return { position, bytes: build(position) }; }
  catch (error) {
    if (!/overlap/i.test(String(error))) throw error;
    originalError = error;
  }
  let bytes;
  const target = nearbyInsertionPosition(position, { iec, test: candidate => {
    const row = iec ? 'rowIndex' : 'rawY', column = iec ? 'rawX' : 'column';
    if (candidate[row] === position[row] && candidate[column] === position[column]) return false;
    try { bytes = build(candidate); return true; }
    catch { return false; }
  } });
  if (!target) throw originalError;
  return { position: target, bytes };
}

// EN is a BOOL input. A free body must not be placed on a numeric operand row
// or inside another block's body merely because its own rectangle fits.
export function iecFunctionEnableIsCompatible(body, position, symbols = []) {
  const { rowIndex, rawX } = position;
  const areas = (body.iecCircuitGraph?.occupiedAreas || []).filter(area =>
    area.kind !== 'horizontalWire' && area.startRowIndex <= rowIndex
    && area.endRowIndex >= rowIndex && area.endX < rawX);
  if (!areas.length) return true;
  const nearestX = Math.max(...areas.map(area => area.endX));
  const nearest = areas.filter(area => area.endX === nearestX);
  const isBool = value => /^%[IQM]X\d+(?:\.\d+)?$/i.test(value || '')
    || /^(TRUE|FALSE)$/i.test(value || '')
    || symbols.some(symbol => symbol.name?.toUpperCase() === value?.toUpperCase()
      && symbol.dataType?.toUpperCase() === 'BOOL');
  const pins = block => [block.controlOutput, ...(block.pins || [])].filter(Boolean);
  return nearest.every(area => {
    if (area.kind === 'contact') return true;
    if (area.kind === 'functionOperand') {
      const link = (body.iecFunctionOperandLinks || []).find(link => link.recordOffset === area.recordOffset);
      if (!link?.isOutput) return false;
      const value = (body.sourceStrings || []).find(item => item.iecRecordOffset === area.recordOffset)?.value;
      // ANY includes BOOL but is not proof that this assignment is Boolean.
      return link.dataTypeMask === 1 || isBool(value);
    }
    if (area.kind === 'functionBlock') {
      const block = (body.iecFunctions || []).find(block => block.recordOffset === area.recordOffset);
      return block && pins(block).some(pin => pin.direction === 'output'
        && pin.rowIndex === rowIndex && pin.rawX < rawX && pin.dataTypeMask === 1);
    }
    return false;
  });
}
