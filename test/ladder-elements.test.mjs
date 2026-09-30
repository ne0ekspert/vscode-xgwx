import assert from "node:assert/strict";
import test from "node:test";

import {
  COIL_ELEMENT_CHOICES,
  CONTACT_ELEMENT_CHOICES,
  IEC_ADDRESSED_CONTACT_CHOICES,
  iecContactGlyph,
  iecContactVariant,
  xgkContactGlyph,
  xgkContactVariant,
  elementKindHasOperand,
  structuralElementFromCell,
} from "../media/ladder-elements.js";

test("program inspector offers every supported contact, operation and coil kind", () => {
  assert.equal(CONTACT_ELEMENT_CHOICES.length, 9);
  assert.equal(COIL_ELEMENT_CHOICES.length, 6);
  assert.ok(CONTACT_ELEMENT_CHOICES.some(([kind]) => kind === "AddressedRisingPulseNot"));
  assert.ok(CONTACT_ELEMENT_CHOICES.some(([kind]) => kind === "FallingPulse"));
  assert.ok(COIL_ELEMENT_CHOICES.some(([kind]) => kind === "InverseOutput"));
  assert.ok(COIL_ELEMENT_CHOICES.some(([kind]) => kind === "RisingPulseOutput"));
});

test("IEC reuses the six addressed XGK contact variants", () => {
  assert.equal(IEC_ADDRESSED_CONTACT_CHOICES.length, 6);
  assert.deepEqual(IEC_ADDRESSED_CONTACT_CHOICES.map(([value, , , marker]) => [value, marker]), [
    ["NO", 6], ["NC", 7], ["RISING", 8], ["FALLING", 9],
    ["NEGATED_RISING", 10], ["NEGATED_FALLING", 11],
  ]);
  assert.ok(!IEC_ADDRESSED_CONTACT_CHOICES.some(([value]) => ["INV", "PUP", "PDN"].includes(value)));
  for (const [, , sourceLabel, , xgkKind] of IEC_ADDRESSED_CONTACT_CHOICES) {
    const xgkToken = {
      NormallyOpen: "NO", NormallyClosed: "NC",
      AddressedRisingPulse: "P_CONTACT", AddressedFallingPulse: "N_CONTACT",
      AddressedRisingPulseNot: "P_NOT_CONTACT", AddressedFallingPulseNot: "N_NOT_CONTACT",
    }[xgkKind];
    assert.equal(iecContactGlyph(sourceLabel), xgkContactGlyph(xgkToken));
    const variant = {
      NormallyOpen: "no", NormallyClosed: "nc",
      AddressedRisingPulse: "rising", AddressedFallingPulse: "falling",
      AddressedRisingPulseNot: "negated-rising", AddressedFallingPulseNot: "negated-falling",
    }[xgkKind];
    assert.equal(iecContactVariant(sourceLabel), variant);
    assert.equal(xgkContactVariant(xgkToken), variant);
  }
  assert.equal(xgkContactVariant("INV"), null);
});

test("decoded cells map back to structural edit payloads", () => {
  assert.deepEqual(
    structuralElementFromCell({ contact: "P_NOT_CONTACT", sourceText: "M00003" }),
    { kind: "AddressedRisingPulseNot", operand: "M00003" },
  );
  assert.deepEqual(
    structuralElementFromCell({ contact: "PUP", sourceText: null }),
    { kind: "RisingPulse", operand: "" },
  );
  assert.deepEqual(
    structuralElementFromCell({ coil: "N_COIL", sourceText: "M00101" }),
    { kind: "FallingPulseOutput", operand: "M00101" },
  );
});

test("only INV, PUP and PDN omit the device address", () => {
  for (const kind of ["Inverse", "RisingPulse", "FallingPulse"]) {
    assert.equal(elementKindHasOperand(kind), false);
  }
  for (const kind of ["NormallyOpen", "AddressedFallingPulse", "InverseOutput"]) {
    assert.equal(elementKindHasOperand(kind), true);
  }
});
