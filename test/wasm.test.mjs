import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import init, {
  delete_xgwx_module,
  parse_xgwx,
  select_xgwx_module,
  set_xgwx_module_option,
  update_xgwx_ladder_cell,
  update_xgwx_program,
  update_xgwx_variable,
  xgk_module_catalog,
  xgwx_module_option_values,
} from "../media/libxgwx.js";
import { hardwareSlotRows } from "../media/hardware-slots.js";
import { groupModuleOptions } from "../media/module-option-groups.js";

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

test("bundled WASM edits catalog-backed module dropdown options", async (context) => {
  const fixture = path.join(libraryRoot, "fixtures/elements-io.xgwx");
  if (!fs.existsSync(fixture)) {
    context.skip(`libxgwx fixture not found at ${fixture}`);
    return;
  }

  const wasm = fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm"));
  await init({ module_or_path: wasm });
  const source = new Uint8Array(fs.readFileSync(fixture));
  const selected = select_xgwx_module(source, 0, 2, "XGF-AD8A");
  const edited = set_xgwx_module_option(selected, 0, 2, "inputRange", 5, 6);
  const values = xgwx_module_option_values(edited, 0, 2);

  assert.equal(values.find((item) => item.key === "inputRange" && item.index === 5)?.value, 6);
  assert.equal(values.find((item) => item.key === "inputRange" && item.index === 4)?.value, 0);
  const catalog = xgk_module_catalog();
  assert.ok(catalog.find((entry) => entry.model === "XGF-AD8A")?.options.length > 0);
});

test("bundled WASM exposes and edits both DT4A output groups", async (context) => {
  const fixture = path.join(libraryRoot, "fixtures/elements-io.xgwx");
  if (!fs.existsSync(fixture)) {
    context.skip(`libxgwx fixture not found at ${fixture}`);
    return;
  }

  const wasm = fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm"));
  await init({ module_or_path: wasm });
  const dt4a = xgk_module_catalog().find((entry) => entry.model === "XGH-DT4A");
  assert.ok(dt4a.visibleOptions.some((option) => option.key === "emergencyOutput"));
  assert.ok(dt4a.options.some((option) => option.key === "emergencyOutput"));

  const source = new Uint8Array(fs.readFileSync(fixture));
  let edited = select_xgwx_module(source, 0, 2, "XGH-DT4A");
  edited = set_xgwx_module_option(edited, 0, 2, "emergencyOutput", 0, 1);
  edited = set_xgwx_module_option(edited, 0, 2, "emergencyOutput", 1, 1);
  const module = parse_xgwx(edited).hardware.modules.find((item) => item.base === 0 && item.slot === 2);
  assert.equal(module.details, "00000C0000000000");
});

test("bundled AH6A options form separate input and output channel groups", async () => {
  const wasm = fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm"));
  await init({ module_or_path: wasm });
  const ah6a = xgk_module_catalog().find((entry) => entry.model === "XGF-AH6A");
  const groups = groupModuleOptions(ah6a.visibleOptions);
  const channelGroups = groups.filter((group) => group.channelIndex !== null);

  assert.equal(channelGroups.filter((group) => group.section === "input").length, 4);
  assert.equal(channelGroups.filter((group) => group.section === "output").length, 2);
  assert.deepEqual(
    channelGroups.find((group) => group.section === "input" && group.channelIndex === 0)
      .items.map(({ option }) => option.key),
    [
      "input.channelOperation",
      "input.inputRange",
      "input.dataType",
      "input.averageProcessing",
      "input.averageValue",
    ],
  );
});

