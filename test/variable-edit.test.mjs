import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import init, { parse_xgwx, update_xgwx_variable, rename_xgwx_iec_local_symbol } from '../media/libxgwx.js';
import { buildVariableEdit, globalAddress, variableAddressConflict } from '../media/variable-edit.js';
await init({ module_or_path: fs.readFileSync(new URL('../media/libxgwx_bg.wasm', import.meta.url)) });
const source = fs.readFileSync(new URL('../../libxgwx/fixtures/elements.xgwx', import.meta.url));

test('global address popup decodes hex bit positions and swaps only addresses', () => {
  const summary = parse_xgwx(source), variable = { ...summary.variables[0], globalVariableIndex: 0 };
  assert.deepEqual(globalAddress(variable, 'M0000A'), { addressArea: 'M', addressNumber: 10 });
  assert.deepEqual(globalAddress(variable, 'M0001F'), { addressArea: 'M', addressNumber: 31 });
  assert.throws(() => globalAddress(variable, 'M00GG'), /device address/);
  const conflict = variableAddressConflict(variable, 'p1', summary);
  assert.equal(conflict.globalVariableIndex, 1);
  assert.throws(() => buildVariableEdit(source, variable, 'address', 'P00001', summary), /occupied/);
  const swapped = buildVariableEdit(source, variable, 'address', 'P00001', summary, true);
  const after = parse_xgwx(swapped);
  assert.equal(after.variables[0].address, 'P00001');
  assert.equal(after.variables[1].address, 'P00000');
  assert.deepEqual(after.variables.slice(2), summary.variables.slice(2));
  assert.equal(after.variables[0].name, variable.name);
  assert.equal(after.variables[1].description, summary.variables[1].description);
  const restored = parse_xgwx(buildVariableEdit(swapped, { ...after.variables[0], globalVariableIndex: 0 }, 'address', 'P00000', after, true));
  assert.deepEqual(restored.variables, summary.variables);
  assert.deepEqual(restored.ladder, summary.ladder);
});

test('variable field edits reject duplicate names without mutating source', () => {
  const summary = parse_xgwx(source), variable = { ...summary.variables[0], globalVariableIndex: 0 }, before = Buffer.from(source);
  assert.throws(() => buildVariableEdit(source, variable, 'name', summary.variables[1].name.toLowerCase(), summary), /unique/);
  assert.throws(() => update_xgwx_variable(source, 0, { name: summary.variables[1].name.toLowerCase() }), /unique/);
  assert.throws(() => buildVariableEdit(source, variable, 'name', '', summary), /unique/);
  const edited = buildVariableEdit(source, variable, 'name', '_0000_DI00', summary);
  assert.equal(parse_xgwx(edited).variables[0].name, '_0000_DI00');
  const comment = buildVariableEdit(source, variable, 'description', '수정 접점 00', summary);
  assert.equal(parse_xgwx(comment).variables[0].description, '수정 접점 00');
  assert.deepEqual(source, before);
});

test('IEC mapped address swap is reversible and preserves program payloads', context => {
  const file = process.env.LIBXGWX_XGI_FIXTURE;
  if (!file) return context.skip('set LIBXGWX_XGI_FIXTURE to a native IEC workspace');
  const bytes = fs.readFileSync(file), summary = parse_xgwx(bytes);
  const programIndex = summary.localVariables.findIndex(table => table.filter(v => v.address?.startsWith('%MX') && v.dataType === 'BOOL').length >= 2);
  assert.ok(programIndex >= 0);
  const table = summary.localVariables[programIndex];
  const indices = table.map((v, i) => v.address?.startsWith('%MX') && v.dataType === 'BOOL' ? i : -1).filter(i => i >= 0);
  const variable = { ...table[indices[0]], localProgramIndex: programIndex, localVariableIndex: indices[0] }, target = table[indices[1]];
  const edited = buildVariableEdit(bytes, variable, 'address', target.address, summary, true), after = parse_xgwx(edited);
  assert.equal(after.localVariables[programIndex][indices[0]].address, target.address);
  assert.equal(after.localVariables[programIndex][indices[1]].address, variable.address);
  assert.deepEqual(after.ladder, summary.ladder);
  const restored = buildVariableEdit(edited, { ...variable, address: target.address }, 'address', variable.address, after, true);
  const restoredSummary = parse_xgwx(restored);
  assert.deepEqual(restoredSummary.localVariables, summary.localVariables);
  assert.deepEqual(restoredSummary.ladder, summary.ladder);
  assert.throws(() => buildVariableEdit(bytes, variable, 'name', target.name.toLowerCase(), summary), /unique/);
  assert.throws(() => rename_xgwx_iec_local_symbol(bytes, programIndex, indices[0], variable.name, target.name.toLowerCase()), /unique/);
});

test('global names/comments grow and shrink while later variable fields stay intact', () => {
  let bytes = source;
  const original = parse_xgwx(source);
  for (const [name, description] of [['Longer_variable_name', 'Longer comment with Unicode 😀'], ['V', ''], ['변수_이름', '짧은 설명']]) {
    const summary = parse_xgwx(bytes), variable = { ...summary.variables[0], globalVariableIndex: 0 };
    bytes = buildVariableEdit(bytes, variable, 'name', name, summary);
    const renamed = parse_xgwx(bytes);
    bytes = buildVariableEdit(bytes, { ...renamed.variables[0], globalVariableIndex: 0 }, 'description', description, renamed);
    const after = parse_xgwx(bytes);
    assert.equal(after.variables[0].name, name);
    assert.equal(after.variables[0].description, description);
    assert.deepEqual(after.variables.slice(1), original.variables.slice(1));
    assert.deepEqual(after.ladder, original.ladder);
  }
  const combined = update_xgwx_variable(source, 0, { name: 'CombinedLongName', description: 'Comment', addressNumber: 42 });
  assert.equal(parse_xgwx(combined).variables[0].address, 'P0002A');
  assert.throws(() => update_xgwx_variable(source, 0, { description: 'x'.repeat(256) }), /255/);
});
