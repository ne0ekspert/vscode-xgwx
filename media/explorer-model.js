// Only navigation metadata crosses into the extension host; workspace bytes stay in the editor.
export function explorerNodes(file, summary, selection) {
  const leaf = (id, label, icon, target, contextValue) => ({ id, label, icon, target, contextValue });
  const group = (id, label, icon, children, target, contextValue) => ({ ...leaf(id, label, icon, target, contextValue), children });
  const hardware = summary.hardware || {};
  const nodes = [
    leaf("overview", "Workspace", "settings-gear", { view: "overview" }),
    group("hardware", "Hardware", "circuit-board", (hardware.bases || []).map(base =>
      leaf(`base:${base.base}`, `Base ${base.base} (${(hardware.modules || []).filter(module => module.base === base.base).length})`, "server", { view: "hardware", base: base.base })), { view: "hardware" }),
    group("programs", `Programs (${summary.programs?.length || 0})`, "code", (summary.programs || []).map((program, index) =>
      leaf(`program:${program.objectId || index}`, program.name || `Program ${index + 1}`, "code", { view: "programs", programIndex: index, objectId: program.objectId }, program.objectId ? "xgwxProgram" : undefined)), { view: "programs" }, summary.programLanguages?.length ? "xgwxPrograms" : undefined),
    group("networks", `Networks (${summary.networks?.length || 0})`, "git-branch", (summary.networks || []).map((network, index) =>
      group(`network:${index}`, network.name || `Network ${index + 1}`, "git-branch", (network.modules || []).map(module => {
        const key = `${module.base}:${module.slot}:${module.id}`;
        const name = module.name?.replace(/@0x[0-9a-f]+$/i, "") || `Module ${module.slot}`;
        return leaf(`network:${index}:${key}`, `${name} (Base ${module.base}, Slot ${module.slot})`, "git-branch", { view: "networks", networkIndex: index, networkModuleKey: key });
      }), { view: "networks", networkIndex: index })), { view: "networks" }),
    leaf("variables", `Variables (${summary.counts?.variables || 0})`, "symbol-variable", { view: "variables" }),
    leaf("parameters", `Parameters (${summary.parameters?.length || 0})`, "settings", { view: "parameters" }),
  ];
  const selectedId = selection.view === "hardware" ? `base:${selection.base}`
    : selection.view === "programs" && summary.programs?.[selection.programIndex] ? `program:${summary.programs[selection.programIndex].objectId || selection.programIndex}`
    : selection.view === "networks" ? `network:${selection.networkIndex}${selection.networkModuleKey ? `:${selection.networkModuleKey}` : ""}` : selection.view;
  return { uri: file.uri, fileName: file.fileName, nodes, selectedId };
}
