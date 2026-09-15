import init, {
  cpu_catalog,
  delete_xgwx_ladder_rung_comment,
  delete_xgwx_module,
  edit_xgwx_ladder_cell,
  edit_xgwx_ladder_branch,
  edit_xgwx_ladder_comment,
  insert_xgwx_ladder_row,
  insert_xgwx_module,
  parse_xgwx,
  select_xgwx_cpu,
  select_xgwx_module,
  set_xgwx_module_option,
  set_xgwx_base_slot_count,
  update_xgwx_ladder_cell,
  update_xgwx_module,
  update_xgwx_network,
  update_xgwx_network_module,
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
import {
  COIL_ELEMENT_CHOICES,
  CONTACT_ELEMENT_CHOICES,
  elementKindHasOperand,
  structuralElementFromCell,
} from "./ladder-elements.js";

const vscode = acquireVsCodeApi();
const app = document.querySelector("#app");
const wasmReady = init();
const LD_COLUMN_COUNT = 10;
const LD_VIEW_WIDTH = 900;
const LD_LEFT_RAIL = 34;
const LD_RIGHT_RAIL = 770;
const LD_ROW_HEIGHT = 76;
const LD_FIRST_ROW_Y = 58;

let current = null;
let moduleCatalog = [];
let cpuCatalog = [];
let activeView = "overview";
let selectedBase = null;
let selectedModule = null;
let selectedHardwareSlot = null;
let selectedProgramIndex = 0;
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

window.addEventListener("message", async ({ data }) => {
  if (data?.type === "load") await loadWorkspace(data);
  if (data?.type === "error") renderError(data.message);
  if (data?.type === "saved" || data?.type === "reverted") {
    dirty = Boolean(data.dirty);
    if (current) renderWorkspace();
  }
  if (data?.type === "requestRefresh") vscode.postMessage({ type: "refresh" });
});

vscode.postMessage({ type: "ready" });

async function loadWorkspace(file) {
  renderLoading(`Parsing ${file.fileName}…`);
  try {
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
  app.replaceChildren();

  const shell = element("div", "editor-shell");
  shell.dataset.view = activeView;
  shell.append(
    renderCommandBar(file, summary),
    renderWorkbench(file, summary),
    renderStatusBar(summary),
  );
  app.append(shell);
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
  if (activeView === "variables") renderVariablesEditor(canvas, inspector, summary.variables || []);
  if (activeView === "parameters") renderParametersEditor(canvas, inspector, summary.parameters || []);
  if (activeView === "overview") renderOverviewEditor(canvas, inspector, summary, current.file);

  editor.append(tabs, canvas);
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
  toolbar.append(searchWrap, scope);
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
  table.setAttribute("aria-label", "Hardware modules. Use Up and Down to navigate and Delete to remove a module.");
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

function renderProgramsEditor(canvas, inspector, programs) {
  if (selectedProgramIndex >= programs.length) selectedProgramIndex = 0;
  const selected = programs[selectedProgramIndex] || null;
  const ladder = (current.summary.ladder || []).find((item) => item.programIndex === selectedProgramIndex) || null;

  canvas.append(editorHeader("Programs", `${programs.length} program records · supported fields are editable`));
  const table = createTable(["Name", "Task", "Kind", "Version", "Comment"]);
  programs.forEach((program, index) => {
    const row = table.tBodies[0].insertRow();
    row.className = selectedProgramIndex === index ? "selected" : "";
    row.tabIndex = 0;
    appendCells(row, [program.name || `Program ${index + 1}`, program.task, program.kind, program.version, program.comment]);
    const select = () => {
      selectedProgramIndex = index;
      resetLadderSelection();
      renderWorkspace();
    };
    row.addEventListener("click", select);
    row.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") select();
    });
  });
  canvas.append(tableContainer(table, programs.length));

  if (ladder?.structuralEditing && !ladder.rungs.length) ladder.rungs = [{ rawY: 0 }];
  if (ladder) {
    if (selectedLadderComment && !(ladder.rungComments || []).some((comment) => (
      selectedLadderComment.kind === "Rung" && comment.rawY === selectedLadderComment.rawY
    ))) {
      selectedLadderComment = null;
    }
    const rowValues = ladder.rungs.map((rung) => rung.rawY);
    if (selectedLadderFocus && !rowValues.includes(selectedLadderFocus.rawY)) {
      resetLadderSelection();
    }
    if (selectedLadderFocus) {
      const focusedCell = ladderCellAtPosition(ladder, selectedLadderFocus);
      selectedCellOffset = focusedCell?.offset ?? null;
      selectedBlankCell = focusedCell ? null : selectedLadderFocus;
    }
    const selectPosition = (position, extend = false) => {
      const rowIndex = rowValues.indexOf(position.rawY);
      if (rowIndex < 0) return;
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
        || selection.decodedCells.some((cell) => !structuralElement(cell))) return false;
      const editableCells = selection.decodedCells;
      const activeKey = selectedLadderFocus ? ladderPositionKey(selectedLadderFocus) : null;
      const edited = await applyEdit(
        () => editableCells.reduce((bytes, cell) => edit_xgwx_ladder_cell(
          bytes, selectedProgramIndex, {
            rawY: cell.rawY, column: ldCellColumn(cell.rawX),
            expected: structuralElement(cell), replacement: null,
          },
        ), current.file.bytes),
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
  const rowValues = ladder.rungs.map((rung) => rung.rawY);
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
  const rowValues = ladder.rungs.map((rung) => rung.rawY);
  const selectedKeys = ladderSelectionKeys(rowValues, selectedLadderAnchor, selectedLadderFocus);
  const activeKey = selectedLadderFocus ? ladderPositionKey(selectedLadderFocus) : null;
  const rungNumbers = new Map(rowValues.map((rawY, index) => [rawY, index]));
  const layoutRows = buildLdLayoutRows(rowValues, ladder.rungComments || []);
  const rowIndexes = new Map(layoutRows
    .map((row, index) => row.type === "rung" ? [row.rawY, index] : null)
    .filter(Boolean));
  const height = LD_FIRST_ROW_Y + Math.max(layoutRows.length, 1) * LD_ROW_HEIGHT;
  board.style.width = `${LD_VIEW_WIDTH}px`;
  board.style.height = `${height}px`;

  let dragSelecting = false;
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
    board.querySelector(`[data-ladder-key="${ladderPositionKey(position)}"]`)?.focus();
  };
  const bindSelection = (node, position) => {
    const key = ladderPositionKey(position);
    let preserveSelectionOnFocus = false;
    node.dataset.ladderKey = key;
    node.classList.toggle("selected", selectedKeys.has(key));
    node.classList.toggle("active", activeKey === key);
    node.setAttribute("aria-selected", String(selectedKeys.has(key)));
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
      selectPosition(position, event.shiftKey);
      document.addEventListener("pointerup", () => {
        dragSelecting = false;
      }, { once: true });
    });
    node.addEventListener("pointerenter", (event) => {
      if (dragSelecting && (event.buttons & 1)) selectPosition(position, true);
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
    node.addEventListener("keydown", async (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "l" && ladder.structuralEditing) {
        event.preventDefault(); event.stopPropagation();
        await insertLadderRow(position.rawY);
        return;
      }
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
        event.preventDefault();
        focusCursor(moveLadderCursor(layoutRows, {
          type: "rung", rawY: position.rawY, column: position.column,
        }, event.key, LD_COLUMN_COUNT), event.shiftKey);
      }
      if (event.key === "Delete" && !event.repeat) {
        event.preventDefault();
        await deleteSelection();
      }
    });
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
    svg.append(svgLine(LD_LEFT_RAIL + column * width, ldRowY(rowIndex),
      LD_LEFT_RAIL + (column + 1) * width, ldRowY(rowIndex), "wire"));
  });
  (ladder.verticalLines || []).forEach((line) => {
    const start = rowIndexes.get(line.rawYStart);
    const end = rowIndexes.get(line.rawYEnd);
    if (start === undefined || end === undefined) return;
    svg.append(svgLine(ldBoundaryX(line.rawX), ldRowY(start), ldBoundaryX(line.rawX), ldRowY(end), "wire"));
  });
  board.append(svg);

  for (let column = 0; column < LD_COLUMN_COUNT; column += 1) {
    const label = element("span", "ld-column-label", column + 1);
    label.style.left = `${ldCellX(column)}px`;
    board.append(label);
  }

  rowValues.forEach((rawY, rungIndex) => {
    const label = element("span", "ld-rung-label", rungIndex + 1);
    label.style.top = `${ldRowY(rowIndexes.get(rawY))}px`;
    board.append(label);
  });

  const occupied = new Set((ladder.cells || []).map((cell) => ldBlankKey(cell.rawY, ldCellColumn(cell.rawX))));
  rowValues.forEach((rawY, rungIndex) => {
    const displayRowIndex = rowIndexes.get(rawY);
    for (let column = 0; column < LD_COLUMN_COUNT; column += 1) {
      const key = ldBlankKey(rawY, column);
      if (occupied.has(key)) continue;
      const blank = { rawY, rowIndex: rungIndex, column };
      const node = button(`Blank cell, rung ${rungIndex + 1}, column ${column + 1}`, "ld-blank-cell", () => {});
      node.dataset.blankKey = key;
      bindSelection(node, blank);
      node.style.left = `${ldCellX(column)}px`;
      node.style.top = `${ldRowY(displayRowIndex)}px`;
      board.append(node);
    }
  });

  layoutRows.forEach((row, layoutIndex) => {
    if (row.type !== "comment") return;
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
    node.style.left = `${ldCellX(ldCellColumn(cell.rawX))}px`;
    node.style.top = `${ldRowY(rowIndex)}px`;
    node.title = cell.sourceText || cell.value || cell.contact || cell.coil || cell.kind;
    const value = element("span", "ld-value", cell.value || ldMarkerLabel(cell));
    const glyph = element("span", "ld-glyph", ldCellGlyph(cell));
    if (cell.kind === "Instruction") node.append(glyph);
    else node.append(value, glyph);
    if (cell.operands?.length) node.append(element("span", "ld-operands", cell.operands.join(" ")));
    board.append(node);
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
    ladder.rungs.map((rung) => rung.rawY),
    selectedLadderAnchor,
    selectedLadderFocus,
    normalizedLadderCells(ladder),
  );
}

