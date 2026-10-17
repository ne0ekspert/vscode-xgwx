import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import init, {create_xgwx_project, edit_xgwx_basic_timing, edit_xgwx_basic_parameters, parse_xgwx} from '../media/libxgwx.js';

await init({module_or_path: fs.readFileSync(new URL('../media/libxgwx_bg.wasm', import.meta.url))});

test('basic timing edits persist through native container serialization without changing other parameters', () => {
  const source = create_xgwx_project('XGK-CPUSN', 'LD');
  const before = parse_xgwx(source);
  const parameter = before.parameters.find(p => p.basicTimingFields.length);
  assert.ok(parameter);
  assert.equal(parameter.configurationIndex, 0);
  const field = parameter.basicTimingFields.find(f => f.name === 'SCAN_WD_TIME');
  const edited = edit_xgwx_basic_timing(source, parameter.parameterIndex, [{name: field.name, expected: field.value, replacement: 750}]);
  const after = parse_xgwx(edited);
  const expected = structuredClone(before.parameters);
  const p = expected.find(p => p.parameterIndex === parameter.parameterIndex);
  p.basicTimingFields.find(f => f.name === field.name).value = '750';
  p.basicOperationFields.find(f => f.name === field.name).value = '750';
  p.sections[0].attributes.find(a => a.name === field.name).value = '750';
  assert.deepEqual(after.parameters, expected);
  assert.deepEqual(after.programs, before.programs);
  assert.deepEqual(after.hardware, before.hardware);
  assert.throws(() => edit_xgwx_basic_timing(edited, parameter.parameterIndex, [{name: field.name, expected: field.value, replacement: 800}]), /stale/);
  for (const replacement of [0, 9, 1001, -1, 1.5]) {
    assert.throws(() => edit_xgwx_basic_timing(source, parameter.parameterIndex, [{name: field.name, expected: field.value, replacement}]));
  }
  assert.throws(() => edit_xgwx_basic_timing(source, parameter.parameterIndex, [{name: 'STATIC_PERIOD_MODE', expected: '0', replacement: 1}]), /unsupported/);
});

test('unsupported IEC basic layouts stay read-only', () => {
  const source = create_xgwx_project('XGI-CPUUN', 'ST');
  const basic = parse_xgwx(source).parameters.find(p => p.parameterType === 'BASIC PARAMETER');
  assert.deepEqual(basic.basicTimingFields, []);
  assert.throws(() => edit_xgwx_basic_timing(source, basic.parameterIndex, [{name:'STATIC_PERIOD_TIME', expected:'10', replacement:20}]), /unsupported/);
});

for (const model of ['XGK-CPUSN', 'XGI-CPUUN']) test(`${model}: native operation switches, choices and dependencies persist`, () => {
  const source = create_xgwx_project(model, 'LD');
  const before = parse_xgwx(source);
  const parameter = before.parameters.find(p => p.basicOperationFields.length);
  const fields = parameter.basicOperationFields;
  const changes = fields.map(field => ({name:field.name, expected:field.value,
    replacement: field.control.kind === 'checkbox' ? field.control.checked
      : field.control.kind === 'number' ? field.control.maximum
      : field.control.choices.at(-1).value,
  }));
  const edited = edit_xgwx_basic_parameters(source, parameter.parameterIndex, changes);
  const after = parse_xgwx(edited);
  const actual = after.parameters.find(p => p.parameterIndex === parameter.parameterIndex);
  for (const change of changes) {
    assert.equal(actual.basicOperationFields.find(f => f.name === change.name).value, String(change.replacement));
  }
  assert.deepEqual(after.programs, before.programs);
  assert.deepEqual(after.hardware, before.hardware);
  assert.throws(() => edit_xgwx_basic_parameters(edited,parameter.parameterIndex,changes), /stale/);
  if (model.startsWith('XGI')) {
    for (const slot of [1,2,3]) assert.deepEqual(actual.sections[0].attributes.find(a => a.name === `SCAN_WD_TIME_${slot}`),parameter.sections[0].attributes.find(a => a.name === `SCAN_WD_TIME_${slot}`));
  }
  assert.throws(() => edit_xgwx_basic_parameters(source,parameter.parameterIndex,[{name:'RESET_DISABLE',expected:'0',replacement:1}]), /Overall/);
  const filter = fields.find(f => f.name === 'STANDARD_INPUT_FILTER_TIME');
  for (const value of [1,3,5,10,20,70,100]) {
    assert.doesNotThrow(() => edit_xgwx_basic_parameters(source,parameter.parameterIndex,[{name:filter.name,expected:filter.value,replacement:value}]));
  }
  assert.throws(() => edit_xgwx_basic_parameters(source,parameter.parameterIndex,[{name:filter.name,expected:filter.value,replacement:0}]));
});
