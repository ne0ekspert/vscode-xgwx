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

export function elementCommands(category, iec = false, coilAliases = false) {
  const definitions = category === "contact" ? CONTACT_COMMANDS : COIL_COMMANDS;
  const commands = definitions.map(([mnemonic, kind, iecKind, aliases]) => ({
    mnemonic, kind, iecKind, category, aliases: [...new Set([...aliases, kind]),
      ...(coilAliases && mnemonic === "OUTP" ? ["P"] : []),
      ...(coilAliases && mnemonic === "OUTN" ? ["N"] : [])],
    operandCount: 1,
    operandRules: [{ label: category === "coil" ? "Destination" : "Contact", dataTypes: [iec ? "BOOL" : "BIT"], allowsConstant: false }],
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
    allowsConstant: pin.direction !== "output" };
}
export function scalarIecCommands() {
  return ["MOVE", "ADD", "SUB", "MUL", "DIV", "EQ", "GT", "GE", "LT", "LE"].map(mnemonic => {
    const comparison = ["EQ", "GT", "GE", "LT", "LE"].includes(mnemonic);
    const count = mnemonic === "MOVE" ? 2 : 3;
    const mask = mnemonic === "MOVE" || comparison ? 0x000fffff : 0x00007fe0;
    return { mnemonic, category: "function", operandCount: count, operandRules:
      Array.from({length: count}, (_, index) => iecPinRule({ name: index === count-1 ? "Destination" : `Source ${index+1}`,
        direction: index === count-1 ? "output" : "input", dataTypeMask: index === count-1 && comparison ? 1 : mask })) };
  });
}
