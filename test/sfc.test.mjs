import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import init, {parse_xgwx, edit_xgwx_sfc_entity} from '../media/libxgwx.js';
await init({module_or_path: fs.readFileSync(new URL('../media/libxgwx_bg.wasm',import.meta.url))});
const fixture = name => fs.readFileSync(new URL(`../../libxgwx/fixtures/sfc/${name}.xgwx`,import.meta.url));
const patch = {programIndex:0,blockIndex:0,entityIndex:2,expectedType:1,expectedRow:2,expectedColumn:0,
  field:'condition',expectedValue:'%MX0',replacement:'%MX2'};

test('native SFC summary skips the binary ladder decoder and retains entity properties',()=>{
  const summary=parse_xgwx(fixture('native-loop'));
  assert.equal(summary.counts.ladderErrors,0);
  assert.equal(summary.ladder.length,0);
  assert.ok(summary.warnings.some(w=>w.includes("SFC local symbols are preserved but not decoded")));
  assert.equal(summary.sfc[0].blocks[0].entities[1].properties.EntityStep.InitialStep,'1');
  assert.equal(summary.sfc[0].blocks[0].entities[5].typeCode,5);
});

test('native action qualifier and BOOL operand survive WASM decoding',()=>{
  const entities=parse_xgwx(fixture('native-action')).sfc[0].blocks[0].entities;
  const action=entities.find(e=>e.typeCode===2);
  assert.equal(action.properties.EntityAction.Qualifier,'1');
  assert.equal(action.properties.EntityStep.Title,'%MX10');
});

test('SFC transition edits synchronize the annotation and reject stale or unvalidated writes',()=>{
  const native=fixture('native-loop');
  const bytes=edit_xgwx_sfc_entity(native,patch);
  const entities=parse_xgwx(bytes).sfc[0].blocks[0].entities;
  assert.equal(entities[2].properties.EntityStep.Title,'%MX2');
  assert.equal(entities[8].properties.EntityStep.Title,'%MX2');
  assert.throws(()=>edit_xgwx_sfc_entity(bytes,patch),/stale/);
  assert.throws(()=>edit_xgwx_sfc_entity(native,{...patch,replacement:'%MW2'}),/BOOL/);
  assert.throws(()=>edit_xgwx_sfc_entity(native,{...patch,field:'name'}),/not validated/);
  assert.throws(()=>edit_xgwx_sfc_entity(native,{...patch,field:'comment',expectedValue:''}),/not validated/);
});
