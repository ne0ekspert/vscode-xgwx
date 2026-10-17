import { baseRecordIndex, installedBaseModules } from "./hardware-slots.js";
// Only navigation metadata crosses into the extension host; workspace bytes stay in the editor.
export function explorerNodes(file, summary, selection, cpuCatalog = []) {
  const leaf = (id, label, icon, target, contextValue) => ({ id, label, icon, target, contextValue });
  const group = (id, label, icon, children, target, contextValue) => ({ ...leaf(id, label, icon, target, contextValue), children });
  const hardware = summary.hardware || {};
  const cpu = cpuCatalog.find(entry => entry.typeCode === summary.cpu?.typeCode);
  // The native file keeps unused base records beyond the CPU's physical limit.
  // Only apply the primary CPU's local rack limit to a single-PLC project.
  const maxBase = summary.counts?.configurations === 1
    && ["XGK", "XGI", "XGB"].includes(cpu?.family) ? cpu.maxBase : null;
  const bases = (hardware.bases || []).map((base, index) => ({ base, index }))
    .filter(({ base }) => !Number.isInteger(maxBase) || !Number.isInteger(base.base)
      || base.base < maxBase || installedBaseModules(base, hardware).length > 0);
  const nodes = [
    leaf("overview", "Workspace", "settings-gear", { view: "overview" }),
    group("hardware", "Hardware", "circuit-board", bases.map(({ base, index }) =>
      leaf(`base:${baseRecordIndex(base, index)}`, `Base ${base.base}${(hardware.bases || []).some(other => other !== base && other.base === base.base) ? ` · PLC ${base.configurationIndex ?? "unassigned"}` : ""} (${installedBaseModules(base, hardware).length})`, "server", { view: "hardware", base: base.base, baseIndex: baseRecordIndex(base, index) })), { view: "hardware" }),
    group("programs", `Programs (${summary.programs?.length || 0})`, "code", (summary.programs || []).map((program, index) =>
      leaf(`program:${program.objectId || index}`, program.name || `Program ${index + 1}`, "code", { view: "programs", programIndex: index, objectId: program.objectId }, program.objectId ? "xgwxProgram" : undefined)), { view: "programs" }, summary.programLanguages?.length ? "xgwxPrograms" : undefined),
    group("userPous", `Functions and FBs (${summary.userPous?.length || 0})`, "symbol-method", (summary.userPous || []).map(pou =>
      leaf(`pou:${pou.objectId || pou.index}`, pou.name, pou.kind === "functionBlock" ? "symbol-class" : "symbol-method", { view: "userPous", objectId: pou.objectId })), { view: "userPous" }),
    group("networks", `Networks (${summary.networks?.length || 0})`, "git-branch", (summary.networks || []).map((network, index) =>
      group(`network:${index}`, network.name || `Network ${index + 1}`, "git-branch", (network.modules || []).map(module => {
        const key = `${module.base}:${module.slot}:${module.id}`;
        const name = module.name?.replace(/@0x[0-9a-f]+$/i, "") || `Module ${module.slot}`;
        return leaf(`network:${index}:${key}`, `${name} (Base ${module.base}, Slot ${module.slot})`, "git-branch", { view: "networks", networkIndex: index, networkModuleKey: key });
      }), { view: "networks", networkIndex: index })), { view: "networks" }),
    leaf("variables", `Variables (${summary.counts?.variables || 0})`, "symbol-variable", { view: "variables" }),
    leaf("parameters", `Parameters (${summary.parameters?.length || 0})`, "settings", { view: "parameters" }),
  ];
  const selectedId = selection.view === "hardware" ? `base:${selection.baseIndex ?? (hardware.bases || []).findIndex(base => base.base === selection.base)}`
    : selection.view === "programs" && summary.programs?.[selection.programIndex] ? `program:${summary.programs[selection.programIndex].objectId || selection.programIndex}`
    : selection.view === "userPous" && selection.userPouId ? `pou:${selection.userPouId}`
    : selection.view === "networks" ? `network:${selection.networkIndex}${selection.networkModuleKey ? `:${selection.networkModuleKey}` : ""}` : selection.view;
  return { uri: file.uri, fileName: file.fileName, nodes, selectedId };
}
