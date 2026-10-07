import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import init,{parse_xgwx,insert_xgwx_module,preview_xgwx_io_variables,generate_xgwx_io_variables,update_xgwx_variable} from '../media/libxgwx.js';
await init({module_or_path:fs.readFileSync(new URL('../media/libxgwx_bg.wasm',import.meta.url))});
test('generation previews addresses, overwrites duplicates, preserves programs and is idempotent',()=>{
 let source=fs.readFileSync(new URL('../media/templates/new-xgk.xgwx',import.meta.url));
 source=insert_xgwx_module(source,0,0,'XGI-D21A');source=insert_xgwx_module(source,0,2,'XGQ-TR4A/B');
 const plan=preview_xgwx_io_variables(source);assert.equal(plan.length,40);assert.equal(plan[8].address,'P00020');assert.equal(plan[0].action,'create');
 const bytes=generate_xgwx_io_variables(source),summary=parse_xgwx(bytes);assert.equal(summary.variables.length,40);
 assert.deepEqual(summary.ladder,parse_xgwx(source).ladder);assert.deepEqual(generate_xgwx_io_variables(bytes),bytes);
 const changed=update_xgwx_variable(bytes,0,{name:'CustomInput',description:'Custom'});
 const duplicate=preview_xgwx_io_variables(changed)[0];assert.equal(duplicate.action,'overwrite');assert.deepEqual(duplicate.existingNames,['CustomInput']);
 assert.deepEqual(parse_xgwx(generate_xgwx_io_variables(changed)).variables,summary.variables);
});
test('preview formats decimal P words with hexadecimal bit suffixes',()=>{
 let source=fs.readFileSync(new URL('../media/templates/new-xgk.xgwx',import.meta.url));
 source=insert_xgwx_module(source,1,0,'XGI-D22A/B');
 const plan=preview_xgwx_io_variables(source);
 assert.equal(plan[0].address,'P00120');assert.equal(plan[15].address,'P0012F');
 const variables=parse_xgwx(generate_xgwx_io_variables(source)).variables;
 for(const row of plan)assert.equal(row.address,variables.find(v=>v.name===row.name).address);
});
