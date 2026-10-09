export function parseSfcArrayBounds(text) {
  if(!text.trim()) return [];
  const parts=text.split(',');
  if(parts.length>3) throw new Error('Use at most three array dimensions.');
  let count=1;
  const bounds=parts.map(part=>{
    const m=part.trim().match(/^(\d+)\s*\.\.\s*(\d+)$/);
    if(!m) throw new Error('Enter inclusive bounds such as 0..3 or 0..1, 0..2.');
    const lower=Number(m[1]),upper=Number(m[2]);
    if(lower!==0 || lower>upper || upper>65535) throw new Error('Use zero-based bounds, with upper from 0 to 65535.');
    count*=upper-lower+1;return {lower,upper};
  });
  if(count>65536) throw new Error('Use at most 65536 array elements.');
  return bounds;
}
export function sfcDeclarationType(variable) {
  const bounds=variable.declaration?.dimensions || [];
  return bounds.length ? `ARRAY[${bounds.map(d=>`${d.lower}..${d.upper}`).join(',')}] OF ${variable.dataType}` : variable.dataType;
}
