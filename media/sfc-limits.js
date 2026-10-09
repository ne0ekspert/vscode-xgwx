// XG5000 Manual V2.5, chapter 16.1. Ordinary steps exclude variable-step forms.
export const SFC_MAX_STEPS=512;
export const SFC_MAX_ROWS=65535;
export const SFC_MAX_COLUMNS=65535;
// Separate editor safety budget for the dense native grid; not an XG5000 limit.
export const SFC_MAX_GRID_CELLS=1048576;
export function sfcRowsFit(rows) {
  let height=0,width=0,steps=0;
  for(const [i,r] of rows.entries()){height=Math.max(height,(r.position?.row ?? i)+1);width=Math.max(width,(r.branchEnd ?? r.position?.column ?? 0)+2);if(r.kind==='step')steps++;}
  return steps<=SFC_MAX_STEPS && height<=SFC_MAX_ROWS && width<=SFC_MAX_COLUMNS && height*width<=SFC_MAX_GRID_CELLS;
}
