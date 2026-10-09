import test from 'node:test';
import assert from 'node:assert/strict';
import {appendAction,removeActions,moveAction,moveRowUnit,actionGroup} from '../media/sfc-actions.js';
const row=(kind,title='',action=null)=>({kind,title,comment:'',initial:false,action});
const timed={action:'%MX12',actionQualifier:'L',actionTime:'T#2s'};
const st={action:'Pulse',actionQualifier:'P',actionCode:'Count := Count + 1;'};
test('independent action descriptors append, reorder and promote without changing the step',()=>{
 const original=[row('label','Start'),row('step','S0','%MX0'),row('transition','%MX1'),row('jump','Start')];
 let result=appendAction(original,1,timed);result=appendAction(result.rows,1,st);
 assert.deepEqual(actionGroup(result.rows,3),[1,2,3]);assert.equal(original.length,4);
 const moved=moveAction(result.rows,3,-1);assert.equal(moved.index,2);assert.equal(moved.rows[2].actionCode,st.actionCode);assert.equal(moved.rows[3].actionTime,'T#2s');
 const deleted=removeActions(moved.rows,[1,3]);assert.equal(deleted.length,4);assert.equal(deleted[1].title,'S0');assert.equal(deleted[1].action,'Pulse');assert.equal(deleted[1].actionQualifier,'P');
 assert.equal(removeActions(result.rows,[3]).length,5);
 const unit=moveRowUnit(result.rows,1,1);assert.deepEqual(unit.rows.map(r=>r.kind),['label','transition','step','continuation','continuation','jump']);
});
test('branch action insertion pads every path and removal retains the other path action',()=>{
 const rows=[row('step','S1','%MX0'),row('step','S2','%MX2'),row('parallel_join'),row('transition','%MX3')].map((r,i)=>({...r,position:{row:i<2?4:i+3,column:i===1?2:0},...(i===2?{branchEnd:2}:{})}));
 const a=appendAction(rows,0,timed);assert.deepEqual(a.rows.filter(r=>r.kind==='continuation').map(r=>r.position),[{row:5,column:0},{row:5,column:2}]);
 const b=appendAction(a.rows,1,st);assert.equal(b.rows.length,a.rows.length);assert.equal(b.rows[b.index].position.column,2);
 const c=removeActions(b.rows,[0,1,2]);assert.equal(c.filter(r=>r.kind==='continuation').length,0);assert.equal(c.find(r=>r.title==='S2').action,'Pulse');assert.equal(c.find(r=>r.kind==='parallel_join').position.row,5);
 assert.equal(appendAction(rows,2,timed),null);
});

import fs from 'node:fs';
import init,{parse_xgwx,replace_xgwx_sfc_sequence} from '../media/libxgwx.js';
import {sfcRowsAfterDelete,sfcAddPath,sfcExtendPaths} from '../media/sfc.js';
await init({module_or_path:fs.readFileSync(new URL('../media/libxgwx_bg.wasm',import.meta.url))});
const fixture=name=>fs.readFileSync(new URL(`../../libxgwx/fixtures/sfc/${name}.xgwx`,import.meta.url));
const block=bytes=>parse_xgwx(bytes).sfc[0].blocks[0];
const apply=(bytes,rows)=>{const b=block(bytes);return replace_xgwx_sfc_sequence(bytes,{programIndex:0,blockIndex:0,expectedEntities:b.entities,expectedRows:b.editableRows,rows});};
test('native mixed stacks survive individual edits, reordering, and deletion through WASM',()=>{
 const original=fixture('multi-action-three-native'),b=block(original),vars=parse_xgwx(original).sfc[0].variables;
 const rows=appendAction(b.editableRows,1,{action:'Pulse2',actionQualifier:'P',actionCode:'Count := Count + 2;'}).rows;
 let bytes=apply(original,rows);assert.equal(block(bytes).editableRows[4].actionCode,'Count := Count + 2;');
 bytes=apply(bytes,moveAction(block(bytes).editableRows,4,-1).rows);assert.equal(block(bytes).editableRows[3].action,'Pulse2');
 const current=block(bytes),selected=current.entities.find(e=>e.row===2&&e.column===1);
 bytes=apply(bytes,sfcRowsAfterDelete(current,[selected]).rows);assert.equal(block(bytes).editableRows[2].action,'Pulse2');
 assert.deepEqual(parse_xgwx(bytes).sfc[0].variables,vars);
 const last=block(bytes),step=last.entities.find(e=>e.row===1&&e.column===0);
 assert.equal(block(apply(bytes,sfcRowsAfterDelete(last,[step]).rows)).editableRows.some(r=>r.kind==='continuation'),false);
});
test('branch stacks stay editable when another path or alternating pair is added',()=>{
 const source=fixture('multi-action-branch-native'),b=block(source),split=b.entities.find(e=>e.typeCode===4&&e.row===3);
 let bytes=apply(source,sfcAddPath(b,split));assert.equal(block(bytes).columns,6);
 let current=block(bytes),step=current.entities.find(e=>e.typeCode===0&&e.row===4&&e.column===0);
 bytes=apply(bytes,sfcExtendPaths(current,step));assert.ok(block(bytes).editableRows);assert.equal(block(bytes).editableRows.find(r=>r.kind==='continuation'&&r.action).action,'%MX14');
 current=block(bytes);const i=current.editableRows.findIndex(r=>r.title==='S2');
 bytes=apply(bytes,appendAction(current.editableRows,i,st).rows);assert.ok(block(bytes).editableRows.some(r=>r.actionCode===st.actionCode));
});

test('appending a reference to an existing ST program reuses its source',async()=>{
 const {sfcRowsAfterEdit}=await import('../media/sfc.js');
 const source=fixture('multi-action-three-native'),b=block(source),step=b.entities.find(e=>e.typeCode===0&&e.row===1);
 const rows=sfcRowsAfterEdit(b,{...step,appendAction:true},'action',{operand:'UpdateValues',kind:'program',qualifier:'P',time:''});
 assert.equal(rows[4].actionCode,rows[1].actionCode);assert.equal(block(apply(source,rows)).editableRows[4].action,'UpdateValues');
});
