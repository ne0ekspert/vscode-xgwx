import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import {nearbyInsertionPosition,nearbyInsertionEdit,iecFunctionEnableIsCompatible} from '../media/ladder-insertion.js';
import init, {edit_xgwx_ladder_cell, parse_xgwx, create_xgwx_project,
  insert_xgwx_iec_ld_single_element,insert_xgwx_iec_ld_function} from '../media/libxgwx.js';
await init({module_or_path:fs.readFileSync(new URL('../media/libxgwx_bg.wasm',import.meta.url))});

test('keeps valid cursor and prefers orthogonal cells before diagonals',()=>{
 const origin={rawY:4,column:3};const visited=[];
 assert.deepEqual(nearbyInsertionPosition(origin,{test:p=>{visited.push(p);return true;}}),origin);
 assert.equal(visited.length,1);
 assert.deepEqual(nearbyInsertionPosition(origin,{test:p=>p.rawY===8&&p.column===4}),{rawY:8,column:4});
});
test('search is bounded to two cells, including IEC native column spacing and edges',()=>{
 const visited=[];
 assert.equal(nearbyInsertionPosition({rowIndex:0,rawX:1},{iec:true,test:p=>{visited.push(p);return false;}}),null);
 assert.deepEqual(visited.slice(0,4),[{rowIndex:0,rawX:1},{rowIndex:0,rawX:4},{rowIndex:1,rawX:1},{rowIndex:1,rawX:4}]);
 assert.equal(visited.length,9);
 assert.ok(visited.every(p=>p.rowIndex<=2&&p.rawX<=7));
 assert.deepEqual(nearbyInsertionPosition({rawY:262136,column:9},{test:p=>p.rawY===262132&&p.column===8}),{rawY:262132,column:8});
});
test('real XGK writer dry run avoids occupied cursor without changing source',()=>{
 const source=edit_xgwx_ladder_cell(create_xgwx_project('XGK-CPUH','LD'),0,
   {rawY:0,column:0,expected:null,replacement:{kind:'NormallyOpen',operand:'P0000'}});
 const before=source.slice();
 const ladder=parse_xgwx(source).ladder[0];
 const cell=ladder.cells.find(c=>c.rawX===1);
 assert.ok(cell);
 const origin={rawY:cell.rawY,column:0};
 const probe=p=>{try{edit_xgwx_ladder_cell(source,0,{...p,expected:null,replacement:{kind:p.column===9?'Output':'NormallyOpen',operand:'P0000'}});return true;}catch{return false;}};
 assert.equal(probe(origin),false);
 const target=nearbyInsertionPosition(origin,{test:probe});
 assert.ok(target);assert.notDeepEqual(target,origin);assert.equal(probe(target),true);
 assert.deepEqual(source,before);
});
test('real IEC writer preflights blocked rail cell and shifts exactly one visual column',()=>{
 const source=create_xgwx_project('XGI-CPUE','LD');const before=source.slice();
 const probe=p=>{try{insert_xgwx_iec_ld_single_element(source,0,p.rowIndex,p.rawX,'contact','NO','%MX0');return true;}catch{return false;}};
 // x97 is beyond the supported contact footprint; x94 is one cell left.
 const origin={rowIndex:0,rawX:97};
 assert.equal(probe(origin),false);
 assert.deepEqual(nearbyInsertionPosition(origin,{iec:true,test:probe}),{rowIndex:0,rawX:94});
 assert.deepEqual(source,before);
});

test('reaches the second ring only when every nearer cell is blocked',()=>{
 const origin={rowIndex:10,rawX:16};const visited=[];
 const target=nearbyInsertionPosition(origin,{iec:true,test:p=>{
  visited.push(p);return p.rowIndex===10&&p.rawX===22;
 }});
 assert.deepEqual(target,{rowIndex:10,rawX:22});
 assert.equal(visited.slice(0,9).every(p=>Math.abs(p.rowIndex-10)<=1&&Math.abs(p.rawX-16)<=3),true);
 assert.equal(nearbyInsertionPosition(origin,{iec:true,test:p=>p.rawX===25}),null);
 assert.deepEqual(nearbyInsertionPosition({rawY:8,column:3},{test:p=>p.rawY===16&&p.column===5}),{rawY:16,column:5});
});

