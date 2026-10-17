import {renderStTextEditor} from './st-editor.js';
export const userPouTypes=['BOOL','BYTE','WORD','DWORD','LWORD','SINT','INT','DINT','LINT','USINT','UINT','UDINT','ULINT','REAL','LREAL','TIME','DATE','TIME_OF_DAY','DATE_AND_TIME'];
const el=(tag,cls='',text='')=>{const n=document.createElement(tag);n.className=cls;n.textContent=text;return n;};
const label=(name,control)=>{const n=el('label','sfc-declaration-field');n.append(el('span','',name),control);return n;};
const select=(name,options,value)=>{const s=el('select');s.setAttribute('aria-label',name);for(const [key,text] of options){const o=el('option','',text);o.value=key;s.append(o);}s.value=value;return s;};
const input=(name,value='')=>{const n=el('input');n.setAttribute('aria-label',name);n.value=value;return n;};
// Definitions are passed per document; built-in tables are never mutated.
export function userPouCallables(pous=[]) {
 return pous.filter(p=>p.editable).map(p=>({name:p.name,kind:p.kind,pins:[{name:'EN',scope:'input',dataType:'BOOL'},...p.variables.filter(v=>v.scope==='input'||v.scope==='inOut'),{name:'ENO',scope:'output',dataType:'BOOL'},...p.variables.filter(v=>v.scope==='output')]}));
}
export function renderUserPous({canvas,inspector,pous=[],canCreate=false,selectedId,draft={},onDraft,onSelect,onCreate,onEdit}) {
 canvas.append(el('h2','','Functions and function blocks'));
 const toolbar=el('div','user-pou-toolbar');
 const chooser=select('User-defined POU',pous.map(p=>[p.objectId,`${p.name} · ${p.kind==='functionBlock'?'FB':'Function'}`]),selectedId || pous[0]?.objectId);
 chooser.disabled=!pous.length;chooser.addEventListener('change',()=>onSelect(chooser.value));toolbar.append(chooser);canvas.append(toolbar);
 const creation=el('details','user-pou-create');creation.open=!pous.length;creation.append(el('summary','','Create function or function block'));
 if(canCreate){
  const form=el('form','sfc-variable-form'),name=input('New POU name');name.required=true;name.maxLength=32;name.pattern='[A-Za-z_][A-Za-z_0-9]*';
  const kind=select('New POU kind',[['function','Function'],['functionBlock','Function block']],'function');
  const result=select('Function return type',userPouTypes.map(t=>[t,t]),'BOOL');kind.addEventListener('change',()=>{result.disabled=kind.value==='functionBlock';});
  const comment=input('New POU description'),submit=el('button','primary-button','Create ST definition');submit.type='submit';const error=el('p','sfc-declaration-error');error.setAttribute('role','alert');
  form.append(label('Name',name),label('Kind',kind),label('Return type',result),label('Description',comment),submit,error);
  form.addEventListener('submit',async e=>{e.preventDefault();submit.disabled=true;error.textContent='';try{await onCreate({name:name.value.trim(),kind:kind.value,returnType:result.disabled?null:result.value,variables:[],source:'',comment:comment.value});}catch(e){error.textContent=String(e.message||e);}finally{submit.disabled=false;}});creation.append(form);
 }else creation.append(el('p','muted','Creating ST definitions is supported for XGI projects.'));
 canvas.append(creation);
 const p=pous.find(p=>p.objectId===selectedId)||pous[0];
 if(!p){canvas.append(el('p','muted','Create a definition, declare its parameters, and apply its ST body. Declare a function-block instance in a calling ST program to use it.'));return;}
 canvas.append(el('h3','',`${p.name} · ${p.language||'Unknown language'}`));
 if(!p.editable){canvas.append(el('p','muted',p.reason || 'This definition is read only.'));if(p.source!=null)canvas.append(el('pre','text-program-readonly',p.source));return;}
 const currentDraft=draft.source===p.source?draft.value:p.source;
 const variables=[...p.variables,{name:'EN',dataType:'BOOL'},{name:'ENO',dataType:'BOOL'}];
 canvas.append(renderStTextEditor({name:p.name,source:p.source,draft:currentDraft,variables,callables:userPouCallables(pous),sourceLabel:'User POU ST source',onChange:value=>onDraft({source:p.source,value}),onApply:source=>onEdit({operation:'source',expected:p,source},`Edit ${p.name} source`)}));
 const section=el('section','cell-editor user-pou-interface');section.append(el('h3','','Parameters and local variables'));
 section.append(el('p','muted','Input and output order follows the rows within each class. Apply the interface before using the definition. Remove existing calls and instances before changing its interface.'));
 const form=el('form','user-pou-interface-form'),rows=el('div','user-pou-rows'),error=el('p','sfc-declaration-error');error.setAttribute('role','alert');
 const initial=draft.interfaceBase===JSON.stringify(p.variables)?draft.variables:p.variables;
 const updateDraft=()=>onDraft({interfaceBase:JSON.stringify(p.variables),variables:read()});
 const read=()=>[...rows.children].map(row=>({name:row.querySelector('[data-name]').value,scope:row.querySelector('[data-scope]').value,dataType:row.querySelector('[data-type]').value,description:row.querySelector('[data-description]').value}));
 const addRow=v=>{
  const row=el('div','user-pou-variable'),name=input('POU variable name',v.name),scope=select('POU variable scope',v.scope==='return'?[['return','Return']]:[['input','Input'],['output','Output'],['inOut','In/out'],['local','Local']],v.scope),type=select('POU variable type',userPouTypes.map(t=>[t,t]),v.dataType),description=input('POU variable description',v.description);
  name.dataset.name='';scope.dataset.scope='';type.dataset.type='';description.dataset.description='';name.maxLength=32;name.required=true;name.pattern='[A-Za-z_][A-Za-z_0-9]*';description.maxLength=255;
  if(v.scope==='return'){name.readOnly=true;scope.disabled=true;type.disabled=true;description.readOnly=true;}
  row.append(label('Name',name),label('Scope',scope),label('Type',type),label('Description',description));
  if(v.scope!=='return'){const remove=el('button','secondary-button','Remove');remove.type='button';remove.setAttribute('aria-label',`Remove POU variable ${v.name||'new'}`);remove.addEventListener('click',()=>{row.remove();updateDraft();});row.append(remove);}
  row.addEventListener('input',updateDraft);row.addEventListener('change',updateDraft);rows.append(row);
 };
 initial.forEach(addRow);
 const add=el('button','secondary-button','Add parameter or local');add.type='button';add.addEventListener('click',()=>{addRow({name:'',scope:'input',dataType:'DINT',description:''});updateDraft();rows.lastElementChild.querySelector('input').focus();});
 const apply=el('button','primary-button','Apply interface');apply.type='submit';form.append(rows,add,apply,error);
 form.addEventListener('submit',async e=>{e.preventDefault();apply.disabled=true;error.textContent='';try{await onEdit({operation:'variables',expected:p,variables:read()},`Edit ${p.name} interface`);}catch(e){error.textContent=String(e.message||e);}finally{apply.disabled=false;}});section.append(form);inspector.append(section);
 const remove=el('button','secondary-button','Delete definition');remove.type='button';remove.addEventListener('click',()=>onEdit({operation:'delete',expected:p},`Delete ${p.name}`));inspector.append(remove,el('p','muted','Applied edits participate in Undo, Redo and Save. Use XG5000 Check Program to compile the project.'));
}
