const scalarNames = new Set(['MOVE','ADD','SUB','MUL','DIV','EQ','GT','GE','LT','LE',
  'INT_TO_UDINT','UDINT_TO_TIME','TIME_TO_UDINT','UDINT_TO_INT']);
export function canWireIecOutput(block, pin) {
  return scalarNames.has(block.name) && !block.instance && pin.direction === 'output'
    && pin.dataTypeMask === 1 && !pin.isArray && ['ENO','OUT'].includes(pin.name);
}
export function iecOutputWireAt(body, position) {
  const kinds = new Map((body.iecRecords || []).map(r => [r.offset,r.kind]));
  for (const block of body.iecFunctions || []) {
    for (const pin of [block.controlOutput,...(block.pins || [])].filter(Boolean)) {
      if (!canWireIecOutput(block,pin) || pin.rowIndex !== position.rowIndex
        || position.rawX < pin.rawX || (position.rawX-pin.rawX)%3) continue;
      let connected = true;
      for (let x=pin.rawX;x<position.rawX;x+=3) {
        if (!(body.iecGeometry?.horizontal || []).some(w => w.groupIndex === block.groupIndex
          && w.rowIndex === pin.rowIndex && w.startX === x && kinds.get(w.offset) === 'Short wire')) {
          connected = false; break;
        }
      }
      if (connected) return {block,pin};
    }
  }
  return null;
}
