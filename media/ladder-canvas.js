// Canvas rows are view state. Scrolling never changes the project bytes.
export function xgkCanvasRowValues(ladder, count) {
  if (count === undefined) return ladder.canvasRowValues || ladder.rungs.map(row => row.rawY);
  const comments = new Set((ladder.rungComments || []).map(row => row.rawY));
  return Array.from({ length: Math.min(65535, count) }, (_, index) => index * 4)
    .filter(rawY => !comments.has(rawY));
}

export function attachGrowingCanvas(viewport, { initialRows, rememberedRows = 0, maxRows, pitch, top,
  resize, renderWindow = () => {} }) {
  let count = Math.min(maxRows, Math.max(16, initialRows, rememberedRows));
  let lastWindow = "";
  const updateWindow = () => {
    const first = Math.max(0, Math.floor((viewport.scrollTop - top) / pitch) - 8);
    const last = Math.min(count - 1, Math.ceil((viewport.scrollTop + (viewport.clientHeight || 560) - top) / pitch) + 8);
    const key = `${first}:${last}`;
    if (key !== lastWindow) { lastWindow = key; renderWindow(first, last); }
  };
  const ensureRow = row => {
    const next = Math.min(maxRows, Math.max(count, row + 9));
    if (next > count) { count = next; resize(count); }
    updateWindow();
  };
  resize(count);
  updateWindow();
  viewport.addEventListener("scroll", () => {
    ensureRow(Math.ceil((viewport.scrollTop + viewport.clientHeight - top) / pitch));
  }, { passive: true });
  return { ensureRow, showRow(row) {
    ensureRow(row);
    const y = top + row * pitch;
    if (y < viewport.scrollTop || y + pitch > viewport.scrollTop + viewport.clientHeight) {
      viewport.scrollTop = Math.max(0, y - viewport.clientHeight / 2);
    }
    updateWindow();
  } };
}
