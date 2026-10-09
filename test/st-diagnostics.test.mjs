import assert from 'node:assert/strict';import test from 'node:test';import fs from 'node:fs';
import {diagnoseSt} from '../media/st-diagnostics.js';
import init,{parse_xgwx} from '../media/libxgwx.js';
const variables=[{name:'Count',dataType:'DINT'},{name:'Ready',dataType:'BOOL'},{name:'TRANS',dataType:'BOOL'},{name:'Delay',dataType:'TON'},{name:'Text',dataType:'STRING'},{name:'Latch',dataType:'RS'},{name:'Samples',dataType:'DINT',declaration:{dimensions:[{lower:0,upper:3}]}},{name:'Grid',dataType:'WORD',declaration:{dimensions:[{lower:0,upper:1},{lower:0,upper:2}]}}];
const codes=source=>diagnoseSt(source,variables).map(d=>d.code);
test('valid nested control flow, literals, arrays, FB calls and comments have no local issues',()=>{
 for(const source of ["IF Ready THEN\nCount := Count + 1;\nELSIF Count > 2 THEN\nDelay(IN := Ready, PT := T#2s, Q => Ready);\nELSE\nCount := DINT#16#FF;\nEND_IF;",'FOR Count := 0 TO 3 DO\nSamples[Count] := ADD(Count, 1);\nEND_FOR;','WHILE Ready DO\nREPEAT\nCount := Count - 1;\nUNTIL Count = 0\nEND_REPEAT;\nEND_WHILE;',"Text := 'It''s $'quoted$''; (* outer (* nested *) *)\n// Unknown is a comment\nGrid[0,2] := WORD#16#FF;",'VAR Buffer : ARRAY[0..3] OF DINT; END_VAR\nBuffer[0] := 1;','VAR Local : DINT; Local2, Local3 : WORD; END_VAR\nLocal := 1; Local2 := 2; Local3 := 3;','CASE Count OF\n0: Count := 1;\n1,2: Count := 3;\nELSE Count := 0;\nEND_CASE;'])assert.deepEqual(diagnoseSt(source,variables),[],source);
});
test('lexical and structural issues expose exact line and character offsets',()=>{
 const source="Count := 1;\n(* unclosed";const issue=diagnoseSt(source,variables)[0];assert.equal(issue.code,'comment');assert.equal(issue.line,2);assert.equal(issue.column,1);assert.equal(source.slice(issue.start,issue.end),'(*');
 assert.ok(codes("Text := 'open").includes('string'));assert.ok(codes('Count := ADD(1, 2;').includes('delimiter'));
 assert.ok(codes('IF Ready\nCount := 1;\nEND_IF;').includes('block'));assert.ok(codes('WHILE Ready DO Count := 1; END_IF;').includes('block'));
 assert.ok(codes('Count := ;').includes('expression'));assert.ok(codes('Count := 1').includes('semicolon'));
 assert.ok(codes('IF Ready THEN Count := 1 END_IF;').includes('semicolon'));
});
test('symbol, FB direction, literal type and static array checks are bounded',()=>{
 assert.ok(codes('Missing := Count;').includes('symbol'));assert.ok(codes('Count := Delay.NoPin;').includes('pin'));
 assert.ok(codes('Delay(IN := Ready, Missing := 1);').includes('pin'));assert.ok(codes('Delay(Q := Ready);').includes('pin-direction'));
 assert.ok(codes('Ready := 17;').includes('type'));assert.ok(codes('Count = 2;').includes('assignment'));
 assert.ok(codes('Samples[4] := 1;').includes('array'));assert.ok(codes('Samples[-1] := 1;').includes('array'));assert.ok(codes('Count := 1\nReady := TRUE;').includes('semicolon'));assert.ok(codes('Grid[0] := 1;').includes('array'));assert.ok(codes('Count[0] := 1;').includes('array'));
 assert.deepEqual(diagnoseSt('Latch(S := TRUE, R_1 := FALSE, Q => Ready);',variables),[]);
 assert.deepEqual(diagnoseSt('Count := UserFunction(ExternalPin := Count);',variables),[]);
 assert.deepEqual(diagnoseSt('TRANS := Ready;',variables,{transition:true}),[]);assert.ok(diagnoseSt('Count := 1;',variables,{transition:true}).some(d=>d.code==='transition'));
 assert.ok(diagnoseSt('Missing := 1;\n'.repeat(1000),variables).length<=100);
});
await init({module_or_path:fs.readFileSync(new URL('../media/libxgwx_bg.wasm',import.meta.url))});
test('native validated SFC ST fixtures have no local diagnostics',()=>{
 for(const name of ['st-programs-native-roundtrip','declarations-roundtrip','multi-action-branch-roundtrip','clipboard-branch-roundtrip']){
  const sfc=parse_xgwx(fs.readFileSync(new URL(`../../libxgwx/fixtures/sfc/${name}.xgwx`,import.meta.url))).sfc[0];
  for(const b of sfc.blocks)for(const r of b.editableRows || [])for(const key of ['actionCode','transitionCode'])if(r[key]!=null)assert.deepEqual(diagnoseSt(r[key],sfc.variables,{transition:key==='transitionCode'}),[],`${name} ${r.title} ${key}`);
 }
});
