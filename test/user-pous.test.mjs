import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import {userPouCallables} from '../media/user-pous.js';
import {stCompletions} from '../media/st-editor.js';
import {diagnoseSt} from '../media/st-diagnostics.js';
import {explorerNodes} from '../media/explorer-model.js';
import init,{create_xgwx_project,create_xgwx_user_pou,edit_xgwx_user_pou,parse_xgwx,edit_xgwx_text_variable} from '../media/libxgwx.js';
await init({module_or_path:fs.readFileSync(new URL('../media/libxgwx_bg.wasm',import.meta.url))});
const variable=(name,scope,dataType='DINT')=>({name,scope,dataType,description:''});
const request={name:'UserCounter',kind:'functionBlock',objectId:'55555555-5555-4555-8555-555555555555',symbolId:'66666666-6666-4666-8666-666666666666',returnType:null,variables:[variable('Input','input'),variable('Answer','output')],source:'Answer := Input;',comment:''};
test('WASM creates, edits and deletes user-defined POUs independently of scan programs',()=>{
 let bytes=create_xgwx_project('XGI-CPUE','ST');const before=parse_xgwx(bytes).programs;
 bytes=create_xgwx_user_pou(bytes,request);let summary=parse_xgwx(bytes);assert.deepEqual(summary.programs,before);let expected=summary.userPous[0];assert.equal(expected.editable,true);
 bytes=edit_xgwx_user_pou(bytes,{operation:'source',expected,source:'Answer := Input + 1;'});assert.throws(()=>edit_xgwx_user_pou(bytes,{operation:'source',expected,source:'stale'}));
 expected=parse_xgwx(bytes).userPous[0];bytes=edit_xgwx_user_pou(bytes,{operation:'variables',expected,variables:[...expected.variables,variable('Memory','local')]});expected=parse_xgwx(bytes).userPous[0];assert.equal(expected.variables.length,3);
 bytes=edit_xgwx_user_pou(bytes,{operation:'delete',expected});assert.equal(parse_xgwx(bytes).userPous.length,0);
});
test('WASM permits resolved custom FB instances and protects their definitions',()=>{
 let bytes=create_xgwx_user_pou(create_xgwx_project('XGI-CPUE','ST'),request);const summary=parse_xgwx(bytes),p=summary.textPrograms[0];
 bytes=edit_xgwx_text_variable(bytes,p.objectId,{programIndex:0,expectedVariables:p.variables,name:'Counter',dataType:'UserCounter',description:'',remove:false,update:false,declaration:null});
 assert.equal(parse_xgwx(bytes).textPrograms[0].variables.find(v=>v.name==='Counter').dataType,'UserCounter');
 assert.throws(()=>edit_xgwx_user_pou(bytes,{operation:'delete',expected:summary.userPous[0]}));
});
test('custom functions and FB pins appear in completions and validate their own directions',()=>{
 const callables=userPouCallables([{...request,editable:true},{name:'UserDouble',kind:'function',editable:true,variables:[variable('Value','input')]}]);const vars=[{name:'Counter',dataType:'UserCounter'},{name:'Result',dataType:'DINT'}];
 assert.equal(stCompletions('UserD',5,vars,false,callables)[0].insert,'UserDouble()');
 assert.deepEqual(stCompletions('Counter.',8,vars,false,callables).map(p=>p.label),['EN','Input','ENO','Answer']);
 assert.equal(stCompletions('Counter(A',9,vars,false,callables)[0].insert,'Answer => ');
 assert.equal(stCompletions('UserDouble(V',12,vars,false,callables)[0].insert,'Value := ');
 assert.deepEqual(diagnoseSt('Counter(Input := Result, Answer => Result);',vars,{callables}),[]);
 assert.ok(diagnoseSt('Counter(Answer := Result);',vars,{callables}).some(d=>d.code==='pin-direction'));
 assert.ok(diagnoseSt('Counter.Unknown := Result;',vars,{callables}).some(d=>d.code==='pin'));
 assert.ok(diagnoseSt('UserDouble(Wrong := Result);',vars,{callables}).some(d=>d.code==='pin'));
 assert.deepEqual(stCompletions('Counter.',8,vars),[]); // No cross-document leakage.
});
test('explorer uses a separate definition namespace and stable native identities',()=>{
 const state=explorerNodes({uri:'file:///test.xgwx'}, {userPous:[{...request,index:0}]},{view:'userPous',userPouId:request.objectId});
 assert.equal(state.selectedId,`pou:${request.objectId}`);assert.deepEqual(state.nodes.find(n=>n.id==='userPous').children[0].target,{view:'userPous',objectId:request.objectId});
});
