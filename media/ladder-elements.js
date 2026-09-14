export const CONTACT_ELEMENT_CHOICES = Object.freeze([
  ["NormallyOpen", "Normally open contact"],
  ["NormallyClosed", "Normally closed contact"],
  ["AddressedRisingPulse", "Rising-edge contact (P)"],
  ["AddressedRisingPulseNot", "Rising-edge negated contact (P/)"],
  ["AddressedFallingPulse", "Falling-edge contact (N)"],
  ["AddressedFallingPulseNot", "Falling-edge negated contact (N/)"],
  ["Inverse", "Invert result (INV)"],
  ["RisingPulse", "Rising-edge pulse (PUP)"],
  ["FallingPulse", "Falling-edge pulse (PDN)"],
]);

export const COIL_ELEMENT_CHOICES = Object.freeze([
  ["Output", "Output coil"],
  ["InverseOutput", "Inverse output coil"],
  ["Set", "Set coil"],
  ["Reset", "Reset coil"],
  ["RisingPulseOutput", "Rising-edge output coil (P)"],
  ["FallingPulseOutput", "Falling-edge output coil (N)"],
]);

const CONTACT_EDIT_KINDS = Object.freeze({
  NO: "NormallyOpen",
  NC: "NormallyClosed",
  P_CONTACT: "AddressedRisingPulse",
  P_NOT_CONTACT: "AddressedRisingPulseNot",
  N_CONTACT: "AddressedFallingPulse",
  N_NOT_CONTACT: "AddressedFallingPulseNot",
  INV: "Inverse",
  PUP: "RisingPulse",
  PDN: "FallingPulse",
});

const COIL_EDIT_KINDS = Object.freeze({
  Output: "Output",
  Inverse: "InverseOutput",
  Set: "Set",
  Reset: "Reset",
  P_COIL: "RisingPulseOutput",
  N_COIL: "FallingPulseOutput",
});

const OPERANDLESS_KINDS = new Set(["Inverse", "RisingPulse", "FallingPulse"]);

export function structuralElementFromCell(cell) {
  if (!cell) return null;
  const kind = CONTACT_EDIT_KINDS[cell.contact] || COIL_EDIT_KINDS[cell.coil];
  if (!kind) return null;
  if (OPERANDLESS_KINDS.has(kind)) return { kind, operand: "" };
  return cell.sourceText ? { kind, operand: cell.sourceText } : null;
}

export function elementKindHasOperand(kind) {
  return !OPERANDLESS_KINDS.has(kind);
}
