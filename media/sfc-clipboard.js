import {actionGroup,actionValue,appendAction,removeActions} from './sfc-actions.js';
const position=(rows,i)=>rows[i].position || {row:i,column:0};
const height=rows=>rows.length ? Math.max(...rows.map((r,i)=>position(rows,i).row))+1 : 0;
const fail=message=>{throw new Error(message);};
// Clipboard charts are complete physical row spans; partial branch paths are guarded.
function checkSpan(rows,top,bottom) {
  for(const [i,r] of rows.entries()) {
    const p=position(rows,i);
    if(r.kind.endsWith('_split')) {
      const join=rows.find((v,j)=>v.kind===r.kind.replace('_split','_join') && position(rows,j).row>p.row);
      if(!join) fail('This branch layout cannot be copied.');
      const end=join.position.row;
      if(top<=end && bottom>=p.row && !(top<=p.row && bottom>=end)) fail('Select the complete branch, including its split and join.');
    }
  }
}
export function captureSfcClipboard(block,indices,actionsOnly=false) {
  const rows=block.editableRows;
  if(!Array.isArray(rows)) fail('This chart is read-only.');
  indices=[...new Set(indices)].filter(i=>rows[i]).sort((a,b)=>position(rows,a).row-position(rows,b).row || position(rows,a).column-position(rows,b).column);
  if(!indices.length) fail('Select chart rows or action boxes first.');
  if(actionsOnly) {
    const actions=indices.filter(i=>rows[i].action).map(i=>actionValue(rows[i]));
    if(!actions.length) fail('Select an existing action box first.');
    return {version:1,kind:'actions',actions:structuredClone(actions),indices};
  }
  let top=Math.min(...indices.map(i=>position(rows,i).row)),bottom=Math.max(...indices.map(i=>position(rows,i).row));
  for(const i of indices) if(rows[i].kind==='step') for(const child of actionGroup(rows,i)) bottom=Math.max(bottom,position(rows,child).row);
  const first=rows.find((r,i)=>position(rows,i).row===top && r.kind!=='continuation');
  if(!first) fail('Select the owning step to copy its action rows.');
  checkSpan(rows,top,bottom);
  const captured=rows.flatMap((r,i)=>{const p=position(rows,i);return p.row>=top && p.row<=bottom ? [{...structuredClone(r),position:{row:p.row-top,column:p.column}}] : [];});
  return {version:1,kind:'rows',rows:captured,rowCount:bottom-top+1,top,bottom};
}
export function cutSfcClipboard(block,clipboard) {
  if(clipboard.kind==='actions') {
    const owner=actionGroup(block.editableRows,clipboard.indices[0])[0] || 0;
    return {rows:removeActions(block.editableRows,clipboard.indices),selectedRow:owner};
  }
  const rows=structuredClone(block.editableRows).filter((r,i)=>{const p=position(block.editableRows,i);return p.row<clipboard.top || p.row>clipboard.bottom;});
  const removedLabels=new Set(clipboard.rows.filter(r=>r.kind==='label').map(r=>r.title));
  if(rows.some(r=>r.kind==='jump'&&removedLabels.has(r.title))) fail('A remaining jump refers to a selected label. Include the jump in the cut.');
  if(rows.some(r=>r.position)) for(const r of rows) if(r.position.row>clipboard.bottom) r.position.row-=clipboard.rowCount;
  if(!rows.some(r=>r.branchEnd!=null)) rows.forEach(r=>delete r.position);
  if(!rows.some(r=>r.initial)) {const step=rows.find(r=>r.kind==='step');if(step)step.initial=true;}
  return {rows,selectedRow:Math.max(0,rows.findIndex((r,i)=>position(rows,i).row>=clipboard.top))};
}
function rename(rows,reserved=[]) {
  const used=new Set(reserved.map(v=>v.toLowerCase())),maps={step:new Map(),label:new Map(),program:new Map()};
  for(const r of rows) {if(['step','label'].includes(r.kind))used.add(r.title.toLowerCase());if(r.actionCode!=null)used.add(r.action.toLowerCase());if(r.transitionCode!=null)used.add(r.title.toLowerCase());}
  return (kind,name)=>{
    if(maps[kind].has(name))return maps[kind].get(name);
    let result=name,n=1;while(used.has(result.toLowerCase())){const suffix=`_${n++}`;result=name.slice(0,32-suffix.length)+suffix;}
    used.add(result.toLowerCase());maps[kind].set(name,result);return result;
  };
}
export function pasteSfcClipboard(block,clipboard,index,reserved=[]) {
  if(clipboard?.version!==1) fail('Copy or cut SFC rows or actions first.');
  let rows=structuredClone(block.editableRows);
  if(!Array.isArray(rows)) fail('This chart is read-only.');
  const fresh=rename(rows,reserved);
  if(clipboard.kind==='actions') {
    if(!actionGroup(rows,index).length) fail('Select a step or action box to paste actions.');
    let selectedRow=index;
    for(const value of clipboard.actions) {const action=structuredClone(value);if(action.actionCode!=null)action.action=fresh('program',action.action);const edit=appendAction(rows,index,action);if(!edit)fail('Actions cannot be pasted here.');rows=edit.rows;selectedRow=edit.index;}
    return {rows,selectedRow,action:true};
  }
  if(clipboard.kind!=='rows')fail('Unsupported SFC clipboard data.');
  // Insert after a whole step/action unit, and outside existing branch interiors.
  const group=actionGroup(rows,index),last=group.length ? group.at(-1) : index;
  const at=last>=0 && rows[last] ? position(rows,last).row+1 : height(rows);
  for(const r of rows.filter(r=>r.kind.endsWith('_split'))) {const end=rows.find(v=>v.kind===r.kind.replace('_split','_join') && v.position.row>r.position.row)?.position.row;if(r.position.row<at && at<=end)fail('Paste outside the branch, after its join.');}
  if(rows.some((r,i)=>position(rows,i).row===at && r.kind==='continuation'))fail('Paste after the owning step and all its actions.');
  const copied=structuredClone(clipboard.rows),labels=new Map();
  for(const r of copied) {if(r.kind==='step')r.title=fresh('step',r.title);if(r.kind==='label'){const old=r.title;r.title=fresh('label',old);labels.set(old,r.title);}if(r.actionCode!=null)r.action=fresh('program',r.action);if(r.transitionCode!=null)r.title=fresh('program',r.title);}
  for(const r of copied)if(r.kind==='jump'){if(labels.has(r.title))r.title=labels.get(r.title);else if(!rows.some(v=>v.kind==='label'&&v.title===r.title))fail(`Paste requires label ${r.title} in the destination chart.`);}
  if(rows.some(r=>r.initial))for(const r of copied)r.initial=false;
  const positioned=rows.some(r=>r.position)||copied.some(r=>r.branchEnd!=null);
  rows=rows.map((r,i)=>({...r,position:{...position(rows,i)}}));
  for(const r of rows)if(r.position.row>=at)r.position.row+=clipboard.rowCount;
  for(const r of copied)r.position.row+=at;
  rows.push(...copied);rows.sort((a,b)=>a.position.row-b.position.row||a.position.column-b.position.column);
  const selectedRow=rows.indexOf(copied[0]);if(!positioned)rows.forEach(r=>delete r.position);
  return {rows,selectedRow};
}
