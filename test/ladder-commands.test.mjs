import assert from 'node:assert/strict';
import test from 'node:test';
import {elementCommands,iecPinRule,scalarIecCommands} from '../media/ladder-commands.js';

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
