import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import init, {parse_xgwx, create_xgwx_project, insert_xgwx_iec_ld_single_element, edit_xgwx_ladder_cell, insert_xgwx_module, delete_xgwx_module} from '../media/libxgwx.js';
await init({module_or_path:fs.readFileSync(new URL('../media/libxgwx_bg.wasm',import.meta.url))});
test('native blank SFC template opens as an empty SFC main block',()=>{
  const source=create_xgwx_project('XGI-CPUE','SFC');
  const summary=parse_xgwx(source);
  assert.equal(summary.programs.length,1);
  assert.equal(summary.programs[0].name,'NewProgram');
  assert.equal(summary.programs[0].kind,3);
  assert.equal(summary.ladder.length,0);
  assert.equal(summary.counts.ladderErrors,0);
  assert.deepEqual(summary.sfc,[{programIndex:0,blocks:[{blockIndex:0,name:'NewProgram',main:true,
    languageType:3,language:2,rows:0,columns:0,entities:[],editableRows:[]}],variables:[
      {name:"GOTO_INIT",dataType:"BOOL",description:"",system:true},
      {name:"TRANS",dataType:"BOOL",description:"",system:true}],variablesError:null}]);
  assert.deepEqual(summary.sfc,parse_xgwx(fs.readFileSync(new URL('../../libxgwx/fixtures/sfc/new-xgi-sfc.xgwx',import.meta.url))).sfc);
});
for (const family of ['xgk','xgi']) {
  test(`blank ${family} handles XGL-EFMT(B) at Base 0 Slot 0`,()=>{
    const source=create_xgwx_project(family==='xgk'?'XGK-CPUSN':'XGI-CPUE','LD');
    const before=parse_xgwx(source);
    if(family==='xgi') {
      assert.throws(()=>insert_xgwx_module(source,0,0,'XGL-EFMT(B)'), /CPU|hardware/i);
      return;
    }
    const inserted=insert_xgwx_module(source,0,0,'XGL-EFMT(B)');
    const after=parse_xgwx(inserted);
    assert.deepEqual(after.ladder,before.ladder);
    assert.equal(after.networks.flatMap(n=>n.modules).filter(m=>m.base===0&&m.slot===0&&m.id===23041).length,1);
    const removed=parse_xgwx(delete_xgwx_module(inserted,0,0));
    assert.deepEqual(removed.networks,before.networks);
  });
  test(`native blank ${family} template supports first-cell editing`,()=>{
    const source=create_xgwx_project(family==='xgk'?'XGK-CPUSN':'XGI-CPUE','LD');
    const before=parse_xgwx(source);
    assert.equal(before.ladder[0].decodedLen,8);
    const edited=family==='xgi'
      ? insert_xgwx_iec_ld_single_element(source,0,0,1,'contact','NO','%MX0')
      : edit_xgwx_ladder_cell(source,0,{rawY:0,column:0,expected:null,replacement:{kind:'NormallyOpen',operand:'M00000'}});
    const after=parse_xgwx(edited);
    assert.equal(after.ladder[0].programName,'NewProgram');
    assert.deepEqual(after.globals,before.globals);
    assert.ok(after.ladder[0].decodedLen>8);
  });
}
for (const language of ['ST','IL']) {
  test(`new ${language} project starts with one editable empty source program`,async()=>{
    const {edit_xgwx_text_program,edit_xgwx_text_variable}=await import('../media/libxgwx.js');
    const source=create_xgwx_project('XGI-CPUE',language);
    const base=parse_xgwx(create_xgwx_project('XGI-CPUE','LD'));
    const before=parse_xgwx(source), program=before.textPrograms[0];
    assert.equal(before.cpu.model,'XGI-CPUE');assert.equal(before.programs.length,1);assert.equal(before.programs[0].name,'NewProgram');
    assert.equal(before.programs[0].kind,language==='ST'?4:9);assert.deepEqual(before.ladder,[]);assert.deepEqual(before.sfc,[]);assert.equal(before.counts.ladderErrors,0);
    assert.equal(program.language,language);assert.equal(program.source,'');assert.equal(program.editable,true);assert.deepEqual(program.variables,[]);assert.equal(program.variablesError,null);
    assert.deepEqual(before.hardware,base.hardware);assert.deepEqual(before.variables,base.variables);
    const declared=edit_xgwx_text_variable(source,program.objectId,{programIndex:0,expectedVariables:[],name:'Count',dataType:'INT',description:'',remove:false,update:false});
    const code=language==='ST'?'Count := 1;':'LD 1\nST Count';
    const edited=edit_xgwx_text_program(declared,{programIndex:0,expectedObjectId:program.objectId,expectedLanguage:language,expectedSource:'',source:code});
    const saved=parse_xgwx(Buffer.from(edited));assert.equal(saved.textPrograms[0].source,code);assert.equal(saved.textPrograms[0].variables[0].name,'Count');
    assert.deepEqual(saved.programs,before.programs);assert.deepEqual(saved.hardware,before.hardware);
  });
}
