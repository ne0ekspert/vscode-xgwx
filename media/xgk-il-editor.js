export const xgkIlOperators=['LOAD','LOAD NOT','LOADP','LOADN','AND','AND NOT','ANDP','ANDN','OUT','OUT NOT','OUTP','OUTN','SET','RST'];
export function xgkIlCompletions(source,caret,variables=[],explicit=false) {
 const line=source.slice(0,caret).split('\n').at(-1),match=line.match(/([A-Za-z_]\w*)?$/);
 const prefix=match?.[0] || '';if(!explicit&&!prefix)return [];
 const items=/^\s*[A-Za-z_]*$/.test(line)?xgkIlOperators.map(label=>({label,detail:'XGK operator',insert:label})):variables.map(v=>({label:v.name,detail:v.dataType,insert:v.name}));
 return items.filter(v=>v.label.toLowerCase().startsWith(prefix.toLowerCase())).map(v=>({...v,start:caret-prefix.length,end:caret}));
}
export function diagnoseXgkIl(source) {
 const issues=[];let offset=0;
 for(const [index,line] of source.split('\n').entries()) {
  const op=line.trim().split(/\s+/)[0]?.toUpperCase();
  if(['LD','LDN','ST','STN','S','R','CAL','CALC','CALCN'].includes(op))issues.push({message:`${op} is an IEC operator. This editor uses XGK IL mnemonics.`,start:offset+line.toUpperCase().indexOf(op),end:offset+line.toUpperCase().indexOf(op)+op.length,line:index+1,column:1,code:'dialect',severity:'error'});
  if(/^\s*(?:OR(?: NOT|P|N)?\b|AND LOAD\b|OR LOAD\b|Comment:)/i.test(line))issues.push({message:'Branch and comment IL remains read only; edit it in the ladder view.',start:offset,end:offset+line.length,line:index+1,column:1,code:'topology',severity:'error'});
  offset+=line.length+1;
 }
 return issues;
}
