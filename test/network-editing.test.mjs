import assert from 'node:assert/strict';import fs from 'node:fs';import test from 'node:test';
import init,{parse_xgwx,insert_xgwx_module,edit_xgwx_fenet_field,edit_xgwx_browser_network} from '../media/libxgwx.js';
await init({module_or_path:fs.readFileSync(new URL('../media/libxgwx_bg.wasm',import.meta.url))});
test('FEnet address and DHCP edits preserve the second module and ladder',()=>{
  let bytes=fs.readFileSync(new URL('../media/templates/new-xgk.xgwx',import.meta.url));
  bytes=insert_xgwx_module(bytes,0,0,'XGL-EFMT(B)');bytes=insert_xgwx_module(bytes,0,1,'XGL-EFMT(B)');
  const before=parse_xgwx(bytes),patch={base:0,slot:0,field:'ipAddress',expectedValue:'192.168.0.100',replacement:'10.20.30.40'};
  let edited=edit_xgwx_fenet_field(bytes,patch),after=parse_xgwx(edited);
  assert.equal(after.fenet[0].ipAddress,'10.20.30.40');assert.deepEqual(after.fenet[1],before.fenet[1]);assert.deepEqual(after.ladder,before.ladder);
  assert.throws(()=>edit_xgwx_fenet_field(edited,patch),/stale/);
  assert.throws(()=>edit_xgwx_fenet_field(bytes,{...patch,replacement:'10.0.0.300'}),/IPv4/);
  edited=edit_xgwx_fenet_field(edited,{base:0,slot:0,field:'dhcp',expectedValue:'0',replacement:'1'});
  assert.equal(parse_xgwx(edited).fenet[0].dhcp,1);
  const named=edit_xgwx_browser_network(edited,{networkIndex:0,module:false,field:'name',expectedValue:before.networks[0].name,replacement:'Home & Office'});
  assert.equal(parse_xgwx(named).networks[0].name,'Home & Office');
});

test('FEnet common values use native driver IDs and reject invalid ranges',()=>{
  let bytes=fs.readFileSync(new URL('../media/templates/new-xgk.xgwx',import.meta.url));
  bytes=insert_xgwx_module(bytes,0,0,'XGL-EFMT(B)');
  const before=parse_xgwx(bytes);
  for(const [field,expectedValue,replacement] of [['stationNo','0','63'],['driverType','2','5'],['driverType','5','7'],['rcvWaitTime','100','255'],['clientWaitTime','60','2'],['glofaSocketCount','3','16']]) {
    bytes=edit_xgwx_fenet_field(bytes,{base:0,slot:0,field,expectedValue,replacement});
    assert.equal(parse_xgwx(bytes).fenet[0][field],Number(replacement));
  }
  assert.deepEqual(parse_xgwx(bytes).ladder,before.ladder);
  for(const [field,expectedValue,replacement] of [['stationNo','63','64'],['driverType','7','3'],['rcvWaitTime','255','1'],['clientWaitTime','2','256'],['glofaSocketCount','16','17']]) {
    assert.throws(()=>edit_xgwx_fenet_field(bytes,{base:0,slot:0,field,expectedValue,replacement}));
  }
});
test('Native timeout units are exposed and retained through count edits',()=>{
  const bytes=fs.readFileSync(new URL('../../libxgwx/fixtures/networks/fenet-smart-native.xgwx',import.meta.url));
  const before=parse_xgwx(bytes);
  assert.equal(before.fenet[0].driverType,7);
  assert.equal(before.fenet[0].rcvWaitTimeUnit,1);
  assert.equal(before.fenet[0].clientWaitTimeUnit,1);
  const after=parse_xgwx(edit_xgwx_fenet_field(bytes,{base:0,slot:0,field:'clientWaitTime',expectedValue:'20',replacement:'21'}));
  assert.equal(after.fenet[0].clientWaitTime,21);
  assert.equal(after.fenet[0].clientWaitTimeUnit,1);
  assert.equal(after.fenet[0].rcvWaitTimeUnit,1);
  assert.deepEqual(after.fenet[1],before.fenet[1]);
});
