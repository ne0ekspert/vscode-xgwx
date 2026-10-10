import fs from 'node:fs';import assert from 'node:assert/strict';import test from 'node:test';
import init,{create_xgwx_project,parse_xgwx,create_xgwx_program,delete_xgwx_program,move_xgwx_program} from '../media/libxgwx.js';
await init({module_or_path:fs.readFileSync(new URL('../media/libxgwx_bg.wasm',import.meta.url))});
const fixture=file=>create_xgwx_project(file==='new-xgk'?'XGK-CPUSN':'XGI-CPUE',file==='new-xgi-sfc'?'SFC':'LD');
const request=(language,name='AddedProgram')=>({name,language,objectId:'abcdef01-1234-4567-89ab-0123456789ab',symbolId:'abcdef02-1234-4567-89ab-0123456789ab'});
test('blank program creation persists metadata, sources and original programs through WASM',()=>{
 for(const [file,language] of [['new-xgk','LD'],['new-xgi','LD'],['new-xgi-sfc','SFC']]) {
  const before=fixture(file),a=parse_xgwx(before),after=create_xgwx_program(before,request(language)),b=parse_xgwx(after);
  assert.equal(b.programs.length,2);assert.equal(b.programs[1].name,'AddedProgram');assert.deepEqual(b.programs[0],a.programs[0]);
  assert.deepEqual(b.variables,a.variables);assert.deepEqual(b.hardware,a.hardware);
  if(language==='SFC')assert.deepEqual(b.sfc[1].blocks[0].editableRows,[]);
  assert.throws(()=>create_xgwx_program(after,request(language,'Another')),/identities already exist/);
 }
});
test('duplicate names and unsupported CPU languages are rejected without changing source bytes',()=>{
 const before=fixture('new-xgk'),copy=Uint8Array.from(before);
 assert.throws(()=>create_xgwx_program(before,request('LD','newprogram')),/already exists/);
 assert.throws(()=>create_xgwx_program(before,request('SFC')),/unsupported|unvalidated/);
 assert.throws(()=>create_xgwx_program(before,request('FBD')),/unsupported|unvalidated/);
 assert.deepEqual(before,copy);
});

test('native Save As retains newly created programs and existing editable sources',()=>{
 for(const stem of ['xgk-ld','xgi-ld','xgi-sfc','xgk-ld-delete','xgi-ld-delete','xgi-sfc-delete','xgi-sfc-order']) {
  const source=fs.readFileSync(new URL(`../../libxgwx/fixtures/program-create/${stem}-generated.xgwx`,import.meta.url));
  const saved=fs.readFileSync(new URL(`../../libxgwx/fixtures/program-create/${stem}-roundtrip.xgwx`,import.meta.url));
  const a=parse_xgwx(source),b=parse_xgwx(saved);
  assert.deepEqual(b.programs,a.programs);assert.deepEqual(b.localVariables,a.localVariables);
  for(const chart of a.sfc) {
   const retained=b.sfc.find(p=>p.programIndex===chart.programIndex);assert.deepEqual(retained.variables,chart.variables);
   assert.deepEqual(retained.blocks.map(b=>b.editableRows),chart.blocks.map(b=>b.editableRows));
  }
 }
});

test('program deletion removes the targeted program and preserves surviving sources',()=>{
 for(const stem of ['xgk-ld','xgi-ld','xgi-sfc']) {
  const source=fs.readFileSync(new URL(`../../libxgwx/fixtures/program-create/${stem}-generated.xgwx`,import.meta.url));const before=parse_xgwx(source);
  for(const index of [0,1]) {
   const bytes=delete_xgwx_program(source,index,before.programs[index].objectId),after=parse_xgwx(bytes);
   assert.deepEqual(after.programs,[before.programs[1-index]]);
   assert.deepEqual(after.variables,before.variables);assert.deepEqual(after.hardware,before.hardware);
   const empty=delete_xgwx_program(bytes,0,after.programs[0].objectId);assert.equal(parse_xgwx(empty).programs.length,0);
   assert.equal(parse_xgwx(create_xgwx_program(empty,request('LD','Recreated'))).programs.length,1);
  }
  assert.throws(()=>delete_xgwx_program(source,0,before.programs[1].objectId),/selected program changed/);
  assert.equal(parse_xgwx(source).programs.length,2);
 }
});

 test('moving programs persists order without changing identities, task bindings or sources',()=>{
  for(const [file,language] of [['new-xgk','LD'],['new-xgi','LD'],['new-xgi-sfc','SFC']]) {
   let bytes=create_xgwx_program(fixture(file),request(language));
   bytes=create_xgwx_program(bytes,{...request(language,'Third'),objectId:'abcdef03-1234-4567-89ab-0123456789ab',symbolId:'abcdef04-1234-4567-89ab-0123456789ab'});
   const before=parse_xgwx(bytes);
   for(const [from,to] of [[0,2],[2,0],[0,1],[1,0],[1,1]]) {
    const moved=move_xgwx_program(bytes,from,to,before.programs[from].objectId,before.programs[to].objectId),after=parse_xgwx(moved);
    const expected=[...before.programs], [program]=expected.splice(from,1);expected.splice(to,0,program);
    assert.deepEqual(after.programs,expected);assert.deepEqual(after.variables,before.variables);assert.deepEqual(after.hardware,before.hardware);assert.deepEqual(after.tasks,before.tasks);
   }
   assert.throws(()=>move_xgwx_program(bytes,0,1,before.programs[1].objectId,before.programs[0].objectId),/program list changed/);
   assert.throws(()=>move_xgwx_program(bytes,0,1,before.programs[0].objectId,'stale'),/program list changed/);
   assert.throws(()=>move_xgwx_program(bytes,0,5,before.programs[0].objectId,'missing'),/program.*5/i);
  }
 });
