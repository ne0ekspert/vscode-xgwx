import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import init,{parse_xgwx,edit_xgwx_cnet_settings,insert_xgwx_module,delete_xgwx_module} from '../media/libxgwx.js';
await init({module_or_path:fs.readFileSync(new URL('../media/libxgwx_bg.wasm',import.meta.url))});
const source=fs.readFileSync(new URL('../../libxgwx/fixtures/networks/cnetbase-native.xgwx',import.meta.url));
const change=(portIndex,field,expectedValue,replacement)=>({portIndex,field,expectedValue,replacement});
const edit=(bytes,changes,slot=2)=>edit_xgwx_cnet_settings(bytes,{base:0,slot,changes});
test('Cnet edits combine operation mode, station and framing without changing the other port or programs',()=>{
  const before=parse_xgwx(source), changes=[change(0,'driverType','2','3'),change(0,'stationNo','0','255'),change(0,'dataBitRaw','1','0'),change(0,'bps','8','0')];
  const bytes=edit(source,changes),after=parse_xgwx(bytes);
  assert.equal(after.cnet[0].ports[0].stationNo,255);assert.equal(after.cnet[0].ports[0].driverType,3);
  assert.equal(after.cnet[0].ports[0].dataBitRaw,0);assert.equal(after.cnet[0].ports[0].baudRate,300);
  assert.deepEqual(after.cnet[0].ports[1],before.cnet[0].ports[1]);assert.deepEqual(after.ladder,before.ladder);assert.deepEqual(after.fenet,before.fenet);
  assert.throws(()=>edit(bytes,changes),/stale/);
  assert.throws(()=>edit(source,[change(0,'stationNo','0','32')]),/station/);
  assert.throws(()=>edit(source,[change(0,'driverType','2','3')]),/7 data bits/);
  assert.throws(()=>edit(source,[change(0,'bps','8','15')]),/baud/);
  assert.throws(()=>edit(source,[change(0,'modeRaw','0','1')]),/mode/);
  assert.throws(()=>edit(source,[change(1,'rxTimeout','1','51')]),/RxTimeOut/);
});
test('Repeater requires two matching baud rates and native selectors display their actual speeds',()=>{
  assert.throws(()=>edit(source,[change(0,'repeater','0','1')]),/both ports/);
  const after=parse_xgwx(edit(source,[change(0,'repeater','0','1'),change(1,'repeater','0','1'),change(0,'bps','8','14'),change(1,'bps','8','14')]));
  assert.deepEqual(after.cnet[0].ports.map(p=>p.baudRate),[115200,115200]);
  assert.deepEqual(after.cnet[0].ports.map(p=>p.repeater),[1,1]);
  const native=parse_xgwx(fs.readFileSync(new URL('../../libxgwx/fixtures/networks/cnetascii-native.xgwx',import.meta.url)));
  assert.deepEqual(native.cnet[0].ports.map(p=>p.baudRate),[300,64000]);
  assert.equal(native.cnet[0].ports[1].requestDelayTime,17);assert.equal(native.cnet[0].ports[0].parityErrorIgnore,1);
});
test('Cnet module insertion provides editable native defaults for all three electrical layouts',()=>{
  for(const [model,modes]of [['XGL-C22A/B',[0,0]],['XGL-CH2A/B',[0,1]],['XGL-C42A/B',[1,1]]]){
    const bytes=insert_xgwx_module(source,0,3,model),before=parse_xgwx(source),summary=parse_xgwx(bytes);
    assert.deepEqual(summary.cnet[1].ports.map(p=>p.modeRaw),modes);
    const edited=parse_xgwx(edit(bytes,[change(1,'stationNo','0','9')],3));assert.equal(edited.cnet[1].ports[1].stationNo,9);assert.deepEqual(edited.cnet[0],before.cnet[0]);
    if(model==='XGL-C22A/B')assert.throws(()=>edit(bytes,[change(0,'repeater','0','1'),change(1,'repeater','0','1')],3),/does not support repeater/);
    assert.deepEqual(parse_xgwx(delete_xgwx_module(bytes,0,3)).cnet,before.cnet);
  }
});
