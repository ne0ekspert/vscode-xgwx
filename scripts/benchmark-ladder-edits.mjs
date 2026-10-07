// Usage: node scripts/benchmark-ladder-edits.mjs project.xgwx [module.js wasm]
// Reports timings and counts only; never prints project names or operands.
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {performance} from 'node:perf_hooks';
const [file, modulePath, wasmPath] = process.argv.slice(2);
if (!file) throw new Error('Supply a project file to benchmark');
const wasm = await import(modulePath ? pathToFileURL(path.resolve(modulePath)) : new URL('../media/libxgwx.js', import.meta.url));
await wasm.default({module_or_path:fs.readFileSync(wasmPath || new URL('../media/libxgwx_bg.wasm', import.meta.url))});
const source=fs.readFileSync(file);
const time=fn=>{const start=performance.now();const result=fn();return {result,ms:performance.now()-start};};
const cold=time(()=>wasm.parse_xgwx(source));
const warm=Array.from({length:3},()=>time(()=>wasm.parse_xgwx(source)).ms);
const measurements=[];
for(const program of cold.result.ladder) {
 if(program.projectType!==2) continue;
 const row=Math.max(-1,...program.iecRows.map(row=>row.rowIndex))+1;
 if(row>16382) continue;
 try {
  wasm.parse_xgwx(source);
  const edit=time(()=>wasm.insert_xgwx_iec_ld_single_element(source,program.programIndex,row,1,'contact','NO','%MX0'));
  const refresh=time(()=>wasm.parse_xgwx(edit.result));
  measurements.push({editMs:edit.ms,refreshMs:refresh.ms});
  break;
 } catch { /* This fixture may contain only guarded layouts. */ }
}
console.log(JSON.stringify({programs:cold.result.ladder.length,coldParseMs:cold.ms,warmParseMs:warm,contactInsert:measurements[0]||null},null,2));
