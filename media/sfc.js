const qualifiers = {1:"N",2:"R",4:"S",8:"L",16:"D",32:"P",64:"SD",128:"DS",256:"SL"};
const names = { 0: "Step", 1: "Transition", 2: "Action", 5: "Jump", 6: "Label", 9: "Annotation", 10: "Empty" };
const node = (tag, cls, text = "") => {
  const result = document.createElement(tag); result.className = cls; result.textContent = text; return result;
};
export function sfcEntityName(entity) { return names[entity.typeCode] || `Entity ${entity.typeCode ?? "unknown"}`; }
export function sfcEntityProperties(entity) { return entity.properties.EntityStep || {}; }

export function sfcRowsAfterEdit(block, entity, field, replacement) {
  const rows = structuredClone(block.editableRows), row = rows[entity.row];
  if (field === "initial") {
    if (replacement === "1") rows.forEach(r => { r.initial = false; });
    row.initial = replacement === "1";
  } else if (field === "action" || entity.typeCode === 2) {
    row.action = (typeof replacement === "object" ? replacement.operand : replacement) || null;
    if (!row.action) { delete row.actionQualifier; delete row.actionTime; }
    else if (typeof replacement === "object") {
      if (replacement.qualifier === "N") delete row.actionQualifier; else row.actionQualifier = replacement.qualifier;
      if (replacement.time) row.actionTime = replacement.time; else delete row.actionTime;
    }
  }
  else if (field === "comment") row.comment = replacement;
  else {
    if (row.kind === "label") rows.forEach(r => { if (r.kind === "jump" && r.title === row.title) r.title = replacement; });
    row.title = replacement;
  }
  return rows;
}

export function sfcTextField(block, entity) {
  const p = sfcEntityProperties(entity);
  const linear = Array.isArray(block.editableRows);
  const directBool = block.languageType === 3 && block.language === 2 && entity.typeCode === 1
    && p.PropertyProgram === "0" && /^%MX\d+$/.test(p.Title || "");
  if (!linear && !directBool || ![0,1,2,5,6].includes(entity.typeCode)) return null;
  const operand = [1,2].includes(entity.typeCode);
  return { field: entity.typeCode === 1 ? "condition" : entity.typeCode === 2 ? "action" : "name",
    label: entity.typeCode === 1 ? "transition condition" : entity.typeCode === 2 ? "action operand" : `${sfcEntityName(entity).toLowerCase()} name`,
    value: p.Title || "", prompt: operand ? `Enter a direct %MX BOOL address.${entity.typeCode === 2 ? " Leave empty to remove the action." : ""}`
      : entity.typeCode === 5 ? "Enter an existing label name." : "Enter a unique name using letters, digits, or underscores (32 characters max)." };
}

export function sfcSelectionBounds(anchor, extent) {
  return {top:Math.min(anchor.row,extent.row),bottom:Math.max(anchor.row,extent.row),
    left:Math.min(anchor.column,extent.column),right:Math.max(anchor.column,extent.column)};
}
export function sfcRowsAfterDelete(block, entities) {
  const actual = entities.filter(e => !e.newAction && [0,1,2,5,6].includes(e.typeCode));
  if (!actual.length) return null;
  const removedRows = new Set(actual.filter(e => e.typeCode !== 2).map(e => e.row));
  const removedLabels = new Set([...removedRows].filter(r => block.editableRows[r].kind === "label")
    .map(r => block.editableRows[r].title));
  const removedInitial = [...removedRows].some(r => block.editableRows[r].initial);
  const rows = structuredClone(block.editableRows);
  for (const entity of actual.filter(e => e.typeCode === 2)) {
    const row = rows[entity.row]; row.action = null; delete row.actionQualifier; delete row.actionTime;
  }
  const remaining = rows.filter((row,index) => !removedRows.has(index)
    && !(row.kind === "jump" && removedLabels.has(row.title)));
  if (removedInitial && remaining.some(r => r.kind === "step")) remaining.find(r => r.kind === "step").initial = true;
  return {rows:remaining,selectedRow:Math.min(...actual.map(e => e.row),remaining.length - 1)};
}
function deleteSfcEntity(block, entity, onSequence) {
  const edit = sfcRowsAfterDelete(block,[entity]);
  return edit && onSequence(block,edit.rows,edit.selectedRow);
}

