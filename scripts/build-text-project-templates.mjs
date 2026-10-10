// Build blank source projects with the same guarded writer used by the editor.
import fs from 'node:fs';
import {randomUUID} from 'node:crypto';
import init, {parse_xgwx, delete_xgwx_program, create_xgwx_program} from '../media/libxgwx.js';

await init({module_or_path:fs.readFileSync(new URL('../media/libxgwx_bg.wasm',import.meta.url))});
const base=fs.readFileSync(new URL('../media/templates/new-xgi.xgwx',import.meta.url));
const existing=parse_xgwx(base).programs[0];
const empty=delete_xgwx_program(base,0,existing.objectId);
for(const language of ['ST','IL']) {
  const bytes=create_xgwx_program(empty,{name:'NewProgram',language,objectId:randomUUID(),symbolId:randomUUID()});
  const parsed=parse_xgwx(bytes);
  if(parsed.programs.length!==1 || parsed.textPrograms.length!==1 || !parsed.textPrograms[0].editable || parsed.textPrograms[0].source!=='') {
    throw new Error(`Invalid blank ${language} project`);
  }
  const output=new URL(`../media/templates/new-xgi-${language.toLowerCase()}.xgwx`,import.meta.url);
  fs.writeFileSync(output,bytes);
  console.log(`Built ${output.pathname}`);
}

for (const stem of ['xgk-auto','xece','xech','xecs','xecu','xemh2','xemhp','gipam','kl','xgr']) {
 const native=fs.readFileSync(new URL(`../../libxgwx/fixtures/text-cpus/${stem}-native-blank.xgwx`,import.meta.url));
 const before=parse_xgwx(native);
 for(const language of before.programLanguages.filter(l=>['ST','IL'].includes(l))) {
  let bytes=native;
  if(language==='IL') {
   const empty=delete_xgwx_program(native,0,before.programs[0].objectId);
   bytes=create_xgwx_program(empty,{name:'NewProgram',language,objectId:randomUUID(),symbolId:randomUUID()});
  }
  const parsed=parse_xgwx(bytes);
  if(parsed.programs.length!==1 || parsed.textPrograms[0]?.language!==language || !parsed.textPrograms[0]?.editable || parsed.textPrograms[0]?.source!=='')throw new Error(`Invalid ${stem} ${language} template`);
  fs.writeFileSync(new URL(`../media/templates/new-${stem}-${language.toLowerCase()}.xgwx`,import.meta.url),bytes);
 }
}
