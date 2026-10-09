import {SFC_MAX_COLUMNS,SFC_MAX_ROWS,SFC_MAX_STEPS,sfcRowsFit} from "./sfc-limits.js";
import {captureSfcClipboard,cutSfcClipboard,pasteSfcClipboard} from './sfc-clipboard.js';
import {parseSfcArrayBounds,sfcDeclarationType} from "./sfc-declarations.js";
import { actionGroup, appendAction, compactActions, removeActions, moveAction, moveRowUnit } from "./sfc-actions.js";
import { renderStTextEditor } from "./st-editor.js";
const qualifiers = {1:"N",2:"R",4:"S",8:"L",16:"D",32:"P",64:"SD",128:"DS",256:"SL"};
const names = { 0: "Step", 1: "Transition", 2: "Action", 4: "Branch", 5: "Jump", 6: "Label", 9: "Annotation", 10: "Empty" };
const node = (tag, cls, text = "") => {
  const result = document.createElement(tag); result.className = cls; result.textContent = text; return result;
};
export function sfcEntityName(entity) { return names[entity.typeCode] || `Entity ${entity.typeCode ?? "unknown"}`; }
export function sfcEntityProperties(entity) { return entity.properties.EntityStep || {}; }


export function sfcRowIndex(block, entity) {
  if (!entity || !Array.isArray(block.editableRows)) return -1;
  if(entity.ownerEntityIndex != null) entity=block.entities.find(e=>e.entityIndex === entity.ownerEntityIndex) || entity;
  if (!block.editableRows.some(r => r.position)) return entity.row;
  const column = entity.newAction || [2,9].includes(entity.typeCode) ? entity.column - 1 : entity.column;
  return block.editableRows.findIndex(r => r.position.row === entity.row &&
    (r.position.column === column || r.branchEnd != null && column >= r.position.column && column <= r.branchEnd));
}
const positionedRows = block => structuredClone(block.editableRows).map((r,i) => ({...r,position:r.position || {row:i,column:0}}));
const branchKinds = new Set(["alternative_split","alternative_join","parallel_split","parallel_join"]);
const freshRow = (kind,title,position) => ({kind,title,comment:"",initial:false,action:null,position});
const sortRows = rows => rows.sort((a,b)=>a.position.row-b.position.row || a.position.column-b.position.column);
const uniqueStep = rows => { let i=0; while(rows.some(r=>r.kind === "step" && r.title === `S${i}`)) i++; return `S${i}`; };
export function sfcBranchRegion(block,entity) {
  const index=sfcRowIndex(block,entity),source=block.editableRows?.[index];if(!source?.position)return null;
  const splits=block.editableRows.filter(r=>r.kind.endsWith("_split") && r.position.row<=source.position.row);
  for(const split of splits.reverse()) {
    const join=block.editableRows.find(r=>r.kind===split.kind.replace("_split","_join")&&r.position.row>split.position.row);
    if(join&&source.position.row<=join.position.row&&source.position.column<=split.branchEnd)return {split,join};
  }
  return null;
}
export function sfcAddBranch(block, entity, kind) {
  const region=sfcBranchRegion(block,entity);
  if(region)return region.split.kind===`${kind}_split` ? sfcAddPath(block,{row:region.split.position.row,column:0,typeCode:4}) : null;
  const rows = positionedRows(block), index=sfcRowIndex(block,entity), source=rows[index];
  if(kind === "parallel" && source?.kind === "step") {
    const start=source.position.row,group=actionGroup(rows,index),end=rows[group.at(-1)]?.position.row;
    const previous=[...rows].reverse().find(r=>r.position.column===0 && r.position.row<start && r.kind!=="continuation");
    const next=rows.find(r=>r.position.column===0 && r.position.row===end+1);
    if(source.initial || source.position.column!==0 || previous?.kind!=="transition" || next?.kind!=="transition" || rows.some(r=>r.branchEnd!=null && r.position.row<=start && rows.find(j=>j.kind===r.kind.replace("_split","_join") && j.position.row>r.position.row)?.position.row>=start))return null;
    for(const r of rows)if(r.position.row>=start)r.position.row+=r.position.row<=end?1:2;
    rows.push({...freshRow("parallel_split","",{row:start,column:0}),branchEnd:2},
      {...freshRow("parallel_join","",{row:end+2,column:0}),branchEnd:2},
      freshRow("step",uniqueStep(rows),{row:start+1,column:2}));
    for(let row=start+2;row<=end+1;row++)rows.push(freshRow("continuation","",{row,column:2}));
    return sfcRowsFit(rows) ? sortRows(rows) : null;
  }
  if (!source || source.position.column !== 0 || source.kind !== (kind === "alternative" ? "step" : "transition")) return null;
  const start=source.position.row+1, middle=rows.find(r=>r.position.row === start && r.position.column === 0);
  if (!middle || middle.kind !== (kind === "alternative" ? "transition" : "step") ||
    !rows.some(r=>r.position.row === start+1 && r.position.column === 0 && r.kind === source.kind) ||
    rows.some(r=>r.branchEnd != null && r.position.row === start) ||
    rows.some(r=>r.position.column !== 0 && r.position.row === start)) return null;
  for(const r of rows) if(r.position.row >= start) r.position.row += r === middle ? 1 : 2;
  rows.push({...freshRow(`${kind}_split`,"",{row:start,column:0}),branchEnd:2},
    {...freshRow(`${kind}_join`,"",{row:start+2,column:0}),branchEnd:2},
    freshRow(middle.kind,middle.kind === "step" ? uniqueStep(rows) : "%MX0",{row:start+1,column:2}));
  return sfcRowsFit(rows) ? sortRows(rows) : null;
}
export function sfcAddPath(block, entity) {
  const rows=positionedRows(block), branch=rows[sfcRowIndex(block,entity)];
  if(!branch?.kind.endsWith("_split") || branch.branchEnd+4 > SFC_MAX_COLUMNS) return null;
  const join=rows.find(r=>r.kind === branch.kind.replace("_split","_join") && r.position.row > branch.position.row);
  if(!join) return null;
  const newSteps=rows.filter(r=>r.kind==="step" && r.position.column===0 && r.position.row>branch.position.row && r.position.row<join.position.row).length;
  if(rows.filter(r=>r.kind==="step").length+newSteps>SFC_MAX_STEPS)return null;
  const column=branch.branchEnd+2;
  for(const r of rows.filter(r=>r.position.column === 0 && r.position.row > branch.position.row && r.position.row < join.position.row)) {
    rows.push(freshRow(r.kind,r.kind === "step" ? uniqueStep(rows) : r.kind === "continuation" ? "" : "%MX0",{row:r.position.row,column}));
  }
  branch.branchEnd=join.branchEnd=column;
  return sfcRowsFit(rows) ? sortRows(rows) : null;
}
export function sfcExtendPaths(block, entity, selectedPathOnly = false) {
  const rows=positionedRows(block), selected=rows[sfcRowIndex(block,entity)];
  if(!selected || !["step","transition"].includes(selected.kind)) return null;
  const split=[...rows].reverse().find(r=>r.kind.endsWith("_split") && r.position.row < selected.position.row);
  const join=rows.find(r=>r.kind === split?.kind.replace("_split","_join") && r.position.row > split.position.row);
  if(!split || !join || selected.position.row >= join.position.row) return null;
  let at=selected.position.row+1;
  // Avoid splitting any existing action stack on another path.
  while(at<join.position.row && rows.some(r=>r.position.row === at && r.kind === "continuation")) at++;
  const predecessors=new Map();
  for(let column=0;column<=split.branchEnd;column+=2) {
    const last=[...rows].reverse().find(r=>r.position.column===column && r.position.row<at && r.position.row>split.position.row && ["step","transition"].includes(r.kind));
    if(!last)return null;
    predecessors.set(column,last.kind);
  }
  for(const r of rows) if(r.position.row >= at) r.position.row += 2;
  for(let column=0;column<=split.branchEnd;column+=2) for(let offset=0;offset<2;offset++) {
    const last=predecessors.get(column),kind=selectedPathOnly && column!==selected.position.column ? "continuation" : offset===0 ? last==="step" ? "transition" : "step" : last;
    rows.push(freshRow(kind,kind === "step" ? uniqueStep(rows) : kind === "transition" ? "%MX0" : "",{row:at+offset,column}));
  }
  return sfcRowsFit(rows) ? sortRows(rows) : null;
}
export function sfcRemovePathPair(block, entity) {
  const rows=positionedRows(block),selected=rows[sfcRowIndex(block,entity)];
  if(!selected || !["step","transition"].includes(selected.kind))return null;
  const split=[...rows].reverse().find(r=>r.kind.endsWith("_split") && r.position.row<selected.position.row);
  const join=rows.find(r=>r.kind===split?.kind.replace("_split","_join") && r.position.row>split.position.row);
  if(!split || !join || selected.position.row>=join.position.row)return null;
  const lane=rows.filter(r=>r.position.column===selected.position.column && r.position.row>split.position.row && r.position.row<join.position.row && ["step","transition"].includes(r.kind));
  const index=lane.indexOf(selected),start=index%2 ? index : index-1;
  if(start<1 || !lane[start+1])return null;
  const removed=new Set([lane[start],lane[start+1]]),previous=lane[start-1];
  for(const row of [...removed])if(row.kind==="step")for(const child of actionGroup(rows,rows.indexOf(row)))removed.add(rows[child]);
  const result=compactActions(rows.map(r=>removed.has(r)?freshRow("continuation","",r.position):r));
  return {rows:result,selectedRow:result.findIndex(r=>r.title===previous.title && r.kind===previous.kind && r.position.column===previous.position.column)};
}
export function sfcCollapseBranch(block, entity) {
  let rows=positionedRows(block), boundary=rows[sfcRowIndex(block,entity)];
  if(!branchKinds.has(boundary?.kind)) return null;
  const split=boundary.kind.endsWith("_split") ? boundary : [...rows].reverse().find(r=>r.kind === boundary.kind.replace("_join","_split") && r.position.row < boundary.position.row);
  const join=rows.find(r=>r.kind === split?.kind.replace("_split","_join") && r.position.row > split.position.row);
  if(!split || !join) return null;
  const start=split.position.row,end=join.position.row;
  rows=rows.filter(r=>r !== split && r !== join && !(r.position.column > 0 && r.position.row > start && r.position.row < end));
  for(const r of rows) r.position.row -= Number(r.position.row > start)+Number(r.position.row > end);
  if(!rows.some(r=>r.branchEnd != null)) rows.forEach(r=>{delete r.position;});
  return compactActions(rows);
}

