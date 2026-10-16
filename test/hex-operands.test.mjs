import assert from 'node:assert/strict';
import test from 'node:test';
import { formatHexOperands, nativeHexOperands } from '../media/hex-operands.js';

test('prefix preference preserves hex digits, padding, strings and identifiers', () => {
  assert.equal(formatHexOperands('h00FF H00ab 0X000A', '0x'), '0x00FF 0x00ab 0x000A');
  assert.equal(formatHexOperands('0x00FF'), 'h00FF');
  const untouched = "%MW0 D00FF Myh00FF h00FF_Name 'h00FF' 16#00FF BYTE#16#FF";
  assert.equal(formatHexOperands(untouched, '0x'), untouched);
  assert.equal(formatHexOperands('hFACE', '0x', ['HFACE']), 'hFACE');
  assert.equal(nativeHexOperands('0x00FF'), 'h00FF');
  assert.equal(nativeHexOperands('0x00FF', true), '0x00FF');
});

test('VS Code contributes a user setting with the native default', async () => {
  const { readFile } = await import('node:fs/promises');
  const manifest = JSON.parse(await readFile(new URL('../package.json', import.meta.url)));
  const setting = manifest.contributes.configuration.properties['xgwx.hexPrefix'];
  assert.deepEqual(setting.enum, ['h', '0x']);
  assert.equal(setting.default, 'h');
});
