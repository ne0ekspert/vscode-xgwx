import { formatHexOperands } from './hex-operands.js';

const WIDTHS = { BYTE:8, SINT:8, USINT:8, WORD:16, INT:16, UINT:16,
  DWORD:32, DINT:32, UDINT:32, LWORD:64, LINT:64, ULINT:64 };

export function integerOperandWidth(types = []) {
  const widths = types.map(type => WIDTHS[type?.toUpperCase()]);
  return widths.length && widths.every(width => width && width === widths[0]) ? widths[0] : null;
}

export function formatOperandValue(text, { mode = 'source', prefix = 'h', bits = null, symbols = [], floating = false } = {}) {
  if (mode === 'source') return formatHexOperands(text, prefix, symbols);
  const original = String(text);
  if (symbols.some(name => name.toLowerCase() === original.toLowerCase())) return original;
  // Decimal constants on REAL/LREAL pins already represent floating values.
  if (mode === 'float' && floating && /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:E[+-]?\d+)?$/i.test(original)) return original;
  let literal = original;
  const typed = /^([A-Z]+)#(.+)$/i.exec(literal);
  if (typed) {
    bits = integerOperandWidth([typed[1]]);
    if (!bits) return original;
    literal = typed[2];
  }
  let value;
  if (/^[+-]?\d+$/.test(literal)) value = BigInt(literal);
  else if (/^b[01]+$/i.test(literal)) value = BigInt('0b' + literal.slice(1));
  else if (/^(?:h|0x)[0-9a-f]+$/i.test(literal)) value = BigInt('0x' + literal.replace(/^(?:h|0x)/i, ''));
  else {
    const based = /^(2|8|16)#([0-9a-f]+)$/i.exec(literal);
    if (!based) return original;
    const digits = based[2];
    if ((based[1] === '2' && !/^[01]+$/.test(digits)) || (based[1] === '8' && !/^[0-7]+$/.test(digits))) return original;
    value = BigInt(({2:'0b',8:'0o',16:'0x'})[based[1]] + digits);
  }
  if (bits != null && ![8,16,32,64].includes(bits)) return original;
  if (bits) {
    // Reject values outside the storage range rather than silently truncating.
    if (value < -(1n << BigInt(bits - 1)) || value >= (1n << BigInt(bits))) return original;
  } else if ((value < 0n && mode !== 'signed') || (mode === 'signed' && !/^[+-]?\d+$/.test(literal))) {
    return original;
  }
  if (mode === 'signed') return (bits ? BigInt.asIntN(bits, value) : value).toString();
  if (mode === 'unsigned') return (bits ? BigInt.asUintN(bits, value) : value).toString();
  if (mode === 'float') {
    if (bits !== 32 && bits !== 64) return original;
    const view = new DataView(new ArrayBuffer(bits / 8));
    if (bits === 32) view.setUint32(0, Number(BigInt.asUintN(32, value)));
    else view.setBigUint64(0, BigInt.asUintN(64, value));
    const number = bits === 32 ? view.getFloat32(0) : view.getFloat64(0);
    return Object.is(number, -0) ? '-0' : String(number);
  }
  if (mode === 'hex') {
    const digits = (bits ? BigInt.asUintN(bits, value) : value).toString(16).toUpperCase();
    return (prefix === '0x' ? '0x' : 'h') + digits.padStart(bits ? bits / 4 : 1, '0');
  }
  return original;
}
