import assert from 'node:assert/strict';
import test from 'node:test';
import {findRanges, createProgramFindRanges} from '../media/find.js';

test('literal PLC addresses, repeated occurrences, and case-sensitive source search', () => {
  assert.deepEqual(findRanges('X := %MX0.0; x := %MX0.0;', '%MX0.0'), [{start:5,end:11},{start:18,end:24}]);
  assert.equal(findRanges('Count count COUNT', 'count').length, 3);
  assert.deepEqual(findRanges('Count count COUNT', 'count', true), [{start:6,end:11}]);
  assert.deepEqual(findRanges('a [x] .* b', '[x] .*'), [{start:2,end:8}]);
  assert.deepEqual(findRanges('abc', ''), []);
  assert.deepEqual(findRanges('abc', 'missing'), []);
});

test('Unicode case search preserves textarea UTF-16 selection offsets', () => {
  assert.deepEqual(findRanges('İ Count 😀 COUNT', 'count'), [{start:2,end:7},{start:11,end:16}]);
});


test('program search resolves names and addresses with local scope and source offsets', () => {
  const summary = {
    variables: [{name:'Start', address:'P00000'}, {name:'Shared', address:'%MX9'}],
    localVariables: [[{name:'Shared', address:'%MX0.0'}, {name:'Counter', address:'%MW10'}],
      [{name:'OtherProgram', address:'%MX7'}]],
    iecSystemVariables: [{name:'AlwaysOn', address:'%FX0'}],
  };
  const search = createProgramFindRanges(summary, 0);
  assert.deepEqual(search('Start', 'P00000'), [{start:0,end:5}]);
  assert.deepEqual(search('P00000', 'start'), [{start:0,end:6}]);
  assert.deepEqual(search('Shared AND Shared', '%MX0.0'), [{start:0,end:6},{start:11,end:17}]);
  assert.deepEqual(search('Counter := Counter + 1;', '%MW10'), [{start:0,end:7},{start:11,end:18}]);
  assert.deepEqual(search('%MX0.0', 'Shared'), [{start:0,end:6}]);
  assert.deepEqual(search('AlwaysOn', '%FX0'), [{start:0,end:8}]);
  assert.deepEqual(search('Shared', '%MX9'), []);
  assert.deepEqual(search('OtherProgram', '%MX7'), []);
  assert.deepEqual(search('StartExtra', 'P00000'), []);
  assert.deepEqual(search('P00000', 'start', true), []);
  assert.deepEqual(search('P00000', 'Start', true), [{start:0,end:6}]);
  assert.deepEqual(search('Shared', '%MX0'), [{start:0,end:6}]);
  assert.deepEqual(search('Shared', ''), []);
});

test('direct and alias hits on one reference are not counted twice', () => {
  const search = createProgramFindRanges({variables:[{name:'MOTOR',address:'M00000'},
    {name:'InputA',address:'P00000'},{name:'InputB',address:'P00000'}]},0);
  assert.deepEqual(search('MOTOR', 'M'), [{start:0,end:1}]);
  assert.deepEqual(search('P00000', 'InputB'), [{start:0,end:6}]);
  assert.deepEqual(search('MOTOR M00000', 'missing'), []);
});


test('unmapped text and SFC declarations shadow global address aliases', () => {
  const summary = {variables:[{name:'Count',address:'%MW10'}],
    textPrograms:[{programIndex:0,variables:[{name:'Count'}]}],
    sfc:[{programIndex:1,variables:[{name:'Count'}]}]};
  assert.deepEqual(createProgramFindRanges(summary,0)('Count','%MW10'), []);
  assert.deepEqual(createProgramFindRanges(summary,1)('Count','%MW10'), []);
  assert.deepEqual(createProgramFindRanges(summary,2)('Count','%MW10'), [{start:0,end:5}]);
});


test('comments remain literal text while only operand references resolve aliases', async () => {
  const {ilCode} = await import('../media/il-editor.js');
  const search = createProgramFindRanges({variables:[{name:'Start',address:'%MX0'}]},0);
  assert.deepEqual(search('Start', '%MX0', false, {references:''}), []);
  assert.deepEqual(search('Start', 'Start', false, {references:''}), [{start:0,end:5}]);
  assert.deepEqual(search('%MX0', 'Start', false, {references:''}), []);
  assert.deepEqual(search('%MX0', '%MX0', false, {references:''}), [{start:0,end:4}]);
  const source = "(* Start (* Start *) *)\nStart := TRUE; // Start\n'Start'";
  const ranges = search(source, '%MX0', false, {references:ilCode(source).code});
  assert.deepEqual(ranges, [{start:24,end:29}]);
  assert.equal(search(source, 'Start', false, {references:ilCode(source).code}).length, 5);
});


test('IEC addresses ignore decimal leading zeros in references and variable mappings', () => {
  const search = createProgramFindRanges({localVariables:[[{name:'Start',address:'%MX007'},
    {name:'Stop',address:'%MX70'}]]},0);
  assert.deepEqual(search('%MX007', '%MX7'), [{start:0,end:6}]);
  assert.deepEqual(search('%MX7', '%MX007'), [{start:0,end:4}]);
  assert.deepEqual(search('Start', '%MX7'), [{start:0,end:5}]);
  assert.deepEqual(search('%MX7', 'Start'), [{start:0,end:4}]);
  assert.deepEqual(search('%MX007', 'Start'), [{start:0,end:6}]);
  assert.deepEqual(search('%MX070 Stop %MW7', '%MX7'), []);
  assert.deepEqual(search('%MX000 %MX0', '%MX00'), [{start:0,end:6},{start:7,end:11}]);
  assert.deepEqual(search('%MX007.02', '%MX7.2'), [{start:0,end:9}]);
  assert.deepEqual(search('%mx007', '%MX7', true), []);
  assert.deepEqual(search('%mx007', '%mx7', true), [{start:0,end:6}]);
  assert.deepEqual(search('%MX007', '%MX7', false, {references:''}), []);
  assert.deepEqual(search('%MX007', '%MX007', false, {references:''}), [{start:0,end:6}]);
});
