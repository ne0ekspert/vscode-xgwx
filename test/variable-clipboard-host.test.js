const test=require('node:test'), assert=require('node:assert/strict');
const {variableClipboard}=require('../variable-clipboard.cjs');
test('clipboard host roundtrips system text and reports failures without pretending success',async()=>{
 let text='';const clipboard={async writeText(value){text=value;},async readText(){return text;}};
 assert.deepEqual(await variableClipboard(clipboard,{action:'write',text:'rows'}),{value:null});
 assert.deepEqual(await variableClipboard(clipboard,{action:'read'}),{value:'rows'});
 assert.match((await variableClipboard(clipboard,{action:'write',text:'x'.repeat(1024*1024+1)})).error,/1 MiB/);assert.equal(text,'rows');
 assert.match((await variableClipboard({async writeText(){throw Error('Clipboard unavailable');}},{action:'write',text:'rows'})).error,/unavailable/);
 assert.match((await variableClipboard(clipboard,{action:'unknown'})).error,/Unknown/);
});
