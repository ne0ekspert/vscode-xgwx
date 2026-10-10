import fs from 'node:fs';import assert from 'node:assert/strict';import test from 'node:test';
import init,{create_xgwx_project,parse_xgwx,edit_xgwx_text_program,create_xgwx_program} from '../media/libxgwx.js';
await init({module_or_path:fs.readFileSync(new URL('../media/libxgwx_bg.wasm',import.meta.url))});
const native=fs.readFileSync(new URL('../../libxgwx/fixtures/text-programs/native-blank.xgwx',import.meta.url));
test('ST and IL native source edits pass through WASM without changing neighbors',()=>{
 const before=parse_xgwx(native);
 assert.deepEqual(before.textPrograms.map(p=>[p.language,p.source,p.editable]),[['ST','',true],['IL','',true]]);
 for(const program of before.textPrograms){
  const source=program.language==='ST'?'(* 한글 😀 *)\r\n%MX0 := TRUE;':'start: LD 1\r\nST %MW0';
  const patch={programIndex:program.programIndex,expectedObjectId:program.objectId,expectedLanguage:program.language,expectedSource:program.source,source};
  const bytes=edit_xgwx_text_program(native,patch),after=parse_xgwx(bytes);
  assert.equal(after.textPrograms.find(p=>p.programIndex===program.programIndex).source,source);
  assert.deepEqual(after.programs,before.programs);assert.deepEqual(after.localVariables,before.localVariables);assert.deepEqual(after.sfc,before.sfc);assert.deepEqual(after.ladder,before.ladder);
  assert.throws(()=>edit_xgwx_text_program(bytes,patch),/source changed/);
  assert.throws(()=>edit_xgwx_text_program(native,{...patch,expectedLanguage:'LD'}),/language or source changed/);
  assert.throws(()=>edit_xgwx_text_program(native,{...patch,source:'😀'.repeat(32769)}),/65536/);
  assert.throws(()=>edit_xgwx_text_program(native,{...patch,source:'\0'}),/NUL/);
 }
});
test('new XGI text programs use native blank templates and can immediately be edited',()=>{
 const bytes=create_xgwx_project('XGI-CPUE','LD');
 for(const language of ['ST','IL']){
  const added=create_xgwx_program(bytes,{name:'AddedText',language,objectId:'abcd0001-1234-4567-89ab-0123456789ab',symbolId:'abcd0002-1234-4567-89ab-0123456789ab'}),program=parse_xgwx(added).textPrograms[0];
  assert.equal(program.language,language);assert.equal(program.source,'');assert.equal(program.editable,true);
  const source=language==='ST'?'%MX0 := FALSE;':'LD 0\nST %MW0';
  assert.equal(parse_xgwx(edit_xgwx_text_program(added,{programIndex:program.programIndex,expectedObjectId:program.objectId,expectedLanguage:language,expectedSource:'',source})).textPrograms[0].source,source);
 }
});
test('native source programs expose declarations and reject changes to referenced types',async()=>{
 const {edit_xgwx_text_variable}=await import('../media/libxgwx.js');
 for(const text of parse_xgwx(native).textPrograms) {
  const request={programIndex:text.programIndex,expectedVariables:text.variables,name:'Count',dataType:'INT',description:'Counter',remove:false,update:false};
  const declared=edit_xgwx_text_variable(native,text.objectId,request),program=parse_xgwx(declared).textPrograms.find(p=>p.programIndex===text.programIndex);
  assert.equal(program.variables[0].name,'Count');assert.equal(program.variables[0].dataType,'INT');
  const used=edit_xgwx_text_program(declared,{programIndex:text.programIndex,expectedObjectId:text.objectId,expectedLanguage:text.language,expectedSource:'',source:text.language==='ST'?'Count := 1;':'LD 1\nST Count'});
  assert.throws(()=>edit_xgwx_text_variable(used,text.objectId,{...request,expectedVariables:program.variables,remove:true}),/used/);
  assert.throws(()=>edit_xgwx_text_variable(used,text.objectId,{...request,expectedVariables:program.variables,dataType:'DINT',update:true}),/referenced/);
  assert.throws(()=>edit_xgwx_text_variable(declared,'stale',request),/identity changed/);
 }
});
test('XG5000 strict-check Save As retains all four generated sources and advanced declarations',()=>{
 const generated=parse_xgwx(fs.readFileSync(new URL('../../libxgwx/fixtures/text-programs/generated.xgwx',import.meta.url)));
 const saved=parse_xgwx(fs.readFileSync(new URL('../../libxgwx/fixtures/text-programs/native-roundtrip.xgwx',import.meta.url)));
 assert.equal(saved.textPrograms.length,4);assert.equal(saved.counts.ladderErrors,0);
 for(const p of generated.textPrograms){const actual=saved.textPrograms.find(v=>v.objectId===p.objectId);assert.equal(actual.language,p.language);assert.equal(actual.source,p.source);assert.deepEqual(actual.variables,p.variables);assert.equal(actual.editable,true);}
});
