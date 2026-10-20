import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import init, { create_xgwx_project, parse_xgwx, insert_xgwx_variable, insert_xgwx_iec_local_symbol, update_xgwx_iec_local_symbol_address } from '../media/libxgwx.js';
import { copyVariables, parseVariableClipboard, deleteVariables, pasteVariables } from '../media/variable-clipboard.js';
import { buildVariableEdit } from '../media/variable-edit.js';
await init({module_or_path:fs.readFileSync(new URL('../media/libxgwx_bg.wasm',import.meta.url))});
const global = (name, addressNumber = 10) => ({name,dataType:'BIT',addressArea:'M',addressNumber,description:'Ready "😀"'});
const globals = bytes => parse_xgwx(bytes).variables.map((v,globalVariableIndex)=>({...v,globalVariableIndex}));
const locals = (bytes,p=0) => parse_xgwx(bytes).localVariables[p].map((v,localVariableIndex)=>({...v,localProgramIndex:p,localVariableIndex}));
test('TSV quote roundtrip, malformed rows and resource bounds',()=>{
 const v={name:'A',dataType:'WORD',address:'D000010',description:'Quoted "value"\tand\nlines',globalVariableIndex:0};
 const rows=parseVariableClipboard(copyVariables([v],[]));assert.equal(rows[0].description,v.description);
 assert.equal(parseVariableClipboard(copyVariables([v],[]).replaceAll('\n','\r\n'))[0].name,'A');
 for(const text of ['garbage','Scope\tName\tAddress\tType\tComment\nGlobal\tA','Scope\tName\tAddress\tType\tComment\nGlobal\t"A','x'.repeat(1024*1024+1)]) assert.throws(()=>parseVariableClipboard(text));
 assert.throws(()=>copyVariables(Array(1001).fill(v),[]),/1000/);
});
test('multi-row copy/paste uses unique names and delete works with shifting native indices',()=>{
 let bytes=create_xgwx_project('XGK-CPUSN','LD');
 for(const name of ['Alpha','Beta','Gamma']) bytes=insert_xgwx_variable(bytes,global(name));
 const before=parse_xgwx(bytes), vars=globals(bytes), text=copyVariables([vars[0],vars[2]],before.programs);
 const pasted=pasteVariables(bytes,text), after=parse_xgwx(pasted.bytes);
 assert.deepEqual(pasted.inserted.map(v=>v.name),['Alpha_copy','Gamma_copy']);
 assert.deepEqual(after.ladder,before.ladder);
 const again=pasteVariables(pasted.bytes,text);assert.deepEqual(again.inserted.map(v=>v.name),['Alpha_copy2','Gamma_copy2']);
 const cut=deleteVariables(bytes,[vars[0],vars[2]]);assert.deepEqual(globals(cut).map(v=>v.name),['Beta']);
 const restored=pasteVariables(cut,text);assert.deepEqual(parse_xgwx(restored.bytes).variables,before.variables);
});
test('multi-row paste/deletion failures never alter the input or publish partial candidates',()=>{
 let bytes=create_xgwx_project('XGK-CPUSN','LD');bytes=insert_xgwx_variable(bytes,global('Original'));
 const before=Buffer.from(bytes), vars=globals(bytes);
 const text=copyVariables([vars[0],{...vars[0],name:'Bad',dataType:'Unsupported'}],[]);
 assert.throws(()=>pasteVariables(bytes,text),/unsupported/i);assert.deepEqual(Buffer.from(bytes),before);
 assert.throws(()=>deleteVariables(bytes,[vars[0],{...vars[0],globalVariableIndex:999,name:'Missing'}]));assert.deepEqual(Buffer.from(bytes),before);
});
test('primitive locals retain comments and mappings when cut and pasted back; overlap fails atomically',()=>{
 let bytes=create_xgwx_project('XGI-CPUU','LD');bytes=insert_xgwx_iec_local_symbol(bytes,0,'Ready','BOOL','Mapped local');
 bytes=update_xgwx_iec_local_symbol_address(bytes,0,0,'Ready','','%MX100');
 const before=parse_xgwx(bytes), text=copyVariables(locals(bytes),before.programs);
 assert.throws(()=>pasteVariables(bytes,text,0),/unused|overlap|mapped/i);
 const cut=deleteVariables(bytes,locals(bytes));const result=pasteVariables(cut,text,0), after=parse_xgwx(result.bytes);
 assert.equal(after.localVariables[0][0].name,'Ready');assert.equal(after.localVariables[0][0].address,'%MX100');
 assert.equal(after.localVariables[0][0].description,'Mapped local');assert.deepEqual(after.ladder,before.ladder);
});
test('local type double-click edit uses the native type writer',()=>{
 let bytes=create_xgwx_project('XGI-CPUU','LD');bytes=insert_xgwx_iec_local_symbol(bytes,0,'Count','INT','Counter');
 const summary=parse_xgwx(bytes), v=locals(bytes)[0];
 const edited=buildVariableEdit(bytes,v,'dataType','DINT',summary);assert.equal(parse_xgwx(edited).localVariables[0][0].dataType,'DINT');
 assert.deepEqual(parse_xgwx(edited).ladder,summary.ladder);
});
