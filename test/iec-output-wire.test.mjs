import test from 'node:test';
import assert from 'node:assert/strict';
import {canWireIecOutput,iecOutputWireAt} from '../media/iec-output-wire.js';
import {scalarIecCommands} from '../media/ladder-commands.js';
test('numeric functions wire ENO and never their numeric OUT',()=>{
 for(const name of ['ADD','SUB','DIV','INT_TO_UDINT']) {
  assert.equal(canWireIecOutput({name},{name:'ENO',direction:'output',dataTypeMask:1}),true);
  assert.equal(canWireIecOutput({name},{name:'OUT',direction:'output',dataTypeMask:0x800}),false);
 }
 assert.equal(canWireIecOutput({name:'EQ'},{name:'OUT',direction:'output',dataTypeMask:1}),true);
 assert.equal(canWireIecOutput({name:'EQ'},{name:'IN1',direction:'input',dataTypeMask:1}),false);
 assert.equal(canWireIecOutput({name:'TON',instance:'timer'},{name:'Q',direction:'output',dataTypeMask:1}),true);
});
test('wire endpoint requires a continuous feed from the same block',()=>{
 const pin={name:'ENO',direction:'output',dataTypeMask:1,rowIndex:0,rawX:10};
 const block={name:'ADD',groupIndex:0,controlOutput:pin};
 const body={iecFunctions:[block],iecRecords:[{offset:10,kind:'Short wire'}],
  iecGeometry:{horizontal:[{offset:10,groupIndex:0,rowIndex:0,startX:10,endX:13}]}};
 assert.equal(iecOutputWireAt(body,{rowIndex:0,rawX:10}).block,block);
 assert.equal(iecOutputWireAt(body,{rowIndex:0,rawX:13}).block,block);
 assert.equal(iecOutputWireAt(body,{rowIndex:0,rawX:16}),null);
 assert.equal(iecOutputWireAt(body,{rowIndex:1,rawX:13}),null);
 body.iecGeometry.horizontal[0].groupIndex=1;
 assert.equal(iecOutputWireAt(body,{rowIndex:0,rawX:13}),null);
});
test('only comparison creation makes the BOOL destination optional',()=>{
 const choices=scalarIecCommands(false,true);
 assert.equal(choices.find(c=>c.mnemonic==='EQ').minOperandCount,2);
 assert.equal(choices.find(c=>c.mnemonic==='EQ').operandCount,3);
 for(const name of ['MOVE','ADD','SUB','DIV']) assert.equal(choices.find(c=>c.mnemonic===name).minOperandCount,undefined);
});

test('FF Q is a BOOL wire output without a destination variable',()=>{
 const block={name:'FF',instance:'Toggle'},q={name:'Q',direction:'output',dataTypeMask:1,rowIndex:14,rawX:7};
 assert.equal(canWireIecOutput(block,q),true);
 assert.equal(iecOutputWireAt({iecFunctions:[{...block,controlOutput:q}]},{rowIndex:14,rawX:7}).pin,q);
 assert.equal(canWireIecOutput(block,{...q,direction:'input'}),false);
 assert.equal(canWireIecOutput(block,{...q,dataTypeMask:0x800}),false);
 assert.equal(canWireIecOutput({name:'FF'},q),false);
});

test('native instance Q/QU/QD and bitwise BOOL-capable OUT pins can drive wires',()=>{
 for(const name of ['R_TRIG','F_TRIG','TON','TOF','TP','RS','SR','CTU_DINT','CTD_DINT']) {
  assert.equal(canWireIecOutput({name,instance:'I'},{name:'Q',direction:'output',dataTypeMask:1}),true,name);
  assert.equal(canWireIecOutput({name,instance:'I'},{name:'CV',direction:'output',dataTypeMask:128}),false);
 }
 for(const pin of ['QU','QD'])assert.equal(canWireIecOutput({name:'CTUD_DINT',instance:'C'},{name:pin,direction:'output',dataTypeMask:1}),true);
 for(const name of ['NE','WORD_TO_UDINT','MOD','AND','OR','XOR','NOT']) assert.equal(canWireIecOutput({name},{name:'ENO',direction:'output',dataTypeMask:1}),true,name);
 assert.equal(canWireIecOutput({name:'AND'},{name:'OUT',direction:'output',dataTypeMask:31}),true);
 assert.equal(canWireIecOutput({name:'MOD'},{name:'OUT',direction:'output',dataTypeMask:8160}),false);
});
