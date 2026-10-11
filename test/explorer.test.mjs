import assert from 'node:assert/strict';
import test from 'node:test';
import Module from 'node:module';
import { explorerNodes } from '../media/explorer-model.js';

const file = {uri:'file:///one.xgwx',fileName:'one.xgwx'};
const summary = {hardware:{bases:[{base:0}],modules:[{base:0,slot:1}]},programs:[{name:'First',objectId:'a'},{name:'Second',objectId:'b'}],programLanguages:['LD'],networks:[{name:'Ethernet',modules:[{base:0,slot:1,id:7,name:'FENET@0x1234'}]}],counts:{variables:42},parameters:[{}]};
class EventEmitter { event = () => ({dispose(){}}); fire(){} dispose(){} }
const load = Module._load;
Module._load = function(name,...args) {return name === 'vscode' ? {EventEmitter,TreeItem:class {constructor(label,state){this.label=label;this.collapsibleState=state;}},ThemeIcon:class {constructor(id){this.id=id;}},TreeItemCollapsibleState:{Expanded:2,None:0},DataTransferItem:class {constructor(value){this.value=value;}}} : load.call(this,name,...args);};
const {XgwxExplorer}=Module.createRequire(import.meta.url)('../explorer.cjs');
Module._load=load;

test('navigation metadata retains hardware, program identity and network module targets without bytes',()=>{
  const state=explorerNodes({...file,bytes:new Uint8Array([1,2])},summary,{view:'networks',networkIndex:0,networkModuleKey:'0:1:7'});
  assert.equal(state.selectedId,'network:0:0:1:7');
  assert.equal(state.nodes[1].children[0].label,'Base 0 (1)');
  assert.deepEqual(state.nodes[2].children[1].target,{view:'programs',programIndex:1,objectId:'b'});
  assert.equal(state.nodes[3].children[0].children[0].label,'FENET (Base 0, Slot 1)');
  assert.equal(state.nodes[4].label,'Variables (42)');
  assert.equal(state.bytes,undefined);
});

test('context menus survive selection refresh; document switching rejects stale commands',async()=>{
  const calls=[];const explorer=new XgwxExplorer((editor,message)=>calls.push([editor,message]));
  const first={explorerState:explorerNodes(file,summary,{view:'overview'})};
  explorer.setEditor(first);
  const row=explorer.nodes.get('program:a');
  assert.equal(explorer.getTreeItem(row).command.command,'xgwx.explorerNavigate');
  assert.deepEqual(JSON.parse(JSON.stringify(explorer.getTreeItem(row).command.arguments)), [{id:row.id,uri:file.uri}]);
  assert.equal(explorer.getParent(row).id,'programs');
  await explorer.dispatch(row);
  assert.equal(calls[0][1].uri,file.uri);
  explorer.update(first.explorerState);
  await explorer.dispatch(row,'deleteProgram');
  assert.equal(calls.length,2);
  explorer.setEditor({explorerState:explorerNodes({uri:'file:///two.xgwx',fileName:'two.xgwx'},summary,{view:'overview'})});
  await explorer.dispatch(row,'deleteProgram');
  assert.equal(calls.length,2);
  explorer.setEditor(undefined);
  assert.deepEqual(explorer.getChildren(),[]);
});

test('native drag routes program reorder by identity and rejects cross-document drops',async()=>{
  const calls=[];const explorer=new XgwxExplorer((editor,message)=>calls.push(message));
  explorer.setEditor({explorerState:explorerNodes(file,summary,{view:'programs',programIndex:0})});
  const transfer=new Map();
  explorer.handleDrag([explorer.nodes.get('program:a')],transfer);
  await explorer.handleDrop(explorer.nodes.get('program:b'),transfer);
  assert.equal(calls[0].action,'moveProgram');
  assert.equal(calls[0].sourceObjectId,'a');
  assert.equal(calls[0].target.objectId,'b');
  explorer.setEditor({explorerState:explorerNodes({uri:'file:///two.xgwx',fileName:'two.xgwx'},summary,{view:'overview'})});
  await explorer.handleDrop(explorer.nodes.get('program:b'),transfer);
  assert.equal(calls.length,1);
});

test('base navigation uses record identity and scoped installed modules',()=>{
  const scoped={hardware:{bases:[
    {base:0,baseIndex:0,configurationIndex:0,modules:[{kind:'io',hardware:{base:0,slot:0,id:1}}]},
    {base:0,baseIndex:1,configurationIndex:1,modules:[{kind:'network',hardware:null},{kind:'other',hardware:{base:0,slot:1,id:2}}]},
  ],modules:[{base:0,slot:0,id:1},{base:0,slot:1,id:2}]}};
  const state=explorerNodes(file,scoped,{view:'hardware',base:0,baseIndex:1});
  assert.equal(state.selectedId,'base:1');
  assert.deepEqual(state.nodes[1].children.map(row=>[row.id,row.label]),[['base:0','Base 0 · PLC 0 (1)'],['base:1','Base 0 · PLC 1 (1)']]);
  assert.deepEqual(state.nodes[1].children[1].target,{view:'hardware',base:0,baseIndex:1});
});

test('network aliases do not become additional occupied hardware slots',()=>{
  const module={base:0,slot:1,id:7};
  const scoped={hardware:{bases:[{base:0,baseIndex:0,modules:[
    {kind:'network',hardware:module},{kind:'network',hardware:{...module}},
  ]}],modules:[module]}};
  assert.equal(explorerNodes(file,scoped,{view:'hardware',baseIndex:0}).nodes[1].children[0].label,'Base 0 (1)');
});
