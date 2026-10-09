import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import init,{parse_xgwx,replace_xgwx_sfc_sequence} from '../media/libxgwx.js';
import {actionGroup} from '../media/sfc-actions.js';
import {captureSfcClipboard,cutSfcClipboard,pasteSfcClipboard} from '../media/sfc-clipboard.js';
await init({module_or_path:fs.readFileSync(new URL('../media/libxgwx_bg.wasm',import.meta.url))});
const fixture=name=>fs.readFileSync(new URL(`../../libxgwx/fixtures/sfc/${name}.xgwx`,import.meta.url));
const block=bytes=>parse_xgwx(bytes).sfc[0].blocks[0];
const apply=(bytes,edit)=>{const b=block(bytes);return replace_xgwx_sfc_sequence(bytes,{programIndex:0,blockIndex:0,expectedEntities:b.entities,expectedRows:b.editableRows,rows:edit.rows});};
test('copy step includes all actions and paste preserves source, timers, variables and unique names',()=>{
 const bytes=fixture('multi-action-three-native'),b=block(bytes),original=structuredClone(b.editableRows),clip=captureSfcClipboard(b,[1]);
 assert.equal(clip.rows.length,3);
 const edit=pasteSfcClipboard(b,clip,b.editableRows.length-1,[b.name]);
 const result=block(apply(bytes,edit)).editableRows,added=result.slice(b.editableRows.length);
 assert.equal(added[0].title,'S0_1');assert.equal(added[0].initial,false);
 for(let i=0;i<clip.rows.length;i++)for(const key of ['actionCode','actionQualifier','actionTime','comment'])assert.equal(added[i][key],clip.rows[i][key]);
 assert.notEqual(added[0].action,clip.rows[0].action);
 assert.deepEqual(b.editableRows,original);
 assert.deepEqual(parse_xgwx(apply(bytes,edit)).sfc[0].variables,parse_xgwx(bytes).sfc[0].variables);
});
test('action-only cut and repeated paste append actions without aliasing ST programs',()=>{
 let bytes=fixture('multi-action-three-native'),b=block(bytes),clip=captureSfcClipboard(b,[1,2,3],true);
 bytes=apply(bytes,cutSfcClipboard(b,clip));assert.equal(block(bytes).editableRows.some(r=>r.kind==='continuation'),false);
 b=block(bytes);bytes=apply(bytes,pasteSfcClipboard(b,clip,1,[b.name]));
 b=block(bytes);assert.equal(b.editableRows[1].actionCode,clip.actions[0].actionCode);
 bytes=apply(bytes,pasteSfcClipboard(b,clip,1,[b.name]));
 b=block(bytes);assert.equal(actionGroup(b.editableRows,1).filter(i=>b.editableRows[i].action).length,6);
 assert.notEqual(b.editableRows[1].action,b.editableRows[4].action);
 assert.throws(()=>pasteSfcClipboard(b,clip,0),/Select a step/);
});
test('complete branch spans paste and cut with shifted coordinates, partial spans are rejected',()=>{
 const bytes=fixture('multi-action-branch-native'),b=block(bytes),start=b.editableRows.findIndex(r=>r.kind==='parallel_split'),end=b.editableRows.findIndex(r=>r.kind==='parallel_join');
 const clip=captureSfcClipboard(b,[start-1,end]);
 assert.throws(()=>captureSfcClipboard(b,[start+1]),/complete branch/);
 assert.throws(()=>pasteSfcClipboard(b,clip,start+1),/outside the branch/);
 const edit=pasteSfcClipboard(b,clip,end,[b.name]);
 const result=block(apply(bytes,edit));assert.ok(result.editableRows);assert.equal(result.editableRows.filter(r=>r.kind==='parallel_split').length,2);
 const cut=cutSfcClipboard(b,clip);assert.ok(block(apply(bytes,cut)).editableRows);
});
test('label and jump names remap together, external jumps and empty or read-only selections are guarded',()=>{
 const rows=[{kind:'label',title:'Start',initial:false,action:null,comment:''},{kind:'step',title:'S0',initial:true,action:null,comment:''},{kind:'jump',title:'Start',initial:false,action:null,comment:''}],b={editableRows:rows};
 const clip=captureSfcClipboard(b,[0,2]),edit=pasteSfcClipboard(b,clip,2);
 assert.equal(edit.rows[3].title,'Start_1');assert.equal(edit.rows[5].title,'Start_1');assert.equal(edit.rows.filter(r=>r.initial).length,1);
 assert.throws(()=>cutSfcClipboard(b,captureSfcClipboard(b,[0])),/remaining jump/);
 assert.throws(()=>pasteSfcClipboard({editableRows:[]},captureSfcClipboard(b,[2]),-1),/requires label/);
 assert.throws(()=>captureSfcClipboard(b,[]),/Select/);assert.throws(()=>captureSfcClipboard({},[0]),/read-only/);
 assert.throws(()=>pasteSfcClipboard(b,null,0),/Copy or cut/);
});
test('paste rejects absent BOOL declarations atomically and bounds suffixed identifiers',()=>{
 const source=fixture('multi-action-branch-native'),b=block(source),i=b.editableRows.findIndex(r=>r.action==='Value_BOOL');
 // Use the named direct BOOL action from the native fixture, not its ST programs.
 const named=b.editableRows.findIndex(r=>r.action && r.actionCode==null && !r.action.startsWith('%'));
 const target=fixture('native-loop'),t=block(target),before=Buffer.from(target);
 const clip=captureSfcClipboard(b,[named>=0?named:i],true),edit=pasteSfcClipboard(t,clip,t.editableRows.findIndex(r=>r.kind==='step'));
 assert.throws(()=>apply(target,edit),/declared BOOL/);assert.deepEqual(target,before);
 const name='A'.repeat(32),row={kind:'step',title:name,comment:'',initial:true,action:null},simple={editableRows:[row]};
 const copied=pasteSfcClipboard(simple,captureSfcClipboard(simple,[0]),0).rows[1];assert.equal(copied.title.length,32);assert.ok(copied.title.endsWith('_1'));
});
test('pasted branch matches generated fixture and native XG5000 Save As retains every row and declaration',()=>{
 const source=fixture('multi-action-branch-native'),b=block(source),end=b.editableRows.findIndex(r=>r.kind==='parallel_join');
 const generated=apply(source,pasteSfcClipboard(b,captureSfcClipboard(b,[2,end]),end,[b.name]));
 const saved=fixture('clipboard-branch-roundtrip'),captured=fixture('clipboard-branch-generated');
 assert.deepEqual(block(generated).editableRows,block(captured).editableRows);
 assert.deepEqual(block(saved).editableRows,block(generated).editableRows);
 assert.deepEqual(parse_xgwx(saved).sfc[0].variables,parse_xgwx(generated).sfc[0].variables);
});
