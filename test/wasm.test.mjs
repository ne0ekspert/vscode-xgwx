import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import init, {
  parse_xgwx,
  update_xgwx_ladder_cell,
  update_xgwx_program,
  update_xgwx_variable,
} from "../media/libxgwx.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const libraryRoot = process.env.LIBXGWX_DIR || path.resolve(root, "../libxgwx");

test("bundled WASM parses hardware modules from a real fixture", async (context) => {
  const fixture = path.join(libraryRoot, "fixtures/elements.xgwx");
  if (!fs.existsSync(fixture)) {
    context.skip(`libxgwx fixture not found at ${fixture}`);
    return;
  }

  const wasm = fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm"));
  await init({ module_or_path: wasm });
  const summary = parse_xgwx(fs.readFileSync(fixture));

  assert.equal(summary.project.name, "NewPLC");
  assert.equal(summary.counts.modules, 3);
  assert.equal(summary.hardware.modules[0].inputFilter, "Default");
  assert.match(summary.hardware.modules[0].name, /XGI-D24A\/B/);
});

test("bundled WASM rewrites program metadata and a same-length ladder cell", async (context) => {
  const fixture = path.join(libraryRoot, "fixtures/elements.xgwx");
  if (!fs.existsSync(fixture)) {
    context.skip(`libxgwx fixture not found at ${fixture}`);
    return;
  }

  const wasm = fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm"));
  await init({ module_or_path: wasm });
  const source = new Uint8Array(fs.readFileSync(fixture));
  const before = parse_xgwx(source);
  const cell = before.ladder[0].cells.find((item) => item.sourceText === "M00000");
  assert.ok(cell, "fixture exposes an editable ladder cell");

  const metadataBytes = update_xgwx_program(source, 0, {
    name: "EditedProgram",
    task: "Edited task",
    comment: "VS Code program edit",
  });
  const editedBytes = update_xgwx_ladder_cell(metadataBytes, 0, cell.offset, "M00000", "M00042");
  const after = parse_xgwx(editedBytes);

  assert.equal(after.programs[0].name, "EditedProgram");
  assert.equal(after.programs[0].task, "Edited task");
  assert.equal(after.programs[0].comment, "VS Code program edit");
  assert.ok(after.ladder[0].cells.some((item) => item.sourceText === "M00042"));
});

test("bundled WASM rewrites same-length variable fields and its numeric address", async (context) => {
  const fixture = path.join(libraryRoot, "fixtures/elements.xgwx");
  if (!fs.existsSync(fixture)) {
    context.skip(`libxgwx fixture not found at ${fixture}`);
    return;
  }

  const wasm = fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm"));
  await init({ module_or_path: wasm });
  const source = new Uint8Array(fs.readFileSync(fixture));
  const editedBytes = update_xgwx_variable(source, 0, {
    name: "_0000_DI00",
    addressArea: "M",
    addressNumber: 42,
    dataType: "BIT",
    description: "수정 접점 00",
  });
  const after = parse_xgwx(editedBytes);

  assert.equal(after.variables[0].name, "_0000_DI00");
  assert.equal(after.variables[0].address, "M0002A");
  assert.equal(after.variables[0].description, "수정 접점 00");
  assert.equal(after.variables[1].name, "_0000_IN01");
});