test("bundled catalog treats TC4UD as occupying two physical slots", async (context) => {
  const denseFixture = path.join(libraryRoot, "fixtures/elements-io.xgwx");
  const sparseFixture = path.join(libraryRoot, "fixtures/elements.xgwx");
  if (!fs.existsSync(denseFixture) || !fs.existsSync(sparseFixture)) {
    context.skip("libxgwx fixtures not found");
    return;
  }

  const wasm = fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm"));
  await init({ module_or_path: wasm });
  const tc4ud = xgk_module_catalog().find((entry) => entry.model === "XGF-TC4UD");
  assert.equal(tc4ud.slotSpan, 2);

  const sparse = new Uint8Array(fs.readFileSync(sparseFixture));
  const selected = parse_xgwx(select_xgwx_module(sparse, 0, 2, "XGF-TC4UD"));
  assert.match(selected.hardware.modules.find((module) => module.slot === 2).name, /XGF-TC4UD/);
  const selectedBase = selected.hardware.bases.find((base) => base.base === 0);
  const selectedModules = selected.hardware.modules.filter((module) => module.base === 0);
  const rows = hardwareSlotRows(0, selectedBase.slotCount, selectedModules, (module) => {
    return xgk_module_catalog().find((entry) => entry.id === module.id && entry.subType === module.subType)?.slotSpan || 1;
  });
  assert.equal(rows.length, selectedBase.slotCount);
  assert.equal(rows[2].kind, "module");
  assert.equal(rows[3].kind, "continuation");

  const dense = new Uint8Array(fs.readFileSync(denseFixture));
  assert.throws(
    () => select_xgwx_module(dense, 0, 7, "XGF-TC4UD"),
    /occupies 2 slots.*overlaps.*slot 8/,
  );
});

test("bundled catalog exposes RY1A and RY2A/B emergency outputs", async (context) => {
  const fixture = path.join(libraryRoot, "fixtures/elements-io.xgwx");
  if (!fs.existsSync(fixture)) {
    context.skip(`libxgwx fixture not found at ${fixture}`);
    return;
  }

  const wasm = fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm"));
  await init({ module_or_path: wasm });
  const catalog = xgk_module_catalog();
  assert.equal(catalog.find((entry) => entry.model === "XGQ-RY1A").options.find((option) => option.key === "emergencyOutput").count, 1);
  assert.equal(catalog.find((entry) => entry.model === "XGQ-RY2A/B").options.find((option) => option.key === "emergencyOutput").count, 2);

  let edited = new Uint8Array(fs.readFileSync(fixture));
  edited = set_xgwx_module_option(edited, 1, 0, "emergencyOutput", 0, 1);
  edited = set_xgwx_module_option(edited, 1, 1, "emergencyOutput", 0, 1);
  edited = set_xgwx_module_option(edited, 1, 1, "emergencyOutput", 1, 1);
  const modules = parse_xgwx(edited).hardware.modules;
  assert.equal(modules.find((module) => module.base === 1 && module.slot === 0).details, "0000010000000000");
  assert.equal(modules.find((module) => module.base === 1 && module.slot === 1).details, "0000030000000000");
});

test("bundled catalog exposes DL16A nested file and data options", async () => {
  const wasm = fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm"));
  await init({ module_or_path: wasm });
  const dl16a = xgk_module_catalog().find((entry) => entry.model === "XGF-DL16A");
  const fileName = dl16a.visibleOptions.find((option) => option.key === "fileConfiguration.fileName");
  const dataType = dl16a.visibleOptions.find((option) => option.key === "dataDefinitions.type");

  assert.equal(fileName.scope, "file");
  assert.equal(fileName.count, 8);
  assert.equal(fileName.defaultValue, "FILE{slot}");
  assert.equal(dataType.scope, "fileData");
  assert.equal(dataType.count, 8 * 32);
  assert.equal(dataType.itemsPerParent, 32);
  assert.equal(dataType.choices.length, 18);
});

