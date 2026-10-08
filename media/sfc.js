const names = { 0: "Step", 1: "Transition", 2: "Action", 5: "Jump", 6: "Label", 9: "Annotation", 10: "Empty" };
const node = (tag, cls, text = "") => {
  const result = document.createElement(tag); result.className = cls; result.textContent = text; return result;
};
export function sfcEntityName(entity) { return names[entity.typeCode] || `Entity ${entity.typeCode ?? "unknown"}`; }
export function sfcEntityProperties(entity) { return entity.properties.EntityStep || {}; }

export function renderSfcDiagram(program, selection, onSelect) {
  const section = node("section", "sfc-editor");
  section.append(node("p", "muted", "Select a step or transition to inspect its properties. Use Tab and Enter to select with the keyboard."));
  for (const block of program.blocks) {
    section.append(node("h3", "sfc-block-title", `${block.name || "Unnamed block"}${block.main ? " · Main" : ""}`));
    const viewport = node("div", "sfc-viewport");
    const board = node("div", "sfc-board");
    board.setAttribute("role", "group"); board.setAttribute("aria-label", `SFC ${block.name}`);
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
        cell.append(node("span", "sfc-qualifier", action.Qualifier === "1" ? "N" : `Q${action.Qualifier ?? "?"}`));
        const previous = byPosition.get(`${entity.row}:${entity.column - 1}`);
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
      cell.addEventListener("click", () => {
        section.querySelectorAll(".sfc-entity").forEach(other => { other.classList.remove("inspected"); other.setAttribute("aria-pressed", "false"); });
        cell.classList.add("inspected"); cell.setAttribute("aria-pressed", "true");
        onSelect(block, entity);
      });
      board.append(cell);
    }
    if (positioned.some(e => ![0,1,2,5,6,9,10].includes(e.typeCode))) section.append(node("p", "muted", "This block contains entity kinds whose connections are not decoded. They are shown as read-only placeholders."));
    if (positioned.length !== block.entities.length) section.append(node("p", "muted", "Some entities have coordinates outside the display range. Their XML is preserved."));
    if (!block.entities.length) board.append(node("p", "muted", "This SFC block is empty."));
    viewport.append(board); section.append(viewport);
  }
  return section;
}

export function renderSfcProperties(program, selection, onEdit) {
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
  const directBool = editingSupported && entity.typeCode === 1 && p.PropertyProgram === "0" && /^%MX\d+$/.test(p.Title || "");
  field(entity.typeCode === 1 ? "Condition" : "Name", p.Title || "", false, directBool, "condition");
  if (entity.typeCode === 2) {
    const action = entity.properties.EntityAction || {};
    field("Qualifier", action.Qualifier === "1" ? "N (Non stored)" : `Native qualifier ${action.Qualifier ?? "unknown"}`, false, false);
    if (action.Time) field("Time", action.Time, false, false);
  }
  if ([0,1].includes(entity.typeCode)) field("Comment", p.Comment || "", true, editingSupported && entity.typeCode === 0 && typeof p.Comment === "string", "comment");
  else if (p.Comment) field("Comment", p.Comment, true, false, "comment");
  if (directBool) section.append(node("p", "muted", "Direct BOOL transitions support %MX addresses. Step names and chart structure are read only."));
  else section.append(node("p", "muted", "Names, program references, and chart structure are read only."));
  return section;
}
