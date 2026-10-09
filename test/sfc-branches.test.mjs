import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import init,{parse_xgwx,replace_xgwx_sfc_sequence} from '../media/libxgwx.js';
import {sfcAddBranch,sfcAddPath,sfcExtendPaths,sfcCollapseBranch,sfcRowsAfterEdit,sfcRowsAfterDelete,sfcRowIndex} from '../media/sfc.js';
await init({module_or_path:fs.readFileSync(new URL('../media/libxgwx_bg.wasm',import.meta.url))});
const fixture=name=>fs.readFileSync(new URL(`../../libxgwx/fixtures/sfc/${name}.xgwx`,import.meta.url));
const block=bytes=>parse_xgwx(bytes).sfc[0].blocks[0];
const apply=(bytes,rows)=>{const b=block(bytes);return replace_xgwx_sfc_sequence(bytes,{programIndex:0,blockIndex:0,expectedEntities:b.entities,expectedRows:b.editableRows,rows});};
const select=(b,row,column=0)=>b.entities.find(e=>e.row===row&&e.column===column);

test('alternative and simultaneous creation, expansion, extension and collapse retain ST and locals',()=>{
 const source=fixture('st-programs-generated'),original=block(source),vars=parse_xgwx(source).sfc[0].variables;
 for(const [kind,at] of [['alternative',1],['parallel',2]]) {
  let bytes=apply(source,sfcAddBranch(original,select(original,at),kind)),b=block(bytes);
  assert.ok(b.editableRows);assert.ok(b.editableRows.some(r=>r.kind===`${kind}_split`));
  let split=b.editableRows.find(r=>r.kind===`${kind}_split`).position.row;
  bytes=apply(bytes,sfcAddPath(b,select(b,split)));b=block(bytes);
  assert.equal(b.columns,6);
  bytes=apply(bytes,sfcExtendPaths(b,select(b,split+1,2)));b=block(bytes);
  assert.equal(b.rows,10);assert.equal(b.editableRows.filter(r=>r.position?.column===4).length,3);
  assert.deepEqual(parse_xgwx(bytes).sfc[0].variables,vars);
  bytes=apply(bytes,sfcCollapseBranch(b,select(b,split)));b=block(bytes);
  assert.equal(b.columns,2);assert.ok(b.editableRows.every(r=>!r.position));
  assert.ok(b.editableRows.some(r=>r.actionCode===original.editableRows[1].actionCode));
  assert.ok(b.editableRows.some(r=>r.transitionCode===original.editableRows[2].transitionCode));
 }
});

test('branch cells edit their own operands and deleting either two-path lane keeps the other',()=>{
 for(const column of [0,2]) {
  const bytes=fixture('branch-parallel-native'),b=block(bytes),side=select(b,4,2);
  assert.equal(b.editableRows[sfcRowIndex(b,side)].title,'S2');
  const edited=apply(bytes,sfcRowsAfterEdit(b,side,'name','SideStep'));
  assert.equal(block(edited).editableRows.find(r=>r.position?.column===2).title,'SideStep');
  const result=sfcRowsAfterDelete(b,[select(b,4,column)]);assert.ok(result);
  const reduced=block(apply(bytes,result.rows));assert.equal(reduced.columns,2);
  assert.equal(reduced.editableRows[3].title,column===0?'S2':'S1');
 }
});

test('removing one of three paths shifts surviving lanes and keeps a paired join',()=>{
 const bytes=fixture('branch-parallel-three-native'),b=block(bytes);
 for(const column of [0,2,4]) {
  const edit=sfcRowsAfterDelete(b,[select(b,4,column)]);assert.ok(edit);
  const after=block(apply(bytes,edit.rows));assert.equal(after.columns,4);
  assert.equal(after.editableRows.filter(r=>r.kind==='parallel_join').length,1);
  assert.ok(!after.editableRows.some(r=>r.kind==='step'&&r.title===['S1','S2','S3'][column/2]));
 }
});

test('custom branch priorities and missing connectors stay read only',()=>{
 const bytes=fixture('branch-alternative-native'),b=block(bytes);
 const bad=structuredClone(b.editableRows);bad.find(r=>r.kind==='alternative_join').branchEnd=4;
 assert.throws(()=>apply(bytes,bad));
 assert.equal(sfcAddBranch(b,select(b,3),'parallel'),null);
});

test('removing a path preserves a later independent branch',()=>{
 const source=fixture('structural-build'),original=block(source);
 let bytes=apply(source,sfcAddBranch(original,select(original,1),'alternative'));
 let b=block(bytes),run=b.editableRows.find(r=>r.title==='Run').position.row;
 bytes=apply(bytes,sfcAddBranch(b,select(b,run),'alternative'));b=block(bytes);
 const first=b.editableRows.find(r=>r.kind==='alternative_split').position.row;
 bytes=apply(bytes,sfcAddPath(b,select(b,first)));b=block(bytes);
 const second=b.editableRows.filter(r=>r.kind==='alternative_split')[1].position.row;
 const untouched=b.editableRows.filter(r=>r.position.row>=second);
 const edit=sfcRowsAfterDelete(b,[select(b,first+1,2)]),after=block(apply(bytes,edit.rows));
 assert.deepEqual(after.editableRows.filter(r=>r.position.row>=second),untouched);
});
