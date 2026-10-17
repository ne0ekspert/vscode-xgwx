import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import init,{create_xgwx_project,parse_xgwx,unlock_xgwx_password,set_xgwx_password,clear_xgwx_password_session,edit_xgwx_text_program,update_xgwx_program} from '../media/libxgwx.js';
await init({module_or_path:fs.readFileSync(new URL('../media/libxgwx_bg.wasm',import.meta.url))});
const fixture=name=>fs.readFileSync(new URL(`./fixtures/passwords/${name}.xgwx`,import.meta.url));
test('native password opening distinguishes project and program authentication',()=>{
 clear_xgwx_password_session();const project=fixture('xgk-project-ascii');assert.throws(()=>parse_xgwx(project),/password required/);assert.throws(()=>unlock_xgwx_password(project,'wrong',undefined),/incorrect password/);
 assert.equal(unlock_xgwx_password(project,'Ab1! x',undefined).passwordProtection.projectProtected,true);
 clear_xgwx_password_session();assert.throws(()=>parse_xgwx(project),/password required/);
 const program=fixture('xgi-st-native');assert.equal(parse_xgwx(program).passwordProtection.programs[0].locked,true);
 assert.equal(parse_xgwx(program).textPrograms[0].source,null);
 assert.throws(()=>unlock_xgwx_password(program,'wrong',0),/incorrect password/);
 assert.equal(unlock_xgwx_password(program,'Ab1! x',0).textPrograms[0].source,'%MX1 := %MX0;\r\n');
});
test('existing WASM edits and undo bytes retain authenticated protected bodies and credentials',()=>{
 clear_xgwx_password_session();let bytes=create_xgwx_project('XGI-CPUE','ST');
 bytes=set_xgwx_password(bytes,0,undefined,'first');bytes=set_xgwx_password(bytes,undefined,undefined,'project1');
 const protectedBytes=bytes.slice(),before=parse_xgwx(bytes),p=before.textPrograms[0];
 bytes=edit_xgwx_text_program(bytes,{programIndex:0,expectedObjectId:p.objectId,expectedLanguage:'ST',expectedSource:p.source,source:'%MX1 := NOT %MX0;\r\n'});
 assert.equal(parse_xgwx(bytes).textPrograms[0].source,'%MX1 := NOT %MX0;\r\n');
 assert.equal(parse_xgwx(protectedBytes).passwordProtection.programs[0].locked,false);
 const edited=bytes.slice();clear_xgwx_password_session();assert.throws(()=>parse_xgwx(bytes),/password required/);
 unlock_xgwx_password(bytes,'project1',undefined);assert.equal(parse_xgwx(bytes).passwordProtection.programs[0].locked,true);
 unlock_xgwx_password(bytes,'first',0);assert.equal(parse_xgwx(bytes).textPrograms[0].source,'%MX1 := NOT %MX0;\r\n');
 const invalid=bytes.slice();assert.throws(()=>set_xgwx_password(bytes,0,'wrong',undefined),/incorrect/);assert.deepEqual(bytes,invalid);
 bytes=set_xgwx_password(bytes,0,'first','second');clear_xgwx_password_session();unlock_xgwx_password(bytes,'project1',undefined);assert.throws(()=>unlock_xgwx_password(bytes,'first',0),/incorrect/);unlock_xgwx_password(bytes,'second',0);
 bytes=set_xgwx_password(bytes,0,'second',undefined);bytes=set_xgwx_password(bytes,undefined,'project1',undefined);clear_xgwx_password_session();const removed=parse_xgwx(bytes);assert.equal(removed.passwordProtection.projectProtected,false);assert.equal(removed.passwordProtection.programs[0].protected,false);assert.equal(removed.textPrograms[0].source,'%MX1 := NOT %MX0;\r\n');
 // Authenticated external reload keeps only credentials that still match.
 unlock_xgwx_password(edited,'project1',undefined);unlock_xgwx_password(edited,'first',0);
 const changed=update_xgwx_program(edited,0,{name:'Renamed'});assert.equal(parse_xgwx(changed).passwordProtection.programs[0].locked,false);
});
