import test from 'node:test';
import assert from 'node:assert/strict';
import {validatedEditCache} from '../media/validated-edit-cache.js';
test('prompt acceptance reuses only identical successful validation on the same source',()=>{
 let builds=0;
 const cache=validatedEditCache(()=>new Uint8Array([++builds]));
 const source=new Uint8Array([1]);
 const validated=cache(source,'NO',['M00000']);
 assert.equal(cache(source,'NO',['M00000']),validated);
 assert.equal(builds,1);
 assert.notEqual(cache(source,'NC',['M00000']),validated);
 cache(source,'NC',['M00001']);
 cache(new Uint8Array(source),'NC',['M00001']);
 assert.equal(builds,4);
});
test('failed validations are never retained',()=>{
 let builds=0;
 const cache=validatedEditCache(()=>{builds++;throw new Error('invalid');});
 const source=new Uint8Array();
 for(let i=0;i<2;i++) assert.throws(()=>cache(source,'ADD',['1']),/invalid/);
 assert.equal(builds,2);
});
