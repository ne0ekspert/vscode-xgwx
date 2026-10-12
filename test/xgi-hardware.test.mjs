import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import init, { create_xgwx_project, parse_xgwx, insert_xgwx_module, select_xgwx_module, select_xgwx_cpu, delete_xgwx_module, set_xgwx_base_slot_count } from '../media/libxgwx.js';
await init({ module_or_path: fs.readFileSync(new URL('../media/libxgwx_bg.wasm', import.meta.url)) });

test('XGI LD CPU conversion and rack module selection use the shipped WASM', () => {
  let bytes = create_xgwx_project('XGI-CPUE', 'LD');
  bytes = insert_xgwx_module(bytes, 0, 0, 'XGI-D24A/B');
  bytes = set_xgwx_base_slot_count(bytes, 0, 8);
  const original = parse_xgwx(bytes);
  for (const model of ['XGI-CPUS', 'XGI-CPUH', 'XGI-CPUU', 'XGI-CPUU/D', 'XGI-CPUUN', 'XGI-CPUE']) {
    bytes = select_xgwx_cpu(bytes, model);
    const summary = parse_xgwx(bytes);
    assert.equal(summary.cpu.model, model);
    assert.deepEqual(summary.ladder, original.ladder);
    assert.deepEqual(summary.hardware, original.hardware);
  }
  bytes = select_xgwx_module(bytes, 0, 0, 'XGQ-RY2A/B');
  assert.match(parse_xgwx(bytes).hardware.modules[0].name, /XGQ-RY2A/);
  bytes = delete_xgwx_module(bytes, 0, 0);
  assert.equal(parse_xgwx(bytes).hardware.modules.length, 0);
  assert.throws(() => insert_xgwx_module(bytes, 2, 0, 'XGI-D24A/B'), /CPU|base|limit/i);
});
