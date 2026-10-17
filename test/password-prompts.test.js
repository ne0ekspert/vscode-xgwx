const test=require('node:test');const assert=require('node:assert/strict');
const {promptPassword}=require('../password-prompts.cjs');
function windowWith(values) {const prompts=[],errors=[];return {prompts,errors,async showInputBox(options){prompts.push(options);return values.shift();},async showErrorMessage(error){errors.push(error);}};}
test('all credential prompts are masked and creation/change/removal/cancel are explicit',async()=>{
 let window=windowWith(['first','first']);assert.deepEqual(await promptPassword(window,{action:'set'}),{current:null,replacement:'first'});assert(window.prompts.every(p=>p.password===true && !('value' in p)));
 window=windowWith(['first','second','second']);assert.deepEqual(await promptPassword(window,{action:'set',protected:true}),{current:'first',replacement:'second'});
 window=windowWith(['first']);assert.deepEqual(await promptPassword(window,{action:'remove',protected:true}),{current:'first',replacement:null});assert.equal(window.prompts.length,1);
 for(const values of [[undefined],['first',undefined],['first','second',undefined]]) {window=windowWith(values);assert.equal(await promptPassword(window,{action:'set',protected:true}),null);}
 window=windowWith(['first','second','mismatch']);assert.equal(await promptPassword(window,{action:'set',protected:true}),null);assert.deepEqual(window.errors,['Passwords do not match.']);
});
