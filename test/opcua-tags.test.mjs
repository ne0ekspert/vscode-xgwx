import assert from 'node:assert/strict';
import test from 'node:test';
import {formatOpcUaTagAddress, parseOpcUaTagAddress} from '../media/opcua-tags.js';
test('native bit-area device notation applies to BIT and BYTE nodes', () => {
  for (const dataType of ['BIT', 'BYTE', 'WORD', 'DWORD', 'LWORD']) {
    const tag = {dataType, addressArea: 'M', addressNumber: 16};
    assert.equal(formatOpcUaTagAddress(tag), 'M00010');
    assert.deepEqual(parseOpcUaTagAddress('M00010', dataType), {addressArea: 'M', addressNumber: 16});
  }
  assert.deepEqual(parseOpcUaTagAddress('M0010A'), {addressArea: 'M', addressNumber: 170});
  assert.deepEqual(parseOpcUaTagAddress('D000123'), {addressArea: 'D', addressNumber: 123});
  assert.throws(() => parseOpcUaTagAddress('D00012A'));
  assert.throws(() => parseOpcUaTagAddress('M00A10'));
  assert.throws(() => parseOpcUaTagAddress('U00.01'));
});
test('integer choices distinguish signedness without replacing bit-string types', async () => {
  const {opcUaTagTypes, opcUaTagTypeLabel} = await import('../media/opcua-tags.js');
  for (const [signed, unsigned, width] of [['SINT','USINT',8],['INT','UINT',16],['DINT','UDINT',32],['LINT','ULINT',64]]) {
    assert.equal(opcUaTagTypeLabel(signed), `${signed} — signed ${width}-bit`);
    assert.equal(opcUaTagTypeLabel(unsigned), `${unsigned} — unsigned ${width}-bit`);
    assert(opcUaTagTypes.some(([value]) => value === signed));
    assert(opcUaTagTypes.some(([value]) => value === unsigned));
  }
  assert.equal(opcUaTagTypeLabel('WORD'), 'WORD — 16-bit bit string');
  assert.equal(opcUaTagTypeLabel('DWORD'), 'DWORD — 32-bit bit string');
  assert.equal(opcUaTagTypeLabel('LWORD'), 'LWORD — 64-bit bit string');
  assert.equal(opcUaTagTypeLabel('FutureType'), 'FutureType');
});
