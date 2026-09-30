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

// XGK and the captured IEC LD payload use the same six addressed contact
// markers. IEC still has its own record envelope and BOOL operand validation.
const IEC_CONTACT_BY_XGK_KIND = Object.freeze({
  NormallyOpen: ["NO", "Normally open", "Normally open contact variable", 0x06],
  NormallyClosed: ["NC", "Normally closed", "Normally closed contact variable", 0x07],
  AddressedRisingPulse: ["RISING", "Rising edge", "Rising-edge contact variable", 0x08],
  AddressedFallingPulse: ["FALLING", "Falling edge", "Falling-edge contact variable", 0x09],
  AddressedRisingPulseNot: ["NEGATED_RISING", "Negated rising edge", "Negated rising-edge contact variable", 0x0a],
  AddressedFallingPulseNot: ["NEGATED_FALLING", "Negated falling edge", "Negated falling-edge contact variable", 0x0b],
});

export const IEC_ADDRESSED_CONTACT_CHOICES = Object.freeze(
  CONTACT_ELEMENT_CHOICES.flatMap(([kind]) => {
    const choice = IEC_CONTACT_BY_XGK_KIND[kind];
    return choice ? [Object.freeze([...choice, kind])] : [];
  }).sort((left, right) => left[3] - right[3]),
);

const CONTACT_GLYPH_BY_KIND = Object.freeze({
  NormallyOpen: "| |",
  NormallyClosed: "|/|",
  AddressedRisingPulse: "|P|",
  AddressedFallingPulse: "|N|",
  AddressedRisingPulseNot: "|P/|",
  AddressedFallingPulseNot: "|N/|",
  Inverse: "[¬]",
  RisingPulse: "[↑]",
  FallingPulse: "[↓]",
});

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

const IEC_CONTACT_GLYPH_BY_SOURCE_LABEL = new Map(
  IEC_ADDRESSED_CONTACT_CHOICES.map(([, , sourceLabel, , kind]) =>
    [sourceLabel, CONTACT_GLYPH_BY_KIND[kind]]),
);

const CONTACT_VISUAL_BY_KIND = Object.freeze({
  NormallyOpen: "no",
  NormallyClosed: "nc",
  AddressedRisingPulse: "rising",
  AddressedFallingPulse: "falling",
  AddressedRisingPulseNot: "negated-rising",
  AddressedFallingPulseNot: "negated-falling",
});

const IEC_CONTACT_VISUAL_BY_SOURCE_LABEL = new Map(
  IEC_ADDRESSED_CONTACT_CHOICES.map(([, , sourceLabel, , kind]) =>
    [sourceLabel, CONTACT_VISUAL_BY_KIND[kind]]),
);

export function xgkContactGlyph(contact) {
  return CONTACT_GLYPH_BY_KIND[CONTACT_EDIT_KINDS[contact]] || "[ ]";
}

export function xgkContactVariant(contact) {
  return CONTACT_VISUAL_BY_KIND[CONTACT_EDIT_KINDS[contact]] || null;
}

export function iecContactGlyph(sourceLabel) {
  return IEC_CONTACT_GLYPH_BY_SOURCE_LABEL.get(sourceLabel) || null;
}

export function iecContactVariant(sourceLabel) {
  return IEC_CONTACT_VISUAL_BY_SOURCE_LABEL.get(sourceLabel) || null;
}

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
