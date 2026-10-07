// Text commands map to the existing guarded native element kinds.
const CONTACT_COMMANDS = [
  ["NO", "NormallyOpen", "NO", ["A", "NormallyOpen"]],
  ["NC", "NormallyClosed", "NC", ["B", "NormallyClosed"]],
  ["P", "AddressedRisingPulse", "RISING", ["P_CONTACT", "RISING"]],
  ["P/", "AddressedRisingPulseNot", "NEGATED_RISING", ["P_NOT_CONTACT", "NEGATED_RISING"]],
  ["N", "AddressedFallingPulse", "FALLING", ["N_CONTACT", "FALLING"]],
  ["N/", "AddressedFallingPulseNot", "NEGATED_FALLING", ["N_NOT_CONTACT", "NEGATED_FALLING"]],
];
const COIL_COMMANDS = [
  ["OUT", "Output", "OUTPUT", ["OUTPUT"]],
  ["OUT/", "InverseOutput", "INVERSE", ["InverseOutput"]],
  ["SET", "Set", "SET", []],
  ["RST", "Reset", "RESET", ["RESET"]],
  ["OUTP", "RisingPulseOutput", "RISING", ["RisingPulseOutput"]],
  ["OUTN", "FallingPulseOutput", "FALLING", ["FallingPulseOutput"]],
];

// Native LD uses B/BN for the IL LOADB/LOADBN operations. The prompt keeps
// B available as the longstanding normally-closed contact alias.
export function xgkInputCommands(choices = []) {
  return choices.map(choice => ["B", "BN"].includes(choice.mnemonic)
    ? { ...choice, nativeMnemonic: choice.mnemonic, mnemonic: choice.mnemonic === "B" ? "LOADB" : "LOADBN" }
    : choice);
}

export function nativeInstructionParts(value) {
  const parts = [];
  let quoted = false, start = 0;
  for (let index = 0; index < value.length; index++) {
    if (value[index] === "'") quoted = !quoted;
    if (!quoted && value[index] === ',') {
      parts.push(value.slice(start, index).trim());
      start = index + 1;
    }
  }
  if (quoted) return undefined;
  parts.push(value.slice(start).trim());
  return parts;
}

export function instructionOperandText(value, iec = false) {
  return typeof value === 'string' && Boolean(value) && !/[\p{Cc}]/u.test(value)
    && (!value.includes(',') || !iec && value.startsWith("'") && value.endsWith("'")
      && nativeInstructionParts(value)?.length === 1);
}

export function elementCommands(category, iec = false, coilAliases = false) {
  const definitions = category === "contact" ? CONTACT_COMMANDS : COIL_COMMANDS;
  const commands = definitions.map(([mnemonic, kind, iecKind, aliases]) => ({
    mnemonic, kind, iecKind, category, aliases: [...new Set([...aliases, kind]),
      ...(coilAliases && mnemonic === "OUTP" ? ["P"] : []),
      ...(coilAliases && mnemonic === "OUTN" ? ["N"] : [])],
    operandCount: 1,
    operandRules: [{ label: category === "coil" ? "Destination" : "Contact", dataTypes: [iec ? "BOOL" : "BIT"], allowsConstant: false, requiresWritable: category === "coil" }],
  }));
  if (!iec && category === "contact") for (const [mnemonic, kind] of [["INV", "Inverse"], ["PUP", "RisingPulse"], ["PDN", "FallingPulse"]]) {
    commands.push({ mnemonic, kind, category, operandCount: 0, operandRules: [] });
  }
  return commands;
}


// IEC primitive type mask bits follow the native local-variable type IDs.
const IEC_TYPES = ["BOOL", "BYTE", "WORD", "DWORD", "LWORD", "SINT", "INT", "DINT", "LINT", "USINT", "UINT", "UDINT", "ULINT", "REAL", "LREAL", "TIME", "DATE", "TIME_OF_DAY", "DATE_AND_TIME"];
export function iecPinRule(pin) {
  return { label: pin.name, dataTypes: IEC_TYPES.includes(pin.dataType) ? [pin.dataType]
    : IEC_TYPES.filter((_, index) => pin.dataTypeMask & (1 << index)),
    allowsConstant: pin.direction !== "output", requiresWritable: pin.direction === "output" };
}
export function scalarIecCommands(wiredComparison = false, optionalOutput = false) {
  return ["MOVE", "ADD", "SUB", "MUL", "DIV", "EQ", "GT", "GE", "LT", "LE"].map(mnemonic => {
    const comparison = ["EQ", "GT", "GE", "LT", "LE"].includes(mnemonic);
    const count = mnemonic === "MOVE" || (comparison && wiredComparison) ? 2 : 3;
    const mask = mnemonic === "MOVE" || comparison ? 0x000fffff : 0x00007fe0;
    return { mnemonic, category: "function", operandCount: count,
      ...(comparison && optionalOutput && !wiredComparison ? {minOperandCount: 2} : {}), operandRules:
      Array.from({length: count}, (_, index) => {
        const output = index === count-1 && !(comparison && wiredComparison);
        return iecPinRule({ name: output ? "Destination" : `Source ${index+1}`,
          direction: output ? "output" : "input", dataTypeMask: output && comparison ? 1 : mask });
      }) };
  });
}

// XGK output instructions use the right output column, regardless of the
// blank cell that opened the prompt. Keep contact pulse aliases contextual.
export function xgkBlankCommands(ladder, position) {
  const outputs = [...elementCommands("coil", false, position.column === 9),
    ...(ladder.instructionChoices || []).map(choice => ({ ...choice, category: "function" }))];
  if (position.column === 9) return outputs;
  return [...elementCommands("contact"), ...xgkInputCommands(ladder.comparisonChoices)
    .filter(choice => position.column + choice.operandCount + 1 <= 9)
    .map(choice => ({ ...choice, category: "comparison" })), ...outputs];
}

export function xgkInsertionColumn(choice, position) {
  return ["coil", "function"].includes(choice.category) ? 9 : position.column;
}
