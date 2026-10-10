import fs from 'node:fs';import assert from 'node:assert/strict';import test from 'node:test';
import init,{parse_xgwx,create_xgwx_program,edit_xgwx_text_program,edit_xgwx_text_variable,edit_xgwx_vendor_il} from '../media/libxgwx.js';
await init({module_or_path:fs.readFileSync(new URL('../media/libxgwx_bg.wasm',import.meta.url))});
test('all captured CPU templates create, declare and edit supported source through WASM',()=>{
 for(const stem of ['xgk-auto','xece','xech','xecs','xecu','xemh2','xemhp','gipam','kl','xgr']) {
  const original=fs.readFileSync(new URL(`../media/templates/new-${stem}-st.xgwx`,import.meta.url)),before=parse_xgwx(original);
  assert.ok(before.programLanguages.includes('ST'));assert.equal(before.textPrograms[0].editable,true);
  for(const language of before.programLanguages.filter(l=>['ST','IL'].includes(l))) {
   let bytes=create_xgwx_program(original,{name:'Added'+language,language,objectId:'abcd0001-1234-4567-89ab-0123456789ab',symbolId:'abcd0002-1234-4567-89ab-0123456789ab'});
   const p=parse_xgwx(bytes).textPrograms.at(-1);
   bytes=edit_xgwx_text_variable(bytes,p.objectId,{programIndex:p.programIndex,expectedVariables:p.variables,name:'Count',dataType:'INT',description:'Count',remove:false,update:false});
   const source=language==='ST'?'Count := Count + 1;':'LD Count\nADD 1\nST Count';
   bytes=edit_xgwx_text_program(bytes,{programIndex:p.programIndex,expectedObjectId:p.objectId,expectedLanguage:language,expectedSource:p.source,source});
   const after=parse_xgwx(bytes);assert.equal(after.textPrograms.at(-1).source,source);assert.equal(after.textPrograms.at(-1).variables[0].dataType,'INT');assert.deepEqual(after.hardware,before.hardware);
  }
 }
});
test('XGK vendor IL saves native ladder records and rejects IEC dialect and branch replacement',()=>{
 const bytes=fs.readFileSync(new URL('../media/templates/new-xgk.xgwx',import.meta.url)),before=parse_xgwx(bytes),p=before.vendorIlPrograms[0];
 assert.deepEqual(before.programLanguages,['LD','IL']);assert.ok(p.editable);
 const patch={programIndex:p.programIndex,expectedObjectId:p.objectId,expectedSource:p.source,source:'LOAD M00000\nAND NOT M00001\nOUT M00002'};
 const changed=edit_xgwx_vendor_il(bytes,patch),after=parse_xgwx(changed);assert.equal(after.vendorIlPrograms[0].source,patch.source);assert.equal(after.programs[0].kind,0);assert.deepEqual(after.hardware,before.hardware);
 assert.throws(()=>edit_xgwx_vendor_il(changed,patch),/source changed/);
 assert.throws(()=>edit_xgwx_vendor_il(bytes,{...patch,source:'LD TRUE\nST Flag'}));
 assert.throws(()=>edit_xgwx_vendor_il(bytes,{...patch,source:'LOAD M00000\nOR M00001\nOUT M00002'}));
});
test('XGK completion and diagnostics keep vendor edge operators separate from IEC',async()=>{
 const {xgkIlCompletions,diagnoseXgkIl}=await import('../media/xgk-il-editor.js');
 assert.ok(xgkIlCompletions('AND',3,[],true).some(v=>v.label==='ANDN'));
 assert.deepEqual(diagnoseXgkIl('LOAD M00000\nANDN M00001\nOUT M00002'),[]);
 const issue=diagnoseXgkIl('  ld TRUE')[0];assert.equal(issue.start,2);assert.equal(issue.end,4);assert.equal(issue.code,'dialect');
 assert.equal(diagnoseXgkIl('OR M00001')[0].code,'topology');
});
test('native CPU-family Save As preserves all source and typed declarations through WASM',()=>{
 for(const stem of ['xgk-auto','xece','xech','xecs','xecu','xemh2','xemhp','gipam','kl','xgr']) {
  const read=suffix=>parse_xgwx(fs.readFileSync(new URL(`../../libxgwx/fixtures/text-cpus/${stem}-${suffix}.xgwx`,import.meta.url)));
  const generated=read('generated'),saved=read('native-roundtrip');
  for(const p of generated.textPrograms) {const actual=saved.textPrograms.find(v=>v.objectId===p.objectId);assert.equal(actual.variablesError,null,stem);assert.equal(actual.source,p.source,stem);assert.deepEqual(actual.variables,p.variables,stem);assert.ok(actual.editable);}
 }
});
