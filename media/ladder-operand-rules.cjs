// Native XGK device operands may reinterpret word storage at several widths.
// Symbol suggestions have declared types; raw addresses have device permissions.
function typeMatches(rule, type) {
  if (!rule?.dataTypes?.length || !type) return true;
  const normalize = value => ({ BOOL: 'BIT', INT: 'WORD', UINT: 'WORD',
    DINT: 'DWORD', UDINT: 'DWORD', LINT: 'LWORD', ULINT: 'LWORD' }[value] || value);
  return rule.dataTypes.some(expected => normalize(expected) === normalize(type.toUpperCase()));
}

function operandError(rule, value, iec = false) {
  if (!rule || !value) return undefined;
  if (!iec && (value.startsWith("'") || value.endsWith("'"))) {
    if (!rule.dataTypes?.includes('STRING') || rule.allowsConstant !== true) return `${rule.label}: string constants are not permitted`;
    if (!/^'[\x20-\x26\x28-\x7e]{0,31}'$/.test(value)) return `${rule.label}: use single quotes and at most 31 printable ASCII characters`;
    return undefined;
  }
  const text = value.toUpperCase();
  const number = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:E[+-]?\d+)?$/.test(text);
  const constant = number || (!iec && (/^H[0-9A-F]+$/.test(text) || /^B[01]+$/.test(text)));
  if (!iec && constant && rule.dataTypes?.length === 1 && rule.dataTypes[0] === 'STRING') return `${rule.label}: string constants require single quotes`;
  if (!iec && !constant && rule.allowsConstant === true && Array.isArray(rule.deviceAreas) && !rule.deviceAreas.length) {
    return `${rule.label}: use a constant`;
  }
  if (constant && rule.allowsConstant === false) return `${rule.label}: use a device, not a constant`;
  if (number && /[.E]/.test(text) && rule.dataTypes?.length && !rule.dataTypes.some(t => ['REAL', 'LREAL'].includes(t))) {
    return `${rule.label}: expected ${rule.dataTypes.join('/')}, not a real constant`;
  }
  // IEC identifiers such as the FF instance are resolved by the typed writer.
  // XGK device spelling does not classify IEC symbolic names.
  if (iec) return undefined;
  const device = /^([PMKFLTCSZUNDR])([0-9A-F.]+)$/.exec(text);
  if (/^D[^ ]*\./.test(text)) {
    if (text.length > 32 || !/^D[0-9]+\.[0-9A-F]$/.test(text)) return `${rule.label}: use D0000.0 through D0000.F`;
    if (!rule.deviceAreas?.includes('D.x') && rule.dataTypes?.length && !rule.dataTypes.some(t => ['BIT', 'BOOL', 'NIBBLE', 'BYTE'].includes(t))) {
      return `${rule.label}: a bit address cannot be used as a word device`;
    }
  }
  if (device && /^[PMKFL]$/.test(device[1]) && /^[0-9A-F]+$/.test(device[2])
      && /[A-F]/.test(device[2]) && !rule.dataTypes.some(t => ['BIT', 'NIBBLE', 'BYTE'].includes(t))) {
    return `${rule.label}: a bit address cannot be used as a word device`;
  }
  if (device && rule.deviceAreas) {
    const area = device[1];
    const key = ['D', 'R'].includes(area) && device[2].includes('.') ? `${area}.x`
      : ['P', 'M', 'K'].includes(area) ? 'PMK' : area;
    if (!rule.deviceAreas.includes(key)) return `${rule.label}: ${key} devices are not permitted`;
  }
  return undefined;
}

function suggestionMatches(rule, suggestion, iec = false) {
  return !(rule?.requiresWritable && suggestion.writable === false)
    && typeMatches(rule, suggestion.dataType) && !operandError(rule, suggestion.value, iec);
}
module.exports = { typeMatches, operandError, suggestionMatches };
