const steps = {ArrowLeft:[0,-3],ArrowRight:[0,3],ArrowUp:[-1,0],ArrowDown:[1,0]};
export function moveIecCursor(position, key) {
  const step=steps[key];
  if(!step || !position) return null;
  return {rowIndex:Math.max(0,Math.min(16382,position.rowIndex+step[0])),
    rawX:Math.max(1,Math.min(97,position.rawX+step[1]))};
}
export function iecCursorRecord(body, position) {
  return body.iecCircuitGraph?.occupiedAreas?.find(area=>area.kind!=='horizontalWire'
    && position.rowIndex>=area.startRowIndex && position.rowIndex<=area.endRowIndex
    && position.rawX>=area.startX && position.rawX<=area.endX)?.recordOffset ?? null;
}