test('actual ADD footprint relocates beside MOVE while preserving its operands and source bytes',()=>{
 const source=insert_xgwx_iec_ld_function(create_xgwx_project('XGI-CPUE','LD'),0,56,7,'MOVE',JSON.stringify(['3','%MW700']));
 const before=source.slice();
 const origin={rowIndex:56,rawX:10};
 const originalBody=parse_xgwx(source).ladder[0];
 assert.equal(iecFunctionEnableIsCompatible(originalBody,{rowIndex:57,rawX:13}),false);
 const build=p=>{
  if(!iecFunctionEnableIsCompatible(originalBody,p))throw new Error('EN would overlap a non-BOOL output');
  return insert_xgwx_iec_ld_function(source,0,p.rowIndex,p.rawX,'ADD',JSON.stringify(['%MW0','%MW1','%MW2']));
 };
 assert.throws(()=>build(origin),/overlap/);
 const candidate=nearbyInsertionEdit(origin,{iec:true,build});
 assert.deepEqual(candidate.position,{rowIndex:56,rawX:16});
 assert.ok(Math.abs(candidate.position.rowIndex-56)<=2&&Math.abs(candidate.position.rawX-10)<=6);
 const body=parse_xgwx(candidate.bytes).ladder[0];
 assert.ok(body.iecFunctions.some(f=>f.name==='ADD'&&f.rowIndex===candidate.position.rowIndex));
 assert.ok(body.iecFunctions.some(f=>f.name==='MOVE'&&f.rowIndex===56));
 const feeds=body.iecCircuitGraph.edges.filter(e=>e.kind==='horizontalWire'&&e.start.rowIndex===56);
 assert.ok(feeds.some(e=>e.start.x===9&&e.end.x===12));
 assert.ok(feeds.some(e=>e.start.x===12&&e.end.x===15));
 assert.ok(body.sourceStrings.some(s=>s.value==='%MW700'));
 assert.ok(body.sourceStrings.some(s=>s.value==='%MW2'));
 assert.deepEqual(source,before);
});
test('invalid instructions do not trigger relocation and exhausted searches preserve the original error',()=>{
 const source=create_xgwx_project('XGI-CPUE','LD');let calls=0;
 assert.throws(()=>nearbyInsertionEdit({rowIndex:0,rawX:7},{iec:true,build:p=>{
  calls++;return insert_xgwx_iec_ld_function(source,0,p.rowIndex,p.rawX,'UNKNOWN',JSON.stringify(['%MW0']));
 }}));
 assert.equal(calls,1);
 const error=new Error('IEC function body or operand would overlap an existing cell');
 calls=0;
 assert.throws(()=>nearbyInsertionEdit({rowIndex:10,rawX:16},{iec:true,build:()=>{calls++;throw error;}}),e=>e===error);
 assert.equal(calls,25);
});

test('EN accepts clear space and BOOL output, but rejects numeric or input operands',()=>{
 const position={rowIndex:1,rawX:13};
 const body={iecCircuitGraph:{occupiedAreas:[{kind:'functionOperand',startRowIndex:1,endRowIndex:1,startX:10,endX:10,recordOffset:1}]},
  iecFunctionOperandLinks:[{recordOffset:1,isOutput:true,dataTypeMask:0xfffff}],
  sourceStrings:[{iecRecordOffset:1,value:'%MW700'}]};
 assert.equal(iecFunctionEnableIsCompatible(body,position),false);
 body.sourceStrings[0].value='%MX0';assert.equal(iecFunctionEnableIsCompatible(body,position),true);
 body.sourceStrings[0].value='ready';assert.equal(iecFunctionEnableIsCompatible(body,position,[{name:'ready',dataType:'BOOL'}]),true);
 body.iecFunctionOperandLinks[0].isOutput=false;assert.equal(iecFunctionEnableIsCompatible(body,position),false);
 body.iecCircuitGraph.occupiedAreas=[];assert.equal(iecFunctionEnableIsCompatible(body,position),true);
});
test('MOVE ENO can feed ADD EN on the same row, while its lower body rows cannot',()=>{
 const bytes=insert_xgwx_iec_ld_function(create_xgwx_project('XGI-CPUE','LD'),0,56,7,'MOVE',JSON.stringify(['3','%MW700']));
 const body=parse_xgwx(bytes).ladder[0];
 assert.equal(iecFunctionEnableIsCompatible(body,{rowIndex:56,rawX:16}),true);
 assert.equal(iecFunctionEnableIsCompatible(body,{rowIndex:57,rawX:13}),false);
 assert.equal(iecFunctionEnableIsCompatible(body,{rowIndex:58,rawX:13}),false);
 assert.equal(iecFunctionEnableIsCompatible(body,{rowIndex:59,rawX:13}),true);
});
