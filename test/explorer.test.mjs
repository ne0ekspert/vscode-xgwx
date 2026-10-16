import assert from 'node:assert/strict';
import test from 'node:test';
import Module from 'node:module';
import fs from 'node:fs';
import { explorerNodes } from '../media/explorer-model.js';
import init, {create_xgwx_project, cpu_catalog, parse_xgwx} from '../media/libxgwx.js';

await init({module_or_path: fs.readFileSync(new URL('../media/libxgwx_bg.wasm', import.meta.url))});

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

test('native CPU limits control sidebar bases and retain navigation targets',async()=>{
  const catalog=cpu_catalog();
  for (const [model,count] of [['XGK-CPUE',2],['XGK-CPUSN',4],['XGK-CPUHN',8]]) {
    const parsed=parse_xgwx(create_xgwx_project('XGK-CPUSN','LD'));
    parsed.cpu=catalog.find(cpu=>cpu.model===model);
    assert.equal(parsed.hardware.bases.length,8);
    const state=explorerNodes(file,parsed,{view:'hardware',base:count-1,baseIndex:count-1},catalog);
    assert.deepEqual(state.nodes[1].children.map(row=>row.label),Array.from({length:count},(_,base)=>`Base ${base} (0)`));
    const calls=[];
    const editor={explorerState:state};
    const explorer=new XgwxExplorer((target,message)=>calls.push([target,message]));
    explorer.setEditor(editor);
    const rows=explorer.getChildren(explorer.nodes.get('hardware'));
    assert.equal(rows.length,count);
    assert.equal(explorer.getTreeItem(rows.at(-1)).label,`Base ${count-1} (0)`);
    await explorer.dispatch(rows.at(-1));
    assert.equal(calls[0][0],editor);
    assert.deepEqual(calls[0][1].target,{view:'hardware',base:count-1,baseIndex:count-1});
  }
});

test('filtering keeps record identity, occupied out-of-range bases, and unknown PLCs',()=>{
  const catalog=cpu_catalog();
  const parsed=parse_xgwx(create_xgwx_project('XGK-CPUSN','LD'));
  parsed.hardware.bases.reverse();
  const occupied=parsed.hardware.bases.find(base=>base.base===5);
  occupied.modules=[{kind:'io',hardware:{base:5,slot:0,id:1}}];
  const state=explorerNodes(file,parsed,{view:'hardware',base:3,baseIndex:3},catalog);
  assert.deepEqual(state.nodes[1].children.map(row=>row.id),['base:5','base:3','base:2','base:1','base:0']);
  assert.equal(state.nodes[1].children[0].label,'Base 5 (1)');
  assert.equal(state.selectedId,'base:3');
  assert.equal(state.nodes[1].children[1].target.baseIndex,3);
  assert.equal(explorerNodes(file,{...parsed,cpu:{typeCode:999}},{},catalog).nodes[1].children.length,8);
  assert.equal(explorerNodes(file,{...parsed,counts:{configurations:2}},{},catalog).nodes[1].children.length,8);
});
