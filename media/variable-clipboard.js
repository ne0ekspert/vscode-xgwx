import { parse_xgwx, insert_xgwx_variable, delete_xgwx_variable,
  insert_xgwx_iec_local_symbol, delete_xgwx_iec_local_symbol,
  update_xgwx_iec_local_symbol_address } from './libxgwx.js';
import { globalAddress } from './variable-edit.js';

const header = ['Scope', 'Name', 'Address', 'Type', 'Comment'];
const quote = value => /[\t\r\n"]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;
export function copyVariables(variables, programs) {
  if (!variables.length) throw new Error('Select a variable first.');
  if (variables.length > 1000) throw new Error('Copy up to 1000 variable rows at a time.');
  const rows = variables.map(v => [v.localProgramIndex == null ? 'Global' : `Local:${programs[v.localProgramIndex]?.name || ''}`,
    v.name || '', v.address || '', v.dataType || '', v.description || '']);
  return [header, ...rows].map(row => row.map(quote).join('\t')).join('\n');
}

export function parseVariableClipboard(text) {
  if (typeof text !== 'string' || text.length > 1024 * 1024) throw new Error('Variable clipboard must fit 1 MiB of text.');
  const rows = [], row = []; let field = '', quoted = false, closed = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') { quoted = false; closed = true; }
      else field += c;
    } else if (c === '\t' || c === '\n' || c === '\r') {
      row.push(field); field = ''; closed = false;
      if (c !== '\t') { rows.push(row.splice(0)); if (c === '\r' && text[i + 1] === '\n') i++; }
    } else if (c === '"' && !field && !closed) quoted = true;
    else { if (closed || c === '"') throw new Error('Invalid quoted variable clipboard field.'); field += c; }
  }
  if (quoted) throw new Error('Unclosed variable clipboard field.');
  if (field || row.length || closed) { row.push(field); rows.push(row); }
  if (rows.shift()?.join('\t') !== header.join('\t') || !rows.length || rows.length > 1000) {
    throw new Error('Copy variable rows first (Scope, Name, Address, Type, Comment; up to 1000 rows).');
  }
  return rows.map(row => {
    if (row.length !== 5 || !(row[0] === 'Global' || row[0].startsWith('Local:')) || !row[1] || !row[3]) throw new Error('Invalid variable clipboard row.');
    return {scope: row[0], name: row[1], address: row[2], dataType: row[3], description: row[4]};
  });
}

export function deleteVariables(bytes, variables) {
  // Native indices shift on removal. Work from the end of each independent table.
  const ordered = [...variables].sort((a, b) => (b.localProgramIndex ?? -1) - (a.localProgramIndex ?? -1)
    || (b.localVariableIndex ?? b.globalVariableIndex) - (a.localVariableIndex ?? a.globalVariableIndex));
  if (!ordered.length) throw new Error('Select a variable first.');
  let candidate = bytes;
  for (const v of ordered) {
    candidate = v.localProgramIndex == null
      ? delete_xgwx_variable(candidate, v.globalVariableIndex, v.name)
      : delete_xgwx_iec_local_symbol(candidate, v.localProgramIndex, v.localVariableIndex, v.name);
  }
  return candidate;
}

function freshName(name, siblings) {
  const used = new Set(siblings.map(v => v.name?.toLowerCase()));
  if (!used.has(name.toLowerCase())) return name;
  for (let i = 1; i <= 10000; i++) {
    const suffix = i === 1 ? '_copy' : `_copy${i}`;
    const base = [...name];
    while ((base.join('') + suffix).length > 255) base.pop();
    const next = base.join('') + suffix;
    if (!used.has(next.toLowerCase())) return next;
  }
  throw new Error('Cannot find an unused variable name.');
}

export function pasteVariables(bytes, text, destinationProgram) {
  const rows = parseVariableClipboard(text);
  let candidate = bytes;
  const inserted = [];
  for (const row of rows) {
    const summary = parse_xgwx(candidate);
    if (row.scope === 'Global') {
      if (!['BIT','BYTE','WORD','DWORD','LWORD'].includes(row.dataType)) throw new Error('Unsupported scalar global type.');
      const name = freshName(row.name, summary.variables || []);
      candidate = insert_xgwx_variable(candidate, {name, dataType: row.dataType,
        ...globalAddress(row, row.address), description: row.description});
      inserted.push({name, localProgramIndex: null});
    } else {
      let program = destinationProgram;
      if (program == null) {
        const matches = (summary.programs || []).map((p, i) => p.name === row.scope.slice(6) ? i : -1).filter(i => i >= 0);
        if (matches.length !== 1) throw new Error('Select a local variable in the destination program before pasting local rows.');
        program = matches[0];
      }
      const siblings = summary.localVariables?.[program];
      if (!siblings) throw new Error('Destination local table is unavailable.');
      const name = freshName(row.name, siblings);
      candidate = insert_xgwx_iec_local_symbol(candidate, program, name, row.dataType, row.description);
      if (row.address) {
        const index = parse_xgwx(candidate).localVariables[program].findIndex(v => v.name === name);
        candidate = update_xgwx_iec_local_symbol_address(candidate, program, index, name, '', row.address);
      }
      inserted.push({name, localProgramIndex: program});
    }
  }
  // Intermediate candidates never leave this function; the caller commits once.
  return {bytes: candidate, inserted};
}
