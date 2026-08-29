import assert from "node:assert/strict";
import test from "node:test";

import {
  baseSlotCount,
  hardwareSlotRows,
  moduleAtPhysicalSlot,
  occupiedSlotCount,
} from "../media/hardware-slots.js";

const modules = [
  { base: 0, slot: 0, model: "single" },
  { base: 0, slot: 2, model: "double" },
];
const slotSpan = (module) => module.model === "double" ? 2 : 1;

test("hardware rows preserve every physical base slot", () => {
  const rows = hardwareSlotRows(0, 6, modules, slotSpan);

  assert.equal(rows.length, 6);
  assert.deepEqual(rows.map((row) => row.kind), [
    "module",
    "empty",
    "module",
    "continuation",
    "empty",
    "empty",
  ]);
  assert.equal(rows[1].module, null);
  assert.equal(rows[3].module, modules[1]);
  assert.equal(occupiedSlotCount(modules, 6, slotSpan), 3);
});

test("slot lookup returns a multi-slot owner and capacity has a safe fallback", () => {
  assert.equal(moduleAtPhysicalSlot(modules, 3, slotSpan), modules[1]);
  assert.equal(moduleAtPhysicalSlot(modules, 4, slotSpan), null);
  assert.equal(baseSlotCount({ slotCount: 12 }, modules, slotSpan), 12);
  assert.equal(baseSlotCount({}, modules, slotSpan), 4);
});
