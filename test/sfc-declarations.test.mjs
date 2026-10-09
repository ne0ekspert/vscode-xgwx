import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {parseSfcArrayBounds,sfcDeclarationType} from '../media/sfc-declarations.js';
import init,{parse_xgwx,edit_xgwx_sfc_variable} from '../media/libxgwx.js';
await init({module_or_path:fs.readFileSync(new URL('../media/libxgwx_bg.wasm',import.meta.url))});
const fixture=name=>fs.readFileSync(new URL(`../../libxgwx/fixtures/sfc/${name}.xgwx`,import.meta.url));
test('inclusive array input rejects invalid bounds and distinguishes element types',()=>{
 assert.deepEqual(parseSfcArrayBounds('0..1, 0..2'),[{lower:0,upper:1},{lower:0,upper:2}]);
 for(const invalid of ['1..2','-1..2','3..2','0..65536','0..255,0..256','0..1,0..1,0..1,0..1','0...2'])assert.throws(()=>parseSfcArrayBounds(invalid));
 assert.equal(sfcDeclarationType({dataType:'WORD',declaration:{dimensions:parseSfcArrayBounds('0..1,0..2')}}),'ARRAY[0..1,0..2] OF WORD');
});
test('declaration edits preserve charts and sources and carry advanced metadata through WASM',()=>{
 const original=fixture('declarations-string-native'),program=parse_xgwx(original).sfc[0];
 const patch={programIndex:0,expectedVariables:program.variables,name:'Buffer',dataType:'DINT',description:'retained buffer',remove:false,update:false,declaration:{dimensions:parseSfcArrayBounds('0..3'),initialValue:'4(2)',retain:true}};
 let bytes=edit_xgwx_sfc_variable(original,patch),parsed=parse_xgwx(bytes).sfc[0];assert.deepEqual(parsed.blocks,program.blocks);
 assert.deepEqual(parsed.variables.find(v=>v.name==='Buffer').declaration,patch.declaration);
 assert.throws(()=>edit_xgwx_sfc_variable(bytes,patch),/stale/);
 const count=parsed.variables.find(v=>v.name==='Count');bytes=edit_xgwx_sfc_variable(bytes,{...patch,name:'Count',dataType:'DINT',expectedVariables:parsed.variables,update:true,declaration:{dimensions:[],initialValue:'12',retain:false}});
 parsed=parse_xgwx(bytes).sfc[0];assert.equal(parsed.variables.find(v=>v.name==='Count').declaration.initialValue,'12');assert.deepEqual(parsed.blocks,program.blocks);assert.equal(count.declaration.retain,true);
 assert.throws(()=>edit_xgwx_sfc_variable(bytes,{...patch,expectedVariables:parsed.variables,name:'Count',dataType:'WORD',update:true,declaration:{dimensions:[],initialValue:'1',retain:false}}),/referenced/);
});