export function sfcRowsAfterEdit(block, entity, field, replacement) {
  const rows = structuredClone(block.editableRows), index=sfcRowIndex(block,entity), row = rows[index];
  if(field === "action" && entity.appendAction) {
    const value={action:replacement.operand || null,...(replacement.kind === "program" ? {actionCode:rows.find(r=>r.action === replacement.operand && r.actionCode != null)?.actionCode ?? "(* Action program *)"} : {}),
      ...(replacement.qualifier !== "N" ? {actionQualifier:replacement.qualifier} : {}),...(replacement.time ? {actionTime:replacement.time} : {})};
    return appendAction(rows,index,value)?.rows || rows;
  }
  if (field === "actionCode" || field === "transitionCode") {
    const name = field === "actionCode" ? row.action : row.title;
    for (const r of rows) if ((field === "actionCode" ? r.action : r.title) === name && r[field] !== undefined) r[field] = replacement;
  } else if (field === "initial") {
    if (replacement === "1") rows.forEach(r => { r.initial = false; });
    row.initial = replacement === "1";
  } else if (field === "action" || entity.typeCode === 2) {
    row.action = (typeof replacement === "object" ? replacement.operand : replacement) || null;
    if (!row.action) return removeActions(block.editableRows,[index]);
    else if (typeof replacement === "object") {
      if (replacement.kind === "program") row.actionCode = rows.find((r,i)=>i !== index && r.action === row.action && r.actionCode != null)?.actionCode ?? row.actionCode ?? "(* Action program *)";
      else delete row.actionCode;
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
  if (p.PropertyProgram === "1") return {field:entity.typeCode === 2 ? "actionCode" : "transitionCode"};
  const operand = [1,2].includes(entity.typeCode);
  return { field: entity.typeCode === 1 ? "condition" : entity.typeCode === 2 ? "action" : "name",
    label: entity.typeCode === 1 ? "transition condition" : entity.typeCode === 2 ? "action operand" : `${sfcEntityName(entity).toLowerCase()} name`,
    value: p.Title || "", prompt: operand ? `Enter a %MX address or a declared BOOL variable.${entity.typeCode === 2 ? " Leave empty to remove the action." : ""}`
      : entity.typeCode === 5 ? "Enter an existing label name." : "Enter a unique name using letters, digits, or underscores (32 characters max)." };
}

export function sfcSelectionBounds(anchor, extent) {
  return {top:Math.min(anchor.row,extent.row),bottom:Math.max(anchor.row,extent.row),
    left:Math.min(anchor.column,extent.column),right:Math.max(anchor.column,extent.column)};
}
export function sfcRowsAfterDelete(block, entities) {
  const real=entities.filter(e=>!e.newAction&&!e.newBranch);
  if(real.length && real.every(e=>e.typeCode === 2)) {
    const indices=real.map(e=>sfcRowIndex(block,e)),owner=actionGroup(block.editableRows,indices[0])[0];
    const rows=removeActions(block.editableRows,indices);
    return {rows,selectedRow:Math.max(0,Math.min(owner,rows.length-1))};
  }
  if (block.editableRows?.some(r => r.position)) {
    const actual=entities.filter(e=>!e.newAction&&!e.newBranch);
    if(actual.some(e=>e.typeCode !== 2) && actual.length !== 1) return null;
    const boundary = entities.find(e=>e.typeCode === 4);
    if(boundary) { const rows=sfcCollapseBranch(block,boundary); return rows && {rows,selectedRow:Math.max(0,rows.findIndex(r=>(r.position?.row ?? rows.indexOf(r)) >= boundary.row-1))}; }
    const rows=positionedRows(block), actionOnly=entities.filter(e=>e.typeCode === 2);
    if(actionOnly.length && entities.every(e=>e.typeCode === 2 || e.newAction)) {
      for(const e of actionOnly) { const r=rows[sfcRowIndex(block,e)]; r.action=null; delete r.actionQualifier;delete r.actionTime;delete r.actionCode; }
      return {rows,selectedRow:sfcRowIndex(block,actionOnly[0])};
    }
    // A path is a unit: deleting a node inside a branch removes that path,
    // preserving the other lanes and a matched split/join.
    const selected=entities.find(e=>[0,1].includes(e.typeCode));
    if(selected) {
      const split=[...rows].reverse().find(r=>r.kind.endsWith("_split") && r.position.row < selected.row);
      const join=rows.find(r=>r.kind === split?.kind.replace("_split","_join") && r.position.row > split.position.row);
      if(split && selected.row < join.position.row) {
        if(split.branchEnd === 2) {
          const keep=selected.column === 0 ? rows.filter(r=>!(r.position.column === 0 && r.position.row > split.position.row && r.position.row < join.position.row)) : rows;
          if(selected.column === 0) for(const r of keep) if(r.position.column === 2 && r.position.row > split.position.row && r.position.row < join.position.row) r.position.column=0;
          const synthetic={...block,editableRows:keep};
          const collapsed=sfcCollapseBranch(synthetic,{typeCode:4,row:split.position.row,column:0});
          return collapsed && {rows:collapsed,selectedRow:Math.max(0,collapsed.findIndex(r=>r.kind === "step"))};
        }
        let kept=rows.filter(r=>!(r.position.column === selected.column && r.position.row > split.position.row && r.position.row < join.position.row));
        for(const r of kept) if(r.position.column > selected.column && r.position.row > split.position.row && r.position.row < join.position.row) r.position.column -= 2;
        split.branchEnd -= 2; join.branchEnd -= 2;
        return {rows:kept,selectedRow:kept.indexOf(split)};
      }
    }
    return null;
  }
  const actual = entities.filter(e => !e.newAction && [0,1,2,5,6].includes(e.typeCode));
  if (!actual.length) return null;
  const removedRows = new Set(actual.filter(e => e.typeCode !== 2).map(e => e.row));
  for(const index of [...removedRows]) if(block.editableRows[index]?.kind === "step") for(const child of actionGroup(block.editableRows,index)) removedRows.add(child);
  const removedLabels = new Set([...removedRows].filter(r => block.editableRows[r].kind === "label")
    .map(r => block.editableRows[r].title));
  const removedInitial = [...removedRows].some(r => block.editableRows[r].initial);
  const rows = structuredClone(block.editableRows);
  for (const entity of actual.filter(e => e.typeCode === 2)) {
    const row = rows[sfcRowIndex(block,entity)]; row.action = null; delete row.actionQualifier; delete row.actionTime; delete row.actionCode;
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

export function renderSfcDiagram(program, selection, onSelect, onSequence, onTextEdit, editorState = {}) {
  const section = node("section", "sfc-editor");
  section.append(node("p", "muted", "Select an entity to inspect its properties. Arrow keys navigate; drag or Shift+Arrow selects a rectangle. Delete removes selected rows or actions; inside a branch it removes one selected path. Double-click or Enter edits text. Ctrl/Cmd+C, X, and V copy, cut, and paste; chart copies include whole rows and step actions."));
  const selections = new Map();
  const clipboard = editorState.clipboard || {};
  if (editorState.drafts) {
    const prefix = `${editorState.fileKey || ""}:${program.programIndex}:`, valid = new Set();
    for (const b of program.blocks) for (const r of b.editableRows || []) {
      if (r.actionCode != null) valid.add(`${prefix}${b.blockIndex}:actionCode:${r.action}`);
      if (r.transitionCode != null) valid.add(`${prefix}${b.blockIndex}:transitionCode:${r.title}`);
    }
    for (const key of editorState.drafts.keys()) if (key.startsWith(prefix) && !valid.has(key)) editorState.drafts.delete(key);
  }
  for (const block of program.blocks.filter(b => b.main || b.language !== 4)) {
    section.append(node("h3", "sfc-block-title", `${block.name || "Unnamed block"}${block.main ? " · Main" : ""}`));
    let activeEntity = block.entities.find(e => e.entityIndex === selection?.entityIndex && block.blockIndex === selection?.blockIndex);
    if (Array.isArray(block.editableRows) && onSequence) {
      const toolbar = node("div", "sfc-toolbar");
      const add = (title, run, disabled = false) => {
        const button = node("button", "secondary-button", title); button.type = "button"; button.disabled = disabled;
        button.addEventListener("click", async () => { button.disabled = true; try { await run(); } finally { if (button.isConnected) button.disabled = disabled; } }); toolbar.append(button);
      };
      const unique = (prefix, rows, kind) => { let i = 0; while (rows.some(r => r.kind === kind && r.title === `${prefix}${i}`)) i++; return `${prefix}${i}`; };
      const branched = block.editableRows.some(r=>r.position);
      if (!branched) for (const kind of ["step", "transition", "label", "jump"]) add(`Add ${kind}`, () => {
        const rows = structuredClone(block.editableRows);
        const title = kind === "step" ? unique("S", rows, kind) : kind === "label" ? unique("Label", rows, kind)
          : kind === "jump" ? rows.find(r => r.kind === "label").title : "%MX0";
        const group=activeEntity ? actionGroup(rows,sfcRowIndex(block,activeEntity)) : [];
        const index = group.length ? group.at(-1)+1 : activeEntity ? activeEntity.row+1 : rows.length;
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
    const workspace = node("div", "sfc-program-workspace");
    const sourcePanel = node("div", "sfc-source-panel"); sourcePanel.hidden = true;
    const drafts = editorState.drafts || new Map(); let sourceKey;
    const showSource = entity => {
      const row = block.editableRows?.[sfcRowIndex(block,entity)];
      const key = entity?.typeCode === 1 ? "transitionCode" : [0,2].includes(entity?.typeCode) ? "actionCode" : null;
      if (!key || row?.[key] == null) { sourcePanel.hidden = true; sourceKey = null; workspace.classList.remove("has-source"); return; }
      const name = key === "actionCode" ? row.action : row.title;
      const identity = `${editorState.fileKey || ""}:${program.programIndex}:${block.blockIndex}:${key}:${name}`;
      if (sourceKey === identity) { sourcePanel.hidden = false; workspace.classList.add("has-source"); return; }
      sourceKey = identity;
      const stored = drafts.get(identity), draft = stored?.source === row[key] ? stored.value : row[key];
      const editor = renderStTextEditor({name,source:row[key],draft,transition:key === "transitionCode",
        variables:[...(editorState.globalVariables || []),...(program.variables || [])].filter(v=>typeof v.name === "string" && v.name).map(v=>({...v,displayType:sfcDeclarationType(v),call:sfcFunctionBlocks[v.dataType]})),
        onChange:value=>drafts.set(identity,{source:row[key],value}),
        onApply:value=>onSequence(block,sfcRowsAfterEdit(block,entity,key,value),sfcRowIndex(block,entity),key === "actionCode"),
      });
      sourcePanel.replaceChildren(editor); sourcePanel.hidden = false; workspace.classList.add("has-source");
    };
    const viewport = node("div", "sfc-viewport");
    const board = node("div", "sfc-board");
    board.setAttribute("role", "group"); board.setAttribute("aria-label", `SFC ${block.name}`);
    board.tabIndex = 0; board.dataset.sfcBlock = String(block.blockIndex);
    const rowLimit = SFC_MAX_ROWS, columnLimit = SFC_MAX_COLUMNS;
    const positioned = block.entities.filter(e => Number.isInteger(e.row) && e.row >= 0 && e.row < rowLimit
      && Number.isInteger(e.column) && e.column >= 0 && e.column < columnLimit);
    const lastRow = positioned.reduce((last, e) => Math.max(last, e.row), 0);
    const lastCol = positioned.reduce((last, e) => Math.max(last, e.column), 1);
    board.style.width = `${Math.max(640, (lastCol + 3) * 176)}px`;
    board.style.height = `${Math.max(280, (lastRow + 2) * 88)}px`;
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.classList.add("sfc-wires"); svg.setAttribute("width", "100%"); svg.setAttribute("height", "100%");
    svg.setAttribute("aria-hidden", "true"); board.append(svg);
    // Connect adjacent native step/transition entities only; infer no unknown branch topology.
    const byPosition = new Map(positioned.map(e => [`${e.row}:${e.column}`, e]));
    const firstStepColumn=new Map();for(const e of positioned)if(e.typeCode===0)firstStepColumn.set(e.row,Math.min(firstStepColumn.get(e.row) ?? e.column,e.column));
    for (const e of positioned.filter(e => [0,1,5,6,7].includes(e.typeCode))) {
      const next = byPosition.get(`${e.row + 1}:${e.column}`);
      if (!next || ![0,1,5,6,7].includes(next.typeCode) || e.typeCode === 5) continue;
      const line = document.createElementNS(svg.namespaceURI, "line");
      const x = 100 + e.column * 176;
      line.setAttribute("x1", x); line.setAttribute("x2", x);
      line.setAttribute("y1", 32 + e.row * 88); line.setAttribute("y2", 32 + next.row * 88);
      svg.append(line);
    }
    const branches = block.editableRows?.filter(r=>r.branchEnd != null) || [];
    for(const branch of branches) {
      const {row,column}=branch.position, end=branch.branchEnd, parallel=branch.kind.startsWith("parallel");
      for(const dy of parallel ? [-3,3] : [0]) {
        const line=document.createElementNS(svg.namespaceURI,"line");
        line.setAttribute("x1",100+column*176);line.setAttribute("x2",100+end*176);
        line.setAttribute("y1",32+row*88+dy);line.setAttribute("y2",32+row*88+dy);svg.append(line);
      }
      const join=branch.kind.endsWith("_join");
      for(let c=column;c<=end;c+=2) {
        const next=byPosition.get(`${row+(join?-1:1)}:${c}`);
        if(next) { const line=document.createElementNS(svg.namespaceURI,"line"); const x=100+c*176;
          line.setAttribute("x1",x);line.setAttribute("x2",x);line.setAttribute("y1",32+row*88);line.setAttribute("y2",32+next.row*88);svg.append(line); }
      }
      const main=byPosition.get(`${row+(join?1:-1)}:${column}`);
      if(main) { const line=document.createElementNS(svg.namespaceURI,"line");const x=100+column*176;
        line.setAttribute("x1",x);line.setAttribute("x2",x);line.setAttribute("y1",32+row*88);line.setAttribute("y2",32+main.row*88);svg.append(line); }
    }
    const navigation = positioned.filter(e => ![7,8,9,10].includes(e.typeCode));
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
      const selectedSteps=new Set(navigation.filter(e=>e.typeCode===0 && selected.has(e.entityIndex)).map(e=>String(e.entityIndex)));
      if(extent?.ownerEntityIndex!=null)selectedSteps.add(String(extent.ownerEntityIndex));
      for(const control of board.querySelectorAll(".sfc-row-affordance"))control.classList.toggle("row-selected",selectedSteps.has(control.dataset.ownerEntity) || control.dataset.branchRow!=null && navigation.some(e=>e.typeCode===0 && selected.has(e.entityIndex) && String(e.row)===control.dataset.branchRow));
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
      activeEntity = entity.newAction || entity.newBranch ? block.entities.find(e=>e.entityIndex===entity.ownerEntityIndex) || byPosition.get(`${entity.row}:${entity.column - 1}`) : entity;
      showSource(activeEntity); onSelect(block,activeEntity); paintSelection();
    };
    const focusCell = entity => {
      movingFocus = true;
      try { (entity?.entityIndex != null ? cellFor(entity) : board)?.focus({preventScroll:true}); }
      finally { movingFocus = false; }
    };
    const labels = new Set();
    for (const entity of positioned) {
      if ([7,8,9,10].includes(entity.typeCode)) continue;
      if (!labels.has(entity.row)) {
        const row = node("span", "sfc-row", `L${entity.row}`); row.style.top = `${entity.row * 88 + 22}px`;
        board.append(row); labels.add(entity.row);
        const grid = document.createElementNS(svg.namespaceURI, "line");
        grid.classList.add("sfc-grid-line"); grid.setAttribute("x1", 0); grid.setAttribute("x2", "100%");
        grid.setAttribute("y1", (entity.row + 1) * 88); grid.setAttribute("y2", (entity.row + 1) * 88); svg.append(grid);
      }
      const p = sfcEntityProperties(entity);
      const branchType = Number(entity.properties.EntityBranch?.BranchType);
      const branchLabel = `${branchType < 2 ? "Alternative" : "Simultaneous"} ${branchType % 2 ? "join" : "split"}`;
      const cls = entity.typeCode === 0 ? "step" : entity.typeCode === 1 ? "transition" : entity.typeCode === 2 ? "action"
        : entity.typeCode === 5 ? "jump" : entity.typeCode === 6 ? "label" : entity.typeCode === 4 ? "branch" : "unknown";
      const cell = node("button", `sfc-entity ${cls}${p.InitialStep === "1" && entity.typeCode === 0 ? " initial" : ""}`);
      cell.type = "button"; cell.dataset.sfcEntity = `${block.blockIndex}:${entity.entityIndex}`;
      cell.style.left = `${(entity.typeCode === 0 ? 40 : entity.typeCode === 4 ? 90 : 60) + entity.column * 176}px`; cell.style.top = `${entity.row * 88 + 10}px`;
      cell.setAttribute("aria-label", `${entity.typeCode === 4 ? branchLabel : p.InitialStep === "1" && entity.typeCode === 0 ? "Initial step" : sfcEntityName(entity)} ${entity.typeCode === 4 ? "" : p.Title || "Unnamed"}, row ${entity.row}, column ${entity.column}`);
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
        const upper=byPosition.get(`${entity.row-1}:${entity.column}`);
        if(upper?.typeCode === 2 && previous?.typeCode === 7) {
          const wire=document.createElementNS(svg.namespaceURI,"line");const x=72+entity.column*176;
          wire.setAttribute("x1",x);wire.setAttribute("x2",x);wire.setAttribute("y1",54+upper.row*88);wire.setAttribute("y2",10+entity.row*88);svg.append(wire);
        }
        if (previous && [0,2].includes(previous.typeCode)) {
          const wire = document.createElementNS(svg.namespaceURI, "line");
          wire.setAttribute("x1", 100 + previous.column * 176); wire.setAttribute("x2", 60 + entity.column * 176);
          wire.setAttribute("y1", 32 + entity.row * 88); wire.setAttribute("y2", 32 + entity.row * 88); svg.append(wire);
        }
      }
      if(entity.typeCode !== 4) cell.append(node("span", "sfc-title", p.Title || sfcEntityName(entity)));
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
        && onSequence && onTextEdit) {
        const addAction = node("button", "sfc-new-action sfc-row-affordance", "+ New Action");
        addAction.type = "button";
        const empty = byPosition.get(`${entity.row}:${entity.column + 1}`),index=sfcRowIndex(block,entity),group=actionGroup(block.editableRows,index);
        const filled=group.filter(i=>block.editableRows[i].action),last=filled.length ? block.editableRows[filled.at(-1)] : null;
        const lastRow=last?.position?.row ?? (filled.at(-1) ?? entity.row),append=Boolean(last);
        const target = {...empty, entityIndex:append ? -1-entity.entityIndex : empty.entityIndex,
          row:append ? lastRow+0.75 : entity.row,newAction:true,ownerEntityIndex:entity.entityIndex,appendAction:append}; navigation.push(target);
        addAction.dataset.ownerEntity=String(entity.entityIndex);
        addAction.dataset.hoverRows = `${entity.row} ${lastRow}`;
        addAction.dataset.sfcEntity = `${block.blockIndex}:${target.entityIndex}`;
        addAction.style.left = `${192 + entity.column * 176}px`;
        addAction.style.top = `${append ? lastRow*88+70 : entity.row * 88 + 10}px`;
        if(append) addAction.classList.add("additional");
        addAction.setAttribute("aria-label", `New action for ${p.Title}, row ${entity.row}`);
        addAction.addEventListener("keydown", event => {
          if ((event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) && ["Enter", " "].includes(event.key)) {
            event.preventDefault(); event.stopPropagation();
          }
        });
        addAction.addEventListener("click", event => {
          selectCell(target,event.shiftKey);
          if (event.shiftKey) return;
          void onTextEdit(block, append ? {...entity,appendAction:true} : entity, {field:"action", label:"action operand", value:"",
            prompt:"Enter a direct %MX BOOL address for the new N action."});
        });
        board.append(addAction); cells.set(target.entityIndex,addAction);
        const region=sfcBranchRegion(block,entity),parallelRegion=region?.split.kind==="parallel_split";
        if(parallelRegion ? entity.column===firstStepColumn.get(entity.row) : entity.column===0 && !region) {
          const branch=node("button","sfc-new-branch sfc-row-affordance","+ Add simultaneous branch");branch.type="button";
          branch.dataset.ownerEntity=String(entity.entityIndex);
          branch.dataset.hoverRows=String(entity.row);branch.style.left=`${parallelRegion ? 40+(region.split.branchEnd+2)*176 : 392+entity.column*176}px`;branch.style.top=`${entity.row*88+10}px`;
          branch.setAttribute("aria-label",parallelRegion ? `Add simultaneous path, row ${entity.row}` : `Add simultaneous branch before ${p.Title}, row ${entity.row}`);
          if(parallelRegion)branch.dataset.branchRow=String(entity.row);
          branch.disabled=!sfcAddBranch(block,entity,"parallel");
          if(branch.disabled)branch.title=parallelRegion ? "Native limits: 512 ordinary steps and 65,535 columns; editor safety limit: 1,048,576 grid cells." : entity.properties.EntityStep?.InitialStep==="1" ? "An initial step cannot be inside a branch." : "This step needs preceding and following transitions.";
          const branchTarget={entityIndex:-2000000000-entity.entityIndex,row:entity.row,column:parallelRegion ? region.split.branchEnd+2 : entity.column+2,newBranch:true,ownerEntityIndex:entity.entityIndex};
          if(!branch.disabled){navigation.push(branchTarget);branch.dataset.sfcEntity=`${block.blockIndex}:${branchTarget.entityIndex}`;cells.set(branchTarget.entityIndex,branch);}
          branch.addEventListener("click",async event=>{
            if(event.shiftKey)return;
            const rows=sfcAddBranch(block,entity,"parallel");if(!rows)return;
            branch.disabled=true;try {await onSequence(block,rows,parallelRegion ? rows.findIndex(r=>r.position.column===region.split.branchEnd+2 && r.kind==="step") : rows.findIndex(r=>r.kind==="parallel_split"&&r.position.row===entity.row));}
            finally {if(branch.isConnected)branch.disabled=!sfcAddBranch(block,entity,"parallel");}
          });board.append(branch);
        }

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
    let lastHoverRow;
    const hoverRow=row=>{
      if(lastHoverRow===row)return;lastHoverRow=row;
      for(const control of board.querySelectorAll(".sfc-row-affordance"))control.classList.toggle("row-hover",control.dataset.hoverRows.split(" ").includes(String(row)));
    };
    board.addEventListener("pointerleave",()=>hoverRow(-1));
    board.addEventListener("pointermove", event => {
      hoverRow(Math.floor((event.clientY-board.getBoundingClientRect().top)/88));
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
          activeEntity = entity.newAction || entity.newBranch ? block.entities.find(e=>e.entityIndex===entity.ownerEntityIndex) || byPosition.get(`${entity.row}:${entity.column - 1}`) : entity;
          showSource(activeEntity); onSelect(block,activeEntity);
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
    let transferring = false;
    const clipboardOperation = async operation => {
      if (transferring) return;
      transferring = true;
      try {
        if (!onSequence || !Array.isArray(block.editableRows)) throw new Error("This chart is read-only.");
        if (operation === "paste") {
          const index = sfcRowIndex(block,extent || activeEntity);
          const edit = pasteSfcClipboard(block,clipboard.value,index,program.blocks.map(b=>b.name).concat((program.variables || []).map(v=>v.name)));
          await onSequence(block,edit.rows,edit.selectedRow,edit.action);
        } else {
          const entities = selectedCells().filter(e=>!e.newAction&&!e.newBranch);
          const captured = captureSfcClipboard(block,entities.map(e=>sfcRowIndex(block,e)),entities.length>0 && entities.every(e=>e.typeCode===2));
          if (operation === "cut") {
            const edit = cutSfcClipboard(block,captured);
            if (await onSequence(block,edit.rows,edit.selectedRow) === false) return;
          }
          clipboard.value = captured;
          status.textContent = `${operation === "cut" ? "Cut" : "Copied"} ${captured.kind === "actions" ? captured.actions.length+" action(s)" : captured.rowCount+" whole row(s)"}.`;
        }
      } catch(error) { status.textContent = error.message || String(error); }
      finally {
        transferring = false;
        if (operation !== "copy") requestAnimationFrame(()=>{
          const currentBoard=document.querySelector(`.sfc-board[data-sfc-block="${block.blockIndex}"]`);
          (currentBoard?.querySelector(".sfc-entity.inspected") || currentBoard)?.focus({preventScroll:true});
        });
      }
    };
    let deleting = false;
    board.addEventListener("keydown", async event => {
      if (event.target.closest("input, textarea, select, [contenteditable=true]")) return;
      if ((event.ctrlKey || event.metaKey) && !event.altKey && !event.shiftKey && ["c","x","v"].includes(event.key.toLowerCase())) {
        event.preventDefault();event.stopPropagation();
        if (!event.repeat) await clipboardOperation({c:"copy",x:"cut",v:"paste"}[event.key.toLowerCase()]);
        return;
      }
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      const cell = event.target.closest(".sfc-entity, .sfc-new-action, .sfc-new-branch");
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
      if (event.key === "Enter" && cell && (origin?.newAction || origin?.newBranch)) {
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
          if (!edit) { if(block.editableRows.some(r=>r.position)) status.textContent="Select one path, a split/join, or action boxes to delete."; return; }
          if (await onSequence(block,edit.rows,edit.selectedRow) === false) return;
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
      let target = origin ? visible.filter(e => e[fixed] === origin[fixed] && (e[axis] - origin[axis]) * direction > 0)
        .sort((a,b) => (a[axis] - b[axis]) * direction)[0] : visible[0];
      if (!target && origin && event.key === "ArrowLeft" && !event.shiftKey) {
        const owner=actionGroup(block.editableRows || [],sfcRowIndex(block,origin))[0],p=block.editableRows?.[owner]?.position || {row:owner,column:0};
        target=visible.find(e=>e.typeCode===0 && e.row===p.row && e.column===p.column);
      }
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
    if (!Array.isArray(block.editableRows) && positioned.some(e=>e.typeCode === 4)) section.append(node("p","muted","This branch layout has unsupported topology or properties. Structural editing is disabled."));
    if (positioned.some(e => ![0,1,2,4,5,6,7,8,9,10].includes(e.typeCode))) section.append(node("p", "muted", "This block contains entity kinds whose connections are not decoded. They are shown as read-only placeholders."));
    if (positioned.length !== block.entities.length) section.append(node("p", "muted", "Some entities have coordinates outside the display range. Their XML is preserved."));
    if (!block.entities.length) board.append(node("p", "muted", "This SFC block is empty."));
    viewport.append(board); workspace.append(viewport,sourcePanel); showSource(activeEntity); section.append(workspace,status);
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
  if(entity.typeCode === 4) {
    const type=Number(entity.properties.EntityBranch?.BranchType);
    section.append(node("p","muted",`${type < 2 ? "Alternative" : "Simultaneous"} ${type % 2 ? "join" : "split"}. Alternative paths use left-to-right priority; simultaneous paths activate together and synchronize at the join.`));
  }
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
  if(entity.typeCode !== 4) field(entity.typeCode === 1 ? "Condition" : "Name", p.Title || "", false, directBool || linear, entity.typeCode === 1 ? "condition" : "name");
  if (linear && [0,1,2].includes(entity.typeCode)) {
    const row = block.editableRows[sfcRowIndex(block,entity)], action = entity.typeCode !== 1;
    const key = action ? "actionCode" : "transitionCode", code = row[key];
    const mode = node("button", "secondary-button", code !== undefined && code !== null ? "Use Boolean variable" : `Create ST ${action ? "action" : "transition"}`);
    mode.type = "button"; mode.addEventListener("click", () => {
      const rows = structuredClone(block.editableRows), target = rows[sfcRowIndex(block,entity)];
      if (code !== undefined && code !== null) { delete target[key]; if (action) target.action = "%MX0"; else target.title = "%MX0"; }
      else {
        let i = 0, prefix = action ? "Action" : "Transition";
        const names = new Set(program.blocks.map(b => b.name));
        while (names.has(`${prefix}${i}`)) i++;
        if (action) target.action = `${prefix}${i}`; else target.title = `${prefix}${i}`;
        target[key] = action ? "(* Action program *)" : "TRANS := FALSE;";
      }
      return onSequence(block,rows,sfcRowIndex(block,entity),action);
    }); section.append(mode);
    if (code !== undefined && code !== null) {
      const open = node("button", "secondary-button", "Edit ST source"); open.type = "button";
      open.addEventListener("click",()=>document.querySelector("[data-sfc-st-source]")?.focus());
      section.append(open,node("p", "muted", action ? "N actions run each active scan; P actions run once on activation." : "Assign a Boolean expression to TRANS in the text editor."));
    }
  }
  if (entity.typeCode === 2) {
    const action = entity.properties.EntityAction || {};
    field("Qualifier", qualifiers[action.Qualifier] || `Native qualifier ${action.Qualifier ?? "unknown"}`, false, false);
    if (action.Time) field("Time", action.Time, false, false);
  }
  if (linear && entity.typeCode === 0) {
    field("Action operand", block.editableRows[sfcRowIndex(block,entity)].action || "", false, true, "action");
    const label = node("label", "property-field"); const initial = node("input", ""); initial.type = "checkbox";
    initial.checked = p.InitialStep === "1"; initial.setAttribute("aria-label", "SFC Initial step");
    initial.disabled = block.editableRows.some(split=>split.kind.endsWith("_split") && split.position.row < entity.row &&
      block.editableRows.find(join=>join.kind === split.kind.replace("_split","_join") && join.position.row > split.position.row)?.position.row > entity.row);
    if(initial.disabled) initial.title="Initial steps must be on the main path outside a branch.";
    label.append(initial, node("span", "", "Initial step")); section.append(label);
    const apply = node("button", "primary-button", "Apply initial step"); apply.type = "button"; apply.disabled = true;
    initial.addEventListener("change", () => { apply.disabled = initial.checked === (p.InitialStep === "1"); });
    apply.addEventListener("click", () => onEdit(block, entity, "initial", p.InitialStep, initial.checked ? "1" : "0")); section.append(apply);
  }
  if (linear) {
    const actions = node("div", "sfc-toolbar");
    const command = (title, run, disabled = false) => { const button = node("button", "secondary-button", title); button.type = "button"; button.disabled = disabled; button.addEventListener("click", run); actions.append(button); };
    const row=block.editableRows[sfcRowIndex(block,entity)];
    const removePair=sfcRemovePathPair(block,entity);
    if(removePair) command("Remove path pair",()=>{const edit=sfcRemovePathPair(block,entity);return edit && onSequence(block,edit.rows,edit.selectedRow);});
    if(sfcExtendPaths(block,entity,true)) command("Extend selected path",()=>{const rows=sfcExtendPaths(block,entity,true);return onSequence(block,rows,rows.findIndex(r=>r.position.row > entity.row && r.position.column === entity.column && r.kind === (row.kind === "step" ? "transition" : "step")));});
    if(sfcExtendPaths(block,entity)) command("Extend paths",()=>{const rows=sfcExtendPaths(block,entity);return onSequence(block,rows,rows.findIndex(r=>r.position.row > entity.row && r.position.column === entity.column && r.kind === (row.kind === "step" ? "transition" : "step")));});
    if(row?.kind.endsWith("_split")) command("Add path",()=>{const rows=sfcAddPath(block,entity);return rows && onSequence(block,rows,rows.findIndex(r=>r.position.row === entity.row && r.branchEnd != null));},!sfcAddPath(block,entity));
    if(row && branchKinds.has(row.kind)) command("Remove branch",()=>{const rows=sfcCollapseBranch(block,entity);return rows && onSequence(block,rows,0);});
    if(entity.typeCode===2) for(const [title,delta] of [["Move action up",-1],["Move action down",1]]) {
      command(title,()=>{const edit=moveAction(block.editableRows,sfcRowIndex(block,entity),delta);return edit && onSequence(block,edit.rows,edit.index,true);},!moveAction(block.editableRows,sfcRowIndex(block,entity),delta));
    }
    if (onTextEdit && [0,2].includes(entity.typeCode)) command(block.editableRows[sfcRowIndex(block,entity)].action ? "Edit action" : "New action", () => {
      const row = block.editableRows[sfcRowIndex(block,entity)];
      return onTextEdit(block, entity, {field:"action",label:"action operand",value:row.action || "",prompt:"Enter a %MX address or a declared BOOL variable."});
    });
    if (entity.typeCode !== 2 && !block.editableRows.some(r=>r.position)) {
      for (const [title,delta] of [["Move up",-1],["Move down",1]]) command(title, () => {
        const edit=moveRowUnit(block.editableRows,entity.row,delta);return edit && onSequence(block,edit.rows,edit.index);
      },!moveRowUnit(block.editableRows,entity.row,delta));
      command("Delete row", () => deleteSfcEntity(block, entity, onSequence));
    }
    section.append(actions);
  }
  if ([0,1].includes(entity.typeCode)) field("Comment", p.Comment || "", true, editingSupported && entity.typeCode === 0 && typeof p.Comment === "string", "comment");
  else if (p.Comment) field("Comment", p.Comment, true, false, "comment");
  if (linear) section.append(node("p", "muted", "Step and label names use letters, digits, and underscores (32 characters max). Boolean transitions and actions use %MX addresses or declared BOOL variables; ST programs use declared variables and function blocks. Renaming a label updates its jumps; deleting it removes its jumps. An empty action operand removes it."));
  else if (directBool) section.append(node("p", "muted", "Direct BOOL transitions support %MX addresses. Step names and chart structure are read only."));
  else section.append(node("p", "muted", "Names, program references, and chart structure are read only."));
  return section;
}

export const sfcVariableTypes = ["BOOL","BYTE","WORD","DWORD","LWORD","SINT","INT","DINT","LINT","USINT","UINT","UDINT","ULINT","REAL","LREAL","TIME","DATE","TIME_OF_DAY","DATE_AND_TIME","STRING"];
export const sfcFunctionBlocks = {
  TON: "IN := TRUE, PT := T#2s", TOF: "IN := TRUE, PT := T#2s", TP: "IN := TRUE, PT := T#2s",
  CTU_DINT: "CU := TRUE, R := FALSE, PV := 10", CTD_DINT: "CD := TRUE, LD := FALSE, PV := 10",
  CTUD_DINT: "CU := TRUE, CD := FALSE, R := FALSE, LD := FALSE, PV := 10",
  R_TRIG: "CLK := TRUE", F_TRIG: "CLK := TRUE", RS: "S := TRUE, R_1 := FALSE", SR: "S_1 := TRUE, R := FALSE",
};
export function renderSfcVariables(program, onEdit) {
  const section=node("section","cell-editor sfc-variables");section.append(node("h3","","Program variables"));
  if(program.variablesError){section.append(node("p","muted",program.variablesError));return section;}
  const list=node("div","sfc-variable-list"),form=node("form","sfc-variable-form");let editing=null;
  const input=(label,placeholder="")=>{const result=node("input","");result.setAttribute("aria-label",`SFC variable ${label}`);result.placeholder=placeholder;return result;};
  const labeled=(label,control)=>{const item=node("label","sfc-declaration-field");item.append(node("span","",label),control);return item;};
  const name=input("name","Variable or instance name");name.required=true;name.maxLength=32;
  const type=node("select","");type.setAttribute("aria-label","SFC variable type");
  for(const [label,types]of [["Variables",sfcVariableTypes],["Function blocks",Object.keys(sfcFunctionBlocks)]]){
    const group=document.createElement("optgroup");group.label=label;
    for(const value of types){const option=node("option","",value);option.value=value;group.append(option);}type.append(group);
  }
  const bounds=input("array bounds","0..3 or 0..1, 0..2"),initial=input("initial value","Literal, for example 7, T#2s or 'Ready'");initial.maxLength=255;
  const retain=input("retain");retain.type="checkbox";
  const description=input("description","Description");description.maxLength=255;
  const error=node("p","sfc-declaration-error");error.setAttribute("role","alert");error.hidden=true;
  const add=node("button","primary-button","Add declaration");add.type="submit";
  const cancel=node("button","secondary-button","Cancel editing");cancel.type="button";cancel.hidden=true;
  const shape=()=>{const fb=Boolean(sfcFunctionBlocks[type.value]);bounds.disabled=fb||type.value==="STRING";initial.disabled=fb;
    if(bounds.disabled)bounds.value="";if(initial.disabled)initial.value="";
    initial.placeholder=type.value==="STRING" ? "Quoted ASCII string, up to 32 bytes" : "Literal, for example 7 or T#2s";
  };
  const reset=()=>{editing=null;form.reset();name.readOnly=false;add.textContent="Add declaration";cancel.hidden=true;error.hidden=true;shape();};
  type.addEventListener("change",shape);cancel.addEventListener("click",reset);
  for(const variable of program.variables || []){
    const item=node("div","sfc-variable-row");item.append(node("code","",`${variable.name} : ${sfcDeclarationType(variable)}`));
    if(variable.declaration?.initialValue)item.append(node("span","muted",`:= ${variable.declaration.initialValue}`));
    if(variable.declaration?.retain)item.append(node("span","muted","Retain"));
    if(variable.description)item.append(node("span","muted",variable.description));
    if(variable.system)item.append(node("span","muted","SFC system"));
    else {
      if(sfcVariableTypes.includes(variable.dataType)||sfcFunctionBlocks[variable.dataType]){
        const edit=node("button","secondary-button","Edit");edit.type="button";edit.setAttribute("aria-label",`Edit variable ${variable.name}`);
        edit.addEventListener("click",()=>{editing=variable;name.value=variable.name;name.readOnly=true;type.value=variable.dataType;
          bounds.value=(variable.declaration?.dimensions||[]).map(d=>`${d.lower}..${d.upper}`).join(', ');
          initial.value=variable.declaration?.initialValue||"";retain.checked=Boolean(variable.declaration?.retain);description.value=variable.description||"";
          add.textContent="Apply declaration";cancel.hidden=false;error.hidden=true;shape();form.scrollIntoView({block:"nearest"});type.focus();});item.append(edit);
      }
      const remove=node("button","secondary-button","Remove");remove.type="button";remove.setAttribute("aria-label",`Remove variable ${variable.name}`);
      remove.addEventListener("click",()=>onEdit({...variable,remove:true}));item.append(remove);
    }list.append(item);
  }
  form.append(labeled("Name",name),labeled("Type",type),labeled("Array bounds (optional)",bounds),labeled("Initial value (optional)",initial),labeled("Retain between restarts",retain),labeled("Description",description),error,add,cancel);
  form.addEventListener("submit",async event=>{event.preventDefault();error.hidden=true;add.disabled=true;
    try {
      const dimensions=bounds.disabled?[]:parseSfcArrayBounds(bounds.value);
      const result=await onEdit({name:name.value.trim(),dataType:type.value,description:description.value,remove:false,update:Boolean(editing),
        declaration:{dimensions,initialValue:initial.disabled?"":initial.value.trim(),retain:retain.checked}});
      if(result!==false && form.isConnected)reset();
    }catch(e){error.textContent=String(e.message||e);error.hidden=false;}
    finally{if(add.isConnected)add.disabled=false;}
  });
  shape();section.append(form,list,node("p","muted","Declarations are shared by the chart’s action and transition programs. TRANS is the Boolean transition result. STRING holds 32 bytes. Referenced variables keep their type and array bounds."));return section;
}
