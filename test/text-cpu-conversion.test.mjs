import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import init, {create_xgwx_project,parse_xgwx, select_xgwx_cpu, edit_xgwx_text_program, edit_xgwx_text_variable} from '../media/libxgwx.js';
await init({module_or_path:fs.readFileSync(new URL('../media/libxgwx_bg.wasm',import.meta.url))});
const models=['XGI-CPUU','XGI-CPUH','XGI-CPUS','XGI-CPUE','XGI-CPUU/D','XGI-CPUUN'];
for(const language of ['ST','IL']) {
  test(`new ${language} project preserves edited source and declarations through every XGI CPU conversion`,()=>{
    let source=create_xgwx_project('XGI-CPUE',language);
    const program=parse_xgwx(source).textPrograms[0];
    source=edit_xgwx_text_variable(source,program.objectId,{programIndex:0,expectedVariables:[],name:'Count',dataType:'INT',description:'Preserve this declaration',remove:false,update:false});
    source=edit_xgwx_text_program(source,{programIndex:0,expectedObjectId:program.objectId,expectedLanguage:language,expectedSource:'',source:language==='ST'?'Count := Count + 1;\r\n':'LD Count\r\nADD 1\r\nST Count\r\n'});
    const before=parse_xgwx(source);
    for(const from of models) {
      const start=select_xgwx_cpu(source,from);
      for(const to of models) {
        const bytes=select_xgwx_cpu(start,to),after=parse_xgwx(Buffer.from(bytes));
        assert.equal(after.cpu.model,to);
        assert.deepEqual(after.textPrograms,before.textPrograms);
        assert.deepEqual(after.programs,before.programs);
        assert.deepEqual(after.variables,before.variables);
        assert.deepEqual(parse_xgwx(select_xgwx_cpu(bytes,from)).textPrograms,before.textPrograms);
      }
    }
    for(const target of ['XGI-CPUS/P','XGK-CPUSN','XGB-XBMS']) assert.throws(()=>select_xgwx_cpu(source,target));
  });
}
test('native ST and IL fixture preserves source, advanced declarations and program metadata during conversion',()=>{
  const source=fs.readFileSync(new URL('../../libxgwx/fixtures/text-programs/native-roundtrip.xgwx',import.meta.url)),before=parse_xgwx(source);
  for(const model of models) {
    const after=parse_xgwx(select_xgwx_cpu(source,model));
    assert.deepEqual(after.textPrograms,before.textPrograms);
    assert.deepEqual(after.programs,before.programs);
  }
});
test('native saves for every converted CPU preserve ST/IL semantics and convert back through WASM',()=>{
  for(const stem of ['cpue','cpus','cpuh','cpuu','cpuud','cpuun']) {
    const generated=parse_xgwx(fs.readFileSync(new URL(`../../libxgwx/fixtures/text-programs/cpu/${stem}-generated.xgwx`,import.meta.url)));
    const saved=fs.readFileSync(new URL(`../../libxgwx/fixtures/text-programs/cpu/${stem}-native.xgwx`,import.meta.url));
    assert.deepEqual(parse_xgwx(saved).textPrograms,generated.textPrograms);
    const reversed=parse_xgwx(select_xgwx_cpu(saved,'XGI-CPUE'));
    assert.equal(reversed.cpu.model,'XGI-CPUE');assert.deepEqual(reversed.textPrograms,generated.textPrograms);
  }
});
