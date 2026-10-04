const test = require('node:test');
const assert = require('node:assert/strict');
const { typeMatches, operandError, suggestionMatches } = require('../media/ladder-operand-rules.cjs');

test('IEC symbols and instance names are not classified as XGK device addresses', () => {
  const instance = { label: 'Instance', dataTypes: ['FF'], allowsConstant: false };
  assert.equal(operandError(instance, 'FF', true), undefined);
  assert.equal(suggestionMatches(instance, { value: 'FF', dataType: 'FF' }, true), true);
  assert.ok(operandError(instance, 'FF'));
  const word = { label: 'Destination', dataTypes: ['WORD'], allowsConstant: false };
  for (const name of ['HFF', 'B101', 'MFA']) {
    assert.equal(operandError(word, name, true), undefined);
    assert.ok(operandError(word, name));
  }
  assert.ok(operandError(word, '1', true));
  assert.equal(suggestionMatches(instance, { value: 'FF', dataType: 'TON' }, true), false);
});

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


test('D register bit indices accept 0 through F and reject whole-word use', () => {
  const bit = { label: 'Contact', dataTypes: ['BIT'], allowsConstant: false };
  for (const index of '0123456789ABCDEF') assert.equal(operandError(bit, `D0000.${index}`), undefined);
  assert.equal(operandError(bit, 'd0000.f'), undefined);
  for (const value of ['D0000.10', 'D0000.G', 'D.0', 'DA.0', 'D0000..0']) assert.ok(operandError(bit, value), value);
  assert.ok(operandError({ label: 'S', dataTypes: ['WORD'] }, 'D0000.F'));
  assert.equal(operandError({ label: 'S', dataTypes: ['WORD'], deviceAreas: ['D.x'] }, 'D0000.F'), undefined);
});


test('read-only BOOL flags remain source suggestions but are excluded from destinations', () => {
  const flag = { value: '_ON', dataType: 'BOOL', writable: false };
  const source = { dataTypes: ['BOOL'], allowsConstant: false };
  const destination = { ...source, requiresWritable: true };
  assert.equal(suggestionMatches(source, flag), true);
  assert.equal(suggestionMatches(destination, flag), false);
  assert.equal(suggestionMatches(destination, { value: '%MX0', dataType: 'BOOL', writable: true }), true);
});

test('constant-only XGK operands exclude raw devices and named variable suggestions', () => {
  const rule = { label: 'S', dataTypes: ['WORD'], allowsConstant: true, deviceAreas: [] };
  for (const value of ['0', '31', 'H1F', 'B11111']) assert.equal(operandError(rule, value), undefined);
  for (const value of ['D100', 'LoopNumber', '루프번호']) {
    assert.match(operandError(rule, value), /constant/);
    assert.equal(suggestionMatches(rule, { value, dataType: 'WORD' }), false);
  }
  assert.equal(operandError(rule, 'LoopNumber', true), undefined);
});

test('XGK string constants preserve punctuation and enforce destination permissions', () => {
  const source = {label:'S',dataTypes:['STRING'],allowsConstant:true};
  for (const text of ["'Room A, on (night)'", "''", "'"+'a'.repeat(31)+"'"]) assert.equal(operandError(source,text),undefined);
  for (const text of ["'unclosed", "'"+'a'.repeat(32)+"'", "'room\n'", "'한글'"]) assert.ok(operandError(source,text));
  assert.ok(operandError({...source,allowsConstant:false},"'Room A'"));
  assert.ok(operandError({...source,allowsConstant:undefined},"'Room A'"));
  assert.ok(operandError(source,"1"));
  assert.ok(operandError({...source,dataTypes:['WORD']},"'Room A'"));
});
