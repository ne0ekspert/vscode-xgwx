import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import init, {create_xgwx_project, insert_xgwx_iec_ld_comment, delete_xgwx_iec_ld_group, parse_xgwx} from '../media/libxgwx.js';
await init({module_or_path:fs.readFileSync(new URL('../media/libxgwx_bg.wasm',import.meta.url))});
test('IEC first comment at L25 needs no template and extends the canvas',()=>{
 const source=create_xgwx_project('XGI-CPUE','LD');
 const bytes=insert_xgwx_iec_ld_comment(source,0,25,'L25 설명 📝');
 const program=parse_xgwx(bytes).ladder[0];
 assert.deepEqual(program.iecRows.map(row=>row.rowIndex),[25]);
 assert.deepEqual(program.sourceStrings.filter(item=>item.isIecComment).map(item=>[item.iecRowIndex,item.value]),[[25,'L25 설명 📝']]);
 assert.throws(()=>insert_xgwx_iec_ld_comment(bytes,0,25,'occupied'));
 assert.throws(()=>insert_xgwx_iec_ld_comment(bytes,0,30,'x'.repeat(256)));
 const added=parse_xgwx(insert_xgwx_iec_ld_comment(bytes,0,30,'Second')).ladder[0];
 assert.deepEqual(added.sourceStrings.filter(item=>item.isIecComment).map(item=>item.value),['L25 설명 📝','Second']);
});

test('deleting the only IEC comment restores an empty program',()=>{
 const source=create_xgwx_project('XGI-CPUE','LD');
 const bytes=insert_xgwx_iec_ld_comment(source,0,25,'Only comment');
 const changed=delete_xgwx_iec_ld_group(bytes,0,0,25);
 assert.deepEqual(parse_xgwx(changed).ladder[0].iecRows,[]);
 assert.deepEqual(parse_xgwx(changed).ladder[0].sourceStrings.filter(item=>item.isIecComment),[]);
});
