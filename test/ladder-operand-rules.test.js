const test = require('node:test');
const assert = require('node:assert/strict');
const { typeMatches, operandError, suggestionMatches } = require('../media/ladder-operand-rules.cjs');

test('XGK storage aliases preserve width and keep floating-point symbols distinct', () => {
  for (const [required, accepted, rejected] of [
    ['BIT','BOOL','WORD'], ['INT','WORD','DWORD'], ['DINT','DWORD','LWORD'],
    ['LINT','LWORD','REAL'], ['REAL','REAL','DWORD'], ['LREAL','LREAL','LWORD'],
  ]) {
    const rule = { dataTypes: [required] };
    assert.ok(typeMatches(rule, accepted));
    assert.equal(typeMatches(rule, rejected), false);
  }
  assert.ok(typeMatches(undefined, 'BIT')); // No invented rule for undocumented instructions.
});

test('manual device permissions apply independently of device storage width', () => {
  const rule = { label: 'D', dataTypes: ['DWORD'], allowsConstant: false,
    deviceAreas: ['PMK', 'D', 'R', 'U'] };
  for (const device of ['D100', 'R100', 'M100', 'U00.01']) assert.equal(operandError(rule, device), undefined);
  for (const bad of ['0', 'hFF', 'b101', '1e3', 'F100', 'D100.1', 'R100.1', 'M0000A']) assert.ok(operandError(rule, bad));
  assert.ok(suggestionMatches(rule, { value: 'D100', dataType: 'DWORD' }));
  assert.equal(suggestionMatches(rule, { value: 'F100', dataType: 'DWORD' }), false);
  assert.equal(suggestionMatches(rule, { value: 'D100', dataType: 'BIT' }), false);
  assert.equal(operandError({ label: 'S', dataTypes: ['WORD'], allowsConstant: true }, '1.5')?.includes('real constant'), true);
});


test('nibble and byte instructions accept bit-position device addresses', () => {
  for (const type of ['NIBBLE', 'BYTE']) {
    const rule = { label: 'D', dataTypes: [type], allowsConstant: false,
      deviceAreas: ['PMK', 'D.x', 'R.x'] };
    for (const operand of ['M0000A', 'D100.4', 'R100.8']) {
      assert.equal(operandError(rule, operand), undefined);
    }
  }
});
