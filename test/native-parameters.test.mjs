import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import init, {parse_xgwx, edit_xgwx_native_parameters, inspect_xgwx_native_parameter_fields} from '../media/libxgwx.js';
import {nativeParameterChanges, nativeTargetLabel} from '../media/native-parameters.js';
await init({module_or_path:fs.readFileSync(new URL('../media/libxgwx_bg.wasm',import.meta.url))});
const root=process.env.LIBXGWX_DIR || path.resolve(import.meta.dirname,'../../libxgwx');
for(const fixture of ['XGB_Enet01','XGB_Enet02']) test(`${fixture}: native HSC/PID/position edits serialize, reject stale edits and preserve other records`,()=>{
  const source=fs.readFileSync(path.join(root,'fixtures',fixture+'.xgwx'));
  const before=parse_xgwx(source);
  const parameters=before.parameters.filter(p=>p.nativeFields.length);
  assert.equal(parameters.length,4);
  for(const parameter of parameters){
    assert.deepEqual(parameter.nativeFields,inspect_xgwx_native_parameter_fields(source,parameter.parameterIndex));
    const wanted=parameter.parameterType==='HSC PARAMETER'?'unit_time_ms':parameter.parameterType==='POSITION PARAMETER'?'TargetPosition':'TargetValue';
    const field=parameter.nativeFields.find(f=>f.name===wanted);
    const change={target:field.target,name:field.name,expected:field.value,replacement:1234};
    const edited=edit_xgwx_native_parameters(source,parameter.parameterIndex,[change]);
    const after=parse_xgwx(edited);
    assert.equal(after.parameters[parameter.parameterIndex].nativeFields.find(f=>f.name===field.name&&JSON.stringify(f.target)===JSON.stringify(field.target)).value,'1234');
    assert.deepEqual(after.parameters.filter(p=>p.parameterIndex!==parameter.parameterIndex),before.parameters.filter(p=>p.parameterIndex!==parameter.parameterIndex));
    assert.deepEqual(after.programs,before.programs);assert.deepEqual(after.hardware,before.hardware);
    assert.throws(()=>edit_xgwx_native_parameters(edited,parameter.parameterIndex,[change]),/stale/);
    assert.throws(()=>edit_xgwx_native_parameters(source,parameter.parameterIndex,[change,change]),/duplicate/);
    assert.throws(()=>edit_xgwx_native_parameters(source,parameter.parameterIndex,[{...change,replacement:field.maximum+1}]),/bounds/);
    assert.deepEqual(Buffer.from(edit_xgwx_native_parameters(source,parameter.parameterIndex,[{...change,replacement:Number(field.value)}])),source);
  }
});
test('parameter form uses exact selectors/expected strings, handles signed values and rejects invalid drafts',()=>{
  const field={target:{kind:'position_step',axis_index:1,step_index:29},name:'TargetPosition',value:'000',minimum:-2147483648,maximum:2147483647};
  assert.deepEqual(nativeParameterChanges([{field,input:{value:'-123'}}]),[{target:field.target,name:field.name,expected:'000',replacement:-123}]);
  assert.deepEqual(nativeParameterChanges([{field,input:{value:'0'}}]),[]);
  for(const value of ['', '1.2','1e2','2147483648','-2147483649','NaN']) assert.throws(()=>nativeParameterChanges([{field,input:{value}}]),/integer/);
  assert.equal(nativeTargetLabel(field.target),'Axis Y · Step 30');
});

test('legacy FEnet dotted IPv4 controls encode little-endian storage and validate masks',()=>{
  const target={kind:'safety_communication'};
  const field={target,name:'IPAddress',value:'0',minimum:0,maximum:4294967295};
  assert.deepEqual(nativeParameterChanges([{field,input:{value:'10.20.30.40'}}]),[{target,name:'IPAddress',expected:'0',replacement:673059850}]);
  for(const value of ['1.2.3','1.2.3.256','-1.2.3.4','1e2.2.3.4']) assert.throws(()=>nativeParameterChanges([{field,input:{value}}]),/IPv4/);
  assert.throws(()=>nativeParameterChanges([{field:{...field,name:'Subnet'},input:{value:'255.0.255.0'}}]),/contiguous/);
});

test('legacy FEnet WASM edits and exact I/O membership preserve the project',()=>{
  const source=fs.readFileSync(path.join(root,'fixtures/empty-projects/new-xgk.xgwx'));
  const before=parse_xgwx(source);
  const parameter=before.parameters.find(p=>p.parameterType==='FENET PARAMETER');
  assert.equal(parameter.nativeFields.length,8);
  const field=parameter.nativeFields.find(f=>f.name==='IPAddress');
  const edited=edit_xgwx_native_parameters(source,parameter.parameterIndex,[{target:field.target,name:field.name,expected:field.value,replacement:673059850}]);
  const after=parse_xgwx(edited);
  assert.equal(after.parameters[parameter.parameterIndex].nativeFields.find(f=>f.name==='IPAddress').value,'673059850');
  assert.deepEqual(after.hardware,before.hardware);assert.deepEqual(after.programs,before.programs);
  const io=before.parameters.find(p=>p.parameterType==='IO PARAMETER');
  assert.equal(io.ioBaseIndices.length,before.hardware.bases.length);
  assert.equal(io.ioModuleIndices.length,before.hardware.modules.length);
});
