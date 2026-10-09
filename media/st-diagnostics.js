// Conservative local checks. This is not an IEC compiler or a native type checker.
const keywords=new Set('IF THEN ELSIF ELSE END_IF CASE OF END_CASE FOR TO BY DO END_FOR WHILE END_WHILE REPEAT UNTIL END_REPEAT RETURN EXIT TRUE FALSE AND OR XOR NOT MOD VAR VAR_INPUT VAR_OUTPUT VAR_IN_OUT VAR_TEMP VAR_EXTERNAL VAR_GLOBAL END_VAR CONSTANT RETAIN NON_RETAIN AT ARRAY STRUCT END_STRUCT TYPE END_TYPE'.split(' '));
const types=new Set('BOOL BYTE WORD DWORD LWORD SINT INT DINT LINT USINT UINT UDINT ULINT REAL LREAL TIME DATE TIME_OF_DAY DATE_AND_TIME STRING WSTRING T D TOD DT'.split(' '));
export const stFunctionBlockPins={TON:['IN','PT','Q','ET'],TOF:['IN','PT','Q','ET'],TP:['IN','PT','Q','ET'],CTU_DINT:['CU','R','PV','Q','CV'],CTD_DINT:['CD','LD','PV','Q','CV'],CTUD_DINT:['CU','CD','R','LD','PV','QU','QD','CV'],R_TRIG:['CLK','Q'],F_TRIG:['CLK','Q'],RS:['S','R_1','Q'],SR:['S_1','R','Q']};
const pins=stFunctionBlockPins;
export const stOutputPins=new Set(['Q','ET','CV','QU','QD']);
const outputs=stOutputPins;
export function diagnoseSt(source,variables=[],{transition=false}={}) {
  const issues=[],tokens=[],starts=[0];for(let i=0;i<source.length;i++)if(source[i]==='\n')starts.push(i+1);
  const report=(code,message,start,end=start+1,severity='error')=>{
    if(issues.length>=100)return;
    let low=0,high=starts.length;while(low+1<high){const mid=(low+high)>>1;if(starts[mid]<=start)low=mid;else high=mid;}
    issues.push({code,message,severity,start,end:Math.max(start+1,end),line:low+1,column:start-starts[low]+1});
  };
  let i=0;
  while(i<source.length) {
    const start=i,c=source[i],next=source[i+1];
    if(/\s/.test(c)){i++;continue;}
    if(c==='/'&&next==='/'){i=source.indexOf('\n',i);if(i<0)i=source.length;continue;}
    if(c==='('&&next==='*'){
      let depth=1;i+=2;while(i<source.length&&depth){if(source.slice(i,i+2)==='(*'){depth++;i+=2;}else if(source.slice(i,i+2)==='*)'){depth--;i+=2;}else i++;}
      if(depth)report('comment','Unclosed (* comment.',start,Math.min(start+2,source.length));continue;
    }
    if(c==='*'&&next===')'){report('comment','Unexpected comment terminator.',i,i+2);i+=2;continue;}
    if(c==="'"||c==='"'){
      i++;let closed=false;while(i<source.length){if(source[i]==='$'){i+=2;continue;}if(source[i]===c){i++;if(source[i]===c){i++;continue;}closed=true;break;}i++;}
      if(!closed)report('string','Unclosed string literal.',start,Math.min(start+1,source.length));tokens.push({value:source.slice(start,i),kind:'literal',start,end:i});continue;
    }
    const rest=source.slice(i),literal=rest.match(/^(?:[A-Za-z_]\w*#(?:'(?:[^']|'')*'|"(?:[^"]|"")*"|[^\s;,()\[\]+*/<>=]+)|(?:2|8|16)#[\da-fA-F_]+|\d[\d_]*(?:\.\d[\d_]*)?(?:[eE][+-]?\d[\d_]*)?)/);
    const address=rest.match(/^%[A-Za-z]+\d+(?:\.\d+)?/),identifier=rest.match(/^[A-Za-z_]\w*/);
    const match=literal||address||identifier;
    if(match){i+=match[0].length;tokens.push({value:match[0],kind:literal||address?'literal':'id',start,end:i});continue;}
    const pair=source.slice(i,i+2),value=[':=','=>','<=','>=','<>','**','..'].includes(pair)?pair:c;i+=value.length;
    tokens.push({value,kind:'symbol',start,end:i});
  }
  const symbols=new Map(variables.filter(v=>typeof v.name==='string').map(v=>[v.name.toUpperCase(),v])),delimiters=[],blocks=[],declarationTokens=new Set();
  // Recognize simple inline declarations without guessing custom type layouts.
  let declaring=false;
  for(let n=0;n<tokens.length;n++) {
    const value=tokens[n].value.toUpperCase();
    if(/^VAR(?:_(?:INPUT|OUTPUT|IN_OUT|TEMP|EXTERNAL|GLOBAL))?$/.test(value))declaring=true;
    if(value==='END_VAR')declaring=false;
    if(!declaring || tokens[n].kind!=='id')continue;
    let j=n,names=[tokens[n]];while(tokens[j+1]?.value===','&&tokens[j+2]?.kind==='id'){j+=2;names.push(tokens[j]);}
    if(tokens[j+1]?.value===':'&&tokens[j+2]?.kind==='id') {
      const dataType=tokens[j+2].value.toUpperCase();
      for(const name of names){symbols.set(name.value.toUpperCase(),{name:name.value,dataType});declarationTokens.add(name);}
      declarationTokens.add(tokens[j+2]);
    }
  }
  const open={IF:['END_IF','THEN'],FOR:['END_FOR','DO'],WHILE:['END_WHILE','DO'],CASE:['END_CASE','OF'],REPEAT:['END_REPEAT','UNTIL'],VAR:['END_VAR',null],VAR_INPUT:['END_VAR',null],VAR_OUTPUT:['END_VAR',null],VAR_IN_OUT:['END_VAR',null],VAR_TEMP:['END_VAR',null],VAR_EXTERNAL:['END_VAR',null],VAR_GLOBAL:['END_VAR',null]};
  const closers=new Set(Object.values(open).map(v=>v[0]));let transAssignment=false;
  const semicolonBefore=t=>{const previous=tokens[t-1];if(previous && ![';',':','THEN','ELSE','DO','OF','REPEAT'].includes(previous.value.toUpperCase()))report('semicolon','Expected ; before this block boundary.',previous.end,previous.end,'warning');};
  for(let n=0;n<tokens.length;n++) {
    const t=tokens[n],v=t.value.toUpperCase(),prev=tokens[n-1],next=tokens[n+1];
    if(['(', '['].includes(v))delimiters.push({token:t,call:v==='('&&prev?.kind==='id'?symbols.get(prev.value.toUpperCase()):null});
    if([')',']'].includes(v)){
      const last=delimiters.at(-1);if(!last || last.token.value!==(v===')'?'(':'['))report('delimiter',`Unexpected ${v}.`,t.start,t.end);else delimiters.pop();
    }
    if(open[v])blocks.push({token:t,end:open[v][0],needs:open[v][1],seen:false});
    else if(closers.has(v)){
      const b=blocks.at(-1);if(!b||b.end!==v)report('block',`Unexpected ${v}.`,t.start,t.end);else {if(b.needs&&!b.seen)report('block',`Expected ${b.needs} in ${b.token.value}.`,b.token.start,b.token.end);if(v!=='END_REPEAT'&&v!=='END_VAR')semicolonBefore(n);blocks.pop();}
      if(v!=='END_VAR'&&next?.value!==';')report('semicolon',`Expected ; after ${v}.`,t.start,t.end,'warning');
    } else if(['THEN','DO','OF','UNTIL'].includes(v)){
      const b=blocks.at(-1);if(b?.needs===v)b.seen=true;
    } else if(['ELSE','ELSIF'].includes(v)){
      if(!(v==='ELSIF' ? ['END_IF'] : ['END_IF','END_CASE']).includes(blocks.at(-1)?.end))report('block',`${v} requires ${v==='ELSIF' ? 'IF' : 'IF or CASE'}.`,t.start,t.end);else {semicolonBefore(n);if(v==='ELSIF')blocks.at(-1).seen=false;}
    }
    if(v==='TRANS'&&next?.value===':=')transAssignment=true;
    if(v===':='&&(!next||[';',')',']'].includes(next.value)))report('expression','Expected an expression after :=.',t.start,t.end);
    if(t.kind!=='id'||keywords.has(v)||types.has(v)||declarationTokens.has(t))continue;
    const variable=symbols.get(v),call=delimiters.at(-1)?.call;
    if(next?.value===':=' && !delimiters.length && prev && ![';',':','THEN','ELSE','DO','FOR','REPEAT','END_VAR'].includes(prev.value.toUpperCase()) && source.slice(prev.end,t.start).includes('\n'))report('semicolon','Expected ; before this assignment.',prev.end,prev.end,'warning');
    if(prev?.value==='.') {
      const instance=symbols.get(tokens[n-2]?.value.toUpperCase());
      if(pins[instance?.dataType]&&!pins[instance.dataType].includes(v))report('pin',`Unknown ${instance.dataType} pin ${t.value}.`,t.start,t.end);
      continue;
    }
    if(call && [':=','=>'].includes(next?.value)) {
      const known=pins[call.dataType];if(known&&!known.includes(v))report('pin',`Unknown ${call.dataType} parameter ${t.value}.`,t.start,t.end);
      else if(known && (outputs.has(v)?'=>':':=')!==next.value)report('pin-direction',`Use ${outputs.has(v)?'=>':':='} for ${t.value}.`,next.start,next.end,'warning');
      continue;
    }
    if(next?.value==='(' || !call&&[':=','=>'].includes(next?.value)&&delimiters.some(d=>d.token.value==='('))continue;
    if(!variable)report('symbol',`Unknown variable ${t.value}; check local or global declarations.`,t.start,t.end,'warning');
    if(variable&&next?.value==='='&&(!prev||[';','THEN','ELSE','DO'].includes(prev.value.toUpperCase())))report('assignment','Use := for assignment; = compares values.',next.start,next.end,'warning');
    if(variable?.dataType==='BOOL'&&next?.value===':='&&tokens[n+3]?.value===';'&&tokens[n+2]?.kind==='literal'&&/^\d/.test(tokens[n+2].value))report('type','BOOL assignment uses a numeric literal; check the expression type.',tokens[n+2].start,tokens[n+2].end,'warning');
    if(variable&&next?.value==='[') {
      const bounds=variable.declaration?.dimensions || [];let j=n+2,indices=[];
      while(j<tokens.length) {
        let token=tokens[j];if(['+','-'].includes(token?.value)&&/^\d+$/.test(tokens[j+1]?.value || '')){token={...token,value:token.value+tokens[j+1].value,end:tokens[j+1].end};j++;}
        if(!/^[-+]?\d+$/.test(token?.value || ''))break;
        indices.push(token);j++;if(tokens[j]?.value!==',')break;j++;
      }
      if(tokens[j]?.value===']') {
        if(!bounds.length&&(types.has(variable.dataType)||pins[variable.dataType]))report('array',`${t.value} has no array dimensions.`,t.start,tokens[j].end,'warning');
        else if(bounds.length&&indices.length!==bounds.length)report('array',`Expected ${bounds.length} array indices for ${t.value}.`,t.start,tokens[j].end,'warning');
        else if(bounds.length) indices.forEach((token,k)=>{const value=Number(token.value);if(value<bounds[k].lower||value>bounds[k].upper)report('array',`Index is outside ${bounds[k].lower}..${bounds[k].upper}.`,token.start,token.end,'warning');});
      }
    }
  }
  for(const d of delimiters)report('delimiter',`Unclosed ${d.token.value}.`,d.token.start,d.token.end);
  for(const b of blocks)report('block',`Missing ${b.end}.`,b.token.start,b.token.end);
  const last=tokens.at(-1);if(last&&![';',':'].includes(last.value)&&!closers.has(last.value.toUpperCase())&&!issues.some(d=>d.code==='string'||d.code==='comment'))report('semicolon','Expected ; at the end of the statement.',last.start,last.end,'warning');
  if(transition&&!transAssignment&&tokens.length)report('transition','Transition programs should assign a BOOL expression to TRANS.',0,Math.min(source.length,1),'warning');
  return issues.sort((a,b)=>a.start-b.start || a.code.localeCompare(b.code));
}
