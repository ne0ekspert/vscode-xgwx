import {diagnoseSt,stFunctionBlockPins,stOutputPins} from './st-diagnostics.js';
const keywords = ['IF','THEN','ELSIF','ELSE','END_IF','CASE','OF','END_CASE','FOR','TO','BY','DO','END_FOR','WHILE','END_WHILE','REPEAT','UNTIL','END_REPEAT','RETURN','EXIT','TRUE','FALSE','AND','OR','XOR','NOT','MOD'];
const functions = {ADD:'ADD(Input1, Input2)',SUB:'SUB(Input1, Input2)',MUL:'MUL(Input1, Input2)',DIV:'DIV(Input1, Input2)',ABS:'ABS(Value)',MIN:'MIN(Input1, Input2)',MAX:'MAX(Input1, Input2)',SEL:'SEL(Condition, Input0, Input1)',LIMIT:'LIMIT(Minimum, Value, Maximum)'};
const pins = stFunctionBlockPins;
const types = ['BOOL','BYTE','WORD','DWORD','LWORD','SINT','INT','DINT','LINT','USINT','UINT','UDINT','ULINT','REAL','LREAL','TIME','DATE','TIME_OF_DAY','DATE_AND_TIME','STRING'];

// Comments and strings are source text, not completion contexts.
export function stCompletionContext(source, caret) {
  const before = source.slice(0,caret); let comment = 0, quote = null, lineComment = false;
  for (let i=0;i<before.length;i++) {
    const c=before[i], next=before[i+1];
    if (lineComment) { if(c==='\n') lineComment=false; continue; }
    if (comment) { if(c==='('&&next==='*') {comment++;i++;} else if(c==='*'&&next===')') {comment--;i++;} continue; }
    if (quote) { if(c==='$') i++; else if(c===quote) {if(next===quote)i++;else quote=null;} continue; }
    if(c==='('&&next==='*') {comment++;i++;} else if(c==='/'&&next==='/') {lineComment=true;i++;} else if(c==="'"||c==='"') quote=c;
  }
  if(comment||quote||lineComment || /(?:#|%)[^\s(),;]*$/.test(before)) return null;
  const match = before.match(/(?:([A-Za-z_]\w*)\.)?([A-Za-z_]\w*|)$/);
  if (!match) return null;
  const call=before.match(/([A-Za-z_]\w*)\([^()]*$/), parameter=before.match(/(?:\(|,)\s*([A-Za-z_]\w*|)$/);
  return {instance:match[1] || null,call:!match[1] && parameter ? call?.[1] : null,prefix:match[2],start:caret-match[2].length,end:caret};
}
export function stCompletions(source, caret, variables, explicit = false) {
  const context = stCompletionContext(source,caret);
  if(!context || (!explicit && !context.prefix && !context.instance)) return [];
  let items;
  const instance=variables.find(v=>v.name.toLowerCase()===(context.instance || context.call || '').toLowerCase());
  if(context.instance || instance && context.call) {
    items=(pins[instance?.dataType] || []).map(label=>({label,detail:`${instance.dataType} pin`,insert:context.instance ? label : `${label} ${stOutputPins.has(label) ? "=>" : ":="} `}));
  } else {
    items=[...variables.map(v=>({label:v.name,detail:v.displayType || v.dataType,insert:v.name})),
      ...keywords.map(label=>({label,detail:'Keyword',insert:label})),
      ...Object.entries(functions).map(([label,insert])=>({label,detail:'Function',insert})),
      ...types.map(label=>({label,detail:'Type',insert:label}))];
  }
  const seen=new Set();
  return items.filter(item=>item.label.toLowerCase().startsWith(context.prefix.toLowerCase()) && (explicit || item.insert.toLowerCase() !== context.prefix.toLowerCase()) && !seen.has(item.label.toLowerCase()) && seen.add(item.label.toLowerCase()))
    .slice(0,60).map(item=>({...item,start:context.start,end:context.end}));
}
const el=(tag,cls,text='')=>{const n=document.createElement(tag);n.className=cls;n.textContent=text;return n;};
let nextEditor=0;
export function renderStTextEditor({name,source,draft,variables,onChange,onApply,transition=false}) {
  const section=el('section','st-text-editor'); section.setAttribute('aria-label',`ST editor ${name}`);
  const header=el('div','st-editor-header'),title=el('strong','',`${name} · ST`);header.append(title);
  const apply=el('button','primary-button','Apply ST source');apply.type='button';apply.disabled=true;header.append(apply);section.append(header);
  const body=el('div','st-editor-body'),lines=el('pre','st-line-numbers'),input=el('textarea','st-source-input');
  input.value=draft ?? source;input.spellcheck=false;input.wrap='off';input.setAttribute('aria-label','SFC ST source');input.dataset.sfcStSource='true';input.autocapitalize='off';input.autocomplete='off';
  const popup=el('div','st-completions');popup.hidden=true;popup.id=`st-completions-${++nextEditor}`;popup.setAttribute('role','listbox');popup.setAttribute('aria-label','ST completions');
  input.setAttribute('aria-controls',popup.id);input.setAttribute('aria-autocomplete','list');
  const status=el('div','st-editor-status');body.append(lines,input,popup);section.append(body,status);
  const diagnostics=el('div','st-diagnostics'),summary=el('div','st-diagnostics-summary'),list=el('div','st-diagnostics-list');
  summary.setAttribute('role','status');summary.setAttribute('aria-live','polite');
  diagnostics.append(summary,list,el('small','muted','Local checks cover common mistakes. Use XG5000 Check Program for full syntax and type validation.'));section.append(diagnostics);
  let checkedSource=null,diagnosticTimer;
  const check=()=>{
    checkedSource=input.value;list.replaceChildren();const issues=diagnoseSt(input.value,variables,{transition});
    const errors=issues.filter(d=>d.severity==='error').length,warnings=issues.length-errors;
    summary.textContent=issues.length ? `Local ST: ${errors} error(s), ${warnings} warning(s)${issues.length===100 ? ' (first 100)' : ''}` : 'Local ST: no issues found in supported checks';
    input.setAttribute('aria-invalid',String(errors>0));
    for(const issue of issues){
      const button=el('button',`st-diagnostic ${issue.severity}`,`Ln ${issue.line}, Col ${issue.column}: ${issue.message}`);button.type='button';
      button.addEventListener('click',()=>{if(checkedSource!==input.value){check();return;}close();input.focus();input.setSelectionRange(issue.start,Math.min(issue.end,input.value.length));input.scrollTop=Math.max(0,(issue.line-3)*22);lines.scrollTop=input.scrollTop;paint();});list.append(button);
    }
  };
  let items=[],selected=0;
  const close=()=>{popup.hidden=true;input.removeAttribute('aria-activedescendant');};
  const paint=()=>{
    lines.textContent=Array.from({length:input.value.split('\n').length},(_,i)=>i+1).join('\n');
    const before=input.value.slice(0,input.selectionStart),row=before.split('\n').length,column=before.length-before.lastIndexOf('\n');
    status.textContent=`Ln ${row}, Col ${column} · Ctrl+Space autocomplete · Tab indent`;
    if (checkedSource!==input.value) {clearTimeout(diagnosticTimer);diagnosticTimer=setTimeout(()=>{if(section.isConnected)check();},180);}
    apply.disabled=input.value===source;title.textContent=`${name} · ST${apply.disabled ? '' : ' *'}`;title.title=apply.disabled ? name : 'Draft changes — apply to include in project saves';onChange(input.value);
  };
  const choose=()=>{
    const item=items[selected];if(!item)return;
    // A stale popup must never replace text at an old caret position.
    const context=stCompletionContext(input.value,input.selectionStart);
    if(!context||context.start!==item.start||context.end!==item.end) {close();return;}
    input.setRangeText(item.insert,item.start,item.end,'end');close();paint();input.focus();
  };
  const highlight=()=>{
    [...popup.children].forEach((n,i)=>{n.classList.toggle('selected',i===selected);n.setAttribute('aria-selected',String(i===selected));});
    const active=popup.children[selected];if(active){input.setAttribute('aria-activedescendant',active.id);active.scrollIntoView({block:'nearest'});}
  };
  const complete=(explicit=false)=>{
    if(input.selectionStart!==input.selectionEnd){close();return;}
    items=stCompletions(input.value,input.selectionStart,variables,explicit);selected=0;popup.replaceChildren();
    if(!items.length){close();return;}
    for(const [i,item] of items.entries()){
      const option=el('div','st-completion');option.id=`${popup.id}-${i}`;option.setAttribute('role','option');option.append(el('span','',item.label),el('small','muted',item.detail));
      option.addEventListener('mousedown',event=>{event.preventDefault();selected=i;choose();});popup.append(option);
    }
    const before=input.value.slice(0,input.selectionStart),row=before.split('\n').length-1,col=before.slice(before.lastIndexOf('\n')+1).replaceAll('\t','  ').length;
    popup.hidden=false;
    popup.style.left=`${Math.max(42,Math.min(body.clientWidth-240,48+col*8-input.scrollLeft))}px`;
    popup.style.top=`${Math.max(0,Math.min(body.clientHeight-150,8+(row+1)*22-input.scrollTop))}px`;highlight();
  };
  const sync=()=>{lines.scrollTop=input.scrollTop;close();};input.addEventListener('scroll',sync);
  input.addEventListener('input',()=>{paint();complete();});
  input.addEventListener('click',()=>{close();paint();});input.addEventListener('blur',close);
  input.addEventListener('keydown',event=>{
    event.stopPropagation();
    if((event.ctrlKey||event.metaKey)&&event.code==='Space'){event.preventDefault();complete(true);return;}
    if((event.ctrlKey||event.metaKey)&&event.key==='Enter'){event.preventDefault();close();if(!apply.disabled)apply.click();return;}
    if(event.key==='Tab'&&event.shiftKey || event.key.startsWith('Arrow')&&(event.shiftKey||event.ctrlKey||event.metaKey||event.altKey))close();
    if(!popup.hidden&&['ArrowUp','ArrowDown','Enter','Tab','Escape'].includes(event.key)){
      event.preventDefault();if(event.key==='Escape')close();else if(event.key==='Enter'||event.key==='Tab')choose();
      else {selected=(selected+(event.key==='ArrowDown'?1:-1)+items.length)%items.length;highlight();}return;
    }
    if(event.key==='Tab'){
      event.preventDefault();const start=input.selectionStart,end=input.selectionEnd;
      if(start===end&&!event.shiftKey)input.setRangeText('  ',start,end,'end');
      else {const first=input.value.lastIndexOf('\n',start-1)+1,last=end>start&&input.value[end-1]==='\n'?end-1:end;
        const text=input.value.slice(first,last),replacement=text.split('\n').map(line=>event.shiftKey?line.replace(/^(  |\t| )/,''):`  ${line}`).join('\n');
        input.setRangeText(replacement,first,last,'select');}
      close();paint();return;
    }
    if(event.key==='Enter'){
      event.preventDefault();const before=input.value.slice(0,input.selectionStart),line=before.slice(before.lastIndexOf('\n')+1),indent=line.match(/^\s*/)[0];
      input.setRangeText(`\n${indent}`,input.selectionStart,input.selectionEnd,'end');close();paint();return;
    }
    if(event.key.startsWith('Arrow')||['Home','End','PageUp','PageDown'].includes(event.key))close();
  });
  input.addEventListener('keyup',()=>paint());
  apply.addEventListener('click',async()=>{close();apply.disabled=true;try{await onApply(input.value);}finally{if(apply.isConnected)apply.disabled=input.value===source;}});
  paint();clearTimeout(diagnosticTimer);check();return section;
}
