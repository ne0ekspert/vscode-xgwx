import assert from 'node:assert/strict';
import test from 'node:test';
import {stCompletionContext,stCompletions} from '../media/st-editor.js';
const variables=[{name:'Count',dataType:'DINT'},{name:'Delay',dataType:'TON'},{name:'TRANS',dataType:'BOOL'}];
test('ST completions match declarations, functions, keywords, and native FB pins',()=>{
  assert.equal(stCompletions('Cou',3,variables)[0].insert,'Count');
  assert.equal(stCompletions('AD',2,variables)[0].insert,'ADD(Input1, Input2)');
  assert.ok(stCompletions('END_',4,variables).some(v=>v.label==='END_IF'));
  assert.deepEqual(stCompletions('Delay.',6,variables).map(v=>v.label),['IN','PT','Q','ET']);
  assert.equal(stCompletions('Delay(P',7,variables)[0].insert,'PT := ');
  assert.equal(stCompletions('Delay(Q',7,variables)[0].insert,'Q => ');
  assert.ok(stCompletions('',0,variables,true).some(v=>v.label==='Count'));
  assert.deepEqual(stCompletions('Count',5,variables),[]);
  assert.ok(stCompletions('Count',5,variables,true).some(v=>v.label==='Count'));
  assert.deepEqual(stCompletions('Missing.',8,variables),[]);
});
test('ST completions exclude strings and nested comments and return the replacement range',()=>{
  for(const source of ["'Cou",'"Cou','(* Cou','(* nested (* x *) Cou','// Cou','T#2s','DWORD#16#AD','%MW100']) assert.deepEqual(stCompletions(source,source.length,variables,true),[]);
  const source='(* x *)\nCount := Cou';
  const item=stCompletions(source,source.length,variables)[0];
  assert.equal(source.slice(item.start,item.end),'Cou');
  assert.equal(stCompletionContext("'It''s'\nCou",11).prefix,'Cou');
  assert.equal(stCompletionContext('(* x *)\nCou',11).prefix,'Cou');
});
