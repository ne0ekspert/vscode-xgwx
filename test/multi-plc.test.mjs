import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import init, {parse_xgwx, select_xgwx_cpu, select_xgwx_configuration_cpu, cpu_catalog} from '../media/libxgwx.js';
import {explorerNodes} from '../media/explorer-model.js';
await init({module_or_path:fs.readFileSync(new URL('../media/libxgwx_bg.wasm', import.meta.url))});
const source = fs.readFileSync(new URL('./fixtures/multi-plc/generated.xgwx', import.meta.url));
const file = {uri:'file:///multi.xgwx',fileName:'multi.xgwx'};

test('multi-PLC summary preserves document indices and reports CPU ownership without a workspace CPU', () => {
  const summary = parse_xgwx(source);
  assert.equal(summary.cpu, null);
  assert.equal(summary.counts.configurations, 3);
  assert.deepEqual(summary.configurations.map(plc => plc.cpu.model), ['XGK-CPUH','XGK-CPUHN','XGI-CPUE']);
  assert.deepEqual(summary.configurations.map(plc => plc.configurationIndex), [0,1,2]);
  assert.deepEqual(summary.configurations.map(plc => plc.programIndices), [[0],[1],[2]]);
  assert.deepEqual(summary.configurations.map(plc => plc.taskIndices), [[0],[1],[2]]);
  assert.deepEqual(summary.programs.map(program => program.configurationIndex), [0,1,2]);
  assert.deepEqual(summary.hardware.bases.filter(base => base.base === 0).map(base => base.configurationIndex), [0,1,2]);
});

test('explicit CPU edits survive serialization and leave both sibling PLCs unchanged', () => {
  const before = parse_xgwx(source);
  const bytes = select_xgwx_configuration_cpu(source, 1, 'XGK-CPUUN');
  const after = parse_xgwx(bytes);
  assert.equal(after.configurations[1].cpu.model, 'XGK-CPUUN');
  assert.deepEqual(after.configurations[0], before.configurations[0]);
  assert.deepEqual(after.configurations[2], before.configurations[2]);
  for (const field of ['hardware','programs','tasks','ladder','parameters','networks']) assert.deepEqual(after[field], before[field], field);
  assert.deepEqual(parse_xgwx(Buffer.from(bytes)), after);
  assert.deepEqual(Buffer.from(select_xgwx_configuration_cpu(bytes,1,'XGK-CPUHN')), source);
});

test('implicit targets, invalid indices and unsupported migrations cannot edit the first PLC', () => {
  const before = parse_xgwx(source);
  assert.throws(() => select_xgwx_cpu(source, 'XGK-CPUH'), /exactly one Configuration/);
  assert.throws(() => select_xgwx_configuration_cpu(source, 3, 'XGK-CPUUN'));
  for (const index of [undefined, null, "0", true, NaN, -1, 0.5, 2 ** 32, Infinity]) {
    assert.throws(() => select_xgwx_configuration_cpu(source, index, 'XGK-CPUUN'));
  }
  assert.throws(() => select_xgwx_configuration_cpu(source, 1, 'XGI-CPUUN'));
  assert.throws(() => select_xgwx_configuration_cpu(source, 2, 'XGI-CPUUN'));
  assert.deepEqual(parse_xgwx(source), before);
});

test('Explorer distinguishes repeated PLC/program/task names and repeated base numbers', () => {
  const summary = parse_xgwx(source);
  const state = explorerNodes(file, summary, {view:'overview',configurationIndex:1}, cpu_catalog());
  assert.equal(state.selectedId, 'configuration:1');
  assert.deepEqual(state.nodes.find(node => node.id === 'configurations').children.map(node => node.target.configurationIndex), [0,1,2]);
  const hardware = state.nodes.find(node => node.id === 'hardware').children;
  const programs = state.nodes.find(node => node.id === 'programs').children;
  assert.equal(hardware.length, 3);
  assert.equal(programs.length, 3);
  for (let index = 0; index < 3; index++) {
    const plc = summary.configurations[index];
    assert.deepEqual(hardware[index].children.map(node => node.target.baseIndex), plc.baseIndices);
    assert.equal(programs[index].children.length, 1);
    assert.equal(programs[index].children[0].children.length, 1);
    assert.equal(programs[index].children[0].children[0].target.programIndex, index);
  }
  const ids = [];
  const visit = nodes => nodes.forEach(node => {ids.push(node.id); if(node.children)visit(node.children);});
  visit(state.nodes);
  assert.equal(new Set(ids).size, ids.length);
});
