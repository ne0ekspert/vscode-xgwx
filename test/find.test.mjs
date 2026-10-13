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

test('address references replace partial literal hits while masked text stays literal', () => {
  const search = createProgramFindRanges({variables:[{name:'Start',address:'%MX0'}]},0);
  const source = "'%MX0.0' %MX0.0 %MX01 %MX000 Start";
  const references = ' '.repeat(9) + source.slice(9);
  assert.deepEqual(search(source, '%MX0', false, {references}), [
    {start:1,end:5}, {start:9,end:15}, {start:22,end:28}, {start:29,end:34},
  ]);
});

test('literal hits keep precedence over aliases and remain ordered at UTF-16 boundaries', () => {
  const search = createProgramFindRanges({variables:[
    {name:'AlphaAlpha',address:'Alpha'}, {name:'Other',address:'Alpha'},
  ]},0);
  assert.deepEqual(search('😀 AlphaAlpha Other Alpha', 'Alpha'), [
    {start:3,end:8}, {start:8,end:13}, {start:14,end:19}, {start:20,end:25},
  ]);
});

test('crossing literals are retained until later reference normalization resolves them', () => {
  const search = createProgramFindRanges({variables:[{name:'Start',address:'%MX0'}]},0);
  assert.deepEqual(search('abc %MX0 xyz', '%MX0', false, {references:'Start%MX0   '}), [{start:5,end:9}]);
});

test('large address searches retain canonical and alias hits without neighboring-address matches', () => {
  const search = createProgramFindRanges({variables:[{name:'Start',address:'%MX0'}]},0);
  const row = '%MX0 %MX01 %MX000.02 Start\n';
  const source = row.repeat(4000);
  const ranges = search(source, '%MX0');
  assert.equal(ranges.length, 12000);
  for (let rowIndex = 0; rowIndex < 4000; rowIndex++) {
    const offset = rowIndex * row.length;
    assert.deepEqual(ranges.slice(rowIndex * 3, rowIndex * 3 + 3), [
      {start:offset,end:offset+4}, {start:offset+11,end:offset+20}, {start:offset+21,end:offset+26},
    ]);
  }
});
