// Change complete literal tokens only. Device addresses, names, and strings
// keep their spelling; leading zeroes and digit case are preserved.
export function formatHexOperands(text, prefix = 'h', symbols = []) {
  const names = new Set(symbols.map(name => name.toLowerCase()));
  return String(text).replace(/'[^']*'|"[^"]*"|[\p{L}\p{N}_%.#]+/gu, token => {
    if (names.has(token.toLowerCase())) return token;
    const literal = /^(?:h|0x)([0-9a-f]+)$/i.exec(token);
    return literal ? (prefix === '0x' ? '0x' : 'h') + literal[1] : token;
  });
}

export function nativeHexOperands(text, iec = false, symbols = []) {
  // IEC source uses its own literal grammar. Only XGK h literals are aliased.
  return iec ? text : formatHexOperands(text, 'h', symbols);
}
