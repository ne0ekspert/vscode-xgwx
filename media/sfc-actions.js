const fields=['action','actionQualifier','actionTime','actionCode'];
const position=(rows,i)=>rows[i].position || {row:i,column:0};
export const actionValue=row=>Object.fromEntries(fields.filter(k=>row[k]!=null).map(k=>[k,row[k]]));
const setAction=(row,value)=>{for(const key of fields) delete row[key];row.action=null;Object.assign(row,value);};
export function actionGroup(rows,index) {
  if(index<0 || !rows[index]) return [];
  const column=position(rows,index).column;
  let owner=index;
  while(rows[owner]?.kind==='continuation') {
    const row=position(rows,owner).row;
    owner=rows.findIndex((r,i)=>position(rows,i).column===column && position(rows,i).row===row-1);
  }
  if(rows[owner]?.kind!=='step') return [];
  const group=[owner];let row=position(rows,owner).row+1;
  for(;;row++) {
    const i=rows.findIndex((r,i)=>position(rows,i).column===column && position(rows,i).row===row && r.kind==='continuation');
    if(i<0) break;group.push(i);
  }
  return group;
}
export function compactActions(rows) {
  const result=structuredClone(rows);
  for(;;) {
    const row=result.findIndex((r,i)=>r.kind==='continuation' && !r.action &&
      result.filter((v,j)=>position(result,j).row===position(result,i).row).every(v=>v.kind==='continuation'&&!v.action));
    if(row<0) return result;
    const at=position(result,row).row;
    if(result[row].position) {
      for(let i=result.length-1;i>=0;i--) if(result[i].position.row===at) result.splice(i,1);
      for(const r of result) if(r.position.row>at) r.position.row--;
    } else result.splice(row,1);
  }
}
export function appendAction(rows,index,value) {
  const result=structuredClone(rows),group=actionGroup(result,index);
  if(!group.length || !value.action) return null;
  const existing=group.filter(i=>result[i].action).map(i=>actionValue(result[i]));
  group.forEach((i,n)=>setAction(result[i],existing[n]||{}));
  const empty=group.find(i=>!result[i].action);
  if(empty!=null) {setAction(result[empty],value);return {rows:result,index:empty};}
  const p=position(result,group.at(-1)),at=p.row+1;
  const fresh=column=>({kind:'continuation',title:'',comment:'',initial:false,action:null,...(result[0].position?{position:{row:at,column}}:{})});
  let target;
  if(result[0].position) {
    const columns=result.filter(r=>r.position.row===at-1 && ['step','transition','continuation','label'].includes(r.kind)).map(r=>r.position.column);
    for(const r of result) if(r.position.row>=at) r.position.row++;
    for(const column of columns) {const row=fresh(column);if(column===p.column) {setAction(row,value);target=row;}result.push(row);}
    result.sort((a,b)=>a.position.row-b.position.row||a.position.column-b.position.column);
    return target && {rows:result,index:result.indexOf(target)};
  }
  target=fresh(0);setAction(target,value);result.splice(at,0,target);return {rows:result,index:at};
}
export function removeActions(rows,indices) {
  const result=structuredClone(rows),removed=new Set(indices),owners=new Set(indices.map(i=>actionGroup(result,i)[0]).filter(i=>i!=null));
  for(const owner of owners) {
    const group=actionGroup(result,owner),values=group.filter(i=>!removed.has(i)&&result[i].action).map(i=>actionValue(result[i]));
    group.forEach((i,n)=>setAction(result[i],values[n]||{}));
  }
  return compactActions(result);
}
export function moveAction(rows,index,delta) {
  const result=structuredClone(rows),group=actionGroup(result,index).filter(i=>result[i].action),at=group.indexOf(index),target=group[at+delta];
  if(at<0 || target==null) return null;
  const value=actionValue(result[index]);setAction(result[index],actionValue(result[target]));setAction(result[target],value);
  return {rows:result,index:target};
}
export function moveRowUnit(rows,index,delta) {
  const units=[];for(const [i,row] of rows.entries()) {if(row.kind!=='continuation') units.push([]);if(!units.length)return null;units.at(-1).push(i);}
  const at=units.findIndex(u=>u.includes(index)),target=at+delta;
  if(at<0 || target<0 || target>=units.length) return null;
  [units[at],units[target]]=[units[target],units[at]];
  return {rows:units.flatMap(u=>u.map(i=>structuredClone(rows[i]))),index:units.slice(0,target).reduce((n,u)=>n+u.length,0)};
}