export function renderSfcDiagram(program, selection, onSelect, onSequence, onTextEdit) {
  const section = node("section", "sfc-editor");
  section.append(node("p", "muted", "Select an entity to inspect its properties. Arrow keys navigate; drag or Shift+Arrow selects a rectangle. Delete removes selected rows or actions. Double-click or Enter edits text."));
  const selections = new Map();
  for (const block of program.blocks) {
    section.append(node("h3", "sfc-block-title", `${block.name || "Unnamed block"}${block.main ? " · Main" : ""}`));
    let activeEntity = block.entities.find(e => e.entityIndex === selection?.entityIndex && block.blockIndex === selection?.blockIndex);
    if (Array.isArray(block.editableRows) && onSequence) {
      const toolbar = node("div", "sfc-toolbar");
      const add = (title, run, disabled = false) => {
        const button = node("button", "secondary-button", title); button.type = "button"; button.disabled = disabled;
        button.addEventListener("click", async () => { button.disabled = true; try { await run(); } finally { if (button.isConnected) button.disabled = disabled; } }); toolbar.append(button);
      };
      const unique = (prefix, rows, kind) => { let i = 0; while (rows.some(r => r.kind === kind && r.title === `${prefix}${i}`)) i++; return `${prefix}${i}`; };
      for (const kind of ["step", "transition", "label", "jump"]) add(`Add ${kind}`, () => {
        const rows = structuredClone(block.editableRows);
        const title = kind === "step" ? unique("S", rows, kind) : kind === "label" ? unique("Label", rows, kind)
          : kind === "jump" ? rows.find(r => r.kind === "label").title : "%MX0";
        const index = activeEntity ? activeEntity.row + 1 : rows.length;
        rows.splice(index, 0, { kind, title, comment: "", initial: kind === "step" && !rows.some(r => r.initial), action: null });
        return onSequence(block, rows, index);
      }, kind === "jump" && !block.editableRows.some(r => r.kind === "label"));
      if (!block.editableRows.length) add("Create loop", () => onSequence(block, [
        {kind:"label",title:"Start",comment:"",initial:false,action:null},
        {kind:"step",title:"S0",comment:"",initial:true,action:null},
        {kind:"transition",title:"%MX0",comment:"",initial:false,action:null},
        {kind:"step",title:"S1",comment:"",initial:false,action:null},
        {kind:"transition",title:"%MX1",comment:"",initial:false,action:null},
        {kind:"jump",title:"Start",comment:"",initial:false,action:null},
      ], 1));
      section.append(toolbar);
      section.append(node("p", "muted", "Add after the selected row, or at the end. Select an entity to edit, move, or delete it. Incomplete charts can be saved."));
    } else section.append(node("p", "muted", "Structural editing is unavailable for this chart. Supported properties can still be edited."));
    const viewport = node("div", "sfc-viewport");
    const board = node("div", "sfc-board");
    board.setAttribute("role", "group"); board.setAttribute("aria-label", `SFC ${block.name}`);
    board.tabIndex = 0; board.dataset.sfcBlock = String(block.blockIndex);
    const rowLimit = 4096, columnLimit = 256;
    const positioned = block.entities.filter(e => Number.isInteger(e.row) && e.row >= 0 && e.row < rowLimit
      && Number.isInteger(e.column) && e.column >= 0 && e.column < columnLimit);
    const lastRow = positioned.reduce((last, e) => Math.max(last, e.row), 0);
    const lastCol = positioned.reduce((last, e) => Math.max(last, e.column), 1);
    board.style.width = `${Math.max(640, (lastCol + 2) * 176)}px`;
    board.style.height = `${Math.max(280, (lastRow + 2) * 88)}px`;
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.classList.add("sfc-wires"); svg.setAttribute("width", "100%"); svg.setAttribute("height", "100%");
    svg.setAttribute("aria-hidden", "true"); board.append(svg);
    // Connect adjacent native step/transition entities only; infer no unknown branch topology.
    const byPosition = new Map(positioned.map(e => [`${e.row}:${e.column}`, e]));
    for (const e of positioned.filter(e => [0,1,5,6].includes(e.typeCode))) {
      const next = byPosition.get(`${e.row + 1}:${e.column}`);
      if (!next || ![0,1,5,6].includes(next.typeCode) || e.typeCode === 5) continue;
      const line = document.createElementNS(svg.namespaceURI, "line");
      const x = 100 + e.column * 176;
      line.setAttribute("x1", x); line.setAttribute("x2", x);
      line.setAttribute("y1", 32 + e.row * 88); line.setAttribute("y2", 32 + next.row * 88);
      svg.append(line);
    }
    const navigation = positioned.filter(e => ![9,10].includes(e.typeCode));
    let anchor = activeEntity, extent = activeEntity, movingFocus = false, drag = null, suppressClick = false, lastPaint;
    const cells = new Map();
    const range = node("div", "sfc-selection-range"); range.hidden = true; range.setAttribute("aria-hidden", "true"); board.append(range);
    const status = node("p", "muted sfc-selection-status"); status.setAttribute("role", "status");
    const cellFor = entity => cells.get(entity.entityIndex);
    const selectedCells = () => {
      if (!anchor || !extent) return [];
      const bounds = sfcSelectionBounds(anchor,extent);
      return navigation.filter(e => e.row >= bounds.top && e.row <= bounds.bottom && e.column >= bounds.left && e.column <= bounds.right);
    };
    const paintSelection = () => {
      const key = JSON.stringify([anchor?.row,anchor?.column,extent?.row,extent?.column,extent?.entityIndex]);
      if (lastPaint === key) return; lastPaint = key;
      const selected = new Set(selectedCells().map(e => e.entityIndex));
      for (const entity of navigation) {
        const cell = cellFor(entity); if (!cell) continue;
        cell.classList.toggle("range-selected", selected.has(entity.entityIndex));
        cell.classList.toggle("inspected", extent?.entityIndex === entity.entityIndex);
        cell.setAttribute("aria-pressed",String(selected.has(entity.entityIndex)));
      }
      const multiple = anchor && extent && (anchor.row !== extent.row || anchor.column !== extent.column);
      range.hidden = !multiple;
      if (multiple) {
        const bounds = sfcSelectionBounds(anchor,extent);
        range.style.left = `${bounds.left === 0 ? 32 : 184 + (bounds.left - 1) * 176}px`;
        range.style.top = `${bounds.top * 88 + 4}px`;
        range.style.width = `${(bounds.right - bounds.left + 1) * 176 + (bounds.left === 0 ? 16 : 40)}px`;
        range.style.height = `${(bounds.bottom - bounds.top + 1) * 88 - 8}px`;
      }
      status.textContent = selected.size > 1 ? `${selected.size} cells selected` : "";
      board.dataset.selectedCount = String(selected.size);
    };
    const activateBoard = () => {
      for (const [other,clear] of selections) if (other !== board) clear();
    };
    selections.set(board, () => { anchor = extent = null; paintSelection(); });
    const selectCell = (entity, extend = false) => {
      activateBoard();
      if (!extend || !anchor) anchor = entity;
      extent = entity;
      activeEntity = entity.newAction ? byPosition.get(`${entity.row}:${entity.column - 1}`) : entity;
      onSelect(block,activeEntity); paintSelection();
    };
    const focusCell = entity => {
      movingFocus = true;
      try { (entity?.entityIndex != null ? cellFor(entity) : board)?.focus({preventScroll:true}); }
      finally { movingFocus = false; }
    };
    const labels = new Set();
    for (const entity of positioned) {
      if ([9,10].includes(entity.typeCode)) continue;
      if (!labels.has(entity.row)) {
        const row = node("span", "sfc-row", `L${entity.row}`); row.style.top = `${entity.row * 88 + 22}px`;
        board.append(row); labels.add(entity.row);
        const grid = document.createElementNS(svg.namespaceURI, "line");
        grid.classList.add("sfc-grid-line"); grid.setAttribute("x1", 0); grid.setAttribute("x2", "100%");
        grid.setAttribute("y1", (entity.row + 1) * 88); grid.setAttribute("y2", (entity.row + 1) * 88); svg.append(grid);
      }
      const p = sfcEntityProperties(entity);
      const cls = entity.typeCode === 0 ? "step" : entity.typeCode === 1 ? "transition" : entity.typeCode === 2 ? "action"
        : entity.typeCode === 5 ? "jump" : entity.typeCode === 6 ? "label" : "unknown";
      const cell = node("button", `sfc-entity ${cls}${p.InitialStep === "1" && entity.typeCode === 0 ? " initial" : ""}`);
      cell.type = "button"; cell.dataset.sfcEntity = `${block.blockIndex}:${entity.entityIndex}`;
      cell.style.left = `${(entity.typeCode === 0 ? 40 : 60) + entity.column * 176}px`; cell.style.top = `${entity.row * 88 + 10}px`;
      cell.setAttribute("aria-label", `${p.InitialStep === "1" && entity.typeCode === 0 ? "Initial step" : sfcEntityName(entity)} ${p.Title || "Unnamed"}, row ${entity.row}, column ${entity.column}`);
      if ([5,6].includes(entity.typeCode)) {
        // Native labels point back toward the spine; jumps point toward their caption.
        const arrow = document.createElementNS(svg.namespaceURI, "svg");
        arrow.classList.add("sfc-symbol"); arrow.setAttribute("viewBox", "0 0 40 16");
        arrow.setAttribute("aria-hidden", "true");
        const shaft = document.createElementNS(svg.namespaceURI, "line");
        shaft.setAttribute("x1", "0"); shaft.setAttribute("y1", "8");
        shaft.setAttribute("x2", "20"); shaft.setAttribute("y2", "8");
        const head = document.createElementNS(svg.namespaceURI, "polygon");
        head.setAttribute("points", entity.typeCode === 6 ? "20,8 36,2 36,14" : "20,2 36,8 20,14");
        arrow.append(shaft, head); cell.append(arrow);
      } else cell.append(node("span", "sfc-symbol"));
      if (entity.typeCode === 2) {
        const action = entity.properties.EntityAction || {};
        cell.append(node("span", "sfc-qualifier", qualifiers[action.Qualifier] || `Q${action.Qualifier ?? "?"}`));
        const previous = byPosition.get(`${entity.row}:${entity.column - 1}`);
        if (action.Time) cell.append(node("span", "sfc-action-time", action.Time));
        if (previous && [0,2].includes(previous.typeCode)) {
          const wire = document.createElementNS(svg.namespaceURI, "line");
          wire.setAttribute("x1", 100 + previous.column * 176); wire.setAttribute("x2", 60 + entity.column * 176);
          wire.setAttribute("y1", 32 + entity.row * 88); wire.setAttribute("y2", 32 + entity.row * 88); svg.append(wire);
        }
      }
      cell.append(node("span", "sfc-title", p.Title || sfcEntityName(entity)));
      if (p.Comment) cell.append(node("span", "sfc-comment", p.Comment));
      const selected = selection?.blockIndex === block.blockIndex && selection?.entityIndex === entity.entityIndex;
      cell.classList.toggle("inspected", selected); cell.setAttribute("aria-pressed", String(selected));
      cell.addEventListener("click", event => selectCell(entity,event.shiftKey));
      if (onTextEdit && sfcTextField(block, entity)) {
        cell.title = "Double-click or Enter to edit text";
        cell.addEventListener("dblclick", event => {
          event.preventDefault(); event.stopPropagation();
          cell.click(); void onTextEdit(block, entity);
        });
      }
      board.append(cell); cells.set(entity.entityIndex,cell);
      if (entity.typeCode === 0 && Array.isArray(block.editableRows)
        && !block.editableRows[entity.row].action && onSequence && onTextEdit) {
        const addAction = node("button", "sfc-new-action", "+ New Action");
        addAction.type = "button";
        const empty = byPosition.get(`${entity.row}:${entity.column + 1}`);
        const target = {...empty, newAction:true}; navigation.push(target);
        addAction.dataset.sfcEntity = `${block.blockIndex}:${empty.entityIndex}`;
        addAction.style.left = `${192 + entity.column * 176}px`;
        addAction.style.top = `${entity.row * 88 + 10}px`;
        addAction.setAttribute("aria-label", `New action for ${p.Title}, row ${entity.row}`);
        addAction.addEventListener("keydown", event => {
          if ((event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) && ["Enter", " "].includes(event.key)) {
            event.preventDefault(); event.stopPropagation();
          }
        });
        addAction.addEventListener("click", event => {
          selectCell(target,event.shiftKey);
          if (event.shiftKey) return;
          void onTextEdit(block, entity, {field:"action", label:"action operand", value:"",
            prompt:"Enter a direct %MX BOOL address for the new N action."});
        });
        board.append(addAction); cells.set(empty.entityIndex,addAction);
      }
    }
    for (const entity of navigation) cellFor(entity)?.addEventListener("focus", () => {
      if (!movingFocus && !drag) selectCell(entity);
    });
    board.addEventListener("focus", event => {
      if (event.target === board && !movingFocus && navigation.length) selectCell(activeEntity || navigation[0]);
    });
    board.addEventListener("click", event => {
      if (!suppressClick) return;
      event.preventDefault(); event.stopImmediatePropagation(); suppressClick = false;
    }, true);
    const pointAt = (x,y,target) => {
      const cell = target?.closest?.("[data-sfc-entity]");
      const entity = cell && navigation.find(e => cellFor(e) === cell);
      if (entity) return entity;
      const rect = board.getBoundingClientRect();
      return {row:Math.max(0,Math.min(lastRow,Math.floor((y - rect.top) / 88))),
        column:Math.max(0,Math.min(lastCol,Math.floor((x - rect.left - 12) / 176)))};
    };
    const updateDrag = () => {
      if (!drag || !board.isConnected) return;
      if (Math.hypot(drag.x - drag.startX,drag.y - drag.startY) > 4) drag.moved = true;
      if (!drag.moved) return;
      extent = pointAt(drag.x,drag.y,document.elementFromPoint(drag.x,drag.y)); paintSelection();
    };
    const scrollDrag = () => {
      if (!drag) return;
      if (!board.isConnected) {
        if (drag.capture.hasPointerCapture(drag.id)) drag.capture.releasePointerCapture(drag.id);
        drag = null; return;
      }
      if (drag.moved) {
        const rect = viewport.getBoundingClientRect();
        const dx = drag.x < rect.left + 24 ? -16 : drag.x > rect.right - 24 ? 16 : 0;
        const dy = drag.y < rect.top + 24 ? -16 : drag.y > rect.bottom - 24 ? 16 : 0;
        viewport.scrollBy(dx,dy); updateDrag();
      }
      drag.frame = requestAnimationFrame(scrollDrag);
    };
    board.addEventListener("pointerdown", event => {
      if (event.button === 2) {
        const entity = navigation.find(e => cellFor(e)?.contains(event.target));
        if (entity && selectedCells().includes(entity)) { event.preventDefault(); focusCell(entity); }
        return;
      }
      if (event.button !== 0 || event.ctrlKey || event.metaKey || event.altKey) return;
      activateBoard();
      const point = pointAt(event.clientX,event.clientY,event.target);
      if (!event.shiftKey || !anchor) anchor = point;
      extent = point; paintSelection();
      drag = {capture:event.target.closest("[data-sfc-entity]") || board,id:event.pointerId,x:event.clientX,y:event.clientY,startX:event.clientX,startY:event.clientY,moved:false};
      event.preventDefault(); drag.capture.setPointerCapture(event.pointerId);
      drag.frame = requestAnimationFrame(scrollDrag);
    });
    board.addEventListener("pointermove", event => {
      if (!drag || event.pointerId !== drag.id) return;
      drag.x = event.clientX; drag.y = event.clientY; updateDrag();
    });
    const finishDrag = event => {
      if (!drag || event.pointerId !== drag.id) return;
      const moved = drag.moved, id = drag.id, capture = drag.capture; cancelAnimationFrame(drag.frame); drag = null;
      if (capture.hasPointerCapture(id)) capture.releasePointerCapture(id);
      if (!board.isConnected) return;
      if (moved) {
        suppressClick = true; setTimeout(() => { suppressClick = false; },0);
        const entity = navigation.find(e => e.row === extent.row && e.column === extent.column);
        if (entity) {
          activeEntity = entity.newAction ? byPosition.get(`${entity.row}:${entity.column - 1}`) : entity;
          onSelect(block,activeEntity);
        }
        focusCell(entity); paintSelection();
      } else {
        const entity = navigation.find(e => e.row === extent.row && e.column === extent.column);
        focusCell(entity);
      }
    };
    board.addEventListener("pointerup",finishDrag);
    board.addEventListener("pointercancel",finishDrag);
    board.addEventListener("lostpointercapture",finishDrag);
    paintSelection();
    let deleting = false;
    board.addEventListener("keydown", async event => {
      if (event.ctrlKey || event.metaKey || event.altKey
        || event.target.closest("input, textarea, select, [contenteditable=true]")) return;
      const cell = event.target.closest(".sfc-entity, .sfc-new-action");
      if (!cell && event.target !== board) return;
      const visible = navigation;
      const origin = event.shiftKey && extent ? extent : cell ? visible.find(e => `${block.blockIndex}:${e.entityIndex}` === cell.dataset.sfcEntity) : extent || activeEntity;
      if (event.shiftKey && !event.key.startsWith("Arrow")) return;
      if (event.key === "Escape") {
        event.preventDefault(); event.stopPropagation();
        const target = cell && visible.find(e => cellFor(e) === cell);
        if (target) selectCell(target); else { anchor = extent = null; paintSelection(); }
        return;
      }
      if (event.key === "Enter" && cell && origin?.newAction) {
        event.preventDefault(); event.stopPropagation();
        if (!event.repeat) cell.click();
        return;
      }
      if (event.key === "Enter" && cell && origin && onTextEdit && sfcTextField(block, origin)) {
        event.preventDefault(); event.stopPropagation();
        if (!event.repeat) { cell.click(); await onTextEdit(block, origin); }
        return;
      }
      if (event.key === "Delete") {
        if (!origin || !Array.isArray(block.editableRows) || !onSequence) return;
        event.preventDefault(); event.stopPropagation();
        if (event.repeat || deleting) return;
        deleting = true;
        try {
          const entities = selectedCells();
          const edit = sfcRowsAfterDelete(block,entities.length ? entities : [origin]);
          if (!edit || await onSequence(block,edit.rows,edit.selectedRow) === false) return;
          const currentBoard = section.isConnected ? board
            : document.querySelector(`.sfc-board[data-sfc-block="${block.blockIndex}"]`);
          const focused = currentBoard?.querySelector(".sfc-entity.inspected") || currentBoard;
          focused?.focus({preventScroll:true});
          focused?.scrollIntoView({block:"nearest",inline:"nearest"});
        } finally { deleting = false; }
        return;
      }
      if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) return;
      event.preventDefault(); event.stopPropagation();
      const vertical = ["ArrowUp", "ArrowDown"].includes(event.key);
      const axis = vertical ? "row" : "column", fixed = vertical ? "column" : "row";
      const direction = ["ArrowUp", "ArrowLeft"].includes(event.key) ? -1 : 1;
      const target = origin ? visible.filter(e => e[fixed] === origin[fixed] && (e[axis] - origin[axis]) * direction > 0)
        .sort((a,b) => (a[axis] - b[axis]) * direction)[0] : visible[0];
      const next = target && board.querySelector(`[data-sfc-entity="${block.blockIndex}:${target.entityIndex}"]`);
      if (next) {
        selectCell(target,event.shiftKey); focusCell(target);
        next.scrollIntoView({block:"nearest",inline:"nearest"});
      } else if (!event.shiftKey && origin) {
        const entity = navigation.find(e => e.row === origin.row && e.column === origin.column);
        if (entity) selectCell(entity);
        else { anchor = extent = origin; paintSelection(); }
      }
    });
    if (positioned.some(e => ![0,1,2,5,6,9,10].includes(e.typeCode))) section.append(node("p", "muted", "This block contains entity kinds whose connections are not decoded. They are shown as read-only placeholders."));
    if (positioned.length !== block.entities.length) section.append(node("p", "muted", "Some entities have coordinates outside the display range. Their XML is preserved."));
    if (!block.entities.length) board.append(node("p", "muted", "This SFC block is empty."));
    viewport.append(board); section.append(viewport,status);
  }
  return section;
}

