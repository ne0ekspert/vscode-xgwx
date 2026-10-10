// IEC IL operator spellings from the XGI instruction manual, chapter 17.
export const ilOperators = ['LD','LDN','ST','STN','S','R','AND','ANDN','AND(','ANDN(','OR','ORN','OR(','ORN(','XOR','XORN','XOR(','XORN(','NOT','ADD','ADD(','SUB','SUB(','MUL','MUL(','DIV','DIV(','MOD','MOD(','GT','GE','EQ','NE','LE','LT','JMP','JMPC','JMPCN','CAL','CALC','CALCN','SCAL','RET','RETC','RETCN',')'];

// Preserve source offsets and newlines while excluding comments and literals.
function ilCode(source) {
  let result='',depth=0,quote=null,line=false;
  for(let i=0;i<source.length;i++) {
    const c=source[i],next=source[i+1];
    if(c==='\n'){result+='\n';line=false;continue;}
    if(line){result+=' ';continue;}
    if(depth){if(c==='('&&next==='*'){depth++;result+='  ';i++;}else if(c==='*'&&next===')'){depth--;result+='  ';i++;}else result+=' ';continue;}
    if(quote){result+=' ';if(c==='$'&&next){result+=' ';i++;}else if(c===quote){if(next===quote){result+=' ';i++;}else quote=null;}continue;}
    if(c==='('&&next==='*'){depth++;result+='  ';i++;}else if(c==='/'&&next==='/'){line=true;result+='  ';i++;}else if(c==="'"||c==='"'){quote=c;result+=' ';}else result+=c;
  }
  return {code:result,open:depth ? 'comment' : quote ? 'string' : null,inComment:depth>0||line,inString:!!quote};
}
export function ilCompletions(source,caret,variables=[],explicit=false) {
  const before=source.slice(0,caret),masked=ilCode(before);
  if(masked.inComment||masked.inString||/(?:#|%)[^\s,]*$/.test(before))return [];
  const line=masked.code.slice(masked.code.lastIndexOf('\n')+1),match=line.match(/([A-Za-z_]\w*|)$/);
  if(!match||!explicit&&!match[1])return [];
  const prefix=match[1],start=caret-prefix.length;
  const opcode=/^\s*(?:[A-Za-z_]\w*:\s*)?[A-Za-z_]*$/.test(line);
  const labels=[...ilCode(source).code.matchAll(/^\s*([A-Za-z_]\w*):/gm)].map(m=>({label:m[1],detail:'Label',insert:m[1]}));
  const items=opcode ? ilOperators.map(label=>({label,detail:'IL operator',insert:label}))
    : /^\s*(?:\w+:\s*)?JMPC?N?\s+/i.test(line) ? labels
    : variables.map(v=>({label:v.name,detail:v.displayType||v.dataType,insert:v.name}));
  const seen=new Set();
  return items.filter(v=>typeof v.label==='string'&&v.label.toLowerCase().startsWith(prefix.toLowerCase())&&(explicit||v.insert.toLowerCase()!==prefix.toLowerCase())&&!seen.has(v.label.toLowerCase())&&seen.add(v.label.toLowerCase())).slice(0,60).map(v=>({...v,start,end:caret}));
}
export function diagnoseIl(source) {
  const {code,open}=ilCode(source),issues=[],labels=new Map(),jumps=[],stack=[];
  const report=(message,start,end,code='syntax',severity='error')=>{if(issues.length===100)return;const before=source.slice(0,start);issues.push({message,start,end:Math.max(start+1,end),code,severity,line:before.split('\n').length,column:start-before.lastIndexOf('\n')});};
  let offset=0;
  for(const line of code.split('\n')) {
    const label=line.match(/^\s*([A-Za-z_]\w*):/),body=label?line.slice(label[0].length):line;
    if(label){const key=label[1].toUpperCase(),start=offset+line.indexOf(label[1]);if(labels.has(key))report(`Duplicate label ${label[1]}.`,start,start+label[1].length,'label');labels.set(key,start);}
    const m=body.match(/^\s*([A-Za-z_]\w*|\))\s*(\(?)\s*(.*?)\s*$/);
    if(body.trim()&&!m)report('Expected an IL operator or label.',offset,offset+line.length);
    if(m){const op=m[1].toUpperCase(),start=offset+line.length-body.length+body.indexOf(m[1]),operand=m[3];
      if(op===')'){if(!stack.length)report('Unexpected closing parenthesis.',start,start+1);else stack.pop();}
      else {
        if(m[2])stack.push(start);
        const xgk=['LOAD','LOADP','LOADN','OUT','OUTP','OUTN','SET','RST'].includes(op) || (['AND','OR'].includes(op) && /^NOT\s+\S/i.test(operand));
        if(xgk)report(`${op}${['AND','OR'].includes(op)?' NOT':''} is an XGK mnemonic. This program uses XGI IEC IL; use its IEC operators and verify the intended semantics in XG5000.`,start,start+m[1].length,'dialect');
        else if(!ilOperators.includes(op)&&!ilOperators.includes(op+'('))report(`Operator ${m[1]} is not covered by local checks; verify function calls in XG5000.`,start,start+m[1].length,'operator','warning');
        if(ilOperators.includes(op)&&!['NOT','RET','RETC','RETCN'].includes(op)&&!operand&& !source.slice(offset,offset+line.length).includes("'")&&!source.slice(offset,offset+line.length).includes('"'))report(`${op} requires an operand.`,start,start+m[1].length,'operand');
        if(/^JMPC?N?$/.test(op)&&/^[A-Za-z_]\w*$/.test(operand))jumps.push({name:operand,start:offset+line.lastIndexOf(operand)});
      }
    }
    offset+=line.length+1;
  }
  for(const jump of jumps)if(!labels.has(jump.name.toUpperCase()))report(`Unknown jump label ${jump.name}.`,jump.start,jump.start+jump.name.length,'label');
  for(const start of stack)report('Unclosed deferred expression.',start,start+1);
  if(open)report(`Unclosed ${open}.`,Math.max(0,source.length-1),source.length,open);
  return issues.sort((a,b)=>a.start-b.start);
}
