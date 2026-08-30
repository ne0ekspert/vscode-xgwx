import init, {
  delete_xgwx_module,
  insert_xgwx_module,
  parse_xgwx,
  select_xgwx_module,
  set_xgwx_module_option,
  update_xgwx_ladder_cell,
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
  blankLadderCellText,
  ladderPositionKey,
  ladderSelectionKeys,
  moveLadderPosition,
} from "./ladder-selection.js";
import { groupModuleOptions } from "./module-option-groups.js";

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
let activeView = "overview";
let selectedBase = null;
let selectedModule = null;
let selectedHardwareSlot = null;
let selectedProgramIndex = 0;
let selectedCellOffset = null;
let selectedBlankCell = null;
let selectedLadderAnchor = null;
let selectedLadderFocus = null;
let selectedVariableIndex = 0;
let dirty = false;

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
  tree.append(buildDataGroup("Networks", "networks", summary.networks || [], "network", (item, index) => item.name || `Network ${index + 1}`));
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
  if (activeView === "networks") renderNetworksEditor(canvas, inspector, summary.networks || []);
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

  const toolbar = element("div", "editor-toolbar");
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
  canvas.append(toolbar, tableHost);
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
        if (!module) return;
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
  const currentEntry = module
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
    property(form, "Comment", module.comment, true, true);
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
  moduleCatalog.forEach((entry) => {
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
    if (!entry) return;
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
    apply.disabled = !select.value || select.value === currentEntry?.model;
  });
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

  if (ladder) {
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
      if (!extend || !selectedLadderAnchor) selectedLadderAnchor = normalized;
      selectedLadderFocus = normalized;
      const cell = ladderCellAtPosition(ladder, normalized);
      selectedCellOffset = cell?.offset ?? null;
      selectedBlankCell = cell ? null : normalized;
      const selection = currentLadderSelection(ladder);
      renderProgramInspector(inspector, selected, ladder, cell, selectedBlankCell, selection);
      syncLadderSelectionClasses(canvas, selection.keys, normalized);
    };
    const deleteSelection = async () => {
      const selection = currentLadderSelection(ladder);
      const editableCells = selection.decodedCells.filter((cell) => (
        cell.sourceText !== null
        && cell.sourceText !== undefined
        && cell.sourceText.trim().length > 0
      ));
      if (!editableCells.length) return false;
      const activeKey = selectedLadderFocus ? ladderPositionKey(selectedLadderFocus) : null;
      const edited = await applyEdit(
        () => editableCells.reduce((bytes, cell) => update_xgwx_ladder_cell(
          bytes,
          selectedProgramIndex,
          cell.offset,
          cell.sourceText,
          blankLadderCellText(cell.sourceText),
        ), current.file.bytes),
        `Clear ${editableCells.length} ladder cell${editableCells.length === 1 ? "" : "s"}`,
      );
      if (edited && activeKey) {
        requestAnimationFrame(() => document.querySelector(`[data-ladder-key="${activeKey}"]`)?.focus());
      }
      return edited;
    };
    canvas.append(editorHeader("Ladder diagram", `${ladder.rungs.length} rungs · ${LD_COLUMN_COUNT} columns`));
    canvas.append(renderLadderDiagram(ladder, selectPosition, deleteSelection));
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

function renderLadderDiagram(ladder, selectPosition, deleteSelection) {
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
  const bindSelection = (node, position) => {
    const key = ladderPositionKey(position);
    node.dataset.ladderKey = key;
    node.classList.toggle("selected", selectedKeys.has(key));
    node.classList.toggle("active", activeKey === key);
    node.setAttribute("aria-selected", String(selectedKeys.has(key)));
    node.addEventListener("pointerdown", (event) => {
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
      if (ladderPositionKey(selectedLadderFocus || {}) !== key) selectPosition(position, false);
    });
    node.addEventListener("keydown", async (event) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
        event.preventDefault();
        const next = moveLadderPosition(rowValues, position, event.key, LD_COLUMN_COUNT);
        if (!next) return;
        selectPosition(next, event.shiftKey);
        board.querySelector(`[data-ladder-key="${ladderPositionKey(next)}"]`)?.focus();
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
    note.style.left = `${LD_LEFT_RAIL + 1}px`;
    note.style.width = `${LD_RIGHT_RAIL - LD_LEFT_RAIL - 2}px`;
    note.style.top = `${ldRowY(layoutIndex)}px`;
    board.append(note);
  });

  (ladder.outputComments || []).forEach((comment) => {
    const rowIndex = rowIndexes.get(comment.rawY);
    if (rowIndex === undefined) return;
    const note = element("span", "ld-output-comment", comment.text);
    note.style.left = `${LD_RIGHT_RAIL + 12}px`;
    note.style.width = `${LD_VIEW_WIDTH - LD_RIGHT_RAIL - 20}px`;
    note.style.top = `${ldRowY(rowIndex)}px`;
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
      `${selection.total} grid cells selected · ${selection.editableCount} decoded text cells · Delete clears their contents`,
    ));
  }
  if (blankCell) {
    cellSection.append(
      element("div", "blank-cell-position", `Rung ${blankCell.rowIndex + 1} · Column ${blankCell.column + 1}`),
      element("p", "muted", "Blank cell selected. Element insertion is not supported yet."),
    );
  } else if (!cell) {
    cellSection.append(element("p", "muted", ladder ? "Select a ladder cell to edit its source text." : "No decoded ladder cells."));
  } else if (cell.sourceText === null || cell.sourceText === undefined) {
    cellSection.append(element("p", "muted", "This marker has no text payload and remains read only."));
  } else {
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
      const valid = units === requiredUnits && source.value !== cell.sourceText;
      counter.textContent = `${units} / ${requiredUnits} UTF-16 units`;
      counter.classList.toggle("invalid", units !== requiredUnits);
      applyCell.disabled = !valid;
    };
    source.addEventListener("input", validate);
    validate();
    cellSection.append(counter, applyCell);
  }
  inspector.append(cellSection);
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

function renderNetworksEditor(canvas, inspector, networks) {
  canvas.append(editorHeader("Networks", `${networks.length} configured networks`));
  const table = createTable(["Name", "Type", "Network type", "Modules", "Description"]);
  networks.forEach((network, index) => appendCells(table.tBodies[0].insertRow(), [network.name || `Network ${index + 1}`, network.typeName, network.networkType, network.modules?.length, network.description]));
  canvas.append(tableContainer(table, networks.length));
  renderCollectionInspector(inspector, "NETWORKS", [["Count", networks.length], ["State", "Read only"]]);
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
  renderCollectionInspector(inspector, "WORKSPACE", [["Format", "XGWX"], ["Mode", "Read only"], ["Parser", warnings.length ? "Warnings" : "Ready"]]);
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

function catalogEntryMatchesModule(entry, module) {
  return entry.id === module.id
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
