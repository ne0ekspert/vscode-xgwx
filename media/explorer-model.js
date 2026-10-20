import { taskKey, editableTask, taskProgramCreation, taskSchedule } from "./tasks.js";
import { baseRecordIndex, installedBaseModules } from "./hardware-slots.js";
// I/O records are represented by Hardware rather than duplicated in Parameters.
export function visibleParameterSections(parameters = []) {
  return parameters.map((parameter, index) => ({...parameter, parameterIndex: parameter.parameterIndex ?? index}))
    .filter(parameter => parameter.parameterType !== "IO PARAMETER");
}
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
  const programNode = (program, index) => ({...leaf(`program:${program.objectId || index}`, program.name || `Program ${index+1}`, "code", {view:"programs",programIndex:index,objectId:program.objectId},program.objectId?"xgwxProgram":undefined),
    passwordProtected:Boolean(summary.passwordProtection?.programs?.[index]?.protected),locked:Boolean(summary.passwordProtection?.programs?.[index]?.locked)});
  const assigned=new Set();
  const taskNodes=(summary.tasks || []).map(task=>{
    const children=task.programIndices.filter(index=>summary.programs?.[index]).map(index=>{assigned.add(index);return programNode(summary.programs[index],index);});
    const kind=editableTask(task)?(children.length?'user':'empty'):task.definition.kind===0?'scan':'readonly';
    const context=kind==='readonly'?'xgwxTask.readonly':`xgwxTask.${kind}.${taskProgramCreation(summary,task)?'programs':'noPrograms'}`;
    return group(taskKey(task),`${task.definition.name || 'Unnamed task'} · ${taskSchedule(task)}`,task.definition.kind===0?'sync':'clock',children,
      {view:"tasks",taskKey:taskKey(task)},context);
  });
  const programChildren=taskNodes.length?[...taskNodes,...(summary.programs || []).flatMap((p,i)=>assigned.has(i)?[]:[programNode(p,i)])]:(summary.programs || []).map(programNode);
  const nodes = [
    leaf("overview", "Workspace", "settings-gear", { view: "overview" }),
    group("hardware", "Hardware", "circuit-board", bases.map(({ base, index }) =>
      leaf(`base:${baseRecordIndex(base, index)}`, `Base ${base.base}${(hardware.bases || []).some(other => other !== base && other.base === base.base) ? ` · PLC ${base.configurationIndex ?? "unassigned"}` : ""} (${installedBaseModules(base, hardware).length})`, "server", { view: "hardware", base: base.base, baseIndex: baseRecordIndex(base, index) })), { view: "hardware" }),
    group("programs", `Programs (${summary.programs?.length || 0})`, "code",programChildren,
      {view:taskNodes.length?"tasks":"programs"},(summary.tasks || []).some(t=>t.creationSupported && t.expected)?"xgwxPrograms.tasks":summary.programLanguages?.length?"xgwxPrograms":undefined),
    group("userPous", `Functions and FBs (${summary.userPous?.length || 0})`, "symbol-method", (summary.userPous || []).map(pou =>
      leaf(`pou:${pou.objectId || pou.index}`, pou.name, pou.kind === "functionBlock" ? "symbol-class" : "symbol-method", { view: "userPous", objectId: pou.objectId })), { view: "userPous" }),
    group("networks", `Networks (${summary.networks?.length || 0})`, "git-branch", (summary.networks || []).map((network, index) =>
      group(`network:${index}`, network.name || `Network ${index + 1}`, "git-branch", (network.modules || []).map(module => {
        const key = `${module.base}:${module.slot}:${module.id}`;
        const name = module.name?.replace(/@0x[0-9a-f]+$/i, "") || `Module ${module.slot}`;
        return leaf(`network:${index}:${key}`, `${name} (Base ${module.base}, Slot ${module.slot})`, "git-branch", { view: "networks", networkIndex: index, networkModuleKey: key });
      }), { view: "networks", networkIndex: index })), { view: "networks" }),
    leaf("variables", `Variables (${summary.counts?.variables || 0})`, "symbol-variable", { view: "variables" }),
    leaf("parameters", `Parameters (${visibleParameterSections(summary.parameters).length})`, "settings", { view: "parameters" }),
  ];
  if ((summary.configurations || []).length > 1) {
    const configurations = summary.configurations;
    nodes.splice(1, 0, group("configurations", `PLCs (${configurations.length})`, "server", configurations.map(plc =>
      leaf(`configuration:${plc.configurationIndex}`, `${plc.name || "PLC"} (${plc.configurationIndex + 1}) · ${plc.cpu?.model || "Unknown CPU"}`, "settings-gear", {view:"overview",configurationIndex:plc.configurationIndex})), {view:"overview"}));
    const hardwareNode = nodes.find(node => node.id === "hardware");
    const baseNodes = hardwareNode.children;
    hardwareNode.children = configurations.map(plc => group(`hardware:plc:${plc.configurationIndex}`, `${plc.name || "PLC"} (${plc.configurationIndex + 1})`, "server",
      baseNodes.filter(node => (hardware.bases || []).find((base,index) => baseRecordIndex(base,index) === node.target.baseIndex)?.configurationIndex === plc.configurationIndex)));
    const unownedBases = baseNodes.filter(node => (hardware.bases || []).find((base,index) => baseRecordIndex(base,index) === node.target.baseIndex)?.configurationIndex == null);
    if (unownedBases.length) hardwareNode.children.push(group("hardware:unowned", "Unassigned", "question", unownedBases));
    const programsNode = nodes.find(node => node.id === "programs");
    programsNode.contextValue = (summary.tasks || []).some(task => task.creationSupported && task.expected) ? "xgwxPrograms.tasks" : undefined;
    programsNode.children = configurations.map(plc => group(`programs:plc:${plc.configurationIndex}`, `${plc.name || "PLC"} (${plc.configurationIndex + 1})`, "code", [
      ...taskNodes.filter((_,index) => summary.tasks[index].configurationIndex === plc.configurationIndex),
      ...(summary.programs || []).flatMap((program,index) => program.configurationIndex === plc.configurationIndex && !assigned.has(index) ? [programNode(program,index)] : []),
    ]));
    const unownedPrograms = (summary.programs || []).flatMap((program,index) => program.configurationIndex == null && !assigned.has(index) ? [programNode(program,index)] : []);
    const unownedTasks = taskNodes.filter((_,index) => summary.tasks[index].configurationIndex == null);
    if (unownedPrograms.length || unownedTasks.length) programsNode.children.push(group("programs:unowned", "Unassigned", "question", [...unownedTasks,...unownedPrograms]));
  }
  const selectedId = selection.view === "tasks" ? selection.taskKey || "programs" : selection.view === "hardware" ? `base:${selection.baseIndex ?? (hardware.bases || []).findIndex(base => base.base === selection.base)}`
    : selection.view === "programs" && summary.programs?.[selection.programIndex] ? `program:${summary.programs[selection.programIndex].objectId || selection.programIndex}`
    : selection.view === "userPous" && selection.userPouId ? `pou:${selection.userPouId}`
    : selection.view === "networks" ? `network:${selection.networkIndex}${selection.networkModuleKey ? `:${selection.networkModuleKey}` : ""}` : selection.view === "overview" && summary.configurations?.length > 1 ? `configuration:${selection.configurationIndex ?? 0}` : selection.view;
  return { uri: file.uri, fileName: file.fileName, projectProtected: Boolean(summary.passwordProtection?.projectProtected), nodes, selectedId };
}