export function renderSfcProperties(program, selection, onEdit, onSequence, onTextEdit) {
  const section = node("section", "cell-editor sfc-properties");
  const block = program.blocks.find(b => b.blockIndex === selection?.blockIndex);
  const entity = block?.entities.find(e => e.entityIndex === selection?.entityIndex);
  section.append(node("h3", "", entity ? sfcEntityName(entity) : "SFC properties"));
  if (!entity) { section.append(node("p", "muted", "Select a step, transition, label, or jump in the chart.")); return section; }
  const p = sfcEntityProperties(entity);
  section.append(node("p", "muted", `Row ${entity.row} · Column ${entity.column}${p.InitialStep === "1" && entity.typeCode === 0 ? " · Initial step" : ""}`));
  const field = (label, value, multiline, editable, key) => {
    const wrapper = node("label", "property-field"); wrapper.append(node("span", "property-label", label));
    const input = node(multiline ? "textarea" : "input", ""); input.value = value; input.readOnly = !editable;
    input.setAttribute("aria-label", `SFC ${label}`); wrapper.append(input); section.append(wrapper);
    if (editable) {
      const apply = node("button", "primary-button", `Apply ${label.toLowerCase()}`); apply.type = "button"; apply.disabled = true;
      input.addEventListener("input", () => { apply.disabled = input.value === value; });
      apply.addEventListener("click", async () => { apply.disabled = true; try { await onEdit(block, entity, key, value, input.value); }
        finally { if (apply.isConnected) apply.disabled = input.value === value; } });
      section.append(apply);
    }
  };
  const editingSupported = block.languageType === 3 && block.language === 2;
  const linear = Array.isArray(block.editableRows) && Boolean(onSequence);
  const directBool = editingSupported && entity.typeCode === 1 && p.PropertyProgram === "0" && /^%MX\d+$/.test(p.Title || "");
  field(entity.typeCode === 1 ? "Condition" : "Name", p.Title || "", false, directBool || linear, entity.typeCode === 1 ? "condition" : "name");
  if (entity.typeCode === 2) {
    const action = entity.properties.EntityAction || {};
    field("Qualifier", qualifiers[action.Qualifier] || `Native qualifier ${action.Qualifier ?? "unknown"}`, false, false);
    if (action.Time) field("Time", action.Time, false, false);
  }
  if (linear && entity.typeCode === 0) {
    field("Action operand", block.editableRows[entity.row].action || "", false, true, "action");
    const label = node("label", "property-field"); const initial = node("input", ""); initial.type = "checkbox";
    initial.checked = p.InitialStep === "1"; initial.setAttribute("aria-label", "SFC Initial step");
    label.append(initial, node("span", "", "Initial step")); section.append(label);
    const apply = node("button", "primary-button", "Apply initial step"); apply.type = "button"; apply.disabled = true;
    initial.addEventListener("change", () => { apply.disabled = initial.checked === (p.InitialStep === "1"); });
    apply.addEventListener("click", () => onEdit(block, entity, "initial", p.InitialStep, initial.checked ? "1" : "0")); section.append(apply);
  }
  if (linear) {
    const actions = node("div", "sfc-toolbar");
    const command = (title, run, disabled = false) => { const button = node("button", "secondary-button", title); button.type = "button"; button.disabled = disabled; button.addEventListener("click", run); actions.append(button); };
    if (onTextEdit && [0,2].includes(entity.typeCode)) command(block.editableRows[entity.row].action ? "Edit action" : "New action", () => {
      const row = block.editableRows[entity.row];
      return onTextEdit(block, entity, {field:"action",label:"action operand",value:row.action || "",prompt:"Enter a direct %MX BOOL address."});
    });
    if (entity.typeCode === 2) command("Delete action", () => deleteSfcEntity(block, entity, onSequence));
    else {
      for (const [title,delta] of [["Move up",-1],["Move down",1]]) command(title, () => {
        const rows = structuredClone(block.editableRows), index = entity.row, target = index + delta;
        [rows[index],rows[target]] = [rows[target],rows[index]]; return onSequence(block,rows,target);
      }, entity.row + delta < 0 || entity.row + delta >= block.editableRows.length);
      command("Delete row", () => deleteSfcEntity(block, entity, onSequence));
    }
    section.append(actions);
  }
  if ([0,1].includes(entity.typeCode)) field("Comment", p.Comment || "", true, editingSupported && entity.typeCode === 0 && typeof p.Comment === "string", "comment");
  else if (p.Comment) field("Comment", p.Comment, true, false, "comment");
  if (linear) section.append(node("p", "muted", "Step and label names use letters, digits, and underscores (32 characters max). Transitions and action operands use %MX BOOL addresses. Renaming a label updates its jumps; deleting it removes its jumps. An empty action operand removes it."));
  else if (directBool) section.append(node("p", "muted", "Direct BOOL transitions support %MX addresses. Step names and chart structure are read only."));
  else section.append(node("p", "muted", "Names, program references, and chart structure are read only."));
  return section;
}
