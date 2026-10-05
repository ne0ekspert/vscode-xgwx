import { update_xgwx_variable, update_xgwx_iec_local_symbol_address,
  update_xgwx_iec_local_symbol_description, rename_xgwx_iec_local_symbol } from './libxgwx.js';

export function globalAddress(variable, value) {
  const text = value.trim().toUpperCase();
  let addressArea, addressNumber;
  if (variable.addressArea === 'U') {
    const match = /^U(\d+)\.(\d+)(?:\.([0-9A-F]))?$/.exec(text);
    const slot = variable.sourceRef?.split(':')[2];
    if (!match || Number(match[1]) !== Number(slot)
      || (variable.dataType === 'BIT') !== Boolean(match[3])) throw new Error('Use an address in the same special-module slot.');
    addressArea = 'U';
    addressNumber = variable.dataType === 'BIT' ? 0x400 + Number(match[2]) * 16 + parseInt(match[3], 16) : 0x40 + Number(match[2]);
  } else {
    const match = /^([A-Z]+)(\d+[0-9A-F]?)$/.exec(text);
    if (!match || !['P','M','L','K','F','T','C','D','R','Z','N','X','Y'].includes(match[1])) throw new Error('Enter a device address, for example M0000A or D000100.');
    addressArea = match[1];
    const body = match[2];
    if (variable.dataType === 'BIT' && ['P','M','L','K'].includes(addressArea)) {
      addressNumber = Number(body.slice(0, -1) || '0') * 16 + parseInt(body.at(-1), 16);
    } else {
      if (!/^\d+$/.test(body)) throw new Error('This address requires a decimal register number.');
      addressNumber = Number(body);
    }
  }
  if (!Number.isInteger(addressNumber) || addressNumber < 0 || addressNumber > 0xffffffff) throw new Error('Address is outside the supported range.');
  return { addressArea, addressNumber };
}

function localRange(address) {
  const match = /^%([MIQ])([XBWDL])(\d+)(?:\.(\d+)\.(\d+))?$/.exec(address.trim().toUpperCase());
  if (!match) throw new Error('Enter a mapped IEC address, for example %MX100 or %MW100.');
  const width = ({ X: 1, B: 8, W: 16, D: 32, L: 64 })[match[2]];
  let start = Number(match[3]) * width;
  if (match[4] != null) {
    if (match[2] !== 'X' || match[1] === 'M' || Number(match[3]) !== 0 || Number(match[5]) >= 64) throw new Error('Use base 0 and a bit from 0 to 63.');
    start = Number(match[4]) * 64 + Number(match[5]);
  } else if (match[1] === 'I' || match[1] === 'Q' && match[2] !== 'X') {
    throw new Error('Use the captured IEC bit-address format for I/O mappings.');
  }
  if (!Number.isInteger(start) || start > 0xffffffff) throw new Error('Address is outside the supported range.');
  return { area: match[1], start, width };
}

export function variableAddressConflict(variable, value, summary) {
  if (variable.localProgramIndex == null) {
    const address = globalAddress(variable, value);
    const matches = (summary.variables || []).map((v, globalVariableIndex) => ({ ...v, globalVariableIndex }))
      .filter(v => v.globalVariableIndex !== variable.globalVariableIndex && v.addressArea === address.addressArea && v.addressNumber === address.addressNumber
        && (address.addressArea !== 'U' || v.sourceRef?.split(':')[2] === variable.sourceRef?.split(':')[2]));
    if (matches.length > 1) throw new Error('Address has multiple owners and cannot be swapped.');
    return matches[0];
  }
  if (!value.trim()) return;
  const range = localRange(value);
  return (summary.localVariables?.[variable.localProgramIndex] || [])
    .map((v, localVariableIndex) => ({ ...v, localProgramIndex: variable.localProgramIndex, localVariableIndex }))
    .find(v => v.localVariableIndex !== variable.localVariableIndex && v.address
      && v.storageClass === range.area && range.start < v.allocationNumber + v.allocationWidth
      && v.allocationNumber < range.start + range.width);
}

export function buildVariableEdit(bytes, variable, field, value, summary, swap = false) {
  if (typeof value !== 'string' || /\p{Cc}/u.test(value)) throw new Error('Use text without control characters.');
  if (field !== 'address') {
    if (value === (variable[field] || '')) return bytes;
    if (field === 'name') {
      const siblings = variable.localProgramIndex == null ? summary.variables : summary.localVariables?.[variable.localProgramIndex];
      const ownIndex = variable.localVariableIndex ?? variable.globalVariableIndex;
      if (!value || siblings?.some((v, i) => i !== ownIndex && v.name?.toLocaleLowerCase() === value.toLocaleLowerCase())) throw new Error('Variable name must be nonempty and unique.');
    }
    if (variable.localProgramIndex == null) return update_xgwx_variable(bytes, variable.globalVariableIndex, { [field]: value });
    return field === 'name'
      ? rename_xgwx_iec_local_symbol(bytes, variable.localProgramIndex, variable.localVariableIndex, variable.name, value)
      : update_xgwx_iec_local_symbol_description(bytes, variable.localProgramIndex, variable.localVariableIndex, variable.name, variable.description || '', value);
  }
  value = value.trim().toUpperCase();
  if (value === (variable.address || '').toUpperCase()) return bytes;
  if (variable.localProgramIndex == null) {
    const address = globalAddress(variable, value);
    if (address.addressArea === variable.addressArea && address.addressNumber === variable.addressNumber) return bytes;
  }
  const conflict = variableAddressConflict(variable, value, summary);
  if (conflict && !swap) throw new Error(`Address is occupied by ${conflict.name}.`);
  if (variable.localProgramIndex == null) {
    const address = globalAddress(variable, value);
    if (conflict) {
      if (variable.dataType !== conflict.dataType || variable.sourceRef?.startsWith('SP:') || conflict.sourceRef?.startsWith('SP:')) throw new Error('These variable address types cannot be swapped.');
      bytes = update_xgwx_variable(bytes, conflict.globalVariableIndex, { addressArea: variable.addressArea, addressNumber: variable.addressNumber });
    }
    return update_xgwx_variable(bytes, variable.globalVariableIndex, address);
  }
  const update = (data, v, expected, replacement) => update_xgwx_iec_local_symbol_address(data, v.localProgramIndex, v.localVariableIndex, v.name, expected, replacement);
  if (!conflict) return update(bytes, variable, variable.address || '', value);
  const old = variable.address && localRange(variable.address), next = localRange(value), occupied = localRange(conflict.address);
  if (!old || old.area !== next.area || old.width !== next.width || next.width !== occupied.width
    || next.start !== occupied.start || variable.isInstance || conflict.isInstance) throw new Error('Swap requires two mapped variables with matching address areas and widths.');
  // Intermediate copies stay private; only the completed swap reaches the host.
  bytes = update(bytes, variable, variable.address, '');
  bytes = update(bytes, conflict, conflict.address, '');
  bytes = update(bytes, conflict, '', variable.address);
  return update(bytes, variable, '', value);
}
