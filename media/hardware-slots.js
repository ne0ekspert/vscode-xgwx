export function baseSlotCount(base, modules, slotSpan) {
  if (Number.isInteger(base?.slotCount) && base.slotCount >= 0) return base.slotCount;
  return modules.reduce((count, module) => {
    if (!Number.isInteger(module.slot)) return count;
    return Math.max(count, module.slot + slotSpan(module));
  }, 0);
}

export function moduleAtPhysicalSlot(modules, slot, slotSpan) {
  if (!Number.isInteger(slot)) return null;
  return modules.find((module) => Number.isInteger(module.slot)
    && slot >= module.slot
    && slot < module.slot + slotSpan(module)) || null;
}

export function hardwareSlotRows(base, slotCount, modules, slotSpan) {
  return Array.from({ length: slotCount }, (_, slot) => {
    const module = moduleAtPhysicalSlot(modules, slot, slotSpan);
    const kind = !module ? "empty" : module.slot === slot ? "module" : "continuation";
    return { base, slot, module, kind };
  });
}

export function occupiedSlotCount(modules, slotCount, slotSpan) {
  return hardwareSlotRows(null, slotCount, modules, slotSpan).filter((row) => row.module).length;
}
