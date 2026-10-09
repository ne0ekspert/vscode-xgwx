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

test('independent path extension pads other lanes, retains sources, and removes a pair without removing the path',async()=>{
 const {sfcRemovePathPair}=await import('../media/sfc.js');
 for(const name of ['multi-action-branch-native','branch-alternative-native']) {
  const original=fixture(name),b=block(original),split=b.editableRows.find(r=>r.kind.endsWith('_split')),at=split.position.row+1;
  const before=b.editableRows.filter(r=>r.position.column===0 && r.position.row>split.position.row && !r.kind.endsWith('_join')).map(r=>({...r,position:undefined}));
  const rows=sfcExtendPaths(b,select(b,at,2),true),bytes=apply(original,rows),edited=block(bytes);
  assert.ok(edited.editableRows);assert.equal(edited.editableRows.filter(r=>r.position.column===2 && ['step','transition'].includes(r.kind)).length,b.editableRows.filter(r=>r.position.column===2 && ['step','transition'].includes(r.kind)).length+2);
  const main=edited.editableRows.filter(r=>r.position.column===0 && r.position.row>split.position.row && !r.kind.endsWith('_join') && !(r.kind==='continuation' && !r.action)).map(r=>({...r,position:undefined}));
  assert.deepEqual(main,before.filter(r=>!(r.kind==='continuation'&&!r.action)));
  assert.deepEqual(parse_xgwx(bytes).sfc[0].variables,parse_xgwx(original).sfc[0].variables);
  const last=edited.editableRows.filter(r=>r.position.column===2&&['step','transition'].includes(r.kind)).at(-1);
  const removed=sfcRemovePathPair(edited,select(edited,last.position.row,2));assert.ok(removed);assert.deepEqual(block(apply(bytes,removed.rows)).editableRows,b.editableRows);
  const all=apply(bytes,sfcExtendPaths(edited,select(edited,at,0)));assert.ok(block(all).editableRows);
  assert.equal(sfcRemovePathPair(b,select(b,at,2)),null);
 }
});

test('native Save As retains independently padded alternative and simultaneous paths',()=>{
 for(const kind of ['parallel','alternative']) {
  const a=fixture(`branch-independent-${kind}-generated`),b=fixture(`branch-independent-${kind}-roundtrip`);
  assert.ok(block(a).editableRows);assert.deepEqual(block(a).editableRows,block(b).editableRows);
  assert.deepEqual(parse_xgwx(a).sfc[0].variables,parse_xgwx(b).sfc[0].variables);
 }
});

test('selecting a step creates a simultaneous split before it and preserves its action stack',async()=>{
 const bytes=fixture('st-programs-generated'),b=block(bytes),step=b.entities.find(e=>e.typeCode===0&&e.row===3),rows=sfcAddBranch(b,step,'parallel');
 assert.ok(rows);assert.equal(rows.find(r=>r.kind==='parallel_split').position.row,3);
 assert.equal(rows.find(r=>r.title===b.editableRows[3].title&&r.kind==='step').position.row,4);
 assert.ok(block(apply(bytes,rows)).editableRows);
 assert.equal(sfcAddBranch(b,b.entities.find(e=>e.typeCode===0&&e.row===1),'parallel'),null);
 const {appendAction}=await import('../media/sfc-actions.js');
 let stacked=apply(bytes,appendAction(b.editableRows,3,{action:'%MX12'}).rows),sb=block(stacked);
 stacked=apply(stacked,appendAction(sb.editableRows,3,{action:'%MX13',actionQualifier:'P'}).rows);sb=block(stacked);
 const selected=sb.entities.find(e=>e.typeCode===0&&e.row===3),branched=sfcAddBranch(sb,selected,'parallel');
 const result=block(apply(stacked,branched)).editableRows;
 assert.equal(result.find(r=>r.kind==='parallel_split').position.row,3);
 assert.equal(result.find(r=>r.kind==='parallel_join').position.row,7);
 assert.deepEqual(result.filter(r=>r.position.column===0 && r.position.row>=4 && r.position.row<=6).map(r=>({...r,position:undefined})),sb.editableRows.slice(3,6).map(r=>({...r,position:undefined})));
 assert.equal(result.filter(r=>r.kind==='continuation'&&r.position.column===2).length,2);

});

test('adding simultaneous branches extends the existing split beyond eight lanes and stops at 512 ordinary steps',()=>{
 const source=fixture('multi-action-branch-native'),original=block(source);let rows=original.editableRows;
 const splitRow=rows.find(r=>r.kind==='parallel_split').position.row;
 for(let n=2;n<511;n++) {
  const b={...original,editableRows:rows};rows=sfcAddPath(b,{row:splitRow,column:0,typeCode:4});assert.ok(rows,`path ${n+1}`);
 }
 assert.equal(rows.filter(r=>r.kind==='step').length,512);assert.equal(rows.find(r=>r.kind==='parallel_split').branchEnd,1020);
 assert.equal(sfcAddPath({...original,editableRows:rows},{row:splitRow,column:0,typeCode:4}),null);
 // Exercise planner output through the writer/reader at 16 paths.
 rows=original.editableRows;
 for(let n=2;n<16;n++)rows=sfcAddBranch({...original,editableRows:rows},select(original,splitRow+1),'parallel');
 const bytes=apply(source,rows),parsed=block(bytes);assert.ok(parsed.editableRows);assert.equal(parsed.columns,32);
 assert.deepEqual(parsed.editableRows,rows);assert.deepEqual(parse_xgwx(bytes).sfc[0].variables,parse_xgwx(source).sfc[0].variables);
});

test('alternative paths obey native column bounds independently of the ordinary-step limit',async()=>{
 const {sfcRowsFit}=await import('../media/sfc-limits.js');
 const base={kind:'transition',title:'%MX0',comment:'',initial:false,action:null,position:{row:3,column:65532}};
 assert.equal(sfcRowsFit([base,{...base,kind:'alternative_join',title:'',branchEnd:65532,position:{row:4,column:0}}]),true);
 assert.equal(sfcRowsFit([{...base,position:{row:3,column:65534}}]),false);
 const source=fixture('branch-alternative-native'),b=block(source),split=b.editableRows.find(r=>r.kind==='alternative_split');let rows=b.editableRows;
 for(let n=2;n<16;n++)rows=sfcAddBranch({...b,editableRows:rows},{typeCode:4,row:split.position.row,column:0},'alternative');
 assert.equal(block(apply(source,rows)).columns,32);
 assert.equal(sfcAddBranch({...b,editableRows:rows},{typeCode:4,row:split.position.row,column:0},'parallel'),null);
});

test('native sixteen-path and 512-step Save As fixtures retain all rows and declarations',()=>{
 for(const [name,paths] of [['branch-sixteen',16],['branch-step-limit',511]]) {
  const a=parse_xgwx(fixture(`${name}-generated`)).sfc[0],b=parse_xgwx(fixture(`${name}-roundtrip`)).sfc[0];
  assert.ok(a.blocks[0].editableRows);assert.deepEqual(b.blocks[0].editableRows,a.blocks[0].editableRows);
  assert.deepEqual(b.variables,a.variables);assert.equal(b.blocks[0].columns,paths*2);
  assert.equal(b.blocks[0].editableRows.filter(r=>r.kind==='step').length,paths+1);
 }
});
