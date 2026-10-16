import assert from 'node:assert/strict';
import test from 'node:test';
import { formatOperandValue as format, integerOperandWidth } from '../media/operand-values.js';

test('signed, unsigned and hex views interpret integer storage without precision loss', () => {
  for (const bits of [8,16,32,64]) {
    const maximum = (1n << BigInt(bits)) - 1n;
    const hex = 'h' + 'F'.repeat(bits / 4);
    assert.equal(format(hex, {bits,mode:'signed'}), '-1');
    assert.equal(format('-1', {bits,mode:'unsigned'}), maximum.toString());
    assert.equal(format('-1', {bits,mode:'hex'}), hex);
    assert.equal(format(maximum.toString(), {bits,mode:'signed'}), '-1');
    const minimum = -(1n << BigInt(bits - 1));
    assert.equal(format(minimum.toString(), {bits,mode:'signed'}), minimum.toString());
    assert.equal(format((maximum + 1n).toString(), {bits,mode:'hex'}), (maximum + 1n).toString());
    assert.equal(format((minimum - 1n).toString(), {bits,mode:'unsigned'}), (minimum - 1n).toString());
  }
  assert.equal(format('255', {bits:16,mode:'hex',prefix:'0x'}), '0x00FF');
  assert.equal(format('INT#16#FFFF', {mode:'signed'}), '-1');
  assert.equal(format('UINT#65535', {mode:'signed'}), '-1');
});

test('uncertain widths, real values, symbols and malformed values are preserved', () => {
  for (const mode of ['signed','unsigned','hex']) {
    for (const value of ['D0000','%MW0',"'hFFFF'",'1.5','1E3','REAL#1','16#XYZ','2#02','8#89','hXYZ']) {
      assert.equal(format(value,{mode,bits:16}),value);
    }
    assert.equal(format('hFACE',{mode,bits:16,symbols:['HFACE']}),'hFACE');
  }
  assert.equal(format('hFFFF',{mode:'signed'}),'hFFFF');
  assert.equal(format('-1',{mode:'unsigned'}),'-1');
  assert.equal(format('hFFFF',{mode:'unsigned'}),'65535');
  assert.equal(format('255',{mode:'hex'}),'hFF');
  assert.equal(format('h00ff',{mode:'source',prefix:'0x'}),'0x00ff');
  assert.equal(integerOperandWidth(['WORD','INT']),16);
  assert.equal(integerOperandWidth(['WORD','DWORD']),null);
  assert.equal(integerOperandWidth(['REAL']),null);
});

test('float view reinterprets exact IEEE-754 patterns at the known storage width', () => {
  for (const [bits, input, expected] of [
    [32,'h3F800000','1'], [32,'1065353216','1'], [32,'hBF800000','-1'],
    [32,'h00000000','0'], [32,'h80000000','-0'], [32,'-2147483648','-0'],
    [32,'h7F800000','Infinity'], [32,'hFF800000','-Infinity'], [32,'h7FC00000','NaN'],
    [32,'h00000001',String(2 ** -149)], [32,'h7F7FFFFF',String((2 - 2 ** -23) * 2 ** 127)],
    [64,'h3FF0000000000000','1'], [64,'hBFF0000000000000','-1'],
    [64,'h8000000000000000','-0'], [64,'h7FF0000000000000','Infinity'],
    [64,'hFFF0000000000000','-Infinity'], [64,'h7FF8000000000000','NaN'],
    [64,'h0000000000000001',String(Number.MIN_VALUE)],
    [64,'h7FEFFFFFFFFFFFFF',String(Number.MAX_VALUE)],
  ]) assert.equal(format(input,{mode:'float',bits}),expected,`${bits}: ${input}`);
  for (const bits of [null,8,16]) assert.equal(format('hFFFF',{mode:'float',bits}),'hFFFF');
  assert.equal(format('h100000000',{mode:'float',bits:32}),'h100000000');
  assert.equal(format('REAL#1.5',{mode:'float',bits:32}),'REAL#1.5');
  assert.equal(format('1',{mode:'float',bits:32,floating:true}),'1');
  assert.equal(format('1.5',{mode:'float',bits:32,floating:true}),'1.5');
  assert.equal(format('1E3',{mode:'float',bits:64,floating:true}),'1E3');
  assert.equal(format('h3F800000',{mode:'float',bits:32,floating:true}),'1');
  assert.equal(format('hFACE',{mode:'float',bits:32,symbols:['HFACE']}),'hFACE');
});
