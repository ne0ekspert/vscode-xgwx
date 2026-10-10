import test from 'node:test';
import assert from 'node:assert/strict';
import {ilCompletions,diagnoseIl} from '../media/il-editor.js';
const variables=[{name:'Count',dataType:'DINT'},{name:'Delay',dataType:'TON'}];
test('IL completes operators, operands and jump labels in their own contexts',()=>{
 assert.equal(ilCompletions('LD Cou',6,variables)[0].insert,'Count');
 assert.ok(ilCompletions('start: JM',9,variables).some(v=>v.label==='JMPC'));
 const forward='JMP sta\nstart: LD Count';assert.equal(ilCompletions(forward,7,variables)[0].insert,'start');
 const code='start: LD Count\nJMP sta';assert.equal(ilCompletions(code,code.length,variables)[0].insert,'start');
 for(const code of ['(* LD','// LD',"LD 'Cou",'LD %MX','LD INT#Co'])assert.deepEqual(ilCompletions(code,code.length,variables,true),[]);
 assert.deepEqual(ilCompletions('LD Cou',6,variables)[0],{label:'Count',detail:'DINT',insert:'Count',start:3,end:6});
});
test('IL checks labels and deferred expressions without applying ST semicolon rules',()=>{
 assert.deepEqual(diagnoseIl('start: LD TRUE\nAND( FALSE\nOR TRUE\n)\nST %MX0\nJMPC start\nRET'),[]);
 assert.deepEqual(diagnoseIl("LD 'hello'\nST Text\n(* nested (* comment *) *)\nRET"),[]);
 const issues=diagnoseIl('again: LD\nagain: ST Count\nJMP Missing\nAND( TRUE');
 assert.ok(issues.some(v=>v.code==='operand'));assert.ok(issues.some(v=>v.message.includes('Duplicate label')));assert.ok(issues.some(v=>v.message.includes('Unknown jump label')));assert.ok(issues.some(v=>v.message.includes('Unclosed deferred')));
 const jump=issues.find(v=>v.code==='label'&&v.line===3);assert.equal('again: LD\nagain: ST Count\nJMP Missing\nAND( TRUE'.slice(jump.start,jump.end),'Missing');
 assert.ok(diagnoseIl('LD TRUE\n)').some(v=>v.message.includes('Unexpected closing')));
 assert.ok(diagnoseIl('CUSTOM Count')[0].severity==='warning');
});

test('IEC IL detects verified XGK mnemonics without conflating ANDN semantics',()=>{
 const source='LOAD M00000\nAND NOT M00001\nOUT M00002\nLOADP M00003\nOUTP M00004\nLOADN M00005\nRST M00006\nLOAD M00007\nSET M00008';
 const issues=diagnoseIl(source);assert.equal(issues.length,9);assert.ok(issues.every(v=>v.code==='dialect'&&v.severity==='error'));
 assert.deepEqual(diagnoseIl('LD TRUE\nANDN Flag\nORN Flag\nST Result\nS Result\nR Result'),[]);
 assert.deepEqual(diagnoseIl("(* LOAD M00000 *)\nLD 'OUT M00002'\nST Text\n// RST M00006"),[]);
 assert.ok(!ilCompletions('',0,[],true).some(v=>['LOAD','OUT','RST'].includes(v.label)));
});