test("bundled catalog exposes every audited channel instance", async () => {
  const wasm = fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm"));
  await init({ module_or_path: wasm });
  const catalog = xgk_module_catalog();

  for (const [model, key, count] of [
    ["XGF-AD4S", "inputRange", 4],
    ["XGF-AH6A", "input.averageProcessing", 4],
    ["XGF-DV4S", "powerLossOutput", 4],
    ["XGF-RD8A", "sensorType", 8],
    ["XGF-TC4SB", "inputRange", 4],
  ]) {
    const option = catalog.find((entry) => entry.model === model).visibleOptions.find((item) => item.key === key);
    assert.equal(option.scope, "channel", `${model}:${key}`);
    assert.equal(option.count, count, `${model}:${key}`);
  }

  for (const [model, key] of [
    ["XGF-HD2A", "outputStateSetting"],
    ["XGF-HO2A", "outputStateSetting"],
    ["XGF-DA4S", "dssOutput"],
    ["XGF-TC4SB", "conversionSpeed"],
  ]) {
    const option = catalog.find((entry) => entry.model === model).visibleOptions.find((item) => item.key === key);
    assert.equal(option.scope, "module", `${model}:${key}`);
    assert.equal(option.count, 1, `${model}:${key}`);
  }
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

test("bundled WASM clears multiple ladder cell contents without shifting topology", async (context) => {
  const fixture = path.join(libraryRoot, "fixtures/elements.xgwx");
  if (!fs.existsSync(fixture)) {
    context.skip(`libxgwx fixture not found at ${fixture}`);
    return;
  }

  const wasm = fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm"));
  await init({ module_or_path: wasm });
  let bytes = new Uint8Array(fs.readFileSync(fixture));
  const before = parse_xgwx(bytes);
  const cells = before.ladder[0].cells.filter((cell) => cell.sourceText !== null).slice(0, 2);
  for (const cell of cells) {
    bytes = update_xgwx_ladder_cell(
      bytes,
      0,
      cell.offset,
      cell.sourceText,
      " ".repeat(cell.sourceText.length),
    );
  }
  const after = parse_xgwx(bytes);

  assert.equal(after.ladder[0].cells.some((cell) => cell.sourceText === "M00000"), false);
  assert.equal(after.ladder[0].cells.some((cell) => cell.sourceText === "M00001"), false);
  assert.equal(
    after.ladder[0].cells.find((cell) => cell.sourceText === "M00002")?.offset,
    before.ladder[0].cells.find((cell) => cell.sourceText === "M00002")?.offset,
  );
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

test("bundled WASM selects a module from the XG5000 catalog", async (context) => {
  const fixture = path.join(libraryRoot, "fixtures/elements-io.xgwx");
  if (!fs.existsSync(fixture)) {
    context.skip(`libxgwx fixture not found at ${fixture}`);
    return;
  }

  const wasm = fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm"));
  await init({ module_or_path: wasm });
  const catalog = xgk_module_catalog();
  assert.equal(catalog.length, 90);
  const rd8a = catalog.find((entry) => entry.model === "XGF-RD8A");
  assert.ok(rd8a, "RD8A is present in the bundled catalog");

  const source = new Uint8Array(fs.readFileSync(fixture));
  const before = parse_xgwx(source);
  const original = before.hardware.modules.find((module) => module.base === 0 && module.slot === 2);
  assert.ok(original, "fixture exposes base 0 slot 2");

  const editedBytes = select_xgwx_module(source, 0, 2, rd8a.model);
  const after = parse_xgwx(editedBytes);
  const selected = after.hardware.modules.find((module) => module.base === 0 && module.slot === 2);
  assert.equal(selected.id, rd8a.id);
  assert.equal(selected.subType, rd8a.subType);
  assert.equal(selected.name, rd8a.name);
  assert.equal(selected.details, rd8a.details);
  assert.equal(selected.comment, original.comment);
});

test("bundled WASM deletes one hardware module", async (context) => {
  const fixture = path.join(libraryRoot, "fixtures/elements-io.xgwx");
  if (!fs.existsSync(fixture)) {
    context.skip(`libxgwx fixture not found at ${fixture}`);
    return;
  }

  const wasm = fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm"));
  await init({ module_or_path: wasm });
  const source = new Uint8Array(fs.readFileSync(fixture));
  const before = parse_xgwx(source);
  const after = parse_xgwx(delete_xgwx_module(source, 0, 2));

  assert.equal(after.hardware.modules.length, before.hardware.modules.length - 1);
  assert.equal(after.hardware.modules.some((module) => module.base === 0 && module.slot === 2), false);
  const base = after.hardware.bases.find((item) => item.base === 0);
  const rows = hardwareSlotRows(0, base.slotCount, after.hardware.modules.filter((module) => module.base === 0), () => 1);
  assert.equal(rows.length, base.slotCount);
  assert.equal(rows[2].kind, "empty");
  assert.throws(() => delete_xgwx_module(source, 99, 99), /was not found/);
});
