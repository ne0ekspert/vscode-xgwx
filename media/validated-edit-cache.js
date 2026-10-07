// One prompt keeps only its last successful candidate. Source identity makes
// accepting a validated instruction cheap without reusing an edit after Undo.
export function validatedEditCache(build) {
  let previous;
  return (source, command, operands) => {
    const key = JSON.stringify([command, operands]);
    if (previous?.source === source && previous.key === key) return previous.bytes;
    const bytes = build(source, command, operands);
    previous = { source, key, bytes };
    return bytes;
  };
}
