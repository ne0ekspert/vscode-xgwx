import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validatedEditCache} from '../media/validated-edit-cache.js';
import init, {create_xgwx_project, insert_xgwx_iec_ld_rung, parse_xgwx, update_xgwx_iec_ld_element_operand} from '../media/libxgwx.js';
test('prompt acceptance reuses only identical successful validation on the same source',()=>{
 let builds=0;
 const cache=validatedEditCache(()=>new Uint8Array([++builds]));
 const source=new Uint8Array([1]);
 const validated=cache(source,'NO',['M00000']);
 assert.equal(cache(source,'NO',['M00000']),validated);
 assert.equal(builds,1);
 assert.notEqual(cache(source,'NC',['M00000']),validated);
 cache(source,'NC',['M00001']);
 cache(new Uint8Array(source),'NC',['M00001']);
 assert.equal(builds,4);
});
test('failed validations are never retained',()=>{
 let builds=0;
 const cache=validatedEditCache(()=>{builds++;throw new Error('invalid');});
 const source=new Uint8Array();
 for(let i=0;i<2;i++) assert.throws(()=>cache(source,'ADD',['1']),/invalid/);
 assert.equal(builds,2);
});
test('inspector candidates reuse the complete edit only until its source changes',async()=>{
 await init({module_or_path:fs.readFileSync(new URL('../media/libxgwx_bg.wasm',import.meta.url))});
 const source=insert_xgwx_iec_ld_rung(create_xgwx_project('XGI-CPUE','LD'),0,0,'NO','%MX0','OUTPUT','%MX1');
 const [contact,coil]=parse_xgwx(source).ladder[0].sourceStrings.filter(item=>item.iecElementKind);
 let builds=0;
 const cache=validatedEditCache((bytes,_command,args)=>{
  builds++;
  return update_xgwx_iec_ld_element_operand(bytes,...args);
 });
 const args=[0,contact.offset,contact.value,'%MX2'];
 const validated=cache(source,'operand',args);
 assert.equal(cache(source,'operand',[...args]),validated);
 assert.equal(builds,1);
 assert.equal(parse_xgwx(validated).ladder[0].sourceStrings.find(item=>item.offset===contact.offset).value,'%MX2');
 cache(source,'operand',[0,coil.offset,coil.value,'%MX2']);
 assert.equal(builds,2,'a different cell must run its own writer');
 for(let i=0;i<2;i++) assert.throws(()=>cache(source,'operand',[0,contact.offset,contact.value,'%MW0']));
 assert.equal(builds,4,'failed candidates must continue to run the guard');
 cache(new Uint8Array(source),'operand',args);
 assert.equal(builds,5,'equal bytes with a new source identity require validation');
 for(let i=0;i<2;i++) assert.throws(()=>cache(validated,'operand',args));
 assert.equal(builds,7,'an applied edit must rerun and reject stale expected text');
 assert.throws(()=>cache(source,'operand',[1,...args.slice(1)]));
 assert.equal(builds,8,'a different selected program must run its own guard');
});
