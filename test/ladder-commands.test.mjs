import assert from 'node:assert/strict';
import test from 'node:test';
import {elementCommands,iecPinRule,scalarIecCommands,xgkInputCommands,nativeInstructionParts,instructionOperandText,xgkBlankCommands,xgkInsertionColumn} from '../media/ladder-commands.js';

test('indexed-bit prompt commands preserve the normally-closed B alias',()=>{
  const choices=xgkInputCommands([{mnemonic:'B',operandCount:2},{mnemonic:'BN',operandCount:2},{mnemonic:'=',operandCount:2}]);
  assert.deepEqual(choices.map(c=>[c.mnemonic,c.nativeMnemonic]),[['LOADB','B'],['LOADBN','BN'],['=',undefined]]);
  assert.equal(elementCommands('contact').find(c=>c.aliases.includes('B')).kind,'NormallyClosed');
  assert.ok(choices.every(c=>!c.aliases?.includes('B')));
});

test('contact aliases share guarded kinds in both workspaces', () => {
  for (const iec of [false,true]) {
    const commands=elementCommands('contact',iec);
    assert.equal(commands.find(c=>c.aliases?.includes('A')).mnemonic,'NO');
    assert.equal(commands.find(c=>c.aliases?.includes('B')).mnemonic,'NC');
    for (const name of ['NO','NC','P','P/','N','N/']) {
      const command=commands.find(c=>c.mnemonic===name);
      assert.equal(command.operandCount,1);
      assert.deepEqual(command.operandRules[0].dataTypes,[iec?'BOOL':'BIT']);
      assert.equal(command.operandRules[0].allowsConstant,false);
    }
    assert.equal(commands.some(c=>c.mnemonic==='INV'),!iec);
  }
});
test('coil edge aliases are contextual and operandless commands have no operands',()=>{
  assert.equal(elementCommands('coil',true).some(c=>c.aliases.includes('P')),false);
  assert.equal(elementCommands('coil',true,true).find(c=>c.aliases.includes('P')).mnemonic,'OUTP');
  assert.equal(elementCommands('coil',false,true).find(c=>c.aliases.includes('N')).mnemonic,'OUTN');
  assert.deepEqual(elementCommands('contact').filter(c=>!c.operandCount).map(c=>c.mnemonic),['INV','PUP','PDN']);
});

test('IEC scalar command metadata follows native pin masks and output permissions',()=>{
  const choices=scalarIecCommands();
  assert.equal(choices.find(c=>c.mnemonic==='MOVE').operandCount,2);
  assert.equal(choices.some(c=>c.mnemonic==='WORD_TO_UDINT'),false);
  const add=choices.find(c=>c.mnemonic==='ADD');
  assert.ok(add.operandRules[0].dataTypes.includes('REAL'));
  assert.equal(add.operandRules[0].dataTypes.includes('BOOL'),false);
  assert.equal(add.operandRules[2].allowsConstant,false);
  assert.deepEqual(choices.find(c=>c.mnemonic==='EQ').operandRules[2].dataTypes,['BOOL']);
  assert.deepEqual(iecPinRule({name:'IN',dataTypeMask:1,direction:'input'}).dataTypes,['BOOL']);
  assert.ok(iecPinRule({name:'IN',dataType:'ANY_NUM',dataTypeMask:0x7fe0,direction:'input'}).dataTypes.includes('REAL'));
  assert.ok(iecPinRule({name:'IN',dataType:'ANY',dataTypeMask:0xfffff,direction:'input'}).dataTypes.includes('BOOL'));
});

test('wired IEC comparisons prompt for two scalar sources',()=>{
  const ordinary=scalarIecCommands(), wired=scalarIecCommands(true);
  for (const name of ['EQ','GT','GE','LT','LE']) {
    const choice=wired.find(c=>c.mnemonic===name);
    assert.equal(choice.operandCount,2);
    assert.deepEqual(choice.operandRules.map(r=>r.label),['Source 1','Source 2']);
    assert.ok(choice.operandRules.every(r=>r.allowsConstant && r.dataTypes.includes('WORD')));
    assert.equal(ordinary.find(c=>c.mnemonic===name).operandCount,3);
  }
  assert.deepEqual(wired.find(c=>c.mnemonic==='MOVE'),ordinary.find(c=>c.mnemonic==='MOVE'));
});

test('native combined text keeps commas inside string operands',()=>{
 assert.deepEqual(nativeInstructionParts("$MOV,'Room A, on',D100"),["$MOV","'Room A, on'","D100"]);
 assert.equal(nativeInstructionParts("$MOV,'unclosed,D100"),undefined);
});

test('webview instruction validation admits commas only inside native quoted operands',()=>{
 assert.equal(instructionOperandText("'Room A, on'"),true);
 for(const text of ['D100,D104',"'Room A, on",'room\n',''])assert.equal(instructionOperandText(text),false);
 assert.equal(instructionOperandText("'Room A, on'",true),false);
});


test('blank XGK branch cells offer right-anchored outputs and preserve contact aliases',()=>{
 const ladder={instructionChoices:[{mnemonic:'MOV',operandCount:2}],comparisonChoices:[{mnemonic:'=',operandCount:2}]};
 for(const column of [2,5,8,9]) {
  const position={rawY:8,column},choices=xgkBlankCommands(ladder,position);
  for(const name of ['OUT','OUT/','SET','RST','OUTP','OUTN','MOV']) {
   const choice=choices.find(c=>c.mnemonic===name);
   assert.ok(choice,name);assert.equal(xgkInsertionColumn(choice,position),9);
  }
  const pulse=choices.find(c=>c.mnemonic==='P'||c.aliases?.includes('P'));
  assert.equal(pulse.category,column===9?'coil':'contact');
  if(column<9)assert.equal(xgkInsertionColumn(choices.find(c=>c.mnemonic==='NO'),position),column);
  assert.equal(choices.some(c=>c.mnemonic==='='),column<=6);
 }
});
