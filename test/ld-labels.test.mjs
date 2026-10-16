import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import init, {create_xgwx_project, edit_xgwx_ld_label, parse_xgwx} from '../media/libxgwx.js';
import {xgkCanvasRowValues} from '../media/ladder-canvas.js';
await init({module_or_path:fs.readFileSync(new URL('../media/libxgwx_bg.wasm',import.meta.url))});
for(const cpu of ['XGK-CPUSN','XGI-CPUE'])test(`${cpu} label lifecycle, duplicate/stale guards and canvas rows`,()=>{
 let bytes=create_xgwx_project(cpu,'LD');
 bytes=edit_xgwx_ld_label(bytes,0,{rawY:0,expected:null,replacement:'Target'});
 assert.equal(parse_xgwx(bytes).ladder[0].labels[0].name,'Target');
 if(cpu.startsWith('XGK'))assert.deepEqual(xgkCanvasRowValues(parse_xgwx(bytes).ladder[0],3),[4,8]);
 assert.throws(()=>edit_xgwx_ld_label(bytes,0,{rawY:8,expected:null,replacement:'Target'}));
 assert.throws(()=>edit_xgwx_ld_label(bytes,0,{rawY:0,expected:'stale',replacement:'Edited'}));
 bytes=edit_xgwx_ld_label(bytes,0,{rawY:0,expected:'Target',replacement:'Edited'});
 assert.equal(parse_xgwx(bytes).ladder[0].labels[0].name,'Edited');
 bytes=edit_xgwx_ld_label(bytes,0,{rawY:0,expected:'Edited',replacement:null});
 assert.deepEqual(parse_xgwx(bytes).ladder[0].labels,[]);
});
