import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import init, { create_xgwx_project, parse_xgwx, insert_xgwx_variable, delete_xgwx_variable } from '../media/libxgwx.js';
await init({module_or_path: fs.readFileSync(new URL('../media/libxgwx_bg.wasm', import.meta.url))});
const variable = {name:'Ready',dataType:'BIT',addressArea:'M',addressNumber:42,description:'Global ready 😀'};
test('global creation and deletion roundtrip without changing program payloads', () => {
 const source=create_xgwx_project('XGK-CPUSN','LD');
 const before=parse_xgwx(source), created=insert_xgwx_variable(source,variable), after=parse_xgwx(created);
 const index=after.variables.findIndex(v=>v.name==='Ready');
 assert.ok(index>=0);assert.equal(after.variables[index].addressNumber,42);assert.equal(after.variables[index].description,variable.description);
 assert.deepEqual(after.ladder,before.ladder);
 assert.throws(()=>delete_xgwx_variable(created,index,'Stale'),/stale/);
 assert.throws(()=>insert_xgwx_variable(created,{...variable,name:'ready'}),/unique/);
 assert.throws(()=>insert_xgwx_variable(created,{...variable,name:'Bad',description:'x'.repeat(256)}),/255/);
 const deleted=parse_xgwx(delete_xgwx_variable(created,index,'Ready'));
 assert.deepEqual(deleted.variables,before.variables);assert.deepEqual(deleted.ladder,before.ladder);
});
