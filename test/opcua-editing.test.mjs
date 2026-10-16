import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import init, {parse_xgwx, insert_xgwx_module, edit_xgwx_opcua_settings, edit_xgwx_fenet_field} from '../media/libxgwx.js';
await init({module_or_path: fs.readFileSync(new URL('../media/libxgwx_bg.wasm', import.meta.url))});
const source = fs.readFileSync(new URL('./fixtures/networks/cnetbase-native.xgwx', import.meta.url));
const change = (field, expectedValue, replacement) => ({field, expectedValue, replacement});
test('EOPCT insertion provides live OPC UA options and synchronizes its derived endpoint', () => {
  let bytes = insert_xgwx_module(source, 0, 3, 'XGL-EOPCT');
  const before = parse_xgwx(bytes);
  assert.equal(before.opcua.length, 1);
  bytes = edit_xgwx_opcua_settings(bytes, 0, 3, [change('port', '4840', '4841'), change('samplingInterval', '200', '20')]);
  const after = parse_xgwx(bytes);
  assert.equal(after.opcua[0].endpoint, 'opc.tcp://192.168.1.2:4841');
  assert.deepEqual(after.ladder, before.ladder);
  assert.deepEqual(after.cnet, before.cnet);
  bytes = edit_xgwx_fenet_field(bytes, {base: 0, slot: 3, ...change('ipAddress', '192.168.1.2', '10.3.2.1')});
  assert.equal(parse_xgwx(bytes).opcua[0].endpoint, 'opc.tcp://10.3.2.1:4841');
  for (const invalid of [change('port', '4841', '502'), change('samplingInterval', '20', '19'), change('port', '4840', '4842')]) {
    assert.throws(() => edit_xgwx_opcua_settings(bytes, 0, 3, [invalid]));
  }
});
test('XGK OPC UA nodes persist through create, update and delete without touching globals', async () => {
  const {edit_xgwx_opcua_tag} = await import('../media/libxgwx.js');
  let bytes = insert_xgwx_module(source, 0, 3, 'XGL-EOPCT');
  const before = parse_xgwx(bytes);
  const newTag = {name: 'PumpReady', dataType: 'BIT', addressArea: 'M', addressNumber: 170, comment: 'Pump & line <A>'};
  bytes = edit_xgwx_opcua_tag(bytes, {configurationIndex: 0, expectedTags: [], index: null, tag: newTag});
  assert.deepEqual(parse_xgwx(bytes).opcuaTags[0].tags, [newTag]);
  const changed = {...newTag, name: 'PumpAvailable', addressNumber: 176};
  bytes = edit_xgwx_opcua_tag(bytes, {configurationIndex: 0, expectedTags: [newTag], index: 0, tag: changed});
  assert.deepEqual(parse_xgwx(bytes).opcuaTags[0].tags, [changed]);
  assert.throws(() => edit_xgwx_opcua_tag(bytes, {configurationIndex: 0, expectedTags: [newTag], index: 0, tag: null}), /stale/);
  assert.throws(() => edit_xgwx_opcua_tag(bytes, {configurationIndex: 0, expectedTags: [changed], index: null, tag: changed}), /unique/);
  bytes = edit_xgwx_opcua_tag(bytes, {configurationIndex: 0, expectedTags: [changed], index: 0, tag: null});
  const after = parse_xgwx(bytes);
  assert.deepEqual(after.opcuaTags[0].tags, []);
  assert.deepEqual(after.variables, before.variables);
  assert.deepEqual(after.ladder, before.ladder);
});

test('explicit integer signedness persists through the WASM writer and parser', async () => {
  const {edit_xgwx_opcua_tag} = await import('../media/libxgwx.js');
  let bytes = insert_xgwx_module(source, 0, 3, 'XGL-EOPCT');
  for (const [index, dataType] of ['SINT','USINT','INT','UINT','DINT','UDINT','LINT','ULINT'].entries()) {
    const tags = parse_xgwx(bytes).opcuaTags[0].tags;
    const tag = {name: `Int${index}`, dataType, addressArea: index < 2 ? 'M' : 'D', addressNumber: index < 2 ? 16 + index * 8 : 100 + index * 4, comment: 'Explicit integer'};
    bytes = edit_xgwx_opcua_tag(bytes, {configurationIndex: 0, expectedTags: tags, index: null, tag});
    assert.equal(parse_xgwx(bytes).opcuaTags[0].tags.at(-1).dataType, dataType);
  }
  const tags = parse_xgwx(bytes).opcuaTags[0].tags;
  bytes = edit_xgwx_opcua_tag(bytes, {configurationIndex: 0, expectedTags: tags, index: 2, tag: {...tags[2], dataType: 'UINT'}});
  assert.equal(parse_xgwx(bytes).opcuaTags[0].tags[2].dataType, 'UINT');
  assert.equal(parse_xgwx(bytes).opcuaTags[0].tags[3].dataType, 'UINT');
});
