import assert from "node:assert/strict";
import test from "node:test";

import {
  COIL_ELEMENT_CHOICES,
  CONTACT_ELEMENT_CHOICES,
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
