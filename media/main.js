import { renderSfcDiagram, renderSfcProperties, renderSfcVariables, sfcRowsAfterEdit, sfcTextField } from "./sfc.js";
import { moveIecCursor, iecCursorRecord } from "./iec-navigation.js";
import { validatedEditCache } from "./validated-edit-cache.js";
import { canWireIecOutput, iecOutputWireAt } from "./iec-output-wire.js";
import { isLadderDeleteKey } from "./ladder-delete.js";
import { attachGrowingCanvas, xgkCanvasRowValues } from "./ladder-canvas.js";
import { elementCommands, iecPinRule, scalarIecCommands, xgkInputCommands, nativeInstructionParts, instructionOperandText, xgkBlankCommands, xgkInsertionColumn } from "./ladder-commands.js";
import init, {
  edit_xgwx_sfc_entity,
  replace_xgwx_sfc_sequence,
  edit_xgwx_sfc_variable,
  preview_xgwx_io_variables,
  generate_xgwx_io_variables,
  cpu_catalog,
  copy_xgwx_iec_ld_group,
  copy_xgwx_iec_ld_group_to_program_with_locals,
  duplicate_xgwx_iec_ld_function_instance,
  delete_xgwx_ladder_rung_comment,
  delete_xgwx_ladder_comparison,
  delete_xgwx_ladder_instruction,
  delete_xgwx_iec_ld_blank_row,
  delete_xgwx_iec_ld_branch_top_row,
  delete_xgwx_iec_ld_nested_contact_branch_row,
  delete_xgwx_iec_ld_chained_contact_branch_row,
  delete_xgwx_iec_ld_empty_branch_row,
  delete_xgwx_iec_ld_ff_branch_output_row,
  delete_xgwx_iec_ld_contact,
  delete_xgwx_iec_ld_contact_cell,
  delete_xgwx_iec_ld_connected_arithmetic,
  delete_xgwx_iec_ld_branched_arithmetic,
  delete_xgwx_iec_ld_branch_function,
  replace_xgwx_iec_ld_branch_function,
  delete_xgwx_iec_ld_eq_chain_head,
  delete_xgwx_iec_ld_heating_chain_head,
  delete_xgwx_iec_ld_heating_chain_middle,
  delete_xgwx_iec_ld_heating_chain_x3_eq_repaired,
  delete_xgwx_iec_ld_heating_chain_contact_eq,
  delete_xgwx_iec_ld_heating_chain_x15_eq,
  delete_xgwx_iec_ld_function_cell,
  delete_xgwx_iec_ld_group,
  delete_xgwx_iec_ld_rung,
  delete_xgwx_iec_ld_terminal_coil,
  delete_xgwx_iec_ld_simple_row,
  delete_xgwx_iec_ld_standalone_function,
  delete_xgwx_iec_ld_terminal_function,
  delete_xgwx_iec_ld_scalar_chain_function,
  replace_xgwx_iec_ld_scalar_chain_function,
  delete_xgwx_iec_local_symbol,
  delete_xgwx_module,
  edit_xgwx_iec_ld_branch_segment,
  edit_xgwx_iec_ld_vertical_wire,
  connect_xgwx_iec_ld_groups,
  extend_xgwx_iec_ld_vertical_wire,
  split_xgwx_iec_ld_group,
  edit_xgwx_ladder_cell,
  edit_xgwx_ladder_branch,
  delete_xgwx_ladder_horizontal_wire,
  delete_xgwx_ladder_vertical_wire,
  delete_xgwx_iec_ld_horizontal_wire_record,
  delete_xgwx_iec_ld_isolated_element,
  delete_xgwx_iec_ld_function_output_operand,
  assign_xgwx_iec_ld_function_output_operand,
  edit_xgwx_ladder_comment,
  insert_xgwx_iec_ld_contact,
  insert_xgwx_iec_ld_comment,
  insert_xgwx_iec_ld_short_wire_contact,
  insert_xgwx_iec_ld_leading_contact,
  insert_xgwx_iec_ld_function_output_wire,
  insert_xgwx_iec_ld_function_cell,
  insert_xgwx_iec_ld_terminal_move,
  insert_xgwx_iec_ld_terminal_timer,
  insert_xgwx_iec_ld_standalone_function,
  insert_xgwx_iec_ld_blank_row,
  insert_xgwx_iec_ld_parallel_contact_kind,
  insert_xgwx_iec_ld_rung,
  insert_xgwx_iec_ld_single_element,
  insert_xgwx_iec_ld_terminal_coil,
  insert_xgwx_iec_local_symbol,
  insert_xgwx_ladder_row,
  insert_xgwx_ladder_instruction,
  insert_xgwx_ladder_comparison,
  insert_xgwx_iec_ld_function,
  insert_xgwx_module,
  move_xgwx_iec_ld_group,
  parse_xgwx,
  rename_xgwx_iec_local_symbol,
  repair_xgwx_iec_ld_horizontal_wire,
  replace_xgwx_iec_ld_group,
  replace_xgwx_iec_ld_group_from_program,
  delete_xgwx_iec_ld_horizontal_wire,
  select_xgwx_cpu,
  select_xgwx_module,
  set_xgwx_module_option,
  set_xgwx_base_slot_count,
  update_xgwx_ladder_cell,
  update_xgwx_iec_ld_comment,
  update_xgwx_iec_ld_coil_kind,
  update_xgwx_iec_ld_arithmetic_function,
  update_xgwx_iec_ld_contact_kind,
  update_xgwx_iec_ld_comparison_function,
  update_xgwx_iec_ld_element_operand,
  update_xgwx_iec_ld_function_operand,
  update_xgwx_iec_local_symbol_address,
  update_xgwx_iec_local_symbol_description,
  update_xgwx_iec_local_symbol_type,
  update_xgwx_module,
  update_xgwx_network,
  update_xgwx_network_module,
  edit_xgwx_fenet_field,
  edit_xgwx_cnet_settings,
  update_xgwx_program,
  update_xgwx_variable,
  xgk_module_catalog,
  xgwx_module_option_values,
} from "./libxgwx.js";
import {
  baseSlotCount,
  hardwareSlotRows,
  moduleAtPhysicalSlot,
  occupiedSlotCount,
} from "./hardware-slots.js";
import {
  ladderPositionKey,
  ladderSelectionKeys,
  moveLadderCursor,
} from "./ladder-selection.js";
import {
  captureLadderSelection,
  planLadderPaste,
} from "./ladder-clipboard.js";
import { groupModuleOptions } from "./module-option-groups.js";
import { buildVariableEdit, variableAddressConflict } from "./variable-edit.js";
import { iecGapOffsets } from "./iec-layout-positions.js";
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
} from "./ladder-elements.js";

const vscode = acquireVsCodeApi();
const app = document.querySelector("#app");
const wasmReady = init();
const ladderCanvasExtents = new Map();
const ladderCanvasScroll = new Map();
const canvasExtentKey = () => `${current.file.uri}:${selectedProgramIndex}`;
const LD_COLUMN_COUNT = 10;
const LD_VIEW_WIDTH = 900;
const LD_LEFT_RAIL = 34;
const LD_RIGHT_RAIL = 770;
const LD_ROW_HEIGHT = 76;
const LD_FIRST_ROW_Y = 58;
const IEC_PRIMITIVE_TYPE_NAMES = ["BOOL", "BYTE", "WORD", "DWORD", "LWORD", "SINT", "INT", "DINT", "LINT", "USINT", "UINT", "UDINT", "ULINT", "REAL", "LREAL", "TIME", "DATE", "TIME_OF_DAY", "DATE_AND_TIME"];
const IEC_CONTACT_KIND_BY_SOURCE_LABEL = new Map(
  IEC_ADDRESSED_CONTACT_CHOICES.map(([value, , sourceLabel]) => [sourceLabel, value]),
);
const IEC_COIL_GLYPH_BY_SOURCE_LABEL = new Map([
  ["Output coil variable", "( )"],
  ["Inverse output coil variable", "(/)"],
  ["Set coil variable", "(S)"],
  ["Reset coil variable", "(R)"],
  ["Rising-edge coil variable", "(P)"],
  ["Falling-edge coil variable", "(N)"],
]);
const IEC_COIL_KIND_CHOICES = [
  ["OUTPUT", "Output"], ["INVERSE", "Inverse output"], ["SET", "Set"],
  ["RESET", "Reset"], ["RISING", "Rising edge"], ["FALLING", "Falling edge"],
];
const IEC_COIL_KIND_BY_SOURCE_LABEL = new Map([
  "Output", "Inverse output", "Set", "Reset", "Rising-edge", "Falling-edge",
].map((label, index) => [`${label} coil variable`, IEC_COIL_KIND_CHOICES[index][0]]));

let current = null;
let moduleCatalog = [];
let cpuCatalog = [];
let activeView = "overview";
let selectedBase = null;
let selectedModule = null;
let selectedHardwareSlot = null;
let selectedProgramIndex = 0;
let selectedSfcEntity = null;
let selectedCellOffset = null;
let selectedBlankCell = null;
let selectedLadderAnchor = null;
let selectedLadderFocus = null;
let selectedLadderComment = null;
let selectedVariableIndex = 0;
let selectedNetworkIndex = 0;
let selectedNetworkModuleKey = null;
let dirty = false;
let dismissLadderOverlay = null;
let ladderClipboard = null;
let iecClipboard = null;
let selectedIecRow = null;
let selectedIecElement = null;
let selectedIecInsertion = null;
let selectedIecBlank = null;
let nextContactPromptId = 0;
const pendingContactPrompts = new Map();

window.addEventListener("message", async ({ data }) => {
  if (data?.type === "validateLadderInstruction") {
    let error;
    try {
      const pending = pendingContactPrompts.get(data.requestId);
      if (!pending?.validate) throw new Error("Instruction editor is no longer active");
      pending.validate(data.value);
    } catch (failure) { error = String(failure); }
    vscode.postMessage({ type: "ladderInstructionValidationResult", validationId: data.validationId, error: error || null });
    return;
  }
  if (data?.type === "iecContactInputResult") {
    const pending = pendingContactPrompts.get(data.requestId);
    if (pending) {
      pendingContactPrompts.delete(data.requestId);
      pending.resolve(data.value);
      if (pending.restoreFocus !== false) requestAnimationFrame(() => {
        if (current?.file.uri !== pending.fileUri
          || selectedProgramIndex !== pending.programIndex) return;
        document.querySelector(pending.focusSelector)?.focus({ preventScroll: true });
      });
    }
  }
  if (data?.type === "load") await loadWorkspace(data);
  if (data?.type === "error") renderError(data.message);
  if (data?.type === "saved" || data?.type === "reverted") {
    dirty = Boolean(data.dirty);
    if (current && data.type === "reverted") {
      renderWorkspace();
    } else if (current) {
      // A save acknowledgment changes status, not the diagram. Rebuilding it
      // would discard keyboard focus and unfinished inspector input.
      const state = app.querySelector(".edit-state");
      if (state) {
        state.textContent = dirty ? "Unsaved changes" : "Saved";
        state.classList.toggle("dirty", dirty);
      }
      const save = app.querySelector('button[aria-label="Save workspace"]');
      if (save) save.disabled = !dirty;
      app.querySelector(".status-bar")?.replaceWith(renderStatusBar(current.summary));
    }
  }
  if (data?.type === "requestRefresh") vscode.postMessage({ type: "refresh" });
});

vscode.postMessage({ type: "ready" });

async function loadWorkspace(file) {
  const viewport = app.querySelector(".iec-layout-viewport, .ld-viewport, .sfc-viewport");
  if (current && viewport && activeView === "programs") ladderCanvasScroll.set(canvasExtentKey(), {
    top: viewport.scrollTop, left: viewport.scrollLeft,
    editorTop: app.querySelector(".editor-canvas")?.scrollTop ?? 0,
  });
  renderLoading(`Parsing ${file.fileName}…`);
  try {
    if (current?.file.uri !== file.uri) {
      iecClipboard = null;
      selectedIecRow = null;
      selectedIecElement = null;
      selectedIecInsertion = null;
      selectedIecBlank = null;
      selectedSfcEntity = null;
    }
    await wasmReady;
    if (!moduleCatalog.length) moduleCatalog = xgk_module_catalog();
    if (!cpuCatalog.length) cpuCatalog = cpu_catalog();
    const summary = parse_xgwx(new Uint8Array(file.bytes));
    current = { file: { ...file, bytes: new Uint8Array(file.bytes) }, summary };
    dirty = Boolean(file.dirty);
    const modules = summary.hardware?.modules || [];
    const bases = summary.hardware?.bases || [];
    if (activeView === "hardware" && !bases.some((base) => base.base === selectedBase)) {
      selectedBase = bases[0]?.base ?? null;
      if (selectedBase === null) activeView = "overview";
    }
    selectedModule = modules.find((module) => module.inputFilter) || modules[0] || null;
    selectedHardwareSlot = selectedModule?.slot ?? null;
    renderWorkspace();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    renderError(message);
    vscode.postMessage({ type: "showError", message });
  }
}

function renderWorkspace() {
  closeLadderOverlay();
  const { file, summary } = current;
  const oldShell = app.querySelector(".editor-shell");
  const sameProgram = activeView === "programs" && oldShell?.dataset.view === activeView
    && oldShell.dataset.programIndex === String(selectedProgramIndex);
  const oldLayout = sameProgram ? app.querySelector(".iec-layout-viewport, .ld-viewport, .sfc-viewport") : null;
  const scroll = oldLayout ? { top: oldLayout.scrollTop, left: oldLayout.scrollLeft,
    editorTop: app.querySelector(".editor-canvas")?.scrollTop ?? 0 }
    : activeView === "programs" ? ladderCanvasScroll.get(canvasExtentKey()) : null;
  app.replaceChildren();

  const shell = element("div", "editor-shell");
  shell.dataset.view = activeView;
  shell.dataset.programIndex = String(selectedProgramIndex);
  shell.append(
    renderCommandBar(file, summary),
    renderWorkbench(file, summary),
    renderStatusBar(summary),
  );
  app.append(shell);
  const layout = scroll && shell.querySelector(".iec-layout-viewport, .ld-viewport, .sfc-viewport");
  if (layout) {
    layout.scrollTop = scroll.top;
    layout.scrollLeft = scroll.left;
    const editor = shell.querySelector(".editor-canvas");
    if (editor) editor.scrollTop = scroll.editorTop;
  }
}

function renderCommandBar(file, summary) {
  const bar = element("header", "command-bar");
  const identity = element("div", "file-identity");
  identity.append(icon("file"), element("span", "file-name", file.fileName));

  const context = element("div", "command-context");
  context.append(
    element("span", "project-name", display(summary.project?.name, "Unnamed project")),
    element("span", "context-separator", "/"),
    element("span", "view-name", viewTitle()),
  );

  const actions = element("div", "command-actions");
  const save = button("Save workspace", "text-button", () => vscode.postMessage({ type: "save" }));
  save.append(icon("save"), element("span", "", "Save"));
  save.disabled = !dirty;
  const refresh = button("Refresh workspace", "icon-button", () => vscode.postMessage({ type: "refresh" }));
  refresh.append(icon("refresh"));
  actions.append(element("span", `edit-state${dirty ? " dirty" : ""}`, dirty ? "Unsaved changes" : "Saved"), save, refresh);
  bar.append(identity, context, actions);
  return bar;
}

function renderWorkbench(file, summary) {
  const workbench = element("div", "workbench");
  const explorer = renderExplorer(file, summary);
  const editor = element("main", "editor-pane");
  const inspector = element("aside", "inspector-pane");

  renderEditor(editor, summary, inspector);
  workbench.append(explorer, editor, inspector);
  return workbench;
}

function renderExplorer(file, summary) {
  const explorer = element("aside", "explorer-pane");
  const heading = element("div", "pane-heading");
  heading.append(element("span", "", "EXPLORER"), element("span", "pane-actions", "•••"));

  const tree = element("div", "project-tree");
  const root = treeRow(file.fileName, "file", false, true);
  root.classList.add("root-row");
  tree.append(root);

  tree.append(treeItem("Workspace", "overview", icon("settings"), activeView === "overview"));

  const hardwareGroup = treeGroup("Hardware", icon("hardware"), true);
  const bases = summary.hardware?.bases || [];
  const modules = summary.hardware?.modules || [];
  bases.forEach((base) => {
    const count = modules.filter((module) => module.base === base.base).length;
    const item = treeItem(`Base ${display(base.base)} (${count})`, "hardware", icon("rack"), activeView === "hardware" && selectedBase === base.base);
    item.dataset.base = String(base.base);
    item.addEventListener("click", () => {
      if (selectedBase !== base.base) {
        selectedModule = null;
        selectedHardwareSlot = null;
      }
      selectedBase = base.base;
      selectView("hardware");
    });
    hardwareGroup.children.append(item);
  });
  tree.append(hardwareGroup.container);

  tree.append(buildProgramGroup(summary.programs || []));
  tree.append(buildNetworkGroup(summary.networks || []));
  tree.append(treeItem(`Variables (${display(summary.counts?.variables, "0")})`, "variables", icon("symbol"), activeView === "variables"));
  tree.append(treeItem(`Parameters (${summary.parameters?.length || 0})`, "parameters", icon("sliders"), activeView === "parameters"));

  explorer.append(heading, tree);
  return explorer;
}

function buildDataGroup(label, view, items, iconName, itemLabel) {
  const group = treeGroup(`${label} (${items.length})`, icon(iconName), true);
  group.header.addEventListener("click", () => selectView(view));
  items.slice(0, 30).forEach((item, index) => {
    const row = treeRow(itemLabel(item, index), iconName, true, false);
    row.addEventListener("click", () => selectView(view));
    group.children.append(row);
  });
  return group.container;
}

function buildProgramGroup(programs) {
  const group = treeGroup(`Programs (${programs.length})`, icon("program"), true);
  group.header.addEventListener("click", () => selectView("programs"));
  programs.slice(0, 30).forEach((program, index) => {
    const row = treeRow(program.name || `Program ${index + 1}`, "program", true, false);
    row.classList.toggle("selected", activeView === "programs" && selectedProgramIndex === index);
    row.addEventListener("click", () => {
      selectedProgramIndex = index;
      selectedIecRow = null;
      selectedIecElement = null;
      selectedIecInsertion = null;
      selectedIecBlank = null;
      resetLadderSelection();
      selectView("programs");
    });
    group.children.append(row);
  });
  return group.container;
}

function networkModuleKey(module) {
  return `${module.base}:${module.slot}:${module.id}`;
}

function networkModuleLabel(module) {
  const name = module.name?.replace(/@0x[0-9a-f]+$/i, "") || `Module ${module.slot}`;
  return `${name} (Base ${module.base}, Slot ${module.slot})`;
}

function buildNetworkGroup(networks) {
  const group = treeGroup(`Networks (${networks.length})`, icon("network"), true);
  group.header.addEventListener("click", () => selectView("networks"));
  networks.slice(0, 30).forEach((network, index) => {
    const networkRow = treeRow(network.name || `Network ${index + 1}`, "network", true, false);
    networkRow.classList.toggle("selected", activeView === "networks" && selectedNetworkIndex === index && !selectedNetworkModuleKey);
    networkRow.addEventListener("click", () => {
      selectedNetworkIndex = index;
      selectedNetworkModuleKey = null;
      selectView("networks");
    });
    group.children.append(networkRow);

    (network.modules || []).slice(0, 30).forEach((module) => {
      const moduleRow = treeRow(networkModuleLabel(module), "network", true, false);
      moduleRow.classList.add("network-module-row");
      moduleRow.classList.toggle(
        "selected",
        activeView === "networks" && selectedNetworkIndex === index && selectedNetworkModuleKey === networkModuleKey(module),
      );
      moduleRow.addEventListener("click", () => {
        selectedNetworkIndex = index;
        selectedNetworkModuleKey = networkModuleKey(module);
        selectView("networks");
      });
      group.children.append(moduleRow);
    });
  });
  return group.container;
}

function treeGroup(label, glyph, expanded) {
  const container = element("div", "tree-group");
  const header = element("button", "tree-row tree-group-row");
  header.type = "button";
  const disclosure = icon("chevron");
  if (expanded) disclosure.classList.add("expanded");
  header.append(disclosure, glyph, element("span", "tree-label", label));
  const children = element("div", `tree-children${expanded ? " expanded" : ""}`);
  header.addEventListener("click", () => {
    disclosure.classList.toggle("expanded");
    children.classList.toggle("expanded");
  });
  container.append(header, children);
  return { container, header, children };
}

function treeItem(label, view, glyph, selected) {
  const row = element("button", `tree-row tree-item${selected ? " selected" : ""}`);
  row.type = "button";
  row.append(element("span", "tree-spacer"), glyph, element("span", "tree-label", label));
  row.addEventListener("click", () => {
    selectView(view);
  });
  return row;
}

function treeRow(label, iconName, nested, expanded) {
  const row = element("div", `tree-row${nested ? " nested" : ""}`);
  const disclosure = icon("chevron");
  if (expanded) disclosure.classList.add("expanded");
  row.append(disclosure, icon(iconName), element("span", "tree-label", label));
  return row;
}

function selectView(view) {
  activeView = view;
  renderWorkspace();
}

function renderEditor(editor, summary, inspector) {
  const tabs = element("div", "editor-tabs");
  const tab = element("div", "editor-tab active");
  tab.append(icon(viewIcon()), element("span", "", viewTitle()));
  tabs.append(tab);

  const canvas = element("section", "editor-canvas");
  if (activeView === "hardware") renderHardwareEditor(canvas, inspector, summary.hardware || {});
  if (activeView === "programs") renderProgramsEditor(canvas, inspector, summary.programs || []);
  if (activeView === "networks") renderNetworksEditor(canvas, inspector, summary);
  if (activeView === "variables") renderVariablesEditor(canvas, inspector, summary.variables || [], summary.localVariables || [], summary.programs || []);
  if (activeView === "parameters") renderParametersEditor(canvas, inspector, summary.parameters || []);
  if (activeView === "overview") renderOverviewEditor(canvas, inspector, summary, current.file);

  editor.append(tabs, canvas);
}

function showIoVariableGeneration(canvas) {
  const source = current.file.bytes;
  const uri = current.file.uri;
  const preview = element("section", "io-variable-preview");
  preview.append(element("h3", "", "Generate digital I/O variables"));
  preview.append(element("p", "muted", "Preview for all configured modules. Duplicate names, source mappings, and occupied addresses will be overwritten. Unrelated variables are preserved."));
  canvas.querySelector(".io-variable-preview")?.remove();
  let rows;
  try { rows = preview_xgwx_io_variables(source); }
  catch (error) {
    preview.append(element("p", "validation-summary invalid", String(error)));
    canvas.prepend(preview);return;
  }
  const counts = rows.reduce((counts,row) => {counts[row.action]++;return counts;}, {create:0,overwrite:0,unchanged:0});
  const summary = element("p", "validation-summary", `${counts.create} new · ${counts.overwrite} overwrite · ${counts.unchanged} unchanged`);
  summary.setAttribute("role", "status");preview.append(summary);
  const table = createTable(["Module", "Name", "Address", "Type", "Comment", "Action", "Existing variable"]);
  for (const row of rows) {
    const tr = table.tBodies[0].insertRow();
    tr.dataset.ioVariableAction = row.action;
    appendCells(tr, [`Base ${row.base} / Slot ${row.slot} · ${row.model}`, row.name, row.address,
      row.dataType, row.description, row.action, row.existingNames.join(", ")]);
  }
  preview.append(tableContainer(table, rows.length));
  const actions = element("div", "editor-toolbar");
  const apply = button("Generate and overwrite duplicates", "primary-button", async () => {
    if (current.file.uri !== uri || current.file.bytes !== source) {
      summary.textContent = "The workspace changed. Reopen the preview before generating variables.";
      summary.classList.add("invalid");apply.disabled = true;return;
    }
    await applyEdit(() => generate_xgwx_io_variables(source), "Generate digital I/O variables");
  });
  apply.textContent = counts.overwrite ? "Generate and overwrite duplicates" : "Generate variables";
  apply.disabled = !counts.create && !counts.overwrite;
  const cancel = button("Cancel I/O variable generation", "secondary-button", () => preview.remove());
  cancel.textContent = "Cancel";
  actions.append(apply, cancel);preview.append(actions);
  canvas.prepend(preview);preview.scrollIntoView({block:"start"});
}

function renderHardwareEditor(canvas, inspector, hardware) {
  const allModules = hardware.modules || [];
  const baseModules = allModules.filter((module) => module.base === selectedBase);
  const base = (hardware.bases || []).find((item) => item.base === selectedBase);
  const slotCount = baseSlotCount(base, baseModules, moduleSlotSpan);
  if (selectedHardwareSlot === null || selectedHardwareSlot < 0 || selectedHardwareSlot >= slotCount) {
    selectedHardwareSlot = slotCount > 0 ? 0 : null;
  }
  selectedModule = moduleAtPhysicalSlot(baseModules, selectedHardwareSlot, moduleSlotSpan);

  const toolbar = element("div", "editor-toolbar hardware-toolbar");
  const searchWrap = element("label", "filter-control");
  searchWrap.append(icon("search"));
  const search = document.createElement("input");
  search.type = "search";
  search.placeholder = "Filter modules…";
  search.setAttribute("aria-label", "Filter modules");
  searchWrap.append(search);
  const usedSlots = occupiedSlotCount(baseModules, slotCount, moduleSlotSpan);
  const scope = element("span", "toolbar-summary", `Base ${selectedBase} · ${usedSlots}/${slotCount} slots · ${baseModules.length} modules`);
  const generate = button("Generate I/O variables", "secondary-button", () => showIoVariableGeneration(canvas));
  generate.textContent = "Generate I/O variables";
  generate.disabled = !supportsXgkHardware();
  if (generate.disabled) generate.title = "Generation currently supports XGK global digital I/O variables.";
  toolbar.append(searchWrap, scope, generate);
  const baseError = element("p", "muted");
  baseError.setAttribute("role", "status");
  baseError.hidden = true;
  if (base && supportsXgkHardware()) {
    const targetBase = selectedBase;
    const countField = element("label", "filter-control base-slot-control");
    countField.append(element("span", "", "Slot count"));
    const countSelect = document.createElement("select");
    countSelect.setAttribute("aria-label", "Base slot count");
    const choices = [4, 6, 8, 10, 12];
    if (!choices.includes(base.slotCount)) choices.unshift(base.slotCount);
    for (const count of choices) {
      const option = element("option", "", String(count));
      option.value = String(count);
      countSelect.append(option);
    }
    countSelect.value = String(base.slotCount);
    const applyCount = button("Apply slot count", "primary-button", async () => {
      await applyEdit(
        () => set_xgwx_base_slot_count(current.file.bytes, targetBase, Number(countSelect.value)),
        `Set base ${targetBase} to ${countSelect.value} slots`,
      );
    });
    applyCount.textContent = "Apply slot count";
    const validateCount = () => {
      let error = "";
      try {
        set_xgwx_base_slot_count(current.file.bytes, targetBase, Number(countSelect.value));
      } catch (failure) { error = String(failure); }
      baseError.textContent = error;
      baseError.hidden = !error;
      applyCount.disabled = Boolean(error) || Number(countSelect.value) === base.slotCount;
    };
    countSelect.addEventListener("change", validateCount);
    countField.append(countSelect);
    toolbar.append(countField, applyCount);
    validateCount();
  }

  const tableHost = element("div", "editor-table-host");
  const renderRows = () => {
    const query = search.value.trim().toLocaleLowerCase();
    const rows = hardwareSlotRows(selectedBase, slotCount, baseModules, moduleSlotSpan);
    const visibleRows = query
      ? rows.filter((row) => row.module && moduleText(row.module).includes(query))
      : rows;
    const matchingModules = new Set(visibleRows.filter((row) => row.module).map((row) => row.module));
    scope.textContent = query
      ? `Base ${selectedBase} · ${matchingModules.size} matches · ${slotCount} slots`
      : `Base ${selectedBase} · ${usedSlots}/${slotCount} slots · ${baseModules.length} modules`;
    tableHost.replaceChildren(renderModuleTable(visibleRows, inspector));
  };
  search.addEventListener("input", renderRows);
  canvas.append(toolbar, baseError, tableHost);
  renderRows();
  renderModuleInspector(inspector, selectedModule, selectedHardwareSlot);
}

function renderModuleTable(slotRows, inspector) {
  if (!slotRows.length) return emptyState("No slots match this filter.");
  const wrap = element("div", "table-scroll");
  const table = createTable(["Base", "Slots", "Width", "ID", "Name", "Input filter", "Comment"]);
  table.setAttribute("aria-label", "Hardware modules. Double-click a row to select a module. Use Up and Down to navigate and Delete to remove a module.");
  slotRows.forEach((slotRow, index) => {
    const { module, slot } = slotRow;
    const row = table.tBodies[0].insertRow();
    row.className = [
      selectedHardwareSlot === slot ? "selected" : "",
      `module-slot-${slotRow.kind}`,
    ].filter(Boolean).join(" ");
    row.tabIndex = 0;
    row.setAttribute("aria-selected", String(selectedHardwareSlot === slot));
    row.dataset.moduleKey = `${slotRow.base}:${slot}`;
    appendCells(row, moduleSlotCells(slotRow));
    const select = () => {
      selectedModule = module;
      selectedHardwareSlot = slot;
      table.querySelectorAll("tbody tr").forEach((item) => {
        const selected = item === row;
        item.classList.toggle("selected", selected);
        item.setAttribute("aria-selected", String(selected));
      });
      renderModuleInspector(inspector, module, slot);
    };
    row.addEventListener("click", select);
    row.addEventListener("dblclick", () => {
      select();
      void pickHardwareModule(slotRow);
    });
    row.addEventListener("keydown", async (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        select();
        return;
      }
      if (event.key === "ArrowUp" || event.key === "ArrowDown") {
        event.preventDefault();
        const offset = event.key === "ArrowUp" ? -1 : 1;
        const targetIndex = Math.max(0, Math.min(slotRows.length - 1, index + offset));
        const targetRow = table.tBodies[0].rows[targetIndex];
        if (targetRow && targetRow !== row) {
          targetRow.click();
          targetRow.focus();
        }
        return;
      }
      if (event.key === "Delete" && !event.repeat) {
        event.preventDefault();
        if (!module || !supportsXgkHardware()) return;
        const selectedSlotKey = `${slotRow.base}:${slot}`;
        const previousSelection = selectedModule;
        selectedModule = null;
        const deleted = await applyEdit(
          () => delete_xgwx_module(current.file.bytes, module.base, module.slot),
          `Delete module at base ${module.base}, slot ${module.slot}`,
        );
        if (!deleted) {
          selectedModule = previousSelection;
        } else {
          document.querySelector(`tr[data-module-key="${selectedSlotKey}"]`)?.focus();
        }
      }
    });
  });
  wrap.append(table);
  return wrap;
}

let modulePromptOpen = false;

async function pickHardwareModule({ base, slot, module }) {
  if (modulePromptOpen || !supportsXgkHardware()) return;
  modulePromptOpen = true;
  const source = current.file.bytes, uri = current.file.uri;
  const targetSlot = module?.slot ?? slot;
  const entry = module && moduleCatalog.find(item => catalogEntryMatchesModule(item, module));
  try {
    const model = await new Promise(resolve => {
      const requestId = ++nextContactPromptId;
      pendingContactPrompts.set(requestId, { resolve, restoreFocus: false });
      vscode.postMessage({
        type: "promptModuleSelection", requestId,
        title: `${module ? "Replace" : "Insert"} module · Base ${base}, Slot ${targetSlot}`,
        items: moduleCatalog.map(item => ({
          label: item.model,
          description: `${item.category}${item === entry ? " · Current" : ""}`,
          detail: catalogModuleDescription(item),
          picked: item === entry,
        })),
      });
    });
    if (model === null) return;
    if (current?.file.uri !== uri || current.file.bytes !== source) {
      throw new Error("Hardware changed. Reopen the module picker.");
    }
    if (!moduleCatalog.some(item => item.model === model) || model === entry?.model) return;
    await applyEdit(
      () => module
        ? select_xgwx_module(source, base, targetSlot, model)
        : insert_xgwx_module(source, base, targetSlot, model),
      `${module ? "Select" : "Insert"} ${model} at base ${base}, slot ${targetSlot}`,
    );
  } catch (error) {
    vscode.postMessage({ type: "showError", message: String(error) });
  } finally {
    modulePromptOpen = false;
    if (current?.file.uri === uri && activeView === "hardware" && selectedBase === base) {
      document.querySelector(`tr[data-module-key="${base}:${slot}"]`)?.focus({ preventScroll: true });
    }
  }
}

function renderModuleInspector(inspector, module, physicalSlot = module?.slot ?? null) {
  inspector.replaceChildren();
  inspector.append(inspectorHeading("MODULE"));
  if (!module && physicalSlot === null) {
    inspector.append(emptyState("Select a module or empty slot to inspect it."));
    return;
  }

  const targetBase = module?.base ?? selectedBase;
  const targetSlot = module?.slot ?? physicalSlot;
  const editableHardware = supportsXgkHardware();
  const profile = current.summary.hardware?.cpuProfile;
  const builtin = module && profile && module.base === profile.builtinIoBase && module.slot === profile.builtinIoSlot;
  const currentEntry = module && editableHardware
    ? moduleCatalog.find((entry) => catalogEntryMatchesModule(entry, module))
    : null;
  const form = element("div", "property-grid");
  property(form, "Base", targetBase, true);
  if (module) {
    property(form, "Slots", moduleSlotRange(module), true);
    if (physicalSlot !== module.slot) property(form, "Selected slot", physicalSlot, true);
    property(form, "Slot width", moduleSlotSpan(module), true);
    property(form, "ID", module.id, true);
    property(form, "Subtype", module.subType, true);
    property(form, "Name", module.name, true, true);
    property(form, "Input Filter", module.inputFilter || "Not decoded", true);
    if (builtin) property(form, "Hardware", `${profile.variant} · Built-in I/O`, true, true);
    const comment = document.createElement("textarea");
    comment.value = module.comment || "";
    comment.setAttribute("aria-label", "Module comment");
    const commentField = element("label", "property-field");
    commentField.append(element("span", "property-label", "Comment"), comment);
    const saveComment = button("Apply module comment", "primary-button", async () => {
      await applyEdit(
        () => update_xgwx_module(current.file.bytes, targetBase, targetSlot, { comment: comment.value }),
        `Edit module comment at base ${targetBase}, slot ${targetSlot}`,
      );
    });
    saveComment.textContent = "Apply comment";
    saveComment.disabled = true;
    comment.addEventListener("input", () => { saveComment.disabled = comment.value === (module.comment || ""); });
    form.append(commentField, saveComment);
  } else {
    property(form, "Slot", physicalSlot, true);
    property(form, "State", "Empty", true);
  }

  const picker = element("section", "module-picker");
  picker.append(element("h3", "", "Module selection"));
  const selection = element("label", "property-field module-selection-field");
  selection.append(element("span", "property-label", "Model"));
  const select = document.createElement("select");
  select.setAttribute("aria-label", "Module model");
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = currentEntry ? "Choose replacement…" : "Choose module…";
  select.append(placeholder);
  const categories = new Map();
  (editableHardware ? moduleCatalog : []).forEach((entry) => {
    if (!categories.has(entry.category)) categories.set(entry.category, []);
    categories.get(entry.category).push(entry);
  });
  categories.forEach((entries, category) => {
    const group = document.createElement("optgroup");
    group.label = category;
    entries.forEach((entry) => {
      const option = document.createElement("option");
      option.value = entry.model;
      option.textContent = `${entry.model} — ${catalogModuleDescription(entry)}`;
      group.append(option);
    });
    select.append(group);
  });
  select.disabled = !editableHardware;
  if (currentEntry) select.value = currentEntry.model;
  selection.append(select);

  const note = element(
    "p",
    "module-selection-note",
    module
      ? "Replaces ID, subtype, name, and Details with latest-stable defaults. Base, slot, and comment are preserved."
      : "Adds the selected module with latest-stable defaults at this empty base slot.",
  );
  const apply = button("Apply module selection", "primary-button", async () => {
    const entry = moduleCatalog.find((item) => item.model === select.value);
    if (!entry || !supportsXgkHardware()) return;
    await applyEdit(
      () => module
        ? select_xgwx_module(current.file.bytes, targetBase, targetSlot, entry.model)
        : insert_xgwx_module(current.file.bytes, targetBase, targetSlot, entry.model),
      `${module ? "Select" : "Insert"} ${entry.model} at base ${targetBase}, slot ${targetSlot}`,
    );
  });
  apply.textContent = "Apply selection";
  apply.disabled = true;
  select.addEventListener("change", () => {
    apply.disabled = !editableHardware || !select.value || select.value === currentEntry?.model;
  });
  if (!editableHardware) {
    note.textContent = builtin
      ? "Built-in I/O cannot be removed or replaced. Comments are editable; built-in settings are not yet supported."
      : "Hardware selection, deletion, and settings are not supported for this CPU. Existing module comments remain editable.";
  }
  picker.append(selection, note, apply);

  if (!module) {
    inspector.append(form, picker);
    return;
  }

  const options = renderModuleOptions(module, currentEntry);

  const raw = element("details", "raw-details");
  raw.open = true;
  raw.append(element("summary", "", "Raw Details"));
  raw.append(element("pre", "raw-value", formatRawDetails(module)));
  inspector.append(form, picker, options, raw);
}

function renderModuleOptions(module, entry) {
  const section = element("section", "module-options");
  section.append(element("h3", "", "Module options"));
  if (!supportsXgkHardware()) {
    section.append(element("p", "module-selection-note", "Settings for this CPU are not yet supported."));
    return section;
  }
  if (!entry) {
    section.append(element("p", "module-selection-note", "This module does not uniquely match the embedded XG5000 catalog."));
    return section;
  }
  if (!entry.visibleOptions?.length) {
    section.append(element("p", "module-selection-note", "No module options were captured for this module."));
    return section;
  }

  let currentValues = [];
  if (entry.options?.length) {
    try {
      currentValues = xgwx_module_option_values(current.file.bytes, module.base, module.slot);
    } catch (error) {
      section.append(element("p", "validation-summary invalid", String(error)));
      return section;
    }
  }
  const valueMap = new Map(currentValues.map((item) => [`${item.key}:${item.index}`, item.value]));
  const changes = new Map();
  const apply = button("Apply module options", "primary-button", async () => {
    await applyEdit(
      () => {
        let bytes = current.file.bytes;
        changes.forEach(({ option, index, value }) => {
          bytes = set_xgwx_module_option(bytes, module.base, module.slot, option.key, index, value);
        });
        return bytes;
      },
      `Edit module options at base ${module.base}, slot ${module.slot}`,
    );
  });
  apply.textContent = "Apply options";
  apply.disabled = true;

  groupModuleOptions(entry.visibleOptions).forEach((optionGroup) => {
    const title = moduleOptionGroupTitle(optionGroup);
    const group = element(
      "div",
      `module-option-group${optionGroup.channelIndex === null ? "" : " module-option-channel-group"}`,
    );
    if (title) group.append(element("h4", "", title));
    const fields = element("div", "module-option-fields");
    optionGroup.items.forEach(({ option: visibleOption, index, groupedByChannel }) => {
      const option = entry.options?.find((item) => item.key === visibleOption.key) || null;
      fields.append(renderModuleOptionField({
        visibleOption,
        option,
        index,
        groupedByChannel,
        groupTitle: title,
        valueMap,
        changes,
        apply,
      }));
    });
    group.append(fields);
    section.append(group);
  });
  section.append(element("p", "module-selection-note", "All captured options are shown. Read-only rows do not yet have a verified Details mapping."));
  if (entry.options?.length) section.append(apply);
  return section;
}

function moduleOptionGroupTitle(group) {
  const section = group.section ? capitalize(group.section) : "";
  if (group.channelIndex === null) return section;
  return [section, `CH ${group.channelIndex}`].filter(Boolean).join(" · ");
}

function renderModuleOptionField({
  visibleOption,
  option,
  index,
  groupedByChannel,
  groupTitle,
  valueMap,
  changes,
  apply,
}) {
  const key = `${visibleOption.key}:${index}`;
  const writable = option && index < option.count;
  const original = valueMap.get(key);
  const field = element("label", "property-field module-option-field");
  const label = groupedByChannel ? visibleOption.label : moduleOptionLabel(visibleOption, index);
  const accessibleLabel = groupTitle ? `${groupTitle} · ${label}` : label;
  field.append(element("span", "property-label", label));
  if (writable) {
    const select = document.createElement("select");
    select.setAttribute("aria-label", accessibleLabel);
    if (!option.values.some((item) => item.value === original)) {
      const unknown = document.createElement("option");
      unknown.value = String(original);
      unknown.textContent = `Unknown (${original})`;
      select.append(unknown);
    }
    option.values.forEach((item) => {
      const choice = document.createElement("option");
      choice.value = String(item.value);
      choice.textContent = item.label;
      select.append(choice);
    });
    select.value = String(original);
    select.addEventListener("change", () => {
      const value = Number(select.value);
      if (value === original) changes.delete(key);
      else changes.set(key, { option, index, value });
      apply.disabled = changes.size === 0;
    });
    field.append(select);
  } else {
    field.classList.add("module-option-readonly");
    field.title = "Visible in XG5000; Details encoding is not mapped for safe editing.";
    field.append(readonlyModuleOptionControl(visibleOption, accessibleLabel, index));
  }
  return field;
}

function readonlyModuleOptionControl(option, label, index) {
  if (option.choices?.length) {
    const select = document.createElement("select");
    select.setAttribute("aria-label", `${label} (read only)`);
    select.disabled = true;
    option.choices.forEach((value) => {
      const choice = document.createElement("option");
      choice.value = value;
      choice.textContent = value;
      select.append(choice);
    });
    const numericDefault = Number(option.defaultValue);
    if (option.choices.includes(option.defaultValue)) select.value = option.defaultValue;
    else if (Number.isInteger(numericDefault) && option.choices[numericDefault] !== undefined) {
      select.value = option.choices[numericDefault];
    }
    return select;
  }
  const input = document.createElement("input");
  input.setAttribute("aria-label", `${label} (read only)`);
  input.readOnly = true;
  input.value = formatModuleOptionDefault(option.defaultValue, index) || "Not decoded";
  return input;
}

function moduleOptionLabel(option, index) {
  if (option.scope === "channel") return `${option.label} · CH ${index}`;
  if (option.scope === "group") return `${option.label} · Group ${index + 1}`;
  if (option.scope === "file") return `${option.label} · File ${index}`;
  if (option.scope === "fileData" && option.itemsPerParent > 0) {
    const file = Math.floor(index / option.itemsPerParent);
    const data = index % option.itemsPerParent;
    return `${option.label} · File ${file} · Data ${data}`;
  }
  return option.label;
}

function formatModuleOptionDefault(value, index) {
  return String(value || "")
    .replaceAll("{slot}", String(index))
    .replaceAll("{slot:03d}", String(index).padStart(3, "0"))
    .replaceAll("{slot:04d}", String(index).padStart(4, "0"));
}

function capitalize(value) {
  return value ? `${value[0].toLocaleUpperCase()}${value.slice(1)}` : value;
}

async function applySfcSequence(block, rows, selectedRow, action = false) {
  return applyEdit(() => replace_xgwx_sfc_sequence(current.file.bytes, {
    programIndex: selectedProgramIndex, blockIndex: block.blockIndex, expectedEntities: block.entities, expectedRows:block.editableRows, rows,
  }), "Edit SFC chart", () => {
    selectedSfcEntity = selectedRow < 0 ? null : { programIndex: selectedProgramIndex, blockIndex: block.blockIndex,
      entityIndex: action ? rows.length + selectedRow : selectedRow };
  });
}

const sfcStDrafts = new Map();
let sfcPromptOpen = false;
async function showSfcTextInput(block, entity, field = sfcTextField(block, entity)) {
  if (!field || sfcPromptOpen) return;
  if (["actionCode", "transitionCode"].includes(field.field)) { document.querySelector("[data-sfc-st-source]")?.focus(); return; }
  sfcPromptOpen = true;
  const source = current.file.bytes, fileUri = current.file.uri, programIndex = selectedProgramIndex;
  let focusIndex = field.field === "action" && entity.typeCode === 0 && !block.editableRows?.[entity.row].action
    ? block.entities.find(e => e.typeCode === 10 && e.row === entity.row && e.column === entity.column + 1)?.entityIndex ?? entity.entityIndex
    : entity.entityIndex;
  const cachedBuild = validatedEditCache((bytes, _command, operands) => {
    const replacement = operands[0];
    if (Array.isArray(block.editableRows)) return replace_xgwx_sfc_sequence(bytes, {
      programIndex, blockIndex: block.blockIndex, expectedEntities: block.entities, expectedRows:block.editableRows,
      rows: sfcRowsAfterEdit(block, entity, field.field, replacement),
    });
    return edit_xgwx_sfc_entity(bytes, {programIndex, blockIndex:block.blockIndex, entityIndex:entity.entityIndex,
      expectedType:entity.typeCode, expectedRow:entity.row, expectedColumn:entity.column,
      field:field.field, expectedValue:field.value, replacement});
  });
  const validate = value => {
    if (current?.file.uri !== fileUri || selectedProgramIndex !== programIndex || current.file.bytes !== source) {
      throw new Error("The SFC program changed while the editor was open. Reopen the text editor.");
    }
    if (field.field === "action") {
      if (!value || typeof value.operand !== "string" || typeof value.qualifier !== "string" || typeof value.time !== "string") throw new Error("Enter an action operand, qualifier, and time.");
    } else if (typeof value !== "string") throw new Error("Enter a text value.");
    return cachedBuild(source, field.field, [value]);
  };
  try {
    const requestId = ++nextContactPromptId;
    const value = await new Promise(resolve => {
      pendingContactPrompts.set(requestId, {resolve, validate, restoreFocus:false});
      const row = block.editableRows?.[entity.row];
      vscode.postMessage({type:field.field === "action" ? "promptSfcAction" : "promptSfcField", requestId,
        title:`Edit SFC ${field.label} · L${entity.row}`, value:field.value, prompt:field.prompt,
        ...(field.field === "action" ? {qualifier:row?.actionQualifier || "N",time:row?.actionTime || "",chooseActionType:true,kind:row?.actionCode != null ? "program" : "variable"} : {})});
    });
    if (value == null || value === field.value) return;
    if (field.field === "action") {
      const row = block.editableRows[entity.row];
      if ((value.kind || "variable") === (row.actionCode != null ? "program" : "variable") && value.operand === (row.action || "") && value.qualifier === (row.actionQualifier || "N") && value.time === (row.actionTime || "")) return;
    }
    await applyEdit(() => validate(value), `Edit SFC ${field.label}`, () => {
      if (Array.isArray(block.editableRows)) focusIndex = field.field === "action" && value.operand
        ? block.editableRows.length + entity.row : entity.row;
      selectedSfcEntity = {programIndex, blockIndex:block.blockIndex, entityIndex:focusIndex};
    });
  } catch (error) {
    vscode.postMessage({type:"showError",message:String(error)});
  } finally {
    sfcPromptOpen = false;
    requestAnimationFrame(() => {
      if (current?.file.uri !== fileUri || selectedProgramIndex !== programIndex) return;
      document.querySelector(`[data-sfc-entity="${block.blockIndex}:${focusIndex}"]`)?.focus({preventScroll:true});
    });
  }
}

function renderProgramsEditor(canvas, inspector, programs) {
  if (selectedProgramIndex >= programs.length) selectedProgramIndex = 0;
  const selected = programs[selectedProgramIndex] || null;
  const ladder = (current.summary.ladder || []).find((item) => item.programIndex === selectedProgramIndex) || null;

  const sfc = (current.summary.sfc || []).find(item => item.programIndex === selectedProgramIndex);
  if (sfc) {
    const selection = selectedSfcEntity?.programIndex === selectedProgramIndex ? selectedSfcEntity : null;
    canvas.append(editorHeader("Sequential function chart", `${sfc.blocks.length} block${sfc.blocks.length === 1 ? "" : "s"}`));
    canvas.append(renderSfcDiagram(sfc, selection, (block, entity) => {
      selectedSfcEntity = { programIndex: selectedProgramIndex, blockIndex: block.blockIndex, entityIndex: entity.entityIndex };
      renderProgramInspector(inspector, selected, null, null);
    }, applySfcSequence, showSfcTextInput, {drafts:sfcStDrafts,fileKey:current.file.uri}));
    renderProgramInspector(inspector, selected, null, null);
    return;
  }

  if (ladder?.projectType === 2 && programLanguage(ladder) === "Ladder Diagram") {
    const editableCount = (ladder.sourceStrings || []).filter((item) => item.isIecComment || item.iecElementKind || item.isIecFunctionOperand || item.isIecArithmeticFunction || item.isIecComparisonFunction).length;
    canvas.append(editorHeader(
      `${programLanguage(ladder)} payload`,
      `${ladder.iecRows?.length || 0} stored rows · ${ladder.iecRecords?.length || 0} records · ${ladder.iecFunctions?.length || 0} function blocks · ${ladder.iecFunctionReferences?.length || 0} block links · ${(ladder.iecTerminalFunctionDeletionSites?.length || 0) + (ladder.iecStandaloneFunctionDeletionSites?.length || 0) + (ladder.iecFunctionCellDeletionSites?.length || 0) + (ladder.iecConnectedArithmeticDeletionSites?.length || 0) + (ladder.iecScalarChainDeletionSites?.length || 0)} function deletions · ${(ladder.iecTerminalFunctionInsertionSites?.length || 0) + (ladder.iecStandaloneFunctionInsertionSites?.length || 0) + (ladder.iecFunctionCellInsertionSites?.length || 0) + (ladder.iecWiredComparisonInsertionSites?.length || 0) + (ladder.iecTerminalTimerInsertionSites?.length || 0)} function insertions · ${(ladder.iecNoContactInsertionSites?.length || 0) + (ladder.iecShortWireContactInsertionSites?.length || 0)} contact insertion sites · ${ladder.iecNoContactCellDeletionSites?.length || 0} cell deletions · ${ladder.iecHorizontalWireDeletionSites?.length || 0} removable wires · ${ladder.iecHorizontalWireRepairSites?.length || 0} wire gaps · ${editableCount} editable records`,
    ));
    const selectedElement = selectedIecElement?.programIndex === selectedProgramIndex
      ? (ladder.sourceStrings || []).find((item) => item.offset === selectedIecElement.offset) : null;
    if (!selectedElement) selectedIecElement = null;
    const selectedInsertion = selectedIecInsertion?.programIndex === selectedProgramIndex
      ? [...(ladder.iecNoContactInsertionSites || []).map((site) => ({ ...site, type: "long" })),
        ...(ladder.iecShortWireContactInsertionSites || []).map((site) => ({ ...site, type: "short" }))]
        .find((site) => site.type === selectedIecInsertion.type
          && site.wireOffset === selectedIecInsertion.wireOffset) : null;
    if (!selectedInsertion) selectedIecInsertion = null;
    const selectedRow = selectedIecRow?.programIndex === selectedProgramIndex
      ? selectedIecRow.rowIndex : null;
    const selectedBlank = selectedIecBlank?.programIndex === selectedProgramIndex
      && !iecOccupiedCell(ladder, selectedIecBlank.rowIndex, selectedIecBlank.rawX)
      ? selectedIecBlank : null;
    if (!selectedBlank) selectedIecBlank = null;
    canvas.append(renderIecLayout(ladder, (item, marker) => {
      selectedIecElement = { programIndex: selectedProgramIndex, offset: item.offset };
      selectedIecInsertion = null;
      selectedIecBlank = null;
      canvas.querySelectorAll(".iec-layout-marker.inspected").forEach((node) => node.classList.remove("inspected"));
      canvas.querySelectorAll(".iec-layout-insert.inspected").forEach((node) => node.classList.remove("inspected"));
      marker.classList.add("inspected");
      renderProgramInspector(inspector, selected, ladder, item, null, null, null, item.iecRowIndex);
    }, (site, marker) => {
      selectedIecElement = null;
      selectedIecInsertion = { programIndex: selectedProgramIndex,
        type: site.type, wireOffset: site.wireOffset };
      selectedIecBlank = null;
      canvas.querySelectorAll(".iec-layout-marker.inspected, .iec-layout-insert.inspected")
        .forEach((node) => node.classList.remove("inspected"));
      marker.classList.add("inspected");
      renderProgramInspector(inspector, selected, ladder, null, null, null, site, site.rowIndex);
    }, (rowIndex) => {
      selectedIecElement = null;
      selectedIecInsertion = null;
      selectedIecBlank = null;
      canvas.querySelectorAll(".iec-layout-marker.inspected, .iec-layout-insert.inspected")
        .forEach((node) => node.classList.remove("inspected"));
      renderProgramInspector(inspector, selected, ladder, null, null, null, null, rowIndex);
    }, (position) => {
      selectedIecElement = null;
      selectedIecInsertion = null;
      selectedIecBlank = { programIndex: selectedProgramIndex, ...position };
      canvas.querySelectorAll(".iec-layout-marker.inspected, .iec-layout-insert.inspected")
        .forEach((node) => node.classList.remove("inspected"));
      renderProgramInspector(inspector, selected, ladder, null, null, null, null,
        position.rowIndex, selectedIecBlank);
    }));
    const records = document.createElement("details");
    records.className = "iec-records-details";
    records.append(element("summary", "", "Stored IEC records"), renderIecProgramSource(ladder));
    canvas.append(records);
    renderProgramInspector(inspector, selected, ladder, selectedElement, null, null,
      selectedInsertion, selectedRow, selectedBlank);
    return;
  }

  if (ladder?.structuralEditing && !ladder.rungs.length) ladder.rungs = [{ rawY: 0 }];
  if (ladder) {
    if (ladder.structuralEditing) {
      const storedLast = Math.max(-4, ...ladder.rungs.map(row => row.rawY), ...(ladder.rungComments || []).map(row => row.rawY));
      ladder.canvasRowValues = xgkCanvasRowValues(ladder, Math.min(65535, Math.max(
        storedLast / 4 + 17, ladderCanvasExtents.get(canvasExtentKey()) || 0,
        (selectedLadderFocus?.rawY || 0) / 4 + 2)));
    }
    if (selectedLadderComment && !(ladder.rungComments || []).some((comment) => (
      selectedLadderComment.kind === "Rung" && comment.rawY === selectedLadderComment.rawY
    ))) {
      selectedLadderComment = null;
    }
    const rowValues = xgkCanvasRowValues(ladder);
    if (selectedLadderFocus && (selectedLadderFocus.rawY < 0 || selectedLadderFocus.rawY >= 65535 * 4)) {
      resetLadderSelection();
    }
    if (selectedLadderFocus) {
      const focusedCell = ladderCellAtPosition(ladder, selectedLadderFocus);
      selectedCellOffset = focusedCell?.offset ?? null;
      selectedBlankCell = focusedCell ? null : selectedLadderFocus;
    }
    const selectPosition = (position, extend = false) => {
      const rowIndex = xgkCanvasRowValues(ladder).indexOf(position.rawY);
      if (rowIndex < 0) return;
      canvas.querySelectorAll(".ld-wire-target.selected").forEach(node => node.classList.remove("selected"));
      const normalized = { rawY: position.rawY, rowIndex, column: position.column };
      selectedLadderComment = null;
      if (!extend || !selectedLadderAnchor) selectedLadderAnchor = normalized;
      selectedLadderFocus = normalized;
      const cell = ladderCellAtPosition(ladder, normalized);
      selectedCellOffset = cell?.offset ?? null;
      selectedBlankCell = cell ? null : normalized;
      const selection = currentLadderSelection(ladder);
      renderProgramInspector(inspector, selected, ladder, cell, selectedBlankCell, selection);
      syncLadderSelectionClasses(canvas, selection.keys, normalized);
      syncLadderCommentSelectionClasses(canvas, null);
    };
    const selectComment = (comment, column = null) => {
      const activeColumn = column ?? selectedLadderFocus?.column ?? selectedLadderComment?.column ?? 0;
      selectedCellOffset = null;
      selectedBlankCell = null;
      selectedLadderAnchor = null;
      selectedLadderFocus = null;
      selectedLadderComment = { kind: comment.kind, rawY: comment.rawY, column: activeColumn };
      renderProgramInspector(inspector, selected, ladder, null, null, currentLadderSelection(ladder));
      syncLadderSelectionClasses(canvas, new Set(), null);
      syncLadderCommentSelectionClasses(canvas, selectedLadderComment);
    };
    const deleteSelection = async (label = null) => {
      const selection = currentLadderSelection(ladder);
      if (!ladder.structuralEditing || !selection.decodedCells.length
        || selection.decodedCells.some((cell) => !structuralElement(cell) && !isEditableComparison(cell, ladder) && !cell.instructionDeletion)) return false;
      const editableCells = [...selection.decodedCells].sort((a, b) => b.offset - a.offset);
      const activeKey = selectedLadderFocus ? ladderPositionKey(selectedLadderFocus) : null;
      const edited = await applyEdit(
        () => editableCells.reduce((bytes, cell) => isEditableComparison(cell, ladder)
          ? delete_xgwx_ladder_comparison(bytes, selectedProgramIndex, cell.offset, cell.sourceText)
          : cell.instructionDeletion
            ? delete_xgwx_ladder_instruction(bytes, selectedProgramIndex, cell.offset, cell.sourceText)
          : edit_xgwx_ladder_cell(bytes, selectedProgramIndex, {
            rawY: cell.rawY, column: ldCellColumn(cell.rawX),
            expected: structuralElement(cell), replacement: null,
          }), current.file.bytes),
        label || `Delete ${editableCells.length} ladder element${editableCells.length === 1 ? "" : "s"}`,
      );
      if (edited && activeKey) {
        requestAnimationFrame(() => document.querySelector(`[data-ladder-key="${activeKey}"]`)?.focus());
      }
      return edited;
    };
    canvas.append(editorHeader("Ladder diagram", `${ladder.rungs.length} rungs · ${LD_COLUMN_COUNT} columns`));
    canvas.append(renderLadderDiagram(ladder, selectPosition, selectComment, deleteSelection));
  } else {
    canvas.append(emptyState("This program has no decoded ladder body."));
  }

  const selectedCell = ladder && selectedLadderFocus
    ? ladderCellAtPosition(ladder, selectedLadderFocus)
    : null;
  const selection = ladder ? currentLadderSelection(ladder) : null;
  renderProgramInspector(inspector, selected, ladder, selectedCell, selectedBlankCell, selection);
}

function programLanguage(body) {
  const version = body?.version || "";
  if (/^LD\s+VER\b/i.test(version)) return "Ladder Diagram";
  if (/^SFC\s+VER\b/i.test(version)) return "SFC";
  if (/^ST\s+VER\b/i.test(version)) return "Structured Text";
  return version || "Unknown";
}

function iecEditableLastRow(body) {
  const rows = body.iecRows || [];
  return rows.length ? Math.min(16383, Math.max(...rows.map((row) => row.rowIndex)) + 16)
    : body.iecCircuitGraph ? 0 : -1;
}

function iecOccupiedCell(body, rowIndex, rawX) {
  const rows = body.iecRows || [];
  if (rowIndex < 0
    || rowIndex >= 16383
    || rawX < 1 || rawX > 97 || (rawX - 1) % 3 !== 0) return true;
  if ((body.sourceStrings || []).some((item) => item.isIecComment
    && item.iecRowIndex === rowIndex)) return true;
  const areas = body.iecCircuitGraph?.occupiedAreas;
  if (areas) return areas.some((area) => area.kind !== "horizontalWire"
    && rowIndex >= area.startRowIndex && rowIndex <= area.endRowIndex
    && rawX >= area.startX && rawX <= area.endX);
  return (body.sourceStrings || []).some((item) => item.iecRowIndex === rowIndex
    && item.iecPosition?.[0] === rawX
    && (item.iecElementKind || item.isIecFunctionName));
}

function iecContactInsertionSiteAt(body, rowIndex, rawX) {
  const leading = (body.iecLeadingContactInsertionSites || [])
    .find((site) => site.rowIndex === rowIndex && rawX === 1);
  if (leading) return { ...leading, type: "leading" };
  const short = (body.iecShortWireContactInsertionSites || [])
    .find((site) => site.rowIndex === rowIndex && site.rawX === rawX);
  if (short) return { ...short, type: "short" };
  const long = (body.iecNoContactInsertionSites || [])
    .find((site) => site.rowIndex === rowIndex
      && rawX >= site.startX && rawX + 3 <= site.endX
      && (rawX - site.startX) % 3 === 0);
  return long ? { ...long, type: "long" } : null;
}

function renderIecLayout(body, selectElement, selectInsertion, selectNetworkRow, selectBlank) {
  const section = element("section", "iec-layout");
  section.append(element("h3", "", "IEC ladder layout"));
  section.append(element("p", "muted",
    "Single-click selects cells. Double-click or Enter opens the instruction editor. Select a BOOL output pin and press F5 or Enter to draw a horizontal wire; F5 extends it from a blank cell. F6 draws a vertical connection beside the selected cell. Select a row label and use Ctrl+C/Ctrl+V to copy and paste networks."));
  const rows = body.iecRows || [];
  if (!rows.length && !body.iecCircuitGraph) {
    section.append(emptyState("No decoded IEC rows."));
    return section;
  }
  const pitch = 68;
  const scale = 24;
  const left = 76;
  const top = 32;
  const x = (storedX) => left + storedX * scale;
  const gapOffset = iecGapOffsets(body);
  // Element anchors are one unit inside their cell; branch X is already a boundary.
  const visualX = (rowIndex, storedX) => x(storedX - 1 - gapOffset(rowIndex, storedX));
  const y = (rowIndex) => top + rowIndex * pitch;
  let lastEditableRow = Math.max(iecEditableLastRow(body), selectedIecBlank?.programIndex === selectedProgramIndex ? selectedIecBlank.rowIndex : 0);
  const rowByIndex = new Map(rows.map((row) => [row.rowIndex, row]));
  const viewport = element("div", "iec-layout-viewport");
  const board = element("div", "iec-layout-board");
  const navigationMarkers = new Map();
  let keyboardCursor = null;
  let keyboardTarget = null;
  board.style.width = `${x(100) + 32}px`;
  board.style.height = `${y(lastEditableRow) + pitch}px`;
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.classList.add("iec-layout-wires");
  svg.setAttribute("viewBox", `0 0 ${x(100) + 32} ${y(lastEditableRow) + pitch}`);
  svg.setAttribute("aria-hidden", "true");
  const line = (x1, y1, x2, y2, kind) => {
    const node = document.createElementNS("http://www.w3.org/2000/svg", "line");
    node.setAttribute("x1", x1);
    node.setAttribute("y1", y1);
    node.setAttribute("x2", x2);
    node.setAttribute("y2", y2);
    node.classList.add(kind);
    svg.append(node);
  };
  const commentRows = new Set((body.sourceStrings || [])
    .filter((item) => item.isIecComment)
    .map((item) => item.iecRowIndex));
  const status = element("p", "muted iec-clipboard-status", "");
  section.append(status);
  let blankIndicator = null;
  const selectRow = (rowIndex, clearCells = true) => {
    selectedIecRow = { programIndex: selectedProgramIndex, rowIndex };
    if (blankIndicator) blankIndicator.hidden = true;
    clearDragBlankCells();
    if (clearCells) board.querySelectorAll(".iec-layout-marker.selected").forEach((marker) => {
      marker.classList.remove("selected");
    });
    board.querySelectorAll(".iec-layout-row").forEach((label) => {
      label.classList.toggle("selected", Number(label.dataset.rowIndex) === rowIndex);
    });
    status.textContent = rowByIndex.has(rowIndex)
      ? `L${rowIndex} selected. Ctrl+C copies its network.`
      : `Empty L${rowIndex} selected. Ctrl+V pastes the copied network.`;
    selectNetworkRow(rowIndex);
  };
  const renderRowLabels = (first, last) => {
    board.querySelectorAll(".iec-layout-row").forEach(label => {
      if (label !== document.activeElement) label.remove();
    });
    for (let rowIndex = first; rowIndex <= last; rowIndex += 1) {
      if (board.querySelector(`.iec-layout-row[data-row-index="${rowIndex}"]`)) continue;
      const isCommentRow = commentRows.has(rowIndex);
      const isEmpty = !rowByIndex.has(rowIndex);
      const labelText = isCommentRow ? "설명문" : `L${rowIndex}`;
      const label = button(labelText,
        `iec-layout-row${isCommentRow ? " comment" : ""}${isEmpty ? " empty" : ""}`,
        () => selectRow(rowIndex));
      label.textContent = labelText;
      label.dataset.rowIndex = String(rowIndex);
      label.classList.toggle("selected", selectedIecRow?.programIndex === selectedProgramIndex
        && selectedIecRow.rowIndex === rowIndex);
      label.setAttribute("aria-label", `${isEmpty ? "Empty row" : "IEC row"} L${rowIndex}`);
      if (isEmpty) {
        const open = () => showIecBlankInput(body, { rowIndex, rawX: 1 },
          `.iec-layout-row[data-row-index="${rowIndex}"]`);
        label.addEventListener("dblclick", (event) => { event.preventDefault(); void open(); });
        label.addEventListener("keydown", (event) => {
          if (event.key !== "Enter" || event.repeat || event.ctrlKey || event.metaKey || event.altKey) return;
          event.preventDefault(); event.stopPropagation(); void open();
        });
      }
      label.style.top = `${y(rowIndex) - 9}px`;
      board.append(label);
    }
  };
  const drawOutputWire = (block, port, startX = port.rawX) => {
    const position = {rowIndex:port.rowIndex,rawX:startX+3};
    return applyEdit(() => insert_xgwx_iec_ld_function_output_wire(current.file.bytes,
      selectedProgramIndex,block.recordOffset,block.name,port.name,startX),
    `Wire ${block.name}.${port.name} · L${port.rowIndex}`, () => {
      selectedIecElement = selectedIecInsertion = selectedIecRow = null;
      selectedIecBlank = {programIndex:selectedProgramIndex,...position};
    }).then(edited => {
      if (edited) requestAnimationFrame(() => {
        const cell = document.querySelector(`.iec-layout-marker[data-row-index="${position.rowIndex}"][data-raw-x="${position.rawX}"]`)
          || document.querySelector(".iec-layout-blank-cell");
        cell?.focus({preventScroll:true});
      });
    });
  };
  board.addEventListener("keydown", event => {
    if (event.key !== "F5" || event.repeat || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
    const cell = event.target.closest(".iec-layout-blank-cell");
    if (!cell) return;
    event.preventDefault(); event.stopPropagation();
    const position = {rowIndex:Number(cell.dataset.rowIndex),rawX:Number(cell.dataset.rawX)};
    const output = iecOutputWireAt(body,position);
    if (!output) {status.textContent = "Select a BOOL output pin or the end of its horizontal wire. Numeric OUT needs a destination variable.";return;}
    void drawOutputWire(output.block,output.pin,position.rawX);
  });
  board.addEventListener("keydown", event => {
    if (event.key !== "F6" || event.repeat || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
    const cell = event.target.closest("[data-row-index][data-raw-x]");
    if (!cell) return;
    event.preventDefault(); event.stopPropagation();
    const rowIndex = Number(cell.dataset.rowIndex);
    const x = Number(cell.dataset.rawX) - 1;
    const upper = rowByIndex.get(rowIndex);
    const lower = rowByIndex.get(rowIndex + 1);
    if (!upper || x < 3 || x > 93) {
      status.textContent = "Select a cell beside an existing connection on two adjacent rows."; return;
    }
    const pair = { groupIndex: upper.groupIndex, lowerGroupIndex: lower?.groupIndex, extendBlankRow: !lower,
      startRowIndex: rowIndex, endRowIndex: rowIndex + 1 };
    void applyEdit(() => addIecBranchBytes(pair, x),
      `Connect IEC rows L${rowIndex}–L${rowIndex + 1} x${x}`).then(edited => {
      if (edited) requestAnimationFrame(() => document.querySelector(
        `[aria-label="Vertical IEC wire L${rowIndex}–L${rowIndex + 1} x${x}"]`,
      )?.focus({ preventScroll: true }));
    });
  });
  board.addEventListener("keydown", async (event) => {
    if (!(event.ctrlKey || event.metaKey) || event.altKey
      || !["c", "v"].includes(event.key.toLowerCase())
      || event.target.closest("input, textarea, select, [contenteditable]")) return;
    event.preventDefault();
    const rowIndex = selectedIecRow?.programIndex === selectedProgramIndex
      ? selectedIecRow.rowIndex : null;
    if (event.key.toLowerCase() === "c") {
      const row = rowByIndex.get(rowIndex);
      if (!row) {
        status.textContent = "Select a populated IEC row to copy its network.";
        return;
      }
      const cellGroups = new Set([...board.querySelectorAll(".iec-layout-marker.selected")]
        .map((marker) => Number(marker.dataset.groupIndex)));
      if (cellGroups.size > 1) {
        status.textContent = "Selected cells span multiple networks. Copy one network at a time.";
        return;
      }
      const groupRows = rows.filter((candidate) => candidate.groupIndex === row.groupIndex);
      iecClipboard = {
        programIndex: selectedProgramIndex,
        groupIndex: row.groupIndex,
        firstRow: groupRows[0].rowIndex,
        lastRow: groupRows.at(-1).rowIndex,
      };
      status.textContent = `Copied network ${row.groupIndex + 1} (L${iecClipboard.firstRow}–L${iecClipboard.lastRow}). Select an empty row and Ctrl+V.`;
      return;
    }
    if (!iecClipboard || rowIndex === null || rowByIndex.has(rowIndex)) {
      status.textContent = "Copy a network, then select an empty destination row to paste it.";
      return;
    }
    const source = iecClipboard;
    const label = `Paste IEC network from program ${source.programIndex + 1} L${source.firstRow} to program ${selectedProgramIndex + 1} L${rowIndex}`;
    await applyEdit(() => source.programIndex === selectedProgramIndex
      ? copy_xgwx_iec_ld_group(current.file.bytes, selectedProgramIndex,
        source.groupIndex, source.firstRow, rowIndex)
      : copy_xgwx_iec_ld_group_to_program_with_locals(current.file.bytes,
        source.programIndex, source.groupIndex, source.firstRow,
        selectedProgramIndex, rowIndex), label);
  });
  const deleteTargets = new Map();
  board.addEventListener("keydown", async event => {
    if (!isLadderDeleteKey(event) || event.target.closest("input, textarea, [contenteditable=true]")) return;
    const selected = [...deleteTargets.keys()].filter(node => node.classList.contains("selected"));
    const focused = event.target.closest(".iec-layout-marker");
    const nodes = selected.length ? selected : deleteTargets.has(focused) ? [focused] : [];
    if (!nodes.length) return;
    event.preventDefault(); event.stopPropagation();
    const targets = [...new Set(nodes.map(node => deleteTargets.get(node)))].sort((a,b) => b.offset - a.offset);
    const position = targets.at(-1).position;
    const deletionFocus = targets.at(-1).focusSelector || ".iec-layout-blank-cell";
    await applyEdit(() => targets.reduce((bytes,target,index) => {
      const updated = index === 0 ? body : parse_xgwx(bytes).ladder.find(program => program.programIndex === selectedProgramIndex);
      return target.remove(bytes,updated);
    },current.file.bytes), `Delete ${targets.length} IEC ladder item${targets.length === 1 ? "" : "s"}`, () => {
      selectedIecElement = selectedIecInsertion = selectedIecRow = null;
      selectedIecBlank = {programIndex:selectedProgramIndex,...position};
    });
    requestAnimationFrame(() => document.querySelector(deletionFocus)?.focus({preventScroll:true}));
  }, true);
  const wireKinds = new Map((body.iecRecords || []).map(record => [record.offset, record.kind]));
  for (const wire of body.iecGeometry?.horizontal || []) {
    // LongWire stores the last occupied cell anchor; ShortWire geometry already
    // includes the following boundary. Both must reach the next element's EN.
    const longWire = wireKinds.get(wire.offset) === "Long wire" || wire.startX === wire.endX;
    line(visualX(wire.rowIndex, wire.startX), y(wire.rowIndex),
      visualX(wire.rowIndex, wire.endX + (longWire ? 3 : 0)), y(wire.rowIndex), "wire");
  }
  for (const wire of body.iecGeometry?.vertical || []) {
    line(x(wire.x), y(wire.startRowIndex), x(wire.x), y(wire.endRowIndex), "branch");
  }
  board.append(svg);
  for (const wire of body.iecGeometry?.horizontal || []) {
    const longWire = wireKinds.get(wire.offset) === "Long wire" || wire.startX === wire.endX;
    const left = visualX(wire.rowIndex,wire.startX);
    const right = visualX(wire.rowIndex,wire.endX + (longWire ? 3 : 0));
    const control = button(`Horizontal IEC wire L${wire.rowIndex} x${wire.startX}–${wire.endX}`, "iec-layout-marker horizontal-wire", () => {
      board.querySelectorAll(".iec-layout-marker.selected, .iec-layout-marker.inspected").forEach(node => node.classList.remove("selected","inspected"));
      selectRow(wire.rowIndex); control.classList.add("selected");
      status.textContent = `Horizontal wire L${wire.rowIndex} selected. Delete removes the wire.`;
    });
    control.style.left = `${left}px`; control.style.top = `${y(wire.rowIndex)-5}px`;
    control.style.width = `${Math.max(10,right-left)}px`;
    control.addEventListener("dblclick",event => {
      event.preventDefault(); event.stopPropagation();
      const position = cellAtPoint(event.clientX,event.clientY);
      selectBlankPosition(position); void showIecBlankInput(body,position);
    });
    control.dataset.groupIndex = String(wire.groupIndex);
    deleteTargets.set(control,{offset:wire.offset,position:{rowIndex:wire.rowIndex,rawX:wire.startX},remove:bytes =>
      delete_xgwx_iec_ld_horizontal_wire_record(bytes,selectedProgramIndex,wire.offset,wire.startX,wire.endX)});
    board.append(control);
  }
  for (const wire of body.iecGeometry?.vertical || []) {
    const control = button("", "iec-layout-marker vertical-wire", () => {
      board.querySelectorAll(".iec-layout-marker.selected").forEach(marker => marker.classList.remove("selected"));
      control.classList.add("selected");
      selectRow(wire.startRowIndex);
      status.textContent = `Vertical wire L${wire.startRowIndex}–L${wire.endRowIndex} x${wire.x} selected. Delete removes the wire and keeps shared rows.`;
    });
    deleteTargets.set(control,{offset:wire.startOffset,position:{rowIndex:wire.startRowIndex,rawX:wire.x+1},remove:(bytes,updated) => deleteIecVerticalWireBytes(updated,wire,bytes)});
    control.style.left = `${x(wire.x) - 6}px`;
    control.style.top = `${y(wire.startRowIndex) + 4}px`;
    control.style.height = `${y(wire.endRowIndex) - y(wire.startRowIndex) - 8}px`;
    control.dataset.groupIndex = String(wire.groupIndex);
    control.setAttribute("aria-label", `Vertical IEC wire L${wire.startRowIndex}–L${wire.endRowIndex} x${wire.x}`);
    control.title = "Select vertical wire; Delete or Backspace removes it while retaining shared rows";
    control.addEventListener("keydown", event => {
      if (!isLadderDeleteKey(event)) return;
      event.preventDefault(); event.stopPropagation();
      void applyEdit(() => deleteIecVerticalWireBytes(body, wire),
      `Delete vertical IEC wire L${wire.startRowIndex}–L${wire.endRowIndex} x${wire.x}`).then(edited => {
        if (edited) requestAnimationFrame(() => {
          const target = document.querySelector(
            `[aria-label="Reconnect vertical IEC wire L${wire.startRowIndex}–L${wire.endRowIndex} x${wire.x}"]`,
          ) || document.querySelector(
            `.iec-layout-marker[data-row-index="${wire.startRowIndex}"][data-raw-x="${wire.x + 1}"]`,
          );
          target?.focus({ preventScroll: true });
        });
      });
    });
    board.append(control);
  }
  const endpoints = body.iecCircuitGraph?.openBranchEndpoints || [];
  for (const start of endpoints) {
    const end = endpoints.find(point => point.groupIndex === start.groupIndex
      && point.x === start.x && point.rowIndex === start.rowIndex + 1);
    if (!end || (body.iecGeometry?.vertical || []).some(wire => wire.groupIndex === start.groupIndex
      && wire.x === start.x && wire.startRowIndex === start.rowIndex && wire.endRowIndex === end.rowIndex)) continue;
    const repair = () => applyEdit(() => edit_xgwx_iec_ld_vertical_wire(current.file.bytes, selectedProgramIndex,
      start.groupIndex, start.rowIndex, end.rowIndex, start.x, false, true),
    `Reconnect vertical IEC wire L${start.rowIndex}–L${end.rowIndex} x${start.x}`).then(edited => {
      if (edited) requestAnimationFrame(() => document.querySelector(
        `[aria-label="Vertical IEC wire L${start.rowIndex}–L${end.rowIndex} x${start.x}"]`,
      )?.focus({ preventScroll: true }));
    });
    const control = button("+", "iec-layout-marker vertical-gap", () => {
      status.textContent = `Vertical wire gap L${start.rowIndex}–L${end.rowIndex} x${start.x}. Double-click or Enter reconnects it.`;
    });
    control.textContent = "+";
    control.style.left = `${x(start.x) - 9}px`;
    control.style.top = `${(y(start.rowIndex) + y(end.rowIndex)) / 2 - 9}px`;
    control.setAttribute("aria-label", `Reconnect vertical IEC wire L${start.rowIndex}–L${end.rowIndex} x${start.x}`);
    control.title = "Double-click or Enter to reconnect vertical wire";
    control.addEventListener("dblclick", event => { event.preventDefault(); event.stopPropagation(); void repair(); });
    control.addEventListener("keydown", event => {
      if (event.key !== "Enter" || event.repeat || event.ctrlKey || event.metaKey || event.altKey) return;
      event.preventDefault(); event.stopPropagation(); void repair();
    });
    board.append(control);
  }
  const insertionSites = [
    ...(body.iecNoContactInsertionSites || []).map((site) => ({ ...site, type: "long" })),
    ...(body.iecShortWireContactInsertionSites || []).map((site) => ({ ...site, type: "short" })),
  ];
  for (const site of insertionSites) {
    const position = site.type === "short" ? site.rawX : site.startX;
    const control = button("+", "iec-layout-insert", () => {
      selectRow(site.rowIndex);
      selectInsertion(site, control);
    });
    control.textContent = "+";
    control.style.left = `${visualX(site.rowIndex, position)}px`;
    control.style.top = `${y(site.rowIndex)}px`;
    control.dataset.wireOffset = String(site.wireOffset);
    control.dataset.rowIndex = String(site.rowIndex);
    control.dataset.rawX = String(position);
    const openInsertion = () => showIecBlankInput(body, { rowIndex: site.rowIndex,
      rawX: position }, `.iec-layout-insert[data-wire-offset="${site.wireOffset}"]`);
    control.addEventListener("dblclick", (event) => { event.preventDefault(); void openInsertion(); });
    control.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" || event.repeat || event.ctrlKey || event.metaKey || event.altKey) return;
      event.preventDefault(); event.stopPropagation(); void openInsertion();
    });
    control.setAttribute("aria-label", `Insert contact at L${site.rowIndex} x${position}`);
    control.title = `Insert IEC contact at L${site.rowIndex}`;
    control.classList.toggle("inspected", selectedIecInsertion?.programIndex === selectedProgramIndex
      && selectedIecInsertion.type === site.type
      && selectedIecInsertion.wireOffset === site.wireOffset);
    board.append(control);
  }
  const focusText = (item) => {
    const records = section.parentElement?.querySelector(".iec-records-details");
    if (records) records.open = true;
    const offset = item.offset;
    const target = section.parentElement?.querySelector(`[data-iec-offset="${offset}"]`);
    if (!target) return;
    if (target.hidden) {
      const filter = section.parentElement.querySelector(".iec-program-source .filter-control input");
      if (filter) {
        filter.value = "";
        filter.dispatchEvent(new Event("input"));
      }
    }
    target.scrollIntoView({ block: "center" });
    if (item.isIecComment || item.iecElementKind || item.isIecFunctionOperand || item.isIecArithmeticFunction || item.isIecComparisonFunction) {
      target.querySelector("button")?.click();
    } else {
      target.focus({ preventScroll: true });
    }
  };
  const blockByNameOffset = new Map((body.iecFunctions || []).map((block) => [block.nameOffset, block]));
  const blockByOffset = new Map((body.iecFunctions || []).map((block) => [block.recordOffset, block]));
  const linkByRecord = new Map((body.iecFunctionOperandLinks || []).map((link) => [link.recordOffset, link]));
  const markers = (body.sourceStrings || []).filter((item) => item.isIecComment || item.iecElementKind
    || item.isIecFunctionName || (item.isIecFunctionOperand && item.iecPosition));
  for (const item of markers) {
    const isComment = item.isIecComment;
    const isFunction = item.isIecFunctionName;
    const isOperand = item.isIecFunctionOperand;
    const contactGlyph = iecContactGlyph(item.iecElementKind);
    const coilGlyph = IEC_COIL_GLYPH_BY_SOURCE_LABEL.get(item.iecElementKind);
    const kind = isComment ? "comment" : isFunction ? "function" : isOperand ? "operand"
      : contactGlyph ? "contact" : coilGlyph ? "coil" : "unknown";
    const glyph = contactGlyph || coilGlyph || (isFunction ? "▣" : "[?]");
    const label = isComment || isOperand || isFunction ? item.value : `${glyph} ${item.value}`;
    const marker = button(label, `iec-layout-marker ${kind}`, (event) => {
      if (event.detail && marker.dataset.suppressClick === "true") {
        delete marker.dataset.suppressClick;
        return;
      }
      selectRow(item.iecRowIndex);
      board.querySelectorAll(".iec-layout-marker.selected").forEach(node => node.classList.remove("selected"));
      if (["contact","coil","function","operand"].includes(kind)) marker.classList.add("selected");
      if (["contact","coil","comment","function"].includes(kind)) selectElement(item, marker);
      if (kind === "unknown") focusText(item);
    });
    if (["contact","coil","function"].includes(kind)) {
      deleteTargets.set(marker,{offset:item.iecRecordOffset,position:{rowIndex:item.iecRowIndex,rawX:item.iecPosition?.[0] ?? 1},remove:(bytes,updated) => deleteIecElementBytes(bytes,item,updated)});
    }
    if (["contact", "coil", "function", "operand"].includes(kind)) {
      marker.addEventListener("dblclick", (event) => {
        event.preventDefault();
        void showIecElementInput(item, body);
      });
      marker.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" || event.repeat || event.altKey || event.ctrlKey || event.metaKey) return;
        event.preventDefault();
        event.stopPropagation();
        void showIecElementInput(item, body);
      });
    }
    if (kind === "contact" || kind === "coil") {
      marker.textContent = "";
      const contactVariant = kind === "contact" ? iecContactVariant(item.iecElementKind) : null;
      if (contactVariant) marker.dataset.contactVariant = contactVariant;
      marker.append(
        element("span", "iec-layout-device", item.value),
        element("span", "iec-layout-glyph", contactVariant
          ? contactVariant.includes("rising") ? "P" : contactVariant.includes("falling") ? "N" : ""
          : glyph),
      );
    } else if (isComment) {
      marker.replaceChildren(element("span", "iec-layout-comment-text", item.value));
    } else {
      marker.textContent = label;
    }
    const link = isOperand && linkByRecord.get(item.iecRecordOffset);
    const owner = link && blockByOffset.get(link.targetRecordOffset);
    const linkedPin = owner && functionPins(owner).find((pin) => pin.referenceOrdinal === link.ordinal);
    if (isOperand && link?.isOutput && linkedPin?.name === "OUT") {
      deleteTargets.set(marker,{offset:item.iecRecordOffset,
        position:{rowIndex:item.iecRowIndex,rawX:item.iecPosition[0]},
        focusSelector:`[aria-label="Assign ${owner.name}.${linkedPin.name} at L${item.iecRowIndex}"]`,
        remove:bytes => delete_xgwx_iec_ld_function_output_operand(bytes,selectedProgramIndex,item.offset,item.value)});
    }
    const description = owner ? `${owner.name}.${linkedPin?.name || `pin ${link.ordinal}`} · ${linkedPin?.direction || (link.isOutput ? "output" : "input")} · ${functionPinType(linkedPin)}`
      : item.iecElementKind || (isComment ? "Comment" : isFunction ? "Function block" : "Function operand");
    marker.title = `${description} · L${item.iecRowIndex} · byte ${item.offset}`
      + (isOperand ? " · Double-click or Enter to edit value" + (link?.isOutput && linkedPin?.name === "OUT" ? " · Delete or Backspace removes assignment" : "")
        : ["contact", "coil", "function"].includes(kind) ? " · Double-click or Enter to edit instruction" : "");
    marker.dataset.iecOffset = String(item.offset);
    marker.dataset.rowIndex = String(item.iecRowIndex);
    marker.dataset.rawX = String(item.iecPosition?.[0] ?? 1);
    navigationMarkers.set(item.iecRecordOffset, marker);
    marker.classList.toggle("inspected", selectedIecElement?.programIndex === selectedProgramIndex
      && selectedIecElement.offset === item.offset);
    marker.setAttribute("aria-label", `${description}: ${item.value}, L${item.iecRowIndex}`);
    const block = isFunction ? blockByNameOffset.get(item.offset) : owner;
    const ownerOffset = block ? gapOffset(block.rowIndex, block.rawX) : null;
    const storedX = item.iecPosition?.[0] ?? 1;
    marker.style.left = `${isComment ? x(0) : x(storedX - 1 - (ownerOffset ?? gapOffset(item.iecRowIndex, storedX)))}px`;
    marker.style.top = `${(kind === "contact" || kind === "coil") ? y(item.iecRowIndex)
      : y(item.iecRowIndex) - (isComment ? 20 : isOperand ? 18 : 22)}px`;
    if (kind === "contact" || kind === "coil" || kind === "function") {
      marker.dataset.rowIndex = String(item.iecRowIndex);
      marker.dataset.rawX = String(item.iecPosition?.[0] ?? 1);
      marker.dataset.groupIndex = String(item.iecGroupIndex);
      marker.dataset.cellX = String(parseFloat(marker.style.left) + (kind === "function" ? 20 : 36));
      marker.addEventListener("pointerdown", (event) => {
        if (event.button !== 0) return;
        delete marker.dataset.suppressClick;
        selectRow(item.iecRowIndex);
        const originX = event.clientX;
        const originY = event.clientY;
        const anchorX = Number(marker.dataset.cellX);
        const anchorRow = item.iecRowIndex;
        let moved = false;
        const move = (motion) => {
          if (!(motion.buttons & 1)) return;
          if (Math.hypot(motion.clientX - originX, motion.clientY - originY) < 5 && !moved) return;
          moved = true;
          motion.preventDefault();
          const rect = board.getBoundingClientRect();
          const focusX = motion.clientX - rect.left;
          const focusRow = Math.max(0, Math.round((motion.clientY - rect.top - top) / pitch));
          const minX = Math.min(anchorX, focusX) - 1;
          const maxX = Math.max(anchorX, focusX) + 1;
          const minRow = Math.min(anchorRow, focusRow);
          const maxRow = Math.max(anchorRow, focusRow);
          const selected = [...board.querySelectorAll(".iec-layout-marker[data-cell-x]")]
            .filter((cell) => {
              const row = Number(cell.dataset.rowIndex);
              const cellX = Number(cell.dataset.cellX);
              const inside = row >= minRow && row <= maxRow && cellX >= minX && cellX <= maxX;
              cell.classList.toggle("selected", inside);
              return inside;
            });
          const groups = new Set(selected.map((cell) => cell.dataset.groupIndex));
          status.textContent = groups.size === 1
            ? `${selected.length} ladder cells selected. Ctrl+C copies their complete network.`
            : `${selected.length} ladder cells selected across networks. Copy one network at a time.`;
        };
        const up = () => {
          document.removeEventListener("pointermove", move);
          document.removeEventListener("pointerup", up);
          document.removeEventListener("pointercancel", up);
          if (moved) marker.dataset.suppressClick = "true";
        };
        document.addEventListener("pointermove", move);
        document.addEventListener("pointerup", up);
        document.addEventListener("pointercancel", up);
      });
    }
    if (isComment) marker.style.width = `${x(96) - x(0)}px`;
    if (isFunction) {
      if (block) {
        marker.style.height = `${Math.max(44, (block.pinCount - 1) * pitch + 44)}px`;
        marker.title = `${block.name}${block.instance ? ` · ${block.instance}` : ""} · ${block.pinCount} row${block.pinCount === 1 ? "" : "s"}`;
      }
    }
    board.append(marker);
  }
  for (const block of body.iecFunctions || []) {
    const blockOffset = gapOffset(block.rowIndex, block.rawX);
    for (const port of functionPins(block)) {
      const wireable = canWireIecOutput(block,port);
      const outputLink = (body.iecFunctionOperandLinks || []).find(link => link.targetRecordOffset === block.recordOffset && link.ordinal === port.referenceOrdinal);
      const emptyOutput = port.direction === "output" && port.name === "OUT" && port.referenceOrdinal != null
        && (!outputLink || !(body.sourceStrings || []).some(item => item.isIecFunctionOperand && item.iecRecordOffset === outputLink.recordOffset && item.value))
        && !(body.iecCircuitGraph?.occupiedAreas || []).some(area => area.startRowIndex <= port.rowIndex
          && area.endRowIndex >= port.rowIndex && area.startX <= port.rawX && area.endX >= port.rawX
          && area.recordOffset !== outputLink?.recordOffset);
      const pin = element(wireable || emptyOutput ? "button" : "span", `iec-layout-pin ${port.direction}${wireable || emptyOutput ? " wireable" : ""}`);
      pin.dataset.rowIndex = String(port.rowIndex);
      pin.dataset.rawX = String(port.rawX);
      if (emptyOutput) {
        pin.type = "button";
        pin.setAttribute("aria-label", `Assign ${block.name}.${port.name} at L${port.rowIndex}`);
        pin.addEventListener("click", () => { selectRow(port.rowIndex);status.textContent = `${block.name}.${port.name} has no assignment. Double-click or Enter to assign a variable.${wireable ? " F5 draws a BOOL wire." : ""}`; });
        pin.addEventListener("dblclick", event => {event.preventDefault();event.stopPropagation();void showIecEmptyOutputInput(block,port);});
        pin.addEventListener("keydown", event => {
          if (event.repeat || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
          if (event.key === "F5" && !wireable) {
            event.preventDefault();event.stopPropagation();status.textContent = "Numeric OUT needs a destination variable; wire from ENO instead.";return;
          }
          if (event.key !== "Enter") return;
          event.preventDefault();event.stopPropagation();void showIecEmptyOutputInput(block,port);
        });
      }
      if (wireable) {
        pin.type = "button";
        if (!emptyOutput) pin.setAttribute("aria-label", `Wire ${block.name}.${port.name} at L${port.rowIndex}`);
        if (!emptyOutput) pin.addEventListener("click", () => {
          selectRow(port.rowIndex);
          status.textContent = `${block.name}.${port.name} · BOOL. F5, Enter, or double-click draws a wire.${port.name === "OUT" ? " Its output assignment will be replaced by the wire." : " Numeric OUT keeps its destination."}`;
        });
        if (!emptyOutput) pin.addEventListener("dblclick", event => {event.preventDefault();event.stopPropagation();void drawOutputWire(block,port);});
        pin.addEventListener("keydown", event => {
          if (!(emptyOutput ? ["F5"] : ["F5","Enter"]).includes(event.key) || event.repeat || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
          event.preventDefault();event.stopPropagation();void drawOutputWire(block,port);
        });
      }
      pin.style.left = `${x(port.rawX - 1 - blockOffset) - 4}px`;
      pin.style.top = `${y(port.rowIndex) - 4}px`;
      pin.title = `${block.name}.${port.name} · ${port.direction} · ${functionPinType(port)} · L${port.rowIndex}${port.referenceOrdinal == null ? "" : ` · reference ${port.referenceOrdinal}`}`;
      if (!wireable && !emptyOutput) pin.setAttribute("aria-hidden", "true");
      const label = element("span", `iec-layout-pin-label ${port.direction}`, port.name);
      label.style.left = `${x(port.rawX - 1 - blockOffset) + (port.direction === "input" ? 6 : -6)}px`;
      label.style.top = `${y(port.rowIndex) - 8}px`;
      label.title = pin.title;
      if (emptyOutput) pin.title += " · Double-click or Enter to assign a variable" + (wireable ? " · F5 to draw a BOOL wire" : "");
      else if (wireable) pin.title += " · F5, Enter, or double-click to draw a wire";
      else if (port.direction === "output") pin.title += " · Data output: assign a destination variable";
      board.append(pin, label);
    }
  }
  blankIndicator = button("Empty IEC cell", "iec-layout-blank-cell", () => {});
  blankIndicator.tabIndex = 0;
  const showBlank = (position, focus = false) => {
    blankIndicator.hidden = false;
    blankIndicator.style.left = `${visualX(position.rowIndex, position.rawX)}px`;
    blankIndicator.style.top = `${y(position.rowIndex)}px`;
    blankIndicator.dataset.rowIndex = String(position.rowIndex);
    blankIndicator.dataset.rawX = String(position.rawX);
    blankIndicator.setAttribute("aria-label", `Empty IEC cell L${position.rowIndex} x${position.rawX}`);
    if (focus) {
      blankIndicator.focus({ preventScroll: true });
      blankIndicator.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
  };
  const selectBlankPosition = (position) => {
    if (iecOccupiedCell(body, position.rowIndex, position.rawX)) return;
    growingCanvas.ensureRow(position.rowIndex);
    board.querySelectorAll(".iec-layout-marker.selected").forEach(node => node.classList.remove("selected"));
    selectRow(position.rowIndex);
    selectBlank(position);
    showBlank(position, true);
  };
  blankIndicator.hidden = true;
  board.append(blankIndicator);
  if (selectedIecBlank?.programIndex === selectedProgramIndex
    && !iecOccupiedCell(body, selectedIecBlank.rowIndex, selectedIecBlank.rawX)) {
    showBlank(selectedIecBlank);
  }
  blankIndicator.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.repeat && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault(); event.stopPropagation();
      void showIecBlankInput(body, { rowIndex: Number(blankIndicator.dataset.rowIndex),
        rawX: Number(blankIndicator.dataset.rawX) });
      return;
    }
  });
  // Keep the logical row while a multi-row block retains DOM focus. Moving
  // down through its body must not restart from the block's first row.
  board.addEventListener("pointerdown", () => { keyboardCursor = keyboardTarget = null; }, true);
  board.addEventListener("keydown", event => {
    if (event.ctrlKey || event.metaKey || event.altKey || event.target.closest("input, textarea, [contenteditable=true]")) return;
    const target = event.target.closest("[data-row-index][data-raw-x]");
    if (!target) return;
    const origin = keyboardTarget === target && keyboardCursor ? keyboardCursor
      : {rowIndex:Number(target.dataset.rowIndex),rawX:Number(target.dataset.rawX)};
    const position = moveIecCursor(origin, event.key);
    if (!position) return;
    event.preventDefault(); event.stopPropagation();
    growingCanvas.ensureRow(position.rowIndex);
    const marker = [...navigationMarkers.values()].find(node =>
      Number(node.dataset.rowIndex) === position.rowIndex && Number(node.dataset.rawX) === position.rawX)
      || navigationMarkers.get(iecCursorRecord(body, position));
    if (marker) {
      blankIndicator.hidden = true;
      marker.click();
      marker.focus({preventScroll:true});
      marker.scrollIntoView({block:"nearest",inline:"nearest"});
      keyboardTarget = marker;
    } else {
      selectBlankPosition(position);
      keyboardTarget = blankIndicator;
    }
    keyboardCursor = position;
  });
  const dragBlankCells = new Map();
  const clearDragBlankCells = () => {
    for (const node of dragBlankCells.values()) node.remove();
    dragBlankCells.clear();
  };
  const cellAtPoint = (clientX, clientY) => {
    const bounds = board.getBoundingClientRect();
    const rowIndex = Math.max(0, Math.min(lastEditableRow,
      Math.round((clientY - bounds.top - top) / pitch)));
    const localX = clientX - bounds.left;
    const rawX = Array.from({ length: 33 }, (_, index) => 1 + index * 3)
      .reduce((closest, candidate) => Math.abs(visualX(rowIndex, candidate) + 36 - localX)
        < Math.abs(visualX(rowIndex, closest) + 36 - localX) ? candidate : closest, 1);
    return { rowIndex, rawX };
  };
  board.addEventListener("dblclick", (event) => {
    if (event.target.closest(".iec-layout-marker, .iec-layout-insert, .iec-layout-row, .iec-layout-pin")) return;
    event.preventDefault();
    const position = cellAtPoint(event.clientX, event.clientY);
    if (iecOccupiedCell(body, position.rowIndex, position.rawX)) return;
    selectBlankPosition(position);
    void showIecBlankInput(body, position);
  });
  const selectDragRange = (anchor, focus) => {
    clearDragBlankCells();
    const minRow = Math.min(anchor.rowIndex, focus.rowIndex);
    const maxRowInRange = Math.max(anchor.rowIndex, focus.rowIndex);
    const minX = Math.min(anchor.rawX, focus.rawX);
    const maxX = Math.max(anchor.rawX, focus.rawX);
    let blankCount = 0;
    for (let rowIndex = minRow; rowIndex <= maxRowInRange; rowIndex += 1) {
      for (let rawX = minX; rawX <= maxX; rawX += 3) {
        if (iecOccupiedCell(body, rowIndex, rawX)) continue;
        const cell = element("span", "iec-layout-drag-cell");
        cell.style.left = `${visualX(rowIndex, rawX)}px`;
        cell.style.top = `${y(rowIndex)}px`;
        cell.setAttribute("aria-label", `Selected empty IEC cell L${rowIndex} x${rawX}`);
        board.append(cell);
        dragBlankCells.set(`${rowIndex}:${rawX}`, cell);
        blankCount += 1;
      }
    }
    const selectedMarkers = [...board.querySelectorAll(".iec-layout-marker[data-cell-x]")]
      .filter((marker) => {
        const rowIndex = Number(marker.dataset.rowIndex);
        const rawX = Number(marker.dataset.rawX);
        const inside = rowIndex >= minRow && rowIndex <= maxRowInRange
          && rawX >= minX && rawX <= maxX;
        marker.classList.toggle("selected", inside);
        return inside;
      });
    status.textContent = `${blankCount + selectedMarkers.length} IEC cells selected`;
  };
  board.addEventListener("pointerdown", (event) => {
    if (event.button !== 0 || event.target.closest(
      ".iec-layout-row, .iec-layout-marker, .iec-layout-insert, .iec-layout-pin, .iec-layout-pin-label",
    )) return;
    clearDragBlankCells();
    const anchor = cellAtPoint(event.clientX, event.clientY);
    selectBlankPosition(anchor);
    const originX = event.clientX;
    const originY = event.clientY;
    let moved = false;
    const move = (motion) => {
      if (!(motion.buttons & 1)) return;
      if (!moved && Math.hypot(motion.clientX - originX, motion.clientY - originY) < 5) return;
      moved = true;
      motion.preventDefault();
      selectDragRange(anchor, cellAtPoint(motion.clientX, motion.clientY));
    };
    const up = () => {
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerup", up);
      document.removeEventListener("pointercancel", up);
      // The pointerdown target can be the board before the cell indicator
      // moves into place. Its default mouse focus then replaces our focus.
      if (!moved) blankIndicator.focus({ preventScroll: true });
    };
    document.addEventListener("pointermove", move);
    document.addEventListener("pointerup", up);
    document.addEventListener("pointercancel", up);
  });
  const growingCanvas = attachGrowingCanvas(viewport, {
    initialRows: lastEditableRow + 1, maxRows: 16383, pitch, top,
    rememberedRows: ladderCanvasExtents.get(canvasExtentKey()),
    resize: count => {
      lastEditableRow = count - 1;
      board.style.height = `${y(count - 1) + pitch}px`;
      svg.setAttribute("viewBox", `0 0 ${x(100) + 32} ${y(count - 1) + pitch}`);
      ladderCanvasExtents.set(canvasExtentKey(), count);
    },
    renderWindow: renderRowLabels,
  });
  viewport.append(board);
  section.append(viewport);
  return section;
}

let instructionPromptOpen = false;

function instructionSuggestions(iec) {
  const locals = iec ? current.summary.localVariables?.[selectedProgramIndex] || [] : [];
  const system = iec ? current.summary.iecSystemVariables || [] : [];
  return [...locals, ...system, ...(current.summary.variables || [])].filter(symbol => !symbol.isInstance)
    .map(symbol => ({ value: iec ? symbol.name : symbol.address, dataType: symbol.dataType, writable: symbol.writable,
      description: [symbol.name, symbol.dataType, symbol.comment || symbol.description].filter(Boolean).join(" · ") }))
    .filter(symbol => symbol.value);
}

async function requestLadderInstruction({ choices, value = "", title, mode, iec, focusSelector, build, afterInsert, singleValue = false, allowEmpty = false }) {
  if (instructionPromptOpen) return;
  const fileUri = current.file.uri;
  const programIndex = selectedProgramIndex;
  const source = current.file.bytes;
  instructionPromptOpen = true;
  try {
    const requestId = ++nextContactPromptId;
    const cachedBuild = validatedEditCache((bytes, command, operands) =>
      build(choices.find(choice => choice.mnemonic === command), operands, bytes, programIndex));
    const validate = result => {
      if (current?.file.uri !== fileUri || selectedProgramIndex !== programIndex || current.file.bytes !== source) {
        throw new Error("The program changed while the editor was open. Reopen the instruction editor.");
      }
      const choice = choices.find(item => item.mnemonic === result?.command);
      if (!choice || !Array.isArray(result.operands) || (result.operands.length < (choice.minOperandCount ?? choice.operandCount) || result.operands.length > choice.operandCount)
        || result.operands.some(operand => !instructionOperandText(operand, iec))) {
        throw new Error("Unknown command or incorrect operands");
      }
      return cachedBuild(source, result.command, result.operands);
    };
    const result = await new Promise(resolve => {
      pendingContactPrompts.set(requestId, { resolve, focusSelector, fileUri, programIndex, validate, restoreFocus: false });
      vscode.postMessage({ type: "promptLadderInstruction", requestId, title,
        instruction: { choices, value, mode, singleValue, allowEmpty, iec: Boolean(iec), suggestions: [...instructionSuggestions(iec), ...choices.flatMap(choice => choice.suggestions || [])] } });
    });
    if (result) await applyEdit(() => validate(result), `${mode === "edit" ? "Edit" : "Insert"} ${result.command}`, () => {
      if (afterInsert) focusSelector = afterInsert(choices.find(choice => choice.mnemonic === result.command)) || focusSelector;
    });
  } finally {
    instructionPromptOpen = false;
    requestAnimationFrame(() => {
      if (current?.file.uri === fileUri && selectedProgramIndex === programIndex) document.querySelector(focusSelector)?.focus({ preventScroll: true });
    });
  }
}

function showXgkBlankInput(ladder, position) {
  const choices = xgkBlankCommands(ladder, position);
  return requestLadderInstruction({ choices, title: `Insert · L${position.rawY} column ${position.column + 1}`, mode: "insert", iec: false,
    focusSelector: `[data-ladder-key="${ladderPositionKey(position)}"]`,
    afterInsert: choice => {
      const output = ["coil", "function"].includes(choice.category);
      const next = { ...position, column: output ? 9 : Math.min(9, position.column + (choice.category === "comparison" ? choice.operandCount + 1 : 1)) };
      selectedLadderComment = null;
      selectedLadderAnchor = selectedLadderFocus = next;
      return `[data-ladder-key="${ladderPositionKey(next)}"]`;
    },
    build: (choice, operands, bytes, program) => {
      if (!ladder.structuralEditing) throw new Error("This program layout does not support structural editing");
      if (choice.category === "comparison") return insert_xgwx_ladder_comparison(bytes, program, position.rawY, position.column, choice.nativeMnemonic || choice.mnemonic, JSON.stringify(operands));
      if (choice.category === "function") return insert_xgwx_ladder_instruction(bytes, program, position.rawY, choice.mnemonic, JSON.stringify(operands));
      return edit_xgwx_ladder_cell(bytes, program, { rawY: position.rawY, column: xgkInsertionColumn(choice, position), expected: null,
        replacement: { kind: choice.kind, operand: operands[0]?.toUpperCase() || "" } });
    } });
}

function showXgkElementInput(cell, ladder) {
  const expected = structuralElement(cell);
  const comparison = cell.kind === "Comparison";
  let choices;
  if (expected) choices = elementCommands(cell.coil ? "coil" : "contact", false, Boolean(cell.coil));
  else choices = comparison ? xgkInputCommands(ladder.comparisonChoices) : ladder.instructionChoices || [];
  // Retained incompatible commands may have their operands repaired. They
  // remain absent from blank-cell insertion and other commands' replacements.
  if (!expected && !comparison) {
    const retained = (ladder.retainedInstructionChoices || []).find(choice => choice.mnemonic === cell.value);
    if (retained) choices = [...choices, retained];
  }
  const selected = expected ? choices.find(choice => choice.kind === expected.kind) : choices.find(choice => (choice.nativeMnemonic || choice.mnemonic) === cell.value);
  const value = [selected?.mnemonic || cell.value, ...(expected ? expected.operand ? [expected.operand] : [] : cell.operands || [])].join(" ");
  return requestLadderInstruction({ choices, value, mode: "edit", iec: false, title: `Edit · L${cell.rawY}`,
    focusSelector: `[data-cell-offset="${cell.offset}"]`,
    build: (choice, operands, bytes, program) => {
      if (expected) {
        const replacement = { kind: choice.kind, operand: operands[0]?.toUpperCase() || "" };
        if (!ladder.structuralEditing) {
          if (choice.kind !== expected.kind) throw new Error("This layout does not support changing element kind");
          return update_xgwx_ladder_cell(bytes, program, cell.offset, cell.sourceText, replacement.operand);
        }
        return edit_xgwx_ladder_cell(bytes, program, { rawY: cell.rawY, column: ldCellColumn(cell.rawX), expected, replacement });
      }
      if (!cell.instructionTextEditing || !selected) throw new Error("This instruction is read only");
      return update_xgwx_ladder_cell(bytes, program, cell.offset, cell.sourceText, [choice.nativeMnemonic || choice.mnemonic, ...operands].join(","));
    } });
}

function showIecBlankInput(body, position, focusSelector = ".iec-layout-blank-cell") {
  const site = iecContactInsertionSiteAt(body, position.rowIndex, position.rawX);
  const newRow = !(body.iecRows || []).some(row => row.rowIndex === position.rowIndex);
  const wiredComparison = (body.iecWiredComparisonInsertionSites || []).some(site =>
    site.rowIndex === position.rowIndex && site.rawX === position.rawX);
  const scalarChoices = wiredComparison ? scalarIecCommands(true).filter(choice =>
    ["EQ", "GT", "GE", "LT", "LE"].includes(choice.mnemonic)) : scalarIecCommands(false, true);
  const choices = [
    ...elementCommands("contact", true),
    ...(!site ? elementCommands("coil", true) : []),
    ...(position.rawX >= 4 && position.rawX <= 91 ? [...scalarChoices, ...[
      ["INT_TO_UDINT", "INT", "UDINT"],
      ["UDINT_TO_TIME", "UDINT", "TIME"],
      ["TIME_TO_UDINT", "TIME", "UDINT"],
      ["UDINT_TO_INT", "UDINT", "INT"],
    ].map(([mnemonic, source, destination]) => ({
      mnemonic, category: "function", operandCount: 2,
      operandRules: [{label:"Source",dataTypes:[source]},
        {label:"Destination",dataTypes:[destination],allowsConstant:false}],
    }))] : []),
  ];
  const atPosition = sites => (sites || []).find(site => site.rowIndex === position.rowIndex && site.rawX === position.rawX);
  const terminal = atPosition(body.iecTerminalFunctionInsertionSites);
  const timer = atPosition(body.iecTerminalTimerInsertionSites);
  const standalone = atPosition(body.iecStandaloneFunctionInsertionSites);
  const instanceSite = atPosition(body.iecFunctionCellInsertionSites);
  if (terminal) {
    const index = choices.findIndex(choice => choice.mnemonic === "MOVE");
    if (index >= 0) choices.splice(index, 1);
    choices.push({ ...scalarIecCommands().find(choice => choice.mnemonic === "MOVE"), category: "terminal" });
  }
  if (timer) {
    const connected = [10, 19, 22].includes(timer.rawX);
    choices.push({ mnemonic: "TON", category: "terminalTimer", operandCount: connected ? 2 : 3,
      operandRules: [{label:"Instance",dataTypes:["TON"],allowsConstant:false},
        {label:"Preset time",dataTypes:["TIME"]},
        ...(!connected ? [{label:"Elapsed time destination",dataTypes:["TIME"],allowsConstant:false}] : [])],
      suggestions: (current.summary.localVariables?.[selectedProgramIndex] || [])
        .filter(symbol => symbol.isInstance && symbol.typeReference === "TON")
        .map(symbol => ({value:symbol.name,dataType:"TON",description:"TON instance"})) });
  }
  if (standalone) {
    const conversionIndex = choices.findIndex(choice => choice.mnemonic === "WORD_TO_UDINT");
    if (conversionIndex >= 0) choices.splice(conversionIndex, 1);
    choices.push({ mnemonic: "WORD_TO_UDINT", category: "standalone", operandCount: 2,
    operandRules: [{label:"Source",dataTypes:["WORD"]},{label:"Destination",dataTypes:["UDINT"],allowsConstant:false}] });
  }
  if (instanceSite) {
    const name = instanceSite.functionName || "FF";
    choices.push({ mnemonic: name, category: "instance", operandCount: 1,
      operandRules: [{label:"Instance",dataTypes:[name],allowsConstant:false}],
      suggestions: (current.summary.localVariables?.[selectedProgramIndex] || [])
        .filter(symbol => symbol.isInstance && symbol.typeReference === name)
        .map(symbol => ({value:symbol.name,dataType:name,description:`${name} instance`})) });
  }
  return requestLadderInstruction({ choices, mode: "insert", iec: true, title: `Insert · L${position.rowIndex}`, focusSelector,
    afterInsert: choice => {
      if (["terminalTimer", "function"].includes(choice.category)) {
        const updated = current.summary.ladder.find(body => body.programIndex === selectedProgramIndex);
        const element = (updated.sourceStrings || []).find(item => item.isIecFunctionName
          && item.iecRowIndex === position.rowIndex && item.iecPosition?.[0] === position.rawX);
        selectedIecBlank = null;
        selectedIecElement = element ? { programIndex: selectedProgramIndex, offset: element.offset } : null;
        return element ? `.iec-layout-marker[data-iec-offset="${element.offset}"]` : focusSelector;
      }
      if (!["contact", "coil"].includes(choice.category)) return;
      const next = choice.category === "coil"
        ? { rowIndex: position.rowIndex + 1, rawX: 1 }
        : { rowIndex: position.rowIndex, rawX: Math.min(94, position.rawX + 3) };
      const updated = current.summary.ladder.find(body => body.programIndex === selectedProgramIndex);
      const element = (updated.sourceStrings || []).find(item => item.iecRowIndex === next.rowIndex
        && item.iecPosition?.[0] === next.rawX && (item.iecElementKind || item.isIecFunctionName));
      selectedIecRow = { programIndex: selectedProgramIndex, rowIndex: next.rowIndex };
      selectedIecInsertion = null;
      selectedIecElement = element ? { programIndex: selectedProgramIndex, offset: element.offset } : null;
      selectedIecBlank = element ? null : { programIndex: selectedProgramIndex, ...next };
      return element ? `.iec-layout-marker[data-iec-offset="${element.offset}"]` : ".iec-layout-blank-cell";
    },
    build: (choice, operands, bytes, program) => {
      if (choice.category === "terminalTimer") {
        if ([10, 22].includes(timer.rawX)) return insert_xgwx_iec_ld_function(bytes, program, position.rowIndex, position.rawX, "TON", JSON.stringify(operands));
        return insert_xgwx_iec_ld_terminal_timer(bytes, program, timer.contactOffset, operands[0], operands[1], operands[2] || "");
      }
      if (choice.category === "terminal") return insert_xgwx_iec_ld_terminal_move(bytes, program, terminal.contactOffset, operands[0], operands[1]);
      if (choice.category === "standalone") return insert_xgwx_iec_ld_standalone_function(bytes, program, standalone.insertionOffset, choice.mnemonic, operands[0], operands[1]);
      if (choice.category === "instance") return insert_xgwx_iec_ld_function_cell(bytes, program, instanceSite.insertionOffset, choice.mnemonic, operands[0]);
      if (choice.category === "function") return insert_xgwx_iec_ld_function(bytes, program, position.rowIndex, position.rawX, choice.mnemonic, JSON.stringify(operands));
      if (newRow || !site) return insert_xgwx_iec_ld_single_element(bytes, program, position.rowIndex,
        position.rawX, choice.category, choice.iecKind, operands[0]);
      if (site.type === "leading") return insert_xgwx_iec_ld_leading_contact(bytes, program, site.insertionOffset, choice.iecKind, operands[0]);
      if (site.type === "short") return insert_xgwx_iec_ld_short_wire_contact(bytes, program, site.wireOffset, site.rawX, choice.iecKind, operands[0]);
      return insert_xgwx_iec_ld_contact(bytes, program, site.wireOffset, position.rawX, site.startX, site.endX, choice.iecKind, operands[0]);
    } });
}

function showIecElementInput(item, body) {
  if (item.isIecFunctionOperand) return showIecFunctionOperandInput(item, body);
  const contact = IEC_CONTACT_KIND_BY_SOURCE_LABEL.get(item.iecElementKind);
  const coil = IEC_COIL_KIND_BY_SOURCE_LABEL.get(item.iecElementKind);
  if (!contact && !coil) return showIecFunctionInput(item, body);
  const choices = elementCommands(contact ? "contact" : "coil", true, Boolean(coil));
  const expectedKind = contact || coil;
  const selected = choices.find(choice => choice.iecKind === expectedKind);
  return requestLadderInstruction({ choices, value: `${selected.mnemonic} ${item.value}`, mode: "edit", iec: true,
    title: `Edit · L${item.iecRowIndex}`, focusSelector: `.iec-layout-marker[data-iec-offset="${item.offset}"]`,
    build: (choice, operands, bytes, program) => {
      let candidate = bytes;
      if (choice.iecKind !== expectedKind) candidate = (contact ? update_xgwx_iec_ld_contact_kind : update_xgwx_iec_ld_coil_kind)(candidate, program, item.offset, expectedKind, choice.iecKind);
      if (operands[0] !== item.value) candidate = update_xgwx_iec_ld_element_operand(candidate, program, item.offset, item.value, operands[0]);
      return candidate;
    } });
}

function showIecFunctionOperandInput(item, body) {
  const link = (body.iecFunctionOperandLinks || []).find(link => link.recordOffset === item.iecRecordOffset);
  const block = (body.iecFunctions || []).find(block => block.recordOffset === link?.targetRecordOffset);
  const pin = block && functionPins(block).find(pin => pin.referenceOrdinal === link.ordinal);
  if (!pin) { vscode.postMessage({ type: "showError", message: "This operand has no decoded pin metadata" }); return; }
  let cleared = false;
  return requestLadderInstruction({
    choices: [{ mnemonic: block.name, operandCount: 1, ...(link.isOutput && pin.name === "OUT" ? {minOperandCount:0} : {}), operandRules: [iecPinRule(pin)] }],
    allowEmpty: link.isOutput && pin.name === "OUT",
    value: item.value, mode: "edit", iec: true, singleValue: true,
    title: `Edit ${block.name}.${pin.name} · L${item.iecRowIndex}`,
    focusSelector: `.iec-layout-marker[data-iec-offset="${item.offset}"]`,
    afterInsert: () => cleared ? `[aria-label="Assign ${block.name}.${pin.name} at L${item.iecRowIndex}"]` : null,
    build: (_choice, operands, bytes, program) => {
      cleared = operands.length === 0;
      return update_xgwx_iec_ld_function_operand(bytes, program, item.offset, item.value, operands[0] ?? "");
    },
  });
}

function showIecEmptyOutputInput(block, pin) {
  return requestLadderInstruction({
    choices:[{mnemonic:block.name,operandCount:1,operandRules:[iecPinRule(pin)]}],
    value:"",mode:"edit",iec:true,singleValue:true,
    title:`Assign ${block.name}.${pin.name} · L${pin.rowIndex}`,
    focusSelector:`[aria-label="Assign ${block.name}.${pin.name} at L${pin.rowIndex}"]`,
    build:(_choice,operands,bytes,program) => assign_xgwx_iec_ld_function_output_operand(
      bytes,program,block.recordOffset,block.name,pin.referenceOrdinal,operands[0]),
  });
}

function deleteIecElementBytes(bytes, item, body) {
  if (item.iecElementKind && IEC_CONTACT_KIND_BY_SOURCE_LABEL.has(item.iecElementKind)) {
    const gap = iecAddressedContactSites(body,"iecNoContactDeletionSites").find(site => site.contactOffset === item.iecRecordOffset);
    const cell = iecAddressedContactSites(body,"iecNoContactCellDeletionSites").find(site => site.contactOffset === item.iecRecordOffset);
    const site = gap || cell;
    if (!site) return delete_xgwx_iec_ld_isolated_element(bytes,selectedProgramIndex,item.iecRecordOffset,item.value);
    return (gap ? delete_xgwx_iec_ld_contact : delete_xgwx_iec_ld_contact_cell)(bytes,selectedProgramIndex,site.contactOffset,site.rawX,site.kind,item.value);
  }
  if (IEC_COIL_KIND_BY_SOURCE_LABEL.has(item.iecElementKind)) {
    try {return delete_xgwx_iec_ld_terminal_coil(bytes,selectedProgramIndex,item.iecRecordOffset,item.value);}
    catch {return delete_xgwx_iec_ld_isolated_element(bytes,selectedProgramIndex,item.iecRecordOffset,item.value);}
  }
  const block = (body.iecFunctions || []).find(block => block.nameOffset === item.offset);
  if (!block) throw new Error("This selected item is not a deletable function block");
  const deletions = [delete_xgwx_iec_ld_branch_function, delete_xgwx_iec_ld_branched_arithmetic,
    delete_xgwx_iec_ld_scalar_chain_function, delete_xgwx_iec_ld_terminal_function,
    delete_xgwx_iec_ld_standalone_function, delete_xgwx_iec_ld_function_cell,
    delete_xgwx_iec_ld_connected_arithmetic, delete_xgwx_iec_ld_eq_chain_head,
    delete_xgwx_iec_ld_heating_chain_head, delete_xgwx_iec_ld_heating_chain_middle,
    delete_xgwx_iec_ld_heating_chain_x3_eq_repaired, delete_xgwx_iec_ld_heating_chain_contact_eq,
    delete_xgwx_iec_ld_heating_chain_x15_eq];
  for (const remove of deletions) {
    try {return remove(bytes,selectedProgramIndex,block.recordOffset,item.value);}
    catch { /* Guarded writers leave the input unchanged on failure. */ }
  }
  throw new Error("This connected function layout does not yet support block deletion");
}

async function deleteIecContact(item, body) {
  const gap = iecAddressedContactSites(body, "iecNoContactDeletionSites")
    .find(site => site.contactOffset === item.iecRecordOffset);
  const cell = iecAddressedContactSites(body, "iecNoContactCellDeletionSites")
    .find(site => site.contactOffset === item.iecRecordOffset);
  const site = gap || cell;
  if (!site) {
    await applyEdit(() => { throw new Error("This contact layout does not yet support deletion"); }, "Delete IEC contact");
    return;
  }
  const edited = await applyEdit(() => (gap ? delete_xgwx_iec_ld_contact : delete_xgwx_iec_ld_contact_cell)(
    current.file.bytes, selectedProgramIndex, site.contactOffset, site.rawX, site.kind, site.variable),
    `Delete IEC contact ${site.variable}`);
  if (edited) {
    const rawX = item.iecPosition?.[0] ?? 1;
    const updated = current.summary.ladder.find(program => program.programIndex === selectedProgramIndex);
    const replacement = (updated.sourceStrings || []).find(element => element.iecRowIndex === item.iecRowIndex
      && element.iecPosition?.[0] === rawX && (element.iecElementKind || element.isIecFunctionName));
    selectedIecElement = replacement ? { programIndex: selectedProgramIndex, offset: replacement.offset } : null;
    selectedIecBlank = replacement ? null : { programIndex: selectedProgramIndex, rowIndex: item.iecRowIndex, rawX };
    renderWorkspace();
    const selector = replacement ? `.iec-layout-marker[data-iec-offset="${replacement.offset}"]` : ".iec-layout-blank-cell";
    requestAnimationFrame(() => document.querySelector(selector)?.focus({ preventScroll: true }));
  }
}

async function deleteIecCoil(item) {
  const edited = await applyEdit(() => delete_xgwx_iec_ld_terminal_coil(
    current.file.bytes, selectedProgramIndex, item.iecRecordOffset, item.value),
    `Delete IEC coil ${item.value}`);
  if (edited) {
    selectedIecElement = null;
    selectedIecBlank = { programIndex: selectedProgramIndex, rowIndex: item.iecRowIndex,
      rawX: item.iecPosition?.[0] ?? 94 };
    renderWorkspace();
    requestAnimationFrame(() => document.querySelector(".iec-layout-blank-cell")?.focus({ preventScroll: true }));
  }
}

async function deleteIecFunction(item, body) {
  const block = (body.iecFunctions || []).find(block => block.nameOffset === item.offset);
  if (!block) return;
  const edited = await applyEdit(() => {
    const deletions = [delete_xgwx_iec_ld_branch_function, delete_xgwx_iec_ld_branched_arithmetic,
      delete_xgwx_iec_ld_scalar_chain_function,
      delete_xgwx_iec_ld_terminal_function, delete_xgwx_iec_ld_standalone_function,
      delete_xgwx_iec_ld_function_cell, delete_xgwx_iec_ld_connected_arithmetic,
      delete_xgwx_iec_ld_eq_chain_head, delete_xgwx_iec_ld_heating_chain_head,
      delete_xgwx_iec_ld_heating_chain_middle, delete_xgwx_iec_ld_heating_chain_x3_eq_repaired,
      delete_xgwx_iec_ld_heating_chain_contact_eq, delete_xgwx_iec_ld_heating_chain_x15_eq];
    for (const remove of deletions) {
      try { return remove(current.file.bytes, selectedProgramIndex, block.recordOffset, block.name); }
      catch { /* Each writer rejects unsupported geometry without changing the source. */ }
    }
    throw new Error("This connected function layout does not yet support block deletion");
  }, `Delete IEC function ${block.name} at L${block.rowIndex}`);
  if (edited) {
    selectedIecElement = null;
    selectedIecInsertion = null;
    selectedIecBlank = { programIndex: selectedProgramIndex, rowIndex: block.rowIndex, rawX: block.rawX };
    selectedIecRow = { programIndex: selectedProgramIndex, rowIndex: block.rowIndex };
    renderWorkspace();
    requestAnimationFrame(() => document.querySelector(".iec-layout-blank-cell")?.focus({ preventScroll: true }));
  }
}

function groupIecInstructionOperand(value) {
  if (!/\s/.test(value)) return value;
  const text = value.trim();
  if (text.startsWith("(")) {
    let depth = 0;
    for (let i = 0; i < text.length; i++) {
      if (text[i] === "(") depth++;
      if (text[i] === ")") depth--;
      if (depth === 0) return i === text.length - 1 ? text : `(${text})`;
    }
  }
  return `(${text})`;
}

function showIecFunctionInput(item, body) {
  const link = (body.iecFunctionOperandLinks || []).find(link => link.recordOffset === item.iecRecordOffset);
  const block = (body.iecFunctions || []).find(block => block.nameOffset === item.offset || block.recordOffset === link?.targetRecordOffset);
  if (!block) { vscode.postMessage({ type: "showError", message: "This function has no decoded editing metadata" }); return; }
  const fields = (block.pins || []).filter(pin => !pin.isControl)
    .sort((a, b) => Number(a.direction === "output") - Number(b.direction === "output")
      || (a.referenceOrdinal ?? 0) - (b.referenceOrdinal ?? 0)).map(pin => {
    const link = (body.iecFunctionOperandLinks || []).find(link => link.targetRecordOffset === block.recordOffset && link.ordinal === pin.referenceOrdinal);
    const source = link && (body.sourceStrings || []).find(source => source.iecRecordOffset === link.recordOffset && source.isIecFunctionOperand);
    return source ? { pin, source, promptValue: groupIecInstructionOperand(source.value) } : null;
  }).filter(Boolean);
  if (block.name === "TON" && block.instance && fields.length === 1
    && (body.iecScalarChainDeletionSites || []).some(site => site.blockOffset === block.recordOffset)) {
    const choice = { mnemonic: "TON", operandCount: 2,
      operandRules: [{label:"Instance",dataTypes:["TON"],allowsConstant:false},
        {label:"Preset time",dataTypes:["TIME"]}],
      suggestions: (current.summary.localVariables?.[selectedProgramIndex] || [])
        .filter(symbol => symbol.isInstance && symbol.typeReference === "TON")
        .map(symbol => ({value:symbol.name,dataType:"TON",description:"TON instance"})) };
    return requestLadderInstruction({ choices: [choice],
      value: ["TON", block.instance, fields[0].promptValue].join(" "), mode: "edit", iec: true,
      title: `Edit TON · ${block.instance}`, focusSelector: `.iec-layout-marker[data-iec-offset="${block.nameOffset}"]`,
      build: (choice, operands, bytes, program) => {
        if (operands[0] === block.instance && operands[1] === fields[0].promptValue) return bytes;
        return replace_xgwx_iec_ld_scalar_chain_function(bytes, program, block.recordOffset,
          "TON", "TON", JSON.stringify(operands));
      } });
  }
  const family = ["ADD", "SUB", "MUL", "DIV"].includes(block.name) ? ["ADD", "SUB", "MUL", "DIV"]
    : ["EQ", "GT", "GE", "LT", "LE"].includes(block.name) ? ["EQ", "GT", "GE", "LT", "LE"] : [block.name];
  let scalarReplacement = null;
  if (scalarIecCommands().some(choice => choice.mnemonic === block.name)) {
    try {
      delete_xgwx_iec_ld_branch_function(current.file.bytes, selectedProgramIndex, block.recordOffset, block.name);
      scalarReplacement = replace_xgwx_iec_ld_branch_function;
    } catch {
      if ((body.iecScalarChainDeletionSites || []).some(site => site.blockOffset === block.recordOffset)) {
        scalarReplacement = replace_xgwx_iec_ld_scalar_chain_function;
      }
    }
  }
  const wiredComparison = family[0] === "EQ" && fields.length === 2;
  const choices = scalarReplacement ? (wiredComparison ? scalarIecCommands(true).filter(choice =>
    family.includes(choice.mnemonic)) : scalarIecCommands()) : family.map(mnemonic => ({ mnemonic, operandCount: fields.length,
    operandRules: fields.map(({pin}) => iecPinRule(pin)) }));
  return requestLadderInstruction({ choices, value: [block.name, ...fields.map(field => field.promptValue)].join(" "), mode: "edit", iec: true,
    title: `Edit ${block.name}${block.instance ? ` · ${block.instance}` : ""}`, focusSelector: `.iec-layout-marker[data-iec-offset="${block.nameOffset}"]`,
    build: (choice, operands, bytes, program) => {
      if (!fields.length) throw new Error("This function's operands are read only");
      if (scalarReplacement && (choice.mnemonic !== block.name
        || operands.some((operand, index) => operand !== fields[index].promptValue))) {
        return scalarReplacement(bytes, program, block.recordOffset, block.name,
          choice.mnemonic, JSON.stringify(operands));
      }
      let candidate = bytes;
      if (choice.mnemonic !== block.name) candidate = (family[0] === "ADD" ? update_xgwx_iec_ld_arithmetic_function : update_xgwx_iec_ld_comparison_function)(candidate, program, block.nameOffset, block.name, choice.mnemonic);
      const edits = fields.map((field, index) => ({ ...field.source, replacement: operands[index] === field.promptValue ? field.source.value : operands[index] })).sort((a,b) => b.offset - a.offset);
      for (const edit of edits) if (edit.replacement !== edit.value) candidate = update_xgwx_iec_ld_function_operand(candidate, program, edit.offset, edit.value, edit.replacement);
      return candidate;
    } });
}

function isEditableComparison(cell, ladder) {
  return cell?.kind === "Comparison" && cell.instructionTextEditing
    && ladder.comparisonChoices?.some(choice => choice.mnemonic === cell.value);
}

function functionPins(block) {
  return [block.controlInput, block.controlOutput, ...(block.pins || [])].filter(Boolean);
}

function functionPinType(pin) {
  if (!pin) return "unknown type";
  return pin.typeExpression || pin.dataType || `type mask 0x${pin.dataTypeMask.toString(16)}`;
}

function renderIecProgramSource(body) {
  const section = element("section", "iec-program-source");
  const strings = body.sourceStrings || [];
  const functionByOffset = new Map((body.iecFunctions || []).map((block) => [block.recordOffset, block]));
  const terminalFunctionDeletionByOffset = new Map(
    (body.iecTerminalFunctionDeletionSites || []).map((site) => [site.blockOffset, site]),
  );
  const standaloneFunctionDeletionByOffset = new Map(
    (body.iecStandaloneFunctionDeletionSites || []).map((site) => [site.blockOffset, site]),
  );
  const functionCellDeletionByOffset = new Map(
    (body.iecFunctionCellDeletionSites || []).map((site) => [site.blockOffset, site]),
  );
  const connectedArithmeticDeletionByOffset = new Map(
    (body.iecConnectedArithmeticDeletionSites || []).map((site) => [site.blockOffset, site]),
  );
  const pinByRecord = new Map((body.iecFunctionOperandLinks || []).map((link) => [link.recordOffset, link]));
  const toolbar = element("div", "editor-toolbar");
  const searchWrap = element("label", "filter-control");
  searchWrap.append(icon("search"));
  const search = document.createElement("input");
  search.type = "search";
  search.placeholder = "Filter stored text…";
  search.setAttribute("aria-label", "Filter program text");
  searchWrap.append(search);
  const count = element("span", "toolbar-summary", `${strings.length} fragments`);
  toolbar.append(searchWrap, count);
  section.append(toolbar);

  const table = createTable(["Byte offset", "Type", "Stored text", "IEC position", "Stored row", "Edit", "Element kind", "Block pin"]);
  const rows = strings.map((item) => {
    const row = table.tBodies[0].insertRow();
    row.dataset.iecOffset = String(item.offset);
    row.tabIndex = -1;
    const kind = item.isIecComment ? "Comment" : item.iecElementKind || (item.isIecFunctionOperand ? "Function operand expression" : item.isIecArithmeticFunction ? "Arithmetic function block" : item.isIecComparisonFunction ? "Comparison function block" : item.isIecFunctionName ? "IEC function block" : item.isIecFunctionInstance ? "Function instance" : item.iecRecordKind === "Function block" ? "Function block field" : "Unclassified");
    const position = item.iecPosition ? `x ${item.iecPosition[0]}, y ${item.iecPosition[1]}` : "—";
    const storedRow = item.iecRowIndex == null ? "—" : `L${item.iecRowIndex} · group ${item.iecGroupIndex + 1}`;
    appendCells(row, [item.offset, kind, item.value, position, storedRow]);
    const action = row.insertCell();
    const typeAction = row.insertCell();
    const pin = pinByRecord.get(item.iecRecordOffset);
    const block = pin && functionByOffset.get(pin.targetRecordOffset);
    const decodedPin = block && functionPins(block).find((candidate) => candidate.referenceOrdinal === pin.ordinal);
    const pinLabel = block ? `${block.name}.${decodedPin?.name || `pin ${pin.ordinal}`} · ${functionPinType(decodedPin)}` : "—";
    row.insertCell().textContent = pinLabel;
    if (item.isIecComment || item.iecElementKind || item.isIecFunctionOperand || item.isIecArithmeticFunction || item.isIecComparisonFunction) {
      const editButton = () => {
        const control = button("Edit", "secondary-button", openEditor);
        control.textContent = "Edit";
        return control;
      };
      const openEditor = () => {
        const textCell = row.cells[2];
        const editor = element("div", "iec-comment-editor");
        const input = document.createElement("textarea");
        input.value = item.value;
        input.rows = Math.min(5, Math.max(2, Math.ceil(item.value.length / 65)));
        input.setAttribute("aria-label", `Edit IEC ${kind.toLowerCase()} at byte ${item.offset}`);
        const length = element("span", "muted");
        const save = button(`Save ${kind.toLowerCase()}`, "primary-button", async () => {
          await applyEdit(
            () => (item.isIecComment ? update_xgwx_iec_ld_comment
              : item.iecElementKind ? update_xgwx_iec_ld_element_operand
                : item.isIecFunctionOperand ? update_xgwx_iec_ld_function_operand
                  : item.isIecArithmeticFunction ? update_xgwx_iec_ld_arithmetic_function
                    : update_xgwx_iec_ld_comparison_function)(current.file.bytes, selectedProgramIndex,
              item.offset, item.value, input.value),
            `Edit IEC ${kind.toLowerCase()}`,
          );
        });
        const cancel = button("Cancel", "secondary-button", () => {
          textCell.textContent = item.value;
          action.replaceChildren(editButton());
        });
        save.textContent = "Save";
        cancel.textContent = "Cancel";
        const validate = () => {
          const actual = input.value.length;
          length.textContent = item.isIecArithmeticFunction ? "Choose ADD, SUB, MUL, or DIV"
            : item.isIecComparisonFunction ? "Choose EQ, GT, GE, LT, or LE"
              : `${actual}/255 UTF-16 units`;
          save.disabled = item.isIecArithmeticFunction
            ? !["ADD", "SUB", "MUL", "DIV"].includes(input.value)
            : item.isIecComparisonFunction
              ? !["EQ", "GT", "GE", "LT", "LE"].includes(input.value)
              : actual > 255 || !input.value.trim() || /[\p{Cc}]/u.test(input.value);
        };
        input.addEventListener("input", validate);
        validate();
        editor.append(input, length, save, cancel);
        textCell.replaceChildren(editor);
        action.replaceChildren();
        input.focus();
        input.select();
      };
      action.append(editButton());
      const expectedContactKind = IEC_CONTACT_KIND_BY_SOURCE_LABEL.get(item.iecElementKind);
      const expectedCoilKind = IEC_COIL_KIND_BY_SOURCE_LABEL.get(item.iecElementKind);
      const expectedKind = expectedContactKind || expectedCoilKind;
      if (expectedKind) {
        const isContact = Boolean(expectedContactKind);
        const kindSelect = document.createElement("select");
        kindSelect.setAttribute("aria-label", `${isContact ? "Contact" : "Coil"} kind for ${item.value}`);
        const choices = isContact ? IEC_ADDRESSED_CONTACT_CHOICES : IEC_COIL_KIND_CHOICES;
        for (const [value, label] of choices) {
          const option = document.createElement("option");
          option.value = value;
          option.textContent = label;
          option.selected = value === expectedKind;
          kindSelect.append(option);
        }
        const kindButton = button("Apply kind", "secondary-button", async () => {
          const replacement = kindSelect.value;
          await applyEdit(
            () => (isContact
              ? update_xgwx_iec_ld_contact_kind
              : update_xgwx_iec_ld_coil_kind)(current.file.bytes, selectedProgramIndex,
              item.offset, expectedKind, replacement),
            `Change IEC ${isContact ? "contact" : "coil"} to ${replacement}`,
          );
        });
        const validateKind = () => { kindButton.disabled = kindSelect.value === expectedKind; };
        kindSelect.addEventListener("change", validateKind);
        validateKind();
        typeAction.append(kindSelect, kindButton);
      }
    }
    if (item.isIecFunctionInstance && functionByOffset.has(item.iecRecordOffset)) {
      const block = functionByOffset.get(item.iecRecordOffset);
      const existingNames = new Set((current.summary.localVariables?.[selectedProgramIndex] || [])
        .map((symbol) => symbol.name.toLocaleLowerCase()));
      const startEdit = () => {
        const editor = element("div", "iec-instance-editor");
        const input = document.createElement("input");
        input.type = "text";
        input.setAttribute("aria-label", `New instance for ${block.name} at L${block.rowIndex}`);
        let suffix = 2;
        do {
          input.value = `${item.value}_${suffix++}`;
        } while (existingNames.has(input.value.toLocaleLowerCase()));
        const apply = button("Create instance", "primary-button", async () => {
          await applyEdit(
            () => duplicate_xgwx_iec_ld_function_instance(
              current.file.bytes, selectedProgramIndex, item.iecRecordOffset, item.value, input.value,
            ),
            `Create IEC ${block.name} instance ${input.value} at L${block.rowIndex}`,
          );
        });
        const cancel = button("Cancel", "secondary-button", () => action.replaceChildren(openButton()));
        apply.textContent = "Create";
        cancel.textContent = "Cancel";
        const validate = () => {
          apply.disabled = input.value.length > 255
            || !/^[\p{L}_][\p{L}\p{N}_]*$/u.test(input.value)
            || existingNames.has(input.value.toLocaleLowerCase());
        };
        input.addEventListener("input", validate);
        validate();
        editor.append(input, apply, cancel);
        action.replaceChildren(editor);
        input.focus();
        input.select();
      };
      const openButton = () => {
        const control = button("Separate instance", "secondary-button", startEdit);
        control.textContent = "Separate instance";
        return control;
      };
      action.append(openButton());
    }
    const terminalFunctionDeletion = item.isIecFunctionName
      ? terminalFunctionDeletionByOffset.get(item.iecRecordOffset)
      : null;
    const standaloneFunctionDeletion = item.isIecFunctionName
      ? standaloneFunctionDeletionByOffset.get(item.iecRecordOffset)
      : null;
    const functionCellDeletion = item.isIecFunctionName
      ? functionCellDeletionByOffset.get(item.iecRecordOffset)
      : null;
    const connectedArithmeticDeletion = item.isIecFunctionName
      ? connectedArithmeticDeletionByOffset.get(item.iecRecordOffset)
      : null;
    const eqChainHeadDeletion = selectedProgramIndex === 0
      && item.isIecFunctionName && item.iecGroupIndex === 33
      && item.iecRowIndex === 67 && item.value === "EQ"
      ? { blockOffset: item.iecRecordOffset, rowIndex: 67 }
      : null;
    const heatingDeletionKind = item.isIecFunctionName && item.value === "EQ"
      && item.iecPosition?.[0] === 19
      ? [
        ["head", delete_xgwx_iec_ld_heating_chain_head],
        ["middle", delete_xgwx_iec_ld_heating_chain_middle],
        ["x3", delete_xgwx_iec_ld_heating_chain_x3_eq_repaired],
        ["contact", delete_xgwx_iec_ld_heating_chain_contact_eq],
        ["x15", delete_xgwx_iec_ld_heating_chain_x15_eq],
      ].find(([, deleteFunction]) => {
        try {
          deleteFunction(current.file.bytes, selectedProgramIndex, item.iecRecordOffset, item.value);
          return true;
        } catch { return false; }
      })?.[0]
      : null;
    const heatingDeletion = heatingDeletionKind
      ? { blockOffset: item.iecRecordOffset, rowIndex: item.iecRowIndex }
      : null;
    const heatingChainHeadDeletion = heatingDeletionKind === "head" && heatingDeletion;
    const heatingChainMiddleDeletion = heatingDeletionKind === "middle" && heatingDeletion;
    const heatingChainX3Deletion = heatingDeletionKind === "x3" && heatingDeletion;
    const heatingChainContactDeletion = heatingDeletionKind === "contact" && heatingDeletion;
    const heatingChainX15Deletion = heatingDeletionKind === "x15" && heatingDeletion;
    const branchedArithmeticDeletion = item.isIecFunctionName && ["ADD", "SUB", "MUL", "DIV"].includes(item.value)
      ? (() => {
        try {
          delete_xgwx_iec_ld_branched_arithmetic(current.file.bytes, selectedProgramIndex, item.iecRecordOffset, item.value);
          return { blockOffset: item.iecRecordOffset, rowIndex: item.iecRowIndex };
        } catch { return null; }
      })() : null;
    const functionDeletion = branchedArithmeticDeletion || terminalFunctionDeletion || standaloneFunctionDeletion || functionCellDeletion || connectedArithmeticDeletion || eqChainHeadDeletion || heatingChainHeadDeletion || heatingChainMiddleDeletion || heatingChainX3Deletion || heatingChainContactDeletion || heatingChainX15Deletion;
    if (functionDeletion) {
      const functionBlock = functionByOffset.get(functionDeletion.blockOffset);
      if (functionBlock?.name === item.value) {
        const deleteButton = button("Delete block", "secondary-button", async () => {
          await applyEdit(
            () => (branchedArithmeticDeletion
              ? delete_xgwx_iec_ld_branched_arithmetic
              : terminalFunctionDeletion
              ? delete_xgwx_iec_ld_terminal_function
              : standaloneFunctionDeletion
                ? delete_xgwx_iec_ld_standalone_function
                : functionCellDeletion
                  ? delete_xgwx_iec_ld_function_cell
                  : connectedArithmeticDeletion
                    ? delete_xgwx_iec_ld_connected_arithmetic
                    : eqChainHeadDeletion
                      ? delete_xgwx_iec_ld_eq_chain_head
                    : heatingChainHeadDeletion
                        ? delete_xgwx_iec_ld_heating_chain_head
                        : heatingChainMiddleDeletion
                          ? delete_xgwx_iec_ld_heating_chain_middle
                          : heatingChainX3Deletion
                            ? delete_xgwx_iec_ld_heating_chain_x3_eq_repaired
                            : heatingChainContactDeletion
                              ? delete_xgwx_iec_ld_heating_chain_contact_eq
                              : delete_xgwx_iec_ld_heating_chain_x15_eq)(
              current.file.bytes,
              selectedProgramIndex,
              functionDeletion.blockOffset,
              functionBlock.name,
            ),
            `Delete ${terminalFunctionDeletion ? "terminal" : standaloneFunctionDeletion ? "standalone" : "connected"} IEC function ${functionBlock.name} at L${functionDeletion.rowIndex}`,
          );
        });
        deleteButton.textContent = "Delete block";
        deleteButton.title = branchedArithmeticDeletion
          ? `Remove ${functionBlock.name} and its pin records, close one row, and retain the external branch spine`
          : terminalFunctionDeletion
          ? `Remove ${functionBlock.name}, its preceding wire, and ${functionDeletion.pinCount} pin rows`
          : standaloneFunctionDeletion
            ? `Remove the standalone ${functionBlock.name} group and its ${functionDeletion.pinCount + 1} stored rows`
            : functionCellDeletion
              ? `Remove ${functionBlock.name} and its ${functionDeletion.pinCount} link record while retaining surrounding row records`
              : connectedArithmeticDeletion
                ? `Remove the connected ${functionBlock.name} and its pin records, retaining R_TRIG and MOVE as separate groups`
                : heatingChainX3Deletion
                  ? `Remove this EQ and its pin records, then clear the dangling x15 feed`
                  : heatingChainContactDeletion
                    ? `Remove this EQ and its x6/x12 contact branches, retaining the x15 feed`
                    : heatingChainX15Deletion
                      ? `Remove this EQ and its pin records, retaining the x15 feed`
                  : `Remove this EQ and its pin records, close one row, and preserve the shared vertical feed`;
        action.append(deleteButton);
      }
    }
    if (item.isIecFunctionName && (body.iecScalarChainDeletionSites || []).some(site => site.blockOffset === item.iecRecordOffset)) {
      action.append(button("Delete block", "secondary-button", () => deleteIecFunction(item, body)));
    }
    return { row, item };
  });
  search.addEventListener("input", () => {
    const query = search.value.trim().toLocaleLowerCase();
    let matches = 0;
    for (const { row, item } of rows) {
      const pin = pinByRecord.get(item.iecRecordOffset);
      const block = pin && functionByOffset.get(pin.targetRecordOffset);
      row.hidden = Boolean(query) && !`${item.offset} ${item.value} L${item.iecRowIndex ?? ""} ${block?.name || ""}`.toLocaleLowerCase().includes(query);
      if (!row.hidden) matches += 1;
    }
    count.textContent = query ? `${matches} of ${strings.length} fragments` : `${strings.length} fragments`;
  });
  section.append(tableContainer(table, strings.length));
  return section;
}

function renderIecNetworkDeletion(body) {
  if (!body.iecCircuitGraph) return null;
  const groups = new Map();
  for (const row of body.iecRows || []) {
    const rows = groups.get(row.groupIndex) || [];
    rows.push(row.rowIndex);
    groups.set(row.groupIndex, rows);
  }
  if (groups.size <= 1) return null;
  const sites = [...groups].map(([groupIndex, rows]) => ({ groupIndex, firstRow: rows[0], lastRow: rows.at(-1) }));
  const section = element("section", "iec-insert-contact");
  section.append(element("h3", "", "Delete complete IEC network"));
  const form = document.createElement("form");
  const label = element("label", "", "Network");
  const select = document.createElement("select");
  select.setAttribute("aria-label", "IEC network to delete");
  select.required = true;
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Choose a network";
  placeholder.disabled = true;
  placeholder.selected = true;
  select.append(placeholder);
  sites.forEach((site, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = `Network ${site.groupIndex + 1} · L${site.firstRow}${site.lastRow === site.firstRow ? "" : `–L${site.lastRow}`}`;
    select.append(option);
  });
  label.append(select);
  const submit = button("Delete network", "secondary-button", () => {});
  submit.type = "submit";
  submit.textContent = "Delete network";
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const site = sites[Number(select.value)];
    await applyEdit(
      () => delete_xgwx_iec_ld_group(current.file.bytes, selectedProgramIndex, site.groupIndex, site.firstRow),
      `Delete IEC network ${site.groupIndex + 1} at L${site.firstRow}`,
    );
  });
  form.append(label, submit);
  section.append(form, element("p", "muted", "Removes the selected network and leaves its rows empty for a later insertion."));
  return section;
}

function renderIecCommentInsertion(body) {
  const rows = body.iecRows || [];
  const records = body.iecRecords || [];
  const graph = body.iecCircuitGraph;
  if (!rows.length || !graph) return null;
  const template = rows.some((row) => row.recordCount === 1
    && rows.filter((other) => other.groupIndex === row.groupIndex).length === 1
    && records.some((record) => record.groupIndex === row.groupIndex
      && record.rowIndex === row.rowIndex && record.kind === "Comment"));
  if (!template) return null;
  const lastRow = Math.max(...rows.map((row) => row.rowIndex));
  const destinations = [];
  for (let index = 0; index <= lastRow + 1; index += 1) {
    if (rows.some((row) => row.rowIndex === index)) continue;
    if (graph.occupiedAreas.some((area) => area.startRowIndex <= index && area.endRowIndex >= index)) continue;
    if (graph.edges.some((edge) => Math.min(edge.start.rowIndex, edge.end.rowIndex) <= index
      && Math.max(edge.start.rowIndex, edge.end.rowIndex) >= index)) continue;
    destinations.push(index);
  }
  if (!destinations.length) return null;
  const section = element("section", "iec-insert-contact");
  section.append(element("h3", "", "Insert IEC comment"));
  const form = document.createElement("form");
  const rowLabel = element("label", "", "Empty row");
  const rowSelect = document.createElement("select");
  rowSelect.setAttribute("aria-label", "IEC comment destination row");
  for (const row of destinations) {
    const option = document.createElement("option");
    option.value = String(row);
    option.textContent = `L${row}`;
    rowSelect.append(option);
  }
  rowLabel.append(rowSelect);
  const textLabel = element("label", "", "Comment");
  const comment = document.createElement("input");
  comment.type = "text";
  comment.maxLength = 255;
  comment.setAttribute("aria-label", "New IEC comment text");
  textLabel.append(comment);
  const submit = button("Insert comment", "secondary-button", () => {});
  submit.type = "submit";
  submit.textContent = "Insert comment";
  const status = element("p", "muted");
  const validate = () => {
    try {
      insert_xgwx_iec_ld_comment(current.file.bytes, selectedProgramIndex,
        Number(rowSelect.value), comment.value);
      submit.disabled = false;
      status.textContent = `Ready to insert a comment at L${rowSelect.value}.`;
    } catch (error) {
      submit.disabled = true;
      status.textContent = String(error);
    }
  };
  rowSelect.addEventListener("change", validate);
  comment.addEventListener("input", validate);
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (submit.disabled) return;
    const row = Number(rowSelect.value);
    await applyEdit(() => insert_xgwx_iec_ld_comment(
      current.file.bytes, selectedProgramIndex, row, comment.value,
    ), `Insert IEC comment at L${row}`);
  });
  form.append(rowLabel, textLabel, submit);
  validate();
  section.append(form, status);
  return section;
}

function renderIecNetworkReplacement(body) {
  if (!body.iecCircuitGraph) return null;
  const groups = new Map();
  for (const row of body.iecRows || []) {
    const rows = groups.get(row.groupIndex) || [];
    rows.push(row.rowIndex);
    groups.set(row.groupIndex, rows);
  }
  if (groups.size < 2) return null;
  const networks = [...groups].map(([groupIndex, rows]) => ({
    groupIndex,
    firstRow: rows[0],
    lastRow: rows.at(-1),
  }));
  const label = (network) => `Network ${network.groupIndex + 1} · L${network.firstRow}`
    + (network.lastRow === network.firstRow ? "" : `–L${network.lastRow}`);
  const section = element("section", "iec-insert-contact");
  section.append(element("h3", "", "Replace complete IEC network"));
  section.append(element("p", "muted", "Copy one decoded network over another occupied network in this program. The destination is replaced as one edit. Review reused outputs and function instances."));
  const form = document.createElement("form");
  const sourceLabel = element("label", "", "Copy from");
  const source = document.createElement("select");
  source.setAttribute("aria-label", "IEC replacement source network");
  source.append(new Option("Choose a network", ""));
  for (const network of networks) source.append(new Option(label(network), String(network.groupIndex)));
  sourceLabel.append(source);
  const destinationLabel = element("label", "", "Replace");
  const destination = document.createElement("select");
  destination.setAttribute("aria-label", "IEC replacement destination network");
  destination.disabled = true;
  destinationLabel.append(destination);
  const submit = button("Replace network", "secondary-button", () => {});
  submit.type = "submit";
  submit.textContent = "Replace network";
  submit.disabled = true;
  const status = element("p", "muted");
  const update = () => {
    destination.replaceChildren();
    const selected = networks.find((network) => String(network.groupIndex) === source.value);
    if (!selected) {
      destination.disabled = true;
      submit.disabled = true;
      status.textContent = "Choose a source network.";
      return;
    }
    const span = selected.lastRow - selected.firstRow;
    for (const network of networks) {
      if (network.groupIndex !== selected.groupIndex
          && network.lastRow - network.firstRow >= span) {
        destination.append(new Option(label(network), String(network.groupIndex)));
      }
    }
    destination.disabled = !destination.options.length;
    if (destination.disabled) {
      submit.disabled = true;
      status.textContent = "No occupied network has enough rows for this source.";
      return;
    }
    validate();
  };
  const validate = () => {
    const from = networks.find((network) => String(network.groupIndex) === source.value);
    const to = networks.find((network) => String(network.groupIndex) === destination.value);
    if (!from || !to) {
      submit.disabled = true;
      return;
    }
    try {
      replace_xgwx_iec_ld_group(current.file.bytes, selectedProgramIndex,
        from.groupIndex, from.firstRow, to.groupIndex, to.firstRow);
      submit.disabled = false;
      status.textContent = `Ready to replace ${label(to)} with ${label(from)}.`;
    } catch (error) {
      submit.disabled = true;
      status.textContent = String(error);
    }
  };
  source.addEventListener("change", update);
  destination.addEventListener("change", validate);
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (submit.disabled) return;
    const from = networks.find((network) => String(network.groupIndex) === source.value);
    const to = networks.find((network) => String(network.groupIndex) === destination.value);
    if (!from || !to) return;
    await applyEdit(() => replace_xgwx_iec_ld_group(current.file.bytes, selectedProgramIndex,
      from.groupIndex, from.firstRow, to.groupIndex, to.firstRow),
    `Replace IEC network at L${to.firstRow}`);
  });
  form.append(sourceLabel, destinationLabel, submit);
  section.append(form, status);
  update();
  return section;
}

function renderIecNetworkRelocation(body) {
  if (!body.iecCircuitGraph) return null;
  const rows = body.iecRows || [];
  if (!rows.length) return null;
  const groups = new Map();
  for (const row of rows) {
    const group = groups.get(row.groupIndex) || [];
    group.push(row.rowIndex);
    groups.set(row.groupIndex, group);
  }
  const maxRow = Math.max(...rows.map((row) => row.rowIndex));
  const sites = [...groups].map(([groupIndex, groupRows]) => {
    const firstRow = groupRows[0];
    const lastRow = groupRows.at(-1);
    const span = lastRow - firstRow;
    const destinations = [];
    for (let first = 0; first + span <= maxRow; first += 1) {
      const last = first + span;
      if (last >= firstRow && first <= lastRow) continue;
      if (rows.some((row) => row.groupIndex !== groupIndex && row.rowIndex >= first && row.rowIndex <= last)) continue;
      if (body.iecCircuitGraph.occupiedAreas.some((area) => area.groupIndex !== groupIndex
        && area.startRowIndex <= last && area.endRowIndex >= first)) continue;
      if (body.iecCircuitGraph.edges.some((edge) => edge.start.groupIndex !== groupIndex
        && Math.min(edge.start.rowIndex, edge.end.rowIndex) <= last
        && Math.max(edge.start.rowIndex, edge.end.rowIndex) >= first)) continue;
      destinations.push(first);
    }
    return { groupIndex, firstRow, lastRow, destinations };
  }).filter((site) => site.destinations.length);
  if (!sites.length) return null;
  const section = element("section", "iec-insert-contact");
  section.append(element("h3", "", "Move or copy complete IEC network"));
  const form = document.createElement("form");
  const sourceLabel = element("label", "", "Network");
  const source = document.createElement("select");
  source.setAttribute("aria-label", "IEC network to move or copy");
  source.required = true;
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Choose a network";
  placeholder.disabled = true;
  placeholder.selected = true;
  source.append(placeholder);
  sites.forEach((site, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = `Network ${site.groupIndex + 1} · L${site.firstRow}${site.lastRow === site.firstRow ? "" : `–L${site.lastRow}`}`;
    source.append(option);
  });
  sourceLabel.append(source);
  const destinationLabel = element("label", "", "Empty row range");
  const destination = document.createElement("select");
  destination.setAttribute("aria-label", "IEC network destination");
  destination.required = true;
  destination.disabled = true;
  destinationLabel.append(destination);
  const updateDestinations = () => {
    destination.replaceChildren();
    const site = sites[Number(source.value)];
    if (!source.value || !site) {
      destination.disabled = true;
      return;
    }
    for (const first of site.destinations) {
      const option = document.createElement("option");
      option.value = String(first);
      option.textContent = `L${first}${site.lastRow === site.firstRow ? "" : `–L${first + site.lastRow - site.firstRow}`}`;
      destination.append(option);
    }
    destination.disabled = false;
  };
  source.addEventListener("change", updateDestinations);
  const submit = button("Move network", "secondary-button", () => {});
  submit.type = "submit";
  submit.textContent = "Move network";
  const copy = button("Copy network", "secondary-button", () => {});
  copy.type = "submit";
  copy.dataset.operation = "copy";
  copy.textContent = "Copy network";
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const site = sites[Number(source.value)];
    if (!site || destination.disabled) return;
    const first = Number(destination.value);
    const copying = event.submitter?.dataset.operation === "copy";
    await applyEdit(
      () => (copying ? copy_xgwx_iec_ld_group : move_xgwx_iec_ld_group)(
        current.file.bytes, selectedProgramIndex, site.groupIndex, site.firstRow, first,
      ),
      `${copying ? "Copy" : "Move"} IEC network ${site.groupIndex + 1} from L${site.firstRow} to L${first}`,
    );
  });
  form.append(sourceLabel, destinationLabel, submit, copy);
  section.append(form, element("p", "muted",
    "Moves or copies the whole network, including branches and function links. Copies reuse output operands and function instances; reassign them for independent logic, then run Check Program. Reused outputs can trigger duplicate-write warnings."));
  return section;
}

function renderIecCrossProgramReplacement(body) {
  if (!body.iecCircuitGraph || !(body.iecRows || []).length) return null;
  const allowed = new Set(["Contact", "Coil", "Long wire", "Short wire", "Branch start", "Branch end", "Comment", "Function block", "Function operand", "Link reference"]);
  const programs = current.summary.programs || [];
  const sourceSites = (current.summary.ladder || []).flatMap((program) => {
    if (program.programIndex === selectedProgramIndex || program.projectType !== 2 || !program.iecCircuitGraph) return [];
    const groups = new Map();
    for (const row of program.iecRows || []) {
      const group = groups.get(row.groupIndex) || [];
      group.push(row.rowIndex);
      groups.set(row.groupIndex, group);
    }
    return [...groups].flatMap(([groupIndex, rows]) => {
      const records = (program.iecRecords || []).filter((record) => record.groupIndex === groupIndex);
      return records.length && records.every((record) => allowed.has(record.kind))
        ? [{ programIndex: program.programIndex, groupIndex, firstRow: rows[0], lastRow: rows.at(-1) }]
        : [];
    });
  });
  if (!sourceSites.length) return null;

  const section = element("section", "iec-insert-contact");
  const sourceLabel = element("label", "", "Source network");
  const sourceSelect = document.createElement("select");
  sourceSelect.setAttribute("aria-label", "IEC cross-program source network");
  sourceSites.forEach((site, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = `${programs[site.programIndex]?.name || `Program ${site.programIndex + 1}`} · network ${site.groupIndex + 1} · L${site.firstRow}${site.lastRow === site.firstRow ? "" : `–L${site.lastRow}`}`;
    sourceSelect.append(option);
  });
  sourceLabel.append(sourceSelect);
  const targetRows = body.iecRows || [];
  const occupied = new Map();
  for (const row of targetRows) {
    const group = occupied.get(row.groupIndex) || [];
    group.push(row.rowIndex);
    occupied.set(row.groupIndex, group);
  }
  const replacementForm = document.createElement("form");
  const replacementSourceLabel = element("label", "", "Source network to replace with");
  const replacementSource = sourceSelect.cloneNode(true);
  replacementSource.setAttribute("aria-label", "IEC cross-program replacement source network");
  replacementSourceLabel.append(replacementSource);
  const replacementDestinationLabel = element("label", "", "Occupied network to replace");
  const replacementDestination = document.createElement("select");
  replacementDestination.setAttribute("aria-label", "IEC cross-program replacement destination network");
  for (const [groupIndex, rows] of occupied) {
    const option = document.createElement("option");
    option.value = String(groupIndex);
    option.textContent = `network ${groupIndex + 1} · L${rows[0]}${rows.length > 1 ? `–L${rows.at(-1)}` : ""}`;
    replacementDestination.append(option);
  }
  replacementDestinationLabel.append(replacementDestination);
  const replacementLocalLabel = element("label", "", "Copy missing local variables");
  const replacementLocals = document.createElement("input");
  replacementLocals.type = "checkbox";
  replacementLocals.setAttribute("aria-label", "Copy missing IEC locals for replacement");
  replacementLocalLabel.prepend(replacementLocals);
  const replacementSubmit = button("Replace network from another program", "secondary-button", () => {});
  replacementSubmit.type = "submit";
  replacementSubmit.textContent = "Replace network";
  const replacementStatus = element("p", "muted");
  const validateReplacement = () => {
    const site = sourceSites[Number(replacementSource.value)];
    const groupIndex = Number(replacementDestination.value);
    const rows = occupied.get(groupIndex);
    if (!site || !rows) {
      replacementSubmit.disabled = true;
      replacementStatus.textContent = "Choose both networks.";
      return;
    }
    try {
      replace_xgwx_iec_ld_group_from_program(current.file.bytes,
        site.programIndex, site.groupIndex, site.firstRow,
        selectedProgramIndex, groupIndex, rows[0], replacementLocals.checked);
      replacementSubmit.disabled = false;
      replacementStatus.textContent = "Ready to replace the occupied network in one edit. Review output addresses and function instances after copying.";
    } catch (error) {
      replacementSubmit.disabled = true;
      replacementStatus.textContent = String(error);
    }
  };
  replacementSource.addEventListener("change", validateReplacement);
  replacementDestination.addEventListener("change", validateReplacement);
  replacementLocals.addEventListener("change", validateReplacement);
  replacementForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (replacementSubmit.disabled) return;
    const site = sourceSites[Number(replacementSource.value)];
    const groupIndex = Number(replacementDestination.value);
    await applyEdit(() => replace_xgwx_iec_ld_group_from_program(current.file.bytes,
      site.programIndex, site.groupIndex, site.firstRow,
      selectedProgramIndex, groupIndex, occupied.get(groupIndex)[0], replacementLocals.checked),
    `Replace IEC network ${groupIndex + 1} from program ${site.programIndex + 1}`);
  });
  replacementForm.append(replacementSourceLabel, replacementDestinationLabel,
    replacementLocalLabel, replacementSubmit);
  section.append(element("h3", "", "Replace IEC network from another program"),
    replacementForm, replacementStatus);
  validateReplacement();
  return section;
}

function renderIecTerminalMoveInsertion(body) {
  const sites = body.iecTerminalFunctionInsertionSites || [];
  if (!sites.length) return null;
  const lightingMove = selectedProgramIndex === 0
    && sites[0].groupIndex === 32 && sites[0].rowIndex === 63;
  const section = element("section", "iec-insert-contact iec-function-cell-insertion");
  section.append(element("h3", "", "Insert terminal MOVE block"));
  const form = document.createElement("form");
  const siteLabel = element("label", "", "Retained contact");
  const siteSelect = document.createElement("select");
  siteSelect.setAttribute("aria-label", "IEC terminal MOVE insertion site");
  sites.forEach((site, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = `L${site.rowIndex} · x ${site.rawX} · contact ${site.contactOffset}`;
    siteSelect.append(option);
  });
  siteLabel.append(siteSelect);
  const inputLabel = element("label", "", "Integer input");
  const input = document.createElement("input");
  input.type = "text";
  input.value = lightingMove ? "0" : "1";
  input.setAttribute("aria-label", "IEC terminal MOVE input");
  inputLabel.append(input);
  const outputLabel = element("label", "", lightingMove ? "BOOL output" : "WORD output");
  const output = document.createElement("input");
  output.type = "text";
  output.value = lightingMove ? "자기유지2" : "%MW300";
  output.setAttribute("aria-label", "IEC terminal MOVE output");
  outputLabel.append(output);
  const submit = button("Insert MOVE", "primary-button", () => {});
  submit.type = "submit";
  submit.textContent = "Insert MOVE";
  const status = element("p", "muted");
  const validate = () => {
    const site = sites[Number(siteSelect.value)];
    try {
      insert_xgwx_iec_ld_terminal_move(
        current.file.bytes, selectedProgramIndex, site.contactOffset,
        input.value.trim(), output.value.trim(),
      );
      submit.disabled = false;
      status.textContent = `Ready to insert MOVE at L${site.rowIndex}.`;
    } catch (error) {
      submit.disabled = true;
      status.textContent = String(error);
    }
  };
  siteSelect.addEventListener("change", validate);
  input.addEventListener("input", validate);
  output.addEventListener("input", validate);
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (submit.disabled) return;
    const site = sites[Number(siteSelect.value)];
    await applyEdit(
      () => insert_xgwx_iec_ld_terminal_move(
        current.file.bytes, selectedProgramIndex, site.contactOffset,
        input.value.trim(), output.value.trim(),
      ),
      `Insert terminal MOVE at L${site.rowIndex}`,
    );
  });
  form.append(siteLabel, inputLabel, outputLabel, submit);
  validate();
  section.append(form, status);
  return section;
}

function renderIecStandaloneFunctionInsertion(body) {
  const sites = body.iecStandaloneFunctionInsertionSites || [];
  const outputs = (current.summary.localVariables?.[selectedProgramIndex] || [])
    .filter((symbol) => symbol.dataType === "UDINT" && !symbol.isInstance && symbol.storageClass !== "I");
  if (!sites.length || !outputs.length) return null;
  const section = element("section", "iec-insert-contact iec-function-cell-insertion");
  section.append(element("h3", "", "Insert standalone WORD_TO_UDINT block"));
  const form = document.createElement("form");
  const label = element("label", "", "Stored gap");
  const select = document.createElement("select");
  select.setAttribute("aria-label", "IEC WORD_TO_UDINT insertion site");
  sites.forEach((site, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = `L${site.rowIndex}–L${site.rowIndex + 2} · group ${site.groupIndex + 1} · x ${site.rawX}`;
    select.append(option);
  });
  label.append(select);
  const inputLabel = element("label", "", "WORD input");
  const input = document.createElement("input");
  input.type = "text";
  input.value = "%MW301";
  input.setAttribute("aria-label", "IEC WORD_TO_UDINT input");
  inputLabel.append(input);
  const outputLabel = element("label", "", "UDINT output");
  const output = document.createElement("select");
  output.setAttribute("aria-label", "IEC WORD_TO_UDINT output");
  for (const symbol of outputs) {
    const option = document.createElement("option");
    option.value = symbol.name;
    option.textContent = symbol.name;
    output.append(option);
  }
  outputLabel.append(output);
  const submit = button("Insert WORD_TO_UDINT", "primary-button", () => {});
  submit.type = "submit";
  submit.textContent = "Insert WORD_TO_UDINT";
  const status = element("p", "muted");
  const validate = () => {
    const site = sites[Number(select.value)];
    try {
      insert_xgwx_iec_ld_standalone_function(
        current.file.bytes, selectedProgramIndex, site.insertionOffset,
        "WORD_TO_UDINT", input.value.trim(), output.value,
      );
      submit.disabled = false;
      status.textContent = `Ready to insert WORD_TO_UDINT at L${site.rowIndex}.`;
    } catch (error) {
      submit.disabled = true;
      status.textContent = String(error);
    }
  };
  select.addEventListener("change", validate);
  input.addEventListener("input", validate);
  output.addEventListener("change", validate);
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (submit.disabled) return;
    const site = sites[Number(select.value)];
    await applyEdit(
      () => insert_xgwx_iec_ld_standalone_function(
        current.file.bytes, selectedProgramIndex, site.insertionOffset,
        "WORD_TO_UDINT", input.value.trim(), output.value,
      ),
      `Insert standalone WORD_TO_UDINT at L${site.rowIndex}`,
    );
  });
  form.append(label, inputLabel, outputLabel, submit);
  validate();
  section.append(form, status);
  return section;
}

function renderIecFunctionCellInsertion(body) {
  const sites = (body.iecFunctionCellInsertionSites || []).filter(site => (site.functionName || "FF") === "FF");
  const instances = (current.summary.localVariables?.[selectedProgramIndex] || [])
    .filter((symbol) => symbol.isInstance && symbol.typeReference === "FF");
  if (!sites.length || !instances.length) return null;
  const section = element("section", "iec-insert-contact iec-function-cell-insertion");
  section.append(element("h3", "", "Insert connected FF block"));
  const form = document.createElement("form");
  const siteLabel = element("label", "", "Stored gap");
  const siteSelect = document.createElement("select");
  siteSelect.setAttribute("aria-label", "IEC FF insertion site");
  sites.forEach((site, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = `L${site.rowIndex} · group ${site.groupIndex + 1} · x ${site.rawX}`;
    siteSelect.append(option);
  });
  siteLabel.append(siteSelect);
  const instanceLabel = element("label", "", "FF instance");
  const instanceSelect = document.createElement("select");
  instanceSelect.setAttribute("aria-label", "IEC FF instance");
  for (const instance of instances) {
    const option = document.createElement("option");
    option.value = instance.name;
    option.textContent = instance.name;
    instanceSelect.append(option);
  }
  instanceLabel.append(instanceSelect);
  const submit = button("Insert FF block", "primary-button", () => {});
  submit.type = "submit";
  submit.textContent = "Insert FF block";
  const status = element("p", "muted");
  const validate = () => {
    const site = sites[Number(siteSelect.value)];
    try {
      insert_xgwx_iec_ld_function_cell(
        current.file.bytes, selectedProgramIndex, site.insertionOffset, "FF", instanceSelect.value,
      );
      submit.disabled = false;
      status.textContent = `Ready to insert FF instance ${instanceSelect.value} at L${site.rowIndex}.`;
    } catch (error) {
      submit.disabled = true;
      status.textContent = String(error);
    }
  };
  siteSelect.addEventListener("change", validate);
  instanceSelect.addEventListener("change", validate);
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (submit.disabled) return;
    const site = sites[Number(siteSelect.value)];
    const instance = instanceSelect.value;
    await applyEdit(
      () => insert_xgwx_iec_ld_function_cell(
        current.file.bytes, selectedProgramIndex, site.insertionOffset, "FF", instance,
      ),
      `Insert connected IEC function FF instance ${instance} at L${site.rowIndex}`,
    );
  });
  form.append(siteLabel, instanceLabel, submit);
  validate();
  section.append(form, status);
  return section;
}

function renderIecRungCreation(section, body, candidateRows) {
  const rows = candidateRows.filter((rowIndex) => {
    try {
      insert_xgwx_iec_ld_rung(current.file.bytes, selectedProgramIndex, rowIndex,
        "NO", "%MX0", "OUTPUT", "%MX1");
      return true;
    } catch { return false; }
  });
  if (!rows.length) return;
  const form = element("form", "iec-rung-creation");
  const rowLabel = element("label", "property-field", "Create rung on empty row");
  const rowSelect = document.createElement("select");
  rowSelect.setAttribute("aria-label", "IEC simple rung row");
  for (const rowIndex of rows) {
    const option = document.createElement("option");
    option.value = String(rowIndex);
    option.textContent = `L${rowIndex}`;
    rowSelect.append(option);
  }
  rowLabel.append(rowSelect);
  const kinds = (labelText, ariaLabel, choices) => {
    const label = element("label", "property-field", labelText);
    const select = document.createElement("select");
    select.setAttribute("aria-label", ariaLabel);
    for (const [value, text] of choices) {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = text;
      select.append(option);
    }
    label.append(select);
    form.append(label);
    return select;
  };
  const names = [...new Set([
    ...(current.summary.localVariables?.[selectedProgramIndex] || [])
      .filter((symbol) => symbol.dataType === "BOOL" && !symbol.isInstance)
      .map((symbol) => symbol.name),
    ...(body.sourceStrings || [])
      .filter((item) => iecContactGlyph(item.iecElementKind)
        || IEC_COIL_GLYPH_BY_SOURCE_LABEL.has(item.iecElementKind))
      .map((item) => item.value),
  ])];
  const operand = (labelText, ariaLabel, preferred, fallback) => {
    const input = property(form, labelText, names.includes(preferred) ? preferred : fallback, false);
    input.setAttribute("aria-label", ariaLabel);
    const list = document.createElement("datalist");
    list.id = `iec-rung-${++nextContactPromptId}`;
    for (const name of names) {
      const option = document.createElement("option");
      option.value = name;
      list.append(option);
    }
    input.setAttribute("list", list.id);
    form.append(list);
    return input;
  };
  form.append(rowLabel);
  const contactKind = kinds("Contact kind", "IEC simple rung contact kind", IEC_ADDRESSED_CONTACT_CHOICES);
  const contact = operand("Contact BOOL variable", "IEC simple rung contact", "ON", "%MX0");
  const coilKind = kinds("Coil kind", "IEC simple rung coil kind", [
    ["OUTPUT", "Output"], ["INVERSE", "Inverse output"], ["SET", "Set"],
    ["RESET", "Reset"], ["RISING", "Rising edge"], ["FALLING", "Falling edge"],
  ]);
  const coil = operand("Coil BOOL variable", "IEC simple rung coil", "OFF", "%MX1");
  const create = button("Create simple rung", "primary-button", () => {});
  create.type = "submit";
  const status = element("div", "length-counter");
  const validate = () => {
    try {
      insert_xgwx_iec_ld_rung(current.file.bytes, selectedProgramIndex, Number(rowSelect.value),
        contactKind.value, contact.value.trim(), coilKind.value, coil.value.trim());
      create.disabled = false;
      status.textContent = `Ready to create a rung on L${rowSelect.value}.`;
      status.classList.remove("invalid");
    } catch (error) {
      create.disabled = true;
      status.textContent = String(error);
      status.classList.add("invalid");
    }
  };
  form.addEventListener("input", validate);
  form.addEventListener("change", validate);
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (create.disabled) return;
    const rowIndex = Number(rowSelect.value);
    await applyEdit(() => insert_xgwx_iec_ld_rung(current.file.bytes, selectedProgramIndex, rowIndex,
      contactKind.value, contact.value.trim(), coilKind.value, coil.value.trim()),
    `Create IEC rung L${rowIndex}: ${contact.value.trim()} to ${coil.value.trim()}`);
  });
  form.append(status, create);
  validate();
  section.append(form);
}

function renderIecBlankRowInsertion(body) {
  const rows = body.iecRows || [];
  if (!rows.length || !body.iecCircuitGraph) return null;
  const section = element("section", "iec-insert-contact iec-blank-row-editor");
  section.append(element("h3", "", "Edit blank IEC rows"));
  const form = document.createElement("form");
  const label = element("label", "", "Insert after stored row");
  const select = document.createElement("select");
  select.setAttribute("aria-label", "IEC blank row boundary");
  rows.forEach((row, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = `L${row.rowIndex} · group ${row.groupIndex + 1}`;
    select.append(option);
  });
  label.append(select);
  const submit = button("Insert blank row", "secondary-button", () => {});
  submit.type = "submit";
  submit.textContent = "Insert blank row";
  const status = element("p", "muted");
  const validate = () => {
    const row = rows[Number(select.value)];
    try {
      insert_xgwx_iec_ld_blank_row(current.file.bytes, selectedProgramIndex, row.rowIndex);
      submit.disabled = false;
      status.textContent = `Ready to shift every decoded row after L${row.rowIndex} down by one line.`;
    } catch (error) {
      submit.disabled = true;
      status.textContent = String(error);
    }
  };
  select.addEventListener("change", validate);
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (submit.disabled) return;
    const row = rows[Number(select.value)];
    await applyEdit(
      () => insert_xgwx_iec_ld_blank_row(
        current.file.bytes, selectedProgramIndex, row.rowIndex,
      ),
      `Insert blank IEC row after L${row.rowIndex}`,
    );
  });
  form.append(label, submit);
  validate();
  section.append(form, status);

  const gaps = rows.slice(0, -1).flatMap((row, index) => {
    const next = rows[index + 1];
    return Array.from(
      { length: Math.max(0, next.rowIndex - row.rowIndex - 1) },
      (_, gap) => row.rowIndex + gap + 1,
    );
  });
  if (gaps.length) {
    const deleteForm = document.createElement("form");
    const deleteLabel = element("label", "", "Delete empty row");
    const deleteSelect = document.createElement("select");
    deleteSelect.setAttribute("aria-label", "IEC blank row to delete");
    gaps.forEach((rowIndex) => {
      const option = document.createElement("option");
      option.value = String(rowIndex);
      option.textContent = `L${rowIndex}`;
      deleteSelect.append(option);
    });
    deleteLabel.append(deleteSelect);
    const deleteButton = button("Delete blank row", "secondary-button", () => {});
    deleteButton.type = "submit";
    const deleteStatus = element("p", "muted");
    const validateDelete = () => {
      const rowIndex = Number(deleteSelect.value);
      try {
        delete_xgwx_iec_ld_blank_row(current.file.bytes, selectedProgramIndex, rowIndex);
        deleteButton.disabled = false;
        deleteStatus.textContent = `Ready to close the empty L${rowIndex} gap and move later decoded rows up.`;
      } catch (error) {
        deleteButton.disabled = true;
        deleteStatus.textContent = String(error);
      }
    };
    deleteSelect.addEventListener("change", validateDelete);
    deleteForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (deleteButton.disabled) return;
      const rowIndex = Number(deleteSelect.value);
      await applyEdit(
        () => delete_xgwx_iec_ld_blank_row(
          current.file.bytes, selectedProgramIndex, rowIndex,
        ),
        `Delete blank IEC row L${rowIndex}`,
      );
    });
    deleteForm.append(deleteLabel, deleteButton);
    validateDelete();
    section.append(deleteForm, deleteStatus);
  }
  const boolSymbols = (current.summary.localVariables?.[selectedProgramIndex] || [])
    .filter((symbol) => symbol.dataType === "BOOL" && !symbol.isInstance)
    .map((symbol) => symbol.name)
    .filter((name, index, names) => name && names.indexOf(name) === index);
  const contactKinds = IEC_ADDRESSED_CONTACT_CHOICES.map(([value, label, , code]) =>
    ({ value, label, code }));
  const coilKinds = [
    { value: "OUTPUT", code: 0x0e, label: "Output" },
    { value: "INVERSE", code: 0x0f, label: "Inverse output" },
    { value: "SET", code: 0x10, label: "Set" },
    { value: "RESET", code: 0x11, label: "Reset" },
    { value: "RISING", code: 0x12, label: "Rising edge" },
    { value: "FALLING", code: 0x13, label: "Falling edge" },
  ];

  const simpleRungs = rows.flatMap((row) => {
    const groupRows = rows.filter((candidate) => candidate.groupIndex === row.groupIndex);
    const records = (body.iecRecords || []).filter((record) => (
      record.groupIndex === row.groupIndex && record.rowIndex === row.rowIndex
    ));
    const contactKind = contactKinds.find((kind) => kind.code === records[0]?.code);
    const coilKind = coilKinds.find((kind) => kind.code === records[2]?.code);
    if (groupRows.length !== 1 || records.length !== 3
      || records[0].kind !== "Contact" || !contactKind
      || records[1].kind !== "Long wire"
      || records[2].kind !== "Coil" || !coilKind) return [];
    const sourceFor = (record) => (body.sourceStrings || []).find((item) => (
      item.iecRecordOffset === record.offset && item.iecRecordKind === record.kind
    ));
    const contact = sourceFor(records[0]);
    const coil = sourceFor(records[2]);
    if (!contact?.value || !coil?.value) return [];
    try {
      delete_xgwx_iec_ld_rung(
        current.file.bytes, selectedProgramIndex, row.rowIndex,
        contactKind.value, contact.value, coilKind.value, coil.value,
      );
      let canDeleteRow = false;
      let canDeleteCoil = false;
      try {
        delete_xgwx_iec_ld_simple_row(
          current.file.bytes, selectedProgramIndex, row.rowIndex,
          contactKind.value, contact.value, coilKind.value, coil.value,
        );
        canDeleteRow = true;
      } catch { /* The row cannot be closed safely. */ }
      try {
        delete_xgwx_iec_ld_terminal_coil(
          current.file.bytes, selectedProgramIndex, records[2].offset, coil.value,
        );
        canDeleteCoil = true;
      } catch { /* This rung has a different terminal shape. */ }
      return [{
        rowIndex: row.rowIndex,
        contact: contact.value,
        contactKind: contactKind.value,
        contactLabel: contactKind.label,
        coil: coil.value,
        coilRecordOffset: records[2].offset,
        coilKind: coilKind.value,
        coilLabel: coilKind.label,
        canDeleteRow,
        canDeleteCoil,
      }];
    } catch {
      return [];
    }
  });
  if (simpleRungs.length) {
    const parallelRungs = simpleRungs;
    if (parallelRungs.length) {
      const parallelForm = document.createElement("form");
      const rungLabel = element("label", "", "Add parallel contact to rung");
      const rungSelect = document.createElement("select");
      rungSelect.setAttribute("aria-label", "IEC parallel contact rung");
      parallelRungs.forEach((rung, index) => {
        const option = document.createElement("option");
        option.value = String(index);
        option.textContent = `L${rung.rowIndex} · ${rung.contact} to ${rung.coilLabel} ${rung.coil}`;
        rungSelect.append(option);
      });
      rungLabel.append(rungSelect);
      const kindLabel = element("label", "", "Parallel contact kind");
      const kindSelect = document.createElement("select");
      kindSelect.setAttribute("aria-label", "IEC parallel contact kind");
      for (const kind of contactKinds) {
        const option = document.createElement("option");
        option.value = kind.value;
        option.textContent = kind.label;
        kindSelect.append(option);
      }
      kindLabel.append(kindSelect);
      const symbolLabel = element("label", "", "Parallel BOOL contact");
      const symbolInput = document.createElement("input");
      symbolInput.setAttribute("aria-label", "IEC parallel contact variable");
      symbolInput.setAttribute("list", `iec-parallel-symbols-${selectedProgramIndex}`);
      const symbolList = document.createElement("datalist");
      symbolList.id = `iec-parallel-symbols-${selectedProgramIndex}`;
      const capturedContacts = (body.iecRecords || [])
        .filter((record) => record.kind === "Contact")
        .map((record) => (body.sourceStrings || []).find((item) => (
          item.iecRecordOffset === record.offset && item.iecRecordKind === "Contact"
        ))?.value)
        .filter(Boolean);
      const suggestions = [...new Set([...boolSymbols, ...capturedContacts])];
      for (const name of suggestions) {
        const option = document.createElement("option");
        option.value = name;
        symbolList.append(option);
      }
      symbolInput.value = boolSymbols.includes("OFF") ? "OFF"
        : suggestions.find((name) => name !== parallelRungs[0].contact)
          || parallelRungs[0].contact;
      symbolLabel.append(symbolInput, symbolList);
      const addButton = button("Add parallel contact", "primary-button", () => {});
      addButton.type = "submit";
      const status = element("p", "muted");
      const validate = () => {
        const rung = parallelRungs[Number(rungSelect.value)];
        try {
          insert_xgwx_iec_ld_parallel_contact_kind(
            current.file.bytes, selectedProgramIndex, rung.rowIndex,
            rung.contact, rung.coil, kindSelect.value, symbolInput.value.trim(),
          );
          addButton.disabled = false;
          status.textContent = `Ready to add a parallel contact below L${rung.rowIndex}.`;
        } catch (error) {
          addButton.disabled = true;
          status.textContent = String(error);
        }
      };
      rungSelect.addEventListener("change", validate);
      kindSelect.addEventListener("change", validate);
      symbolInput.addEventListener("input", validate);
      parallelForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        if (addButton.disabled) return;
        const rung = parallelRungs[Number(rungSelect.value)];
        const variable = symbolInput.value.trim();
        await applyEdit(
          () => insert_xgwx_iec_ld_parallel_contact_kind(
            current.file.bytes, selectedProgramIndex, rung.rowIndex,
            rung.contact, rung.coil, kindSelect.value, variable,
          ),
          `Add IEC parallel ${kindSelect.value} contact ${variable} below L${rung.rowIndex}`,
        );
      });
      parallelForm.append(rungLabel, kindLabel, symbolLabel, addButton);
      validate();
      section.append(parallelForm, status);
    }
    const removeForm = document.createElement("form");
    const removeLabel = element("label", "", "Delete simple rung");
    const removeSelect = document.createElement("select");
    removeSelect.setAttribute("aria-label", "IEC simple rung to delete");
    simpleRungs.forEach((rung, index) => {
      const option = document.createElement("option");
      option.value = String(index);
      option.textContent = `L${rung.rowIndex} · ${rung.contactLabel} ${rung.contact} to ${rung.coilLabel} ${rung.coil}`;
      removeSelect.append(option);
    });
    removeLabel.append(removeSelect);
    const removeButton = button("Delete simple rung", "secondary-button", () => {});
    removeButton.type = "submit";
    removeForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const rung = simpleRungs[Number(removeSelect.value)];
      await applyEdit(
        () => delete_xgwx_iec_ld_rung(
          current.file.bytes, selectedProgramIndex, rung.rowIndex,
          rung.contactKind, rung.contact, rung.coilKind, rung.coil,
        ),
        rung.contactKind === "NO" && rung.coilKind === "OUTPUT"
          ? `Delete IEC rung L${rung.rowIndex}: ${rung.contact} to ${rung.coil}`
          : `Delete IEC rung L${rung.rowIndex}: ${rung.contactKind} ${rung.contact} to ${rung.coilKind} ${rung.coil}`,
      );
    });
    removeForm.append(removeLabel, removeButton);
    if (simpleRungs.some((rung) => rung.canDeleteCoil)) {
      const deleteCoilButton = button("Delete output coil", "secondary-button", async () => {
        const rung = simpleRungs[Number(removeSelect.value)];
        if (!rung?.canDeleteCoil) return;
        await applyEdit(
          () => delete_xgwx_iec_ld_terminal_coil(
            current.file.bytes, selectedProgramIndex, rung.coilRecordOffset, rung.coil,
          ),
          `Delete IEC output coil at L${rung.rowIndex}`,
        );
      });
      removeSelect.addEventListener("change", () => {
        deleteCoilButton.disabled = !simpleRungs[Number(removeSelect.value)]?.canDeleteCoil;
      });
      deleteCoilButton.disabled = !simpleRungs[0].canDeleteCoil;
      removeForm.append(deleteCoilButton);
    }
    if (simpleRungs.some((rung) => rung.canDeleteRow)) {
      const deleteRowButton = button("Delete occupied row", "secondary-button", async () => {
        const rung = simpleRungs[Number(removeSelect.value)];
        if (!rung?.canDeleteRow) return;
        await applyEdit(
          () => delete_xgwx_iec_ld_simple_row(
            current.file.bytes, selectedProgramIndex, rung.rowIndex,
            rung.contactKind, rung.contact, rung.coilKind, rung.coil,
          ),
          `Delete occupied IEC row L${rung.rowIndex}`,
        );
      });
      deleteRowButton.type = "button";
      removeSelect.addEventListener("change", () => {
        deleteRowButton.disabled = !simpleRungs[Number(removeSelect.value)]?.canDeleteRow;
      });
      deleteRowButton.disabled = !simpleRungs[0].canDeleteRow;
      removeForm.append(deleteRowButton);
    }
    section.append(removeForm);
  }
  const contactOnlyRows = rows.flatMap((row) => {
    if (rows.filter((candidate) => candidate.groupIndex === row.groupIndex).length !== 1) return [];
    const records = (body.iecRecords || []).filter((record) =>
      record.groupIndex === row.groupIndex && record.rowIndex === row.rowIndex);
    if (records.length !== 1 || records[0].kind !== "Contact") return [];
    const contact = (body.sourceStrings || []).find((item) =>
      item.iecRecordOffset === records[0].offset && item.iecRecordKind === "Contact");
    if (!contact?.value || !boolSymbols.length) return [];
    try {
      insert_xgwx_iec_ld_terminal_coil(
        current.file.bytes, selectedProgramIndex, records[0].offset, contact.value,
        "OUTPUT", boolSymbols[0],
      );
      return [{ rowIndex: row.rowIndex, contactRecordOffset: records[0].offset, contact: contact.value }];
    } catch { return []; }
  });
  if (contactOnlyRows.length) {
    const form = document.createElement("form");
    const rowLabel = element("label", "", "Complete contact-only rung");
    const rowSelect = document.createElement("select");
    rowSelect.setAttribute("aria-label", "IEC contact-only rung to complete");
    contactOnlyRows.forEach((site, index) => {
      const option = document.createElement("option");
      option.value = String(index);
      option.textContent = `L${site.rowIndex} · ${site.contact}`;
      rowSelect.append(option);
    });
    rowLabel.append(rowSelect);
    const kindLabel = element("label", "", "Coil kind");
    const kindSelect = document.createElement("select");
    kindSelect.setAttribute("aria-label", "IEC terminal coil kind");
    coilKinds.forEach((kind) => {
      const option = document.createElement("option");
      option.value = kind.value;
      option.textContent = kind.label;
      kindSelect.append(option);
    });
    kindLabel.append(kindSelect);
    const variableLabel = element("label", "", "Coil BOOL variable");
    const variableSelect = document.createElement("select");
    variableSelect.setAttribute("aria-label", "IEC terminal coil variable");
    boolSymbols.forEach((name) => {
      const option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      variableSelect.append(option);
    });
    variableLabel.append(variableSelect);
    const insertButton = button("Insert output coil", "primary-button", () => {});
    insertButton.type = "submit";
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const site = contactOnlyRows[Number(rowSelect.value)];
      await applyEdit(
        () => insert_xgwx_iec_ld_terminal_coil(
          current.file.bytes, selectedProgramIndex, site.contactRecordOffset,
          site.contact, kindSelect.value, variableSelect.value,
        ),
        `Insert IEC ${kindSelect.value} coil at L${site.rowIndex}`,
      );
    });
    form.append(rowLabel, kindLabel, variableLabel, insertButton);
    section.append(form);
  }
  section.append(element("p", "muted", "Matches XG5000 Ctrl+L and Ctrl+D: the row high-water mark and later row, branch, function, pin, and expression coordinates move together."));
  return section;
}

function renderIecNoContactInsertion(body) {
  const sites = body.iecNoContactInsertionSites || [];
  if (!sites.length) return null;
  const section = element("section", "iec-insert-contact");
  section.append(element("h3", "", "Insert contact"));
  const form = document.createElement("form");
  const siteLabel = element("label", "", "Stored row");
  const siteSelect = document.createElement("select");
  siteSelect.setAttribute("aria-label", "IEC insertion row");
  sites.forEach((site, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = `L${site.rowIndex} · group ${site.groupIndex + 1} · wire ${site.wireOffset}`;
    siteSelect.append(option);
  });
  siteLabel.append(siteSelect);
  const positionLabel = element("label", "", "Position");
  const positionSelect = document.createElement("select");
  positionSelect.setAttribute("aria-label", "IEC contact x position");
  positionLabel.append(positionSelect);
  const kindLabel = element("label", "", "Contact kind");
  const kind = document.createElement("select");
  kind.setAttribute("aria-label", "IEC contact kind to insert");
  for (const [value, label] of IEC_ADDRESSED_CONTACT_CHOICES) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    kind.append(option);
  }
  kindLabel.append(kind);
  const variableLabel = element("label", "", "BOOL variable");
  const variable = document.createElement("input");
  variable.type = "text";
  variable.maxLength = 255;
  variable.placeholder = "Existing BOOL variable";
  variable.setAttribute("aria-label", "IEC contact BOOL variable");
  variableLabel.append(variable);
  const submit = button("Insert contact", "primary-button", () => {});
  submit.type = "submit";
  submit.textContent = "Insert contact";
  const update = () => {
    const site = sites[Number(siteSelect.value)];
    positionSelect.replaceChildren();
    for (let x = site.startX; x + 3 <= site.endX; x += 3) {
      const option = document.createElement("option");
      option.value = String(x);
      option.textContent = `x ${x}`;
      positionSelect.append(option);
    }
  };
  const validate = () => {
    submit.disabled = !variable.value.trim() || /[\p{Cc}]/u.test(variable.value);
  };
  siteSelect.addEventListener("change", update);
  variable.addEventListener("input", validate);
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (submit.disabled) return;
    const site = sites[Number(siteSelect.value)];
    const name = variable.value.trim();
    await applyEdit(() => insert_xgwx_iec_ld_contact(
      current.file.bytes, selectedProgramIndex, site.wireOffset,
      Number(positionSelect.value), site.startX, site.endX, kind.value, name,
    ), `Insert IEC ${kind.options[kind.selectedIndex].text.toLowerCase()} contact ${name}`);
  });
  update();
  validate();
  form.append(siteLabel, positionLabel, kindLabel, variableLabel, submit);
  section.append(form);
  return section;
}

function renderIecShortWireContactInsertion(body) {
  const sites = body.iecShortWireContactInsertionSites || [];
  if (!sites.length) return null;
  const section = element("section", "iec-insert-contact");
  section.append(element("h3", "", "Replace short wire with contact"));
  const form = document.createElement("form");
  const siteLabel = element("label", "", "One-cell wire");
  const siteSelect = document.createElement("select");
  siteSelect.setAttribute("aria-label", "IEC short wire contact site");
  sites.forEach((site, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = `L${site.rowIndex} · group ${site.groupIndex + 1} · x ${site.rawX}`;
    siteSelect.append(option);
  });
  siteLabel.append(siteSelect);
  const kindLabel = element("label", "", "Contact kind");
  const kind = document.createElement("select");
  kind.setAttribute("aria-label", "IEC short wire contact kind");
  for (const [value, label] of IEC_ADDRESSED_CONTACT_CHOICES) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    kind.append(option);
  }
  kindLabel.append(kind);
  const variableLabel = element("label", "", "BOOL variable");
  const variable = document.createElement("input");
  variable.type = "text";
  variable.maxLength = 255;
  variable.placeholder = "Existing BOOL variable";
  variable.setAttribute("aria-label", "IEC short wire BOOL variable");
  variableLabel.append(variable);
  const submit = button("Replace short wire with contact", "primary-button", () => {});
  submit.type = "submit";
  const validate = () => {
    try {
      const site = sites[Number(siteSelect.value)];
      insert_xgwx_iec_ld_short_wire_contact(current.file.bytes, selectedProgramIndex,
        site.wireOffset, site.rawX, kind.value, variable.value.trim());
      submit.disabled = false;
    } catch { submit.disabled = true; }
  };
  siteSelect.addEventListener("change", validate);
  kind.addEventListener("change", validate);
  variable.addEventListener("input", validate);
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (submit.disabled) return;
    const site = sites[Number(siteSelect.value)];
    const name = variable.value.trim();
    await applyEdit(() => insert_xgwx_iec_ld_short_wire_contact(
      current.file.bytes, selectedProgramIndex, site.wireOffset, site.rawX, kind.value, name,
    ), `Insert IEC contact ${name} at L${site.rowIndex} x${site.rawX}`);
  });
  form.append(siteLabel, kindLabel, variableLabel, submit);
  validate();
  section.append(form, element("p", "muted",
    "Replaces a captured one-cell wire. The operand must resolve to BOOL and the circuit must remain valid."));
  return section;
}

function renderIecLeadingContactInsertion(body) {
  const sites = body.iecLeadingContactInsertionSites || [];
  if (!sites.length) return null;
  const section = element("section", "iec-insert-contact");
  section.append(element("h3", "", "Insert leading contact"));
  const form = document.createElement("form");
  const rowLabel = element("label", "", "Empty first cell");
  const row = document.createElement("select");
  row.setAttribute("aria-label", "IEC leading contact row");
  sites.forEach((site, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = `L${site.rowIndex} · group ${site.groupIndex + 1} · x 1`;
    row.append(option);
  });
  rowLabel.append(row);
  const kindLabel = element("label", "", "Contact kind");
  const kind = document.createElement("select");
  kind.setAttribute("aria-label", "IEC leading contact kind");
  for (const [value, label] of IEC_ADDRESSED_CONTACT_CHOICES) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    kind.append(option);
  }
  kindLabel.append(kind);
  const variableLabel = element("label", "", "BOOL variable");
  const variable = document.createElement("input");
  variable.type = "text";
  variable.maxLength = 255;
  variable.placeholder = "Existing BOOL variable";
  variable.setAttribute("aria-label", "IEC leading contact BOOL variable");
  variableLabel.append(variable);
  const submit = button("Insert leading contact", "primary-button", () => {});
  submit.type = "submit";
  const validate = () => {
    try {
      insert_xgwx_iec_ld_leading_contact(current.file.bytes, selectedProgramIndex,
        sites[Number(row.value)].insertionOffset, kind.value, variable.value.trim());
      submit.disabled = false;
    } catch { submit.disabled = true; }
  };
  row.addEventListener("change", validate);
  kind.addEventListener("change", validate);
  variable.addEventListener("input", validate);
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (submit.disabled) return;
    const site = sites[Number(row.value)];
    const name = variable.value.trim();
    await applyEdit(() => insert_xgwx_iec_ld_leading_contact(
      current.file.bytes, selectedProgramIndex, site.insertionOffset, kind.value, name,
    ), `Insert leading IEC contact ${name} at L${site.rowIndex}`);
  });
  form.append(rowLabel, kindLabel, variableLabel, submit);
  validate();
  section.append(form, element("p", "muted",
    "Fills the first x1 cell on a captured two-row branch. The operand must resolve to BOOL."));
  return section;
}

function iecAddressedContactSites(body, property) {
  return (body[property] || []).map((site) => ({
    ...site,
    operand: (body.sourceStrings || []).find((item) => item.iecRecordOffset === site.contactOffset && item.iecElementKind),
  })).map((site) => ({
    ...site,
    variable: site.operand?.value,
    kind: IEC_CONTACT_KIND_BY_SOURCE_LABEL.get(site.operand?.iecElementKind),
  })).filter((site) => site.variable && site.kind);
}

function renderIecNoContactDeletion(body) {
  const sites = iecAddressedContactSites(body, "iecNoContactCellDeletionSites");
  if (!sites.length) return null;
  const section = element("section", "iec-insert-contact");
  section.append(element("h3", "", "Cell Delete contact"));
  const form = document.createElement("form");
  const label = element("label", "", "Stored contact");
  const select = document.createElement("select");
  select.setAttribute("aria-label", "IEC contact to delete");
  sites.forEach((site, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = `L${site.rowIndex} · x ${site.rawX} · ${site.kind} · ${site.variable}`;
    select.append(option);
  });
  label.append(select);
  const submit = button("Delete contact and close cell", "secondary-button", () => {});
  submit.type = "submit";
  submit.textContent = "Delete contact and close cell";
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const site = sites[Number(select.value)];
    await applyEdit(() => delete_xgwx_iec_ld_contact_cell(
      current.file.bytes, selectedProgramIndex, site.contactOffset, site.rawX, site.kind, site.variable,
    ), `Cell delete IEC contact ${site.variable}`);
  });
  form.append(label, submit);
  section.append(form, element("p", "muted", "Uses XG5000 Cell Delete semantics. A leading branch contact moves the next contact into the first cell; a contact between wires shifts later cells left."));
  return section;
}

function renderIecContactGapDeletion(body) {
  const sites = iecAddressedContactSites(body, "iecNoContactDeletionSites");
  if (!sites.length) return null;
  const section = element("section", "iec-insert-contact");
  section.append(element("h3", "", "Delete contact"));
  const form = document.createElement("form");
  const label = element("label", "", "Stored contact");
  const select = document.createElement("select");
  select.setAttribute("aria-label", "IEC contact to remove without closing cell");
  sites.forEach((site, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = `L${site.rowIndex} · x ${site.rawX} · ${site.kind} · ${site.variable}`;
    select.append(option);
  });
  label.append(select);
  const submit = button("Delete contact and leave gap", "secondary-button", () => {});
  submit.type = "submit";
  submit.textContent = "Delete contact and leave gap";
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const site = sites[Number(select.value)];
    await applyEdit(() => delete_xgwx_iec_ld_contact(
      current.file.bytes, selectedProgramIndex, site.contactOffset, site.rawX, site.kind, site.variable,
    ), `Delete IEC contact ${site.variable}`);
  });
  form.append(label, submit);
  section.append(form, element("p", "muted", "Uses XG5000 Delete semantics. A leading branch contact leaves its first cell empty; a contact between wires leaves the two wire fragments separated."));
  return section;
}

function renderIecHorizontalWireRepair(body) {
  const sites = body.iecHorizontalWireRepairSites || [];
  if (!sites.length) return null;
  const section = element("section", "iec-insert-contact");
  section.append(element("h3", "", "Reconnect horizontal wire gap"));
  const form = document.createElement("form");
  const label = element("label", "", "Wire gap");
  const select = document.createElement("select");
  select.setAttribute("aria-label", "IEC horizontal wire gap to reconnect");
  sites.forEach((site, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = `L${site.rowIndex} · x ${site.rawX}`;
    select.append(option);
  });
  label.append(select);
  const submit = button("Insert horizontal wire", "secondary-button", () => {});
  submit.type = "submit";
  submit.textContent = "Insert horizontal wire";
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const site = sites[Number(select.value)];
    await applyEdit(() => repair_xgwx_iec_ld_horizontal_wire(
      current.file.bytes, selectedProgramIndex, site.insertionOffset, site.rawX,
    ), `Reconnect IEC wire at L${site.rowIndex} x ${site.rawX}`);
  });
  form.append(label, submit);
  section.append(form, element("p", "muted", "This inserts the same short horizontal wire as XG5000 F5 for the captured deletion gap."));
  return section;
}

function renderIecHorizontalWireDeletion(body) {
  const sites = body.iecHorizontalWireDeletionSites || [];
  if (!sites.length) return null;
  const section = element("section", "iec-insert-contact");
  section.append(element("h3", "", "Remove horizontal wire"));
  const form = document.createElement("form");
  const label = element("label", "", "Wire segment");
  const select = document.createElement("select");
  select.setAttribute("aria-label", "IEC horizontal wire segment to remove");
  sites.forEach((site, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = `L${site.rowIndex} · x ${site.rawX}`;
    select.append(option);
  });
  label.append(select);
  const submit = button("Remove horizontal wire", "secondary-button", () => {});
  submit.type = "submit";
  submit.textContent = "Remove horizontal wire";
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const site = sites[Number(select.value)];
    await applyEdit(() => delete_xgwx_iec_ld_horizontal_wire(
      current.file.bytes, selectedProgramIndex, site.wireOffset, site.rawX,
    ), `Remove IEC wire at L${site.rowIndex} x ${site.rawX}`);
  });
  form.append(label, submit);
  section.append(form, element("p", "muted", "Removing a wire opens a one-cell gap. Reconnect it before using the program if Check Program reports a disconnected circuit."));
  return section;
}

function planIecBranchRemoval(body, segment) {
  let bytes;
  try {
    bytes = edit_xgwx_iec_ld_branch_segment(current.file.bytes, selectedProgramIndex,
      segment.groupIndex, segment.startRowIndex, segment.endRowIndex, segment.x, true, false);
  } catch {
    bytes = edit_xgwx_iec_ld_vertical_wire(current.file.bytes, selectedProgramIndex,
      segment.groupIndex, segment.startRowIndex, segment.endRowIndex, segment.x, true, false);
    return { bytes, preservedRows: true, removedFeedAndTail: false, removedOpenTail: false };
  }
  const updated = parse_xgwx(bytes).ladder.find(program => program.programIndex === selectedProgramIndex);
  const endpoints = (updated?.iecCircuitGraph?.openBranchEndpoints || [])
    .filter(point => point.groupIndex === segment.groupIndex);
  const wasOpen = (body.iecCircuitGraph?.openBranchEndpoints || [])
    .some(point => point.groupIndex === segment.groupIndex);
  if (!wasOpen && endpoints.length === 1) {
    const point = endpoints[0];
    const tail = updated.iecGeometry.vertical.find(branch => branch.groupIndex === point.groupIndex
      && branch.endRowIndex === point.rowIndex && branch.x === point.x);
    if (!tail) throw new Error("The deleted feed has no decoded terminal branch to remove.");
    bytes = edit_xgwx_iec_ld_branch_segment(bytes, selectedProgramIndex,
      tail.groupIndex, tail.startRowIndex, tail.endRowIndex, tail.x, true, false);
    return { bytes, removedFeedAndTail: true, removedOpenTail: false };
  }
  return { bytes, removedFeedAndTail: false, removedOpenTail: wasOpen };
}

function deleteIecVerticalWireBytes(body, wire, bytes = current.file.bytes) {
  try {
    return edit_xgwx_iec_ld_vertical_wire(bytes, selectedProgramIndex,
      wire.groupIndex, wire.startRowIndex, wire.endRowIndex, wire.x, true, false);
  } catch (error) {
    const endRecords = (body.iecRecords || []).filter(record => record.groupIndex === wire.groupIndex
      && record.rowIndex === wire.endRowIndex);
    if (endRecords.length !== 1 || endRecords[0].kind !== "Branch end") throw error;
    return edit_xgwx_iec_ld_branch_segment(bytes, selectedProgramIndex,
      wire.groupIndex, wire.startRowIndex, wire.endRowIndex, wire.x, true, false);
  }
}

function addIecBranchBytes(pair, x) {
  if (pair.extendBlankRow) {
    return extend_xgwx_iec_ld_vertical_wire(current.file.bytes, selectedProgramIndex,
      pair.groupIndex, pair.startRowIndex, x);
  }
  if (pair.lowerGroupIndex !== undefined && pair.lowerGroupIndex !== pair.groupIndex) {
    return connect_xgwx_iec_ld_groups(current.file.bytes, selectedProgramIndex,
      pair.groupIndex, pair.startRowIndex, pair.lowerGroupIndex, pair.endRowIndex, x);
  }
  try {
    return edit_xgwx_iec_ld_branch_segment(current.file.bytes, selectedProgramIndex,
      pair.groupIndex, pair.startRowIndex, pair.endRowIndex, x, false, true);
  } catch {
    return edit_xgwx_iec_ld_vertical_wire(current.file.bytes, selectedProgramIndex,
      pair.groupIndex, pair.startRowIndex, pair.endRowIndex, x, false, true);
  }
}

function renderIecBranchEditing(body) {
  const rows = body.iecRows || [];
  const records = body.iecRecords || [];
  const segments = body.iecGeometry?.vertical || [];
  if (rows.length < 2) return null;

  const pairs = rows.slice(0, -1).flatMap((row, index) => {
    const next = rows[index + 1];
    return next.rowIndex === row.rowIndex + 1
      ? [{ groupIndex: row.groupIndex, lowerGroupIndex: next.groupIndex,
        startRowIndex: row.rowIndex, endRowIndex: next.rowIndex }]
      : [];
  });
  let ffBranchOutputRow = null;
  if (selectedProgramIndex === 0
    && rows.some((row) => row.groupIndex === 9 && row.rowIndex === 15)) {
    try {
      delete_xgwx_iec_ld_ff_branch_output_row(current.file.bytes, 0, 9, 15);
      ffBranchOutputRow = { groupIndex: 9, rowIndex: 15 };
    } catch { /* Other FF branch layouts remain unavailable. */ }
  }
  const nestedDeletionSites = selectedProgramIndex === 6
    ? rows.filter((row) => (row.groupIndex === 3 && [4, 6].includes(row.rowIndex))
        || (row.groupIndex === 8 && [21, 23].includes(row.rowIndex)))
      .filter((row) => {
        const kinds = records.filter((record) => record.groupIndex === row.groupIndex
          && record.rowIndex === row.rowIndex).map((record) => record.kind);
        if (kinds.join(",") !== "Branch end,Branch start,Branch end,Contact,Branch end") return false;
        try {
          delete_xgwx_iec_ld_nested_contact_branch_row(
            current.file.bytes, selectedProgramIndex, row.groupIndex, row.rowIndex,
          );
          return true;
        } catch { return false; }
      })
    : [];
  const chainedDeletionSites = selectedProgramIndex === 6
    ? rows.filter((row) => row.groupIndex === 14 && [83, 84].includes(row.rowIndex))
      .filter((row) => {
        const kinds = records.filter((record) => record.groupIndex === row.groupIndex
          && record.rowIndex === row.rowIndex).map((record) => record.kind);
        if (kinds.join(",") !== "Contact,Branch end,Branch start") return false;
        try {
          delete_xgwx_iec_ld_chained_contact_branch_row(
            current.file.bytes, selectedProgramIndex, row.groupIndex, row.rowIndex,
          );
          return true;
        } catch { return false; }
      })
    : [];
  const emptyDeletionSites = selectedProgramIndex === 2
    ? rows.filter((row) => (row.groupIndex === 7 && row.rowIndex === 21)
        || (row.groupIndex === 8 && row.rowIndex === 28))
      .filter((row) => {
        const kinds = records.filter((record) => record.groupIndex === row.groupIndex
          && record.rowIndex === row.rowIndex).map((record) => record.kind);
        if (kinds.join(",") !== "Branch end,Branch start") return false;
        try {
          delete_xgwx_iec_ld_empty_branch_row(
            current.file.bytes, selectedProgramIndex, row.groupIndex, row.rowIndex,
          );
          return true;
        } catch { return false; }
      })
    : [];
  if (!pairs.length && !ffBranchOutputRow && !nestedDeletionSites.length
    && !chainedDeletionSites.length && !emptyDeletionSites.length) return null;

  const section = element("section", "iec-insert-contact iec-branch-editor");
  section.append(element("h3", "", "Edit vertical branch"));

  if (ffBranchOutputRow) {
    const deleteFfRow = button("Delete L15 FF output branch row", "secondary-button", async () => {
      await applyEdit(() => delete_xgwx_iec_ld_ff_branch_output_row(
        current.file.bytes, selectedProgramIndex,
        ffBranchOutputRow.groupIndex, ffBranchOutputRow.rowIndex,
      ), "Delete IEC L15 FF output branch row and connected FF block");
    });
    section.append(deleteFfRow, element("p", "muted",
      "Matches XG5000 Delete Line: removes the lower output, connected FF block, and branch, then closes the row gap."));
  }

  if (nestedDeletionSites.length) {
    const deleteMiddleForm = document.createElement("form");
    const deleteMiddleLabel = element("label", "", "Nested contact branch row");
    const deleteMiddleSelect = document.createElement("select");
    deleteMiddleSelect.setAttribute("aria-label", "IEC nested contact branch row to delete");
    nestedDeletionSites.forEach((site, index) => {
      const option = document.createElement("option");
      option.value = String(index);
      option.textContent = `group ${site.groupIndex + 1} · L${site.rowIndex}`;
      deleteMiddleSelect.append(option);
    });
    deleteMiddleLabel.append(deleteMiddleSelect);
    const deleteMiddle = button("Delete middle branch row", "secondary-button", () => {});
    deleteMiddle.type = "submit";
    deleteMiddleForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const site = nestedDeletionSites[Number(deleteMiddleSelect.value)];
      await applyEdit(() => delete_xgwx_iec_ld_nested_contact_branch_row(
        current.file.bytes, selectedProgramIndex, site.groupIndex, site.rowIndex,
      ), `Delete IEC nested contact branch row L${site.rowIndex}`);
    });
    deleteMiddleForm.append(deleteMiddleLabel, deleteMiddle);
    section.append(deleteMiddleForm, element("p", "muted",
      "Matches XG5000 Delete Line: reconnects the outer branch, removes the two inner branches, and shifts later rows up."));
  }

  if (chainedDeletionSites.length) {
    const form = document.createElement("form");
    const label = element("label", "", "Chained contact branch row");
    const select = document.createElement("select");
    select.setAttribute("aria-label", "IEC chained contact branch row to delete");
    chainedDeletionSites.forEach((site, index) => {
      const option = document.createElement("option");
      option.value = String(index);
      option.textContent = `group ${site.groupIndex + 1} · L${site.rowIndex}`;
      select.append(option);
    });
    label.append(select);
    const submit = button("Delete contact branch row", "secondary-button", () => {});
    submit.type = "submit";
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const site = chainedDeletionSites[Number(select.value)];
      await applyEdit(() => delete_xgwx_iec_ld_chained_contact_branch_row(
        current.file.bytes, selectedProgramIndex, site.groupIndex, site.rowIndex,
      ), `Delete IEC chained contact branch row L${site.rowIndex}`);
    });
    form.append(label, submit);
    section.append(form, element("p", "muted",
      "Matches XG5000 Delete Line: joins the adjacent x3 branches and shifts later rows up."));
  }

  if (emptyDeletionSites.length) {
    const form = document.createElement("form");
    const label = element("label", "", "Branch-only row");
    const select = document.createElement("select");
    select.setAttribute("aria-label", "IEC branch-only row to delete");
    emptyDeletionSites.forEach((site, index) => {
      const option = document.createElement("option");
      option.value = String(index);
      option.textContent = `group ${site.groupIndex + 1} · L${site.rowIndex}`;
      select.append(option);
    });
    label.append(select);
    const submit = button("Delete branch-only row", "secondary-button", () => {});
    submit.type = "submit";
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const site = emptyDeletionSites[Number(select.value)];
      await applyEdit(() => delete_xgwx_iec_ld_empty_branch_row(
        current.file.bytes, selectedProgramIndex, site.groupIndex, site.rowIndex,
      ), `Delete IEC branch-only row L${site.rowIndex}`);
    });
    form.append(label, submit);
    section.append(form, element("p", "muted",
      "Matches XG5000 Delete Line: joins the vertical branch across the removed row."));
  }

  if (!pairs.length) return section;

  const deletableTopRows = pairs.filter((pair) => {
    const topRecords = records.filter((record) => record.groupIndex === pair.groupIndex
      && record.rowIndex === pair.startRowIndex);
    const lowerRecords = records.filter((record) => record.groupIndex === pair.groupIndex
      && record.rowIndex === pair.endRowIndex);
    if (topRecords.at(-1)?.kind !== "Coil"
      || !topRecords.some((record) => record.kind === "Branch start")
      || lowerRecords.at(-1)?.kind !== "Branch end"
      || !lowerRecords.slice(0, -1).every((record) => record.kind === "Contact")) return false;
    try {
      delete_xgwx_iec_ld_branch_top_row(
        current.file.bytes, selectedProgramIndex, pair.groupIndex, pair.startRowIndex,
      );
      return true;
    } catch { return false; }
  });
  if (deletableTopRows.length) {
    const deleteRowForm = document.createElement("form");
    const deleteRowLabel = element("label", "", "Upper branch row");
    const deleteRowSelect = document.createElement("select");
    deleteRowSelect.setAttribute("aria-label", "IEC upper branch row to delete");
    deletableTopRows.forEach((pair, index) => {
      const option = document.createElement("option");
      option.value = String(index);
      option.textContent = `group ${pair.groupIndex + 1} · L${pair.startRowIndex}–L${pair.endRowIndex}`;
      deleteRowSelect.append(option);
    });
    deleteRowLabel.append(deleteRowSelect);
    const deleteRow = button("Delete upper branch row", "secondary-button", () => {});
    deleteRow.type = "submit";
    deleteRowForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const pair = deletableTopRows[Number(deleteRowSelect.value)];
      await applyEdit(() => delete_xgwx_iec_ld_branch_top_row(
        current.file.bytes, selectedProgramIndex, pair.groupIndex, pair.startRowIndex,
      ), `Delete upper IEC branch row L${pair.startRowIndex}`);
    });
    deleteRowForm.append(deleteRowLabel, deleteRow);
    section.append(deleteRowForm, element("p", "muted",
      "Matches XG5000 Delete Line: keeps the lower contacts, removes the upper line, and shifts later rows up."));
  }

  const removeForm = document.createElement("form");
  const existingLabel = element("label", "", "Existing segment");
  const existing = document.createElement("select");
  existing.setAttribute("aria-label", "Existing IEC branch segment");
  segments.forEach((segment, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = `group ${segment.groupIndex + 1} (index ${segment.groupIndex}) · L${segment.startRowIndex}–L${segment.endRowIndex} · x ${segment.x}`;
    existing.append(option);
  });
  existingLabel.append(existing);
  const remove = button("Remove branch segment", "secondary-button", () => {});
  remove.type = "submit";
  remove.textContent = "Remove branch segment";
  const removeStatus = element("p", "muted");
  const validateRemove = () => {
    const segment = segments[Number(existing.value)];
    if (!segment) { remove.disabled = true; removeStatus.textContent = "No vertical wire is present."; return; }
    try {
      const plan = planIecBranchRemoval(body, segment);
      remove.textContent = plan.removedFeedAndTail ? "Remove terminal feed and tail"
        : plan.removedOpenTail ? "Remove open branch tail" : "Remove branch segment";
      remove.setAttribute("aria-label", remove.textContent);
      remove.disabled = false;
      const parallelCount = segments.filter((candidate) =>
        candidate.groupIndex === segment.groupIndex
          && candidate.startRowIndex === segment.startRowIndex
          && candidate.endRowIndex === segment.endRowIndex).length;
      removeStatus.textContent = plan.preservedRows
        ? "Removes only the paired vertical wire records. Shared function rows remain in place; open wire endpoints stay editable."
        : plan.removedFeedAndTail
        ? "Deletes the terminal contact feed and its open vertical tail as one edit. Function blocks stay in place."
        : plan.removedOpenTail ? "Removes the open vertical tail back to its first horizontal connection. Function blocks stay in place."
        : parallelCount > 1
        ? "Another parallel segment keeps these rows in the same native group."
        : "Removes the supported branch row, reconnects a continuing spine, and shifts later rows as XG5000 does.";
    } catch (error) {
      remove.disabled = true;
      removeStatus.textContent = String(error);
    }
  };
  existing.addEventListener("change", validateRemove);
  removeForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (remove.disabled) return;
    const segment = segments[Number(existing.value)];
    await applyEdit(() => planIecBranchRemoval(body, segment).bytes, `Remove IEC branch at x ${segment.x} between L${segment.startRowIndex} and L${segment.endRowIndex}`);
  });
  removeForm.append(existingLabel, remove);

  const addForm = document.createElement("form");
  const pairLabel = element("label", "", "Adjacent rows");
  const pairSelect = document.createElement("select");
  pairSelect.setAttribute("aria-label", "IEC branch row pair");
  pairs.forEach((pair, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = `${pair.lowerGroupIndex !== pair.groupIndex
      ? `join networks ${pair.groupIndex + 1} and ${pair.lowerGroupIndex + 1}`
      : `network ${pair.groupIndex + 1}`} · L${pair.startRowIndex}–L${pair.endRowIndex}`;
    pairSelect.append(option);
  });
  pairLabel.append(pairSelect);
  const boundaryLabel = element("label", "", "Boundary");
  const boundary = document.createElement("select");
  boundary.setAttribute("aria-label", "IEC branch boundary");
  for (let x = 3; x <= 93; x += 3) {
    const option = document.createElement("option");
    option.value = String(x);
    option.textContent = `x ${x}`;
    boundary.append(option);
  }
  boundaryLabel.append(boundary);
  const add = button("Add branch segment", "primary-button", () => {});
  add.type = "submit";
  add.textContent = "Add branch segment";
  const addStatus = element("p", "muted");
  const validateAdd = () => {
    const pair = pairs[Number(pairSelect.value)];
    const x = Number(boundary.value);
    const duplicate = segments.some((segment) => segment.groupIndex === pair.groupIndex
      && segment.startRowIndex === pair.startRowIndex
      && segment.endRowIndex === pair.endRowIndex && segment.x === x);
    if (duplicate) {
      add.disabled = true;
      addStatus.textContent = "A segment already exists at this boundary.";
      return;
    }
    try {
      addIecBranchBytes(pair, x);
      add.disabled = false;
      addStatus.textContent = pair.lowerGroupIndex !== pair.groupIndex
        ? "Connects the adjacent networks while retaining their rows and elements. The joined network is disabled if either network is disabled."
        : "Ready to add a paired branch start and end record.";
    } catch (error) {
      add.disabled = true;
      addStatus.textContent = String(error);
    }
  };
  pairSelect.addEventListener("change", validateAdd);
  boundary.addEventListener("change", validateAdd);
  addForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (add.disabled) return;
    const pair = pairs[Number(pairSelect.value)];
    const x = Number(boundary.value);
    await applyEdit(() => addIecBranchBytes(pair, x), `Add IEC branch at x ${x} between L${pair.startRowIndex} and L${pair.endRowIndex}`);
  });
  addForm.append(pairLabel, boundaryLabel, add);

  const splitPairs = pairs.filter(pair => pair.lowerGroupIndex === pair.groupIndex
    && !(body.iecCircuitGraph?.edges || []).some(edge => edge.start.groupIndex === pair.groupIndex
      && edge.start.rowIndex <= pair.startRowIndex && edge.end.rowIndex >= pair.endRowIndex)
    && !(body.iecCircuitGraph?.occupiedAreas || []).some(area => area.groupIndex === pair.groupIndex
      && area.startRowIndex <= pair.startRowIndex && area.endRowIndex >= pair.endRowIndex))
    .filter(pair => {
      try { split_xgwx_iec_ld_group(current.file.bytes, selectedProgramIndex,
        pair.groupIndex, pair.startRowIndex, pair.endRowIndex); return true; }
      catch { return false; }
    });
  if (splitPairs.length) {
    const form = document.createElement("form");
    const label = element("label", "", "Disconnected boundary");
    const select = document.createElement("select");
    select.setAttribute("aria-label", "IEC network split boundary");
    splitPairs.forEach((pair, index) => {
      const option = document.createElement("option"); option.value = String(index);
      option.textContent = `network ${pair.groupIndex + 1} · L${pair.startRowIndex}–L${pair.endRowIndex}`;
      select.append(option);
    });
    label.append(select);
    const submit = button("Separate networks", "primary-button", () => {});
    submit.type = "submit"; submit.textContent = "Separate networks";
    form.addEventListener("submit", async event => {
      event.preventDefault(); const pair = splitPairs[Number(select.value)];
      await applyEdit(() => split_xgwx_iec_ld_group(current.file.bytes, selectedProgramIndex,
        pair.groupIndex, pair.startRowIndex, pair.endRowIndex),
      `Separate IEC networks between L${pair.startRowIndex} and L${pair.endRowIndex}`);
    });
    form.append(label, submit);
    section.append(form, element("p", "muted", "Separates disconnected row ranges without moving elements. Both networks keep the current execution setting. A wire or function body cannot cross this boundary."));
  }

  validateRemove();
  validateAdd();
  section.append(removeForm, removeStatus, addForm, addStatus,
    element("p", "muted", "Removal supports validated lower contact rows and terminal contact feeds. Open terminal tails are removed through their last segment. Addition connects existing electrical points and can join adjacent networks."));
  return section;
}

function resetLadderSelection() {
  selectedCellOffset = null;
  selectedBlankCell = null;
  selectedLadderAnchor = null;
  selectedLadderFocus = null;
  selectedLadderComment = null;
}

function ladderCellAtPosition(ladder, position) {
  return ladder.cells.find((cell) => (
    cell.rawY === position.rawY && ldCellColumn(cell.rawX) === position.column
  )) || null;
}

function currentLadderSelection(ladder) {
  const rowValues = xgkCanvasRowValues(ladder);
  const keys = ladderSelectionKeys(rowValues, selectedLadderAnchor, selectedLadderFocus);
  const decodedCells = ladder.cells.filter((cell) => keys.has(ladderPositionKey({
    rawY: cell.rawY,
    column: ldCellColumn(cell.rawX),
  })));
  const editableCount = decodedCells.filter((cell) => (
    cell.sourceText !== null && cell.sourceText !== undefined
  )).length;
  return { keys, decodedCells, editableCount, total: keys.size };
}

function syncLadderSelectionClasses(canvas, keys, focus) {
  const focusKey = focus ? ladderPositionKey(focus) : null;
  canvas.querySelectorAll("[data-ladder-key]").forEach((item) => {
    const selected = keys.has(item.dataset.ladderKey);
    item.classList.toggle("selected", selected);
    item.classList.toggle("active", item.dataset.ladderKey === focusKey);
    item.setAttribute("aria-selected", String(selected));
  });
}

function ladderCommentKey(comment) {
  return `${comment.kind}:${comment.rawY}`;
}

function syncLadderCommentSelectionClasses(canvas, comment) {
  const selectedKey = comment ? ladderCommentKey(comment) : null;
  canvas.querySelectorAll("[data-ladder-comment-key]").forEach((item) => {
    const selected = item.dataset.ladderCommentKey === selectedKey;
    item.classList.toggle("selected", selected);
    item.setAttribute("aria-pressed", String(selected));
  });
}

function renderLadderDiagram(ladder, selectPosition, selectComment, deleteSelection) {
  const viewport = element("div", "ld-viewport");
  const board = element("div", "ld-board");
  const rowValues = xgkCanvasRowValues(ladder);
  let selectedKeys = ladderSelectionKeys(rowValues, selectedLadderAnchor, selectedLadderFocus);
  const rungNumbers = new Map(rowValues.map((rawY, index) => [rawY, index]));
  const layoutRows = buildLdLayoutRows(rowValues, ladder.rungComments || []);
  const rowIndexes = new Map(layoutRows
    .map((row, index) => row.type === "rung" ? [row.rawY, index] : null)
    .filter(Boolean));
  const height = LD_FIRST_ROW_Y + Math.max(layoutRows.length, 1) * LD_ROW_HEIGHT;
  board.style.width = `${LD_VIEW_WIDTH}px`;
  board.style.height = `${height}px`;

  let dragSelecting = false;
  let dragMoved = false;
  let growingCanvas = null;
  const focusCursor = (cursor, extend = false) => {
    if (!cursor) return;
    if (cursor.type === "comment") {
      const target = (ladder.rungComments || []).find((comment) => comment.rawY === cursor.rawY);
      if (!target) return;
      selectComment({ kind: "Rung", ...target, expected: target.text }, cursor.column);
      board.querySelector(`[data-ladder-comment-key="Rung:${cursor.rawY}"]`)?.focus();
      return;
    }
    const position = { rawY: cursor.rawY, column: cursor.column };
    selectPosition(position, extend);
    growingCanvas?.showRow(rowIndexes.get(position.rawY));
    board.querySelector(`[data-ladder-key="${ladderPositionKey(position)}"]`)?.focus();
  };
  const bindSelection = (node, position) => {
    const key = ladderPositionKey(position);
    let preserveSelectionOnFocus = false;
    node.dataset.ladderKey = key;
    const selected = selectedKeys.has(key);
    node.classList.toggle("selected", selected);
    node.classList.toggle("active", ladderPositionKey(selectedLadderFocus || {}) === key);
    node.setAttribute("aria-selected", String(selected));
    node.addEventListener("pointerdown", (event) => {
      if (event.button === 2) {
        preserveSelectionOnFocus = ladderSelectionKeys(
          rowValues, selectedLadderAnchor, selectedLadderFocus,
        ).has(key);
        setTimeout(() => { preserveSelectionOnFocus = false; }, 0);
        return;
      }
      if (event.button !== 0) return;
      dragSelecting = true;
      dragMoved = false;
      selectPosition(position, event.shiftKey);
      document.addEventListener("pointerup", () => {
        dragSelecting = false;
      }, { once: true });
    });
    node.addEventListener("pointerenter", (event) => {
      if (dragSelecting && (event.buttons & 1)) {
        dragMoved = true;
        selectPosition(position, true);
      }
    });
    node.addEventListener("focus", () => {
      if (preserveSelectionOnFocus) return;
      if (ladderPositionKey(selectedLadderFocus || {}) !== key) selectPosition(position, false);
    });
    node.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      if (!ladderSelectionKeys(rowValues, selectedLadderAnchor, selectedLadderFocus).has(key)) {
        selectPosition(position, false);
      }
      showLadderContextMenu(event.clientX, event.clientY, ladder, position, deleteSelection);
    });
    node.addEventListener("dblclick", (event) => {
      if (ladderCellAtPosition(ladder, position)) return;
      event.preventDefault(); void showXgkBlankInput(ladder, position);
    });
    node.addEventListener("keydown", async (event) => {
      if (event.key === "Enter" && !event.repeat && !event.ctrlKey && !event.metaKey && !event.altKey
        && !ladderCellAtPosition(ladder, position)) {
        event.preventDefault(); event.stopPropagation();
        void showXgkBlankInput(ladder, position); return;
      }
      if ((event.ctrlKey || event.metaKey) && !event.altKey
        && ["c", "x", "v"].includes(event.key.toLowerCase())) {
        event.preventDefault();
        event.stopPropagation();
        const operation = event.key.toLowerCase();
        if (operation === "c" || operation === "x") {
          try {
            if (!ladder.structuralEditing) throw new Error("Structural editing is unavailable for this program layout");
            const copied = selectedLadderClipboard(ladder);
            if (operation === "c") ladderClipboard = copied;
            else if (await deleteSelection(`Cut ${copied.cells.length} ladder elements`)) ladderClipboard = copied;
          } catch (error) {
            vscode.postMessage({ type: "showError", message: String(error) });
          }
        } else {
          await applyEdit(() => ladderPasteEdits(ladder, position).reduce((bytes, edit) =>
            edit_xgwx_ladder_cell(bytes, selectedProgramIndex, edit), current.file.bytes),
          `Paste XGK ladder cells at ${position.column + 1}:${position.rawY}`);
        }
        return;
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "l" && ladder.structuralEditing) {
        event.preventDefault(); event.stopPropagation();
        await insertLadderRow(position.rawY);
        return;
      }
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
        event.preventDefault();
        if (event.key === "ArrowDown" && position.rawY === rowValues.at(-1)) growingCanvas?.ensureRow(layoutRows.length);
        focusCursor(moveLadderCursor(layoutRows, {
          type: "rung", rawY: position.rawY, column: position.column,
        }, event.key, LD_COLUMN_COUNT), event.shiftKey);
      }
      if (isLadderDeleteKey(event)) {
        event.preventDefault(); event.stopPropagation();
        await deleteSelection();
      }
    });
  };

  const addWireControl = (label, left, top, width, height, position, remove) => {
    const control = button(label,"ld-wire-target", () => {
      selectedLadderAnchor = selectedLadderFocus = selectedLadderComment = null;
      selectedCellOffset = selectedBlankCell = null;
      board.querySelectorAll(".selected, .active").forEach(node => node.classList.remove("selected","active"));
      control.classList.add("selected"); control.setAttribute("aria-selected","true");
    });
    Object.assign(control.style,{left:`${left}px`,top:`${top}px`,width:`${Math.max(width,10)}px`,height:`${Math.max(height,10)}px`});
    control.addEventListener("dblclick",event => {
      event.preventDefault(); event.stopPropagation();
      const bounds = board.getBoundingClientRect();
      const row = layoutRows[Math.max(0,Math.min(layoutRows.length-1,Math.round((event.clientY-bounds.top-LD_FIRST_ROW_Y)/LD_ROW_HEIGHT)))];
      if (row?.type !== "rung") return;
      const column = Math.max(0,Math.min(9,Math.floor((event.clientX-bounds.left-LD_LEFT_RAIL)/((LD_RIGHT_RAIL-LD_LEFT_RAIL)/10))));
      const target = {rawY:row.rawY,column};
      selectPosition(target);
      if (!ladderCellAtPosition(ladder,target)) void showXgkBlankInput(ladder,target);
    });
    control.addEventListener("keydown",async event => {
      if (!event.ctrlKey && !event.metaKey && !event.altKey
        && ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
        event.preventDefault(); event.stopPropagation();
        if (event.key === "ArrowDown" && position.rawY === rowValues.at(-1)) growingCanvas?.ensureRow(layoutRows.length);
        focusCursor(moveLadderCursor(layoutRows, {type:"rung",...position}, event.key, LD_COLUMN_COUNT), event.shiftKey);
        return;
      }
      if (!isLadderDeleteKey(event)) return;
      event.preventDefault(); event.stopPropagation();
      await applyEdit(remove,`Delete ${label}`,() => {selectedLadderAnchor = selectedLadderFocus = position;});
      requestAnimationFrame(() => document.querySelector(`[data-ladder-key="${ladderPositionKey(position)}"]`)?.focus({preventScroll:true}));
    });
    board.append(control);
  };
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.classList.add("ld-wires");
  svg.setAttribute("viewBox", `0 0 ${LD_VIEW_WIDTH} ${height}`);
  svg.setAttribute("aria-hidden", "true");
  const firstY = ldRowY(0) - 24;
  const lastY = ldRowY(Math.max(layoutRows.length - 1, 0)) + 24;
  svg.append(svgLine(LD_LEFT_RAIL, firstY, LD_LEFT_RAIL, lastY, "rail"));
  svg.append(svgLine(LD_RIGHT_RAIL, firstY, LD_RIGHT_RAIL, lastY, "rail"));

  (ladder.horizontalLines || []).forEach((line) => {
    const rowIndex = rowIndexes.get(line.rawY);
    if (rowIndex === undefined) return;
    svg.append(svgLine(ldWireStartX(line.rawXStart), ldRowY(rowIndex), ldWireEndX(line.rawXEnd), ldRowY(rowIndex), "wire"));
  });
  // An element's leads belong to its own cell, not to a full-row wire.
  (ladder.cells || []).forEach((cell) => {
    const rowIndex = rowIndexes.get(cell.rawY);
    if (rowIndex === undefined) return;
    const column = ldCellColumn(cell.rawX);
    const width = (LD_RIGHT_RAIL - LD_LEFT_RAIL) / LD_COLUMN_COUNT;
    const span = cell.kind === "Comparison" && ladder.comparisonChoices?.some(choice => choice.mnemonic === cell.value)
      ? cell.operands.length + 1 : 1;
    svg.append(svgLine(LD_LEFT_RAIL + column * width, ldRowY(rowIndex),
      LD_LEFT_RAIL + (column + span) * width, ldRowY(rowIndex), "wire"));
  });
  (ladder.verticalLines || []).forEach((line) => {
    const start = rowIndexes.get(line.rawYStart);
    const end = rowIndexes.get(line.rawYEnd);
    if (start === undefined || end === undefined) return;
    svg.append(svgLine(ldBoundaryX(line.rawX), ldRowY(start), ldBoundaryX(line.rawX), ldRowY(end), "wire"));
  });
  board.append(svg);
  if (ladder.structuralEditing) {
    for (const line of ladder.horizontalLines || []) {
      const index = rowIndexes.get(line.rawY); if (index === undefined) continue;
      const left = ldWireStartX(line.rawXStart), right = ldWireEndX(line.rawXEnd);
      addWireControl(`Horizontal XGK wire L${line.rawY/4} x${line.rawXStart}–${line.rawXEnd}`,left,ldRowY(index)-5,right-left,10,
        {rawY:line.rawY,column:ldCellColumn(line.rawXStart)}, () => delete_xgwx_ladder_horizontal_wire(current.file.bytes,selectedProgramIndex,line.rawY,line.rawXStart,line.rawXEnd));
    }
    for (const wire of ladder.branchConnections || []) {
      const first = rowIndexes.get(wire.rawYStart), last = rowIndexes.get(wire.rawYEnd);
      if (first === undefined || last === undefined) continue;
      addWireControl(`Vertical XGK wire L${wire.rawYStart/4}–L${wire.rawYEnd/4} x${wire.rawX}`,ldBoundaryX(wire.rawX)-5,ldRowY(first)+4,10,ldRowY(last)-ldRowY(first)-8,
        {rawY:wire.rawYStart,column:Math.max(0,wire.rawX/3-1)}, () => delete_xgwx_ladder_vertical_wire(current.file.bytes,selectedProgramIndex,wire.rawX,wire.rawYStart,wire.rawYEnd));
    }
  }


  for (let column = 0; column < LD_COLUMN_COUNT; column += 1) {
    const label = element("span", "ld-column-label", column + 1);
    label.style.left = `${ldCellX(column)}px`;
    board.append(label);
  }

  const occupied = new Set((ladder.cells || []).map(cell => ldBlankKey(cell.rawY, ldCellColumn(cell.rawX))));
  const blankRows = new Map();
  const appendBlankRow = (rawY, rungIndex) => {
    const nodes = [];
    blankRows.set(rawY, nodes);
    const label = element("span", "ld-rung-label", rungIndex + 1);
    label.style.top = `${ldRowY(rowIndexes.get(rawY))}px`;
    nodes.push(label);
    board.append(label);


    const displayRowIndex = rowIndexes.get(rawY);
    for (let column = 0; column < LD_COLUMN_COUNT; column += 1) {
      const key = ldBlankKey(rawY, column);
      if (occupied.has(key)) continue;
      const blank = { rawY, rowIndex: rungIndex, column };
      const node = button(`Blank cell, rung ${rungIndex + 1}, column ${column + 1}`, "ld-blank-cell", () => {});
      nodes.push(node);
      node.dataset.blankKey = key;
      bindSelection(node, blank);
      node.style.left = `${ldCellX(column)}px`;
      node.style.top = `${ldRowY(displayRowIndex)}px`;
      board.append(node);
    }
  };
  const renderBlankWindow = (first, last) => {
    selectedKeys = ladderSelectionKeys(rowValues, selectedLadderAnchor, selectedLadderFocus);
    const visible = new Set(layoutRows.slice(first, last + 1).filter(row => row.type === "rung").map(row => row.rawY));
    for (const [rawY, nodes] of blankRows) {
      if (visible.has(rawY)) continue;
      nodes.forEach(node => node.remove());
      blankRows.delete(rawY);
    }
    for (const rawY of visible) {
      if (!blankRows.has(rawY)) appendBlankRow(rawY, rowValues.indexOf(rawY));
    }
  };
  if (!ladder.structuralEditing) renderBlankWindow(0, layoutRows.length - 1);

  layoutRows.forEach((row, layoutIndex) => {
    if (row.type !== "comment") return;
    const commentLabel = element("span", "ld-comment-label", "설명문");
    commentLabel.style.top = `${ldRowY(layoutIndex)}px`;
    board.append(commentLabel);
    const note = element("div", "ld-rung-comment", row.comment.text);
    const comment = {
      kind: "Rung",
      rawY: row.comment.rawY,
      expected: row.comment.text,
      text: row.comment.text,
    };
    const commentKey = ladderCommentKey(comment);
    const selected = ladderCommentKey(selectedLadderComment || {}) === commentKey;
    note.dataset.ladderCommentKey = commentKey;
    note.tabIndex = 0;
    note.setAttribute("role", "button");
    note.setAttribute("aria-label", `Rung comment: ${row.comment.text}`);
    note.setAttribute("aria-pressed", String(selected));
    note.classList.toggle("selected", selected);
    note.style.left = `${LD_LEFT_RAIL + 1}px`;
    note.style.width = `${LD_RIGHT_RAIL - LD_LEFT_RAIL - 2}px`;
    note.style.top = `${ldRowY(layoutIndex)}px`;
    note.title = "Double-click to edit rung comment";
    note.addEventListener("click", () => selectComment(comment));
    note.addEventListener("focus", () => {
      if (ladderCommentKey(selectedLadderComment || {}) !== commentKey) selectComment(comment);
    });
    note.addEventListener("dblclick", (event) => {
      event.preventDefault();
      selectComment(comment);
      showLadderCommentEditor(event.clientX, event.clientY, comment);
    });
    note.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      selectComment(comment);
      showRungCommentContextMenu(event.clientX, event.clientY, comment);
    });
    note.addEventListener("keydown", async (event) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
        event.preventDefault();
        focusCursor(moveLadderCursor(layoutRows, {
          type: "comment", rawY: comment.rawY, column: selectedLadderComment?.column ?? 0,
        }, event.key, LD_COLUMN_COUNT));
        return;
      }
      if ((event.key === "Delete" || event.key === "Backspace") && !event.repeat) {
        event.preventDefault();
        await deleteRungComment(comment, selectedLadderComment?.column ?? 0);
        return;
      }
      if (event.key === "Enter") {
        event.preventDefault();
        const bounds = note.getBoundingClientRect();
        showLadderCommentEditor(bounds.left + bounds.width / 2, bounds.top + bounds.height / 2, comment);
      }
    });
    board.append(note);
  });

  (ladder.outputComments || []).forEach((comment) => {
    const rowIndex = rowIndexes.get(comment.rawY);
    if (rowIndex === undefined) return;
    const note = element("span", "ld-output-comment", comment.text);
    note.style.left = `${LD_RIGHT_RAIL + 12}px`;
    note.style.width = `${LD_VIEW_WIDTH - LD_RIGHT_RAIL - 20}px`;
    note.style.top = `${ldRowY(rowIndex)}px`;
    note.title = "Double-click to edit output comment";
    note.addEventListener("dblclick", (event) => {
      event.preventDefault();
      showLadderCommentEditor(event.clientX, event.clientY, {
        kind: "Output",
        rawY: comment.rawY,
        expected: comment.text,
        text: comment.text,
      });
    });
    board.append(note);
  });

  (ladder.cells || []).forEach((cell) => {
    const rowIndex = rowIndexes.get(cell.rawY);
    if (rowIndex === undefined) return;
    const position = { rawY: cell.rawY, rowIndex: rungNumbers.get(cell.rawY), column: ldCellColumn(cell.rawX) };
    const node = button(ldCellAriaLabel(cell, rungNumbers.get(cell.rawY)), `ld-cell ${ldCellClass(cell)}`, () => {});
    node.dataset.cellOffset = String(cell.offset);
    bindSelection(node, position);
    node.addEventListener("click", (event) => {
      if (event.detail && dragMoved) {
        dragMoved = false;
        return;
      }
    });
    if (structuralElement(cell) || cell.instructionTextEditing) {
      node.addEventListener("dblclick", (event) => {
        event.preventDefault();
        void showXgkElementInput(cell, ladder);
      });
      node.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" || event.repeat || event.altKey || event.ctrlKey || event.metaKey) return;
        event.preventDefault();
        event.stopPropagation();
        void showXgkElementInput(cell, ladder);
      });
    }
    node.style.left = `${ldCellX(ldCellColumn(cell.rawX))}px`;
    if (cell.kind === "Comparison" && ladder.comparisonChoices?.some(choice => choice.mnemonic === cell.value)) {
      node.classList.add("comparison");
      node.style.width = `${(cell.operands.length + 1) * (LD_RIGHT_RAIL - LD_LEFT_RAIL) / LD_COLUMN_COUNT - 10}px`;
      node.style.left = `${ldCellX(ldCellColumn(cell.rawX) + cell.operands.length / 2)}px`;
    }
    node.style.top = `${ldRowY(rowIndex)}px`;
    node.title = cell.contact && cell.sourceText
      ? `${cell.sourceText} · Double-click or Enter to edit operand`
      : cell.sourceText || cell.value || cell.contact || cell.coil || cell.kind;
    const value = element("span", "ld-value", cell.value || ldMarkerLabel(cell));
    const contactVariant = cell.kind !== "Instruction" && !cell.instructionTextEditing && !cell.coil
      ? xgkContactVariant(cell.contact) : null;
    if (contactVariant) node.dataset.contactVariant = contactVariant;
    const glyph = element("span", "ld-glyph", contactVariant
      ? contactVariant.includes("rising") ? "P" : contactVariant.includes("falling") ? "N" : ""
      : ldCellGlyph(cell));
    if (cell.kind === "Instruction" || cell.instructionTextEditing) node.append(glyph);
    else node.append(value, glyph);
    if (cell.operands?.length) node.append(element("span", "ld-operands", cell.operands.join(" ")));
    board.append(node);
  });

  if (ladder.structuralEditing) growingCanvas = attachGrowingCanvas(viewport, {
    initialRows: layoutRows.length, maxRows: 65535, pitch: LD_ROW_HEIGHT, top: LD_FIRST_ROW_Y,
    renderWindow: renderBlankWindow,
    resize: count => {
      const previous = new Set(rowValues);
      const extended = xgkCanvasRowValues(ladder, count);
      for (const rawY of extended.filter(rawY => !previous.has(rawY))) {
        rowValues.push(rawY);
        rowIndexes.set(rawY, layoutRows.length);
        layoutRows.push({ type: "rung", rawY });
      }
      ladder.canvasRowValues = rowValues;
      const height = LD_FIRST_ROW_Y + layoutRows.length * LD_ROW_HEIGHT;
      board.style.height = `${height}px`;
      svg.setAttribute("viewBox", `0 0 ${LD_VIEW_WIDTH} ${height}`);
      svg.querySelectorAll(".rail").forEach(rail => rail.setAttribute("y2", ldRowY(layoutRows.length - 1) + 24));
      ladderCanvasExtents.set(canvasExtentKey(), count);
    },
  });
  viewport.append(board);
  return viewport;
}

function closeLadderOverlay() {
  if (dismissLadderOverlay) dismissLadderOverlay();
}

function positionLadderOverlay(overlay, clientX, clientY) {
  document.body.append(overlay);
  const bounds = overlay.getBoundingClientRect();
  overlay.style.left = `${Math.max(8, Math.min(clientX, window.innerWidth - bounds.width - 8))}px`;
  overlay.style.top = `${Math.max(8, Math.min(clientY, window.innerHeight - bounds.height - 8))}px`;
}

function installLadderOverlayDismissal(overlay) {
  const close = () => {
    document.removeEventListener("pointerdown", outside, true);
    document.removeEventListener("keydown", escape);
    overlay.remove();
    if (dismissLadderOverlay === close) dismissLadderOverlay = null;
  };
  const outside = (event) => {
    if (!overlay.contains(event.target)) close();
  };
  const escape = (event) => {
    if (event.key === "Escape") close();
  };
  document.addEventListener("pointerdown", outside, true);
  document.addEventListener("keydown", escape);
  dismissLadderOverlay = close;
  return close;
}

function normalizedLadderCells(ladder) {
  return (ladder.cells || []).map((cell) => ({
    rawY: cell.rawY,
    column: ldCellColumn(cell.rawX),
    element: structuralElement(cell),
  }));
}

function selectedLadderClipboard(ladder) {
  return captureLadderSelection(
    xgkCanvasRowValues(ladder),
    selectedLadderAnchor,
    selectedLadderFocus,
    normalizedLadderCells(ladder),
  );
}

function ladderPasteEdits(ladder, position) {
  return planLadderPaste(
    ladderClipboard,
    xgkCanvasRowValues(ladder),
    position,
    normalizedLadderCells(ladder),
    LD_COLUMN_COUNT,
  );
}

function showLadderContextMenu(clientX, clientY, ladder, position, deleteSelection) {
  closeLadderOverlay();
  const menu = element("div", "ladder-context-menu");
  menu.setAttribute("role", "menu");
  menu.setAttribute("aria-label", "Ladder cell actions");
  const close = installLadderOverlayDismissal(menu);
  const addItem = (label, action) => {
    const item = button(label, "ladder-context-item", async () => {
      close();
      await action();
    });
    item.setAttribute("role", "menuitem");
    item.textContent = label;
    return item;
  };

  let copiedSelection = null;
  let copyError = "Structural editing is unavailable for this program layout";
  if (ladder.structuralEditing) {
    try {
      copiedSelection = selectedLadderClipboard(ladder);
      copyError = "";
    } catch (error) {
      copyError = error instanceof Error ? error.message : String(error);
    }
  }
  const copy = addItem("Copy", () => { ladderClipboard = copiedSelection; });
  copy.disabled = !copiedSelection;
  copy.title = copyError || `Copy ${copiedSelection.cells.length} ladder element${copiedSelection.cells.length === 1 ? "" : "s"}`;
  const cut = addItem("Cut", async () => {
    const edited = await deleteSelection(
      `Cut ${copiedSelection.cells.length} ladder element${copiedSelection.cells.length === 1 ? "" : "s"}`,
    );
    if (edited) ladderClipboard = copiedSelection;
  });
  cut.disabled = !copiedSelection;
  cut.title = copyError || `Cut ${copiedSelection.cells.length} ladder element${copiedSelection.cells.length === 1 ? "" : "s"}`;

  let pasteEdits = null;
  let pasteError = "Structural editing is unavailable for this program layout";
  if (ladder.structuralEditing) {
    try {
      pasteEdits = ladderPasteEdits(ladder, position);
      pasteEdits.reduce((bytes, edit) => (
        edit_xgwx_ladder_cell(bytes, selectedProgramIndex, edit)
      ), current.file.bytes);
      pasteError = "";
    } catch (error) {
      pasteError = error instanceof Error ? error.message : String(error);
    }
  }
  const paste = addItem("Paste", async () => {
    await applyEdit(
      () => pasteEdits.reduce((bytes, edit) => (
        edit_xgwx_ladder_cell(bytes, selectedProgramIndex, edit)
      ), current.file.bytes),
      `Paste ${ladderClipboard.cells.length} ladder element${ladderClipboard.cells.length === 1 ? "" : "s"}`,
    );
  });
  paste.disabled = !pasteEdits;
  paste.title = pasteError || `Paste ${ladderClipboard.cells.length} ladder element${ladderClipboard.cells.length === 1 ? "" : "s"}`;

  const addComment = (kind, label) => {
    const item = addItem(label, () => {
      showLadderCommentEditor(clientX, clientY, {
        kind,
        rawY: position.rawY,
        expected: null,
        text: "",
      });
    });
    return item;
  };
  const rung = addComment("Rung", "Add rung comment above");
  const crossesBranch = (ladder.branchConnections || []).some((connection) => (
    connection.rawYStart < position.rawY && connection.rawYEnd >= position.rawY
  ));
  rung.disabled = !ladder.structuralEditing || crossesBranch;
  if (crossesBranch) rung.title = "Cannot insert a rung comment inside a branch span";
  const output = addComment("Output", "Add output comment");
  output.disabled = !ladder.structuralEditing
    || (ladder.outputComments || []).some((comment) => comment.rawY === position.rawY);
  const separator = element("div", "ladder-context-separator");
  separator.setAttribute("role", "separator");
  menu.append(copy, cut, paste, separator, rung, output);
  positionLadderOverlay(menu, clientX, clientY);
  menu.querySelector(":not(:disabled)")?.focus();
}

function showRungCommentContextMenu(clientX, clientY, comment) {
  closeLadderOverlay();
  const menu = element("div", "ladder-context-menu");
  menu.setAttribute("role", "menu");
  menu.setAttribute("aria-label", "Rung comment actions");
  const close = installLadderOverlayDismissal(menu);
  const addItem = (label, action) => {
    const item = button(label, "ladder-context-item", async () => {
      close();
      await action();
    });
    item.setAttribute("role", "menuitem");
    item.textContent = label;
    return item;
  };
  const edit = addItem("Edit rung comment", () => {
    showLadderCommentEditor(clientX, clientY, comment);
  });
  const remove = addItem("Delete rung comment", async () => {
    await deleteRungComment(comment, selectedLadderComment?.column ?? 0);
  });
  const separator = element("div", "ladder-context-separator");
  separator.setAttribute("role", "separator");
  menu.append(edit, separator, remove);
  positionLadderOverlay(menu, clientX, clientY);
  edit.focus();
}

async function deleteRungComment(comment, column = 0) {
  selectedLadderComment = null;
  const edited = await applyEdit(() => delete_xgwx_ladder_rung_comment(
    current.file.bytes,
    selectedProgramIndex,
    comment.rawY,
    comment.expected,
  ), "Delete rung comment");
  if (!edited) {
    selectedLadderComment = { kind: "Rung", rawY: comment.rawY, column };
    renderWorkspace();
    requestAnimationFrame(() => document.querySelector(
      `[data-ladder-comment-key="${ladderCommentKey(selectedLadderComment)}"]`,
    )?.focus());
    return false;
  }
  requestAnimationFrame(() => {
    const exact = document.querySelector(`[data-ladder-key="${comment.rawY}:${column}"]`);
    const nearest = [...document.querySelectorAll("[data-ladder-key]")]
      .sort((left, right) => {
        const [leftRow, leftColumn] = left.dataset.ladderKey.split(":").map(Number);
        const [rightRow, rightColumn] = right.dataset.ladderKey.split(":").map(Number);
        return Math.abs(leftRow - comment.rawY) - Math.abs(rightRow - comment.rawY)
          || Math.abs(leftColumn - column) - Math.abs(rightColumn - column);
      })[0];
    (exact || nearest)?.focus();
  });
  return true;
}

function showLadderCommentEditor(clientX, clientY, comment) {
  closeLadderOverlay();
  const editor = element("div", "ladder-comment-editor");
  editor.setAttribute("role", "dialog");
  editor.setAttribute("aria-label", comment.expected === null ? "Create ladder comment" : "Edit ladder comment");
  editor.append(element("label", "ladder-comment-label", comment.kind === "Rung" ? "Rung comment" : "Output comment"));
  const textarea = document.createElement("textarea");
  textarea.value = comment.text;
  textarea.rows = 4;
  textarea.maxLength = 255;
  textarea.setAttribute("aria-label", "Comment text");
  const actions = element("div", "ladder-comment-actions");
  const close = installLadderOverlayDismissal(editor);
  const save = button(comment.expected === null ? "Create comment" : "Save comment", "primary-button", async () => {
    const replacement = textarea.value;
    const edited = await applyEdit(() => edit_xgwx_ladder_comment(current.file.bytes, selectedProgramIndex, {
      kind: comment.kind,
      rawY: comment.rawY,
      expected: comment.expected,
      replacement,
    }), comment.expected === null ? `Create ${comment.kind.toLowerCase()} comment` : `Edit ${comment.kind.toLowerCase()} comment`);
    if (edited) close();
  });
  const cancel = button("Cancel", "secondary-button", close);
  save.textContent = comment.expected === null ? "Create" : "Save";
  cancel.textContent = "Cancel";
  const validate = () => {
    const units = utf16Length(textarea.value);
    save.disabled = !textarea.value.trim() || units > 255 || textarea.value === comment.expected;
  };
  textarea.addEventListener("input", validate);
  textarea.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter" && !save.disabled) {
      event.preventDefault();
      save.click();
    }
  });
  actions.append(save, cancel);
  editor.append(textarea, actions);
  validate();
  positionLadderOverlay(editor, clientX, clientY);
  textarea.focus();
  textarea.select();
}

function buildLdLayoutRows(rowValues, comments) {
  const beforeRung = new Map();
  const trailing = [];
  comments.forEach((comment) => {
    const target = rowValues.find((rawY) => rawY > comment.rawY);
    if (target === undefined) trailing.push(comment);
    else {
      if (!beforeRung.has(target)) beforeRung.set(target, []);
      beforeRung.get(target).push(comment);
    }
  });

  const rows = [];
  rowValues.forEach((rawY) => {
    (beforeRung.get(rawY) || []).forEach((comment) => rows.push({ type: "comment", comment }));
    rows.push({ type: "rung", rawY });
  });
  trailing.forEach((comment) => rows.push({ type: "comment", comment }));
  return rows;
}

function svgLine(x1, y1, x2, y2, className) {
  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line.setAttribute("x1", x1);
  line.setAttribute("y1", y1);
  line.setAttribute("x2", x2);
  line.setAttribute("y2", y2);
  line.setAttribute("class", className);
  return line;
}

function ldRowY(rowIndex) {
  return LD_FIRST_ROW_Y + rowIndex * LD_ROW_HEIGHT;
}

function ldCellColumn(rawX) {
  if (rawX > 28) return LD_COLUMN_COUNT - 1;
  return Math.max(0, Math.min(LD_COLUMN_COUNT - 1, Math.floor((rawX - 1) / 3)));
}

function ldCellX(column) {
  const width = (LD_RIGHT_RAIL - LD_LEFT_RAIL) / LD_COLUMN_COUNT;
  return LD_LEFT_RAIL + (column + 0.5) * width;
}

function ldWireStartX(rawX) {
  if (rawX > 28) return LD_RIGHT_RAIL;
  const width = (LD_RIGHT_RAIL - LD_LEFT_RAIL) / LD_COLUMN_COUNT;
  return LD_LEFT_RAIL + Math.max(0, Math.min(LD_COLUMN_COUNT, Math.floor(rawX / 3))) * width;
}

function ldWireEndX(rawX) {
  if (rawX > 28) return LD_RIGHT_RAIL;
  const width = (LD_RIGHT_RAIL - LD_LEFT_RAIL) / LD_COLUMN_COUNT;
  return LD_LEFT_RAIL + Math.max(0, Math.min(LD_COLUMN_COUNT, Math.ceil(rawX / 3))) * width;
}

function ldBoundaryX(rawX) {
  const width = (LD_RIGHT_RAIL - LD_LEFT_RAIL) / LD_COLUMN_COUNT;
  return LD_LEFT_RAIL + Math.max(0, Math.min(LD_COLUMN_COUNT, rawX / 3)) * width;
}

function ldCellClass(cell) {
  if (cell.coil) return "coil";
  if (cell.kind === "Instruction" || cell.instructionTextEditing) return "instruction";
  return "contact";
}

function ldCellGlyph(cell) {
  if (cell.coil) {
    return {
      Output: "( )", Inverse: "(/)", Set: "(S)", Reset: "(R)",
      P_COIL: "(P)", N_COIL: "(N)",
    }[cell.coil] || "( )";
  }
  if (cell.kind === "Instruction" || cell.instructionTextEditing) return cell.value || "FN";
  return xgkContactGlyph(cell.contact);
}

function ldMarkerLabel(cell) {
  return cell.contact || cell.coil || cell.kind;
}

function ldCellAriaLabel(cell, rowIndex) {
  const kind = cell.contact || cell.coil || cell.kind;
  const value = cell.sourceText || cell.value || kind;
  return `Rung ${rowIndex + 1}, column ${ldCellColumn(cell.rawX) + 1}, ${kind}, ${value}`;
}

function ldBlankKey(rawY, column) {
  return `${rawY}:${column}`;
}

function structuralElement(cell) {
  return structuralElementFromCell(cell);
}

function renderStructuralCell(section, cell, position) {
  section.classList.add("structural-cell-editor");
  const expected = structuralElement(cell);
  const kind = document.createElement("select");
  kind.id = "ladder-element-kind";
  kind.className = "structural-element-kind";
  const label = element("label", "", "Element");
  label.htmlFor = kind.id;
  const choices = position.column === 9 ? COIL_ELEMENT_CHOICES : CONTACT_ELEMENT_CHOICES;
  for (const [value, text] of choices) {
    const option = document.createElement("option");
    option.value = value; option.textContent = text; kind.append(option);
  }
  if (expected) kind.value = expected.kind;
  section.append(label, kind);
  const operand = property(section, "Device address", expected?.operand || "M00000", false);
  const apply = button(cell ? "Apply element" : "Insert element", "primary-button", async () => {
    const hasOperand = elementKindHasOperand(kind.value);
    await applyEdit(() => edit_xgwx_ladder_cell(current.file.bytes, selectedProgramIndex, {
      rawY: position.rawY, column: position.column, expected,
      replacement: {
        kind: kind.value,
        operand: hasOperand ? operand.value.trim().toUpperCase() : "",
      },
    }), cell ? "Edit ladder element" : "Insert ladder element");
  });
  apply.textContent = cell ? "Apply element" : "Insert element";
  const validate = () => {
    const value = operand.value.trim().toUpperCase();
    const hasOperand = elementKindHasOperand(kind.value);
    operand.closest(".property-field").hidden = !hasOperand;
    apply.disabled = (hasOperand && !(value.length <= 32 && /^(?:[PMKFLTC][0-9]+|D[0-9]+\.[0-9A-F])$/.test(value)))
      || (expected?.kind === kind.value && expected?.operand === (hasOperand ? value : ""));
  };
  kind.addEventListener("change", validate); operand.addEventListener("input", validate);
  validate(); section.append(apply);
  if (cell) {
    const remove = button("Delete element", "primary-button", async () => {
    await applyEdit(() => edit_xgwx_ladder_cell(current.file.bytes, selectedProgramIndex, {
      rawY: position.rawY, column: position.column, expected, replacement: null,
    }), "Delete ladder element");
    });
    remove.textContent = "Delete element";
    section.append(remove);
  }
  section.append(element("p", "muted", "Deleting an element leaves a wiring gap. Check the program in XG5000 before use."));
}

async function insertLadderRow(rawY) {
  return applyEdit(() => insert_xgwx_ladder_row(current.file.bytes, selectedProgramIndex, rawY), "Insert ladder row");
}

function renderBranchControls(section, ladder, position) {
  const controls = element("section", "cell-editor structural-cell-editor");
  controls.append(element("h3", "", "Rows and branches"));
  const insert = button("Insert row before", "primary-button", async () => insertLadderRow(position.rawY));
  insert.textContent = "Insert row before (Ctrl+L)";
  controls.append(insert);
  const boundary = document.createElement("select");
  boundary.id = "branch-boundary";
  boundary.className = "structural-element-kind";
  const label = element("label", "", "Connection after column");
  label.htmlFor = boundary.id;
  for (let index = 1; index <= 9; index += 1) {
    const option = document.createElement("option");
    option.value = String(index); option.textContent = String(index); boundary.append(option);
  }
  boundary.value = String(Math.min(9, position.column + 1));
  const status = element("p", "muted");
  let edit;
  const toggle = button("Add connection below", "primary-button", async () => {
    await applyEdit(() => edit_xgwx_ladder_branch(current.file.bytes, selectedProgramIndex, edit),
      edit.present ? "Add branch connection" : "Remove branch connection");
  });
  const update = () => {
    const value = Number(boundary.value);
    const expected = (ladder.branchConnections || []).some(line => line.rawX === value * 3
      && line.rawYStart === position.rawY && line.rawYEnd === position.rawY + 4);
    edit = { rawY: position.rawY, boundary: value, expected, present: !expected };
    const text = expected ? "Remove connection below" : "Add connection below";
    toggle.textContent = text; toggle.setAttribute("aria-label", text); toggle.title = text;
    try {
      edit_xgwx_ladder_branch(current.file.bytes, selectedProgramIndex, edit);
      toggle.disabled = false;
      status.textContent = "Connects this row to the row directly below it.";
    } catch (error) {
      toggle.disabled = true; status.textContent = String(error); toggle.title = String(error);
    }
  };
  boundary.addEventListener("change", update); update();
  controls.append(label, boundary, toggle, status); section.append(controls);
}

function renderProgramInspector(inspector, program, ladder, cell, blankCell = null, selection = null,
  insertion = null, iecRowIndex = null, iecBlankCell = null) {
  inspector.replaceChildren(inspectorHeading("PROGRAM"));
  if (!program) {
    inspector.append(emptyState("Select a program to edit it."));
    return;
  }

  const form = element("div", "property-grid");
  const sfc = (current.summary.sfc || []).find(item => item.programIndex === selectedProgramIndex);
  const name = property(form, "Name", program.name, Boolean(sfc));
  const task = property(form, "Task", program.task, false);
  property(form, "Kind", program.kind, true);
  property(form, "Version", program.version, true);
  const comment = property(form, "Comment", program.comment, false, true);
  const applyMetadata = button("Apply program metadata", "primary-button", async () => {
    await applyEdit(
      () => update_xgwx_program(current.file.bytes, selectedProgramIndex, {
        name: name.value,
        task: task.value,
        comment: comment.value,
      }),
      `Edit program ${display(program.name, selectedProgramIndex + 1)} metadata`,
    );
  });
  applyMetadata.textContent = "Apply metadata";
  form.append(applyMetadata);
  inspector.append(form);

  if (sfc) {
    const selection = selectedSfcEntity?.programIndex === selectedProgramIndex ? selectedSfcEntity : null;
    inspector.append(renderSfcProperties(sfc, selection, async (block, entity, field, expectedValue, replacement) => {
      if (Array.isArray(block.editableRows)) {
        const rows = sfcRowsAfterEdit(block, entity, field, replacement);
        return applySfcSequence(block,rows,entity.row,entity.typeCode === 2 && Boolean(rows[entity.row].action));
      }
      await applyEdit(() => edit_xgwx_sfc_entity(current.file.bytes, {
        programIndex: selectedProgramIndex, blockIndex: block.blockIndex, entityIndex: entity.entityIndex,
        expectedType: entity.typeCode, expectedRow: entity.row, expectedColumn: entity.column,
        field, expectedValue, replacement,
      }), `Edit SFC ${field}`);
    }, applySfcSequence, showSfcTextInput));
    inspector.append(renderSfcVariables(sfc, patch => applyEdit(() => edit_xgwx_sfc_variable(current.file.bytes, {
      programIndex:selectedProgramIndex, expectedVariables:sfc.variables, name:patch.name, dataType:patch.dataType, description:patch.description, remove:patch.remove,
    }), patch.remove ? "Remove SFC declaration" : "Add SFC declaration")));
    return;
  }

  const cellSection = element("section", "cell-editor");
  if (ladder?.projectType === 2 && programLanguage(ladder) === "Ladder Diagram") {
    cellSection.append(element("h3", "", cell || insertion || iecBlankCell ? "Ladder cell" : "Ladder row"));
    if (cell?.isIecComment) renderIecCommentCell(cellSection, cell);
    else if (cell?.iecElementKind) renderIecLadderCell(cellSection, ladder, cell);
    else if (insertion) cellSection.append(element("p", "muted", "Double-click the insertion point or press Enter to insert."));
    else if (iecBlankCell) renderIecBlankCell(cellSection, ladder, iecBlankCell);
    else if (iecRowIndex !== null) renderIecRowInspector(cellSection, ladder, iecRowIndex);
    else cellSection.append(element("p", "muted", "Select a row, contact, coil, comment, or insertion point in the IEC diagram."));
    inspector.append(cellSection);
    renderIecActionsDialog(inspector, ladder);
    return;
  }
  cellSection.append(element("h3", "", "Ladder cell"));
  if (selection?.total > 1) {
    cellSection.append(element(
      "div",
      "ladder-selection-summary",
      `${selection.total} grid cells selected · ${selection.decodedCells.length} elements`,
    ));
  }
  if (ladder?.structuralEditing && blankCell) {
    cellSection.append(element("p", "muted", "Double-click the blank cell or press Enter to insert."));
  } else if (ladder?.structuralEditing && structuralElement(cell)) {
    renderStructuralCell(cellSection, cell, blankCell || {
      rawY: cell.rawY, column: ldCellColumn(cell.rawX),
    });
  } else if (blankCell) {
    cellSection.append(
      element("div", "blank-cell-position", `Rung ${blankCell.rowIndex + 1} · Column ${blankCell.column + 1}`),
      element("p", "muted", "Structural editing is unavailable for this program layout."),
    );
  } else if (!cell) {
    cellSection.append(element("p", "muted", ladder ? "Select a ladder cell to edit its source text." : "No decoded ladder cells."));
  } else if (cell.value === "END" || cell.sourceText === null || cell.sourceText === undefined) {
    cellSection.append(element("p", "muted", "This instruction remains read only."));
  } else {
    let instructionSelect;
    if (cell.instructionTextEditing) {
      const field = element("label", "property-field");
      field.append(element("span", "property-label", "Instruction"));
      instructionSelect = document.createElement("select");
      instructionSelect.setAttribute("aria-label", "Instruction");
      const choices = (cell.kind === "Comparison" ? ladder.comparisonChoices : ladder.instructionChoices) || [];
      if (!choices.some(choice => choice.mnemonic === cell.value)) {
        const option = element("option", "", cell.value);
        option.value = cell.value; instructionSelect.append(option);
      }
      for (const choice of choices) {
        const option = element("option", "", `${choice.mnemonic} (${choice.operandCount} operands)`);
        option.value = choice.mnemonic; instructionSelect.append(option);
      }
      instructionSelect.value = cell.value;
      field.append(instructionSelect); cellSection.append(field);
    }
    const source = property(cellSection, "Source text", cell.sourceText, false, true);
    const requiredUnits = utf16Length(cell.sourceText);
    const counter = element("div", "length-counter");
    const applyCell = button("Apply ladder cell", "primary-button", async () => {
      await applyEdit(
        () => update_xgwx_ladder_cell(current.file.bytes, selectedProgramIndex, cell.offset, cell.sourceText, source.value),
        `Edit ladder cell at ${cell.rawX}:${cell.rawY}`,
      );
    });
    applyCell.textContent = "Apply cell";
    const validate = () => {
      const units = utf16Length(source.value);
      if (cell.instructionTextEditing) {
        let error = "";
        try {
          update_xgwx_ladder_cell(current.file.bytes, selectedProgramIndex, cell.offset, cell.sourceText, source.value);
        } catch (failure) {
          error = String(failure);
        }
        counter.textContent = error || "Instruction and operands may change. Separate operands with commas; the block resizes when applied.";
        counter.classList.toggle("invalid", Boolean(error));
        applyCell.disabled = Boolean(error) || source.value === cell.sourceText;
      } else {
        const valid = units === requiredUnits && source.value !== cell.sourceText;
        counter.textContent = `${units} / ${requiredUnits} UTF-16 units`;
        counter.classList.toggle("invalid", units !== requiredUnits);
        applyCell.disabled = !valid;
      }
    };
    if (instructionSelect) {
      instructionSelect.addEventListener("change", () => {
        const choice = [...(ladder.instructionChoices || []), ...(ladder.comparisonChoices || [])].find(item => item.mnemonic === instructionSelect.value);
        if (!choice) return;
        const parts = nativeInstructionParts(source.value);
        if (!parts) return;
        const currentParts = parts.slice(1);
        const operands = Array.from({ length: choice.operandCount }, (_, index) => currentParts[index] || "0");
        if (currentParts.length && operands.length) operands[operands.length - 1] = currentParts[currentParts.length - 1];
        source.value = [choice.mnemonic, ...operands].join(",");
        validate();
      });
      source.addEventListener("input", () => { instructionSelect.value = source.value.split(",")[0].trim(); });
    }
    source.addEventListener("input", validate);
    validate();
    cellSection.append(counter, applyCell);
  }
  inspector.append(cellSection);
  const position = blankCell || (cell ? { rawY: cell.rawY, column: ldCellColumn(cell.rawX) } : null);
  if (ladder?.structuralEditing && position) renderBranchControls(inspector, ladder, position);
}

function renderIecLadderCell(section, body, item) {
  section.classList.add("structural-cell-editor");
  const contactKind = IEC_CONTACT_KIND_BY_SOURCE_LABEL.get(item.iecElementKind);
  const coilKind = IEC_COIL_KIND_BY_SOURCE_LABEL.get(item.iecElementKind);
  if (!contactKind && !coilKind) {
    section.append(element("p", "muted", "This IEC element remains read only."));
    return;
  }
  const isContact = Boolean(contactKind);
  const expectedKind = contactKind || coilKind;
  const kind = document.createElement("select");
  kind.setAttribute("aria-label", `${isContact ? "Contact" : "Coil"} kind at L${item.iecRowIndex}`);
  for (const [value, label] of isContact ? IEC_ADDRESSED_CONTACT_CHOICES : IEC_COIL_KIND_CHOICES) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    kind.append(option);
  }
  kind.value = expectedKind;
  const kindLabel = element("label", "property-field");
  kindLabel.append(element("span", "property-label", "Element"), kind);
  section.append(element("div", "blank-cell-position",
    `L${item.iecRowIndex} · x ${item.iecPosition?.[0] ?? "?"}`), kindLabel);
  const operand = property(section, "Variable", item.value, false);
  operand.setAttribute("aria-label", `${isContact ? "Contact" : "Coil"} variable at L${item.iecRowIndex}`);
  const status = element("div", "length-counter");
  const applyKind = button("Apply element kind", "primary-button", async () => {
    if (applyKind.disabled) return;
    await applyEdit(() => (isContact ? update_xgwx_iec_ld_contact_kind
      : update_xgwx_iec_ld_coil_kind)(current.file.bytes, selectedProgramIndex,
      item.offset, expectedKind, kind.value),
    `Change IEC ${isContact ? "contact" : "coil"} to ${kind.value}`);
  });
  applyKind.textContent = "Apply kind";
  const applyOperand = button("Apply element variable", "primary-button", async () => {
    if (applyOperand.disabled) return;
    await applyEdit(() => update_xgwx_iec_ld_element_operand(current.file.bytes,
      selectedProgramIndex, item.offset, item.value, operand.value.trim()),
    `Edit IEC ${isContact ? "contact" : "coil"} at L${item.iecRowIndex}`);
  });
  applyOperand.textContent = "Apply variable";
  const validate = () => {
    const value = operand.value.trim();
    let error = "";
    if (value !== item.value) {
      try {
        update_xgwx_iec_ld_element_operand(current.file.bytes, selectedProgramIndex,
          item.offset, item.value, value);
      } catch (failure) { error = String(failure); }
    }
    status.textContent = error || `${utf16Length(value)}/255 UTF-16 units`;
    status.classList.toggle("invalid", Boolean(error));
    applyOperand.disabled = Boolean(error) || value === item.value;
    applyKind.disabled = kind.value === expectedKind;
  };
  kind.addEventListener("change", validate);
  operand.addEventListener("input", validate);
  validate();
  section.append(status, applyKind, applyOperand);

  if (isContact) {
    const cellSite = iecAddressedContactSites(body, "iecNoContactCellDeletionSites")
      .find((site) => site.contactOffset === item.iecRecordOffset);
    const gapSite = iecAddressedContactSites(body, "iecNoContactDeletionSites")
      .find((site) => site.contactOffset === item.iecRecordOffset);
    if (cellSite) {
      const remove = button("Delete IEC contact and close cell", "secondary-button", async () => {
        await applyEdit(() => delete_xgwx_iec_ld_contact_cell(current.file.bytes,
          selectedProgramIndex, cellSite.contactOffset, cellSite.rawX,
          cellSite.kind, cellSite.variable), `Cell delete IEC contact ${cellSite.variable}`);
      });
      remove.textContent = "Delete and close cell";
      section.append(remove);
    }
    if (gapSite) {
      const remove = button("Delete IEC contact and leave gap", "secondary-button", async () => {
        await applyEdit(() => delete_xgwx_iec_ld_contact(current.file.bytes,
          selectedProgramIndex, gapSite.contactOffset, gapSite.rawX,
          gapSite.kind, gapSite.variable), `Delete IEC contact ${gapSite.variable}`);
      });
      remove.textContent = "Delete and leave gap";
      section.append(remove);
    }
  } else {
    let removable = false;
    try {
      delete_xgwx_iec_ld_terminal_coil(current.file.bytes,
        selectedProgramIndex, item.iecRecordOffset, item.value);
      removable = true;
    } catch { /* Only captured terminal coil layouts can be deleted. */ }
    if (removable) {
      const remove = button("Delete IEC terminal coil", "secondary-button", async () => {
        await applyEdit(() => delete_xgwx_iec_ld_terminal_coil(current.file.bytes,
          selectedProgramIndex, item.iecRecordOffset, item.value),
        `Delete IEC terminal coil ${item.value}`);
      });
      remove.textContent = "Delete coil";
      section.append(remove);
    }
  }
}

function renderIecCommentCell(section, item) {
  section.append(element("div", "blank-cell-position", `Comment at L${item.iecRowIndex}`));
  const comment = property(section, "Comment", item.value, false, true);
  comment.setAttribute("aria-label", `IEC comment at L${item.iecRowIndex}`);
  const apply = button("Apply IEC comment", "primary-button", async () => {
    if (apply.disabled) return;
    await applyEdit(() => update_xgwx_iec_ld_comment(current.file.bytes,
      selectedProgramIndex, item.offset, item.value, comment.value),
    `Edit IEC comment at L${item.iecRowIndex}`);
  });
  apply.textContent = "Apply comment";
  const validate = () => {
    apply.disabled = !comment.value.trim() || comment.value === item.value
      || utf16Length(comment.value) > 255 || /[\p{Cc}]/u.test(comment.value);
  };
  comment.addEventListener("input", validate);
  validate();
  section.append(apply);
}

function renderIecRowInspector(section, body, rowIndex) {
  section.append(element("div", "blank-cell-position", `L${rowIndex}`));
  const row = (body.iecRows || []).find((candidate) => candidate.rowIndex === rowIndex);
  if (!row) {
    section.append(element("p", "muted", "Double-click a blank cell or press Enter to insert. Ctrl+V pastes a copied network."));
    return;
  }

  const groupRows = (body.iecRows || []).filter((candidate) => candidate.groupIndex === row.groupIndex);
  section.append(element("p", "muted",
    `Network ${row.groupIndex + 1} · L${groupRows[0].rowIndex}–L${groupRows.at(-1).rowIndex}. Ctrl+C copies this network.`));
  if (body.iecCircuitGraph && new Set((body.iecRows || []).map((candidate) => candidate.groupIndex)).size > 1) {
    let canDelete = false;
    try {
      delete_xgwx_iec_ld_group(current.file.bytes, selectedProgramIndex,
        row.groupIndex, groupRows[0].rowIndex);
      canDelete = true;
    } catch { /* This network has a layout the writer cannot remove. */ }
    if (canDelete) {
      const remove = button("Delete selected IEC network", "secondary-button", async () => {
        await applyEdit(() => delete_xgwx_iec_ld_group(current.file.bytes,
          selectedProgramIndex, row.groupIndex, groupRows[0].rowIndex),
        `Delete IEC network ${row.groupIndex + 1} at L${groupRows[0].rowIndex}`);
      });
      remove.textContent = "Delete network";
      section.append(remove);
    }
  }

}

function renderIecActionsDialog(inspector, body) {
  const dialog = document.createElement("dialog");
  dialog.className = "iec-actions-dialog";
  const heading = element("h2", "", "IEC operations");
  const close = button("Close IEC operations", "secondary-button", () => dialog.close());
  close.textContent = "Close";
  dialog.append(heading, close);
  const open = button("Open IEC operations", "secondary-button", () => {
    if (!dialog.dataset.built) {
      const actions = [
        renderIecNetworkRelocation, renderIecNetworkReplacement,
        renderIecCrossProgramReplacement, renderIecHorizontalWireRepair,
        renderIecHorizontalWireDeletion, renderIecBranchEditing,
        renderIecBlankRowInsertion, renderIecCommentInsertion,
      ].map((render) => render(body)).filter(Boolean);
      dialog.append(...actions);
      dialog.dataset.built = "true";
    }
    dialog.showModal();
  });
  open.textContent = "More IEC operations…";
  inspector.append(open, dialog);
}

function renderIecBlankCell(section, body, position) {
  section.append(element("div", "blank-cell-position",
    `Empty IEC cell · L${position.rowIndex} · x ${position.rawX}`));
  if (!(body.iecRows || []).some((row) => row.rowIndex === position.rowIndex)) {
    renderIecRowInspector(section, body, position.rowIndex);
    return;
  }
  section.append(element("p", "muted", "Double-click the blank cell or press Enter to insert."));
}

function insertIecContactAtSite(site, rawX, kind, name) {
  if (site.type === "leading") return insert_xgwx_iec_ld_leading_contact(
    current.file.bytes, selectedProgramIndex, site.insertionOffset, kind, name);
  if (site.type === "short") return insert_xgwx_iec_ld_short_wire_contact(
    current.file.bytes, selectedProgramIndex, site.wireOffset, site.rawX, kind, name);
  return insert_xgwx_iec_ld_contact(current.file.bytes, selectedProgramIndex,
    site.wireOffset, rawX, site.startX, site.endX, kind, name);
}

function renderIecContactInsertion(section, site, initialX = null) {
  section.classList.add("structural-cell-editor");
  const position = document.createElement("select");
  position.setAttribute("aria-label", `Contact position at L${site.rowIndex}`);
  if (site.type === "short" || site.type === "leading") {
    const option = document.createElement("option");
    option.value = String(site.type === "leading" ? 1 : site.rawX);
    option.textContent = `x ${option.value}`;
    position.append(option);
  } else {
    for (let x = site.startX; x + 3 <= site.endX; x += 3) {
      const option = document.createElement("option");
      option.value = String(x);
      option.textContent = `x ${x}`;
      position.append(option);
    }
  }
  if (initialX !== null) position.value = String(initialX);
  const positionLabel = element("label", "property-field");
  positionLabel.append(element("span", "property-label", `L${site.rowIndex} position`), position);
  section.append(positionLabel);
  const kind = document.createElement("select");
  kind.setAttribute("aria-label", "IEC contact kind to insert");
  for (const [value, label] of IEC_ADDRESSED_CONTACT_CHOICES) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    kind.append(option);
  }
  const kindLabel = element("label", "property-field");
  kindLabel.append(element("span", "property-label", "Element"), kind);
  section.append(kindLabel);
  const variable = property(section, "BOOL variable", "", false);
  variable.setAttribute("aria-label", `IEC contact BOOL variable at L${site.rowIndex}`);
  variable.placeholder = "Existing BOOL variable";
  const status = element("div", "length-counter");
  const insert = button("Insert IEC contact", "primary-button", async () => {
    if (insert.disabled) return;
    const name = variable.value.trim();
    await applyEdit(() => insertIecContactAtSite(site, Number(position.value), kind.value, name),
    `Insert IEC contact ${name} at L${site.rowIndex} x${position.value}`);
  });
  insert.textContent = "Insert contact";
  const validate = () => {
    let error = "";
    try {
      insertIecContactAtSite(site, Number(position.value), kind.value, variable.value.trim());
    } catch (failure) { error = String(failure); }
    status.textContent = error || "Captured IEC contact insertion point";
    status.classList.toggle("invalid", Boolean(error));
    insert.disabled = Boolean(error);
  };
  position.addEventListener("change", validate);
  kind.addEventListener("change", validate);
  variable.addEventListener("input", validate);
  validate();
  section.append(status, insert);
}

async function applyEdit(update, label, beforeRender) {
  try {
    const editorPane = app.querySelector(".editor-canvas");
    const iecViewport = app.querySelector(".iec-layout-viewport, .ld-viewport, .sfc-viewport");
    const scroll = activeView === "programs" ? {
      editorTop: editorPane?.scrollTop ?? 0,
      layoutTop: iecViewport?.scrollTop ?? 0,
      layoutLeft: iecViewport?.scrollLeft ?? 0,
    } : null;
    const selectedModuleKey = selectedModule
      ? { base: selectedModule.base, slot: selectedModule.slot }
      : null;
    const bytes = update();
    const summary = parse_xgwx(bytes);
    current = { file: { ...current.file, byteLength: bytes.byteLength, bytes }, summary };
    if (selectedModuleKey) {
      selectedModule = (summary.hardware?.modules || []).find(
        (module) => module.base === selectedModuleKey.base && module.slot === selectedModuleKey.slot,
      ) || null;
    }
    beforeRender?.();
    dirty = true;
    vscode.postMessage({ type: "edit", label, bytes: Array.from(bytes) });
    renderWorkspace();
    if (scroll) {
      const refreshedEditor = app.querySelector(".editor-canvas");
      const refreshedLayout = app.querySelector(".iec-layout-viewport, .ld-viewport, .sfc-viewport");
      if (refreshedEditor) refreshedEditor.scrollTop = scroll.editorTop;
      if (refreshedLayout) {
        refreshedLayout.scrollTop = scroll.layoutTop;
        refreshedLayout.scrollLeft = scroll.layoutLeft;
      }
    }
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    vscode.postMessage({ type: "showError", message });
    return false;
  }
}

function renderNetworksEditor(canvas, inspector, summary) {
  const networks = summary.networks || [];
  canvas.append(editorHeader("Networks", `${networks.length} configured networks`));
  canvas.append(element("p", "muted", "Select a network or module to edit its properties in the sidebar."));
  const table = createTable(["Name", "Type", "Network type", "Modules"]);
  const moduleHost = element("div", "network-module-table");
  const renderModules = () => {
    const network = networks[selectedNetworkIndex];
    if (!network) { moduleHost.replaceChildren(); return; }
    const modules = network.modules || [];
    const moduleTable = createTable(["Module", "Base", "Slot", "Config name", "Alias", "Comment"]);
    moduleTable.setAttribute("aria-label", "Network modules");
    modules.forEach(module => {
      const row = moduleTable.tBodies[0].insertRow();
      row.tabIndex = 0;
      row.dataset.networkModule = networkModuleKey(module);
      appendCells(row, [module.name, module.base, module.slot, module.configName, module.alias, module.description]);
      row.classList.toggle("selected", selectedNetworkModuleKey === networkModuleKey(module));
      const select = () => {
        selectedNetworkModuleKey = networkModuleKey(module);
        table.querySelectorAll("tbody tr").forEach(item => item.classList.remove("selected"));
        moduleTable.querySelectorAll("tbody tr").forEach(item => item.classList.toggle("selected", item === row));
        renderNetworkInspector(inspector, networks, summary);
      };
      row.addEventListener("click", select);
      row.addEventListener("keydown", event => { if (event.key === "Enter") select(); });
    });
    moduleHost.replaceChildren(element("h3", "", "Network modules"), tableContainer(moduleTable, modules.length));
  };
  networks.forEach((network, index) => {
    const row = table.tBodies[0].insertRow();
    row.classList.toggle("selected", index === selectedNetworkIndex && !selectedNetworkModuleKey);
    row.tabIndex = 0;
    appendCells(row, [network.name || `Network ${index + 1}`, network.typeName, network.networkType, network.modules?.length]);
    const select = () => {
      selectedNetworkIndex = index;
      selectedNetworkModuleKey = null;
      table.querySelectorAll("tbody tr").forEach(item => item.classList.toggle("selected", item === row));
      renderModules();
      renderNetworkInspector(inspector, networks, summary);
    };
    row.addEventListener("click", select);
    row.addEventListener("keydown", event => { if (event.key === "Enter" || event.key === " ") select(); });
  });
  canvas.append(tableContainer(table, networks.length), moduleHost);
  renderModules();
  renderNetworkInspector(inspector, networks, summary);
}

function renderNetworkInspector(inspector, networks, summary) {
  const network = networks[selectedNetworkIndex] || null;
  const module = selectedNetworkModuleKey
    ? network?.modules?.find((item) => networkModuleKey(item) === selectedNetworkModuleKey)
    : null;
  if (selectedNetworkModuleKey && !module) selectedNetworkModuleKey = null;

  inspector.replaceChildren(inspectorHeading(module ? "NETWORK MODULE" : "NETWORK"));
  if (!network) {
    inspector.append(emptyState("No network is configured."));
    return;
  }

  const form = element("div", "property-grid");
  if (module) {
    property(form, "Module", module.name, true);
    property(form, "Base", module.base, true);
    property(form, "Slot", module.slot, true);
    property(form, "ID", module.id, true);
    const configName = property(form, "Config name", module.configName, false);
    const alias = property(form, "Alias", module.alias, false);
    const description = property(form, "Description", module.description, false, true);
    const apply = button("Apply network module properties", "primary-button", async () => {
      await applyEdit(
        () => update_xgwx_network_module(current.file.bytes, module.base, module.slot, {
          configName: configName.value,
          alias: alias.value,
          description: description.value,
        }),
        `Edit network module at Base ${module.base}, Slot ${module.slot}`,
      );
    });
    apply.textContent = "Apply module properties";
    const controls = [configName, alias, description];
    const validate = () => {
      const changed = configName.value !== (module.configName || "")
        || alias.value !== (module.alias || "")
        || description.value !== (module.description || "");
      apply.disabled = !changed;
    };
    controls.forEach((control) => control.addEventListener("input", validate));
    validate();
    form.append(apply);
    appendNetworkConfigurationFields(form, module, summary);
  } else {
    const name = property(form, "Name", network.name, false);
    property(form, "Type", network.typeName, true);
    property(form, "Network type", network.networkType, true);
    property(form, "Configured modules", network.modules?.length || 0, true);
    const apply = button("Apply network properties", "primary-button", async () => {
      await applyEdit(
        () => update_xgwx_network(current.file.bytes, selectedNetworkIndex, {
          name: name.value,
        }),
        `Edit network ${display(network.name, selectedNetworkIndex + 1)}`,
      );
    });
    apply.textContent = "Apply network properties";
    const controls = [name];
    const validate = () => {
      const changed = name.value !== (network.name || "");
      apply.disabled = !changed;
    };
    controls.forEach((control) => control.addEventListener("input", validate));
    validate();
    form.append(apply);
  }
  inspector.append(form);
}

function appendNetworkConfigurationFields(form, module, summary) {
  // XG5000 can renumber bases and slots, so configuration records are joined
  // using the stable NetworkModule Id / XGPD Type relationship.
  const fenet = findNetworkConfiguration(summary.fenet, module);
  const cnet = findNetworkConfiguration(summary.cnet, module);
  const hardwareModule = (summary.hardware?.modules || []).find((item) => (
    item.base === module.base && item.slot === module.slot
  ));
  const catalogEntry = supportsXgkHardware() && hardwareModule && moduleCatalog.find((entry) => (
    entry.id === module.id && entry.subType === hardwareModule.subType
  ));

  if (!fenet && !cnet && catalogEntry?.visibleOptions?.length) {
    form.append(element("div", "network-config-heading", "Network device settings"));
    catalogEntry.visibleOptions.forEach((option, index) => {
      property(form, moduleOptionLabel(option, index), formatModuleOptionDefault(option.defaultValue, index), true);
    });
    form.append(element("p", "module-selection-note", "Captured defaults: this module's live network record has not yet been decoded."));
  }
  const xgpd = findNetworkConfiguration(summary.xgpd, module);
  if (xgpd) {
    const protocol = xgpd.kind.replace("XGPD_CONFIG_INFO_", "");
    form.append(element("div", "network-config-heading", `${protocol} configuration`));
    (xgpd.attributes || []).forEach((attribute) => {
      property(form, formatNetworkAttributeLabel(attribute.name), attribute.value, true);
    });
  }
  if (fenet) {
    form.append(element("div", "network-config-heading", "FEnet configuration"));
    const exact = fenet.base === module.base && fenet.slot === module.slot;
    const source = current.file.bytes, uri = current.file.uri;
    const fields = [];
    const stationMaximum = (fenet.rapienetProtocol ?? 0) === 0 ? 63 : 220;
    const addNumber = (label, field, minimum, maximum, unit) => {
      const value = fenet[field];
      const editable = exact && value != null && (unit == null || unit === 0 || unit === 1);
      const suffix = unit == null ? "" : unit === 1 ? " (×10 ms)" : unit === 0 ? " (s)" : ` (unit ${unit})`;
      const control = property(form, `${label}${suffix}`, value, !editable);
      if (editable) {
        control.inputMode = "numeric";
        control.title = `${minimum}–${maximum}`;
        control.dataset.networkField = field;
        control.setAttribute("aria-label", label);
        fields.push({ control, field, value: String(value), readValue: () => control.value, minimum, maximum, label });
      }
    };
    addNumber("Station", "stationNo", 0, stationMaximum);
    const driverChoices = [[2, "XGT server"], [5, "Modbus server"], [7, "Smart server"]];
    const driverKnown = driverChoices.some(([value]) => value === fenet.driverType);
    if (exact && driverKnown) {
      const group = element("label", "property-field");
      group.append(element("span", "property-label", "Driver type"));
      const control = document.createElement("select");
      control.setAttribute("aria-label", "Driver type");
      control.dataset.networkField = "driverType";
      for (const [value, label] of driverChoices) {
        const option = element("option", "", label);
        option.value = String(value);
        control.append(option);
      }
      control.value = String(fenet.driverType);
      group.append(control);
      form.append(group);
      fields.push({ control, field: "driverType", value: String(fenet.driverType), readValue: () => control.value, allowedValues: [2, 5, 7], label: "Driver type" });
    } else property(form, "Driver type", fenet.driverType, true);
    addNumber("Receive wait", "rcvWaitTime", 2, 255, fenet.rcvWaitTimeUnit ?? 0);
    addNumber("Client wait", "clientWaitTime", 2, 255, fenet.clientWaitTimeUnit ?? 0);
    addNumber("Glofa sockets", "glofaSocketCount", 1, 16);
    for (const interfaceNumber of [1, 2]) {
      form.append(element("div", "network-config-heading", `Interface ${interfaceNumber}`));
      const suffix = interfaceNumber === 1 ? "" : "2";
      for (const [label, name] of [["IP address", "ipAddress"], ["Subnet mask", "subnet"],
        ["Gateway", "gateway"], ["DNS", "dns"], ["DHCP", "dhcp"]]) {
        const field = `${name}${suffix}`;
        const raw = fenet[field];
        const value = typeof raw === "object" && raw ? raw.address : raw;
        const editable = exact && value != null;
        const control = property(form, label, value, !editable);
        if (name === "dhcp") {
          control.type = "checkbox";
          control.checked = Number(value) === 1;
          control.disabled = !editable;
          control.readOnly = false;
          control.parentElement.classList.add("property-checkbox");
        }
        if (editable) {
          control.dataset.networkField = field;
          control.setAttribute("aria-label", `Interface ${interfaceNumber} ${label}`);
          const readValue = () => name === "dhcp" ? (control.checked ? "1" : "0") : control.value;
          fields.push({ control, field, value: String(value), readValue });
        }
      }
    }
    if (fields.length) {
      const error = element("p", "module-selection-error", "");
      error.setAttribute("role", "alert");
      const build = () => {
        if (current.file.uri !== uri || current.file.bytes !== source) throw new Error("Networks changed. Reload the settings.");
        let bytes = source;
        for (const { field, value, readValue } of fields) {
          const replacement = readValue();
          if (replacement !== value) bytes = edit_xgwx_fenet_field(bytes, {
            base: module.base, slot: module.slot, field, expectedValue: value, replacement,
          });
        }
        return bytes;
      };
      const apply = button("Apply FEnet settings", "primary-button", () => applyEdit(build,
        `Edit FEnet settings at Base ${module.base}, Slot ${module.slot}`));
      apply.textContent = "Apply FEnet settings";
      const validate = () => {
        try {
          for (const { field, readValue, minimum, maximum, allowedValues, label } of fields) {
            const text = readValue();
            if (allowedValues) {
              if (!allowedValues.includes(Number(text))) throw new Error("Choose a supported driver type.");
            } else if (minimum != null) {
              if (!/^\d+$/.test(text) || Number(text) < minimum || Number(text) > maximum) {
                throw new Error(`${label} must be an integer from ${minimum} to ${maximum}.`);
              }
            } else if (field.startsWith("dhcp")) {
              if (!/^[01]$/.test(text)) throw new Error("DHCP must be 0 (disabled) or 1 (enabled).");
            } else {
              const octets = text.split(".").map(Number);
              if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(text) || octets.some(value => value > 255)) {
                throw new Error("Enter four decimal IPv4 octets from 0 to 255.");
              }
              if (field.startsWith("subnet")) {
                const mask = octets.reduce((value, octet) => ((value << 8) | octet) >>> 0, 0);
                const inverse = (~mask) >>> 0;
                if ((inverse & ((inverse + 1) >>> 0)) !== 0) throw new Error("Subnet mask must contain contiguous leading ones.");
              }
            }
          }
          error.textContent = "";
          apply.disabled = !fields.some(({ value, readValue }) => readValue() !== value);
        } catch (failure) {
          error.textContent = String(failure);
          apply.disabled = true;
        }
      };
      fields.forEach(({ control }) => control.addEventListener("input", validate));
      validate();
      form.append(error, apply);
    }
  }

  if (cnet) appendCnetConfigurationFields(form, module, cnet);
}

function appendCnetConfigurationFields(form, module, cnet) {
  form.append(element("div", "network-config-heading", "Cnet configuration"));
  const exact = cnet.base === module.base && cnet.slot === module.slot
    && [32768, 32769, 32770].includes(cnet.subType) && cnet.ports?.length === 2
    && cnet.ports.every(port => [0, 2, 3, 4, 7].includes(port.driverType)
      && Number.isInteger(port.bps) && port.bps >= 0 && port.bps < 15);
  const source = current.file.bytes, uri = current.file.uri;
  const fields = [];
  const baudRates = [300, 600, 1200, 1800, 2400, 3600, 4800, 7200, 9600, 19200, 38400, 57600, 64000, 76800, 115200];
  const drivers = [[0, "Use P2P"], [2, "XGT server"], [3, "Modbus ASCII server"], [4, "Modbus RTU server"], [7, "Smart server"]];
  const repeater = property(form, "Repeater mode", "", !exact);
  repeater.type = "checkbox";
  repeater.parentElement.classList.add("property-checkbox");
  repeater.setAttribute("aria-label", "Repeater mode");
  repeater.checked = cnet.ports?.every(port => port.repeater === 1);
  const repeaterKnown = cnet.ports?.every(port => [0, 1].includes(port.repeater))
    && cnet.ports?.every(port => port.repeater === cnet.ports[0].repeater);
  repeater.disabled = !exact || !repeaterKnown || cnet.subType === 32769;
  if (cnet.subType === 32769) repeater.parentElement.remove();
  repeater.readOnly = false;
  repeater.title = "Repeater mode synchronizes both baud rates and suspends protocol services.";
  if (!repeater.disabled) cnet.ports.forEach((port, portIndex) => fields.push({
    control: repeater, portIndex, field: "repeater", value: String(port.repeater),
    readValue: () => repeater.checked ? "1" : "0", label: "Repeater mode", maximum: 1,
  }));
  (cnet.ports || []).forEach((port, portIndex) => {
    form.append(element("div", "network-config-heading", `Port ${portIndex + 1}`));
    const add = (label, field, value, options = {}) => {
      const editable = exact && value != null
        && (!options.choices || options.choices.some(([raw]) => raw === value));
      let control;
      if (editable && options.choices) {
        const group = element("label", "property-field");
        group.append(element("span", "property-label", label));
        control = document.createElement("select");
        for (const [raw, text] of options.choices) {
          const choice = element("option", "", text);choice.value = String(raw);control.append(choice);
        }
        control.value = String(value);group.append(control);form.append(group);
      } else {
        const displayed = options.choices?.find(([raw]) => raw === value)?.[1] ?? value;
        control = property(form, label, displayed, !editable);
        if (options.boolean) {
          control.type = "checkbox";control.checked = value === 1;control.disabled = !editable;
          control.readOnly = false;control.parentElement.classList.add("property-checkbox");
        } else control.inputMode = "numeric";
      }
      control.setAttribute("aria-label", `Port ${portIndex + 1} ${label}`);
      if (editable) {
        control.dataset.cnetField = field;control.dataset.cnetPort = String(portIndex);
        fields.push({control,portIndex,field,value:String(value),label,readValue:()=>options.boolean ? control.checked ? "1" : "0" : control.value,...options});
      }
    };
    const rs232 = cnet.subType === 32769 || cnet.subType === 32770 && portIndex === 0;
    add("Mode", "modeRaw", port.modeRaw, {choices:!exact ? [[0,"RS232C"],[1,"RS422"],[2,"RS485"]] : rs232 ? [[0,"RS232C"]] : [[1,"RS422"],[2,"RS485"]]});
    add("Baud rate", "bps", port.bps, {choices:baudRates.map((rate,index)=>[index,String(rate)])});
    add("Operation mode", "driverType", port.driverType, {choices:drivers});
    add("Station", "stationNo", port.stationNo, {maximum:255});
    add("Data bits", "dataBitRaw", port.dataBitRaw, {choices:[[0,"7 bits"],[1,"8 bits"]]});
    add("Stop bits", "stopBitRaw", port.stopBitRaw, {choices:[[0,"1"],[1,"2"]]});
    add("Parity", "parityRaw", port.parityRaw, {choices:[[0,"None"],[1,"Even"],[2,"Odd"]]});
    add("Response wait (×100 ms)", "rxTimeout", port.rxTimeout, {maximum:50});
    add("Delay (×10 ms)", "requestDelayTime", port.requestDelayTime, {maximum:255});
    add("Inter-character wait (×10 ms)", "charTimeout", port.charTimeout, {maximum:255});
    add("Accept parity errors", "parityErrorIgnore", port.parityErrorIgnore, {boolean:true,maximum:1});
    add("Termination resistor", "terminatingResister", port.terminatingResister, {boolean:true,maximum:1});
  });
  if (!exact) {
    form.append(element("p", "module-selection-note", "These Cnet settings have not yet been validated for editing."));
    return;
  }
  const error = element("p", "module-selection-error", "");error.setAttribute("role", "alert");
  const fieldAt = (port, field) => fields.find(item=>item.portIndex === port && item.field === field);
  const read = (port, field) => Number(fieldAt(port,field)?.readValue());
  const build = () => {
    if (current.file.uri !== uri || current.file.bytes !== source) throw new Error("Networks changed. Reload the settings.");
    return edit_xgwx_cnet_settings(source, {base:module.base,slot:module.slot,
      changes:fields.filter(item=>item.readValue() !== item.value).map(item=>({
        portIndex:item.portIndex,field:item.field,expectedValue:item.value,replacement:item.readValue(),
      })),
    });
  };
  const apply = button("Apply Cnet settings", "primary-button", ()=>applyEdit(build,`Edit Cnet settings at Base ${module.base}, Slot ${module.slot}`));
  apply.textContent = "Apply Cnet settings";
  const validate = () => {
    try {
      for (const item of fields) {
        const {field,portIndex,choices,maximum,label,control}=item;
        const driver = read(portIndex,"driverType"), mode = read(portIndex,"modeRaw");
        control.disabled = field === "repeater" ? !repeaterKnown
          : field === "modeRaw" && choices.length === 1
          || field === "driverType" && repeater.checked
          || field === "bps" && repeater.checked && portIndex === 0
          || field === "dataBitRaw" && [3,4].includes(driver)
          || field === "rxTimeout" && driver !== 0
          || field === "requestDelayTime" && mode === 0
          || field === "terminatingResister" && mode === 0;
        const text = item.readValue();
        if (!/^\d+$/.test(text)) throw new Error(`Port ${portIndex + 1} ${label} requires an unsigned integer.`);
        const value = Number(text), limit = field === "stationNo" && ![3,4].includes(driver) ? 31 : maximum;
        if (choices && !choices.some(([raw])=>raw === value)) throw new Error(`Choose a supported ${label}.`);
        if (limit != null && value > limit) throw new Error(`Port ${portIndex + 1} ${label} must be from 0 to ${limit}.`);
        if (field === "dataBitRaw" && (driver === 3 && value !== 0 || driver === 4 && value !== 1)) throw new Error("Modbus ASCII requires 7 data bits; Modbus RTU requires 8.");
      }
      error.textContent = "";apply.disabled = !fields.some(item=>item.readValue() !== item.value);
    } catch (failure) {error.textContent = String(failure);apply.disabled = true;}
  };
  const normalize = item => {
    if (item.field === "driverType") {
      const driver = read(item.portIndex,"driverType"), bits = fieldAt(item.portIndex,"dataBitRaw");
      if (bits && [3,4].includes(driver)) bits.control.value = driver === 3 ? "0" : "1";
    }
    if (repeater.checked) fieldAt(0,"bps").control.value = fieldAt(1,"bps").control.value;
    validate();
  };
  const listened = new Set();
  fields.forEach(item=>{
    if (listened.has(item.control)) return;
    listened.add(item.control);item.control.addEventListener("input",()=>normalize(item));
  });
  validate();form.append(error,apply);
}


function findNetworkConfiguration(configurations, module) {
  const candidates = configurations || [];
  return candidates.find((config) => (
    config.typeCode === module.id && config.base === module.base && config.slot === module.slot
  )) || candidates.find((config) => config.typeCode === module.id) || null;
}

function formatNetworkAttributeLabel(name) {
  return name
    .replaceAll(/([a-z])([A-Z])/g, "$1 $2")
    .replaceAll(/_/g, " ");
}

function renderVariablesEditor(canvas, inspector, globalVariables, localTables, programs) {
  const variables = [
    ...globalVariables.map((variable, globalVariableIndex) => ({ ...variable, globalVariableIndex, location: "Global" })),
    ...localTables.flatMap((symbols, localProgramIndex) => symbols.map((symbol, localVariableIndex) => ({
      ...symbol,
      localProgramIndex,
      localVariableIndex,
      location: programs[localProgramIndex]?.name || `Program ${localProgramIndex + 1}`,
      dataType: symbol.dataType || symbol.typeReference || "—",
    }))),
  ];
  const toolbar = element("div", "editor-toolbar");
  const searchWrap = element("label", "filter-control");
  searchWrap.append(icon("search"));
  const search = document.createElement("input");
  search.type = "search";
  search.placeholder = "Filter variables…";
  searchWrap.append(search);
  const scope = element("span", "toolbar-summary");
  toolbar.append(searchWrap, scope);
  const host = element("div", "editor-table-host");
  const renderRows = () => {
    const query = search.value.trim().toLocaleLowerCase();
    const matches = variables
      .map((variable, index) => ({ variable, index }))
      .filter(({ variable }) => Object.values(variable).join(" ").toLocaleLowerCase().includes(query));
    const shown = matches.slice(0, 750);
    scope.textContent = shown.length === matches.length ? `${matches.length} variables` : `${shown.length} of ${matches.length} matches`;
    const table = createTable(["Program", "Name", "Address", "Type", "Comment"]);
    shown.forEach(({ variable, index }) => {
      const row = table.tBodies[0].insertRow();
      row.className = selectedVariableIndex === index ? "selected" : "";
      row.tabIndex = 0;
      appendCells(row, [variable.location, variable.name, variable.address, variable.dataType, variable.description]);
      row.dataset.variableIndex = String(index);
      for (const [column, field] of [[1, "name"], [2, "address"], [4, "description"]]) {
        const cell = row.cells[column];
        cell.dataset.variableField = field;
        cell.title = `Double-click to edit ${field === "description" ? "comment" : field}`;
        cell.addEventListener("dblclick", () => editVariableField(variable, field, index));
      }
      const select = () => {
        selectedVariableIndex = index;
        table.querySelectorAll("tbody tr").forEach((item) => item.classList.toggle("selected", item === row));
        renderVariableInspector(inspector, variable, index);
      };
      row.addEventListener("click", select);
      row.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") select();
      });
    });
    host.replaceChildren(tableContainer(table, shown.length));
  };
  search.addEventListener("input", renderRows);
  const iecPrograms = programs.map((item, index) => ({ item, index }))
    .filter(({ index }) => (current.summary.ladder || []).some((body) => body.programIndex === index && body.projectType === 2));
  const add = element("section", "iec-add-local-symbol");
  add.append(element("h3", "", "Add IEC local variable"));
  const fields = element("div", "iec-add-local-symbol-fields");
  const program = document.createElement("select");
  program.setAttribute("aria-label", "IEC local program");
  iecPrograms.forEach(({ item, index }) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = item.name || `Program ${index + 1}`;
    program.append(option);
  });
  program.value = String(iecPrograms.some(({ index }) => index === selectedProgramIndex)
    ? selectedProgramIndex : iecPrograms[0]?.index ?? "");
  const name = document.createElement("input");
  name.setAttribute("aria-label", "New IEC local variable name");
  name.placeholder = "Name";
  const type = document.createElement("select");
  type.setAttribute("aria-label", "New IEC local variable type");
  for (const value of IEC_PRIMITIVE_TYPE_NAMES) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    type.append(option);
  }
  const description = document.createElement("input");
  description.setAttribute("aria-label", "New IEC local variable description");
  description.placeholder = "Description (optional)";
  const addButton = button("Add local variable", "primary-button", async () => {
    const programIndex = Number(program.value);
    const newName = name.value;
    const edited = await applyEdit(() => insert_xgwx_iec_local_symbol(
      current.file.bytes, Number(program.value), name.value, type.value, description.value,
    ), `Add IEC local variable ${newName}`);
    if (edited) {
      const tables = current.summary.localVariables || [];
      const before = tables.slice(0, programIndex).reduce((sum, symbols) => sum + symbols.length, 0);
      const index = tables[programIndex]?.findIndex((symbol) => symbol.name === newName) ?? -1;
      if (index >= 0) {
        selectedVariableIndex = (current.summary.variables || []).length + before + index;
        renderWorkspace();
      }
    }
  });
  addButton.textContent = "Add variable";
  const validation = element("div", "validation-summary");
  const validate = () => {
    const siblings = localTables[Number(program.value)] || [];
    const validName = /^[\p{L}_][\p{L}\p{N}_]*$/u.test(name.value) && utf16Length(name.value) <= 255;
    const unique = !siblings.some((symbol) => symbol.name.toLocaleLowerCase() === name.value.toLocaleLowerCase());
    const validDescription = utf16Length(description.value) <= 255 && !/\p{Cc}/u.test(description.value);
    const valid = validName && unique && validDescription && program.value !== "";
    validation.textContent = !name.value && validDescription
      ? "Enter a unique name. New variables start without an address or allocation."
      : valid ? "New variables start without an address or allocation."
        : "Enter a unique name and keep name and description within 255 UTF-16 units.";
    validation.classList.toggle("invalid", !valid && (name.value.length > 0 || !validDescription));
    addButton.disabled = !valid;
  };
  for (const control of [program, name, description]) control.addEventListener("input", validate);
  validate();
  fields.append(program, name, type, description, addButton);
  add.append(fields, validation);
  canvas.append(toolbar, ...(iecPrograms.length ? [add] : []), host);
  renderRows();
  if (selectedVariableIndex >= variables.length) selectedVariableIndex = 0;
  renderVariableInspector(inspector, variables[selectedVariableIndex] || null, selectedVariableIndex);
}

let variablePromptOpen = false;

async function editVariableField(variable, field, index) {
  if (variablePromptOpen) return;
  variablePromptOpen = true;
  const source = current.file.bytes, fileUri = current.file.uri, summary = current.summary;
  const label = field === "description" ? "comment" : field;
  const ensureCurrent = () => {
    if (current?.file.uri !== fileUri || current.file.bytes !== source) throw new Error("Variables changed. Reopen the field editor.");
  };
  const request = (type, details, validate) => new Promise(resolve => {
    const requestId = ++nextContactPromptId;
    pendingContactPrompts.set(requestId, { resolve, validate, restoreFocus: false });
    vscode.postMessage({ type, requestId, ...details });
  });
  try {
    const validate = value => {
      ensureCurrent();
      if (field === "name") {
        const siblings = variable.localProgramIndex == null ? summary.variables : summary.localVariables[variable.localProgramIndex];
        const ownIndex = variable.localVariableIndex ?? variable.globalVariableIndex;
        if (siblings.some((v, i) => i !== ownIndex && v.name?.toLocaleLowerCase() === value.toLocaleLowerCase())) throw new Error("Variable name is already in use.");
      }
      return buildVariableEdit(source, variable, field, value, summary, true);
    };
    const value = await request("promptVariableField", {
      title: `Edit variable ${label} · ${variable.name}`,
      value: variable[field] || "",
      prompt: field === "address" ? "Enter a device address. An occupied address offers a swap."
        : `Enter the variable ${label} (up to 255 UTF-16 units).`,
    }, validate);
    if (value == null) return;
    ensureCurrent();
    const conflict = field === "address" && value.trim().toUpperCase() !== (variable.address || "").toUpperCase()
      && variableAddressConflict(variable, value, summary);
    if (conflict) {
      const swap = await request("confirmVariableSwap", {
        message: `${value.trim().toUpperCase()} is occupied by ${conflict.name}. Swap addresses with ${variable.name}?`,
      });
      if (!swap) return;
    }
    await applyEdit(() => validate(value), `${conflict ? "Swap addresses" : `Edit variable ${label}`} · ${variable.name}`);
  } catch (error) {
    vscode.postMessage({ type: "showError", message: String(error) });
  } finally {
    variablePromptOpen = false;
    requestAnimationFrame(() => {
      if (current?.file.uri === fileUri) document.querySelector(`[data-variable-index="${index}"]`)?.focus({ preventScroll: true });
    });
  }
}

function renderVariableInspector(inspector, variable, index) {
  inspector.replaceChildren(inspectorHeading("VARIABLE"));
  if (!variable) {
    inspector.append(emptyState("Select a variable to edit it."));
    return;
  }

  if (variable.localProgramIndex != null) {
    const form = element("div", "property-grid variable-editor");
    property(form, "Program", variable.location, true);
    const name = property(form, "Name", variable.name, false);
    const siblings = current.summary.localVariables?.[variable.localProgramIndex] || [];
    const nameValidation = element("div", "validation-summary");
    const rename = button("Rename local symbol", "primary-button", async () => {
      await applyEdit(() => rename_xgwx_iec_local_symbol(
        current.file.bytes, variable.localProgramIndex, variable.localVariableIndex,
        variable.name, name.value,
      ), `Rename IEC local symbol ${variable.name}`);
    });
    rename.textContent = "Rename variable";
    const validateName = () => {
      const valid = name.value !== variable.name && name.value.length > 0
        && name.value.length <= 255 && /^[\p{L}_][\p{L}\p{N}_]*$/u.test(name.value)
        && !siblings.some((symbol, index) => index !== variable.localVariableIndex && symbol.name.toLocaleLowerCase() === name.value.toLocaleLowerCase());
      nameValidation.textContent = name.value === variable.name ? "Current symbol name." : valid
        ? "Program references will be updated with the symbol."
        : "Use a unique identifier of at most 255 characters.";
      nameValidation.classList.toggle("invalid", !valid && name.value !== variable.name);
      rename.disabled = !valid;
    };
    name.addEventListener("input", validateName);
    validateName();
    form.append(nameValidation, rename);
    const numericMapping = ({
      BYTE: ["%MB", 8], SINT: ["%MB", 8], USINT: ["%MB", 8],
      WORD: ["%MW", 16], INT: ["%MW", 16], UINT: ["%MW", 16], DATE: ["%MW", 16],
      DWORD: ["%MD", 32], DINT: ["%MD", 32], UDINT: ["%MD", 32], REAL: ["%MD", 32],
      TIME: ["%MD", 32], TIME_OF_DAY: ["%MD", 32],
      LWORD: ["%ML", 64], LINT: ["%ML", 64], ULINT: ["%ML", 64], LREAL: ["%ML", 64], DATE_AND_TIME: ["%ML", 64],
    })[variable.dataType];
    const mappingWidth = numericMapping?.[1] || 1;
    const encodedBit = (value) => {
      if (numericMapping) {
        const match = /^%M([BWDL])([0-9]+)$/.exec(value);
        if (!match || `%M${match[1]}` !== numericMapping[0]) return null;
        const bit = Number(match[2]) * mappingWidth;
        return Number.isInteger(bit) && bit <= 0xffffffff ? bit : null;
      }
      const simple = /^%[MQ]X([0-9]+)$/.exec(value);
      if (simple) {
        const bit = Number(simple[1]);
        return Number.isInteger(bit) && bit <= 0xffffffff ? bit : null;
      }
      const dotted = /^%[IQ]X0\.([0-9]+)\.([0-9]+)$/.exec(value);
      if (!dotted) return null;
      const slot = Number(dotted[1]);
      const bit = Number(dotted[2]);
      const encoded = slot * 64 + bit;
      return Number.isInteger(slot) && Number.isInteger(bit) && bit < 64 && encoded <= 0xffffffff ? encoded : null;
    };
    const mapped = (variable.dataType === "BOOL" || numericMapping) && encodedBit(variable.address || "") !== null;
    const automaticMapping = !variable.isInstance && !variable.address && variable.storageClass === "A"
      && ["BOOL", "INT", "UDINT", "TIME"].includes(variable.dataType)
      && Number.isInteger(variable.allocationNumber) && variable.allocationNumber >= 0
      && variable.allocationNumber < 0xffffffff && variable.allocationWidth === mappingWidth;
    const assignable = (variable.dataType === "BOOL" || numericMapping) && !variable.isInstance
      && (automaticMapping || (!variable.address && variable.storageClass === ""
        && variable.allocationNumber == null && variable.allocationWidth == null));
    const address = property(form, "Address", variable.address, !(mapped || assignable));
    address.setAttribute("aria-label", "IEC local address");
    if (variable.typeReference) property(form, "Type reference", variable.typeReference, true);
    if (variable.dataType && !variable.isInstance && !variable.address) {
      const typeField = element("label", "property-field");
      typeField.append(element("span", "property-label", "Data type"));
      const type = document.createElement("select");
      type.setAttribute("aria-label", "IEC local data type");
      for (const label of IEC_PRIMITIVE_TYPE_NAMES) {
        const option = document.createElement("option");
        option.value = label;
        option.textContent = label;
        type.append(option);
      }
      type.value = variable.dataType;
      typeField.append(type);
      form.append(typeField);
      const typeApply = button("Apply local type", "primary-button", async () => {
        await applyEdit(() => update_xgwx_iec_local_symbol_type(
          current.file.bytes, variable.localProgramIndex, variable.localVariableIndex,
          variable.name, variable.dataType, type.value,
        ), `Edit IEC local type ${variable.name}`);
      });
      const typeValidation = element("div", "validation-summary", "Changing type clears this variable's allocation. Program references may need compatible edits.");
      typeApply.textContent = "Apply type";
      typeApply.disabled = true;
      type.addEventListener("change", () => { typeApply.disabled = type.value === variable.dataType; });
      form.append(typeValidation, typeApply);
    } else if (variable.dataType) {
      property(form, "Data type", variable.dataType, true);
    }
    property(form, "Storage class", variable.storageClass, true);
    property(form, "Allocation number", variable.allocationNumber, true);
    property(form, "Allocation width", variable.allocationWidth, true);
    const description = property(form, "Description", variable.description, false, true);
    description.setAttribute("aria-label", "IEC local description");
    const descriptionValidation = element("div", "validation-summary");
    const descriptionApply = button("Apply local description", "primary-button", async () => {
      await applyEdit(() => update_xgwx_iec_local_symbol_description(
        current.file.bytes, variable.localProgramIndex, variable.localVariableIndex,
        variable.name, variable.description || "", description.value,
      ), `Edit IEC local description ${variable.name}`);
    });
    descriptionApply.textContent = "Apply comment";
    const validateDescription = () => {
      const changed = description.value !== (variable.description || "");
      const valid = utf16Length(description.value) <= 255 && !/\p{Cc}/u.test(description.value);
      descriptionValidation.textContent = valid
        ? "Description may contain up to 255 UTF-16 units."
        : "Use at most 255 UTF-16 units and no control characters.";
      descriptionValidation.classList.toggle("invalid", !valid);
      descriptionApply.disabled = !changed || !valid;
    };
    description.addEventListener("input", validateDescription);
    validateDescription();
    form.append(descriptionValidation, descriptionApply);
    if (mapped || assignable) {
      const validation = element("div", "validation-summary");
      const apply = button("Apply local address", "primary-button", async () => {
        await applyEdit(() => update_xgwx_iec_local_symbol_address(
          current.file.bytes, variable.localProgramIndex, variable.localVariableIndex,
          variable.name, variable.address || "", address.value,
        ), `Edit IEC local address ${variable.name}`);
      });
      apply.textContent = "Apply address";
      const validate = () => {
        const bit = encodedBit(address.value);
        const area = mapped ? variable.address.slice(0, 3) : address.value.slice(0, 3);
        const valid = address.value !== (variable.address || "")
          && utf16Length(address.value) <= 255
          && (numericMapping ? area === numericMapping[0] : (automaticMapping ? area === "%MX" : ["%MX", "%IX", "%QX"].includes(area)))
          && address.value.startsWith(area)
          && bit !== null && bit !== encodedBit(variable.address)
          && !siblings.some((symbol, index) => index !== variable.localVariableIndex
            && symbol.address && symbol.storageClass === area[1]
            && (symbol.allocationNumber == null || symbol.allocationWidth == null
              || (bit < symbol.allocationNumber + symbol.allocationWidth
                && symbol.allocationNumber < bit + mappingWidth)));
        const unchanged = address.value === (variable.address || "");
        validation.textContent = unchanged ? (mapped ? "Current mapped address." : `Enter a ${numericMapping ? numericMapping[0] : "BOOL bit"} address to map this variable.`) : valid
          ? "Address area and allocation range are valid."
          : mapped ? "Use a different address in the same area without overlapping mapped variables."
            : numericMapping ? `Use an unused ${numericMapping[0]} address.` : automaticMapping ? "Use an unused %MX bit address." : "Use an unused %MX, %IX, or %QX bit address.";
        validation.classList.toggle("invalid", !valid && !unchanged);
        apply.disabled = !valid;
      };
      address.addEventListener("input", validate);
      validate();
      form.append(validation, apply);
      if (mapped) {
        const clear = button("Clear mapped address", "", async () => {
          await applyEdit(() => update_xgwx_iec_local_symbol_address(
            current.file.bytes, variable.localProgramIndex, variable.localVariableIndex,
            variable.name, variable.address, "",
          ), `Clear IEC local address ${variable.name}`);
        });
        clear.textContent = "Clear address";
        form.append(clear);
      }
    }
    const referenced = (current.summary.ladder || [])
      .find((body) => body.programIndex === variable.localProgramIndex)
      ?.sourceStrings?.some((item) => item.value === variable.name) || false;
    const deleteValidation = element("div", "validation-summary", referenced
      ? "This variable is referenced by its program and cannot be deleted."
      : "Delete this unreferenced local variable. Undo is available in VS Code.");
    const deleteButton = button("Delete local variable", "", async () => {
      await applyEdit(() => delete_xgwx_iec_local_symbol(
        current.file.bytes, variable.localProgramIndex, variable.localVariableIndex,
        variable.name,
      ), `Delete IEC local variable ${variable.name}`);
    });
    deleteButton.textContent = "Delete variable";
    deleteButton.disabled = referenced;
    form.append(deleteValidation, deleteButton);
    form.append(element("p", "muted", "Clear a mapped address before changing its type. Function instance types cannot be changed here yet."));
    inspector.append(form);
    return;
  }

  const form = element("div", "property-grid variable-editor");
  const name = property(form, "Name", variable.name, false);
  property(form, "Formatted address", variable.address, true);
  const addressArea = property(form, "Address area", variable.addressArea, false);
  const addressNumber = property(form, "Address number", variable.addressNumber, false);
  addressNumber.type = "number";
  addressNumber.min = "0";
  addressNumber.max = "4294967295";
  addressNumber.step = "1";
  const dataType = property(form, "Data type", variable.dataType, false);
  const description = property(form, "Description", variable.description, false, true);
  property(form, "Source", variable.sourceRef, true);
  property(form, "Range", variable.range, true);

  const validation = element("div", "validation-summary");
  const apply = button("Apply variable changes", "primary-button", async () => {
    await applyEdit(
      () => update_xgwx_variable(current.file.bytes, variable.globalVariableIndex, {
        name: name.value,
        addressArea: addressArea.value,
        addressNumber: Number(addressNumber.value),
        dataType: dataType.value,
        description: description.value,
      }),
      `Edit variable ${display(variable.name, index + 1)}`,
    );
  });
  apply.textContent = "Apply variable";

  const controls = [name, addressArea, addressNumber, dataType, description];
  const validate = () => {
    const lengthFields = [
      ["Area", addressArea.value, variable.addressArea],
      ["Type", dataType.value, variable.dataType],
    ];
    const invalidText = [name.value, description.value].some(value => utf16Length(value) > 255 || /\p{Cc}/u.test(value));
    const invalidField = lengthFields.find(([, value, original]) => utf16Length(value) !== utf16Length(original || ""));
    const number = Number(addressNumber.value);
    const invalidNumber = !Number.isInteger(number) || number < 0 || number > 0xffffffff;
    const duplicateName = !name.value || (current.summary.variables || []).some((symbol, symbolIndex) =>
      symbolIndex !== variable.globalVariableIndex && symbol.name?.toLocaleLowerCase() === name.value.toLocaleLowerCase());
    const changed = name.value !== (variable.name || "")
      || addressArea.value !== (variable.addressArea || "")
      || number !== variable.addressNumber
      || dataType.value !== (variable.dataType || "")
      || description.value !== (variable.description || "");

    if (duplicateName) {
      validation.textContent = "Variable name must be nonempty and unique.";
    } else if (invalidText) {
      validation.textContent = "Name and comment allow up to 255 UTF-16 units and no control characters.";
    } else if (invalidField) {
      validation.textContent = `${invalidField[0]} must remain ${utf16Length(invalidField[2] || "")} UTF-16 units.`;
    } else if (invalidNumber) {
      validation.textContent = "Address number must be an integer from 0 to 4294967295.";
    } else {
      validation.textContent = "Name and comment allow up to 255 UTF-16 units. Area and type keep their encoded length.";
    }
    validation.classList.toggle("invalid", Boolean(duplicateName || invalidText || invalidField || invalidNumber));
    apply.disabled = !changed || Boolean(duplicateName || invalidText || invalidField || invalidNumber);
  };
  controls.forEach((control) => control.addEventListener("input", validate));
  validate();
  form.append(validation, apply);
  inspector.append(form);
}

function renderParametersEditor(canvas, inspector, parameters) {
  canvas.append(editorHeader("Parameters", `${parameters.length} parameter sections`));
  const table = createTable(["Type", "Name", "Attributes", "Children"]);
  parameters.forEach((parameter) => appendCells(table.tBodies[0].insertRow(), [parameter.parameterType || parameter.typeName, parameter.name, Object.keys(parameter.attributes || {}).length, parameter.children?.length]));
  canvas.append(tableContainer(table, parameters.length));
  renderCollectionInspector(inspector, "PARAMETERS", [["Sections", parameters.length], ["State", "Read only"]]);
}

function renderOverviewEditor(canvas, inspector, summary, file) {
  canvas.append(editorHeader("Workspace Overview", file.fileName));
  const form = element("div", "overview-properties");

  const cpuField = element("label", "property-field");
  cpuField.append(element("span", "property-label", "CPU"));
  const cpuSelect = document.createElement("select");
  cpuSelect.setAttribute("aria-label", "CPU");
  const currentCpu = summary.cpu || null;
  if (!currentCpu?.model) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = currentCpu?.typeCode === undefined || currentCpu?.typeCode === null
      ? "No CPU configuration"
      : `Unknown CPU type ${currentCpu.typeCode}`;
    cpuSelect.append(option);
  }
  const families = new Map();
  cpuCatalog.forEach((entry) => {
    if (!families.has(entry.family)) families.set(entry.family, []);
    families.get(entry.family).push(entry);
  });
  families.forEach((entries, family) => {
    const group = document.createElement("optgroup");
    group.label = family;
    entries.forEach((entry) => {
      const option = document.createElement("option");
      option.value = entry.model;
      option.textContent = entry.model;
      try {
        select_xgwx_cpu(current.file.bytes, entry.model);
      } catch (error) {
        option.disabled = true;
        option.title = String(error);
      }
      group.append(option);
    });
    cpuSelect.append(group);
  });
  cpuSelect.value = currentCpu?.model || "";
  cpuSelect.disabled = !Array.from(cpuSelect.options).some((option) => !option.disabled && option.value && option.value !== currentCpu?.model);
  cpuField.append(cpuSelect);
  form.append(cpuField);

  const cpuActions = element("div", "overview-cpu-actions");
  const cpuNote = element("p", "module-selection-note", currentCpu?.family === "XGK"
    ? "Available CPU changes preserve hardware within the target CPU limits. Check program compatibility in XG5000 after changing CPU."
    : currentCpu?.family === "XGI" && !cpuSelect.disabled
    ? "Supported XGI models update captured default parameters and preserve SFC programs. CPUUN includes local Ethernet defaults. Custom settings and configured modules require migration. Check program compatibility in XG5000 after changing CPU."
    : "CPU conversion is not supported for this workspace. Existing hardware is preserved.");
  const applyCpu = button("Apply CPU selection", "primary-button", async () => {
    const entry = cpuCatalog.find((item) => item.model === cpuSelect.value);
    if (!entry || cpuSelect.selectedOptions[0]?.disabled) return;
    await applyEdit(
      () => select_xgwx_cpu(current.file.bytes, entry.model),
      `Select CPU ${entry.model}`,
    );
  });
  applyCpu.textContent = "Apply CPU";
  applyCpu.disabled = true;
  cpuSelect.addEventListener("change", () => {
    applyCpu.disabled = cpuSelect.disabled || cpuSelect.selectedOptions[0]?.disabled || !cpuSelect.value || cpuSelect.value === currentCpu?.model;
  });
  cpuActions.append(cpuNote, applyCpu);
  form.append(cpuActions);

  [
    ["Project name", summary.project?.name], ["File version", summary.project?.fileVersion],
    ["Last write time", summary.project?.fileLastWriteTime], ["GUID", summary.project?.guid],
    ["Header label", summary.header?.label], ["File size", formatBytes(file.byteLength)],
    ["Header bytes", summary.header?.headerBytes], ["Trailer bytes", summary.header?.trailerBytes],
  ].forEach(([label, value]) => property(form, label, value, true));
  canvas.append(form);
  const warnings = summary.warnings || [];
  canvas.append(editorHeader("Parser Diagnostics", `${warnings.length} warnings`));
  const diagnostics = element("div", "diagnostics");
  if (!warnings.length) diagnostics.append(element("div", "diagnostic success", "Parser completed without warnings."));
  warnings.forEach((warning) => diagnostics.append(element("div", "diagnostic warning", warning)));
  canvas.append(diagnostics);
  renderCollectionInspector(inspector, "WORKSPACE", [["Format", "XGWX"], ["Mode", cpuSelect.disabled ? "CPU unchanged" : "CPU editable"], ["Parser", warnings.length ? "Warnings" : "Ready"]]);
}

function renderCollectionInspector(inspector, title, rows) {
  inspector.replaceChildren(inspectorHeading(title));
  const form = element("div", "property-grid");
  rows.forEach(([label, value]) => property(form, label, value, true));
  inspector.append(form);
}

function inspectorHeading(title) {
  const heading = element("div", "pane-heading inspector-heading");
  heading.append(element("span", "", title));
  return heading;
}

function editorHeader(title, description) {
  const header = element("div", "editor-section-heading");
  header.append(element("h2", "", title), element("span", "", description));
  return header;
}

function property(host, label, value, readonly, multiline = false) {
  const group = element("label", "property-field");
  group.append(element("span", "property-label", label));
  const control = multiline ? document.createElement("textarea") : document.createElement("input");
  control.value = display(value, "");
  control.readOnly = readonly;
  control.tabIndex = readonly ? -1 : 0;
  if (multiline) control.rows = 3;
  group.append(control);
  host.append(group);
  return control;
}

function renderStatusBar(summary) {
  const bar = element("footer", "status-bar");
  const left = element("div", "status-section");
  left.append(statusItem(dirty ? "edit" : "save", dirty ? "Modified" : "Saved"), statusItem("file", "XGWX"), statusItem("program", `${summary.counts?.programs || 0} programs`));
  const right = element("div", "status-section");
  const ready = element("span", "status-ready");
  const hasWarnings = (summary.warnings || []).length > 0;
  const dot = element("span", `status-dot${hasWarnings ? " warning" : ""}`);
  ready.append(dot, element("span", "", hasWarnings ? "Parser warnings" : "Parser ready"));
  right.append(ready);
  bar.append(left, right);
  return bar;
}

function statusItem(iconName, label) {
  const item = element("span", "status-item");
  item.append(icon(iconName), element("span", "", label));
  return item;
}

function createTable(headers) {
  const table = document.createElement("table");
  table.className = "data-table";
  const row = table.createTHead().insertRow();
  headers.forEach((header) => row.append(element("th", "", header)));
  table.createTBody();
  return table;
}

function tableContainer(table, count) {
  if (!count) return emptyState("No records found.");
  const wrap = element("div", "table-scroll");
  wrap.append(table);
  return wrap;
}

function appendCells(row, values) {
  values.forEach((value) => row.append(element("td", "", display(value))));
}

function emptyState(message) {
  return element("div", "empty-state", message);
}

function renderLoading(message) {
  app.replaceChildren();
  const screen = element("div", "loading-screen");
  screen.append(element("div", "spinner"), element("span", "", message));
  app.append(screen);
}

function renderError(message) {
  app.replaceChildren();
  const screen = element("div", "error-screen");
  screen.append(icon("warning"), element("h1", "", "Unable to open XGWX workspace"), element("pre", "", message));
  screen.append(button("Try again", "primary-button", () => vscode.postMessage({ type: "refresh" })));
  app.append(screen);
}

function icon(name) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.classList.add("icon", `icon-${name}`);
  svg.setAttribute("viewBox", "0 0 16 16");
  svg.setAttribute("aria-hidden", "true");
  const paths = {
    chevron: '<path d="M6 3.5 10.5 8 6 12.5"/>',
    file: '<path d="M3.5 1.5h5l4 4v9h-9z"/><path d="M8.5 1.5v4h4"/>',
    refresh: '<path d="M13 5V2.5l-1.4 1.4A5.5 5.5 0 1 0 13.2 9"/>',
    save: '<path d="M2 2h10l2 2v10H2z"/><path d="M5 2v4h6V2M5 10h6v4H5z"/>',
    edit: '<path d="m3 11 8-8 2 2-8 8-3 1zM9.5 4.5l2 2"/>',
    settings: '<circle cx="8" cy="8" r="2.2"/><path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.4 3.4l1.4 1.4M11.2 11.2l1.4 1.4M12.6 3.4l-1.4 1.4M4.8 11.2l-1.4 1.4"/>',
    hardware: '<rect x="2" y="3" width="12" height="10" rx="1"/><path d="M5 6h6M5 9h2M9 9h2"/>',
    module: '<rect x="3" y="2" width="10" height="12" rx="1"/><path d="M6 5h4M6 8h4M6 11h4"/>',
    rack: '<path d="M2 4h12v8H2zM5 4v8M8 4v8M11 4v8"/>',
    program: '<path d="m5 3-3 5 3 5M11 3l3 5-3 5M9.5 2 6.5 14"/>',
    network: '<circle cx="3" cy="8" r="1.5"/><circle cx="12.5" cy="3" r="1.5"/><circle cx="12.5" cy="13" r="1.5"/><path d="m4.4 7.3 6.7-3.5M4.4 8.7l6.7 3.5"/>',
    symbol: '<path d="M2 3h12M2 8h12M2 13h12M5 1.5v13M11 1.5v13"/>',
    sliders: '<path d="M2 4h12M2 8h12M2 12h12"/><circle cx="5" cy="4" r="1.5"/><circle cx="10.5" cy="8" r="1.5"/><circle cx="7" cy="12" r="1.5"/>',
    search: '<circle cx="6.5" cy="6.5" r="4"/><path d="m9.5 9.5 4 4"/>',
    lock: '<rect x="3" y="7" width="10" height="7" rx="1"/><path d="M5 7V5a3 3 0 0 1 6 0v2"/>',
    warning: '<path d="M8 1.5 15 14H1z"/><path d="M8 5v4M8 11.5v.5"/>',
  };
  svg.innerHTML = paths[name] || paths.file;
  return svg;
}

function element(tag, className = "", text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined && text !== null) node.textContent = String(text);
  return node;
}

function button(label, className, listener) {
  const node = element("button", className);
  node.type = "button";
  node.setAttribute("aria-label", label);
  node.title = label;
  node.addEventListener("click", listener);
  return node;
}

function display(value, fallback = "—") {
  return value === null || value === undefined || value === "" ? fallback : String(value);
}

function viewTitle() {
  return {
    hardware: selectedBase === null ? "Hardware Configuration" : `Base ${selectedBase}`,
    programs: "Programs",
    networks: "Networks",
    variables: "Variables",
    parameters: "Parameters",
    overview: "Workspace Overview",
  }[activeView];
}

function viewIcon() {
  return { hardware: "hardware", programs: "program", networks: "network", variables: "symbol", parameters: "sliders", overview: "file" }[activeView];
}

function moduleText(module) {
  return [module.base, module.slot, module.id, module.subType, module.name, module.comment, module.inputFilter, module.details]
    .map((value) => display(value, ""))
    .join(" ")
    .toLocaleLowerCase();
}

function moduleSlotCells(slotRow) {
  const { base, slot, module, kind } = slotRow;
  if (!module) return [base, slot, 1, "—", "Empty slot", "—", ""];
  if (kind === "continuation") {
    return [base, slot, `↳ ${module.slot}`, "—", `${shortModuleName(module.name)} continuation`, "—", ""];
  }
  return [base, moduleSlotRange(module), moduleSlotSpan(module), module.id, shortModuleName(module.name), module.inputFilter, module.comment];
}

function shortModuleName(name) {
  const value = display(name, "Unknown module");
  const match = value.match(/XG[A-Z0-9-]+(?:\/B)?/i);
  return match?.[0] || value;
}

function supportsXgkHardware() {
  return current?.summary.cpu?.family === "XGK" && current.summary.counts?.configurations === 1;
}

function catalogEntryMatchesModule(entry, module) {
  return supportsXgkHardware() && entry.id === module.id
    && entry.subType === module.subType;
}

function moduleSlotSpan(module) {
  return moduleCatalog.find((entry) => catalogEntryMatchesModule(entry, module))?.slotSpan || 1;
}

function moduleSlotRange(module) {
  if (module.slot === null || module.slot === undefined) return "—";
  const span = moduleSlotSpan(module);
  return span === 1 ? String(module.slot) : `${module.slot}–${module.slot + span - 1}`;
}

function catalogModuleDescription(entry) {
  const separator = entry.name.indexOf(":");
  return separator >= 0 ? entry.name.slice(separator + 1) : entry.name;
}

function formatRawDetails(module) {
  return JSON.stringify({
    base: module.base,
    slot: module.slot,
    id: module.id,
    subType: module.subType,
    details: module.details,
    inputFilterRaw: module.inputFilterRaw,
  }, null, 2);
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KiB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MiB`;
}

function utf16Length(value) {
  return [...String(value)].reduce((length, character) => length + (character.codePointAt(0) > 0xffff ? 2 : 1), 0);
}
