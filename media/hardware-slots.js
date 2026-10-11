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

// Base record identity is distinct from its PLC-local native base number.
export function baseRecordIndex(base, index) {
  return base.baseIndex ?? index;
}

export function installedBaseModules(base, hardware) {
  if (Array.isArray(base?.modules)) {
    // Multiple network memberships can point at the same installed hardware.
    const installed = base.modules.flatMap(module => module.hardware ? [module.hardware] : []);
    return [...new Map(installed.map(module => [JSON.stringify(module), module])).values()];
  }
  return (hardware.modules || []).filter(module => module.base === base?.base);
}
