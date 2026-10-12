import assert from 'node:assert/strict';
import test from 'node:test';
import {findRanges} from '../media/find.js';

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
