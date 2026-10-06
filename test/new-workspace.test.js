const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const test = require('node:test');
const root = path.resolve(__dirname, '..');
const uri = name => ({path:name,with:change=>uri(change.path),toString:()=>name});
let selection, destination, applied, opened, failures, existing;
const mock = {
  Uri: {joinPath:(base,...parts)=>uri(path.join(base.path,...parts))},
  window: {showQuickPick:async items=>selection == null ? undefined : items[selection],
    showSaveDialog:async ()=>destination, showErrorMessage:async message=>failures.push(message)},
  WorkspaceEdit: class {createFile(target,options){this.target=target;this.options=options;}},
  workspace: {fs:{readFile:async target=>fs.readFileSync(target.path)},
    applyEdit:async edit=>{applied=edit;return !existing;}},
  commands:{executeCommand:async(...args)=>opened=args},
};
const originalLoad = Module._load;
Module._load = function(request,...args){return request === 'vscode' ? mock : originalLoad.call(this,request,...args);};
const {createNewWorkspace} = require('../new-workspace.cjs');
Module._load = originalLoad;
const context={extensionUri:uri(root)};
function reset(){selection=0;destination=uri('/workspace/Created');applied=opened=undefined;failures=[];existing=false;}

test('creates each native binary template and opens it with the XGWX editor',async()=>{
  for(const [index,file] of [[0,'new-xgk.xgwx'],[1,'new-xgi.xgwx']]){
    reset();selection=index;
    const result=await createNewWorkspace(context);
    assert.equal(result.path,'/workspace/Created.xgwx');
    assert.deepEqual(applied.options.contents,fs.readFileSync(path.join(root,'media/templates',file)));
    assert.equal(applied.options.overwrite,false);
    assert.equal(opened[0],'vscode.openWith');assert.equal(opened[2],'xgwx.workspaceViewer');
    assert.deepEqual(failures,[]);
  }
});
test('cancel does not create a file, and an existing file is never overwritten',async()=>{
  reset();selection=undefined;await createNewWorkspace(context);assert.equal(applied,undefined);
  reset();destination=undefined;await createNewWorkspace(context);assert.equal(applied,undefined);
  reset();existing=true;await createNewWorkspace(context);assert.equal(opened,undefined);assert.equal(failures.length,1);
});
test('registers the native New File chooser entry',()=>{
  const manifest=JSON.parse(fs.readFileSync(path.join(root,'package.json')));
  assert.ok(manifest.contributes.commands.some(c=>c.command==='xgwx.newFile'));
  assert.ok(manifest.contributes.menus['file/newFile'].some(c=>c.command==='xgwx.newFile'));
});