function ladderPasteEdits(ladder, position) {
  return planLadderPaste(
    ladderClipboard,
    ladder.rungs.map((rung) => rung.rawY),
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
  if (cell.kind === "Instruction") return "instruction";
  return "contact";
}

function ldCellGlyph(cell) {
  if (cell.coil) {
    return {
      Output: "( )", Inverse: "(/)", Set: "(S)", Reset: "(R)",
      P_COIL: "(P)", N_COIL: "(N)",
    }[cell.coil] || "( )";
  }
  if (cell.kind === "Instruction") return cell.value || "FN";
  return {
    NO: "| |", NC: "|/|", P_CONTACT: "|P|", P_NOT_CONTACT: "|P/|",
    N_CONTACT: "|N|", N_NOT_CONTACT: "|N/|", PUP: "[↑]", PDN: "[↓]", INV: "[¬]",
  }[cell.contact] || "[ ]";
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
    apply.disabled = (hasOperand && !/^[PMKFLTC][0-9]{1,31}$/.test(value))
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

function renderProgramInspector(inspector, program, ladder, cell, blankCell = null, selection = null) {
  inspector.replaceChildren(inspectorHeading("PROGRAM"));
  if (!program) {
    inspector.append(emptyState("Select a program to edit it."));
    return;
  }

  const form = element("div", "property-grid");
  const name = property(form, "Name", program.name, false);
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

  const cellSection = element("section", "cell-editor");
  cellSection.append(element("h3", "", "Ladder cell"));
  if (selection?.total > 1) {
    cellSection.append(element(
      "div",
      "ladder-selection-summary",
      `${selection.total} grid cells selected · ${selection.decodedCells.length} elements`,
    ));
  }
  if (ladder?.structuralEditing && (blankCell || structuralElement(cell))) {
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
      const choices = ladder.instructionChoices || [];
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
        const choice = ladder.instructionChoices.find(item => item.mnemonic === instructionSelect.value);
        if (!choice) return;
        const currentParts = source.value.split(",").slice(1).map(value => value.trim());
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

async function applyEdit(update, label) {
  try {
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
    dirty = true;
    vscode.postMessage({ type: "edit", label, bytes: Array.from(bytes) });
    renderWorkspace();
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
  const table = createTable(["Name", "Type", "Network type", "Modules", "Description"]);
  networks.forEach((network, index) => {
    const row = table.tBodies[0].insertRow();
    row.classList.toggle("selected", index === selectedNetworkIndex && !selectedNetworkModuleKey);
    row.tabIndex = 0;
    appendCells(row, [network.name || `Network ${index + 1}`, network.typeName, network.networkType, network.modules?.length, network.description]);
    const select = () => {
      selectedNetworkIndex = index;
      selectedNetworkModuleKey = null;
      renderWorkspace();
    };
    row.addEventListener("click", select);
    row.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") select();
    });
  });
  canvas.append(tableContainer(table, networks.length));
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
    const typeName = property(form, "Type", network.typeName, false);
    const networkType = property(form, "Network type", network.networkType, false);
    property(form, "Configured modules", network.modules?.length || 0, true);
    const apply = button("Apply network properties", "primary-button", async () => {
      await applyEdit(
        () => update_xgwx_network(current.file.bytes, selectedNetworkIndex, {
          name: name.value,
          typeName: typeName.value,
          networkType: networkType.value,
        }),
        `Edit network ${display(network.name, selectedNetworkIndex + 1)}`,
      );
    });
    apply.textContent = "Apply network properties";
    const controls = [name, typeName, networkType];
    const validate = () => {
      const changed = name.value !== (network.name || "")
        || typeName.value !== (network.typeName || "")
        || networkType.value !== (network.networkType || "");
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
  const hardwareModule = (summary.hardware?.modules || []).find((item) => (
    item.base === module.base && item.slot === module.slot
  ));
  const catalogEntry = supportsXgkHardware() && hardwareModule && moduleCatalog.find((entry) => (
    entry.id === module.id && entry.subType === hardwareModule.subType
  ));

  if (!fenet && catalogEntry?.visibleOptions?.length) {
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
    [
      ["Station", fenet.stationNo],
      ["IP address", fenet.ipAddress],
      ["Subnet mask", fenet.subnet],
      ["Gateway", fenet.gateway],
      ["DNS", fenet.dns],
      ["IP address 2", fenet.ipAddress2],
      ["Subnet mask 2", fenet.subnet2],
      ["Gateway 2", fenet.gateway2],
      ["DNS 2", fenet.dns2],
      ["DHCP", fenet.dhcp],
      ["Driver type", fenet.driverType],
      ["Receive wait", fenet.rcvWaitTime],
      ["Client wait", fenet.clientWaitTime],
      ["Glofa sockets", fenet.glofaSocketCount],
    ].forEach(([label, value]) => property(form, label, value, true));
  }

  const cnet = findNetworkConfiguration(summary.cnet, module);
  if (cnet) {
    form.append(element("div", "network-config-heading", "Cnet configuration"));
    property(form, "Station", cnet.stationNo, true);
    (cnet.ports || []).forEach((port, index) => {
      form.append(element("div", "network-config-heading", `Port ${index + 1}`));
      [
        ["Station", port.stationNo],
        ["Mode", port.mode],
        ["Baud rate", port.baudRate],
        ["Data bits", port.dataBits],
        ["Stop bits", port.stopBits],
        ["Parity", port.parity],
        ["RX timeout", port.rxTimeout],
      ].forEach(([label, value]) => property(form, label, value, true));
    });
  }
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

function renderVariablesEditor(canvas, inspector, variables) {
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
    const table = createTable(["Name", "Address", "Type", "Comment"]);
    shown.forEach(({ variable, index }) => {
      const row = table.tBodies[0].insertRow();
      row.className = selectedVariableIndex === index ? "selected" : "";
      row.tabIndex = 0;
      appendCells(row, [variable.name, variable.address, variable.dataType, variable.description]);
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
  canvas.append(toolbar, host);
  renderRows();
  if (selectedVariableIndex >= variables.length) selectedVariableIndex = 0;
  renderVariableInspector(inspector, variables[selectedVariableIndex] || null, selectedVariableIndex);
}

function renderVariableInspector(inspector, variable, index) {
  inspector.replaceChildren(inspectorHeading("VARIABLE"));
  if (!variable) {
    inspector.append(emptyState("Select a variable to edit it."));
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
      () => update_xgwx_variable(current.file.bytes, index, {
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
      ["Name", name.value, variable.name],
      ["Area", addressArea.value, variable.addressArea],
      ["Type", dataType.value, variable.dataType],
      ["Description", description.value, variable.description],
    ];
    const invalidField = lengthFields.find(([, value, original]) => utf16Length(value) !== utf16Length(original || ""));
    const number = Number(addressNumber.value);
    const invalidNumber = !Number.isInteger(number) || number < 0 || number > 0xffffffff;
    const changed = name.value !== (variable.name || "")
      || addressArea.value !== (variable.addressArea || "")
      || number !== variable.addressNumber
      || dataType.value !== (variable.dataType || "")
      || description.value !== (variable.description || "");

    if (invalidField) {
      validation.textContent = `${invalidField[0]} must remain ${utf16Length(invalidField[2] || "")} UTF-16 units.`;
    } else if (invalidNumber) {
      validation.textContent = "Address number must be an integer from 0 to 4294967295.";
    } else {
      validation.textContent = "String fields keep their encoded length; address number may change freely.";
    }
    validation.classList.toggle("invalid", Boolean(invalidField || invalidNumber));
    apply.disabled = !changed || Boolean(invalidField || invalidNumber);
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
