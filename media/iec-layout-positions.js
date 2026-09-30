// Deleting a short wire or contact leaves native X coordinates unchanged.
// Compress only display coordinates after a decoded, repairable cell gap.
export function iecGapOffsets(body) {
  const wires = new Map((body.iecGeometry?.horizontal || []).map((wire) => [wire.offset, wire]));
  const gapsByRow = new Map();
  for (const site of body.iecHorizontalWireRepairSites || []) {
    const nextWire = wires.get(site.insertionOffset);
    if (!nextWire || nextWire.rowIndex !== site.rowIndex || nextWire.groupIndex !== site.groupIndex) continue;
    const width = nextWire.startX - site.rawX;
    if (width <= 0) continue;
    const gaps = gapsByRow.get(site.rowIndex) || [];
    gaps.push({ afterX: nextWire.startX, width });
    gapsByRow.set(site.rowIndex, gaps);
  }
  return (rowIndex, rawX) => (gapsByRow.get(rowIndex) || [])
    .reduce((total, gap) => total + (rawX >= gap.afterX ? gap.width : 0), 0);
}
