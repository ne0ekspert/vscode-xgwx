import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import init, {parse_xgwx, edit_xgwx_sfc_entity, replace_xgwx_sfc_sequence} from '../media/libxgwx.js';
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

test('blank SFC builds and structurally edits the captured native linear chart through WASM',()=>{
  const source=fixture('new-xgi-sfc'), native=fixture('structural-build');
  const summary=parse_xgwx(native), rows=summary.sfc[0].blocks[0].editableRows;
  assert.equal(rows.length,8);
  const bytes=replace_xgwx_sfc_sequence(source,{programIndex:0,blockIndex:0,expectedEntities:[],rows});
  assert.ok(Buffer.from(bytes).equals(native));
  const block=parse_xgwx(bytes).sfc[0].blocks[0];
  assert.deepEqual(block.editableRows,rows);
  assert.throws(()=>replace_xgwx_sfc_sequence(bytes,{programIndex:0,blockIndex:0,expectedEntities:[],rows}),/stale/);
  const shorter=rows.filter((_,i)=>i!==3&&i!==4);
  const removed=replace_xgwx_sfc_sequence(bytes,{programIndex:0,blockIndex:0,expectedEntities:block.entities,rows:shorter});
  assert.ok(Buffer.from(removed).equals(fixture('structural-delete')));
  assert.throws(()=>replace_xgwx_sfc_sequence(bytes,{programIndex:0,blockIndex:0,expectedEntities:block.entities,rows:[{...rows[1],action:'%MW1'}]}),/BOOL/);
});

test('all action qualifiers and times retain native Save As values through WASM edits',async()=>{
  const {sfcRowsAfterEdit}=await import('../media/sfc.js');
  const source=fixture('action-qualifiers'),native=fixture('action-qualifiers-native-roundtrip');
  const block=parse_xgwx(native).sfc[0].blocks[0];
  assert.deepEqual(block.editableRows,parse_xgwx(source).sfc[0].blocks[0].editableRows);
  const blank=fixture('new-xgi-sfc');
  assert.ok(Buffer.from(replace_xgwx_sfc_sequence(blank,{programIndex:0,blockIndex:0,expectedEntities:[],rows:block.editableRows})).equals(source));
  const action=block.entities.find(e=>e.typeCode===2&&e.properties.EntityAction.Qualifier==='128');
  const rows=sfcRowsAfterEdit(block,action,'action',{operand:'%MX30',qualifier:'L',time:'T#500ms'});
  const bytes=replace_xgwx_sfc_sequence(native,{programIndex:0,blockIndex:0,expectedEntities:block.entities,rows});
  const changed=parse_xgwx(bytes).sfc[0].blocks[0];
  assert.equal(changed.editableRows[action.row].actionQualifier,'L');
  assert.equal(changed.editableRows[action.row].actionTime,'T#500ms');
  const removed=sfcRowsAfterEdit(changed,changed.entities.find(e=>e.typeCode===2&&e.row===action.row),'action',{operand:'',qualifier:'L',time:'T#500ms'});
  assert.equal(removed[action.row].action,null);assert.equal(removed[action.row].actionQualifier,undefined);assert.equal(removed[action.row].actionTime,undefined);
  assert.doesNotThrow(()=>replace_xgwx_sfc_sequence(bytes,{programIndex:0,blockIndex:0,expectedEntities:changed.entities,rows:removed}));
});

test('SFC range deletion is one validated edit with action metadata, label cleanup, and initial status preserved',async()=>{
  const {sfcRowsAfterDelete}=await import('../media/sfc.js');
  const source=fixture('structural-build'),block=parse_xgwx(source).sfc[0].blocks[0];
  const pair=block.entities.filter(e=>e.column===0&&[3,4].includes(e.row));
  const apply=(bytes,block,edit)=>replace_xgwx_sfc_sequence(bytes,{programIndex:0,blockIndex:0,expectedEntities:block.entities,rows:edit.rows});
  const edit=sfcRowsAfterDelete(block,pair);
  assert.equal(edit.selectedRow,3);
  assert.ok(Buffer.from(apply(source,block,edit)).equals(fixture('structural-delete')));
  const cleanup=sfcRowsAfterDelete(block,block.entities.filter(e=>e.column===0&&e.row<=1));
  const cleaned=parse_xgwx(apply(source,block,cleanup)).sfc[0].blocks[0].editableRows;
  assert.equal(cleaned.some(r=>['label','jump'].includes(r.kind)),false);
  assert.equal(cleaned.find(r=>r.initial).title,'Run');
  assert.equal(cleaned.find(r=>r.title==='Done').action,'%MX11');
  assert.equal(block.editableRows.length,8);
  assert.equal(sfcRowsAfterDelete(block,[{row:3,column:1,typeCode:10,newAction:true}]),null);
  const all=fixture('action-qualifiers-native-roundtrip'),timed=parse_xgwx(all).sfc[0].blocks[0];
  const removed=sfcRowsAfterDelete(timed,timed.entities.filter(e=>e.typeCode===2));
  const rows=parse_xgwx(apply(all,timed,removed)).sfc[0].blocks[0].editableRows;
  assert.equal(rows.length,timed.editableRows.length);
  assert.ok(rows.every(r=>r.action===null&&r.actionQualifier==null&&r.actionTime==null));
  assert.deepEqual(rows.map(r=>[r.kind,r.title,r.initial]),timed.editableRows.map(r=>[r.kind,r.title,r.initial]));
});
