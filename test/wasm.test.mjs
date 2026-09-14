import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import init, {
  cpu_catalog,
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

test("bundled WASM allows XGK CPU changes and rejects cross-family conversion", async (context) => {
  const fixture = path.join(libraryRoot, "fixtures/elements.xgwx");
  if (!fs.existsSync(fixture)) {
    context.skip(`libxgwx fixture not found at ${fixture}`);
    return;
  }

  const wasm = fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm"));
  await init({ module_or_path: wasm });
  const catalog = cpu_catalog();
  assert.equal(catalog.find((entry) => entry.model === "XGK-CPUSN")?.typeCode, 17);
  assert.equal(catalog.find((entry) => entry.model === "XGB-XBMS")?.typeCode, 2);

  const source = new Uint8Array(fs.readFileSync(fixture));
  const before = parse_xgwx(source);
  assert.equal(before.cpu.model, "XGK-CPUSN");
  assert.equal(before.cpu.typeCode, 17);

  const edited = parse_xgwx(select_xgwx_cpu(source, "XGK-CPUHN"));
  assert.equal(edited.cpu.model, "XGK-CPUHN");
  assert.equal(edited.cpu.typeCode, 16);
  assert.throws(() => select_xgwx_cpu(source, "XGB-XBMS"), /migration/);
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

test("bundled WASM exposes and edits XGF high-speed-counter options", async (context) => {
  const fixture = path.join(libraryRoot, "fixtures/elements-io.xgwx");
  if (!fs.existsSync(fixture)) {
    context.skip(`libxgwx fixture not found at ${fixture}`);
    return;
  }

  const wasm = fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm"));
  await init({ module_or_path: wasm });
  const catalog = xgk_module_catalog();
  assert.deepEqual(
    catalog
      .find((entry) => entry.model === "XGF-HO2A")
      .options.map((option) => option.key),
    [
      "counterMode",
      "pulseInputMode",
      "compareOutput0Mode",
      "compareOutput1Mode",
      "outputStateSetting",
      "auxiliaryFunctionMode",
    ],
  );
  assert.equal(
    catalog
      .find((entry) => entry.model === "XGF-HD2A")
      .options.find((option) => option.key === "pulseInputMode").count,
    2,
  );
  assert.equal(
    catalog
      .find((entry) => entry.model === "XGF-HO8A")
      .options.find((option) => option.key === "pulseInputLevel").count,
    8,
  );

  let edited = new Uint8Array(fs.readFileSync(fixture));
  edited = set_xgwx_module_option(edited, 1, 8, "auxiliaryFunctionMode", 1, 6);
  edited = set_xgwx_module_option(edited, 1, 9, "pulseInputMode", 1, 5);
  edited = set_xgwx_module_option(edited, 1, 10, "inputFilter", 2, 3);
  edited = set_xgwx_module_option(edited, 1, 10, "pulseInputLevel", 7, 1);

  const modules = parse_xgwx(edited).hardware.modules;
  const details = (slot) => modules.find((module) => module.base === 1 && module.slot === slot).details;
  assert.equal(details(8).slice(344, 352), "06000000");
  assert.equal(details(9).slice(208, 216), "05000000");
  assert.equal(details(10).slice(26, 28), "03");
  assert.equal(details(10).slice(56, 58), "80");
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

test("bundled WASM inserts, replaces and removes actual linear ladder records", async () => {
  await init({ module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm")) });
  let bytes = new Uint8Array(fs.readFileSync(path.join(libraryRoot, "fixtures/ladder-edit/linear.xgwx")));
  assert.equal(parse_xgwx(bytes).ladder[0].structuralEditing, true);
  const element = { kind: "NormallyClosed", operand: "M42" };
  bytes = edit_xgwx_ladder_cell(bytes, 0, { rawY: 0, column: 2, expected: null, replacement: element });
  assert.ok(parse_xgwx(bytes).ladder[0].cells.some(cell => cell.sourceText === "M42" && cell.contact === "NC"));
  assert.throws(() => edit_xgwx_ladder_cell(bytes, 0, { rawY: 0, column: 2, expected: null, replacement: element }), /changed/);
  bytes = edit_xgwx_ladder_cell(bytes, 0, { rawY: 0, column: 2, expected: element, replacement: null });
  assert.equal(parse_xgwx(bytes).ladder[0].cells.some(cell => cell.rawX === 7 && cell.rawY === 0), false);
  assert.throws(() => edit_xgwx_ladder_cell(bytes, 0, { rawY: 4, column: 9, expected: null, replacement: element }), /column|instruction/);
  const complex = new Uint8Array(fs.readFileSync(path.join(libraryRoot, "fixtures/elements.xgwx")));
  assert.equal(parse_xgwx(complex).ladder[0].structuralEditing, true);
  assert.throws(() => edit_xgwx_ladder_cell(complex, 0, { rawY: 0, column: 2, expected: null, replacement: element }), /comment/);
});

test("bundled WASM inserts every additional program-inspector element kind", async () => {
  await init({ module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm")) });
  const source = new Uint8Array(fs.readFileSync(path.join(libraryRoot, "fixtures/ladder-edit/empty.xgwx")));
  const cases = [
    ["AddressedRisingPulse", "M1", 2, "contact", "P_CONTACT"],
    ["AddressedRisingPulseNot", "M1", 2, "contact", "P_NOT_CONTACT"],
    ["AddressedFallingPulse", "M1", 2, "contact", "N_CONTACT"],
    ["AddressedFallingPulseNot", "M1", 2, "contact", "N_NOT_CONTACT"],
    ["Inverse", "", 2, "contact", "INV"],
    ["RisingPulse", "", 2, "contact", "PUP"],
    ["FallingPulse", "", 2, "contact", "PDN"],
    ["InverseOutput", "M2", 9, "coil", "Inverse"],
    ["RisingPulseOutput", "M2", 9, "coil", "P_COIL"],
    ["FallingPulseOutput", "M2", 9, "coil", "N_COIL"],
  ];

  for (const [kind, operand, column, field, decodedKind] of cases) {
    const bytes = edit_xgwx_ladder_cell(source, 0, {
      rawY: 0,
      column,
      expected: null,
      replacement: { kind, operand },
    });
    const cell = parse_xgwx(bytes).ladder[0].cells.find((item) => (
      item.rawY === 0 && item.rawX === (column === 9 ? 94 : 1 + column * 3)
    ));
    assert.equal(cell?.[field], decodedKind, kind);
  }
});

test("bundled WASM edits and creates rung and output comments", async () => {
  await init({ module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm")) });
  const source = new Uint8Array(fs.readFileSync(path.join(libraryRoot, "fixtures/elements.xgwx")));
  let bytes = edit_xgwx_ladder_comment(source, 0, {
    kind: "Rung",
    rawY: 0,
    expected: "렁 설명문 1",
    replacement: "Edited rung comment",
  });
  bytes = edit_xgwx_ladder_comment(bytes, 0, {
    kind: "Output",
    rawY: 4,
    expected: "출력 설명문 1",
    replacement: "Edited output comment",
  });
  const edited = parse_xgwx(bytes).ladder[0];
  assert.equal(edited.rungComments[0].text, "Edited rung comment");
  assert.equal(edited.outputComments[0].text, "Edited output comment");
  assert.throws(() => edit_xgwx_ladder_comment(bytes, 0, {
    kind: "Output", rawY: 4, expected: "stale", replacement: "Rejected",
  }), /changed/);

  const empty = new Uint8Array(fs.readFileSync(path.join(libraryRoot, "fixtures/ladder-edit/empty.xgwx")));
  const rung = parse_xgwx(edit_xgwx_ladder_comment(empty, 0, {
    kind: "Rung", rawY: 0, expected: null, replacement: "Created rung comment",
  })).ladder[0];
  assert.equal(rung.rungComments[0].text, "Created rung comment");
  const output = parse_xgwx(edit_xgwx_ladder_comment(empty, 0, {
    kind: "Output", rawY: 0, expected: null, replacement: "Created output comment",
  })).ladder[0];
  assert.equal(output.outputComments[0].text, "Created output comment");
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
  const deleted = delete_xgwx_module(source, 0, 2);
  const after = parse_xgwx(deleted);

  assert.equal(after.hardware.modules.length, before.hardware.modules.length - 1);
  assert.equal(after.hardware.modules.some((module) => module.base === 0 && module.slot === 2), false);
  const base = after.hardware.bases.find((item) => item.base === 0);
  const rows = hardwareSlotRows(0, base.slotCount, after.hardware.modules.filter((module) => module.base === 0), () => 1);
  assert.equal(rows.length, base.slotCount);
  assert.equal(rows[2].kind, "empty");
  const reinserted = parse_xgwx(insert_xgwx_module(deleted, 0, 2, "XGF-RD8A"));
  const rd8a = xgk_module_catalog().find((entry) => entry.model === "XGF-RD8A");
  assert.equal(reinserted.hardware.modules.length, before.hardware.modules.length);
  assert.equal(
    reinserted.hardware.modules.find((module) => module.base === 0 && module.slot === 2)?.id,
    rd8a.id,
  );
  assert.throws(() => insert_xgwx_module(source, 0, 2, "XGF-RD8A"), /overlaps/);
  assert.throws(() => delete_xgwx_module(source, 99, 99), /was not found/);
});

test("bundled WASM synchronizes captured network-module configurations", async (context) => {
  const fixture = path.join(libraryRoot, "fixtures/elements-io.xgwx");
  if (!fs.existsSync(fixture)) {
    context.skip(`libxgwx fixture not found at ${fixture}`);
    return;
  }

  const wasm = fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm"));
  await init({ module_or_path: wasm });
  const source = new Uint8Array(fs.readFileSync(fixture));
  const networked = parse_xgwx(select_xgwx_module(source, 0, 2, "XGL-EDMF"));
  assert.ok(networked.networks.some((network) => network.modules.some((module) => (
    module.base === 0 && module.slot === 2 && module.id === 23072
  ))));
  const fdenet = networked.xgpd.find((config) => (
    config.typeCode === 23072 && config.base === 0 && config.slot === 2
  ));
  assert.equal(fdenet?.kind, "XGPD_CONFIG_INFO_FDENET");
  assert.equal(fdenet?.attributes.find((attribute) => attribute.name === "Media")?.value, "6");
  assert.equal(fdenet?.attributes.find((attribute) => attribute.name === "Master")?.value, "0");

  for (const [model, id, kind] of [
    ["XGL-EDMT", 23072, "XGPD_CONFIG_INFO_FDENET"],
    ["XGL-DMEA/B", 23056, "XGPD_CONFIG_INFO_DNET"],
    ["XGL-RMEA/B", 23088, "XGPD_CONFIG_INFO_RNET"],
  ]) {
    const selected = parse_xgwx(select_xgwx_module(source, 0, 2, model));
    assert.equal(selected.xgpd.find((config) => config.typeCode === id)?.kind, kind);
  }

  for (const [model, id] of [["XGL-EFMT(B)", 23041], ["XGL-EIPT", 23064], ["XGL-BIPT", 23152]]) {
    const selected = parse_xgwx(select_xgwx_module(source, 0, 2, model));
    assert.ok(selected.networks.some((network) => network.modules.some((module) => (
      module.base === 0 && module.slot === 2 && module.id === id
    ))), `${model} should create a network module`);
    if (model === "XGL-EFMT(B)") {
      const fenet = selected.fenet.find((config) => config.typeCode === id);
      assert.equal(fenet?.ipAddress, "192.168.0.100");
      assert.equal(fenet?.gateway, "192.168.0.1");
    }
  }

  const cleared = parse_xgwx(select_xgwx_module(
    select_xgwx_module(source, 0, 2, "XGL-EDMF"),
    0,
    2,
    "XGF-AD8A",
  ));
  assert.equal(cleared.networks.some((network) => network.modules.some((module) => (
    module.base === 0 && module.slot === 2
  ))), false);
});

test("bundled WASM edits network and network-module metadata", async (context) => {
  const fixture = path.join(libraryRoot, "fixtures/elements-io.xgwx");
  if (!fs.existsSync(fixture)) {
    context.skip(`libxgwx fixture not found at ${fixture}`);
    return;
  }

  const wasm = fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm"));
  await init({ module_or_path: wasm });
  let edited = select_xgwx_module(new Uint8Array(fs.readFileSync(fixture)), 0, 2, "XGL-EDMF");
  edited = update_xgwx_network(edited, 0, {
    name: "Field network",
    typeName: "Ethernet",
    networkType: "FEnet",
  });
  edited = update_xgwx_network_module(edited, 0, 2, {
    configName: "PLC-1",
    alias: "Uplink",
    description: "Plant Ethernet",
  });

  const network = parse_xgwx(edited).networks[0];
  const module = network.modules.find((item) => item.base === 0 && item.slot === 2);
  assert.equal(network.name, "Field network");
  assert.equal(module.configName, "PLC-1");
  assert.equal(module.alias, "Uplink");
  assert.equal(module.description, "Plant Ethernet");
});

test("bundled WASM protects compact hardware while preserving comment edits", async () => {
  await init({ module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm")) });
  const source = new Uint8Array(fs.readFileSync(path.join(libraryRoot, "fixtures/XGB_Enet01.xgwx")));
  const before = parse_xgwx(source);
  assert.equal(before.hardware.cpuProfile.variant, "XBM-DR16S");
  assert.throws(() => delete_xgwx_module(source, 0, 0), /built-in/);
  assert.throws(() => insert_xgwx_module(source, 0, 2, "XGI-D24A/B"), /not verified/);
  assert.throws(() => select_xgwx_module(source, 0, 0, "XGI-D24A/B"), /not verified/);
  assert.throws(() => xgwx_module_option_values(source, 0, 0), /not verified/);
  const edited = parse_xgwx(update_xgwx_module(source, 0, 0, { comment: "Built-in comment" }));
  assert.equal(edited.hardware.modules[0].comment, "Built-in comment");
  assert.deepEqual(edited.hardware.cpuProfile, before.hardware.cpuProfile);
  assert.deepEqual(edited.networks, before.networks);
});


test("bundled WASM edits branches and inserts sparse rows without phantom wires", async () => {
  await init({ module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm")) });
  let bytes = new Uint8Array(fs.readFileSync(path.join(libraryRoot, "fixtures/ladder-edit/linear.xgwx")));
  bytes = insert_xgwx_ladder_row(bytes, 0, 4);
  assert.deepEqual(parse_xgwx(bytes).ladder[0].rungs.map(r => r.rawY), [0, 4, 8]);
  const branch = { rawY: 0, boundary: 1, expected: false, present: true };
  bytes = edit_xgwx_ladder_branch(bytes, 0, branch);
  assert.throws(() => edit_xgwx_ladder_branch(bytes, 0, branch), /changed/);
  bytes = edit_xgwx_ladder_cell(bytes, 0, { rawY: 4, column: 0, expected: null, replacement: { kind: "NormallyOpen", operand: "M00002" } });
  let ladder = parse_xgwx(bytes).ladder[0];
  assert.deepEqual(ladder.verticalLines, [{rawX: 3, rawYStart: 0, rawYEnd: 4}]);
  assert.equal(ladder.horizontalLines.some(line => line.rawY === 4), false);
  const removed = parse_xgwx(edit_xgwx_ladder_branch(bytes, 0, {...branch, expected: true, present: false})).ladder[0];
  assert.equal(removed.verticalLines.length, 0);
  bytes = insert_xgwx_ladder_row(bytes, 0, 4);
  ladder = parse_xgwx(bytes).ladder[0];
  assert.deepEqual(ladder.verticalLines, [{rawX: 3, rawYStart: 0, rawYEnd: 8}]);
  assert.ok(ladder.cells.some(cell => cell.rawY === 8 && cell.sourceText === "M00002"));
  assert.ok(ladder.cells.some(cell => cell.rawY === 12 && cell.value === "END"));
});


test("instruction text edits accept different lengths and preserve following instruction offsets", async () => {
  await init({ module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm")) });
  const source = fs.readFileSync(path.join(libraryRoot, "fixtures/elements.xgwx"));
  const before = parse_xgwx(source).ladder[0];
  const mov = before.cells.find(cell => cell.value === "MOV");
  const xdst = before.cells.find(cell => cell.value === "XDST");
  assert.equal(mov.instructionTextEditing, true);
  assert.equal(xdst.instructionTextEditing, true);
  const edited = update_xgwx_ladder_cell(source, 0, mov.offset, mov.sourceText, "MOV,12345,D000042");
  const after = parse_xgwx(edited).ladder[0];
  assert.deepEqual(after.cells.find(cell => cell.value === "MOV").operands, ["12345", "D000042"]);
  const movedXdst = after.cells.find(cell => cell.value === "XDST");
  assert.ok(movedXdst.offset > xdst.offset);
  assert.throws(() => update_xgwx_ladder_cell(edited, 0, xdst.offset, xdst.sourceText, "XDST,1,1,700,100,10,0,0"));
  const both = update_xgwx_ladder_cell(edited, 0, movedXdst.offset, movedXdst.sourceText, "XDST,1,1,700,100,10,0,0");
  assert.deepEqual(parse_xgwx(both).ladder[0].cells.find(cell => cell.value === "XDST").operands, ["1", "1", "700", "100", "10", "0", "0"]);
  assert.throws(() => update_xgwx_ladder_cell(source, 0, mov.offset, mov.sourceText, "ADD,1,D1"), /operand count/);
  assert.throws(() => update_xgwx_ladder_cell(source, 0, mov.offset, mov.sourceText, "MOV,1"), /operand count/);
});


test("instruction replacement uses catalog opcodes and resizes operand records", () => {
  const source = new Uint8Array(fs.readFileSync(path.join(libraryRoot, "fixtures/elements.xgwx")));
  let bytes = source;
  for (const text of ["ADD,1,2,D000000", "TON,T0000,100", "SUB,9,3,D1", "MOV,0,D000000"]) {
    const summary = parse_xgwx(bytes);
    assert.ok(summary.ladder[0].instructionChoices.length > 800);
    const cell = summary.ladder[0].cells.find(c => c.rawY === 44 && c.sourceText?.includes(","));
    bytes = update_xgwx_ladder_cell(bytes, 0, cell.offset, cell.sourceText, text);
    const updated = parse_xgwx(bytes).ladder[0].cells.find(c => c.sourceText === text);
    assert.ok(updated);
    assert.deepEqual(updated.operands, text.split(",").slice(1));
  }
});


test("base slot counts persist independently and protect occupied slots", async () => {
  await init({ module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm")) });
  const source = fs.readFileSync(path.join(libraryRoot, "fixtures/elements.xgwx"));
  let edited = set_xgwx_base_slot_count(source, 0, 8);
  edited = set_xgwx_base_slot_count(edited, 1, 6);
  assert.deepEqual(parse_xgwx(edited).hardware.bases.map(b => b.slotCount), [8,6,12,12]);
  assert.deepEqual(parse_xgwx(edited).hardware.modules, parse_xgwx(source).hardware.modules);
  edited = insert_xgwx_module(edited, 1, 3, "XGF-TC4UD");
  assert.throws(() => set_xgwx_base_slot_count(edited, 1, 4), /occupies 2 slots/);
  assert.throws(() => set_xgwx_base_slot_count(edited, 0, 5), /choose 4, 6, 8, 10 or 12/);
  assert.equal(parse_xgwx(edited).hardware.bases[1].slotCount, 6);
});
