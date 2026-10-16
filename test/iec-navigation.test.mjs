import test from 'node:test';import assert from 'node:assert/strict';
import {moveIecCursor,iecCursorRecord} from '../media/iec-navigation.js';
test('IEC cursor moves through occupied cells and clamps to canvas boundaries',()=>{
 let p={rowIndex:0,rawX:1};
 for(const x of [4,7,10]) {p=moveIecCursor(p,'ArrowRight');assert.equal(p.rawX,x);}
 assert.deepEqual(moveIecCursor(p,'ArrowLeft'),{rowIndex:0,rawX:7});
 assert.deepEqual(moveIecCursor({rowIndex:0,rawX:1},'ArrowUp'),{rowIndex:0,rawX:1});
 assert.deepEqual(moveIecCursor({rowIndex:16382,rawX:97},'ArrowDown'),{rowIndex:16382,rawX:97});
 assert.equal(moveIecCursor(p,'Enter'),null);
});
test('all rows of a function body resolve to its marker, while wires remain traversable',()=>{
 const body={iecCircuitGraph:{occupiedAreas:[
  {kind:'horizontalWire',startRowIndex:0,endRowIndex:0,startX:1,endX:4,recordOffset:1},
  {kind:'functionBlock',startRowIndex:0,endRowIndex:3,startX:7,endX:7,recordOffset:2},
  {kind:'contact',startRowIndex:0,endRowIndex:0,startX:4,endX:4,recordOffset:3},
  {kind:'coil',startRowIndex:0,endRowIndex:0,startX:94,endX:94,recordOffset:4}]}};
 for(let row=0;row<4;row++) assert.equal(iecCursorRecord(body,{rowIndex:row,rawX:7}),2);
 assert.equal(iecCursorRecord(body,{rowIndex:4,rawX:7}),null);
 assert.equal(iecCursorRecord(body,{rowIndex:0,rawX:1}),null);
 assert.equal(iecCursorRecord(body,{rowIndex:0,rawX:4}),3);
 assert.equal(iecCursorRecord(body,{rowIndex:0,rawX:94}),4);
});

test('label rows remain keyboard destinations from every IEC column', () => {
  const body = {labels:[{rawY:20,offset:600,name:'Target'}]};
  for(const rawX of [1,4,16,94])assert.equal(iecCursorRecord(body,{rowIndex:5,rawX}),600);
});

test('rung comments remain keyboard destinations from every IEC column',()=>{
 const body={sourceStrings:[{isIecComment:true,iecRowIndex:25,iecRecordOffset:1000}]};
 for(const rawX of [1,4,16,94])assert.equal(iecCursorRecord(body,{rowIndex:25,rawX}),1000);
});
