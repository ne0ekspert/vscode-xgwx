import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { nativeFixturePath } from "./native-fixtures.mjs";
import { fileURLToPath } from "node:url";

import init, {
  insert_xgwx_ladder_instruction,
  insert_xgwx_ladder_comparison,
  delete_xgwx_ladder_comparison,
  delete_xgwx_ladder_instruction,
  cpu_catalog,
  copy_xgwx_iec_ld_group,
  copy_xgwx_iec_ld_group_to_program,
  copy_xgwx_iec_ld_group_to_program_with_locals,
  replace_xgwx_iec_ld_group_from_program,
  duplicate_xgwx_iec_ld_function_instance,
  delete_xgwx_ladder_rung_comment,
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
  delete_xgwx_iec_ld_eq_chain_head,
  delete_xgwx_iec_ld_heating_chain_head,
  delete_xgwx_iec_ld_heating_chain_middle,
  delete_xgwx_iec_ld_heating_chain_x3_eq_repaired,
  delete_xgwx_iec_ld_heating_chain_contact_eq,
  delete_xgwx_iec_ld_heating_chain_x15_eq,
  delete_xgwx_iec_ld_function_cell,
  delete_xgwx_iec_ld_group,
  delete_xgwx_iec_ld_horizontal_wire,
  delete_xgwx_iec_ld_linear_rung,
  delete_xgwx_iec_ld_rung,
  delete_xgwx_iec_ld_terminal_coil,
  delete_xgwx_iec_ld_simple_row,
  delete_xgwx_iec_ld_standalone_function,
  delete_xgwx_iec_ld_terminal_function,
  delete_xgwx_module,
  edit_xgwx_iec_ld_branch_segment,
  edit_xgwx_iec_ld_vertical_wire,
  connect_xgwx_iec_ld_groups,
  split_xgwx_iec_ld_group,
  edit_xgwx_ladder_cell,
  edit_xgwx_ladder_branch,
  edit_xgwx_ladder_comment,
  insert_xgwx_iec_ld_contact,
  insert_xgwx_iec_ld_comment,
  insert_xgwx_iec_ld_short_wire_contact,
  insert_xgwx_iec_ld_leading_contact,
  insert_xgwx_iec_ld_function_cell,
  insert_xgwx_iec_ld_function,
  insert_xgwx_iec_ld_single_element,
  insert_xgwx_iec_ld_terminal_move,
  insert_xgwx_iec_ld_standalone_function,
  insert_xgwx_iec_ld_blank_row,
  insert_xgwx_iec_ld_linear_rung,
  insert_xgwx_iec_ld_parallel_contact,
  insert_xgwx_iec_ld_parallel_contact_kind,
  insert_xgwx_iec_ld_rung,
  insert_xgwx_iec_ld_terminal_coil,
  insert_xgwx_iec_ld_no_contact,
  insert_xgwx_iec_local_symbol,
  delete_xgwx_iec_ld_no_contact,
  delete_xgwx_iec_ld_no_contact_cell,
  delete_xgwx_iec_local_symbol,
  insert_xgwx_ladder_row,
  insert_xgwx_module,
  move_xgwx_iec_ld_group,
  parse_xgwx,
  rename_xgwx_iec_local_symbol,
  repair_xgwx_iec_ld_horizontal_wire,
  replace_xgwx_iec_ld_group,
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
  update_xgwx_iec_ld_rising_contact_operand,
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

test("bundled WASM matches the native FF branch output-row deletion", async (context) => {
  const sourcePath = nativeFixturePath("Downloads/smarthome_project_0225.xgwx");
  const generatedPath = nativeFixturePath("VMs/xg5000-win10/captures/smarthome-iec-function-output-branch/generated_l15_delete.xgwx");
  if (!fs.existsSync(sourcePath) || !fs.existsSync(generatedPath)) {
    context.skip("smart home and native comparison fixtures are required");
    return;
  }
  await init({ module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm")) });
  const source = fs.readFileSync(sourcePath);
  assert.throws(() => delete_xgwx_iec_ld_ff_branch_output_row(source, 0, 9, 14));
  const edited = delete_xgwx_iec_ld_ff_branch_output_row(source, 0, 9, 15);
  assert.deepEqual(Buffer.from(edited), fs.readFileSync(generatedPath));
  const summary = parse_xgwx(edited);
  assert.equal(summary.ladder[0].iecRows.filter((row) => row.groupIndex === 9).length, 1);
  assert.ok(summary.ladder[0].iecCircuitGraph);
});

test("bundled WASM deletes the captured EQ chain head like the native accepted file", async (context) => {
  const sourcePath = nativeFixturePath("Downloads/smarthome_project_0225.xgwx");
  const acceptedPath = nativeFixturePath("VMs/xg5000-win10/captures/smarthome-iec-eq-chain-head/generated_eq_chain_head.xgwx");
  if (!fs.existsSync(sourcePath) || !fs.existsSync(acceptedPath)) {
    context.skip("smart home and XG5000 accepted fixtures are required");
    return;
  }
  await init({ module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm")) });
  const source = fs.readFileSync(sourcePath);
  assert.ok(parse_xgwx(source).ladder[0].sourceStrings.some((item) =>
    item.isIecFunctionName && item.iecRecordOffset === 0x2a5c
    && item.iecGroupIndex === 33 && item.iecRowIndex === 67 && item.value === "EQ"));
  assert.throws(() => delete_xgwx_iec_ld_eq_chain_head(source, 0, 0x2a5c, "GT"));
  const edited = delete_xgwx_iec_ld_eq_chain_head(source, 0, 0x2a5c, "EQ");
  assert.deepEqual(Buffer.from(edited), fs.readFileSync(acceptedPath));
  const summary = parse_xgwx(edited);
  assert.equal(summary.ladder[0].iecRows.filter((row) => row.groupIndex === 33).length, 15);
  assert.equal(summary.ladder[0].iecFunctions.length, 22);
  assert.ok(summary.ladder[0].iecCircuitGraph);
});

test("bundled WASM deletes the heating comparison head like XG5000", async (context) => {
  const sourcePath = nativeFixturePath("Downloads/smarthome_project_0225.xgwx");
  const acceptedPath = nativeFixturePath("VMs/xg5000-win10/captures/smarthome-iec-p6-group13/generated_p6_g13_l47.xgwx");
  if (!fs.existsSync(sourcePath) || !fs.existsSync(acceptedPath)) {
    context.skip("smart home and native comparison fixtures are required");
    return;
  }
  await init({ module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm")) });
  const source = fs.readFileSync(sourcePath);
  const block = parse_xgwx(source).ladder[6].iecFunctions.find((item) =>
    item.groupIndex === 13 && item.rowIndex === 46 && item.name === "EQ");
  assert.ok(block);
  assert.throws(() => delete_xgwx_iec_ld_heating_chain_head(source, 6, block.recordOffset, "GT"));
  const edited = delete_xgwx_iec_ld_heating_chain_head(source, 6, block.recordOffset, "EQ");
  assert.deepEqual(Buffer.from(edited), fs.readFileSync(acceptedPath));
  const summary = parse_xgwx(edited);
  assert.equal(summary.ladder[6].iecRows.filter((row) => row.groupIndex === 13).length, 31);
  assert.ok(summary.ladder[6].iecCircuitGraph);
});

test("bundled WASM deletes both captured middle heating comparisons", async (context) => {
  const sourcePath = nativeFixturePath("Downloads/smarthome_project_0225.xgwx");
  const capture = nativeFixturePath("VMs/xg5000-win10/captures/smarthome-iec-p6-group13");
  if (!fs.existsSync(sourcePath) || !fs.existsSync(path.join(capture, "generated_p6_g13_l55.xgwx"))) {
    context.skip("smart home and native comparison fixtures are required");
    return;
  }
  await init({ module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm")) });
  const source = fs.readFileSync(sourcePath);
  const functions = parse_xgwx(source).ladder[6].iecFunctions;
  for (const [row, pin] of [[50, 51], [54, 55]]) {
    const block = functions.find((item) => item.groupIndex === 13 && item.rowIndex === row && item.name === "EQ");
    assert.ok(block);
    assert.throws(() => delete_xgwx_iec_ld_heating_chain_middle(source, 6, block.recordOffset, "GT"));
    const edited = delete_xgwx_iec_ld_heating_chain_middle(source, 6, block.recordOffset, "EQ");
    assert.deepEqual(Buffer.from(edited), fs.readFileSync(path.join(capture, `generated_p6_g13_l${pin}.xgwx`)));
    const summary = parse_xgwx(edited);
    assert.equal(summary.ladder[6].iecRows.filter((item) => item.groupIndex === 13).length, 31);
    assert.ok(summary.ladder[6].iecCircuitGraph);
  }
});

test("bundled WASM deletes L58 EQ with its dangling feed", async (context) => {
  const sourcePath = nativeFixturePath("Downloads/smarthome_project_0225.xgwx");
  const acceptedPath = nativeFixturePath("VMs/xg5000-win10/captures/smarthome-iec-p6-group13/generated_p6_g13_l59_repaired.xgwx");
  if (!fs.existsSync(sourcePath) || !fs.existsSync(acceptedPath)) {
    context.skip("smart home and repaired heating comparison fixture are required");
    return;
  }
  await init({ module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm")) });
  const source = fs.readFileSync(sourcePath);
  const block = parse_xgwx(source).ladder[6].iecFunctions.find((item) =>
    item.groupIndex === 13 && item.rowIndex === 58 && item.name === "EQ");
  assert.ok(block);
  assert.throws(() => delete_xgwx_iec_ld_heating_chain_x3_eq_repaired(source, 6, block.recordOffset, "GT"));
  const edited = delete_xgwx_iec_ld_heating_chain_x3_eq_repaired(source, 6, block.recordOffset, "EQ");
  assert.deepEqual(Buffer.from(edited), fs.readFileSync(acceptedPath));
  const summary = parse_xgwx(edited);
  assert.equal(summary.ladder[6].iecRows.filter((row) => row.groupIndex === 13).length, 31);
  assert.ok(summary.ladder[6].iecCircuitGraph);
});

test("bundled WASM deletes the contact-fed L62 EQ", async (context) => {
  const sourcePath = nativeFixturePath("Downloads/smarthome_project_0225.xgwx");
  const acceptedPath = nativeFixturePath("VMs/xg5000-win10/captures/smarthome-iec-p6-group13/generated_p6_g13_l63.xgwx");
  if (!fs.existsSync(sourcePath) || !fs.existsSync(acceptedPath)) {
    context.skip("smart home and contact-fed comparison fixture are required");
    return;
  }
  await init({ module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm")) });
  const source = fs.readFileSync(sourcePath);
  const block = parse_xgwx(source).ladder[6].iecFunctions.find((item) =>
    item.groupIndex === 13 && item.rowIndex === 62 && item.name === "EQ");
  assert.ok(block);
  assert.throws(() => delete_xgwx_iec_ld_heating_chain_contact_eq(source, 6, block.recordOffset, "GT"));
  const edited = delete_xgwx_iec_ld_heating_chain_contact_eq(source, 6, block.recordOffset, "EQ");
  assert.deepEqual(Buffer.from(edited), fs.readFileSync(acceptedPath));
  const summary = parse_xgwx(edited);
  assert.equal(summary.ladder[6].iecRows.filter((row) => row.groupIndex === 13).length, 31);
  assert.ok(summary.ladder[6].iecCircuitGraph);
});

test("bundled WASM deletes both x15-fed heating comparisons", async (context) => {
  const sourcePath = nativeFixturePath("Downloads/smarthome_project_0225.xgwx");
  const capture = nativeFixturePath("VMs/xg5000-win10/captures/smarthome-iec-p6-group13");
  if (!fs.existsSync(sourcePath) || !fs.existsSync(path.join(capture, "generated_p6_g13_l67.xgwx"))) {
    context.skip("smart home and x15-fed comparison fixtures are required");
    return;
  }
  await init({ module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm")) });
  const source = fs.readFileSync(sourcePath);
  const functions = parse_xgwx(source).ladder[6].iecFunctions;
  for (const [row, pin] of [[66, 67], [70, 71]]) {
    const block = functions.find((item) => item.groupIndex === 13 && item.rowIndex === row && item.name === "EQ");
    assert.ok(block);
    assert.throws(() => delete_xgwx_iec_ld_heating_chain_x15_eq(source, 6, block.recordOffset, "GT"));
    const edited = delete_xgwx_iec_ld_heating_chain_x15_eq(source, 6, block.recordOffset, "EQ");
    assert.deepEqual(Buffer.from(edited), fs.readFileSync(path.join(capture, `generated_p6_g13_l${pin}.xgwx`)));
    const summary = parse_xgwx(edited);
    assert.equal(summary.ladder[6].iecRows.filter((item) => item.groupIndex === 13).length, 31);
    assert.ok(summary.ladder[6].iecCircuitGraph);
  }
  const first = functions.find((item) => item.groupIndex === 13 && item.rowIndex === 66 && item.name === "EQ");
  const later = functions.find((item) => item.groupIndex === 13 && item.rowIndex === 70 && item.name === "EQ");
  const afterFirst = delete_xgwx_iec_ld_heating_chain_x15_eq(source, 6, first.recordOffset, "EQ");
  const shifted = parse_xgwx(afterFirst).ladder[6].iecFunctions.find((item) =>
    item.groupIndex === 13 && item.rowIndex === 69 && item.name === "EQ");
  assert.ok(shifted);
  const forward = delete_xgwx_iec_ld_heating_chain_x15_eq(afterFirst, 6, shifted.recordOffset, "EQ");
  const afterLater = delete_xgwx_iec_ld_heating_chain_x15_eq(source, 6, later.recordOffset, "EQ");
  const surviving = parse_xgwx(afterLater).ladder[6].iecFunctions.find((item) =>
    item.groupIndex === 13 && item.rowIndex === 66 && item.name === "EQ");
  assert.ok(surviving);
  const reverse = delete_xgwx_iec_ld_heating_chain_x15_eq(afterLater, 6, surviving.recordOffset, "EQ");
  assert.deepEqual(Buffer.from(forward), Buffer.from(reverse));
  assert.equal(parse_xgwx(forward).ladder[6].iecRows.filter((item) => item.groupIndex === 13).length, 30);
  assert.ok(parse_xgwx(forward).ladder[6].iecCircuitGraph);
});

test("bundled WASM composes six heating comparison deletions in either order", async (context) => {
  const sourcePath = nativeFixturePath("Downloads/smarthome_project_0225.xgwx");
  const expectedPath = nativeFixturePath("VMs/xg5000-win10/captures/smarthome-iec-p6-group13/generated_p6_g13_six.xgwx");
  if (!fs.existsSync(sourcePath) || !fs.existsSync(expectedPath)) {
    context.skip("smart home and six-comparison fixtures are required");
    return;
  }
  await init({ module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm")) });
  const source = fs.readFileSync(sourcePath);
  const strategies = {
    head: delete_xgwx_iec_ld_heating_chain_head,
    middle: delete_xgwx_iec_ld_heating_chain_middle,
    contact: delete_xgwx_iec_ld_heating_chain_contact_eq,
    x15: delete_xgwx_iec_ld_heating_chain_x15_eq,
  };
  const applySequence = (steps) => steps.reduce((bytes, [row, kind]) => {
    const block = parse_xgwx(bytes).ladder[6].iecFunctions.find((item) =>
      item.groupIndex === 13 && item.rowIndex === row && item.name === "EQ");
    assert.ok(block, `EQ at L${row}`);
    return strategies[kind](bytes, 6, block.recordOffset, "EQ");
  }, source);
  const reverse = applySequence([[70, "x15"], [66, "x15"], [62, "contact"],
    [54, "middle"], [50, "middle"], [46, "head"]]);
  const forward = applySequence([[46, "head"], [49, "middle"], [52, "middle"],
    [59, "contact"], [62, "x15"], [65, "x15"]]);
  assert.deepEqual(Buffer.from(forward), Buffer.from(reverse));
  assert.deepEqual(Buffer.from(forward), fs.readFileSync(expectedPath));
  const summary = parse_xgwx(forward).ladder[6];
  assert.equal(summary.iecRows.filter((item) => item.groupIndex === 13).length, 26);
  assert.ok(summary.iecCircuitGraph);
});

test("bundled WASM composes the repaired x3 deletion with six heating comparisons", async (context) => {
  const sourcePath = nativeFixturePath("Downloads/smarthome_project_0225.xgwx");
  const expectedPath = nativeFixturePath("VMs/xg5000-win10/captures/smarthome-iec-p6-group13/generated_p6_g13_seven.xgwx");
  if (!fs.existsSync(sourcePath) || !fs.existsSync(expectedPath)) {
    context.skip("smart home and seven-comparison fixtures are required");
    return;
  }
  await init({ module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm")) });
  const source = fs.readFileSync(sourcePath);
  const strategies = {
    head: delete_xgwx_iec_ld_heating_chain_head,
    middle: delete_xgwx_iec_ld_heating_chain_middle,
    x3: delete_xgwx_iec_ld_heating_chain_x3_eq_repaired,
    contact: delete_xgwx_iec_ld_heating_chain_contact_eq,
    x15: delete_xgwx_iec_ld_heating_chain_x15_eq,
  };
  const applySequence = (steps) => steps.reduce((bytes, [row, kind]) => {
    const block = parse_xgwx(bytes).ladder[6].iecFunctions.find((item) =>
      item.groupIndex === 13 && item.rowIndex === row && item.name === "EQ");
    assert.ok(block, `EQ at L${row}`);
    return strategies[kind](bytes, 6, block.recordOffset, "EQ");
  }, source);
  const x3Last = applySequence([[70, "x15"], [66, "x15"], [62, "contact"],
    [54, "middle"], [50, "middle"], [46, "head"], [55, "x3"]]);
  const x3Middle = applySequence([[46, "head"], [49, "middle"], [52, "middle"],
    [55, "x3"], [58, "contact"], [61, "x15"], [64, "x15"]]);
  assert.deepEqual(Buffer.from(x3Last), Buffer.from(x3Middle));
  assert.deepEqual(Buffer.from(x3Last), fs.readFileSync(expectedPath));
  const summary = parse_xgwx(x3Last).ladder[6];
  assert.equal(summary.iecRows.filter((item) => item.groupIndex === 13).length, 25);
  assert.ok(summary.iecCircuitGraph);
  const cleaned = delete_xgwx_iec_ld_group(x3Last, 6, 13, 46);
  const cleanedPath = nativeFixturePath("VMs/xg5000-win10/captures/smarthome-iec-p6-group13/generated_p6_g13_seven_then_group_removed.xgwx");
  assert.deepEqual(Buffer.from(cleaned), fs.readFileSync(cleanedPath));
  assert.ok(parse_xgwx(cleaned).ladder[6].iecCircuitGraph);
});

test("bundled WASM deletes the native terminal coil and restores its IEC rung", async (context) => {
  const sourcePath = nativeFixturePath("Downloads/smarthome_project_0225.xgwx");
  const nativePath = nativeFixturePath("VMs/xg5000-win10/captures/smarthome-iec-coil-delete/COI.xgwx");
  if (!fs.existsSync(sourcePath) || !fs.existsSync(nativePath)) {
    context.skip("smart home and native XG5000 captures are unavailable");
    return;
  }
  await init({ module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm")) });
  const source = fs.readFileSync(sourcePath);
  assert.throws(() => delete_xgwx_iec_ld_terminal_coil(source, 0, 271, "wrong"));
  const deleted = delete_xgwx_iec_ld_terminal_coil(source, 0, 271, "시작");
  assert.deepEqual(parse_xgwx(deleted).ladder, parse_xgwx(fs.readFileSync(nativePath)).ladder);
  assert.throws(() => insert_xgwx_iec_ld_terminal_coil(deleted, 0, 223, "스위치_1", "OUTPUT", "UNKNOWN"));
  const restored = insert_xgwx_iec_ld_terminal_coil(deleted, 0, 223, "스위치_1", "OUTPUT", "시작");
  assert.deepEqual(parse_xgwx(restored).ladder, parse_xgwx(source).ladder);
});

test("bundled WASM removes complete branched and function IEC networks", async (context) => {
  const sourcePath = nativeFixturePath("Downloads/smarthome_project_0225.xgwx");
  if (!fs.existsSync(sourcePath)) {
    context.skip("smart home fixture is unavailable");
    return;
  }
  await init({ module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm")) });
  const source = fs.readFileSync(sourcePath);
  const original = parse_xgwx(source);
  for (const [groupIndex, firstRow] of [[3, 3], [14, 20]]) {
    assert.throws(() => delete_xgwx_iec_ld_group(source, 0, groupIndex, firstRow + 1));
    const edited = parse_xgwx(delete_xgwx_iec_ld_group(source, 0, groupIndex, firstRow));
    const removed = original.ladder[0].iecRows.filter((row) => row.groupIndex === groupIndex).length;
    assert.equal(edited.ladder[0].iecRows.length, original.ladder[0].iecRows.length - removed);
    assert.ok(edited.ladder[0].iecCircuitGraph);
    assert.deepEqual(edited.ladder.slice(1), original.ladder.slice(1));
  }
});

test("bundled WASM adds a standalone IEC comment to an empty row", async (context) => {
  const sourcePath = nativeFixturePath("Downloads/smarthome_project_0225.xgwx");
  if (!fs.existsSync(sourcePath)) {
    context.skip("smart home fixture is unavailable");
    return;
  }
  await init({ module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm")) });
  const source = fs.readFileSync(sourcePath);
  assert.throws(() => insert_xgwx_iec_ld_comment(source, 0, 6, "새 설명"));
  assert.throws(() => insert_xgwx_iec_ld_comment(source, 0, 5, ""));
  const edited = parse_xgwx(insert_xgwx_iec_ld_comment(source, 0, 5, "새 설명"));
  const original = parse_xgwx(source);
  assert.ok(edited.ladder[0].iecCircuitGraph);
  assert.equal(edited.ladder[0].iecRows.filter((row) => row.rowIndex === 5).length, 1);
  assert.equal(edited.ladder[0].sourceStrings.find((item) => item.iecRowIndex === 5)?.value, "새 설명");
  assert.deepEqual(edited.ladder.slice(1), original.ladder.slice(1));
});

test("bundled WASM moves complete IEC networks into empty rows", async (context) => {
  const sourcePath = nativeFixturePath("Downloads/smarthome_project_0225.xgwx");
  const captures = nativeFixturePath("VMs/xg5000-win10/captures/smarthome-iec-group-move");
  if (!fs.existsSync(sourcePath) || !fs.existsSync(path.join(captures, "GMS.XGWX"))
      || !fs.existsSync(path.join(captures, "GMF.XGWX"))) {
    context.skip("smart home and native move captures are unavailable");
    return;
  }
  await init({ module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm")) });
  const source = fs.readFileSync(sourcePath);
  assert.throws(() => move_xgwx_iec_ld_group(source, 0, 4, 7, 5));
  assert.throws(() => move_xgwx_iec_ld_group(source, 0, 4, 6, 7));
  const simple = move_xgwx_iec_ld_group(source, 0, 4, 6, 5);
  assert.deepEqual(parse_xgwx(simple).ladder, parse_xgwx(fs.readFileSync(path.join(captures, "GMS.XGWX"))).ladder);
  const cleared = delete_xgwx_iec_ld_group(source, 0, 33, 67);
  const functionMove = move_xgwx_iec_ld_group(cleared, 0, 14, 20, 67);
  assert.deepEqual(parse_xgwx(functionMove).ladder,
    parse_xgwx(fs.readFileSync(path.join(captures, "GMF.XGWX"))).ladder);
});

test("bundled WASM copies complete IEC networks into empty rows", async (context) => {
  const sourcePath = nativeFixturePath("Downloads/smarthome_project_0225.xgwx");
  const captures = nativeFixturePath("VMs/xg5000-win10/captures/smarthome-iec-group-copy");
  if (!fs.existsSync(sourcePath) || !fs.existsSync(path.join(captures, "GCS.XGWX"))
      || !fs.existsSync(path.join(captures, "GCF.XGWX"))) {
    context.skip("smart home and native copy captures are unavailable");
    return;
  }
  await init({ module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm")) });
  const source = fs.readFileSync(sourcePath);
  assert.throws(() => copy_xgwx_iec_ld_group(source, 0, 4, 7, 5));
  assert.throws(() => copy_xgwx_iec_ld_group(source, 0, 4, 6, 7));
  const simple = copy_xgwx_iec_ld_group(source, 0, 4, 6, 5);
  assert.deepEqual(parse_xgwx(simple).ladder,
    parse_xgwx(fs.readFileSync(path.join(captures, "GCS.XGWX"))).ladder);
  const cleared = delete_xgwx_iec_ld_group(source, 0, 33, 67);
  const functionCopy = copy_xgwx_iec_ld_group(cleared, 0, 14, 20, 67);
  assert.deepEqual(parse_xgwx(functionCopy).ladder,
    parse_xgwx(fs.readFileSync(path.join(captures, "GCF.XGWX"))).ladder);
});

test("bundled WASM replaces one occupied IEC network atomically", async (context) => {
  const sourcePath = nativeFixturePath("Downloads/smarthome_project_0225.xgwx");
  const generatedPath = nativeFixturePath("VMs/xg5000-win10/captures/smarthome-iec-network-replace/generated_l6_from_l2.xgwx");
  if (!fs.existsSync(sourcePath) || !fs.existsSync(generatedPath)) {
    context.skip("smart home network replacement capture is unavailable");
    return;
  }
  await init({ module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm")) });
  const source = fs.readFileSync(sourcePath);
  assert.throws(() => replace_xgwx_iec_ld_group(source, 0, 2, 2, 2, 2));
  assert.throws(() => replace_xgwx_iec_ld_group(source, 0, 2, 3, 4, 6));
  const replaced = replace_xgwx_iec_ld_group(source, 0, 2, 2, 4, 6);
  assert.deepEqual(Buffer.from(replaced), fs.readFileSync(generatedPath));
  const before = parse_xgwx(source);
  const after = parse_xgwx(replaced);
  assert.equal(after.ladder[0].iecRows.length, before.ladder[0].iecRows.length);
  assert.deepEqual(after.ladder.slice(1), before.ladder.slice(1));
});

test("bundled WASM gives a copied IEC function its own local instance", async (context) => {
  const captures = nativeFixturePath("VMs/xg5000-win10/captures/smarthome-iec-group-copy");
  const copiedPath = path.join(captures, "GCF.XGWX");
  const independentPath = path.join(captures, "GCI.XGWX");
  if (!fs.existsSync(copiedPath) || !fs.existsSync(independentPath)) {
    context.skip("function-copy captures are unavailable");
    return;
  }
  await init({ module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm")) });
  const source = fs.readFileSync(copiedPath);
  const before = parse_xgwx(source);
  const block = before.ladder[0].iecFunctions.find((item) =>
    item.groupIndex === 33 && item.name === "R_TRIG");
  assert.ok(block?.instance);
  assert.throws(() => duplicate_xgwx_iec_ld_function_instance(
    source, 0, block.recordOffset, "WRONG", "INST4"));
  const edited = parse_xgwx(duplicate_xgwx_iec_ld_function_instance(
    source, 0, block.recordOffset, block.instance, "INST4"));
  const generated = parse_xgwx(fs.readFileSync(independentPath));
  assert.deepEqual(edited.ladder, generated.ladder);
  assert.deepEqual(edited.localVariables, generated.localVariables);
  assert.equal(edited.localVariables[0].find((item) => item.name === "INST4")?.allocationNumber, 1920);
});

test("parallel contact insertion matches XG5000's valid two-row branch", async (context) => {
  const captures = nativeFixturePath("VMs/xg5000-win10/captures/smarthome-iec-group-copy");
  const sourcePath = nativeFixturePath("VMs/xg5000-win10/captures/smarthome-iec-linear-rung/generated_linear_rung_l31.xgwx");
  const nativePath = path.join(captures, "native_or_good.xgwx");
  const resavedPath = path.join(captures, "native_resaved_parallel.xgwx");
  if (!fs.existsSync(sourcePath) || !fs.existsSync(nativePath)) {
    context.skip("native XG5000 parallel-contact capture is unavailable");
    return;
  }
  await init({ module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm")) });
  const source = fs.readFileSync(sourcePath);
  assert.throws(() => insert_xgwx_iec_ld_parallel_contact(source, 0, 31, "WRONG", "OFF", "OFF"));
  assert.throws(() => insert_xgwx_iec_ld_parallel_contact(source, 0, 31, "ON", "OFF", "%MW700"));
  const generatedBytes = insert_xgwx_iec_ld_parallel_contact(source, 0, 31, "ON", "OFF", "OFF");
  const generated = parse_xgwx(generatedBytes);
  const native = parse_xgwx(fs.readFileSync(nativePath));
  const group = generated.ladder[0].iecRows.find((row) => row.rowIndex === 31).groupIndex;
  assert.deepEqual(generated.ladder[0].iecRows.filter((row) => row.groupIndex === group)
    .map((row) => [row.rowIndex, row.recordCount]), [[31, 4], [32, 2]]);
  assert.deepEqual(generated.ladder[0].iecRecords.filter((record) => record.groupIndex === group)
    .map((record) => record.kind), ["Contact", "Branch start", "Long wire", "Coil", "Contact", "Branch end"]);
  for (const field of ["iecRows", "iecRecords", "iecGeometry", "iecCircuitGraph", "sourceStrings"]) {
    assert.deepEqual(generated.ladder[0][field], native.ladder[0][field], field);
  }
  assert.deepEqual(generated.ladder.slice(1), native.ladder.slice(1));
  if (fs.existsSync(resavedPath)) {
    assert.deepEqual(generated.ladder, parse_xgwx(fs.readFileSync(resavedPath)).ladder);
  }
  assert.deepEqual(Buffer.from(edit_xgwx_iec_ld_branch_segment(
    generatedBytes, 0, group, 31, 32, 3, true, false,
  )), source);
});

test("parallel contact insertion edits an existing smart home rung", async (context) => {
  const sourcePath = nativeFixturePath("Downloads/smarthome_project_0225.xgwx");
  const generatedPath = nativeFixturePath("VMs/xg5000-win10/captures/smarthome-iec-group-copy/generated_original_parallel.xgwx");
  const resavedPath = nativeFixturePath("VMs/xg5000-win10/captures/smarthome-iec-group-copy/native_resaved_original_parallel.xgwx");
  if (!fs.existsSync(sourcePath) || !fs.existsSync(generatedPath)) {
    context.skip("smart home fixture or generated branch is unavailable");
    return;
  }
  await init({ module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm")) });
  const source = fs.readFileSync(sourcePath);
  const edited = insert_xgwx_iec_ld_parallel_contact(
    source, 5, 4, "%MX761", "%MX762", "%MX760",
  );
  assert.deepEqual(Buffer.from(edited), fs.readFileSync(generatedPath));
  const generated = parse_xgwx(edited);
  if (fs.existsSync(resavedPath)) {
    assert.deepEqual(generated.ladder, parse_xgwx(fs.readFileSync(resavedPath)).ladder);
  }
  const top = generated.ladder[5].iecRows.find((row) => row.rowIndex === 4);
  assert.deepEqual(generated.ladder[5].iecRows.filter((row) => row.groupIndex === top.groupIndex)
    .map((row) => [row.rowIndex, row.recordCount]), [[4, 4], [5, 2]]);
  const restored = parse_xgwx(edit_xgwx_iec_ld_branch_segment(
    edited, 5, top.groupIndex, 4, 5, 3, true, false,
  ));
  const original = parse_xgwx(source);
  assert.deepEqual(restored.ladder, original.ladder);
  assert.deepEqual(restored.localVariables, original.localVariables);
});

test("parallel contact kind insertion preserves the smart home branch shape", async (context) => {
  const sourcePath = nativeFixturePath("Downloads/smarthome_project_0225.xgwx");
  const captures = nativeFixturePath("VMs/xg5000-win10/captures/smarthome-iec-group-copy");
  const generatedPath = path.join(captures, "generated_original_parallel_nc.xgwx");
  const resavedPath = path.join(captures, "native_resaved_original_parallel_nc.xgwx");
  if (!fs.existsSync(sourcePath) || !fs.existsSync(generatedPath)) {
    context.skip("smart home fixture or generated NC branch is unavailable");
    return;
  }
  await init({ module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm")) });
  const source = fs.readFileSync(sourcePath);
  const original = parse_xgwx(source);
  assert.throws(() => insert_xgwx_iec_ld_parallel_contact_kind(
    source, 5, 4, "%MX761", "%MX762", "OUTPUT", "%MX760",
  ));
  for (const [kind, code] of [["NO", 6], ["NC", 7], ["RISING", 8],
    ["FALLING", 9], ["NEGATED_RISING", 10], ["NEGATED_FALLING", 11]]) {
    const edited = insert_xgwx_iec_ld_parallel_contact_kind(
      source, 5, 4, "%MX761", "%MX762", kind, "%MX760",
    );
    const generated = parse_xgwx(edited);
    const top = generated.ladder[5].iecRows.find((row) => row.rowIndex === 4);
    const lower = generated.ladder[5].iecRecords.find((record) =>
      record.groupIndex === top.groupIndex && record.rowIndex === 5 && record.kind === "Contact");
    assert.equal(lower.code, code, kind);
    assert.deepEqual(generated.ladder[5].iecRows.filter((row) => row.groupIndex === top.groupIndex)
      .map((row) => [row.rowIndex, row.recordCount]), [[4, 4], [5, 2]], kind);
    const restored = parse_xgwx(edit_xgwx_iec_ld_branch_segment(
      edited, 5, top.groupIndex, 4, 5, 3, true, false,
    ));
    assert.deepEqual(restored.ladder, original.ladder, kind);
    assert.deepEqual(restored.localVariables, original.localVariables, kind);
    if (kind === "NC") {
      assert.deepEqual(Buffer.from(edited), fs.readFileSync(generatedPath));
      if (fs.existsSync(resavedPath)) {
        assert.deepEqual(generated.ladder, parse_xgwx(fs.readFileSync(resavedPath)).ladder);
      }
    }
  }
});

test("parallel contact insertion supports a SET-coil smart home rung", async (context) => {
  const sourcePath = nativeFixturePath("Downloads/smarthome_project_0225.xgwx");
  const captures = nativeFixturePath("VMs/xg5000-win10/captures/smarthome-iec-parallel-set");
  const generatedPath = path.join(captures, "generated_parallel_set.xgwx");
  const nativePath = path.join(captures, "native_resaved_parallel_set.xgwx");
  if (![sourcePath, generatedPath].every(fs.existsSync)) {
    context.skip("smart home SET-coil branch capture is unavailable");
    return;
  }
  await init({ module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm")) });
  const source = fs.readFileSync(sourcePath);
  const setOnly = update_xgwx_iec_ld_coil_kind(source, 5, 555, "OUTPUT", "SET");
  const edited = insert_xgwx_iec_ld_parallel_contact_kind(
    setOnly, 5, 4, "%MX761", "%MX762", "NC", "%MX760",
  );
  assert.ok(Buffer.from(edited).equals(fs.readFileSync(generatedPath)));
  const generated = parse_xgwx(edited);
  assert.deepEqual(generated.ladder[5].iecRecords.filter((record) => record.groupIndex === 4)
    .map((record) => record.code ?? null), [6, null, null, 16, 7, null]);
  const restored = edit_xgwx_iec_ld_branch_segment(edited, 5, 4, 4, 5, 3, true, false);
  assert.ok(Buffer.from(restored).equals(Buffer.from(setOnly)));
  if (fs.existsSync(nativePath)) {
    const native = parse_xgwx(fs.readFileSync(nativePath));
    assert.deepEqual(generated.ladder, native.ladder);
  }
});

test("final branch removal preserves a serial contact after the branch", async (context) => {
  const sourcePath = nativeFixturePath("Downloads/smarthome_project_0225.xgwx");
  const captures = nativeFixturePath("VMs/xg5000-win10/captures/smarthome-iec-branch-wire-delete");
  const generatedPath = path.join(captures, "generated_branch_wire_delete.xgwx");
  const nativePath = path.join(captures, "native_branch_wire_delete.xgwx");
  const resavedPath = path.join(captures, "native_resaved_generated_branch_wire_delete.xgwx");
  if (![sourcePath, generatedPath, nativePath, resavedPath].every(fs.existsSync)) {
    context.skip("smart home serial-contact branch capture is unavailable");
    return;
  }
  await init({ module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm")) });
  const source = fs.readFileSync(sourcePath);
  const edited = edit_xgwx_iec_ld_branch_segment(source, 0, 22, 42, 43, 3, true, false);
  assert.deepEqual(Buffer.from(edited), fs.readFileSync(generatedPath));
  const generated = parse_xgwx(edited).ladder[0];
  const native = parse_xgwx(fs.readFileSync(nativePath)).ladder[0];
  assert.deepEqual(generated.iecRows, native.iecRows);
  assert.deepEqual(generated.iecRecords, native.iecRecords);
  assert.deepEqual(generated.sourceStrings, native.sourceStrings);
  assert.deepEqual(parse_xgwx(edited).ladder,
    parse_xgwx(fs.readFileSync(resavedPath)).ladder);
  assert.deepEqual(generated.iecRecords.filter((record) => record.groupIndex === 22)
    .map((record) => record.code ?? null), [6, null, 7, null, 14]);
});

test("final branch removal preserves a contact adjacent to the branch", async (context) => {
  const sourcePath = nativeFixturePath("Downloads/smarthome_project_0225.xgwx");
  const captures = nativeFixturePath("VMs/xg5000-win10/captures/smarthome-iec-direct-contact-branch-delete");
  const generatedPath = path.join(captures, "generated_p3_direct_branch_delete.xgwx");
  const nativePath = path.join(captures, "native_p3_direct_branch_delete.xgwx");
  const resavedPath = path.join(captures, "native_resaved_generated_p3_direct_branch_delete.xgwx");
  if (![sourcePath, generatedPath, nativePath, resavedPath].every(fs.existsSync)) {
    context.skip("smart home adjacent-contact branch capture is unavailable");
    return;
  }
  await init({ module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm")) });
  const edited = edit_xgwx_iec_ld_branch_segment(
    fs.readFileSync(sourcePath), 3, 7, 17, 18, 3, true, false,
  );
  assert.deepEqual(Buffer.from(edited), fs.readFileSync(generatedPath));
  const generated = parse_xgwx(edited).ladder[3];
  const native = parse_xgwx(fs.readFileSync(nativePath)).ladder[3];
  assert.deepEqual(generated.iecRows, native.iecRows);
  assert.deepEqual(generated.iecRecords, native.iecRecords);
  assert.deepEqual(generated.sourceStrings, native.sourceStrings);
  assert.deepEqual(parse_xgwx(edited).ladder,
    parse_xgwx(fs.readFileSync(resavedPath)).ladder);
  assert.deepEqual(generated.iecRecords.filter((record) => record.groupIndex === 7)
    .map((record) => record.code ?? null), [6, 7, null, 14]);
});

test("final x6 branch removal preserves two leading contacts in both smart home programs", async (context) => {
  const sourcePath = nativeFixturePath("Downloads/smarthome_project_0225.xgwx");
  const captures = nativeFixturePath("VMs/xg5000-win10/captures/smarthome-iec-x6-branch-delete");
  const p4Path = path.join(captures, "generated_p4_x6_branch_delete.xgwx");
  const bothPath = path.join(captures, "generated_p4_p5_x6_branch_delete.xgwx");
  const nativePath = path.join(captures, "native_p4_x6_branch_delete.xgwx");
  const resavedPath = path.join(captures, "native_resaved_generated_p4_p5_x6_branch_delete.xgwx");
  if (![sourcePath, p4Path, bothPath, nativePath, resavedPath].every(fs.existsSync)) {
    context.skip("smart home x6 branch capture is unavailable");
    return;
  }
  await init({ module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm")) });
  const source = fs.readFileSync(sourcePath);
  const p4 = edit_xgwx_iec_ld_branch_segment(source, 4, 6, 7, 8, 6, true, false);
  assert.deepEqual(Buffer.from(p4), fs.readFileSync(p4Path));
  const both = edit_xgwx_iec_ld_branch_segment(p4, 5, 5, 5, 6, 6, true, false);
  assert.deepEqual(Buffer.from(both), fs.readFileSync(bothPath));
  const native = parse_xgwx(fs.readFileSync(nativePath)).ladder[4];
  const generated = parse_xgwx(p4).ladder[4];
  assert.deepEqual(generated.iecRows, native.iecRows);
  assert.deepEqual(generated.iecRecords, native.iecRecords);
  assert.deepEqual(generated.sourceStrings, native.sourceStrings);
  assert.deepEqual(parse_xgwx(both).ladder,
    parse_xgwx(fs.readFileSync(resavedPath)).ladder);
});

test("short-wire branch removal preserves the smart home curtain and entrance rungs", async (context) => {
  const sourcePath = nativeFixturePath("Downloads/smarthome_project_0225.xgwx");
  const captures = nativeFixturePath("VMs/xg5000-win10/captures/smarthome-iec-short-wire-branch-delete");
  const p1Path = path.join(captures, "generated_p1_short_wire_branch_delete.xgwx");
  const bothPath = path.join(captures, "generated_p1_p2_short_wire_branch_delete.xgwx");
  const nativePath = path.join(captures, "native_p1_short_wire_branch_delete.xgwx");
  const resavedPath = path.join(captures, "native_resaved_generated_p1_p2_short_wire_branch_delete.xgwx");
  if (![sourcePath, p1Path, bothPath, nativePath, resavedPath].every(fs.existsSync)) {
    context.skip("smart home short-wire branch capture is unavailable");
    return;
  }
  await init({ module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm")) });
  const source = fs.readFileSync(sourcePath);
  const p1 = edit_xgwx_iec_ld_branch_segment(source, 1, 2, 4, 5, 6, true, false);
  assert.deepEqual(Buffer.from(p1), fs.readFileSync(p1Path));
  const both = edit_xgwx_iec_ld_branch_segment(p1, 2, 11, 34, 35, 6, true, false);
  assert.deepEqual(Buffer.from(both), fs.readFileSync(bothPath));
  const native = parse_xgwx(fs.readFileSync(nativePath)).ladder[1];
  const generated = parse_xgwx(p1).ladder[1];
  assert.deepEqual(generated.iecRows, native.iecRows);
  assert.deepEqual(generated.iecRecords, native.iecRecords);
  assert.deepEqual(generated.sourceStrings, native.sourceStrings);
  assert.deepEqual(parse_xgwx(both).ladder,
    parse_xgwx(fs.readFileSync(resavedPath)).ladder);
});

test("output-branch removal preserves both smart home elevator rungs", async (context) => {
  const sourcePath = nativeFixturePath("Downloads/smarthome_project_0225.xgwx");
  const captures = nativeFixturePath("VMs/xg5000-win10/captures/smarthome-iec-output-branch-delete");
  const firstPath = path.join(captures, "generated_l52_delete.xgwx");
  const bothPath = path.join(captures, "generated_both_delete.xgwx");
  const nativePath = path.join(captures, "native_l52_delete.xgwx");
  const resavedPath = path.join(captures, "native_resaved_both.xgwx");
  if (![sourcePath, firstPath, bothPath, nativePath, resavedPath].every(fs.existsSync)) {
    context.skip("smart home output-branch capture is unavailable");
    return;
  }
  await init({ module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm")) });
  const source = fs.readFileSync(sourcePath);
  const first = edit_xgwx_iec_ld_branch_segment(source, 3, 18, 51, 52, 24, true, false);
  assert.deepEqual(Buffer.from(first), fs.readFileSync(firstPath));
  const both = edit_xgwx_iec_ld_branch_segment(first, 3, 19, 52, 53, 24, true, false);
  assert.deepEqual(Buffer.from(both), fs.readFileSync(bothPath));
  const native = parse_xgwx(fs.readFileSync(nativePath)).ladder[3];
  const generated = parse_xgwx(first).ladder[3];
  assert.deepEqual(generated.iecRows, native.iecRows);
  assert.deepEqual(generated.iecRecords, native.iecRecords);
  assert.deepEqual(parse_xgwx(both).ladder,
    parse_xgwx(fs.readFileSync(resavedPath)).ladder);
});

test("terminal contact-branch removal preserves the smart home elevator groups", async (context) => {
  const sourcePath = nativeFixturePath("Downloads/smarthome_project_0225.xgwx");
  const captures = nativeFixturePath("VMs/xg5000-win10/captures/smarthome-iec-three-row-contact-branch");
  const firstPath = path.join(captures, "generated_l26_delete.xgwx");
  const fivePath = path.join(captures, "generated_five_delete.xgwx");
  const nativePath = path.join(captures, "native_l26_delete.xgwx");
  const resavedPath = path.join(captures, "native_resaved_five.xgwx");
  if (![sourcePath, firstPath, fivePath, nativePath, resavedPath].every(fs.existsSync)) {
    context.skip("smart home terminal contact-branch capture is unavailable");
    return;
  }
  await init({ module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm")) });
  const source = fs.readFileSync(sourcePath);
  const first = edit_xgwx_iec_ld_branch_segment(source, 3, 11, 25, 26, 6, true, false);
  assert.deepEqual(Buffer.from(first), fs.readFileSync(firstPath));
  const native = parse_xgwx(fs.readFileSync(nativePath)).ladder[3];
  const generated = parse_xgwx(first).ladder[3];
  assert.deepEqual(generated.iecRows.filter((row) => row.groupIndex === 11),
    native.iecRows.filter((row) => row.groupIndex === 11));
  assert.deepEqual(generated.iecRecords.filter((record) => record.groupIndex === 11),
    native.iecRecords.filter((record) => record.groupIndex === 11));
  let five = source;
  for (const [group, start, end] of [[15, 39, 40], [14, 34, 35], [13, 31, 32],
    [12, 28, 29], [11, 25, 26]]) {
    five = edit_xgwx_iec_ld_branch_segment(five, 3, group, start, end, 6, true, false);
  }
  assert.deepEqual(Buffer.from(five), fs.readFileSync(fivePath));
  assert.deepEqual(parse_xgwx(five).ladder,
    parse_xgwx(fs.readFileSync(resavedPath)).ladder);
});

test("two-contact terminal branches match XG5000 and survive Save As", async (context) => {
  const sourcePath = nativeFixturePath("Downloads/smarthome_project_0225.xgwx");
  const captures = nativeFixturePath("VMs/xg5000-win10/captures/smarthome-iec-two-contact-terminal-branch");
  const firstPath = path.join(captures, "generated_l45_delete.xgwx");
  const twoPath = path.join(captures, "generated_two_delete.xgwx");
  const nativePath = path.join(captures, "native_l45_delete.xgwx");
  const resavedPath = path.join(captures, "native_resaved_two.xgwx");
  if (![sourcePath, firstPath, twoPath, nativePath, resavedPath].every(fs.existsSync)) {
    context.skip("smart home two-contact terminal capture is unavailable");
    return;
  }
  await init({ module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm")) });
  const source = fs.readFileSync(sourcePath);
  const first = edit_xgwx_iec_ld_branch_segment(source, 3, 16, 44, 45, 6, true, false);
  assert.deepEqual(Buffer.from(first), fs.readFileSync(firstPath));
  const native = parse_xgwx(fs.readFileSync(nativePath)).ladder[3];
  const generated = parse_xgwx(first).ladder[3];
  assert.deepEqual(generated.iecRows.filter((row) => row.groupIndex === 16),
    native.iecRows.filter((row) => row.groupIndex === 16));
  assert.deepEqual(generated.iecRecords.filter((record) => record.groupIndex === 16),
    native.iecRecords.filter((record) => record.groupIndex === 16));
  let two = edit_xgwx_iec_ld_branch_segment(source, 3, 17, 48, 49, 6, true, false);
  two = edit_xgwx_iec_ld_branch_segment(two, 3, 16, 44, 45, 6, true, false);
  assert.deepEqual(Buffer.from(two), fs.readFileSync(twoPath));
  assert.deepEqual(parse_xgwx(two).ladder,
    parse_xgwx(fs.readFileSync(resavedPath)).ladder);
});

test("two-contact middle branches match XG5000 and survive Save As", async (context) => {
  const sourcePath = nativeFixturePath("Downloads/smarthome_project_0225.xgwx");
  const captures = nativeFixturePath("VMs/xg5000-win10/captures/smarthome-iec-middle-contact-branch");
  const firstPath = path.join(captures, "generated_l44_delete.xgwx");
  const twoPath = path.join(captures, "generated_two_middle_delete.xgwx");
  const nativePath = path.join(captures, "native_l44_delete.xgwx");
  const resavedPath = path.join(captures, "native_resaved_two_middle.xgwx");
  if (![sourcePath, firstPath, twoPath, nativePath, resavedPath].every(fs.existsSync)) {
    context.skip("smart home middle contact-branch capture is unavailable");
    return;
  }
  await init({ module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm")) });
  const source = fs.readFileSync(sourcePath);
  const first = edit_xgwx_iec_ld_branch_segment(source, 3, 16, 43, 44, 6, true, false);
  assert.deepEqual(Buffer.from(first), fs.readFileSync(firstPath));
  const native = parse_xgwx(fs.readFileSync(nativePath)).ladder[3];
  const generated = parse_xgwx(first).ladder[3];
  assert.deepEqual(generated.iecRows.filter((row) => row.groupIndex === 16),
    native.iecRows.filter((row) => row.groupIndex === 16));
  assert.deepEqual(generated.iecRecords.filter((record) => record.groupIndex === 16),
    native.iecRecords.filter((record) => record.groupIndex === 16));
  let two = edit_xgwx_iec_ld_branch_segment(source, 3, 17, 47, 48, 6, true, false);
  two = edit_xgwx_iec_ld_branch_segment(two, 3, 16, 43, 44, 6, true, false);
  assert.deepEqual(Buffer.from(two), fs.readFileSync(twoPath));
  assert.deepEqual(parse_xgwx(two).ladder,
    parse_xgwx(fs.readFileSync(resavedPath)).ladder);
});

test("first lower contact branches match XG5000 and survive Save As", async (context) => {
  const sourcePath = nativeFixturePath("Downloads/smarthome_project_0225.xgwx");
  const captures = nativeFixturePath("VMs/xg5000-win10/captures/smarthome-iec-first-lower-contact-branch");
  const firstPath = path.join(captures, "generated_l25_delete.xgwx");
  const sevenPath = path.join(captures, "generated_seven_delete.xgwx");
  const nativePath = path.join(captures, "native_l25_delete.xgwx");
  const resavedPath = path.join(captures, "native_resaved_seven.xgwx");
  if (![sourcePath, firstPath, sevenPath, nativePath, resavedPath].every(fs.existsSync)) {
    context.skip("smart home first lower contact-branch capture is unavailable");
    return;
  }
  await init({ module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm")) });
  const source = fs.readFileSync(sourcePath);
  const first = edit_xgwx_iec_ld_branch_segment(source, 3, 11, 24, 25, 6, true, false);
  assert.deepEqual(Buffer.from(first), fs.readFileSync(firstPath));
  const native = parse_xgwx(fs.readFileSync(nativePath)).ladder[3];
  const generated = parse_xgwx(first).ladder[3];
  assert.deepEqual(generated.iecRows.filter((row) => row.groupIndex === 11),
    native.iecRows.filter((row) => row.groupIndex === 11));
  assert.deepEqual(generated.iecRecords.filter((record) => record.groupIndex === 11),
    native.iecRecords.filter((record) => record.groupIndex === 11));
  let seven = source;
  for (const [group, start, end] of [
    [17, 46, 47], [16, 42, 43], [15, 37, 38], [14, 33, 34],
    [13, 30, 31], [12, 27, 28], [11, 24, 25],
  ]) {
    seven = edit_xgwx_iec_ld_branch_segment(seven, 3, group, start, end, 6, true, false);
  }
  assert.deepEqual(Buffer.from(seven), fs.readFileSync(sevenPath));
  assert.deepEqual(parse_xgwx(seven).ladder,
    parse_xgwx(fs.readFileSync(resavedPath)).ladder);
});

test("middle short-wire contact branch matches XG5000 and survives Save As", async (context) => {
  const sourcePath = nativeFixturePath("Downloads/smarthome_project_0225.xgwx");
  const captures = nativeFixturePath("VMs/xg5000-win10/captures/smarthome-iec-middle-shortwire-branch");
  const generatedPath = path.join(captures, "generated_l39_delete.xgwx");
  const nativePath = path.join(captures, "native_l39_delete.xgwx");
  const resavedPath = path.join(captures, "native_resaved_l39.xgwx");
  if (![sourcePath, generatedPath, nativePath, resavedPath].every(fs.existsSync)) {
    context.skip("smart home middle short-wire branch capture is unavailable");
    return;
  }
  await init({ module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm")) });
  const source = fs.readFileSync(sourcePath);
  const edited = edit_xgwx_iec_ld_branch_segment(source, 3, 15, 38, 39, 6, true, false);
  assert.deepEqual(Buffer.from(edited), fs.readFileSync(generatedPath));
  const native = parse_xgwx(fs.readFileSync(nativePath)).ladder[3];
  const generated = parse_xgwx(edited).ladder[3];
  assert.deepEqual(generated.iecRows.filter((row) => row.groupIndex === 15),
    native.iecRows.filter((row) => row.groupIndex === 15));
  assert.deepEqual(generated.iecRecords.filter((record) => record.groupIndex === 15),
    native.iecRecords.filter((record) => record.groupIndex === 15));
  assert.deepEqual(parse_xgwx(edited).ladder,
    parse_xgwx(fs.readFileSync(resavedPath)).ladder);
});

test("x3 terminal contact branch matches XG5000 and survives Save As", async (context) => {
  const sourcePath = nativeFixturePath("Downloads/smarthome_project_0225.xgwx");
  const captures = nativeFixturePath("VMs/xg5000-win10/captures/smarthome-iec-three-row-x3-terminal");
  const generatedPath = path.join(captures, "generated_p3_l57_delete.xgwx");
  const resavedPath = path.join(captures, "native_resaved_generated.xgwx");
  if (![sourcePath, generatedPath, resavedPath].every(fs.existsSync)) {
    context.skip("smart home x3 terminal branch capture is unavailable");
    return;
  }
  await init({ module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm")) });
  const edited = edit_xgwx_iec_ld_branch_segment(
    fs.readFileSync(sourcePath), 3, 20, 56, 57, 3, true, false,
  );
  assert.deepEqual(Buffer.from(edited), fs.readFileSync(generatedPath));
  assert.deepEqual(parse_xgwx(edited).ladder,
    parse_xgwx(fs.readFileSync(resavedPath)).ladder);
});

test("x3 middle contact branch matches XG5000 and survives Save As", async (context) => {
  const sourcePath = nativeFixturePath("Downloads/smarthome_project_0225.xgwx");
  const captures = nativeFixturePath("VMs/xg5000-win10/captures/smarthome-iec-three-row-x3-middle");
  const generatedPath = path.join(captures, "generated_p3_l56_delete.xgwx");
  const resavedPath = path.join(captures, "native_resaved_generated.xgwx");
  if (![sourcePath, generatedPath, resavedPath].every(fs.existsSync)) {
    context.skip("smart home x3 middle branch capture is unavailable");
    return;
  }
  await init({ module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm")) });
  const edited = edit_xgwx_iec_ld_branch_segment(
    fs.readFileSync(sourcePath), 3, 20, 55, 56, 3, true, false,
  );
  assert.deepEqual(Buffer.from(edited), fs.readFileSync(generatedPath));
  assert.deepEqual(parse_xgwx(edited).ladder,
    parse_xgwx(fs.readFileSync(resavedPath)).ladder);
});

test("nested middle contact branch rows match native XG5000 deletions", async (context) => {
  const sourcePath = nativeFixturePath("Downloads/smarthome_project_0225.xgwx");
  const captures = nativeFixturePath("VMs/xg5000-win10/captures/smarthome-iec-p6-output-row");
  const resavedPath = path.join(captures, "native_resaved_generated_l4.xgwx");
  const group8ResavedPath = path.join(captures, "native_resaved_generated_g8_l21.xgwx");
  if (![sourcePath, resavedPath, path.join(captures, "generated_p6_l4.xgwx"),
    path.join(captures, "generated_p6_l6.xgwx"), group8ResavedPath,
    path.join(captures, "generated_p6_g8_l21.xgwx"),
    path.join(captures, "generated_p6_g8_l23.xgwx")].every(fs.existsSync)) {
    context.skip("smart home nested contact branch capture is unavailable");
    return;
  }
  await init({ module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm")) });
  const source = fs.readFileSync(sourcePath);
  assert.throws(() => delete_xgwx_iec_ld_nested_contact_branch_row(source, 6, 3, 7));
  for (const row of [4, 6]) {
    const edited = delete_xgwx_iec_ld_nested_contact_branch_row(source, 6, 3, row);
    assert.deepEqual(Buffer.from(edited), fs.readFileSync(path.join(captures, `generated_p6_l${row}.xgwx`)));
    assert.ok(parse_xgwx(edited).ladder[6].iecCircuitGraph);
  }
  for (const row of [21, 23]) {
    const edited = delete_xgwx_iec_ld_nested_contact_branch_row(source, 6, 8, row);
    assert.deepEqual(Buffer.from(edited), fs.readFileSync(path.join(captures, `generated_p6_g8_l${row}.xgwx`)));
    assert.ok(parse_xgwx(edited).ladder[6].iecCircuitGraph);
  }
  const generated = parse_xgwx(delete_xgwx_iec_ld_nested_contact_branch_row(source, 6, 3, 4));
  assert.deepEqual(generated.ladder, parse_xgwx(fs.readFileSync(resavedPath)).ladder);
  const group8Generated = parse_xgwx(delete_xgwx_iec_ld_nested_contact_branch_row(source, 6, 8, 21));
  assert.deepEqual(group8Generated.ladder,
    parse_xgwx(fs.readFileSync(group8ResavedPath)).ladder);
});

test("chained middle contact branch row matches native XG5000 deletion", async (context) => {
  const sourcePath = nativeFixturePath("Downloads/smarthome_project_0225.xgwx");
  const captures = nativeFixturePath("VMs/xg5000-win10/captures/smarthome-iec-p6-output-row");
  const generatedPaths = [83, 84].map((row) => path.join(captures, `generated_p6_g14_l${row}.xgwx`));
  const resavedPath = path.join(captures, "native_resaved_generated_g14_l84.xgwx");
  if (![sourcePath, ...generatedPaths].every(fs.existsSync)) {
    context.skip("smart home chained branch capture is unavailable");
    return;
  }
  await init({ module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm")) });
  const source = fs.readFileSync(sourcePath);
  assert.throws(() => delete_xgwx_iec_ld_chained_contact_branch_row(source, 6, 14, 80));
  for (const [index, row] of [83, 84].entries()) {
    const edited = delete_xgwx_iec_ld_chained_contact_branch_row(source, 6, 14, row);
    assert.deepEqual(Buffer.from(edited), fs.readFileSync(generatedPaths[index]));
    assert.ok(parse_xgwx(edited).ladder[6].iecCircuitGraph);
  }
  if (fs.existsSync(resavedPath)) {
    const editedL84 = delete_xgwx_iec_ld_chained_contact_branch_row(source, 6, 14, 84);
    assert.deepEqual(parse_xgwx(editedL84).ladder, parse_xgwx(fs.readFileSync(resavedPath)).ladder);
  }
});

test("branch-only middle rows match native XG5000 deletions", async (context) => {
  const sourcePath = nativeFixturePath("Downloads/smarthome_project_0225.xgwx");
  const captures = nativeFixturePath("VMs/xg5000-win10/captures/smarthome-iec-p6-output-row");
  const sites = [[7, 21], [8, 28]];
  const generatedPaths = sites.map(([group, row]) => path.join(captures, `generated_p2_g${group}_l${row}.xgwx`));
  if (![sourcePath, ...generatedPaths].every(fs.existsSync)) {
    context.skip("smart home branch-only row captures are unavailable");
    return;
  }
  await init({ module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm")) });
  const source = fs.readFileSync(sourcePath);
  assert.throws(() => delete_xgwx_iec_ld_empty_branch_row(source, 2, 7, 20));
  for (const [[group, row], generatedPath] of sites.map((site, index) => [site, generatedPaths[index]])) {
    const edited = delete_xgwx_iec_ld_empty_branch_row(source, 2, group, row);
    assert.deepEqual(Buffer.from(edited), fs.readFileSync(generatedPath));
    assert.ok(parse_xgwx(edited).ladder[2].iecCircuitGraph);
  }
  const resavedPath = path.join(captures, "native_resaved_generated_p2_g7_l21.xgwx");
  if (fs.existsSync(resavedPath)) {
    const editedL21 = delete_xgwx_iec_ld_empty_branch_row(source, 2, 7, 21);
    assert.deepEqual(parse_xgwx(editedL21).ladder, parse_xgwx(fs.readFileSync(resavedPath)).ladder);
  }
});

test("parallel insertion accepts an existing rising-edge top contact", async (context) => {
  const sourcePath = nativeFixturePath("Downloads/smarthome_project_0225.xgwx");
  const captures = nativeFixturePath("VMs/xg5000-win10/captures/smarthome-iec-group-copy");
  const generatedPath = path.join(captures, "generated_rising_parallel.xgwx");
  const resavedPath = path.join(captures, "native_resaved_rising_parallel.xgwx");
  if (!fs.existsSync(sourcePath) || !fs.existsSync(generatedPath)) {
    context.skip("smart home fixture or generated rising-edge branch is unavailable");
    return;
  }
  await init({ module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm")) });
  const source = fs.readFileSync(sourcePath);
  const edited = insert_xgwx_iec_ld_parallel_contact_kind(
    source, 0, 2, "스위치_1", "시작", "NO", "ON",
  );
  assert.deepEqual(Buffer.from(edited), fs.readFileSync(generatedPath));
  const generated = parse_xgwx(edited);
  const top = generated.ladder[0].iecRows.find((row) => row.rowIndex === 2);
  assert.deepEqual(generated.ladder[0].iecRecords.filter((record) =>
    record.groupIndex === top.groupIndex).map((record) => record.code ?? null),
  [0x08, null, null, 0x0e, 0x06, null]);
  assert.ok(generated.ladder[0].iecCircuitGraph);
  const restored = parse_xgwx(edit_xgwx_iec_ld_branch_segment(
    edited, 0, top.groupIndex, 2, 3, 3, true, false,
  ));
  const original = parse_xgwx(source);
  assert.deepEqual(restored.ladder, original.ladder);
  assert.deepEqual(restored.localVariables, original.localVariables);
  if (fs.existsSync(resavedPath)) {
    assert.deepEqual(generated.ladder, parse_xgwx(fs.readFileSync(resavedPath)).ladder);
  }
});

test("cross-program IEC network copy validates destination operands and restores", async (context) => {
  const sourcePath = nativeFixturePath("Downloads/smarthome_project_0225.xgwx");
  const captures = nativeFixturePath("VMs/xg5000-win10/captures/smarthome-iec-group-copy");
  const generatedPath = path.join(captures, "generated_cross_program_contact_copy.xgwx");
  const resavedPath = path.join(captures, "native_resaved_cross_program_contact_copy.xgwx");
  if (!fs.existsSync(sourcePath) || !fs.existsSync(generatedPath)) {
    context.skip("smart home fixture or generated cross-program copy is unavailable");
    return;
  }
  await init({ module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm")) });
  const source = fs.readFileSync(sourcePath);
  const original = parse_xgwx(source);
  const group = original.ladder[5].iecRows.find((row) => row.rowIndex === 4).groupIndex;
  const copied = copy_xgwx_iec_ld_group_to_program(source, 5, group, 4, 6, 8);
  assert.deepEqual(Buffer.from(copied), fs.readFileSync(generatedPath));
  const generated = parse_xgwx(copied);
  const inserted = generated.ladder[6].iecRows.find((row) => row.rowIndex === 8);
  assert.ok(inserted);
  assert.ok(generated.ladder[6].iecCircuitGraph);
  assert.deepEqual(generated.ladder.slice(0, 6), original.ladder.slice(0, 6));
  assert.deepEqual(generated.localVariables, original.localVariables);
  assert.throws(() => copy_xgwx_iec_ld_group_to_program(source, 5, group, 4, 6, 7));
  const localGroup = original.ladder[0].iecRows.find((row) => row.rowIndex === 2).groupIndex;
  assert.throws(() => copy_xgwx_iec_ld_group_to_program(source, 0, localGroup, 2, 6, 8));
  const restored = parse_xgwx(delete_xgwx_iec_ld_group(copied, 6, inserted.groupIndex, 8));
  assert.deepEqual(restored.ladder, original.ladder);
  if (fs.existsSync(resavedPath)) {
    assert.deepEqual(generated.ladder, parse_xgwx(fs.readFileSync(resavedPath)).ladder);
  }
});

test("bundled WASM copies a typed IEC function network across programs", async (context) => {
  const sourcePath = nativeFixturePath("Downloads/smarthome_project_0225.xgwx");
  const generatedPath = nativeFixturePath("VMs/xg5000-win10/captures/smarthome-iec-cross-function-copy/generated_p2_word_to_udint_p3_l1.xgwx");
  const nativePath = nativeFixturePath("VMs/xg5000-win10/captures/smarthome-iec-cross-function-copy/native_resaved_cross_function_copy.xgwx");
  if (!fs.existsSync(sourcePath) || !fs.existsSync(generatedPath)) {
    context.skip("smart home cross-program function copy capture is unavailable");
    return;
  }
  await init({ module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm")) });
  const source = fs.readFileSync(sourcePath);
  const cleared = delete_xgwx_iec_ld_group(source, 3, 1, 1);
  assert.throws(() => copy_xgwx_iec_ld_group_to_program(cleared, 0, 14, 20, 3, 1));
  const copied = copy_xgwx_iec_ld_group_to_program(cleared, 2, 1, 1, 3, 1);
  assert.deepEqual(Buffer.from(copied), fs.readFileSync(generatedPath));
  const before = parse_xgwx(source);
  const after = parse_xgwx(copied);
  assert.deepEqual(after.ladder.filter((_, index) => index !== 3),
    before.ladder.filter((_, index) => index !== 3));
  assert.ok(after.ladder[3].iecFunctions.some((block) => block.name === "WORD_TO_UDINT"));
  if (fs.existsSync(nativePath)) {
    const native = parse_xgwx(fs.readFileSync(nativePath));
    const withoutOffsets = (table) => table.map(({ recordOffset, ...symbol }) => symbol);
    assert.deepEqual(after.ladder, native.ladder);
    assert.deepEqual(after.localVariables.map(withoutOffsets), native.localVariables.map(withoutOffsets));
  }
});

test("bundled WASM copies cross-program networks with required mapped BOOL locals", async (context) => {
  const sourcePath = nativeFixturePath("Downloads/smarthome_project_0225.xgwx");
  const captures = nativeFixturePath("VMs/xg5000-win10/captures/smarthome-iec-cross-local-copy");
  const generatedPath = path.join(captures, "generated_cross_local_copy.xgwx");
  const nativePath = path.join(captures, "native_resaved_cross_local_copy.xgwx");
  if (![sourcePath, generatedPath].every(fs.existsSync)) {
    context.skip("smart home cross-local copy capture is unavailable");
    return;
  }
  await init({ module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm")) });
  const source = fs.readFileSync(sourcePath);
  let cleared = source;
  for (const [group, row] of [[2, 2], [1, 1], [0, 0]]) {
    cleared = delete_xgwx_iec_ld_group(cleared, 6, group, row);
  }
  assert.throws(() => copy_xgwx_iec_ld_group_to_program(cleared, 0, 26, 48, 6, 0));
  const copied = copy_xgwx_iec_ld_group_to_program_with_locals(cleared, 0, 26, 48, 6, 0);
  assert.ok(Buffer.from(copied).equals(fs.readFileSync(generatedPath)));
  const generated = parse_xgwx(copied);
  assert.equal(generated.localVariables[6].find((item) => item.name === "ON").address, "%MX8");
  assert.equal(generated.localVariables[6].find((item) => item.name === "OFF").address, "%MX7");
  assert.ok(generated.ladder[6].iecFunctions.some((block) => block.name === "MOVE"));
  if (fs.existsSync(nativePath)) {
    const native = parse_xgwx(fs.readFileSync(nativePath));
    const withoutOffsets = (table) => table.map(({ recordOffset, ...symbol }) => symbol);
    assert.deepEqual(generated.ladder, native.ladder);
    assert.deepEqual(generated.localVariables.map(withoutOffsets), native.localVariables.map(withoutOffsets));
  }
});

test("bundled WASM copies a cross-program network with its R_TRIG instance", async (context) => {
  const sourcePath = nativeFixturePath("Downloads/smarthome_project_0225.xgwx");
  const captures = nativeFixturePath("VMs/xg5000-win10/captures/smarthome-iec-cross-instance-copy");
  const generatedPath = path.join(captures, "generated_cross_instance_copy.xgwx");
  const nativePath = path.join(captures, "native_resaved_cross_instance_copy.xgwx");
  if (![sourcePath, generatedPath].every(fs.existsSync)) {
    context.skip("smart home cross-instance copy capture is unavailable");
    return;
  }
  await init({ module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm")) });
  const source = fs.readFileSync(sourcePath);
  const cleared = delete_xgwx_iec_ld_group(source, 4, 14, 22);
  assert.throws(() => copy_xgwx_iec_ld_group_to_program(cleared, 0, 18, 32, 4, 22));
  const copied = copy_xgwx_iec_ld_group_to_program_with_locals(cleared, 0, 18, 32, 4, 22);
  assert.ok(Buffer.from(copied).equals(fs.readFileSync(generatedPath)));
  const generated = parse_xgwx(copied);
  const instance = generated.localVariables[4].find((item) => item.name === "INST_사본2");
  assert.equal(instance.typeReference, "R_TRIG");
  assert.equal(instance.allocationNumber, 2688);
  assert.ok(generated.ladder[4].iecFunctions.some((block) => block.name === "R_TRIG"
    && block.instance === "INST_사본2"));
  if (fs.existsSync(nativePath)) {
    const native = parse_xgwx(fs.readFileSync(nativePath));
    const withoutOffsets = (table) => table.map(({ recordOffset, ...symbol }) => symbol);
    assert.deepEqual(generated.ladder, native.ladder);
    assert.deepEqual(generated.localVariables.map(withoutOffsets), native.localVariables.map(withoutOffsets));
  }
});

test("bundled WASM atomically replaces a network from another IEC program", async (context) => {
  const sourcePath = nativeFixturePath("Downloads/smarthome_project_0225.xgwx");
  const captures = nativeFixturePath("VMs/xg5000-win10/captures/smarthome-iec-cross-instance-copy");
  const generatedPath = path.join(captures, "generated_cross_instance_copy.xgwx");
  const nativePath = path.join(captures, "native_resaved_cross_instance_copy.xgwx");
  if (![sourcePath, generatedPath].every(fs.existsSync)) {
    context.skip("smart home cross-program replacement capture is unavailable");
    return;
  }
  await init({ module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm")) });
  const source = fs.readFileSync(sourcePath);
  assert.throws(() => replace_xgwx_iec_ld_group_from_program(source,
    0, 18, 32, 4, 14, 22, false));
  const replaced = replace_xgwx_iec_ld_group_from_program(source,
    0, 18, 32, 4, 14, 22, true);
  assert.ok(Buffer.from(replaced).equals(fs.readFileSync(generatedPath)));
  if (fs.existsSync(nativePath)) {
    const generated = parse_xgwx(replaced);
    const native = parse_xgwx(fs.readFileSync(nativePath));
    assert.deepEqual(generated.ladder, native.ladder);
    assert.deepEqual(generated.localVariables[4], native.localVariables[4]);
  }
});

test("bundled WASM copies a Unicode UDINT local with its function network", async (context) => {
  const sourcePath = nativeFixturePath("Downloads/smarthome_project_0225.xgwx");
  const captures = nativeFixturePath("VMs/xg5000-win10/captures/smarthome-iec-cross-udint-copy");
  const generatedPath = path.join(captures, "generated_cross_udint_copy.xgwx");
  const nativePath = path.join(captures, "native_resaved_cross_udint_copy.xgwx");
  if (![sourcePath, generatedPath].every(fs.existsSync)) {
    context.skip("smart home Unicode UDINT copy capture is unavailable");
    return;
  }
  await init({ module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm")) });
  const source = fs.readFileSync(sourcePath);
  assert.throws(() => copy_xgwx_iec_ld_group_to_program(source, 2, 1, 1, 4, 26));
  const copied = copy_xgwx_iec_ld_group_to_program_with_locals(source, 2, 1, 1, 4, 26);
  assert.ok(Buffer.from(copied).equals(fs.readFileSync(generatedPath)));
  const generated = parse_xgwx(copied);
  const local = generated.localVariables[4].find((item) => item.name === "변환");
  assert.equal(local.dataType, "UDINT");
  assert.equal(local.storageClass, "A");
  assert.equal(local.allocationNumber, 2688);
  assert.equal(local.allocationWidth, 32);
  assert.ok(generated.ladder[4].iecFunctions.some((block) => block.rowIndex === 26
    && block.name === "WORD_TO_UDINT"));
  if (fs.existsSync(nativePath)) {
    const native = parse_xgwx(fs.readFileSync(nativePath));
    const withoutOffsets = (table) => table.map(({ recordOffset, ...symbol }) => symbol);
    assert.deepEqual(generated.ladder, native.ladder);
    assert.deepEqual(generated.localVariables.map(withoutOffsets), native.localVariables.map(withoutOffsets));
  }
});

test("bundled WASM cycles all captured IEC comparison function kinds", async (context) => {
  const sourcePath = nativeFixturePath("Downloads/smarthome_project_0225.xgwx");
  const captures = nativeFixturePath("VMs/xg5000-win10/captures/smarthome-iec-comparison-cycle");
  const generatedPath = path.join(captures, "generated_comparison_cycle.xgwx");
  const nativePath = path.join(captures, "native_resaved_comparison_cycle.xgwx");
  if (![sourcePath, generatedPath].every(fs.existsSync)) {
    context.skip("smart home comparison cycle capture is unavailable");
    return;
  }
  await init({ module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm")) });
  const source = fs.readFileSync(sourcePath);
  const original = parse_xgwx(source);
  const replacements = [["EQ", "GT"], ["GT", "GE"], ["GE", "LT"], ["LT", "LE"], ["LE", "EQ"]];
  let edited = source;
  const sites = [];
  for (const [expected, replacement] of replacements) {
    const program = original.ladder.find((item) => item.sourceStrings.some((field) =>
      field.isIecComparisonFunction && field.value === expected));
    assert.ok(program);
    const field = program.sourceStrings.find((item) => item.isIecComparisonFunction && item.value === expected);
    edited = update_xgwx_iec_ld_comparison_function(edited, program.programIndex,
      field.offset, expected, replacement);
    sites.push([program.programIndex, field.offset, expected, replacement]);
  }
  assert.ok(Buffer.from(edited).equals(fs.readFileSync(generatedPath)));
  if (fs.existsSync(nativePath)) {
    assert.deepEqual(parse_xgwx(edited).ladder, parse_xgwx(fs.readFileSync(nativePath)).ladder);
  }
  for (const [programIndex, offset, expected, replacement] of sites) {
    edited = update_xgwx_iec_ld_comparison_function(edited, programIndex,
      offset, replacement, expected);
  }
  assert.deepEqual(parse_xgwx(edited).ladder, original.ladder);
});

test("variable-length IEC local address survives native XG5000 Save As", async (context) => {
  const captures = nativeFixturePath("VMs/xg5000-win10/captures/smarthome-iec-address-length");
  const sourcePath = nativeFixturePath("Downloads/smarthome_project_0225.xgwx");
  const generatedPath = path.join(captures, "generated_on_mx100.xgwx");
  const nativePath = path.join(captures, "native_resaved_on_mx100.xgwx");
  if (![sourcePath, generatedPath, nativePath].every(fs.existsSync)) {
    context.skip("smart home address-length acceptance captures are unavailable");
    return;
  }
  await init({ module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm")) });
  const source = fs.readFileSync(sourcePath);
  const edited = update_xgwx_iec_local_symbol_address(source, 0, 5, "ON", "%MX8", "%MX100");
  assert.deepEqual(Buffer.from(edited), fs.readFileSync(generatedPath));
  const generated = parse_xgwx(edited);
  const native = parse_xgwx(fs.readFileSync(nativePath));
  const symbolFields = (symbols) => symbols.map(({ recordOffset, ...fields }) => fields);
  assert.deepEqual(generated.localVariables.map(symbolFields), native.localVariables.map(symbolFields));
  assert.equal(native.localVariables[0][5].address, "%MX100");
  assert.equal(native.localVariables[0][5].allocationNumber, 100);
  assert.deepEqual(generated.ladder.slice(1), native.ladder.slice(1));
});

test("mapped IEC BOOL address can be cleared and assigned again", async (context) => {
  const sourcePath = nativeFixturePath("Downloads/smarthome_project_0225.xgwx");
  const captures = nativeFixturePath("VMs/xg5000-win10/captures/smarthome-iec-address-unmap");
  const generatedPath = path.join(captures, "generated_unmapped_on.xgwx");
  const nativePath = path.join(captures, "native_unmapped_on.xgwx");
  if (![sourcePath, generatedPath, nativePath].every(fs.existsSync)) {
    context.skip("smart home native unmap captures are unavailable");
    return;
  }
  await init({ module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm")) });
  const source = fs.readFileSync(sourcePath);
  const original = parse_xgwx(source);
  const cleared = update_xgwx_iec_local_symbol_address(source, 0, 5, "ON", "%MX8", "");
  assert.deepEqual(Buffer.from(cleared), fs.readFileSync(generatedPath));
  const generated = parse_xgwx(cleared);
  const native = parse_xgwx(fs.readFileSync(nativePath));
  const fields = (table) => table.map(({ recordOffset, ...symbol }) => symbol);
  assert.deepEqual(generated.localVariables.map(fields), native.localVariables.map(fields));
  assert.deepEqual(generated.ladder, native.ladder);
  assert.equal(generated.localVariables[0][5].address, null);
  assert.equal(generated.localVariables[0][5].storageClass, "");
  assert.equal(generated.localVariables[0][5].allocationNumber, null);
  assert.equal(generated.localVariables[0][5].allocationWidth, null);
  const restored = parse_xgwx(update_xgwx_iec_local_symbol_address(cleared, 0, 5, "ON", "", "%MX8"));
  assert.deepEqual(restored.localVariables, original.localVariables);
  const remapped = parse_xgwx(update_xgwx_iec_local_symbol_address(cleared, 0, 5, "ON", "", "%MX100"));
  assert.equal(remapped.localVariables[0][5].address, "%MX100");
  assert.equal(remapped.localVariables[0][5].allocationNumber, 100);
  const retyped = parse_xgwx(update_xgwx_iec_local_symbol_type(cleared, 0, 5, "ON", "BOOL", "WORD"));
  assert.equal(retyped.localVariables[0][5].dataType, "WORD");
  assert.throws(() => update_xgwx_iec_local_symbol_address(source, 0, 5, "ON", "", "%MX9"));
});

test("bundled WASM clears captured IEC input and output mappings", async (context) => {
  const sourcePath = nativeFixturePath("Downloads/smarthome_project_0225.xgwx");
  const captures = nativeFixturePath("VMs/xg5000-win10/captures/smarthome-iec-address-io-unmap");
  const generatedPath = path.join(captures, "generated_io_unmapped.xgwx");
  const nativePath = path.join(captures, "native_resaved_generated_io_unmap.xgwx");
  if (![sourcePath, generatedPath, nativePath].every(fs.existsSync)) {
    context.skip("smart home native input/output unmap capture is unavailable");
    return;
  }
  await init({ module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm")) });
  const source = fs.readFileSync(sourcePath);
  const outputCleared = update_xgwx_iec_local_symbol_address(source, 0, 12, "조명_1", "%QX10", "");
  const bothCleared = update_xgwx_iec_local_symbol_address(outputCleared, 1, 3, "커튼_제어", "%IX0.0.7", "");
  assert.deepEqual(Buffer.from(bothCleared), fs.readFileSync(generatedPath));
  const generated = parse_xgwx(bothCleared);
  const native = parse_xgwx(fs.readFileSync(nativePath));
  const fields = (table) => table.map(({ recordOffset, ...symbol }) => symbol);
  assert.deepEqual(generated.localVariables.map(fields), native.localVariables.map(fields));
  assert.equal(generated.localVariables[0][12].address, null);
  assert.equal(generated.localVariables[1][3].address, null);
  assert.equal(native.localVariables[0][12].allocationNumber, null);
  assert.equal(native.localVariables[1][3].allocationNumber, null);
  assert.deepEqual(generated.ladder.slice(1), native.ladder.slice(1));
});

test("bundled WASM removes and repairs a captured IEC horizontal wire", async (context) => {
  const sourcePath = nativeFixturePath("Downloads/smarthome_project_0225.xgwx");
  const generatedPath = nativeFixturePath("VMs/xg5000-win10/captures/smarthome-iec-wire-delete/generated_l52_deleted.xgwx");
  if (![sourcePath, generatedPath].every(fs.existsSync)) {
    context.skip("smart home wire deletion fixture is unavailable");
    return;
  }
  await init({ module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm")) });
  const source = fs.readFileSync(sourcePath);
  const original = parse_xgwx(source);
  assert.ok(original.ladder[0].iecHorizontalWireDeletionSites.some(
    (site) => site.wireOffset === 0x1fd1 && site.rawX === 7,
  ));
  const removed = delete_xgwx_iec_ld_horizontal_wire(source, 0, 0x1fd1, 7);
  assert.deepEqual(Buffer.from(removed), fs.readFileSync(generatedPath));
  const gap = parse_xgwx(removed);
  assert.ok(gap.ladder[0].iecHorizontalWireRepairSites.some(
    (site) => site.insertionOffset === 0x1fd1 && site.rawX === 7,
  ));
  const repaired = parse_xgwx(repair_xgwx_iec_ld_horizontal_wire(removed, 0, 0x1fd1, 7));
  assert.deepEqual(repaired.ladder, original.ladder);
  assert.throws(() => delete_xgwx_iec_ld_horizontal_wire(source, 0, 0x1fd1, 8));
});

test("numeric IEC function expressions are type checked and survive native Save As", async (context) => {
  const sourcePath = nativeFixturePath("Downloads/smarthome_project_0225.xgwx");
  const captures = nativeFixturePath("VMs/xg5000-win10/captures/smarthome-iec-group-copy");
  const generatedPath = path.join(captures, "probe_expression_0_plus_1.xgwx");
  const resavedPath = path.join(captures, "native_resaved_expression_0_plus_1.xgwx");
  if (!fs.existsSync(sourcePath) || !fs.existsSync(generatedPath)) {
    context.skip("smart home fixture or generated expression is unavailable");
    return;
  }
  await init({ module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm")) });
  const source = fs.readFileSync(sourcePath);
  const edited = update_xgwx_iec_ld_function_operand(source, 1, 1422, "0", "0+1");
  assert.deepEqual(Buffer.from(edited), fs.readFileSync(generatedPath));
  const generated = parse_xgwx(edited);
  assert.equal(generated.ladder[1].sourceStrings.find((item) => item.offset === 1422)?.value, "0+1");
  assert.ok(generated.ladder[1].iecCircuitGraph);
  assert.throws(() => update_xgwx_iec_ld_function_operand(source, 1, 615, "T#5s", "0+1"));
  assert.throws(() => update_xgwx_iec_ld_function_operand(source, 1, 1452, "%MW301", "0+1"));
  assert.throws(() => update_xgwx_iec_ld_function_operand(source, 1, 1422, "0", "0+TRUE"));
  assert.throws(() => update_xgwx_iec_ld_function_operand(source, 1, 1422, "0", "0+%IWbad"));
  const nested = parse_xgwx(update_xgwx_iec_ld_function_operand(
    source, 1, 1422, "0", "(0 + 1) * 2",
  ));
  assert.equal(nested.ladder[1].sourceStrings.find((item) => item.offset === 1422)?.value,
    "(0 + 1) * 2");
  if (fs.existsSync(resavedPath)) {
    assert.deepEqual(generated.ladder, parse_xgwx(fs.readFileSync(resavedPath)).ladder);
  }
});

test("leading IEC contact insertion restores the native captured branch", async (context) => {
  const captures = nativeFixturePath("VMs/xg5000-win10/captures/smarthome-iec-branched-contact-insert");
  const deletedPath = path.join(captures, "native-leading-contact-deleted.xgwx");
  const insertedPath = path.join(captures, "native-leading-contact-inserted.xgwx");
  if (!fs.existsSync(deletedPath) || !fs.existsSync(insertedPath)) {
    context.skip("native XG5000 captures are unavailable");
    return;
  }
  await init({ module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm")) });
  const deleted = fs.readFileSync(deletedPath);
  const site = parse_xgwx(deleted).ladder[0].iecLeadingContactInsertionSites.find((item) =>
    item.groupIndex === 3 && item.rowIndex === 3);
  assert.equal(site.insertionOffset, 339);
  assert.throws(() => insert_xgwx_iec_ld_leading_contact(deleted, 0, 340, "NO", "시작"));
  assert.throws(() => insert_xgwx_iec_ld_leading_contact(deleted, 0, 339, "NO", "MISSING_BOOL + 1"));
  const unresolved = insert_xgwx_iec_ld_leading_contact(deleted, 0, 339, "NO", "MISSING_BOOL");
  const declarations = parse_xgwx(deleted).localVariables;
  assert.ok(declarations[0].length > 0);
  assert.deepEqual(parse_xgwx(unresolved).localVariables, declarations);
  const inserted = insert_xgwx_iec_ld_leading_contact(deleted, 0, 339, "NO", "시작");
  assert.deepEqual(parse_xgwx(inserted).ladder, parse_xgwx(fs.readFileSync(insertedPath)).ladder);
  assert.equal(parse_xgwx(inserted).ladder[0].iecLeadingContactInsertionSites.length, 0);
  const nativeCellDeletePath = path.join(captures, "native-leading-cell-deleted.xgwx");
  const cellSite = parse_xgwx(inserted).ladder[0].iecNoContactCellDeletionSites.find((item) =>
    item.groupIndex === 3 && item.rowIndex === 3 && item.rawX === 1);
  assert.equal(cellSite.contactOffset, 339);
  assert.throws(() => delete_xgwx_iec_ld_contact_cell(inserted, 0, 339, 1, "NC", "시작"));
  const cellDeleted = delete_xgwx_iec_ld_contact_cell(inserted, 0, 339, 1, "NO", "시작");
  assert.deepEqual(parse_xgwx(cellDeleted).ladder,
    parse_xgwx(fs.readFileSync(nativeCellDeletePath)).ladder);
  const shortWireSite = parse_xgwx(cellDeleted).ladder[0].iecShortWireContactInsertionSites.find((item) =>
    item.groupIndex === 3 && item.rowIndex === 3 && item.rawX === 4);
  assert.equal(shortWireSite.wireOffset, 366);
  assert.throws(() => insert_xgwx_iec_ld_short_wire_contact(cellDeleted, 0, 366, 7, "NO", "시작"));
  assert.throws(() => insert_xgwx_iec_ld_short_wire_contact(cellDeleted, 0, 366, 4, "NO", "MISSING_BOOL + 1"));
  const shortWireInserted = insert_xgwx_iec_ld_short_wire_contact(cellDeleted, 0, 366, 4, "NO", "시작");
  assert.deepEqual(parse_xgwx(shortWireInserted).ladder,
    parse_xgwx(fs.readFileSync(path.join(captures, "native-short-wire-contact-inserted.xgwx"))).ladder);
});

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
  assert.equal(summary.ladder[0].projectType, 1);
  assert.ok(summary.ladder[0].sourceStrings.some((item) => item.value === "M00000"));
});

test("bundled WASM preserves IEC LD text from an optional XGI workspace", async (context) => {
  const fixture = process.env.LIBXGWX_XGI_FIXTURE;
  if (!fixture || !fs.existsSync(fixture)) {
    context.skip("set LIBXGWX_XGI_FIXTURE to an XGI workspace");
    return;
  }
  await init({ module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm")) });
  const source = fs.readFileSync(fixture);
  const summary = parse_xgwx(source);
  assert.equal(summary.cpu.model, "XGI-CPUE");
  assert.equal(summary.ladder.length, 7);
  assert.ok(summary.ladder[0].iecNoContactDeletionSites.some((site) =>
    site.groupIndex === 3 && site.rowIndex === 3 && site.contactOffset === 339
      && site.rawX === 1 && site.contactCode === 6));
  const leadingContactDeleted = parse_xgwx(delete_xgwx_iec_ld_contact(
    source, 0, 339, 1, "NO", "시작",
  ));
  assert.equal(leadingContactDeleted.ladder[0].iecRows.find((row) =>
    row.groupIndex === 3 && row.rowIndex === 3).recordCount,
  summary.ladder[0].iecRows.find((row) =>
    row.groupIndex === 3 && row.rowIndex === 3).recordCount - 1);
  assert.throws(() => delete_xgwx_iec_ld_contact(source, 0, 339, 1, "NO", "STALE"));
  const deletedBranchTop = parse_xgwx(delete_xgwx_iec_ld_branch_top_row(source, 0, 3, 3));
  assert.equal(deletedBranchTop.ladder[0].iecRows.length, summary.ladder[0].iecRows.length - 1);
  assert.equal(deletedBranchTop.ladder[0].iecRows.find((row) =>
    row.groupIndex === 3).recordCount, 2);
  assert.ok(deletedBranchTop.ladder[0].iecCircuitGraph);
  assert.throws(() => delete_xgwx_iec_ld_branch_top_row(source, 0, 3, 4));
  const deletedSimpleRowBytes = delete_xgwx_iec_ld_simple_row(
    source, 0, 2, "RISING", "스위치_1", "OUTPUT", "시작",
  );
  const deletedSimpleRow = parse_xgwx(deletedSimpleRowBytes);
  assert.equal(deletedSimpleRow.ladder[0].iecRows.length, summary.ladder[0].iecRows.length - 1);
  assert.equal(deletedSimpleRow.ladder[0].iecRows.find((row) => row.groupIndex === 2).rowIndex, 2);
  assert.throws(() => delete_xgwx_iec_ld_simple_row(
    source, 0, 2, "RISING", "STALE", "OUTPUT", "시작",
  ));
  assert.equal(summary.variables.length, 0);
  assert.deepEqual(summary.localVariables.map((symbols) => symbols.length), [15, 7, 14, 36, 23, 3, 3]);
  assert.ok(summary.ladder[2].iecNoContactInsertionSites.some((site) => site.wireOffset === 6856 && site.rowIndex === 40));
  assert.ok(summary.ladder[2].iecNoContactDeletionSites.some((site) => site.contactOffset === 6825 && site.rawX === 13));
  assert.ok(summary.ladder[2].iecNoContactCellDeletionSites.some((site) => site.contactOffset === 6825 && site.rawX === 13));
  const originalContactDeletedBytes = delete_xgwx_iec_ld_no_contact(source, 2, 6825, 13, "현관도어닫힘");
  const originalContactDeleted = parse_xgwx(originalContactDeletedBytes);
  assert.equal(originalContactDeleted.ladder[2].iecRows.find((row) => row.rowIndex === 40).recordCount, 4);
  assert.deepEqual(originalContactDeleted.ladder[2].iecHorizontalWireRepairSites,
    [{ groupIndex: 14, rowIndex: 40, insertionOffset: 6825, rawX: 13 }]);
  const originalWireRepaired = parse_xgwx(repair_xgwx_iec_ld_horizontal_wire(
    originalContactDeletedBytes, 2, 6825, 13,
  ));
  assert.equal(originalWireRepaired.ladder[2].iecRows.find((row) => row.rowIndex === 40).recordCount, 5);
  assert.equal(originalWireRepaired.ladder[2].iecRecords.find((record) =>
    record.rowIndex === 40 && record.offset === 6825).kind, "Short wire");
  assert.deepEqual(originalWireRepaired.ladder[2].iecHorizontalWireRepairSites, []);
  assert.deepEqual(originalContactDeleted.ladder.filter((_, index) => index !== 2), summary.ladder.filter((_, index) => index !== 2));
  assert.deepEqual(originalWireRepaired.ladder.filter((_, index) => index !== 2), summary.ladder.filter((_, index) => index !== 2));
  const linearInserted = parse_xgwx(insert_xgwx_iec_ld_no_contact(source, 2, 6856, 19, 16, 91, "도어열림"));
  assert.equal(linearInserted.ladder[2].iecRows.find((row) => row.rowIndex === 40).recordCount, 7);
  assert.deepEqual(linearInserted.ladder.filter((_, index) => index !== 2), summary.ladder.filter((_, index) => index !== 2));
  const added = parse_xgwx(insert_xgwx_iec_local_symbol(source, 0, "TEST_LOCAL", "BOOL", ""));
  assert.equal(added.localVariables[0].length, 16);
  assert.equal(added.localVariables[0][6].name, "TEST_LOCAL");
  assert.equal(added.localVariables[0][6].dataType, "BOOL");
  assert.equal(added.localVariables[0][6].allocationNumber, null);
  assert.deepEqual(added.localVariables.slice(1), summary.localVariables.slice(1));
  assert.deepEqual(added.ladder, summary.ladder);
  const insertedBytes = insert_xgwx_iec_local_symbol(source, 0, "TEST_LOCAL", "BOOL", "");
  const deleted = parse_xgwx(delete_xgwx_iec_local_symbol(insertedBytes, 0, 6, "TEST_LOCAL"));
  assert.deepEqual(deleted.localVariables, summary.localVariables);
  assert.deepEqual(deleted.ladder, summary.ladder);
  assert.throws(() => delete_xgwx_iec_local_symbol(insertedBytes, 0, 6, "STALE"));
  assert.throws(() => delete_xgwx_iec_local_symbol(source, 0, 5, "ON"));
  assert.throws(() => insert_xgwx_iec_local_symbol(source, 0, "ON", "BOOL", ""));
  assert.equal(summary.counts.variables, 101);
  assert.ok(summary.localVariables[0].some((symbol) => symbol.name === "ON" && symbol.address === "%MX8" && symbol.storageClass === "M"));
  assert.equal(summary.localVariables[4][18].dataType, "INT");
  assert.equal(summary.localVariables[4][18].allocationWidth, 16);
  const typeEdited = parse_xgwx(update_xgwx_iec_local_symbol_type(source, 4, 18, "메모리값", "INT", "WORD"));
  assert.equal(typeEdited.localVariables[4][18].dataType, "WORD");
  assert.equal(typeEdited.localVariables[4][18].storageClass, "");
  assert.equal(typeEdited.localVariables[4][18].allocationNumber, null);
  assert.deepEqual(typeEdited.ladder, summary.ladder);
  assert.throws(() => update_xgwx_iec_local_symbol_type(source, 0, 5, "ON", "BOOL", "WORD"));
  assert.ok(summary.localVariables[0].some((symbol) => symbol.name === "INST3" && symbol.typeReference === "R_TRIG" && symbol.isInstance));
  const onIndex = summary.localVariables[0].findIndex((symbol) => symbol.name === "ON");
  const descriptionEdit = parse_xgwx(update_xgwx_iec_local_symbol_description(source, 0, onIndex, "ON", "", "Living room switch"));
  assert.equal(descriptionEdit.localVariables[0][onIndex].description, "Living room switch");
  assert.deepEqual(descriptionEdit.ladder, summary.ladder);
  assert.throws(() => update_xgwx_iec_local_symbol_description(source, 0, onIndex, "ON", "stale", "Living room switch"));
  const localAddressEdit = update_xgwx_iec_local_symbol_address(source, 0, onIndex, "ON", "%MX8", "%MX9");
  const localAddressSummary = parse_xgwx(localAddressEdit);
  assert.equal(localAddressSummary.localVariables[0][onIndex].address, "%MX9");
  assert.deepEqual(localAddressSummary.localVariables.slice(1), summary.localVariables.slice(1));
  assert.deepEqual(localAddressSummary.ladder, summary.ladder);
  const longerAddress = update_xgwx_iec_local_symbol_address(source, 0, onIndex, "ON", "%MX8", "%MX100");
  assert.equal(parse_xgwx(longerAddress).localVariables[0][onIndex].address, "%MX100");
  const restoredAddress = update_xgwx_iec_local_symbol_address(longerAddress, 0, onIndex, "ON", "%MX100", "%MX8");
  assert.deepEqual(parse_xgwx(restoredAddress).localVariables, summary.localVariables);
  assert.deepEqual(parse_xgwx(longerAddress).ladder, summary.ladder);
  assert.throws(() => update_xgwx_iec_local_symbol_address(source, 0, onIndex, "ON", "%MX8", "%MX08"));
  assert.throws(() => update_xgwx_iec_local_symbol_address(source, 0, onIndex, "ON", "%MX8", "%IX9"));
  assert.throws(() => update_xgwx_iec_local_symbol_address(source, 0, onIndex, "ON", "%MX8", "%MX7"));
  assert.throws(() => update_xgwx_iec_local_symbol_address(source, 0, onIndex, "OFF", "%MX8", "%MX9"));
  const renamed = parse_xgwx(rename_xgwx_iec_local_symbol(source, 0, onIndex, "ON", "ON2"));
  assert.equal(renamed.localVariables[0][onIndex].name, "ON2");
  assert.equal(renamed.ladder[0].sourceStrings.filter((item) => item.value === "ON2").length, 6);
  assert.equal(renamed.ladder[0].sourceStrings.filter((item) => item.value === "ON").length, 0);
  assert.deepEqual(renamed.ladder.slice(1), summary.ladder.slice(1));
  assert.throws(() => rename_xgwx_iec_local_symbol(source, 0, onIndex, "ON", "OFF"));
  assert.throws(() => rename_xgwx_iec_local_symbol(source, 0, onIndex, "OFF", "ON2"));
  const lightIndex = summary.localVariables[0].findIndex((symbol) => symbol.name === "조명_1");
  const unicodeRename = parse_xgwx(rename_xgwx_iec_local_symbol(source, 0, lightIndex, "조명_1", "조명_1A"));
  assert.equal(unicodeRename.ladder[0].sourceStrings.filter((item) => item.value === "조명_1A").length, 8);
  const instanceRename = parse_xgwx(rename_xgwx_iec_local_symbol(source, 0, 1, "INST3", "INST4"));
  assert.equal(instanceRename.localVariables[0][1].name, "INST4");
  assert.equal(instanceRename.ladder[0].iecFunctions.filter((block) => block.instance === "INST4" && block.name === "R_TRIG").length, 1);
  assert.equal(instanceRename.ladder[0].iecFunctions.filter((block) => block.instance === "INST3").length, 0);
  assert.throws(() => rename_xgwx_iec_local_symbol(source, 0, 1, "INST3", "INST_사본1"));
  assert.ok(summary.ladder.every((program) => program.projectType === 2 && !program.structuralEditing));
  assert.deepEqual(summary.ladder.map((program) => program.iecRows.length), [86, 13, 40, 77, 41, 46, 80]);
  assert.deepEqual(summary.ladder.map((program) => program.iecGeometry.horizontal.length), [52, 18, 48, 77, 23, 18, 37]);
  assert.deepEqual(summary.ladder.map((program) => program.iecGeometry.vertical.length), [27, 6, 12, 34, 4, 23, 86]);
  assert.deepEqual(summary.ladder.map((program) => program.iecCircuitGraph.edges.length), [153, 47, 101, 239, 69, 76, 212]);
  assert.deepEqual(summary.ladder.map((program) => program.iecCircuitGraph.occupiedAreas.length), [171, 44, 105, 224, 88, 80, 169]);
  assert.deepEqual(summary.ladder.map((program) => program.iecCircuitGraph.functionBindings.length), [50, 4, 23, 24, 23, 28, 44]);
  assert.deepEqual(summary.ladder.map((program) => program.iecCircuitGraph.powerComponents.length), [24, 5, 15, 29, 13, 7, 9]);
  assert.equal(summary.ladder.reduce((total, program) => total
    + program.iecCircuitGraph.functionBindings.filter((binding) => binding.expressionRecordOffset != null).length, 0), 176);
  assert.ok(summary.ladder.every((program) => program.iecCircuitGraph.edges.every((edge) =>
    edge.start.groupIndex === edge.end.groupIndex
      && edge.start.x % 3 === 0 && edge.end.x % 3 === 0)));
  assert.ok(summary.ladder.every((program) => program.iecCircuitGraph.powerComponents
    .flatMap((component) => component.edgeIndices).sort((a, b) => a - b)
    .every((edgeIndex, index) => edgeIndex === index)));
  assert.deepEqual(summary.ladder.map((program) => program.iecRecords.length), [289, 61, 157, 320, 129, 160, 391]);
  assert.deepEqual(summary.ladder.map((program) => program.iecRecords.filter((record) => record.kind === "Function block").length), [23, 2, 9, 10, 10, 11, 16]);
  assert.deepEqual(summary.ladder.map((program) => program.iecFunctions.length), [23, 2, 9, 10, 10, 11, 16]);
  assert.deepEqual(summary.ladder.map((program) =>
    program.iecTerminalFunctionDeletionSites.length), [1, 0, 0, 5, 1, 0, 0]);
  assert.deepEqual(summary.ladder.map((program) =>
    program.iecStandaloneFunctionDeletionSites.length), [0, 0, 1, 0, 1, 0, 0]);
  assert.deepEqual(summary.ladder[4].iecStandaloneFunctionInsertionSites, [{
    groupIndex: 15, rowIndex: 26, insertionOffset: 4054, rawX: 4,
  }]);
  const smartHomeInsertion = parse_xgwx(insert_xgwx_iec_ld_standalone_function(
    source, 4, 4054, "WORD_TO_UDINT", "%MW301", "div_값"));
  assert.equal(smartHomeInsertion.ladder[4].iecRows.length,
    summary.ladder[4].iecRows.length + 3);
  assert.ok(smartHomeInsertion.ladder[4].iecFunctions.some((block) =>
    block.name === "WORD_TO_UDINT" && block.rowIndex === 26));
  assert.ok(smartHomeInsertion.ladder[4].iecCircuitGraph);
  assert.deepEqual(summary.ladder.map((program) =>
    program.iecFunctionCellDeletionSites.length), [4, 0, 0, 0, 0, 0, 0]);
  assert.deepEqual(summary.ladder[0].iecConnectedArithmeticDeletionSites, [{
    groupIndex: 14, rowIndex: 20, blockOffset: 2858, wireOffset: 2839, rawX: 16,
  }, {
    groupIndex: 16, rowIndex: 26, blockOffset: 4076, wireOffset: 4057, rawX: 16,
  }]);
  assert.deepEqual(summary.ladder.map((program) =>
    program.iecFunctionCellInsertionSites.length), [0, 0, 0, 0, 0, 0, 0]);
  assert.deepEqual(summary.ladder.map((program) => program.iecFunctionReferences.length), [50, 4, 23, 24, 23, 28, 44]);
  assert.deepEqual(summary.ladder.map((program) => program.iecFunctionOperandLinks.length), [45, 3, 16, 19, 23, 27, 43]);
  assert.equal(summary.ladder.reduce((total, program) =>
    total + program.iecFunctions.reduce((pins, block) => pins + block.pins.length, 0), 0), 192);
  assert.equal(summary.ladder.reduce((total, program) =>
    total + program.iecFunctions.reduce((pins, block) => pins + block.pins.filter((pin) => pin.isArray).length, 0), 0), 46);
  assert.ok(summary.ladder[0].iecNoContactInsertionSites.some((site) =>
    site.groupIndex === 2 && site.rowIndex === 2 && site.wireOffset === 252 && site.startX === 4 && site.endX === 91));
  assert.ok(summary.ladder[0].iecNoContactInsertionSites.some((site) =>
    site.groupIndex === 3 && site.rowIndex === 3 && site.wireOffset === 416 && site.startX === 7 && site.endX === 91));
  assert.equal(summary.ladder.reduce((sum, program) => sum + program.iecFunctions.filter((block) => block.instance != null).length, 0), 11);
  for (const program of summary.ladder) {
    for (const record of program.iecRecords.filter((item) => item.kind === "Short wire")) {
      const segment = program.iecGeometry.horizontal.find((item) => item.offset === record.offset);
      assert.ok(segment);
      assert.equal(segment.endX - segment.startX, 3);
      assert.equal(segment.rowIndex, record.rowIndex);
    }
    assert.equal(program.iecRows[0].rowIndex, 0);
    assert.equal(program.iecRows.at(-1).end, program.decodedLen);
    assert.ok(program.sourceStrings.every((item) => item.iecRowIndex != null && item.iecGroupIndex != null));
    assert.ok(program.sourceStrings.every((item) => item.iecRecordOffset != null && item.iecRecordKind != null));
    assert.ok(program.sourceStrings.filter((item) => item.iecPosition).every((item) => item.iecPosition[1] / 4 === item.iecRowIndex));
    assert.equal(program.sourceStrings.filter((item) => item.isIecFunctionName).length, program.iecFunctions.length);
    for (const block of program.iecFunctions) {
      const name = program.sourceStrings.find((item) => item.offset === block.nameOffset);
      assert.equal(name.value, block.name);
      assert.deepEqual(name.iecPosition, [block.rawX, block.rowIndex * 4]);
      const links = program.iecFunctionReferences.filter((reference) => reference.targetRecordOffset === block.recordOffset);
      assert.equal(links.length, block.pinCount);
      assert.deepEqual(links.map((link) => link.ordinal).sort((a, b) => a - b), Array.from({ length: block.pinCount }, (_, i) => i + 1));
      assert.equal(links.filter((link) => link.isOutput).length, 1);
      assert.equal(links.find((link) => link.isOutput).ordinal, block.pinCount);
      assert.equal(block.controlInput.direction, "input");
      assert.equal(block.controlOutput.direction, "output");
      assert.equal(block.controlInput.dataType, "BOOL");
      assert.equal(block.controlOutput.dataType, "BOOL");
      assert.ok(block.pins.every((pin) => pin.dataType != null));
      const referencePins = [block.controlInput, block.controlOutput, ...block.pins]
        .filter((pin) => pin.referenceOrdinal != null);
      assert.equal(referencePins.length, block.pinCount);
      if (block.instanceOffset != null) {
        assert.equal(program.sourceStrings.find((item) => item.offset === block.instanceOffset).value, block.instance);
      }
    }
    for (const reference of program.iecFunctionReferences) {
      const target = program.iecFunctions.find((block) => block.recordOffset === reference.targetRecordOffset);
      assert.ok(target);
      assert.equal(reference.groupIndex, target.groupIndex);
      assert.equal(reference.rawX, target.rawX);
      assert.equal(reference.targetRowIndex, target.rowIndex);
      assert.ok(reference.rowIndex > reference.targetRowIndex);
      assert.ok(reference.code === 0x68 || reference.code === 0x69);
      assert.equal(reference.isOutput, reference.code === 0x69);
      assert.ok(reference.ordinal > 0);
      const pin = [target.controlInput, target.controlOutput, ...target.pins]
        .find((candidate) => candidate.referenceOrdinal === reference.ordinal);
      assert.ok(pin);
      assert.equal(reference.pinRowIndex, pin.rowIndex);
      assert.equal(reference.pinRawX, pin.rawX);
      assert.equal(reference.dataTypeMask, pin.dataTypeMask);
      assert.equal(reference.isArray, pin.isArray);
    }
    for (const link of program.iecFunctionOperandLinks) {
      const block = program.iecFunctions.find((candidate) => candidate.recordOffset === link.targetRecordOffset);
      assert.ok(block);
      assert.equal(link.groupIndex, block.groupIndex);
      assert.ok(link.ordinal >= 1 && link.ordinal <= block.pinCount);
      assert.equal(link.isOutput, link.ordinal === block.pinCount);
      const record = program.iecRecords.find((candidate) => candidate.offset === link.recordOffset);
      assert.equal(record.kind, "Function operand");
      const expression = program.sourceStrings.find((item) => item.offset === record.offset + 15);
      assert.ok(expression?.isIecFunctionOperand);
      assert.equal(expression.iecPosition[1], link.rowIndex * 4);
      assert.equal(expression.iecPosition[0], block.rawX + (link.isOutput ? 3 : -3));
      assert.equal(link.pinRowIndex, link.rowIndex);
      assert.equal(link.pinRawX, block.rawX + (link.isOutput ? 3 : 0));
      assert.ok(link.dataTypeMask > 0);
    }
    assert.ok(program.iecGeometry.vertical.every((wire) => wire.endRowIndex > wire.startRowIndex && wire.startOffset < wire.endOffset));
    for (const row of program.iecRows) {
      const records = program.iecRecords.filter((record) => record.groupIndex === row.groupIndex && record.rowIndex === row.rowIndex);
      assert.equal(records.length, row.recordCount);
      assert.equal(records.at(-1)?.end ?? row.start + 35, row.end);
    }
  }
  assert.equal(summary.ladder.reduce((total, program) => total + program.sourceStrings.filter((item) => item.isIecComment).length, 0), 46);
  assert.equal(summary.ladder.reduce((total, program) => total + program.sourceStrings.filter((item) => item.isIecRisingContactOperand).length, 0), 9);
  assert.equal(summary.ladder.reduce((total, program) => total + program.sourceStrings.filter((item) => item.iecElementKind).length, 0), 351);
  assert.ok(summary.ladder[0].sourceStrings.some((item) => item.iecPosition?.[1] > 255));
  assert.equal(summary.ladder.reduce((total, program) => total + program.sourceStrings.filter((item) => item.isIecFunctionOperand).length, 0), 176);
  assert.equal(summary.ladder.reduce((total, program) => total + program.sourceStrings.filter((item) => item.isIecArithmeticFunction).length, 0), 9);
  assert.equal(summary.ladder.reduce((total, program) => total + program.sourceStrings.filter((item) => item.isIecFixedFunctionBlock).length, 0), 61);
  assert.equal(summary.ladder.reduce((total, program) => total + program.sourceStrings.filter((item) => item.isIecComparisonFunction).length, 0), 29);
  const add = summary.ladder.flatMap((program) => program.iecFunctions).find((block) => block.name === "ADD");
  assert.deepEqual(add.pins.map((pin) => [pin.name, pin.direction, pin.referenceOrdinal, pin.dataType]), [
    ["IN1", "input", 1, "ANY_NUM"],
    ["OUT", "output", 3, "ANY_NUM"],
    ["IN2", "input", 2, "ANY_NUM"],
  ]);
  assert.ok(summary.ladder[0].sourceStrings.some((item) => item.value === "조명제어"));
  const comment = summary.ladder[0].sourceStrings.find((item) => item.value === "조명제어");
  const symbol = summary.ladder[0].sourceStrings.find((item) => item.value === "스위치_1");
  assert.equal(comment.isIecComment, true);
  assert.equal(symbol.isIecComment, false);
  assert.equal(symbol.isIecRisingContactOperand, true);
  const updated = update_xgwx_iec_ld_comment(source, 0, comment.offset, comment.value, "조명시험");
  const parsed = parse_xgwx(updated);
  assert.equal(parsed.ladder[0].sourceStrings.find((item) => item.offset === comment.offset).value, "조명시험");
  assert.deepEqual(parsed.ladder.slice(1), summary.ladder.slice(1));
  assert.throws(() => update_xgwx_iec_ld_comment(source, 0, symbol.offset, symbol.value, "스위치_2"));
  const contactEdit = update_xgwx_iec_ld_rising_contact_operand(source, 0, symbol.offset, symbol.value, "ON");
  assert.equal(parse_xgwx(contactEdit).ladder[0].sourceStrings.find((item) => item.offset === symbol.offset).value, "ON");
  assert.throws(() => update_xgwx_iec_ld_rising_contact_operand(source, 0, symbol.offset, "stale", "ON"));
  assert.throws(() => update_xgwx_iec_ld_rising_contact_operand(source, 0, symbol.offset, symbol.value, "X".repeat(256)));
  const normal = summary.ladder[0].sourceStrings.find((item) => item.iecElementKind === "Normally open contact variable" && item.value === "시작");
  const closed = summary.ladder[0].sourceStrings.find((item) => item.iecElementKind === "Normally closed contact variable" && item.value === "조명_1");
  const coil = summary.ladder[0].sourceStrings.find((item) => item.iecElementKind === "Output coil variable" && item.value === "조명_1");
  assert.ok(normal && closed && coil);
  assert.deepEqual(normal.iecPosition, [1, 12]);
  assert.deepEqual(closed.iecPosition, [4, 12]);
  assert.deepEqual(coil.iecPosition, [94, 12]);
  const moveBlock = summary.ladder[0].sourceStrings.find((item) => item.isIecFixedFunctionBlock && item.value === "MOVE");
  assert.deepEqual(moveBlock.iecPosition, [4, 88]);
  const closedContactBytes = update_xgwx_iec_ld_contact_kind(source, 0, normal.offset, "NO", "NC");
  const changedContact = parse_xgwx(closedContactBytes).ladder[0].sourceStrings.find((item) => item.offset === normal.offset);
  assert.equal(changedContact.iecElementKind, "Normally closed contact variable");
  assert.equal(changedContact.value, normal.value);
  const negatedRisingBytes = update_xgwx_iec_ld_contact_kind(
    source, 0, symbol.offset, "RISING", "NEGATED_RISING",
  );
  const changedRising = parse_xgwx(negatedRisingBytes).ladder[0].sourceStrings.find((item) => item.offset === symbol.offset);
  assert.equal(changedRising.iecElementKind, "Negated rising-edge contact variable");
  assert.equal(changedRising.value, symbol.value);
  const restoredRising = parse_xgwx(update_xgwx_iec_ld_contact_kind(
    negatedRisingBytes, 0, symbol.offset, "NEGATED_RISING", "RISING",
  )).ladder[0].sourceStrings.find((item) => item.offset === symbol.offset);
  assert.equal(restoredRising.iecElementKind, "Rising-edge contact variable");
  assert.throws(() => update_xgwx_iec_ld_contact_kind(source, 0, normal.offset, "NC", "NO"));
  assert.throws(() => update_xgwx_iec_ld_contact_kind(source, 0, symbol.offset, "FALLING", "NO"));
  assert.throws(() => update_xgwx_iec_ld_contact_kind(source, 0, coil.offset, "NO", "NC"));
  const branch = summary.ladder[6].iecGeometry.vertical.find((segment) =>
    segment.groupIndex === 3 && segment.startRowIndex === 3
      && segment.endRowIndex === 4 && segment.x === 6);
  assert.ok(branch);
  const removedBranchBytes = edit_xgwx_iec_ld_branch_segment(source, 6, 3, 3, 4, 6, true, false);
  const removedBranch = parse_xgwx(removedBranchBytes);
  assert.equal(removedBranch.ladder[6].iecGeometry.vertical.length, 85);
  assert.ok(!removedBranch.ladder[6].iecGeometry.vertical.some((segment) =>
    segment.groupIndex === 3 && segment.startRowIndex === 3
      && segment.endRowIndex === 4 && segment.x === 6));
  assert.deepEqual(removedBranch.ladder.slice(0, 6), summary.ladder.slice(0, 6));
  assert.throws(() => edit_xgwx_iec_ld_branch_segment(
    removedBranchBytes, 6, 3, 3, 4, 6, true, false,
  ), /changed since selection/);
  const restoredBranchBytes = edit_xgwx_iec_ld_branch_segment(
    removedBranchBytes, 6, 3, 3, 4, 6, false, true,
  );
  assert.deepEqual(parse_xgwx(restoredBranchBytes).ladder, summary.ladder);
  const finalBranchRemoved = parse_xgwx(edit_xgwx_iec_ld_branch_segment(
    source, 0, 3, 3, 4, 6, true, false,
  ));
  assert.equal(finalBranchRemoved.ladder[0].iecRows.length, 85);
  assert.equal(finalBranchRemoved.ladder[0].iecRecords.length, 286);
  assert.equal(finalBranchRemoved.ladder[0].iecGeometry.vertical.length, 26);
  assert.deepEqual(finalBranchRemoved.ladder.slice(1), summary.ladder.slice(1));
  const blankRowBytes = insert_xgwx_iec_ld_blank_row(source, 0, 30);
  const blankRow = parse_xgwx(blankRowBytes);
  assert.equal(blankRow.ladder[0].iecRows.length, summary.ladder[0].iecRows.length);
  for (const before of summary.ladder[0].iecRows) {
    const after = blankRow.ladder[0].iecRows.find((row) => row.start === before.start);
    assert.ok(after);
    assert.equal(after.rowIndex, before.rowIndex + Number(before.rowIndex > 30));
    assert.equal(after.groupIndex, before.groupIndex);
    assert.equal(after.recordCount, before.recordCount);
  }
  assert.equal(blankRow.ladder[0].iecCircuitGraph.edges.length,
    summary.ladder[0].iecCircuitGraph.edges.length);
  assert.equal(blankRow.ladder[0].iecCircuitGraph.functionBindings.length,
    summary.ladder[0].iecCircuitGraph.functionBindings.length);
  assert.deepEqual(blankRow.ladder.slice(1), summary.ladder.slice(1));
  assert.throws(() => insert_xgwx_iec_ld_blank_row(blankRowBytes, 0, 91));
  const createdRungBytes = insert_xgwx_iec_ld_linear_rung(
    blankRowBytes, 0, 31, "ON", "OFF",
  );
  const createdRung = parse_xgwx(createdRungBytes);
  const createdRow = createdRung.ladder[0].iecRows.find((row) => row.rowIndex === 31);
  assert.ok(createdRow);
  assert.equal(createdRow.groupIndex, 17);
  assert.equal(createdRow.recordCount, 3);
  assert.deepEqual(
    createdRung.ladder[0].iecRecords
      .filter((record) => record.groupIndex === 17 && record.rowIndex === 31)
      .map((record) => [record.kind, record.code ?? null]),
    [["Contact", 6], ["Long wire", null], ["Coil", 14]],
  );
  assert.ok(createdRung.ladder[0].iecCircuitGraph.powerComponents.some((component) =>
    component.groupIndex === 17 && component.touchesLeftRail && component.touchesRightRail));
  assert.equal(createdRung.ladder[0].iecCircuitGraph.edges.length,
    summary.ladder[0].iecCircuitGraph.edges.length + 3);
  assert.deepEqual(createdRung.ladder.slice(1), summary.ladder.slice(1));
  assert.deepEqual(
    delete_xgwx_iec_ld_linear_rung(createdRungBytes, 0, 31, "ON", "OFF"),
    blankRowBytes,
  );
  assert.throws(() => delete_xgwx_iec_ld_linear_rung(
    createdRungBytes, 0, 31, "STALE", "OFF",
  ));
  const createdContact = createdRung.ladder[0].sourceStrings.find((item) => (
    item.iecRowIndex === 31 && item.iecRecordKind === "Contact" && item.value === "ON"
  ));
  const createdCoil = createdRung.ladder[0].sourceStrings.find((item) => (
    item.iecRowIndex === 31 && item.iecRecordKind === "Coil" && item.value === "OFF"
  ));
  assert.ok(createdContact);
  assert.ok(createdCoil);
  let kindEditedBytes = update_xgwx_iec_ld_contact_kind(
    createdRungBytes, 0, createdContact.offset, "NO", "FALLING",
  );
  kindEditedBytes = update_xgwx_iec_ld_coil_kind(
    kindEditedBytes, 0, createdCoil.offset, "OUTPUT", "SET",
  );
  const kindEdited = parse_xgwx(kindEditedBytes);
  assert.deepEqual(
    kindEdited.ladder[0].iecRecords
      .filter((record) => record.groupIndex === 17 && record.rowIndex === 31)
      .map((record) => [record.kind, record.code ?? null]),
    [["Contact", 0x09], ["Long wire", null], ["Coil", 0x10]],
  );
  kindEditedBytes = update_xgwx_iec_ld_contact_kind(
    kindEditedBytes, 0, createdContact.offset, "FALLING", "NO",
  );
  kindEditedBytes = update_xgwx_iec_ld_coil_kind(
    kindEditedBytes, 0, createdCoil.offset, "SET", "OUTPUT",
  );
  assert.deepEqual(kindEditedBytes, createdRungBytes);
  for (const [contactKind, contactCode, coilKind, coilCode] of [
    ["NC", 0x07, "INVERSE", 0x0f],
    ["RISING", 0x08, "RISING", 0x12],
    ["FALLING", 0x09, "SET", 0x10],
    ["NEGATED_RISING", 0x0a, "FALLING", 0x13],
    ["NEGATED_FALLING", 0x0b, "RESET", 0x11],
  ]) {
    const variantBytes = insert_xgwx_iec_ld_rung(
      blankRowBytes, 0, 31, contactKind, "ON", coilKind, "OFF",
    );
    const variant = parse_xgwx(variantBytes);
    assert.deepEqual(
      variant.ladder[0].iecRecords
        .filter((record) => record.groupIndex === 17 && record.rowIndex === 31)
        .map((record) => [record.kind, record.code ?? null]),
      [["Contact", contactCode], ["Long wire", null], ["Coil", coilCode]],
    );
    assert.equal(
      variant.ladder[0].sourceStrings.filter((item) => (
        item.iecRowIndex === 31
          && ["Contact", "Coil"].includes(item.iecRecordKind)
          && item.iecElementKind
      )).length,
      2,
    );
    assert.deepEqual(
      delete_xgwx_iec_ld_rung(
        variantBytes, 0, 31, contactKind, "ON", coilKind, "OFF",
      ),
      blankRowBytes,
    );
  }
  assert.throws(() => insert_xgwx_iec_ld_linear_rung(blankRowBytes, 0, 30, "ON", "OFF"));
  assert.throws(() => insert_xgwx_iec_ld_linear_rung(blankRowBytes, 0, 31, "WW700", "OFF"));
  assert.throws(() => insert_xgwx_iec_ld_rung(blankRowBytes, 0, 31, "NO", "%MW700", "OUTPUT", "ON"));
  assert.throws(() => insert_xgwx_iec_ld_rung(blankRowBytes, 0, 31, "NO", "ON", "OUTPUT", "%IX0"));
  const closedBlankRow = parse_xgwx(delete_xgwx_iec_ld_blank_row(blankRowBytes, 0, 31));
  assert.deepEqual(
    closedBlankRow.ladder[0].iecRows.map((row) => [row.groupIndex, row.rowIndex, row.recordCount]),
    summary.ladder[0].iecRows.map((row) => [row.groupIndex, row.rowIndex, row.recordCount]),
  );
  assert.equal(closedBlankRow.ladder[0].iecCircuitGraph.edges.length,
    summary.ladder[0].iecCircuitGraph.edges.length);
  assert.deepEqual(closedBlankRow.ladder.slice(1), summary.ladder.slice(1));
  assert.throws(() => delete_xgwx_iec_ld_blank_row(blankRowBytes, 0, 30));
  let elementEdit = source;
  for (const target of [normal, closed, coil]) {
    const current = parse_xgwx(elementEdit).ladder[0].sourceStrings.find((item) => item.iecElementKind === target.iecElementKind && item.value === target.value);
    elementEdit = update_xgwx_iec_ld_element_operand(elementEdit, 0, current.offset, current.value, "ON");
  }
  const editedElements = parse_xgwx(elementEdit);
  assert.equal(
    editedElements.ladder[0].sourceStrings.filter((item) => item.iecElementKind && item.value === "ON").length,
    summary.ladder[0].sourceStrings.filter((item) => item.iecElementKind && item.value === "ON").length + 3,
  );
  assert.deepEqual(editedElements.ladder.slice(1), summary.ladder.slice(1));
  assert.throws(() => update_xgwx_iec_ld_element_operand(source, 0, comment.offset, comment.value, "ON"));
  assert.throws(() => update_xgwx_iec_ld_element_operand(source, 0, normal.offset, normal.value, "%MW700"));
  assert.throws(() => update_xgwx_iec_ld_element_operand(source, 0, normal.offset, normal.value, "%MX"));
  assert.throws(() => update_xgwx_iec_ld_element_operand(source, 0, coil.offset, coil.value, "%IX0"));
  assert.ok(update_xgwx_iec_ld_element_operand(source, 0, coil.offset, coil.value, "%MX77").length);
  const addInput = summary.ladder[0].sourceStrings.find((item) => item.isIecFunctionOperand && item.value === "1");
  assert.ok(addInput);
  const functionEdit = update_xgwx_iec_ld_function_operand(source, 0, addInput.offset, "1", "123");
  const parsedFunctionEdit = parse_xgwx(functionEdit);
  assert.equal(parsedFunctionEdit.ladder[0].sourceStrings.find((item) => item.offset === addInput.offset).value, "123");
  assert.equal(parsedFunctionEdit.ladder[0].iecFunctionOperandLinks.length, summary.ladder[0].iecFunctionOperandLinks.length);
  assert.equal(parsedFunctionEdit.ladder[0].iecFunctionReferences.length, summary.ladder[0].iecFunctionReferences.length);
  assert.deepEqual(parsedFunctionEdit.ladder.slice(1), summary.ladder.slice(1));
  const operandSite = (programIndex, blockName, pinName, value) => {
    const program = summary.ladder[programIndex];
    for (const link of program.iecFunctionOperandLinks) {
      const block = program.iecFunctions.find((candidate) => candidate.recordOffset === link.targetRecordOffset);
      const pin = [block.controlInput, block.controlOutput, ...block.pins]
        .find((candidate) => candidate.referenceOrdinal === link.ordinal);
      const item = program.sourceStrings.find((candidate) =>
        candidate.iecRecordOffset === link.recordOffset && candidate.isIecFunctionOperand);
      if (block.name === blockName && pin.name === pinName && item.value === value) return item;
    }
    throw new Error(`Missing ${blockName}.${pinName}=${value}`);
  };
  const addOutput = operandSite(0, "ADD", "OUT", "%MW700");
  assert.throws(() => update_xgwx_iec_ld_function_operand(source, 0, addOutput.offset, "%MW700", "123"));
  for (const badAddress of ["%NONSENSE", "%MW", "%MW700.", "%MX700", "%IW0.0.0"]) {
    assert.throws(() => update_xgwx_iec_ld_function_operand(
      source, 0, addOutput.offset, "%MW700", badAddress), badAddress);
  }
  assert.ok(update_xgwx_iec_ld_function_operand(
    source, 0, addOutput.offset, "%MW700", "%MW701").length);
  const addWordInput = operandSite(0, "ADD", "IN1", "%MW700");
  assert.ok(update_xgwx_iec_ld_function_operand(
    source, 0, addWordInput.offset, "%MW700", "%IW0.0.0").length);
  const timerPreset = operandSite(1, "TON", "PT", "T#5s");
  assert.throws(() => update_xgwx_iec_ld_function_operand(source, 1, timerPreset.offset, "T#5s", "123"));
  const validTimerEdit = parse_xgwx(update_xgwx_iec_ld_function_operand(
    source, 1, timerPreset.offset, "T#5s", "T#6s"));
  assert.equal(validTimerEdit.ladder[1].sourceStrings.find((item) => item.offset === timerPreset.offset).value, "T#6s");
  const integerConversion = operandSite(4, "INT_TO_UDINT", "IN", "메모리값");
  assert.throws(() => update_xgwx_iec_ld_function_operand(
    source, 4, integerConversion.offset, "메모리값", "LED상태"));
  const terminalFunctionSite = summary.ladder[3].iecTerminalFunctionDeletionSites
    .find((site) => site.blockOffset === 185);
  assert.deepEqual(terminalFunctionSite, {
    groupIndex: 1,
    rowIndex: 1,
    blockOffset: 185,
    wireOffset: 166,
    rawX: 7,
    pinCount: 2,
  });
  assert.throws(() => delete_xgwx_iec_ld_terminal_function(
    source, 3, terminalFunctionSite.blockOffset, "ADD"));
  const terminalFunctionDeletedBytes = delete_xgwx_iec_ld_terminal_function(
    source, 3, terminalFunctionSite.blockOffset, "MOVE");
  const terminalFunctionDeleted = parse_xgwx(terminalFunctionDeletedBytes);
  assert.equal(terminalFunctionDeleted.ladder[3].iecRows.length, 75);
  assert.equal(terminalFunctionDeleted.ladder[3].iecRecords.length, 314);
  assert.equal(terminalFunctionDeleted.ladder[3].iecFunctions.length, 9);
  assert.equal(terminalFunctionDeleted.ladder[3].iecTerminalFunctionDeletionSites.length, 4);
  assert.deepEqual(terminalFunctionDeleted.ladder[3].iecTerminalFunctionInsertionSites, [{
    groupIndex: 1, rowIndex: 1, contactOffset: 137, insertionOffset: 166, rawX: 7,
  }]);
  assert.throws(() => insert_xgwx_iec_ld_terminal_move(
    terminalFunctionDeletedBytes, 3, 137, "1", "%MX300"));
  const terminalMoveRestored = parse_xgwx(insert_xgwx_iec_ld_terminal_move(
    terminalFunctionDeletedBytes, 3, 137, "1", "%MW300"));
  assert.equal(terminalMoveRestored.ladder[3].iecFunctions.length, 10);
  assert.equal(terminalMoveRestored.ladder[3].iecTerminalFunctionInsertionSites.length, 0);
  assert.ok(terminalMoveRestored.ladder[3].iecCircuitGraph);
  assert.ok(terminalFunctionDeleted.ladder[3].iecCircuitGraph);
  const l4DeletedBytes = delete_xgwx_iec_ld_terminal_function(source, 3, 660, "MOVE");
  const l4Deleted = parse_xgwx(l4DeletedBytes);
  assert.deepEqual(l4Deleted.ladder[3].iecTerminalFunctionInsertionSites, [{
    groupIndex: 2, rowIndex: 4, contactOffset: 612, insertionOffset: 641, rawX: 7,
  }]);
  const l4Restored = parse_xgwx(insert_xgwx_iec_ld_terminal_move(
    l4DeletedBytes, 3, 612, "2", "%MW300"));
  assert.equal(l4Restored.ladder[3].iecFunctions.length, 10);
  assert.equal(l4Restored.ladder[3].iecTerminalFunctionInsertionSites.length, 0);
  assert.ok(l4Restored.ladder[3].iecCircuitGraph);
  const lightingDeletedBytes = delete_xgwx_iec_ld_terminal_function(source, 0, 10289, "MOVE");
  const lightingDeleted = parse_xgwx(lightingDeletedBytes);
  assert.deepEqual(lightingDeleted.ladder[0].iecTerminalFunctionInsertionSites, [{
    groupIndex: 32, rowIndex: 63, contactOffset: 10247, insertionOffset: 10270, rawX: 16,
  }]);
  assert.throws(() => insert_xgwx_iec_ld_terminal_move(
    lightingDeletedBytes, 0, 10247, "0", "UNKNOWN_OUTPUT"));
  const lightingRestored = parse_xgwx(insert_xgwx_iec_ld_terminal_move(
    lightingDeletedBytes, 0, 10247, "0", "자기유지2"));
  assert.equal(lightingRestored.ladder[0].iecFunctions.length, 23);
  assert.equal(lightingRestored.ladder[0].iecTerminalFunctionInsertionSites.length, 0);
  assert.ok(lightingRestored.ladder[0].iecCircuitGraph);
  assert.deepEqual(terminalFunctionDeleted.ladder.filter((_, index) => index !== 3),
    summary.ladder.filter((_, index) => index !== 3));
  const standaloneFunctionSite = summary.ladder[2].iecStandaloneFunctionDeletionSites
    .find((site) => site.blockOffset === 206);
  assert.deepEqual(standaloneFunctionSite, {
    groupIndex: 1,
    rowIndex: 1,
    blockOffset: 206,
    wireOffset: 187,
    rawX: 4,
    pinCount: 2,
  });
  assert.throws(() => delete_xgwx_iec_ld_standalone_function(
    source, 2, standaloneFunctionSite.blockOffset, "MOVE"));
  const standaloneFunctionDeletedBytes = delete_xgwx_iec_ld_standalone_function(
    source, 2, standaloneFunctionSite.blockOffset, "WORD_TO_UDINT");
  const standaloneFunctionDeleted = parse_xgwx(standaloneFunctionDeletedBytes);
  assert.equal(standaloneFunctionDeleted.ladder[2].iecRows.length, 37);
  assert.equal(standaloneFunctionDeleted.ladder[2].iecRecords.length, 151);
  assert.equal(standaloneFunctionDeleted.ladder[2].iecFunctions.length, 8);
  assert.equal(standaloneFunctionDeleted.ladder[2].iecStandaloneFunctionDeletionSites.length, 0);
  assert.deepEqual(standaloneFunctionDeleted.ladder[2].iecStandaloneFunctionInsertionSites, [{
    groupIndex: 1, rowIndex: 1, insertionOffset: 142, rawX: 4,
  }]);
  assert.ok(standaloneFunctionDeleted.ladder[2].iecCircuitGraph);
  assert.deepEqual(standaloneFunctionDeleted.ladder.filter((_, index) => index !== 2),
    summary.ladder.filter((_, index) => index !== 2));
  assert.throws(() => insert_xgwx_iec_ld_standalone_function(
    standaloneFunctionDeletedBytes, 2, 142, "MOVE", "%MW301", "변환"));
  assert.throws(() => insert_xgwx_iec_ld_standalone_function(
    standaloneFunctionDeletedBytes, 2, 142, "WORD_TO_UDINT", "%MX302", "변환"));
  assert.throws(() => insert_xgwx_iec_ld_standalone_function(
    standaloneFunctionDeletedBytes, 2, 142, "WORD_TO_UDINT", "%MW302", "missing"));
  const alternateStandalone = parse_xgwx(insert_xgwx_iec_ld_standalone_function(
    standaloneFunctionDeletedBytes, 2, 142, "WORD_TO_UDINT", "%MW302", "변환"));
  assert.ok(alternateStandalone.ladder[2].sourceStrings.some((item) => item.value === "%MW302"));
  assert.ok(alternateStandalone.ladder[2].iecCircuitGraph);
  const standaloneFunctionInserted = parse_xgwx(insert_xgwx_iec_ld_standalone_function(
    standaloneFunctionDeletedBytes, 2, 142, "WORD_TO_UDINT", "%MW301", "변환"));
  assert.equal(standaloneFunctionInserted.ladder[2].iecRows.length, 40);
  assert.equal(standaloneFunctionInserted.ladder[2].iecRecords.length, 157);
  assert.equal(standaloneFunctionInserted.ladder[2].iecFunctions.length, 9);
  assert.equal(standaloneFunctionInserted.ladder[2].iecStandaloneFunctionInsertionSites.length, 0);
  assert.ok(standaloneFunctionInserted.ladder[2].iecCircuitGraph);
  const functionCellDeletionSite = summary.ladder[0].iecFunctionCellDeletionSites
    .find((site) => site.blockOffset === 1639);
  assert.deepEqual(functionCellDeletionSite, {
    groupIndex: 9,
    rowIndex: 14,
    blockOffset: 1639,
    rawX: 4,
    pinCount: 1,
  });
  assert.throws(() => delete_xgwx_iec_ld_function_cell(
    source, 0, functionCellDeletionSite.blockOffset, "R_TRIG"));
  const functionCellDeletedBytes = delete_xgwx_iec_ld_function_cell(
    source, 0, functionCellDeletionSite.blockOffset, "FF");
  const functionCellDeleted = parse_xgwx(functionCellDeletedBytes);
  assert.equal(functionCellDeleted.ladder[0].iecRows.length, 86);
  assert.equal(functionCellDeleted.ladder[0].iecRecords.length, 287);
  assert.equal(functionCellDeleted.ladder[0].iecFunctions.length, 22);
  assert.equal(functionCellDeleted.ladder[0].iecFunctionCellDeletionSites.length, 3);
  assert.deepEqual(functionCellDeleted.ladder[0].iecFunctionCellInsertionSites, [{
    groupIndex: 9,
    rowIndex: 14,
    insertionOffset: 1639,
    referenceOffset: 1766,
    rawX: 4,
    functionName: "FF",
  }]);
  assert.ok(functionCellDeleted.ladder[0].iecCircuitGraph);
  assert.deepEqual(functionCellDeleted.ladder.slice(1), summary.ladder.slice(1));
  assert.throws(() => insert_xgwx_iec_ld_function_cell(
    functionCellDeletedBytes, 0, 1639, "R_TRIG", "FF"));
  assert.throws(() => insert_xgwx_iec_ld_function_cell(
    functionCellDeletedBytes, 0, 1639, "FF", "INST3"));
  const functionCellInserted = parse_xgwx(insert_xgwx_iec_ld_function_cell(
    functionCellDeletedBytes, 0, 1639, "FF", "FF"));
  assert.equal(functionCellInserted.ladder[0].iecRows.length, 86);
  assert.equal(functionCellInserted.ladder[0].iecRecords.length, 289);
  assert.equal(functionCellInserted.ladder[0].iecFunctions.length, 23);
  assert.equal(functionCellInserted.ladder[0].iecFunctionReferences.length, 50);
  assert.equal(functionCellInserted.ladder[0].iecFunctionOperandLinks.length, 45);
  assert.equal(functionCellInserted.ladder[0].iecFunctionCellInsertionSites.length, 0);
  assert.equal(functionCellInserted.ladder[0].iecFunctionCellDeletionSites.length, 4);
  assert.ok(functionCellInserted.ladder[0].iecCircuitGraph);
  assert.deepEqual(functionCellInserted.ladder.slice(1), summary.ladder.slice(1));
  assert.throws(() => delete_xgwx_iec_ld_connected_arithmetic(source, 0, 2858, "SUB"));
  const connectedAddDeletedBytes = delete_xgwx_iec_ld_connected_arithmetic(source, 0, 2858, "ADD");
  const connectedAddDeleted = parse_xgwx(connectedAddDeletedBytes);
  assert.equal(connectedAddDeleted.ladder[0].iecRecords.length, 281);
  assert.equal(connectedAddDeleted.ladder[0].iecFunctions.length, 22);
  assert.equal(connectedAddDeleted.ladder[0].iecRows.find((row) => row.rowIndex === 22).groupIndex, 15);
  assert.ok(connectedAddDeleted.ladder[0].iecCircuitGraph);
  assert.deepEqual(connectedAddDeleted.ladder.slice(1), summary.ladder.slice(1));
  const connectedSubDeleted = parse_xgwx(delete_xgwx_iec_ld_connected_arithmetic(source, 0, 4076, "SUB"));
  assert.equal(connectedSubDeleted.ladder[0].iecRecords.length, 281);
  assert.equal(connectedSubDeleted.ladder[0].iecRows.find((row) => row.rowIndex === 28).groupIndex, 17);
  assert.ok(connectedSubDeleted.ladder[0].iecCircuitGraph);
  const insertedContact = insert_xgwx_iec_ld_no_contact(source, 0, 252, 7, 4, 91, "ON");
  const insertedSummary = parse_xgwx(insertedContact);
  assert.equal(insertedSummary.ladder[0].iecRecords.length, summary.ladder[0].iecRecords.length + 2);
  assert.equal(insertedSummary.ladder[0].iecRows.find((row) => row.groupIndex === 2 && row.rowIndex === 2).recordCount, 5);
  assert.ok(insertedSummary.ladder[0].sourceStrings.some((item) =>
    item.value === "ON" && item.iecElementKind === "Normally open contact variable" && item.iecPosition?.[0] === 7 && item.iecPosition?.[1] === 8));
  assert.deepEqual(insertedSummary.ladder.slice(1), summary.ladder.slice(1));
  const branchedContact = parse_xgwx(insert_xgwx_iec_ld_contact(
    source, 0, 416, 10, 7, 91, "NO", "ON"));
  assert.equal(branchedContact.ladder[0].iecRows.find((row) =>
    row.groupIndex === 3 && row.rowIndex === 3).recordCount,
  summary.ladder[0].iecRows.find((row) =>
    row.groupIndex === 3 && row.rowIndex === 3).recordCount + 2);
  assert.ok(branchedContact.ladder[0].sourceStrings.some((item) =>
    item.value === "ON" && item.iecRecordOffset === 435 &&
    item.iecPosition?.[0] === 10 && item.iecPosition?.[1] === 12));
  assert.ok(branchedContact.ladder[0].iecCircuitGraph);
  assert.deepEqual(branchedContact.ladder.slice(1), summary.ladder.slice(1));
  assert.ok(branchedContact.ladder[0].iecNoContactCellDeletionSites.some((site) =>
    site.groupIndex === 3 && site.rowIndex === 3 && site.contactOffset === 435 && site.rawX === 10));
  const branchedCellDeleted = parse_xgwx(delete_xgwx_iec_ld_contact_cell(
    insert_xgwx_iec_ld_contact(source, 0, 416, 10, 7, 91, "NO", "ON"),
    0, 435, 10, "NO", "ON"));
  assert.ok(branchedCellDeleted.ladder[0].iecCircuitGraph);
  assert.equal(branchedCellDeleted.ladder[0].iecRows.find((row) =>
    row.groupIndex === 3 && row.rowIndex === 3).recordCount,
  summary.ladder[0].iecRows.find((row) =>
    row.groupIndex === 3 && row.rowIndex === 3).recordCount + 1);
  assert.ok(branchedContact.ladder[0].iecNoContactDeletionSites.some((site) =>
    site.groupIndex === 3 && site.rowIndex === 3 && site.contactOffset === 435 && site.rawX === 10));
  const branchedDeleted = parse_xgwx(delete_xgwx_iec_ld_contact(
    insert_xgwx_iec_ld_contact(source, 0, 416, 10, 7, 91, "NO", "ON"),
    0, 435, 10, "NO", "ON"));
  assert.ok(branchedDeleted.ladder[0].iecCircuitGraph);
  assert.equal(branchedDeleted.ladder[0].iecRows.find((row) =>
    row.groupIndex === 3 && row.rowIndex === 3).recordCount,
  summary.ladder[0].iecRows.find((row) =>
    row.groupIndex === 3 && row.rowIndex === 3).recordCount + 1);
  assert.ok(branchedDeleted.ladder[0].iecHorizontalWireRepairSites.some((site) =>
    site.groupIndex === 3 && site.rowIndex === 3 && site.insertionOffset === 435 && site.rawX === 10));
  const branchedRepaired = parse_xgwx(repair_xgwx_iec_ld_horizontal_wire(
    delete_xgwx_iec_ld_contact(
      insert_xgwx_iec_ld_contact(source, 0, 416, 10, 7, 91, "NO", "ON"),
      0, 435, 10, "NO", "ON"),
    0, 435, 10));
  assert.ok(branchedRepaired.ladder[0].iecCircuitGraph);
  assert.equal(branchedRepaired.ladder[0].iecRows.find((row) =>
    row.groupIndex === 3 && row.rowIndex === 3).recordCount,
  branchedContact.ladder[0].iecRows.find((row) =>
    row.groupIndex === 3 && row.rowIndex === 3).recordCount);
  for (const [kind, label] of [
    ["NO", "Normally open contact variable"],
    ["NC", "Normally closed contact variable"],
    ["RISING", "Rising-edge contact variable"],
    ["FALLING", "Falling-edge contact variable"],
    ["NEGATED_RISING", "Negated rising-edge contact variable"],
    ["NEGATED_FALLING", "Negated falling-edge contact variable"],
  ]) {
    const variantBytes = insert_xgwx_iec_ld_contact(source, 0, 252, 7, 4, 91, kind, "ON");
    const variant = parse_xgwx(variantBytes);
    assert.ok(variant.ladder[0].sourceStrings.some((item) =>
      item.value === "ON" && item.iecElementKind === label && item.iecPosition?.[0] === 7));
    assert.ok(variant.ladder[0].iecCircuitGraph);
    const variantSite = variant.ladder[0].iecNoContactCellDeletionSites.find((site) =>
      site.rowIndex === 2 && site.rawX === 7);
    assert.equal(variantSite.contactCode, {
      NO: 0x06, NC: 0x07, RISING: 0x08, FALLING: 0x09,
      NEGATED_RISING: 0x0a, NEGATED_FALLING: 0x0b,
    }[kind]);
    assert.throws(() => delete_xgwx_iec_ld_contact_cell(
      variantBytes, 0, variantSite.contactOffset, variantSite.rawX,
      kind === "NO" ? "NC" : "NO", "ON",
    ));
    const deletedVariant = parse_xgwx(delete_xgwx_iec_ld_contact_cell(
      variantBytes, 0, variantSite.contactOffset, variantSite.rawX, kind, "ON",
    ));
    assert.ok(deletedVariant.ladder[0].iecCircuitGraph);
    assert.ok(!deletedVariant.ladder[0].sourceStrings.some((item) =>
      item.iecRecordOffset === variantSite.contactOffset && item.value === "ON"));
  }
  assert.throws(() => insert_xgwx_iec_ld_contact(source, 0, 252, 7, 4, 91, "INVALID", "ON"));
  assert.throws(() => insert_xgwx_iec_ld_contact(source, 0, 252, 7, 4, 91, "NO", "MISSING_BOOL"));
  const firstSerial = insert_xgwx_iec_ld_contact(source, 0, 252, 25, 4, 91, "NO", "ON");
  const remaining = parse_xgwx(firstSerial).ladder[0].iecNoContactInsertionSites.find((site) =>
    site.rowIndex === 2 && site.startX === 28 && site.endX === 91);
  assert.ok(remaining);
  const twoSerial = insert_xgwx_iec_ld_contact(
    firstSerial, 0, remaining.wireOffset, 49, 28, 91, "NC", "스위치_1");
  const twoSerialSummary = parse_xgwx(twoSerial);
  assert.ok(twoSerialSummary.ladder[0].iecCircuitGraph);
  assert.ok(twoSerialSummary.ladder[0].sourceStrings.some((item) =>
    item.value === "스위치_1" && item.iecPosition?.[0] === 49 && item.iecPosition?.[1] === 8));
  const twoSerialCapture = nativeFixturePath("VMs/xg5000-win10/captures/smarthome-iec-group-copy/G2C.XGWX");
  if (fs.existsSync(twoSerialCapture)) assert.deepEqual(Buffer.from(twoSerial), fs.readFileSync(twoSerialCapture));
  const deletionSite = insertedSummary.ladder[0].iecNoContactDeletionSites.find((site) => site.rowIndex === 2);
  assert.deepEqual({ contactOffset: deletionSite.contactOffset, rawX: deletionSite.rawX }, { contactOffset: 271, rawX: 7 });
  const deletedContact = delete_xgwx_iec_ld_no_contact(insertedContact, 0, deletionSite.contactOffset, deletionSite.rawX, "ON");
  const deletedSummary = parse_xgwx(deletedContact);
  assert.deepEqual(deletedSummary.ladder[0].iecHorizontalWireRepairSites,
    [{ groupIndex: 2, rowIndex: 2, insertionOffset: 271, rawX: 7 }]);
  assert.ok(parse_xgwx(repair_xgwx_iec_ld_horizontal_wire(
    deletedContact, 0, 271, 7)).ladder[0].iecCircuitGraph);
  assert.equal(deletedSummary.ladder[0].iecRecords.length, summary.ladder[0].iecRecords.length + 1);
  assert.equal(deletedSummary.ladder[0].iecRows.find((row) => row.groupIndex === 2 && row.rowIndex === 2).recordCount, 4);
  assert.ok(!deletedSummary.ladder[0].sourceStrings.some((item) => item.iecRecordOffset === deletionSite.contactOffset && item.value === "ON"));
  assert.throws(() => delete_xgwx_iec_ld_no_contact(insertedContact, 0, deletionSite.contactOffset, deletionSite.rawX, "OFF"));
  assert.throws(() => delete_xgwx_iec_ld_no_contact(source, 0, deletionSite.contactOffset, deletionSite.rawX, "ON"));
  assert.throws(() => delete_xgwx_iec_ld_contact(
    insertedContact, 0, deletionSite.contactOffset, deletionSite.rawX, "NC", "ON"));
  assert.deepEqual(
    parse_xgwx(delete_xgwx_iec_ld_contact(
      insertedContact, 0, deletionSite.contactOffset, deletionSite.rawX, "NO", "ON",
    )).ladder,
    deletedSummary.ladder,
  );
  assert.deepEqual(deletedSummary.ladder.slice(1), summary.ladder.slice(1));
  const cellDeletionSite = insertedSummary.ladder[0].iecNoContactCellDeletionSites.find((site) => site.rowIndex === 2);
  assert.deepEqual({ contactOffset: cellDeletionSite.contactOffset, rawX: cellDeletionSite.rawX }, { contactOffset: 271, rawX: 7 });
  const cellDeletedSummary = parse_xgwx(delete_xgwx_iec_ld_no_contact_cell(
    insertedContact, 0, cellDeletionSite.contactOffset, cellDeletionSite.rawX, "ON",
  ));
  assert.equal(cellDeletedSummary.ladder[0].iecRows.find((row) => row.groupIndex === 2 && row.rowIndex === 2).recordCount, 4);
  assert.deepEqual(cellDeletedSummary.ladder[0].iecHorizontalWireRepairSites, []);
  assert.throws(() => delete_xgwx_iec_ld_no_contact_cell(
    insertedContact, 0, cellDeletionSite.contactOffset, cellDeletionSite.rawX, "OFF",
  ));
  assert.throws(() => insert_xgwx_iec_ld_no_contact(source, 0, 252, 7, 4, 90, "ON"));
  assert.throws(() => insert_xgwx_iec_ld_no_contact(source, 0, 252, 8, 4, 91, "ON"));
  const nativeInsertFixture = process.env.LIBXGWX_XGI_NATIVE_INSERT_FIXTURE;
  if (nativeInsertFixture && fs.existsSync(nativeInsertFixture)) {
    assert.deepEqual(insertedSummary.ladder, parse_xgwx(fs.readFileSync(nativeInsertFixture)).ladder);
  }
  const nativeDeleteFixture = process.env.LIBXGWX_XGI_NATIVE_DELETE_FIXTURE;
  if (nativeDeleteFixture && fs.existsSync(nativeDeleteFixture)) {
    // XG5000 Delete also changes seven row geometry bytes outside the edited row.
    // Those appear only in the legacy horizontalLines summary; the generated
    // file is independently accepted by XG5000 Check Program.
    const withoutDisplayWidths = (programs) => programs.map(({ horizontalLines, ...program }) => program);
    assert.deepEqual(withoutDisplayWidths(deletedSummary.ladder),
      withoutDisplayWidths(parse_xgwx(fs.readFileSync(nativeDeleteFixture)).ladder));
  }
  assert.throws(() => update_xgwx_iec_ld_function_operand(source, 0, comment.offset, comment.value, "123"));
  const addBlock = summary.ladder[0].sourceStrings.find((item) => item.isIecArithmeticFunction && item.value === "ADD");
  assert.ok(addBlock);
  const subBlockBytes = update_xgwx_iec_ld_arithmetic_function(source, 0, addBlock.offset, "ADD", "SUB");
  const subBlock = parse_xgwx(subBlockBytes).ladder[0].sourceStrings.find((item) => item.offset === addBlock.offset);
  assert.equal(subBlock.value, "SUB");
  assert.equal(subBlock.isIecArithmeticFunction, true);
  const mulBlockBytes = update_xgwx_iec_ld_arithmetic_function(source, 0, addBlock.offset, "ADD", "MUL");
  assert.equal(parse_xgwx(mulBlockBytes).ladder[0].sourceStrings.find((item) => item.offset === addBlock.offset).value, "MUL");
  assert.throws(() => update_xgwx_iec_ld_arithmetic_function(source, 0, addBlock.offset, "ADD", "MOVE"));
  assert.throws(() => update_xgwx_iec_ld_arithmetic_function(source, 0, comment.offset, comment.value, "SUB"));
  const eqBlock = summary.ladder[0].sourceStrings.find((item) => item.isIecComparisonFunction && item.value === "EQ");
  const gtBlockBytes = update_xgwx_iec_ld_comparison_function(source, 0, eqBlock.offset, "EQ", "GT");
  const gtBlock = parse_xgwx(gtBlockBytes).ladder[0].sourceStrings.find((item) => item.offset === eqBlock.offset);
  assert.equal(gtBlock.value, "GT");
  assert.equal(gtBlock.isIecComparisonFunction, true);
  assert.deepEqual(gtBlock.iecPosition, eqBlock.iecPosition);
  assert.throws(() => update_xgwx_iec_ld_comparison_function(source, 0, eqBlock.offset, "EQ", "ADD"));
  assert.throws(() => update_xgwx_iec_ld_comparison_function(source, 0, addBlock.offset, "ADD", "GT"));
  assert.throws(() => update_xgwx_iec_ld_rising_contact_operand(source, 0, comment.offset, comment.value, "ON"));
  const longer = update_xgwx_iec_ld_comment(source, 0, comment.offset, comment.value, "LIGHT_CONTROL_LONGER");
  const longerSummary = parse_xgwx(longer);
  assert.equal(longerSummary.ladder[0].sourceStrings.find((item) => item.offset === comment.offset).value, "LIGHT_CONTROL_LONGER");
  assert.deepEqual(longerSummary.ladder.slice(1), summary.ladder.slice(1));
  assert.throws(() => update_xgwx_iec_ld_comment(source, 0, comment.offset, comment.value, "X".repeat(256)));
  assert.deepEqual(Buffer.from(select_xgwx_cpu(source, "XGI-CPUE")), source);
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
  assert.equal(catalog.find((entry) => entry.model === "XGI-CPUE")?.typeCode, 106);
  assert.equal(catalog.find((entry) => entry.model === "XGI-CPUS/P")?.typeCode, 110);

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

  const withoutRung = delete_xgwx_ladder_rung_comment(source, 0, 0, "렁 설명문 1");
  const deleted = parse_xgwx(withoutRung).ladder[0];
  assert.equal(deleted.rungComments.length, 0);
  assert.equal(deleted.outputComments[0].rawY, 0);
  const restored = edit_xgwx_ladder_comment(withoutRung, 0, {
    kind: "Rung", rawY: 0, expected: null, replacement: "렁 설명문 1",
  });
  assert.deepEqual(parse_xgwx(restored).ladder[0], parse_xgwx(source).ladder[0]);

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


test("function placement exports preserve operand metadata and enforce manual device permissions", async () => {
  await init({ module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm")) });
  const source = fs.readFileSync(path.join(libraryRoot, "fixtures/elements.xgwx"));
  const before = Buffer.from(source);
  const choices = parse_xgwx(source).ladder[0].instructionChoices;
  for (const choice of choices.filter(choice => choice.operandRules.length)) {
    assert.equal(choice.operandRules.length, choice.operandCount, choice.mnemonic);
  }
  assert.deepEqual(choices.find(choice => choice.mnemonic === "MOV").operandRules.map(rule => rule.dataTypes), [["WORD"], ["WORD"]]);
  assert.deepEqual(choices.find(choice => choice.mnemonic === "I2R").operandRules.map(rule => rule.dataTypes), [["INT"], ["REAL"]]);
  assert.deepEqual(choices.find(choice => choice.mnemonic === "CMP8").operandRules.map(rule => rule.dataTypes), [["BYTE"], ["BYTE"]]);
  assert.deepEqual(choices.find(choice => choice.mnemonic === "XTRUN").operandRules.map(rule => rule.dataTypes), [["WORD"], ["WORD"], ["WORD"], ["LREAL"], ["LREAL"], ["LREAL"], ["LREAL"]]);
  assert.deepEqual(choices.find(choice => choice.mnemonic === "SCAL").operandRules.map(rule => rule.label), ["S1", "S2", "S3", "D"]);
  assert.deepEqual(choices.find(choice => choice.mnemonic === "RSCAL").operandRules.map(rule => rule.dataTypes), [["REAL"], ["REAL"], ["REAL"], ["REAL"]]);
  for (const mnemonic of ["XORGEX", "XDSTEX", "XGEARIPEX"]) {
    const choice = choices.find(choice => choice.mnemonic === mnemonic);
    assert.equal(choice.operandRules.length, choice.operandCount);
  }
  const pid = choices.find(choice => choice.mnemonic === "PIDINIT");
  assert.deepEqual(pid.operandRules[0].deviceAreas, []);
  assert.equal(pid.operandRules[0].allowsConstant, true);
  assert.throws(() => insert_xgwx_ladder_instruction(source, 0, 52, "PIDINIT", JSON.stringify(["D100"])), /constant/);
  const pidBytes = insert_xgwx_ladder_instruction(source, 0, 52, "PIDINIT", JSON.stringify(["0"]));
  assert.deepEqual(parse_xgwx(pidBytes).ladder[0].cells.find(cell => cell.value === "PIDINIT").operands, ["0"]);
  assert.throws(() => insert_xgwx_ladder_instruction(source, 0, 52, "MOV", JSON.stringify(["1", "0"])), /constant/);
  assert.throws(() => insert_xgwx_ladder_instruction(source, 0, 52, "MOV", JSON.stringify(["M0000A", "D100"])), /bit address/);
  let bytes = insert_xgwx_ladder_comparison(source, 0, 52, 0, "=", JSON.stringify(["D100", "D102"]));
  bytes = insert_xgwx_ladder_instruction(bytes, 0, 52, "MOV", JSON.stringify(["1", "D200"]));
  const cells = parse_xgwx(bytes).ladder[0].cells.filter(cell => cell.rawY === 52);
  assert.ok(cells.some(cell => cell.value === "=" && cell.kind === "Comparison"));
  assert.ok(cells.some(cell => cell.value === "MOV" && cell.operands.join() === "1,D200"));
  const nibble = insert_xgwx_ladder_instruction(source, 0, 52, "MOV4", JSON.stringify(["M0000A", "D100.4"]));
  assert.deepEqual(parse_xgwx(nibble).ladder[0].cells.find(cell => cell.value === "MOV4").operands, ["M0000A", "D100.4"]);
  assert.deepEqual(source, before);
});


test("all XGK word comparisons insert and replace as contacts", async () => {
  await init({ module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm")) });
  const source = fs.readFileSync(path.join(libraryRoot, "fixtures/elements.xgwx"));
  const names = ["=", ">", "<", ">=", "<=", "<>"];
  const choices = parse_xgwx(source).ladder[0].comparisonChoices.filter(choice => names.includes(choice.mnemonic));
  assert.deepEqual(choices.map(choice => choice.mnemonic), names);
  for (const choice of choices) {
    assert.equal(choice.operandCount, 2);
    assert.deepEqual(choice.operandRules.map(rule => rule.dataTypes), [["INT"], ["INT"]]);
    assert.throws(() => insert_xgwx_ladder_comparison(source, 0, 52, 0, choice.mnemonic, JSON.stringify(["D100.1", "D102"])), /not permitted|bit address/);
    let bytes = insert_xgwx_ladder_comparison(source, 0, 52, 0, choice.mnemonic, JSON.stringify(["D100", "D102"]));
    for (const replacement of names) {
      const cell = parse_xgwx(bytes).ladder[0].cells.find(cell => cell.rawY === 52 && cell.kind === "Comparison");
      assert.equal(cell.instructionTextEditing, true);
      bytes = update_xgwx_ladder_cell(bytes, 0, cell.offset, cell.sourceText, `${replacement},D100,D102`);
      const updated = parse_xgwx(bytes).ladder[0].cells.find(cell => cell.rawY === 52 && cell.kind === "Comparison");
      assert.equal(updated.value, replacement);
      assert.deepEqual(updated.operands, ["D100", "D102"]);
    }
  }
});

test("operandless XGK applications insert and resize through the editor WASM exports", async () => {
  await init({ module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm")) });
  const source = fs.readFileSync(path.join(libraryRoot, "fixtures/elements.xgwx"));
  const choices = parse_xgwx(source).ladder[0].instructionChoices;
  assert.equal(choices.filter(choice => choice.operandCount === 0).length, 15);
  for (const name of ["STOP", "WDT", "CLC", "EI", "INIT_DONE"]) {
    const inserted = insert_xgwx_ladder_instruction(source, 0, 52, name, "[]");
    const cell = parse_xgwx(inserted).ladder[0].cells.find(cell => cell.rawY === 52 && cell.value === name);
    assert.equal(cell.instructionTextEditing, true);
    assert.deepEqual(cell.operands, []);
    const enlarged = update_xgwx_ladder_cell(inserted, 0, cell.offset, cell.sourceText, "MOV,1,D200");
    const moved = parse_xgwx(enlarged).ladder[0].cells.find(cell => cell.rawY === 52 && cell.value === "MOV");
    const restored = update_xgwx_ladder_cell(enlarged, 0, moved.offset, moved.sourceText, name);
    assert.deepEqual(restored, inserted);
    assert.throws(() => insert_xgwx_ladder_instruction(source, 0, 52, name, '["1"]'), /operand count/);
  }
});

test("XGK application deletion clears its feed and BRST uses manual BIT and WORD operands", async () => {
  await init({ module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm")) });
  const source = fs.readFileSync(path.join(libraryRoot, "fixtures/elements.xgwx"));
  const choices = parse_xgwx(source).ladder[0].instructionChoices;
  for (const name of ["BRST", "BRSTP"]) {
    const choice = choices.find(c => c.mnemonic === name);
    assert.deepEqual(choice.operandRules.map(r => r.dataTypes), [["BIT"], ["WORD"]]);
    const inserted = insert_xgwx_ladder_instruction(source, 0, 52, name, '["M00020","8"]');
    const cell = parse_xgwx(inserted).ladder[0].cells.find(c => c.rawY === 52 && c.value === name);
    assert.equal(cell.instructionDeletion, true);
    const deleted = delete_xgwx_ladder_instruction(inserted, 0, cell.offset, cell.sourceText);
    assert.equal(parse_xgwx(deleted).ladder[0].cells.some(c => c.rawY === 52 && c.value === name), false);
    assert.deepEqual(insert_xgwx_ladder_instruction(deleted, 0, 52, name, '["M00020","8"]'), inserted);
    assert.throws(() => delete_xgwx_ladder_instruction(inserted, 0, cell.offset, "stale"), /changed/);
    assert.throws(() => insert_xgwx_ladder_instruction(source, 0, 52, name, '["D100","8"]'), /device area is not permitted/);
  }
  assert.throws(() => delete_xgwx_ladder_instruction(source, 0, 0, "END"), /record not found/);
});

test("all XGK comparison families expose types, reserve their spans and restore after deletion", async () => {
  await init({ module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm")) });
  const source = fs.readFileSync(path.join(libraryRoot, "fixtures/elements.xgwx"));
  const choices = parse_xgwx(source).ladder[0].comparisonChoices.filter(choice => !["B", "BN"].includes(choice.mnemonic));
  assert.equal(choices.length, 78);
  const types = { "": "INT", D: "DINT", R: "REAL", L: "LREAL", "$": "STRING",
    G: "INT", DG: "DINT", "4": "NIBBLE", "8": "BYTE", U: "UINT", UD: "UDINT" };
  for (const choice of choices) {
    const prefix = choice.mnemonic.split(/[<>=]/)[0];
    assert.deepEqual(choice.operandRules[0].dataTypes, [types[prefix]]);
    assert.equal(choice.operandRules.length, choice.operandCount);
    const operands = ["4", "8"].includes(prefix) ? ["D100.0", "D104.0"] : ["D100", "D104"];
    if (choice.operandCount === 3) operands.push(["G", "DG"].includes(prefix) ? "1" : "D108");
    const values = JSON.stringify(operands);
    const inserted = insert_xgwx_ladder_comparison(source, 0, 52, 2, choice.mnemonic, values);
    const cell = parse_xgwx(inserted).ladder[0].cells.find(cell => cell.rawY === 52 && cell.value === choice.mnemonic);
    assert.equal(cell.kind, "Comparison");
    assert.equal(cell.instructionTextEditing, true);
    assert.deepEqual(cell.operands, operands);
    const deleted = delete_xgwx_ladder_comparison(inserted, 0, cell.offset, cell.sourceText);
    assert.deepEqual(insert_xgwx_ladder_comparison(deleted, 0, 52, 2, choice.mnemonic, values), inserted);
    assert.throws(() => insert_xgwx_ladder_comparison(source, 0, 52, 9 - choice.operandCount, choice.mnemonic, values), /fit before/);
  }
});

test("XGK indexed-bit inputs and FF use manual types and guarded edit records", async () => {
  await init({ module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm")) });
  const source = fs.readFileSync(path.join(libraryRoot, "fixtures/elements.xgwx"));
  for (const name of ["B", "BN"]) {
    const choice = parse_xgwx(source).ladder[0].comparisonChoices.find(c => c.mnemonic === name);
    assert.deepEqual(choice.operandRules.map(r => r.dataTypes), [["WORD"], ["WORD"]]);
    const inserted = insert_xgwx_ladder_comparison(source, 0, 52, 0, name, '["D100","4"]');
    const cell = parse_xgwx(inserted).ladder[0].cells.find(c => c.rawY === 52 && c.value === name);
    assert.equal(cell.kind, "Comparison");
    assert.equal(cell.instructionTextEditing, true);
    const changed = update_xgwx_ladder_cell(inserted, 0, cell.offset, cell.sourceText, `${name},D100,D108`);
    assert.deepEqual(parse_xgwx(changed).ladder[0].cells.find(c => c.rawY === 52 && c.value === name).operands, ["D100", "D108"]);
    assert.throws(() => insert_xgwx_ladder_comparison(source, 0, 52, 0, name, '["4","4"]'), /constant/);
    assert.throws(() => insert_xgwx_ladder_comparison(source, 0, 52, 0, name, '["D100.0","4"]'), /bit address/);
    const deleted = delete_xgwx_ladder_comparison(inserted, 0, cell.offset, cell.sourceText);
    assert.deepEqual(insert_xgwx_ladder_comparison(deleted, 0, 52, 0, name, '["D100","4"]'), inserted);
  }
  const inserted = insert_xgwx_ladder_instruction(source, 0, 52, "FF", '["M00030"]');
  const cell = parse_xgwx(inserted).ladder[0].cells.find(c => c.rawY === 52 && c.value === "FF");
  assert.equal(cell.instructionDeletion, true);
  assert.deepEqual(parse_xgwx(inserted).ladder[0].instructionChoices.find(c => c.mnemonic === "FF").operandRules[0].dataTypes, ["BIT"]);
  assert.throws(() => insert_xgwx_ladder_instruction(source, 0, 52, "FF", '["D100"]'), /device area/);
});


test("comparison deletion removes a full contact and rejects stale edits", async () => {
  await init({ module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm")) });
  const source = fs.readFileSync(path.join(libraryRoot, "fixtures/elements.xgwx"));
  for (const name of ["=", ">", "<", ">=", "<=", "<>"]) {
    let bytes = insert_xgwx_ladder_comparison(source, 0, 52, 0, name, JSON.stringify(["D100", "D102"]));
    bytes = insert_xgwx_ladder_instruction(bytes, 0, 52, "MOV", JSON.stringify(["0", "D200"]));
    const before = parse_xgwx(bytes).ladder[0];
    const cell = before.cells.find(c => c.rawY === 52 && c.kind === "Comparison");
    assert.throws(() => delete_xgwx_ladder_comparison(bytes, 0, cell.offset, "stale"), /changed/);
    const deleted = delete_xgwx_ladder_comparison(bytes, 0, cell.offset, cell.sourceText);
    const after = parse_xgwx(deleted).ladder[0];
    assert.equal(after.cells.filter(c => c.kind === "Comparison" && c.rawY === 52).length, 0);
    assert.ok(after.cells.some(c => c.rawY === 52 && c.sourceText === "MOV,0,D200"));
    assert.deepEqual(after.cells.filter(c => c.rawY < 52), before.cells.filter(c => c.rawY < 52));
    const restored = insert_xgwx_ladder_comparison(deleted, 0, 52, 0, name, JSON.stringify(["D100", "D102"]));
    assert.deepEqual(parse_xgwx(restored).ladder[0], before);
  }
});


test("IEC consecutive empty-cell insertion preserves rows and guards unverified conversion placement", async context => {
  const fixture = process.env.LIBXGWX_XGI_FIXTURE;
  if (!fixture || !fs.existsSync(fixture)) {
    context.skip("set LIBXGWX_XGI_FIXTURE to an IEC workspace");
    return;
  }
  await init({module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm"))});
  const source = fs.readFileSync(fixture);
  const summary = parse_xgwx(source);
  const body = summary.ladder[0];
  const row = Math.max(...body.iecRows.map(row => row.rowIndex)) + 1;
  let bytes = source;
  for (const [x, category, kind, operand] of [[1,"contact","NO","%MX1000"], [4,"contact","NC","%MX1001"], [94,"coil","OUTPUT","%MX1002"]]) {
    bytes = insert_xgwx_iec_ld_single_element(bytes, 0, row, x, category, kind, operand);
  }
  const changed = parse_xgwx(bytes);
  assert.equal(changed.ladder[0].iecRows.find(item => item.rowIndex === row).recordCount, 3);
  assert.throws(() => insert_xgwx_iec_ld_single_element(bytes, 0, row, 4, "contact", "NO", "%MX1003"));
  assert.throws(() => insert_xgwx_iec_ld_single_element(bytes, 0, row, 7, "coil", "OUTPUT", "%IX0"));
  for (let index=1; index<summary.ladder.length; index++) {
    assert.deepEqual(changed.ladder[index], summary.ladder[index]);
  }
  const conversionProgram = summary.localVariables.findIndex(symbols => symbols.some(symbol => symbol.dataType === "UDINT" && !symbol.isInstance));
  assert.ok(conversionProgram >= 0);
  const destination = summary.localVariables[conversionProgram].find(symbol => symbol.dataType === "UDINT" && !symbol.isInstance).name;
  const conversionRow = Math.max(...summary.ladder[conversionProgram].iecRows.map(row => row.rowIndex)) + 1;
  assert.throws(() => insert_xgwx_iec_ld_function(source, conversionProgram, conversionRow, 10, "WORD_TO_UDINT", JSON.stringify(["%MX100",destination])));
  assert.throws(() => insert_xgwx_iec_ld_function(source, conversionProgram, conversionRow, 10, "WORD_TO_UDINT", JSON.stringify(["%MW100",destination])), /not native-validated/);
});


test("IEC terminal feed deletion reports open endpoints and cleans up without losing functions", async context => {
  const fixture = process.env.LIBXGWX_XGI_FIXTURE;
  if (!fixture) { context.skip("set LIBXGWX_XGI_FIXTURE to an IEC workspace"); return; }
  await init({module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm"))});
  const source = fs.readFileSync(fixture);
  const before = parse_xgwx(source);
  const deleted = edit_xgwx_iec_ld_branch_segment(source, 2, 8, 28, 29, 18, true, false);
  const intermediate = parse_xgwx(deleted);
  assert.deepEqual(intermediate.ladder[2].iecCircuitGraph.openBranchEndpoints, [{groupIndex:8,rowIndex:28,x:18}]);
  assert.equal(intermediate.ladder[2].iecFunctions.length, before.ladder[2].iecFunctions.length);
  assert.throws(() => edit_xgwx_iec_ld_branch_segment(deleted, 2, 8, 25, 26, 18, true, false));
  const repaired = parse_xgwx(edit_xgwx_iec_ld_branch_segment(deleted, 2, 8, 27, 28, 18, true, false));
  assert.deepEqual(repaired.ladder[2].iecCircuitGraph.openBranchEndpoints, []);
  assert.equal(repaired.ladder[2].iecFunctions.length, before.ladder[2].iecFunctions.length);
  assert.equal(repaired.ladder[2].iecGeometry.vertical.some(branch => branch.groupIndex === 8), false);
  for (let p=0; p<before.ladder.length; p++) if (p !== 2) assert.deepEqual(repaired.ladder[p], before.ladder[p]);
});


test("XGK contacts and coils store D register bit operands", async () => {
  await init({ module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm")) });
  const source = new Uint8Array(fs.readFileSync(path.join(libraryRoot, "fixtures/ladder-edit/empty.xgwx")));
  for (const [kind, column] of [["NormallyOpen", 0], ["NormallyClosed", 1], ["Output", 9]]) {
    for (const bit of '0123456789ABCDEF') {
      const operand = `D0000.${bit}`;
      const bytes = edit_xgwx_ladder_cell(source, 0, { rawY: 0, column, expected: null, replacement: { kind, operand } });
      assert.ok(parse_xgwx(bytes).ladder[0].cells.some(cell => cell.value === operand || cell.sourceText === operand), operand);
    }
  }
  for (const operand of ['D0000', 'D0000.10', 'D0000.G', 'D.0']) {
    assert.throws(() => edit_xgwx_ladder_cell(source, 0, { rawY: 0, column: 0, expected: null, replacement: { kind: 'NormallyOpen', operand } }));
  }
});


test("IEC terminal feed cleanup preserves function continuation references", async context => {
  const fixture = process.env.LIBXGWX_XGI_FIXTURE;
  if (!fixture) { context.skip("set LIBXGWX_XGI_FIXTURE to an IEC workspace"); return; }
  await init({module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm"))});
  const source = fs.readFileSync(fixture), before = parse_xgwx(source);
  for (const [g, start, end, x] of [[24,72,73,18], [23,66,67,21]]) {
    const deleted = edit_xgwx_iec_ld_branch_segment(source, 3, g, start, end, x, true, false);
    const intermediate = parse_xgwx(deleted);
    assert.deepEqual(intermediate.ladder[3].iecCircuitGraph.openBranchEndpoints, [{groupIndex:g,rowIndex:start,x}]);
    const repaired = parse_xgwx(edit_xgwx_iec_ld_branch_segment(deleted, 3, g, start-1, start, x, true, false));
    assert.deepEqual(repaired.ladder[3].iecCircuitGraph.openBranchEndpoints, []);
    assert.equal(repaired.ladder[3].iecFunctions.length, before.ladder[3].iecFunctions.length);
    assert.equal(repaired.ladder[3].iecGeometry.vertical.some(branch => branch.groupIndex === g), false);
    for (let p=0; p<before.ladder.length; p++) if (p !== 3) assert.deepEqual(repaired.ladder[p], before.ladder[p]);
  }
});


test("IEC arithmetic deletion preserves an external branch spine", async context => {
  const fixture = process.env.LIBXGWX_XGI_FIXTURE;
  if (!fixture) { context.skip("set LIBXGWX_XGI_FIXTURE to an IEC workspace"); return; }
  await init({module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm"))});
  const source = fs.readFileSync(fixture), before = parse_xgwx(source);
  for (const [p, row] of [[5,15],[6,30]]) {
    const block = before.ladder[p].iecFunctions.find(b => b.rowIndex === row && b.name === 'ADD');
    assert.ok(block);
    assert.throws(() => delete_xgwx_iec_ld_branched_arithmetic(source,p,block.recordOffset,'SUB'));
    const result = parse_xgwx(delete_xgwx_iec_ld_branched_arithmetic(source,p,block.recordOffset,'ADD'));
    assert.equal(result.ladder[p].iecFunctions.length+1,before.ladder[p].iecFunctions.length);
    assert.equal(result.ladder[p].iecGeometry.vertical.length+1,before.ladder[p].iecGeometry.vertical.length);
    assert.deepEqual(result.ladder[p].iecCircuitGraph.openBranchEndpoints,[]);
    for(let other=0;other<7;other++) if(other!==p) assert.deepEqual(result.ladder[other],before.ladder[other]);
  }
});


test("IEC branch selection reuses native chained-row deletion", async context => {
  const fixture = process.env.LIBXGWX_XGI_FIXTURE;
  if (!fixture) { context.skip("set LIBXGWX_XGI_FIXTURE to an IEC workspace"); return; }
  await init({module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm"))});
  const source = fs.readFileSync(fixture), before = parse_xgwx(source);
  for (const [p,g,start,end,x,contact] of [[2,7,20,21,21,false], [2,8,27,28,18,false],
      [6,14,82,83,3,true], [6,14,83,84,3,true]]) {
    const bytes = edit_xgwx_iec_ld_branch_segment(source,p,g,start,end,x,true,false);
    const direct = (contact ? delete_xgwx_iec_ld_chained_contact_branch_row
      : delete_xgwx_iec_ld_empty_branch_row)(source,p,g,end);
    assert.deepEqual(Buffer.from(bytes),Buffer.from(direct));
    const after = parse_xgwx(bytes);
    assert.equal(after.ladder[p].iecGeometry.vertical.length+1,before.ladder[p].iecGeometry.vertical.length);
    assert.equal(after.ladder[p].iecFunctions.length,before.ladder[p].iecFunctions.length);
    assert.deepEqual(after.ladder[p].iecCircuitGraph.openBranchEndpoints,[]);
    for (let other=0;other<7;other++) if(other!==p) assert.deepEqual(after.ladder[other],before.ladder[other]);
  }
});


test("IEC connected trigger deletion exposes a repairable gap", async context => {
  const fixture=process.env.LIBXGWX_XGI_FIXTURE;
  if(!fixture){context.skip("set LIBXGWX_XGI_FIXTURE to an IEC workspace");return;}
  await init({module_or_path:fs.readFileSync(path.join(root,"media/libxgwx_bg.wasm"))});
  const source=fs.readFileSync(fixture),before=parse_xgwx(source);
  for(const row of [20,26,32]) {
    const block=before.ladder[0].iecFunctions.find(b=>b.rowIndex===row&&b.name==='R_TRIG');
    assert.throws(()=>delete_xgwx_iec_ld_function_cell(source,0,block.recordOffset,'F_TRIG'));
    const bytes=delete_xgwx_iec_ld_function_cell(source,0,block.recordOffset,'R_TRIG');
    const deleted=parse_xgwx(bytes);
    assert.equal(deleted.ladder[0].iecFunctions.length+1,before.ladder[0].iecFunctions.length);
    assert.equal(deleted.ladder[0].iecRows.length,before.ladder[0].iecRows.length);
    const site=deleted.ladder[0].iecFunctionCellInsertionSites.find(s=>s.functionName==='R_TRIG'&&s.rowIndex===row);
    assert.ok(site);
    assert.throws(()=>insert_xgwx_iec_ld_function_cell(bytes,0,site.insertionOffset,'R_TRIG','Missing_Instance'));
    const restored=parse_xgwx(insert_xgwx_iec_ld_function_cell(bytes,0,site.insertionOffset,'R_TRIG',block.instance));
    assert.deepEqual(restored.ladder,before.ladder);
    const gap=deleted.ladder[0].iecHorizontalWireRepairSites.find(g=>g.rowIndex===row&&g.rawX===block.rawX);
    assert.ok(gap);
    const repaired=parse_xgwx(repair_xgwx_iec_ld_horizontal_wire(bytes,0,gap.insertionOffset,gap.rawX));
    assert.deepEqual(repaired.ladder[0].iecCircuitGraph.openBranchEndpoints,[]);
    assert.ok(before.localVariables[0].length > 0);
    assert.deepEqual(repaired.localVariables,before.localVariables);
    for(let p=1;p<7;p++) assert.deepEqual(repaired.ladder[p],before.ladder[p]);
  }
});


test("IEC compound operands rejected by native checking cannot be serialized", async context => {
  const fixture = process.env.LIBXGWX_XGI_FIXTURE;
  if (!fixture || !fs.existsSync(fixture)) {
    context.skip("set LIBXGWX_XGI_FIXTURE to an IEC workspace"); return;
  }
  await init({ module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm")) });
  const bytes = fs.readFileSync(fixture);
  const original = Buffer.from(bytes);
  const program = parse_xgwx(bytes).ladder[3];
  for (const [row, expression] of [[1, "%MW0 MOD 7 + 1"], [4, "%MW0 >= 2"],
    [7, "%MX0 OR NOT %MX1 AND (%MW2 >= 2)"],
    [10, "%MW0 XOR (%MW1 AND NOT %MW2)"], [13, "TRUE XOR FALSE"]]) {
    const block = program.iecFunctions.find(item => item.name === "MOVE" && item.rowIndex === row);
    const link = program.iecFunctionOperandLinks.find(item => item.targetRecordOffset === block.recordOffset && !item.isOutput);
    const operand = program.sourceStrings.find(item => item.iecRecordOffset === link.recordOffset && item.isIecFunctionOperand);
    assert.throws(() => update_xgwx_iec_ld_function_operand(bytes, 3, operand.offset, operand.value, expression),
      /native-valid expression construction/);
    assert.deepEqual(bytes, original);
  }
});


test("IEC vertical wire deletion preserves shared function rows and reconnects exactly", async context => {
  const fixture = process.env.LIBXGWX_XGI_FIXTURE;
  if (!fixture || !fs.existsSync(fixture)) {
    context.skip("set LIBXGWX_XGI_FIXTURE to an IEC workspace"); return;
  }
  await init({ module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm")) });
  const source = fs.readFileSync(fixture);
  const before = parse_xgwx(source);
  const deleted = edit_xgwx_iec_ld_vertical_wire(source, 0, 33, 69, 70, 12, true, false);
  const after = parse_xgwx(deleted);
  assert.equal(after.ladder[0].iecRows.length, before.ladder[0].iecRows.length);
  assert.equal(after.ladder[0].iecFunctions.length, before.ladder[0].iecFunctions.length);
  assert.deepEqual(after.ladder[0].iecCircuitGraph.openBranchEndpoints,
    [{groupIndex:33,rowIndex:69,x:12},{groupIndex:33,rowIndex:70,x:12}]);
  assert.throws(() => edit_xgwx_iec_ld_vertical_wire(deleted, 0, 33, 69, 70, 12, true, false));
  assert.throws(() => edit_xgwx_iec_ld_vertical_wire(deleted, 0, 33, 69, 70, 15, false, true));
  const restored = edit_xgwx_iec_ld_vertical_wire(deleted, 0, 33, 69, 70, 12, false, true);
  assert.deepEqual(parse_xgwx(restored).ladder, before.ladder);
});

test("IEC operand and operator edits preserve exposed endpoints", async context => {
  const fixture = process.env.LIBXGWX_XGI_FIXTURE;
  if (!fixture || !fs.existsSync(fixture)) {
    context.skip("set LIBXGWX_XGI_FIXTURE to an IEC workspace"); return;
  }
  await init({ module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm")) });
  const source = fs.readFileSync(fixture);
  const gap = edit_xgwx_iec_ld_vertical_wire(source, 0, 33, 69, 70, 12, true, false);
  const before = parse_xgwx(gap);
  const operand = before.ladder[0].sourceStrings.find(s => s.isIecFunctionOperand && s.value === "0");
  const edited = update_xgwx_iec_ld_function_operand(gap, 0, operand.offset, "0", "123");
  assert.throws(() => update_xgwx_iec_ld_function_operand(edited, 0, operand.offset, "0", "2"));
  assert.throws(() => update_xgwx_iec_ld_function_operand(edited, 0, operand.offset, "123", "%MWbad"));
  const after = parse_xgwx(edited);
  assert.deepEqual(after.ladder[0].iecCircuitGraph.openBranchEndpoints, before.ladder[0].iecCircuitGraph.openBranchEndpoints);
  const block = after.ladder[0].iecFunctions.find(b => b.groupIndex === 33 && b.name === "EQ");
  const operatorEdit = update_xgwx_iec_ld_comparison_function(edited, 0, block.nameOffset, "EQ", "GE");
  assert.equal(parse_xgwx(operatorEdit).ladder[0].iecFunctions.find(b => b.groupIndex === 33).name, "GE");
  const repaired = edit_xgwx_iec_ld_vertical_wire(operatorEdit, 0, 33, 69, 70, 12, false, true);
  const repairedSummary = parse_xgwx(repaired);
  assert.deepEqual(repairedSummary.ladder[0].iecCircuitGraph.openBranchEndpoints, []);
  assert.ok(repairedSummary.ladder[0].sourceStrings.some(s => s.offset === operand.offset && s.value === "123"));
  assert.deepEqual(repairedSummary.ladder.slice(1), before.ladder.slice(1));
});


test("IEC adjacent networks join and split while retaining functions and exact payloads", async context => {
  const fixture = process.env.LIBXGWX_XGI_FIXTURE;
  if (!fixture || !fs.existsSync(fixture)) { context.skip("set LIBXGWX_XGI_FIXTURE to an IEC workspace"); return; }
  await init({ module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm")) });
  const source = fs.readFileSync(fixture);
  const before = parse_xgwx(source);
  for (const [p, upper, start, lower, end, x] of [[0,2,2,3,3,3],[3,7,18,8,19,3]]) {
    const joined = connect_xgwx_iec_ld_groups(source,p,upper,start,lower,end,x);
    const after = parse_xgwx(joined);
    assert.equal(after.ladder[p].iecRows.length, before.ladder[p].iecRows.length);
    assert.equal(after.ladder[p].iecFunctions.length, before.ladder[p].iecFunctions.length);
    assert.equal(after.ladder[p].iecCircuitGraph.functionBindings.length, before.ladder[p].iecCircuitGraph.functionBindings.length);
    assert.equal(after.ladder[p].iecGeometry.vertical.length, before.ladder[p].iecGeometry.vertical.length+1);
    assert.throws(() => split_xgwx_iec_ld_group(joined,p,upper,start,end));
    assert.throws(() => connect_xgwx_iec_ld_groups(joined,p,upper,start,lower,end,x));
    const gap = edit_xgwx_iec_ld_vertical_wire(joined,p,upper,start,end,x,true,false);
    const split = split_xgwx_iec_ld_group(gap,p,upper,start,end);
    assert.deepEqual(parse_xgwx(split).ladder,before.ladder);
  }
  assert.throws(() => connect_xgwx_iec_ld_groups(source,2,7,22,8,23,3), /function body/);
  const contact = insert_xgwx_iec_ld_single_element(source,0,66,1,"contact","NO","ON");
  const joinedFunction = connect_xgwx_iec_ld_groups(contact,0,33,66,34,67,3);
  assert.equal(parse_xgwx(joinedFunction).ladder[0].iecFunctions.length,before.ladder[0].iecFunctions.length);
  const functionUnwired = edit_xgwx_iec_ld_vertical_wire(joinedFunction,0,33,66,67,3,true,false);
  const functionSplit = split_xgwx_iec_ld_group(functionUnwired,0,33,66,67);
  assert.deepEqual(parse_xgwx(functionSplit).ladder[0].iecFunctions,parse_xgwx(contact).ladder[0].iecFunctions);
  const functionGap = edit_xgwx_iec_ld_vertical_wire(source,0,33,69,70,12,true,false);
  assert.throws(() => split_xgwx_iec_ld_group(functionGap,0,33,69,70));
  assert.throws(() => connect_xgwx_iec_ld_groups(source,0,2,2,3,3,2));
});


test("IEC F6 extension materializes a blank row and deletes it without changing neighbors", async t => {
  const fixture = process.env.LIBXGWX_XGI_FIXTURE;
  if (!fixture) { t.skip("set LIBXGWX_XGI_FIXTURE to an IEC workspace"); return; }
  await init({ module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm")) });
  const { extend_xgwx_iec_ld_vertical_wire } = await import("../media/libxgwx.js");
  const source = fs.readFileSync(fixture);
  const before = parse_xgwx(source);
  const extended = extend_xgwx_iec_ld_vertical_wire(source, 0, 3, 4, 3);
  const after = parse_xgwx(extended);
  assert.equal(after.ladder[0].iecRows.length, before.ladder[0].iecRows.length + 1);
  assert.equal(after.ladder[0].iecRows.find(row => row.rowIndex === 5).recordCount, 1);
  assert.ok(after.ladder[0].iecCircuitGraph.openBranchEndpoints.some(point => point.rowIndex === 5 && point.x === 3));
  assert.deepEqual(after.ladder.slice(1), before.ladder.slice(1));
  assert.throws(() => extend_xgwx_iec_ld_vertical_wire(extended, 0, 3, 4, 3));
  assert.throws(() => extend_xgwx_iec_ld_vertical_wire(source, 0, 2, 2, 3));
  const restored = edit_xgwx_iec_ld_branch_segment(extended, 0, 3, 4, 5, 3, true, false);
  assert.deepEqual(parse_xgwx(restored).ladder, before.ladder);
});

test("IEC contact insertion fills an open branch-only row and Delete retains its wire", async t => {
  const fixture = process.env.LIBXGWX_XGI_FIXTURE;
  if (!fixture) { t.skip("set LIBXGWX_XGI_FIXTURE to an IEC workspace"); return; }
  await init({ module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm")) });
  const { extend_xgwx_iec_ld_vertical_wire } = await import("../media/libxgwx.js");
  const source = fs.readFileSync(fixture);
  const wire = extend_xgwx_iec_ld_vertical_wire(source, 0, 3, 4, 3);
  const before = parse_xgwx(wire);
  const inserted = insert_xgwx_iec_ld_single_element(wire, 0, 5, 1, "contact", "NO", "ON");
  const after = parse_xgwx(inserted);
  assert.equal(after.ladder[0].iecRows.find(row => row.rowIndex === 5).recordCount, 2);
  assert.deepEqual(after.ladder[0].iecCircuitGraph.openBranchEndpoints, []);
  assert.deepEqual(after.ladder.slice(1), before.ladder.slice(1));
  const site = after.ladder[0].iecNoContactDeletionSites.find(site => site.rowIndex === 5);
  assert.ok(site);
  assert.throws(() => delete_xgwx_iec_ld_contact(inserted,0,site.contactOffset,1,"NO","OFF"));
  const restored = delete_xgwx_iec_ld_contact(inserted,0,site.contactOffset,1,"NO","ON");
  assert.deepEqual(parse_xgwx(restored).ladder, before.ladder);
  assert.throws(() => insert_xgwx_iec_ld_single_element(wire,0,5,1,"contact","NO","%MW10"));
});

test("IEC coil insertion connects a branch-only row and Delete retains its endpoint", async t => {
  const fixture = process.env.LIBXGWX_XGI_FIXTURE;
  if (!fixture) { t.skip("set LIBXGWX_XGI_FIXTURE to an IEC workspace"); return; }
  await init({ module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm")) });
  const { extend_xgwx_iec_ld_vertical_wire, delete_xgwx_iec_ld_terminal_coil } = await import("../media/libxgwx.js");
  const wire = extend_xgwx_iec_ld_vertical_wire(fs.readFileSync(fixture), 0, 3, 4, 3);
  const before = parse_xgwx(wire);
  const inserted = insert_xgwx_iec_ld_single_element(wire,0,5,4,"coil","OUTPUT","%MX0");
  const after = parse_xgwx(inserted);
  assert.equal(after.ladder[0].iecRows.find(row => row.rowIndex === 5).recordCount,3);
  assert.deepEqual(after.ladder[0].iecCircuitGraph.openBranchEndpoints,[]);
  const coil = after.ladder[0].sourceStrings.find(item => item.iecRowIndex === 5 && item.value === "%MX0");
  assert.ok(coil);
  assert.equal(coil.iecPosition[0],94);
  assert.throws(() => delete_xgwx_iec_ld_terminal_coil(inserted,0,coil.iecRecordOffset,"%MX1"));
  const restored = delete_xgwx_iec_ld_terminal_coil(inserted,0,coil.iecRecordOffset,"%MX0");
  assert.deepEqual(parse_xgwx(restored).ladder,before.ladder);
  assert.throws(() => insert_xgwx_iec_ld_single_element(wire,0,5,7,"coil","OUTPUT","%MW10"));
});

test("IEC wider coils can fill and reopen a row while another branch remains open", async t => {
  const fixture = process.env.LIBXGWX_XGI_FIXTURE;
  if (!fixture) { t.skip("set LIBXGWX_XGI_FIXTURE to an IEC workspace"); return; }
  await init({ module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm")) });
  const { extend_xgwx_iec_ld_vertical_wire, delete_xgwx_iec_ld_terminal_coil } = await import("../media/libxgwx.js");
  let bytes=extend_xgwx_iec_ld_vertical_wire(fs.readFileSync(fixture),0,3,4,6);
  bytes=extend_xgwx_iec_ld_vertical_wire(bytes,0,8,12,24);
  const before=parse_xgwx(bytes);
  bytes=insert_xgwx_iec_ld_single_element(bytes,0,5,7,"coil","OUTPUT","%MX0");
  assert.equal(parse_xgwx(bytes).ladder[0].iecCircuitGraph.openBranchEndpoints.length,1);
  bytes=insert_xgwx_iec_ld_single_element(bytes,0,13,25,"coil","OUTPUT","%MX1");
  assert.deepEqual(parse_xgwx(bytes).ladder[0].iecCircuitGraph.openBranchEndpoints,[]);
  for (const [row,operand] of [[5,"%MX0"],[13,"%MX1"]]) {
    const coil=parse_xgwx(bytes).ladder[0].sourceStrings.find(item=>item.iecRowIndex===row && item.value===operand);
    bytes=delete_xgwx_iec_ld_terminal_coil(bytes,0,coil.iecRecordOffset,operand);
  }
  assert.deepEqual(parse_xgwx(bytes).ladder,before.ladder);
  let contactWire=extend_xgwx_iec_ld_vertical_wire(fs.readFileSync(fixture),0,3,4,3);
  contactWire=extend_xgwx_iec_ld_vertical_wire(contactWire,0,8,12,24);
  assert.throws(()=>insert_xgwx_iec_ld_single_element(contactWire,0,5,1,"contact","NO","ON"));
});

test("IEC scalar blocks make room below a branch row and retain later networks", async t => {
  const fixture = process.env.LIBXGWX_XGI_FIXTURE;
  if (!fixture) { t.skip("set LIBXGWX_XGI_FIXTURE to an IEC workspace"); return; }
  await init({ module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm")) });
  const { extend_xgwx_iec_ld_vertical_wire, insert_xgwx_iec_ld_function, delete_xgwx_iec_ld_branch_function, replace_xgwx_iec_ld_branch_function } = await import("../media/libxgwx.js");
  const wire = extend_xgwx_iec_ld_vertical_wire(fs.readFileSync(fixture),0,3,4,3);
  const before = parse_xgwx(wire);
  for (const [name, operands] of [["MOVE",["1","%MW100"]],["ADD",["1","2","%MW100"]],["EQ",["1","2","%MX100"]]]) {
    const bytes = insert_xgwx_iec_ld_function(wire,0,5,7,name,JSON.stringify(operands));
    const after = parse_xgwx(bytes);
    assert.deepEqual(after.ladder.slice(1),before.ladder.slice(1));
    assert.deepEqual(after.localVariables,before.localVariables);
    assert.ok(after.ladder[0].sourceStrings.some(item=>item.isIecFunctionName && item.value===name && item.iecRowIndex===5));
    assert.ok(after.ladder[0].sourceStrings.some(item=>item.value===operands.at(-1) && item.iecRowIndex===6));
    assert.equal(after.ladder[0].iecCircuitGraph.openBranchEndpoints[0].rowIndex,5+operands.length);
    assert.equal(after.ladder[0].iecRows.find(row=>row.rowIndex===6+operands.length).recordCount,
      before.ladder[0].iecRows.find(row=>row.rowIndex===6).recordCount);
    assert.throws(()=>insert_xgwx_iec_ld_function(bytes,0,5,7,name,JSON.stringify(operands)));
    const block=after.ladder[0].iecFunctions.find(block=>block.rowIndex===5 && block.rawX===7);
    assert.throws(()=>delete_xgwx_iec_ld_branch_function(bytes,0,block.recordOffset,"UNKNOWN"));
    const deleted=delete_xgwx_iec_ld_branch_function(bytes,0,block.recordOffset,name);
    const removed=parse_xgwx(deleted);
    assert.deepEqual(removed.ladder[0].iecCircuitGraph.openBranchEndpoints,after.ladder[0].iecCircuitGraph.openBranchEndpoints);
    assert.equal(removed.ladder[0].iecRows.find(row=>row.rowIndex===5).recordCount,2);
    const restored=insert_xgwx_iec_ld_function(deleted,0,5,7,name,JSON.stringify(operands));
    assert.deepEqual(restored,bytes);
    const replacementName=name==="MOVE"?"ADD":"MOVE";
    const replacementOperands=name==="MOVE"?["1","2","%MW100"]:["1","%MW100"];
    const replacement=insert_xgwx_iec_ld_function(deleted,0,5,7,replacementName,JSON.stringify(replacementOperands));
    const atomic=replace_xgwx_iec_ld_branch_function(bytes,0,block.recordOffset,name,replacementName,JSON.stringify(replacementOperands));
    assert.deepEqual(atomic,replacement);
    assert.throws(()=>replace_xgwx_iec_ld_branch_function(bytes,0,block.recordOffset,"UNKNOWN",replacementName,JSON.stringify(replacementOperands)));
    assert.throws(()=>replace_xgwx_iec_ld_branch_function(bytes,0,block.recordOffset,name,"ADD",JSON.stringify(["1","2","%IW100"])));
    const replaced=parse_xgwx(replacement);
    assert.equal(replaced.ladder[0].iecCircuitGraph.openBranchEndpoints[0].rowIndex,8);
    assert.deepEqual(replaced.ladder.slice(1),before.ladder.slice(1));
    assert.deepEqual(replaced.localVariables,before.localVariables);
    const replacementBlock=replaced.ladder[0].iecFunctions.find(block=>block.rowIndex===5 && block.rawX===7);
    const replacementDeleted=delete_xgwx_iec_ld_branch_function(replacement,0,replacementBlock.recordOffset,replacementName);
    assert.deepEqual(insert_xgwx_iec_ld_function(replacementDeleted,0,5,7,replacementName,JSON.stringify(replacementOperands)),replacement);
  }
  assert.throws(()=>insert_xgwx_iec_ld_function(wire,0,5,7,"MOVE",JSON.stringify(["1","%IW100"])));
  assert.throws(()=>insert_xgwx_iec_ld_function(wire,0,5,10,"MOVE",JSON.stringify(["1","%MW100"])));
});


test("IEC terminal timer deletion removes its short feed and preserves declarations", async t => {
  const fixture=process.env.LIBXGWX_XGI_FIXTURE;
  if (!fixture) { t.skip("set LIBXGWX_XGI_FIXTURE to an IEC workspace"); return; }
  await init({module_or_path:fs.readFileSync(path.join(root,"media/libxgwx_bg.wasm"))});
  const {delete_xgwx_iec_ld_terminal_function}=await import("../media/libxgwx.js");
  const bytes=fs.readFileSync(fixture), before=parse_xgwx(bytes);
  const block=before.ladder[4].iecFunctions.find(block=>block.rowIndex===15 && block.name==="TON");
  assert.ok(block);
  assert.throws(()=>delete_xgwx_iec_ld_terminal_function(bytes,4,block.recordOffset,"UNKNOWN"));
  const deleted=delete_xgwx_iec_ld_terminal_function(bytes,4,block.recordOffset,"TON"), after=parse_xgwx(deleted);
  assert.deepEqual(after.localVariables,before.localVariables);
  for (let p=0;p<before.ladder.length;p++) if(p!==4) assert.deepEqual(after.ladder[p],before.ladder[p]);
  assert.equal(after.ladder[4].iecFunctions.length,before.ladder[4].iecFunctions.length-1);
  assert.equal(after.ladder[4].iecRows.find(row=>row.rowIndex===15).recordCount,1);
  assert.ok(!after.ladder[4].iecRows.some(row=>row.rowIndex===16 || row.rowIndex===17));
});

test("IEC terminal TON restoration reuses its declaration and checks TIME operands", async t => {
  const fixture=process.env.LIBXGWX_XGI_FIXTURE;
  if(!fixture){t.skip("set LIBXGWX_XGI_FIXTURE");return;}
  await init({module_or_path:fs.readFileSync(path.join(root,"media/libxgwx_bg.wasm"))});
  const bytes=fs.readFileSync(fixture);
  const {insert_xgwx_iec_ld_terminal_timer,delete_xgwx_iec_ld_terminal_function}=await import("../media/libxgwx.js");
  const before=parse_xgwx(bytes), block=before.ladder[4].iecFunctions.find(b=>b.rowIndex===15&&b.name==="TON");
  const deleted=delete_xgwx_iec_ld_terminal_function(bytes,4,block.recordOffset,"TON");
  const site=parse_xgwx(deleted).ladder[4].iecTerminalTimerInsertionSites.find(s=>s.rowIndex===15);
  assert.equal(site.rawX,7);
  for(const args of [["UNKNOWN","시간","카운터"],["Timer","가스","카운터"],["Timer","시간","T#1s"],["Timer","시간","UNKNOWN"]]){
    assert.throws(()=>insert_xgwx_iec_ld_terminal_timer(deleted,4,site.contactOffset,...args));
  }
  const restored=insert_xgwx_iec_ld_terminal_timer(deleted,4,site.contactOffset,"Timer","시간","카운터"), after=parse_xgwx(restored);
  assert.deepEqual(after.localVariables,before.localVariables);
  assert.deepEqual(after.ladder,before.ladder);
  assert.throws(()=>insert_xgwx_iec_ld_terminal_timer(restored,4,site.contactOffset,"Timer","시간","카운터"));
  const literal=insert_xgwx_iec_ld_terminal_timer(deleted,4,site.contactOffset,"Timer","T#2s","카운터");
  const newBlock=parse_xgwx(literal).ladder[4].iecFunctions.find(b=>b.rowIndex===15&&b.name==="TON");
  assert.deepEqual(delete_xgwx_iec_ld_terminal_function(literal,4,newBlock.recordOffset,"TON"),deleted);
});

test("IEC scalar chain Delete preserves shared pins and supports typed refill", async t => {
  const fixture=process.env.LIBXGWX_XGI_FIXTURE;
  if(!fixture){t.skip("set LIBXGWX_XGI_FIXTURE");return;}
  await init({module_or_path:fs.readFileSync(path.join(root,"media/libxgwx_bg.wasm"))});
  const {delete_xgwx_iec_ld_scalar_chain_function,insert_xgwx_iec_ld_function}=await import("../media/libxgwx.js");
  const bytes=fs.readFileSync(fixture), before=parse_xgwx(bytes);
  for(const [x,name,operands] of [[4,"MOVE",["%MW10","메모리값"]],[13,"INT_TO_UDINT",["메모리값","int변경"]]]){
    const block=before.ladder[4].iecFunctions.find(b=>b.rowIndex===18&&b.rawX===x);
    assert.ok(before.ladder[4].iecScalarChainDeletionSites.some(s=>s.blockOffset===block.recordOffset));
    assert.throws(()=>delete_xgwx_iec_ld_scalar_chain_function(bytes,4,block.recordOffset,"UNKNOWN"));
    const deleted=delete_xgwx_iec_ld_scalar_chain_function(bytes,4,block.recordOffset,name), after=parse_xgwx(deleted);
    assert.deepEqual(after.localVariables,before.localVariables);
    for(let p=0;p<7;p++)if(p!==4)assert.deepEqual(after.ladder[p],before.ladder[p]);
    assert.equal(after.ladder[4].iecFunctions.length,before.ladder[4].iecFunctions.length-1);
    assert.deepEqual(after.ladder[4].iecRows.map(r=>r.rowIndex),before.ladder[4].iecRows.map(r=>r.rowIndex));
    if(x===13)assert.throws(()=>insert_xgwx_iec_ld_function(deleted,4,18,x,name,JSON.stringify(["가스","int변경"])));
    const restored=insert_xgwx_iec_ld_function(deleted,4,18,x,name,JSON.stringify(operands)), result=parse_xgwx(restored);
    assert.deepEqual(result.localVariables,before.localVariables);
    assert.deepEqual(result.ladder[4].iecFunctions.map(b=>[b.rowIndex,b.rawX,b.name]),before.ladder[4].iecFunctions.map(b=>[b.rowIndex,b.rawX,b.name]));
    if(x===4)assert.deepEqual(result.ladder,before.ladder);
  }
});

test("IEC mixed-height chain deletion drops only empty tail rows and restores exactly", async t => {
  const fixture=process.env.LIBXGWX_XGI_FIXTURE;
  if(!fixture){t.skip("set LIBXGWX_XGI_FIXTURE");return;}
  await init({module_or_path:fs.readFileSync(path.join(root,"media/libxgwx_bg.wasm"))});
  const {delete_xgwx_iec_ld_scalar_chain_function,insert_xgwx_iec_ld_function}=await import("../media/libxgwx.js");
  const bytes=fs.readFileSync(fixture), before=parse_xgwx(bytes);
  for(const [row,x,name,operands,removedRow] of [
    [22,4,"MUL",["int변경","1000","udint변경"],25],
    [22,13,"UDINT_TO_TIME",["udint변경","시간"],null],
    [30,4,"TIME_TO_UDINT",["카운터","time변경"],null],
    [30,13,"DIV",["time변경","1000","div_값"],33],
    [34,4,"UDINT_TO_INT",["div_값","밀리변경"],null],
  ]){
    const block=before.ladder[4].iecFunctions.find(b=>b.rowIndex===row&&b.rawX===x);
    assert.ok(before.ladder[4].iecScalarChainDeletionSites.some(s=>s.blockOffset===block.recordOffset));
    const deleted=delete_xgwx_iec_ld_scalar_chain_function(bytes,4,block.recordOffset,name), after=parse_xgwx(deleted);
    assert.deepEqual(after.localVariables,before.localVariables);
    assert.deepEqual(after.ladder[4].iecRows.map(r=>r.rowIndex),before.ladder[4].iecRows.map(r=>r.rowIndex).filter(r=>r!==removedRow));
    const restored=insert_xgwx_iec_ld_function(deleted,4,row,x,name,JSON.stringify(operands));
    assert.deepEqual(parse_xgwx(restored).ladder,before.ladder);
  }
});

test("IEC deletes the last short-wire block left in a scalar chain", async t => {
  const fixture=process.env.LIBXGWX_XGI_FIXTURE;
  if(!fixture){t.skip("set LIBXGWX_XGI_FIXTURE");return;}
  await init({module_or_path:fs.readFileSync(path.join(root,"media/libxgwx_bg.wasm"))});
  const {delete_xgwx_iec_ld_scalar_chain_function,delete_xgwx_iec_ld_standalone_function}=await import("../media/libxgwx.js");
  const bytes=fs.readFileSync(fixture), before=parse_xgwx(bytes);
  for(const [row,tailName,lastName] of [[22,"UDINT_TO_TIME","MUL"],[30,"DIV","TIME_TO_UDINT"],[41,"","GE"]]){
    const tail=before.ladder[4].iecFunctions.find(b=>b.rowIndex===row&&b.name===tailName);
    const one=tailName?delete_xgwx_iec_ld_scalar_chain_function(bytes,4,tail.recordOffset,tailName):bytes, middle=parse_xgwx(one);
    const last=middle.ladder[4].iecFunctions.find(b=>b.rowIndex===row&&b.name===lastName);
    assert.ok(middle.ladder[4].iecStandaloneFunctionDeletionSites.some(s=>s.blockOffset===last.recordOffset));
    const deleted=delete_xgwx_iec_ld_standalone_function(one,4,last.recordOffset,lastName), after=parse_xgwx(deleted);
    assert.deepEqual(after.localVariables,before.localVariables);
    assert.deepEqual(after.ladder[4].iecRows.map(r=>r.rowIndex),before.ladder[4].iecRows.map(r=>r.rowIndex).filter(r=>r<row||r>row+3));
    assert.equal(after.ladder[4].iecFunctions.length,before.ladder[4].iecFunctions.length-(tailName?2:1));
    for(const i of [0,1,2,3,5,6])assert.deepEqual(after.ladder[i],before.ladder[i]);
  }
});

test("IEC staggered MOVE deletion retains neighboring function pins", async t => {
  const fixture = process.env.LIBXGWX_XGI_FIXTURE;
  if (!fixture) { t.skip("set LIBXGWX_XGI_FIXTURE"); return; }
  await init({ module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm")) });
  const { delete_xgwx_iec_ld_scalar_chain_function, insert_xgwx_iec_ld_function } = await import("../media/libxgwx.js");
  const bytes = fs.readFileSync(fixture), before = parse_xgwx(bytes);
  const shape = ladder => ladder.iecFunctions.map(b => [b.rowIndex, b.rawX, b.name, b.pinCount]);
  for (const row of [22, 28, 53]) {
    const block = before.ladder[0].iecFunctions.find(b => b.rowIndex === row && b.rawX === 4 && b.name === "MOVE");
    assert.ok(before.ladder[0].iecScalarChainDeletionSites.some(s => s.blockOffset === block.recordOffset));
    const deleted = delete_xgwx_iec_ld_scalar_chain_function(bytes, 0, block.recordOffset, "MOVE"), after = parse_xgwx(deleted);
    assert.deepEqual(after.localVariables, before.localVariables);
    for (let p = 1; p < before.ladder.length; p++) assert.deepEqual(after.ladder[p], before.ladder[p]);
    assert.deepEqual(shape(after.ladder[0]), shape(before.ladder[0]).filter(b => b[0] !== row || b[1] !== 4));
    assert.deepEqual(after.ladder[0].iecRows.map(r => r.rowIndex), before.ladder[0].iecRows.map(r => r.rowIndex).filter(r => r !== row + 2));
    const restored = insert_xgwx_iec_ld_function(deleted, 0, row, 4, "MOVE", JSON.stringify(["%MW700", "%MW200"]));
    assert.deepEqual(shape(parse_xgwx(restored).ladder[0]), shape(before.ladder[0]));
  }
});

test("IEC completed branch tails support Delete and scalar replacement", async t => {
  const fixture = process.env.LIBXGWX_XGI_FIXTURE;
  if (!fixture) { t.skip("set LIBXGWX_XGI_FIXTURE"); return; }
  await init({ module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm")) });
  const { delete_xgwx_iec_ld_branch_function, replace_xgwx_iec_ld_branch_function } = await import("../media/libxgwx.js");
  const bytes = fs.readFileSync(fixture), before = parse_xgwx(bytes);
  for (const [p, row, expected] of [[5, 19, "SUB"], [6, 34, "SUB"], [6, 42, "GT"], [5, 36, "GT"], [0, 79, "EQ"], [0, 87, "MOVE"], [6, 74, "EQ"]]) {
    const block = before.ladder[p].iecFunctions.find(b => b.rowIndex === row && b.name === expected);
    const deleted = delete_xgwx_iec_ld_branch_function(bytes, p, block.recordOffset, expected), after = parse_xgwx(deleted);
    assert.deepEqual(after.ladder[p].iecRows.map(r => r.rowIndex), before.ladder[p].iecRows.map(r => r.rowIndex).filter(r => r <= row || r > row + block.pinCount));
    assert.equal(after.ladder[p].iecFunctions.length, before.ladder[p].iecFunctions.length - 1);
    assert.deepEqual(after.localVariables, before.localVariables);
    for (let i = 0; i < before.ladder.length; i++) if (i !== p) assert.deepEqual(after.ladder[i], before.ladder[i]);
    for (const name of (expected === "MOVE" ? ["MOVE"] : ["MOVE", "ADD", "SUB", "MUL", "DIV", "EQ", "GT", "GE", "LT", "LE"])) {
      const operands = name === "MOVE" ? ["1", "%MW414"] : ["1", "2", ["EQ", "GT", "GE", "LT", "LE"].includes(name) ? "%MX32" : "%MW414"];
      const replaced = replace_xgwx_iec_ld_branch_function(bytes, p, block.recordOffset, expected, name, JSON.stringify(operands)), result = parse_xgwx(replaced);
      const tail = result.ladder[p].iecFunctions.find(b => b.rowIndex === row && b.rawX === block.rawX);
      assert.equal(tail.name, name);
      assert.deepEqual(delete_xgwx_iec_ld_branch_function(replaced, p, tail.recordOffset, name), deleted);
    }
    assert.throws(() => replace_xgwx_iec_ld_branch_function(bytes, p, block.recordOffset, expected, "EQ", JSON.stringify(["1", "2", "%MW414"])));
  }
});


test("IEC contact scalar tails preserve contacts through Delete and replacement", async t => {
  const fixture = process.env.LIBXGWX_XGI_FIXTURE;
  if (!fixture) { t.skip("set LIBXGWX_XGI_FIXTURE"); return; }
  await init({ module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm")) });
  const { delete_xgwx_iec_ld_branch_function, replace_xgwx_iec_ld_branch_function } = await import("../media/libxgwx.js");
  const bytes = fs.readFileSync(fixture), before = parse_xgwx(bytes);
  for (const [p, row, x, output] of [[5, 43, 13, "%MW416"], [1, 6, 19, "%MW301"]]) {
    const block = before.ladder[p].iecFunctions.find(b => b.rowIndex === row && b.rawX === x);
    const deleted = delete_xgwx_iec_ld_branch_function(bytes, p, block.recordOffset, "MOVE");
    const after = parse_xgwx(deleted);
    assert.equal(after.ladder[p].iecFunctions.length, before.ladder[p].iecFunctions.length - 1);
    assert.deepEqual(after.localVariables, before.localVariables);
    for (let i = 0; i < before.ladder.length; i++) if (i !== p) assert.deepEqual(after.ladder[i], before.ladder[i]);
    for (const [name, operands] of [["MOVE", ["0", output]], ["ADD", ["1", "2", output]], ["EQ", ["1", "2", "%MX32"]]]) {
      const replaced = replace_xgwx_iec_ld_branch_function(bytes, p, block.recordOffset, "MOVE", name, JSON.stringify(operands));
      const result = parse_xgwx(replaced), tail = result.ladder[p].iecFunctions.find(b => b.rowIndex === row && b.rawX === x);
      assert.equal(tail.name, name);
      for (let i = 0; i < before.ladder.length; i++) if (i !== p) assert.deepEqual(result.ladder[i], before.ladder[i]);
      if (name === "MOVE" || p === 5) assert.deepEqual(delete_xgwx_iec_ld_branch_function(replaced, p, tail.recordOffset, name), deleted);
      else assert.equal(result.ladder[p].iecRows.find(r => r.rowIndex > row + tail.pinCount).rowIndex, 10);
    }
    assert.throws(() => replace_xgwx_iec_ld_branch_function(bytes, p, block.recordOffset, "MOVE", "EQ", JSON.stringify(["1", "2", output])));
  }
});


test("IEC continuing branch scalar bodies preserve their spine rows", async t => {
  const fixture = process.env.LIBXGWX_XGI_FIXTURE;
  if (!fixture) { t.skip("set LIBXGWX_XGI_FIXTURE"); return; }
  await init({ module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm")) });
  const { delete_xgwx_iec_ld_branch_function, replace_xgwx_iec_ld_branch_function } = await import("../media/libxgwx.js");
  const bytes = fs.readFileSync(fixture), before = parse_xgwx(bytes);
  for (const [p, row, x, name] of [[5, 32, 13, "LT"], [0, 71, 16, "EQ"], [0, 75, 16, "EQ"], [6, 66, 19, "EQ"], [6, 70, 19, "EQ"], [5, 24, 13, "LE"], [6, 38, 13, "LT"], [5, 28, 13, "GE"]]) {
    const block = before.ladder[p].iecFunctions.find(b => b.rowIndex === row && b.rawX === x);
    const deleted = delete_xgwx_iec_ld_branch_function(bytes, p, block.recordOffset, name), after = parse_xgwx(deleted);
    assert.deepEqual(after.ladder[p].iecRows.map(r => r.rowIndex), before.ladder[p].iecRows.map(r => r.rowIndex));
    assert.equal(after.ladder[p].iecFunctions.length, before.ladder[p].iecFunctions.length - 1);
    for (const [replacement, operands] of [["MOVE", ["0", "%MW416"]], ["ADD", ["1", "2", "%MW416"]], ["GE", ["1", "2", "%MX32"]]]) {
      const edited = replace_xgwx_iec_ld_branch_function(bytes, p, block.recordOffset, name, replacement, JSON.stringify(operands)), result = parse_xgwx(edited);
      const target = result.ladder[p].iecFunctions.find(b => b.rowIndex === row && b.rawX === x);
      assert.equal(target.name, replacement);
      assert.deepEqual(delete_xgwx_iec_ld_branch_function(edited, p, target.recordOffset, replacement), deleted);
      for (let i = 0; i < before.ladder.length; i++) if (i !== p) assert.deepEqual(result.ladder[i], before.ladder[i]);
    }
    assert.throws(() => replace_xgwx_iec_ld_branch_function(bytes, p, block.recordOffset, name, "EQ", JSON.stringify(["1", "2", "%MW416"])));
  }
});

test("IEC upper MOVE grows a retained branch for three-pin replacement", async t => {
  const fixture = process.env.LIBXGWX_XGI_FIXTURE;
  if (!fixture) { t.skip("set LIBXGWX_XGI_FIXTURE"); return; }
  await init({ module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm")) });
  const { delete_xgwx_iec_ld_branch_function, replace_xgwx_iec_ld_branch_function } = await import("../media/libxgwx.js");
  const bytes = fs.readFileSync(fixture), before = parse_xgwx(bytes), p = 5;
  const block = before.ladder[p].iecFunctions.find(b => b.rowIndex === 40 && b.rawX === 13);
  const deleted = delete_xgwx_iec_ld_branch_function(bytes, p, block.recordOffset, "MOVE");
  const added = replace_xgwx_iec_ld_branch_function(bytes, p, block.recordOffset, "MOVE", "ADD", JSON.stringify(["1", "2", "%MW416"]));
  const result = parse_xgwx(added), target = result.ladder[p].iecFunctions.find(b => b.rowIndex === 40 && b.rawX === 13);
  assert.equal(result.ladder[p].iecRows.length, before.ladder[p].iecRows.length + 1);
  assert.ok(result.ladder[p].iecFunctions.some(b => b.rowIndex === 44 && b.rawX === 13 && b.name === "MOVE"));
  const recovered = delete_xgwx_iec_ld_branch_function(added, p, target.recordOffset, "ADD");
  assert.notDeepEqual(recovered, deleted);
  for (const [name, operands] of [["MOVE", ["0", "%MW416"]], ["GE", ["1", "2", "%MX32"]]]) {
    const edited = replace_xgwx_iec_ld_branch_function(added, p, target.recordOffset, "ADD", name, JSON.stringify(operands));
    const changed = parse_xgwx(edited).ladder[p].iecFunctions.find(b => b.rowIndex === 40 && b.rawX === 13);
    assert.deepEqual(delete_xgwx_iec_ld_branch_function(edited, p, changed.recordOffset, name), recovered);
  }
  for (let i = 0; i < before.ladder.length; i++) if (i !== p) assert.deepEqual(result.ladder[i], before.ladder[i]);
  assert.throws(() => replace_xgwx_iec_ld_branch_function(bytes, p, block.recordOffset, "MOVE", "EQ", JSON.stringify(["1", "2", "%MW416"])));
});

test("IEC scalar replacement preserves R_TRIG and rejects invalid outputs atomically", async t => {
  const fixture = process.env.LIBXGWX_XGI_FIXTURE;
  if (!fixture) { t.skip("set LIBXGWX_XGI_FIXTURE"); return; }
  await init({ module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm")) });
  const { delete_xgwx_iec_ld_scalar_chain_function, replace_xgwx_iec_ld_scalar_chain_function } = await import("../media/libxgwx.js");
  const bytes = fs.readFileSync(fixture), before = parse_xgwx(bytes);
  const block = before.ladder[0].iecFunctions.find(b => b.rowIndex === 32 && b.rawX === 19);
  const deleted = delete_xgwx_iec_ld_scalar_chain_function(bytes, 0, block.recordOffset, "ADD"), after = parse_xgwx(deleted);
  assert.deepEqual(after.ladder[0].iecRows.map(r => r.rowIndex), before.ladder[0].iecRows.filter(r => ![34, 35].includes(r.rowIndex)).map(r => r.rowIndex));
  for (const [name, operands] of [["MOVE", ["0", "%MW600"]], ["ADD", ["1", "2", "%MW600"]], ["EQ", ["1", "2", "%MX32"]]]) {
    const edited = replace_xgwx_iec_ld_scalar_chain_function(bytes, 0, block.recordOffset, "ADD", name, JSON.stringify(operands)), result = parse_xgwx(edited);
    const target = result.ladder[0].iecFunctions.find(b => b.rowIndex === 32 && b.rawX === 19);
    assert.equal(target.name, name);
    assert.equal(result.ladder[0].iecFunctions.find(b => b.rowIndex === 32 && b.rawX === 10).instance, before.ladder[0].iecFunctions.find(b => b.rowIndex === 32 && b.rawX === 10).instance);
    assert.deepEqual(delete_xgwx_iec_ld_scalar_chain_function(edited, 0, target.recordOffset, name), deleted);
    for (let p = 1; p < 7; p++) assert.deepEqual(result.ladder[p], before.ladder[p]);
    assert.deepEqual(result.localVariables, before.localVariables);
  }
  assert.throws(() => replace_xgwx_iec_ld_scalar_chain_function(bytes, 0, block.recordOffset, "ADD", "EQ", JSON.stringify(["1", "2", "%MW600"])));
});

test("IEC EQ result MOVE exposes deletion and preserves shared pins on refill", async t => {
  const fixture = process.env.LIBXGWX_XGI_FIXTURE;
  if (!fixture) { t.skip("set LIBXGWX_XGI_FIXTURE"); return; }
  await init({ module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm")) });
  const { delete_xgwx_iec_ld_scalar_chain_function, insert_xgwx_iec_ld_function } = await import("../media/libxgwx.js");
  const bytes = fs.readFileSync(fixture), before = parse_xgwx(bytes);
  const block = before.ladder[0].iecFunctions.find(b => b.rowIndex === 38 && b.rawX === 19);
  assert.ok(before.ladder[0].iecScalarChainDeletionSites.some(s => s.blockOffset === block.recordOffset));
  const deleted = delete_xgwx_iec_ld_scalar_chain_function(bytes, 0, block.recordOffset, "MOVE"), after = parse_xgwx(deleted);
  assert.deepEqual(after.ladder[0].iecRows.map(r => r.rowIndex), before.ladder[0].iecRows.map(r => r.rowIndex));
  const eq = after.ladder[0].iecFunctions.find(b => b.rowIndex === 37 && b.rawX === 10);
  const owned = after.ladder[0].iecFunctionOperandLinks.filter(l => l.targetRecordOffset === eq.recordOffset);
  assert.equal(owned.length, 2);
  assert.ok(owned.every(l => !l.isOutput));
  const restored = insert_xgwx_iec_ld_function(deleted, 0, 38, 19, "MOVE", JSON.stringify(["0", "%MW600"]));
  const result = parse_xgwx(restored), target = result.ladder[0].iecFunctions.find(b => b.rowIndex === 38 && b.rawX === 19);
  assert.deepEqual(delete_xgwx_iec_ld_scalar_chain_function(restored, 0, target.recordOffset, "MOVE"), deleted);
  for (let p = 1; p < 7; p++) assert.deepEqual(result.ladder[p], before.ladder[p]);
  assert.throws(() => insert_xgwx_iec_ld_function(deleted, 0, 38, 19, "EQ", JSON.stringify(["1", "2", "%MX32"])));
});

test("IEC wired comparison refill exposes two inputs and keeps its MOVE consumer", async t => {
  const fixture = process.env.LIBXGWX_XGI_FIXTURE;
  if (!fixture) { t.skip("set LIBXGWX_XGI_FIXTURE"); return; }
  await init({ module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm")) });
  const { delete_xgwx_iec_ld_scalar_chain_function, replace_xgwx_iec_ld_scalar_chain_function, insert_xgwx_iec_ld_function } = await import("../media/libxgwx.js");
  const bytes = fs.readFileSync(fixture), before = parse_xgwx(bytes);
  const block = before.ladder[0].iecFunctions.find(b => b.rowIndex === 37 && b.rawX === 10);
  assert.ok(before.ladder[0].iecScalarChainDeletionSites.some(s => s.blockOffset === block.recordOffset));
  const deleted = delete_xgwx_iec_ld_scalar_chain_function(bytes, 0, block.recordOffset, "EQ"), scaffold = parse_xgwx(deleted);
  assert.ok(scaffold.ladder[0].iecWiredComparisonInsertionSites.some(s => s.rowIndex === 37 && s.rawX === 10));
  assert.ok(!scaffold.ladder[0].iecRows.some(r => r.rowIndex === 37));
  for (const name of ["EQ", "GT", "GE", "LT", "LE"]) {
    const edited = replace_xgwx_iec_ld_scalar_chain_function(bytes, 0, block.recordOffset, "EQ", name, JSON.stringify(["%MW600", "8"]));
    const result = parse_xgwx(edited), target = result.ladder[0].iecFunctions.find(b => b.rowIndex === 37 && b.rawX === 10);
    const links = result.ladder[0].iecFunctionOperandLinks.filter(l => l.targetRecordOffset === target.recordOffset);
    assert.equal(target.name, name);
    assert.equal(links.length, 2);
    assert.ok(links.every(l => !l.isOutput));
    assert.ok(result.ladder[0].iecFunctions.some(b => b.rowIndex === 38 && b.rawX === 19 && b.name === "MOVE"));
    assert.deepEqual(delete_xgwx_iec_ld_scalar_chain_function(edited, 0, target.recordOffset, name), deleted);
    for (let p = 1; p < 7; p++) assert.deepEqual(result.ladder[p], before.ladder[p]);
  }
  const boolInputs = replace_xgwx_iec_ld_scalar_chain_function(bytes, 0, block.recordOffset, "EQ", "EQ", JSON.stringify(["TRUE", "FALSE"]));
  const boolBlock = parse_xgwx(boolInputs).ladder[0].iecFunctions.find(b => b.rowIndex === 37 && b.rawX === 10);
  assert.deepEqual(delete_xgwx_iec_ld_scalar_chain_function(boolInputs, 0, boolBlock.recordOffset, "EQ"), deleted);
  assert.throws(() => insert_xgwx_iec_ld_function(deleted, 0, 37, 10, "EQ", JSON.stringify(["%MW600", "%MX32"])));
});


test("IEC connected TON preserves its branch and coil during Delete and typed refill", async t => {
  const fixture = process.env.LIBXGWX_XGI_FIXTURE;
  if (!fixture) { t.skip("set LIBXGWX_XGI_FIXTURE"); return; }
  await init({module_or_path: fs.readFileSync(path.join(root,"media/libxgwx_bg.wasm"))});
  const {delete_xgwx_iec_ld_scalar_chain_function,insert_xgwx_iec_ld_terminal_timer} = await import("../media/libxgwx.js");
  const bytes = fs.readFileSync(fixture), before = parse_xgwx(bytes);
  const block = before.ladder[1].iecFunctions.find(b => b.rowIndex === 1 && b.rawX === 19);
  assert.ok(before.ladder[1].iecScalarChainDeletionSites.some(s => s.blockOffset === block.recordOffset));
  const deleted = delete_xgwx_iec_ld_scalar_chain_function(bytes,1,block.recordOffset,"TON"), scaffold = parse_xgwx(deleted);
  const site = scaffold.ladder[1].iecTerminalTimerInsertionSites.find(s => s.rowIndex === 1 && s.rawX === 19);
  assert.ok(site);
  assert.ok(!scaffold.ladder[1].iecRows.some(r => r.rowIndex === 3));
  for (const args of [["UNKNOWN","T#5s",""],["INST13","8",""],["INST13","T#5s","T#1s"]]) {
    assert.throws(() => insert_xgwx_iec_ld_terminal_timer(deleted,1,site.contactOffset,...args));
  }
  const refill = insert_xgwx_iec_ld_terminal_timer(deleted,1,site.contactOffset,"INST13","T#5s",""), after = parse_xgwx(refill);
  assert.deepEqual(after.localVariables,before.localVariables);
  for (let i=0;i<7;i++) if (i !== 1) assert.deepEqual(after.ladder[i],before.ladder[i]);
  const timer = after.ladder[1].iecFunctions.find(b => b.rowIndex === 1 && b.name === "TON");
  assert.equal(timer.instance,"INST13");
  assert.equal(after.ladder[1].iecFunctionOperandLinks.filter(l => l.targetRecordOffset === timer.recordOffset).length,1);
  assert.deepEqual(delete_xgwx_iec_ld_scalar_chain_function(refill,1,timer.recordOffset,"TON"),deleted);
});

test("IEC long-feed TON retains its contacts during Delete and positional typed refill", async t => {
  const fixture = process.env.LIBXGWX_XGI_FIXTURE;
  if (!fixture) { t.skip("set LIBXGWX_XGI_FIXTURE"); return; }
  await init({module_or_path: fs.readFileSync(path.join(root,"media/libxgwx_bg.wasm"))});
  const {delete_xgwx_iec_ld_scalar_chain_function} = await import("../media/libxgwx.js");
  const bytes = fs.readFileSync(fixture), before = parse_xgwx(bytes);
  for (const [program,row,instance,count] of [[2,13,"INST10",1],[3,59,"INST1",3]]) {
    const block = before.ladder[program].iecFunctions.find(b => b.rowIndex === row && b.rawX === 22);
    assert.ok(before.ladder[program].iecScalarChainDeletionSites.some(s => s.blockOffset === block.recordOffset));
    const deleted = delete_xgwx_iec_ld_scalar_chain_function(bytes,program,block.recordOffset,"TON"), scaffold = parse_xgwx(deleted);
    assert.ok(scaffold.ladder[program].iecTerminalTimerInsertionSites.some(s => s.rowIndex === row && s.rawX === 22));
    assert.equal(scaffold.ladder[program].iecRecords.filter(r => r.rowIndex === row && r.kind.startsWith("Contact")).length,count);
    for (const args of [["UNKNOWN","T#15s"],[instance,"8"],[instance]]) {
      assert.throws(() => insert_xgwx_iec_ld_function(deleted,program,row,22,"TON",JSON.stringify(args)));
    }
    assert.throws(() => insert_xgwx_iec_ld_function(deleted,program,row,19,"TON",JSON.stringify([instance,"T#15s"])));
    const refill = insert_xgwx_iec_ld_function(deleted,program,row,22,"TON",JSON.stringify([instance,"T#15s"])), after = parse_xgwx(refill);
    assert.deepEqual(after.localVariables,before.localVariables);
    for (let i=0;i<7;i++) if (i !== program) assert.deepEqual(after.ladder[i],before.ladder[i]);
    const timer = after.ladder[program].iecFunctions.find(b => b.rowIndex === row && b.name === "TON");
    assert.equal(timer.instance,instance);
    assert.equal(after.ladder[program].iecFunctionOperandLinks.filter(l => l.targetRecordOffset === timer.recordOffset).length,1);
    assert.deepEqual(delete_xgwx_iec_ld_scalar_chain_function(refill,program,timer.recordOffset,"TON"),deleted);
  }
});

test("IEC paired comparisons preserve their output branch through Delete and typed refill", async t => {
  const fixture=process.env.LIBXGWX_XGI_FIXTURE;
  if (!fixture) {t.skip("set LIBXGWX_XGI_FIXTURE");return;}
  await init({module_or_path:fs.readFileSync(path.join(root,"media/libxgwx_bg.wasm"))});
  const {delete_xgwx_iec_ld_scalar_chain_function,insert_xgwx_iec_ld_function}=await import("../media/libxgwx.js");
  const bytes=fs.readFileSync(fixture),before=parse_xgwx(bytes);
  for (const [index,row,x,instance,first,second] of [[2,16,7,"INST10.ET","T#2s","T#3s"],[2,23,4,"INST10.ET","T#7s","T#9s"],[3,62,7,"INST1.ET","T#2s","T#3s"],[3,68,4,"INST1.ET","T#7s","T#9s"]]) {
    for (const [r,at,name,preset] of [[row,x,"GT",first],[row+1,x+9,"LE",second]]) {
      const block=before.ladder[index].iecFunctions.find(b=>b.rowIndex===r && b.rawX===at);
      assert.ok(before.ladder[index].iecScalarChainDeletionSites.some(s=>s.blockOffset===block.recordOffset));
      const deleted=delete_xgwx_iec_ld_scalar_chain_function(bytes,index,block.recordOffset,name),scaffold=parse_xgwx(deleted);
      assert.ok(scaffold.ladder[index].iecWiredComparisonInsertionSites.some(s=>s.rowIndex===r && s.rawX===at));
      assert.throws(()=>insert_xgwx_iec_ld_function(deleted,index,r,at,name,JSON.stringify([instance,"8"])));
      const restored=insert_xgwx_iec_ld_function(deleted,index,r,at,name,JSON.stringify([instance,preset])),after=parse_xgwx(restored);
      const replacement=after.ladder[index].iecFunctions.find(b=>b.rowIndex===r && b.rawX===at);
      assert.equal(after.ladder[index].iecFunctionOperandLinks.filter(l=>l.targetRecordOffset===replacement.recordOffset).length,2);
      for(let i=0;i<7;i++) if(i!==index) assert.deepEqual(after.ladder[i],before.ladder[i]);
      assert.deepEqual(delete_xgwx_iec_ld_scalar_chain_function(restored,index,replacement.recordOffset,name),deleted);
    }
    let both=bytes;
    for(const [r,at,name] of [[row,x,"GT"],[row+1,x+9,"LE"]]) {
      const block=parse_xgwx(both).ladder[index].iecFunctions.find(b=>b.rowIndex===r && b.rawX===at);
      both=delete_xgwx_iec_ld_scalar_chain_function(both,index,block.recordOffset,name);
    }
    const vacant=parse_xgwx(both).ladder[index];
    assert.ok(!vacant.iecRows.some(r=>r.rowIndex===row+1));
    for(const [r,at,name,preset] of [[row+1,x+9,"LE",second],[row,x,"GT",first]]) {
      both=insert_xgwx_iec_ld_function(both,index,r,at,name,JSON.stringify([instance,preset]));
    }
    assert.equal(parse_xgwx(both).ladder[index].iecFunctions.filter(b=>(b.rowIndex===row && b.rawX===x)||(b.rowIndex===row+1 && b.rawX===x+9)).length,2);
  }
});


test("IEC conversion pairs retain TON records through typed Delete and refill", async t => {
  const fixture=process.env.LIBXGWX_XGI_FIXTURE;
  if (!fixture) {t.skip("set LIBXGWX_XGI_FIXTURE");return;}
  await init({module_or_path:fs.readFileSync(path.join(root,"media/libxgwx_bg.wasm"))});
  const {delete_xgwx_iec_ld_scalar_chain_function,insert_xgwx_iec_ld_function}=await import("../media/libxgwx.js");
  const bytes=fs.readFileSync(fixture),before=parse_xgwx(bytes);
  for(const [index,row,device,shared,time] of [[5,8,"%MW410","출력_2","시간입력변환2"],[6,12,"%MW500","출력_1","시간입력변환"]]) {
    const originalTimer=before.ladder[index].iecFunctions.find(b=>b.rowIndex===row+3 && b.rawX===10);
    for (const [x,name,args] of [[10,"INT_TO_UDINT",[device,shared]],[19,"UDINT_TO_TIME",[shared,time]]]) {
      const block=before.ladder[index].iecFunctions.find(b=>b.rowIndex===row && b.rawX===x);
      assert.ok(before.ladder[index].iecScalarChainDeletionSites.some(s=>s.blockOffset===block.recordOffset));
      const deleted=delete_xgwx_iec_ld_scalar_chain_function(bytes,index,block.recordOffset,name);
      assert.throws(()=>insert_xgwx_iec_ld_function(deleted,index,row,x,name,JSON.stringify([time,shared])));
      const restored=insert_xgwx_iec_ld_function(deleted,index,row,x,name,JSON.stringify(args)),after=parse_xgwx(restored);
      const timer=after.ladder[index].iecFunctions.find(b=>b.rowIndex===row+3 && b.rawX===10);
      assert.equal(timer.name,originalTimer.name);
      assert.equal(timer.instance,originalTimer.instance);
      assert.deepEqual(timer.pins,originalTimer.pins);
      for(let i=0;i<7;i++) if(i!==index) assert.deepEqual(after.ladder[i],before.ladder[i]);
      const replacement=after.ladder[index].iecFunctions.find(b=>b.rowIndex===row && b.rawX===x);
      assert.deepEqual(delete_xgwx_iec_ld_scalar_chain_function(restored,index,replacement.recordOffset,name),deleted);
    }
    const results=[];
    for(const reverse of [false,true]) {
      let both=bytes;
      const order=reverse?[19,10]:[10,19];
      for(const x of order) {
        const b=parse_xgwx(both).ladder[index].iecFunctions.find(b=>b.rowIndex===row && b.rawX===x);
        both=delete_xgwx_iec_ld_scalar_chain_function(both,index,b.recordOffset,b.name);
      }
      assert.equal(parse_xgwx(both).ladder[index].iecRows.filter(r=>r.rowIndex>=row && r.rowIndex<=row+5).length,6);
      for(const x of order) both=insert_xgwx_iec_ld_function(both,index,row,x,x===10?"INT_TO_UDINT":"UDINT_TO_TIME",JSON.stringify(x===10?[device,shared]:[shared,time]));
      results.push(both);
    }
    assert.deepEqual(results[0],results[1]);
  }
});

test("IEC shared branch TON supports typed Delete, refill and atomic replacement", async t => {
  const fixture=process.env.LIBXGWX_XGI_FIXTURE;
  if (!fixture) {t.skip("set LIBXGWX_XGI_FIXTURE");return;}
  await init({module_or_path:fs.readFileSync(path.join(root,"media/libxgwx_bg.wasm"))});
  const {delete_xgwx_iec_ld_scalar_chain_function:remove,insert_xgwx_iec_ld_function:insert,
    replace_xgwx_iec_ld_scalar_chain_function:replace}=await import("../media/libxgwx.js");
  const bytes=fs.readFileSync(fixture),before=parse_xgwx(bytes);
  for (const [index,row,instance,preset] of [[5,11,"타이머4","시간입력변환2"],[6,15,"타이머3","시간입력변환"]]) {
    const block=before.ladder[index].iecFunctions.find(b=>b.rowIndex===row && b.rawX===10);
    assert.ok(before.ladder[index].iecScalarChainDeletionSites.some(s=>s.blockOffset===block.recordOffset));
    const deleted=remove(bytes,index,block.recordOffset,"TON"),summary=parse_xgwx(deleted);
    assert.ok(summary.ladder[index].iecTerminalTimerInsertionSites.some(s=>s.rowIndex===row && s.rawX===10));
    assert.throws(()=>insert(deleted,index,row,10,"TON",JSON.stringify([instance,"1"])));
    assert.throws(()=>replace(bytes,index,block.recordOffset,"TON","TON",JSON.stringify(["UNKNOWN",preset])));
    const restored=insert(deleted,index,row,10,"TON",JSON.stringify([instance,preset]));
    const literal=replace(bytes,index,block.recordOffset,"TON","TON",JSON.stringify([instance,"T#2s"]));
    assert.ok(parse_xgwx(literal).ladder[index].sourceStrings.some(s=>s.isIecFunctionOperand && s.value==="T#2s"));
    for (let i=0;i<7;i++) if(i!==index) assert.deepEqual(parse_xgwx(restored).ladder[i],before.ladder[i]);
    const newBlock=parse_xgwx(restored).ladder[index].iecFunctions.find(b=>b.rowIndex===row && b.rawX===10);
    assert.deepEqual(remove(restored,index,newBlock.recordOffset,"TON"),deleted);
  }
  // The shared TON prompt also edits previously supported connected timers.
  for (const [index,row,x] of [[1,1,19],[2,13,22],[3,59,22]]) {
    const block=before.ladder[index].iecFunctions.find(b=>b.rowIndex===row && b.rawX===x && b.name==="TON");
    const updated=replace(bytes,index,block.recordOffset,"TON","TON",JSON.stringify([block.instance,"T#2s"]));
    const after=parse_xgwx(updated);
    assert.equal(after.ladder[index].iecFunctions.find(b=>b.rowIndex===row && b.rawX===x).instance,block.instance);
    assert.ok(after.ladder[index].sourceStrings.some(s=>s.isIecFunctionOperand && s.value==="T#2s"));
    for(let i=0;i<7;i++) if(i!==index) assert.deepEqual(after.ladder[i],before.ladder[i]);
  }

});

test("IEC enabled connected TON supports guarded Delete, refill and instance replacement", async t => {
  const fixture=process.env.LIBXGWX_XGI_FIXTURE;
  if (!fixture) {t.skip("set LIBXGWX_XGI_FIXTURE");return;}
  await init({module_or_path:fs.readFileSync(path.join(root,"media/libxgwx_bg.wasm"))});
  const {delete_xgwx_iec_ld_scalar_chain_function:remove,insert_xgwx_iec_ld_function:insert,
    replace_xgwx_iec_ld_scalar_chain_function:replace}=await import("../media/libxgwx.js");
  const bytes=fs.readFileSync(fixture),before=parse_xgwx(bytes),block=before.ladder[2].iecFunctions.find(b=>b.rowIndex===31 && b.rawX===19);
  assert.ok(before.ladder[2].iecScalarChainDeletionSites.some(s=>s.blockOffset===block.recordOffset));
  const deleted=remove(bytes,2,block.recordOffset,"TON"),summary=parse_xgwx(deleted);
  assert.ok(summary.ladder[2].iecTerminalTimerInsertionSites.some(s=>s.rowIndex===31 && s.rawX===19));
  assert.throws(()=>insert(deleted,2,31,19,"TON",JSON.stringify(["INST10","T#5s"])));
  assert.throws(()=>insert(deleted,2,31,19,"TON",JSON.stringify(["INST12","8"])));
  for(const [instance,preset] of [["INST12","T#5s"],["INST12","T#7s"],["INST9","T#5s"]]) {
    const updated=replace(bytes,2,block.recordOffset,"TON","TON",JSON.stringify([instance,preset])),after=parse_xgwx(updated);
    const b=after.ladder[2].iecFunctions.find(b=>b.rowIndex===31 && b.rawX===19);
    assert.equal(b.instance,instance);
    assert.deepEqual(remove(updated,2,b.recordOffset,"TON"),deleted);
    assert.deepEqual(after.localVariables,before.localVariables);
    for(let i=0;i<7;i++) if(i!==2) assert.deepEqual(after.ladder[i],before.ladder[i]);
  }
});


test("IEC common-entry contact MOVE supports Delete, refill and typed operand editing", async t => {
  const fixture=process.env.LIBXGWX_XGI_FIXTURE;
  if (!fixture) {t.skip("set LIBXGWX_XGI_FIXTURE");return;}
  await init({module_or_path:fs.readFileSync(path.join(root,"media/libxgwx_bg.wasm"))});
  const {delete_xgwx_iec_ld_scalar_chain_function:remove,insert_xgwx_iec_ld_function:insert,
    replace_xgwx_iec_ld_scalar_chain_function:replace}=await import("../media/libxgwx.js");
  const bytes=fs.readFileSync(fixture),before=parse_xgwx(bytes),block=before.ladder[2].iecFunctions.find(b=>b.rowIndex===36 && b.rawX===19);
  assert.ok(before.ladder[2].iecScalarChainDeletionSites.some(s=>s.blockOffset===block.recordOffset));
  const {update_xgwx_iec_ld_function_operand:update}=await import("../media/libxgwx.js");
  const input=before.ladder[2].sourceStrings.find(s=>s.value==="0" && before.ladder[2].iecFunctionOperandLinks.some(l=>l.targetRecordOffset===block.recordOffset && s.iecRecordOffset===l.recordOffset));
  assert.throws(()=>update(bytes,2,input.offset,"0","TRUE"));
  assert.ok(update(bytes,2,input.offset,"0","1"));
  const deleted=remove(bytes,2,block.recordOffset,"MOVE"),summary=parse_xgwx(deleted);
  assert.equal(summary.ladder[2].iecFunctions.some(b=>b.rowIndex===36),false);
  assert.equal(summary.ladder[2].iecRecords.filter(r=>r.rowIndex===36).length,1);
  for(const operands of [["0","0"],["TRUE","%MW301"],["UNKNOWN","%MW301"]]) {
    assert.throws(()=>insert(deleted,2,36,19,"MOVE",JSON.stringify(operands)));
  }
  assert.throws(()=>insert(deleted,2,36,19,"ADD",JSON.stringify(["0","1","%MW301"])));
  for(const operands of [["0","%MW301"],["1","%MW302"]]) {
    const updated=insert(deleted,2,36,19,"MOVE",JSON.stringify(operands)),after=parse_xgwx(updated);
    const b=after.ladder[2].iecFunctions.find(b=>b.rowIndex===36 && b.rawX===19);
    assert.equal(b.name,"MOVE");
    assert.deepEqual(remove(updated,2,b.recordOffset,"MOVE"),deleted);
    assert.deepEqual(updated,replace(bytes,2,block.recordOffset,"MOVE","MOVE",JSON.stringify(operands)));
    assert.deepEqual(after.localVariables,before.localVariables);
    for(let i=0;i<7;i++) if(i!==2) assert.deepEqual(after.ladder[i],before.ladder[i]);
  }
});

test("IEC lighting contact MOVE supports Delete and refill at x16", async t => {
  const fixture = process.env.LIBXGWX_XGI_FIXTURE;
  if (!fixture) { t.skip("set LIBXGWX_XGI_FIXTURE"); return; }
  await init({ module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm")) });
  const {
    delete_xgwx_iec_ld_scalar_chain_function: remove,
    insert_xgwx_iec_ld_function: insert,
    replace_xgwx_iec_ld_scalar_chain_function: replace,
  } = await import("../media/libxgwx.js");
  const bytes = fs.readFileSync(fixture), before = parse_xgwx(bytes);
  for (const [row, input] of [[56, "3"], [59, "0"]]) {
    const block = before.ladder[0].iecFunctions.find(b => b.rowIndex === row && b.rawX === 16);
    assert.ok(before.ladder[0].iecScalarChainDeletionSites.some(s => s.blockOffset === block.recordOffset));
    const deleted = remove(bytes, 0, block.recordOffset, "MOVE"), empty = parse_xgwx(deleted);
    assert.equal(empty.ladder[0].iecRecords.filter(r => r.rowIndex === row).length, 1);
    assert.throws(() => insert(deleted, 0, row, 16, "ADD", JSON.stringify(["0", "1", "%MW700"])));
    assert.throws(() => insert(deleted, 0, row, 16, "MOVE", JSON.stringify(["TRUE", "%MW700"])));
    const operands = JSON.stringify([input, "%MW700"]);
    const filled = insert(deleted, 0, row, 16, "MOVE", operands), after = parse_xgwx(filled);
    const restored = after.ladder[0].iecFunctions.find(b => b.rowIndex === row && b.rawX === 16);
    assert.equal(restored.name, "MOVE");
    assert.deepEqual(remove(filled, 0, restored.recordOffset, "MOVE"), deleted);
    assert.deepEqual(replace(bytes, 0, block.recordOffset, "MOVE", "MOVE", operands), filled);
    assert.deepEqual(after.localVariables, before.localVariables);
    for (let i = 1; i < 7; i++) assert.deepEqual(after.ladder[i], before.ladder[i]);
  }
});

test("IEC MOVE accepts numeric BOOL literals without weakening WORD checks", async t => {
  const fixture = process.env.LIBXGWX_XGI_FIXTURE;
  if (!fixture) { t.skip("set LIBXGWX_XGI_FIXTURE"); return; }
  await init({ module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm")) });
  const {
    update_xgwx_iec_ld_function_operand: update,
    delete_xgwx_iec_ld_scalar_chain_function: remove,
    insert_xgwx_iec_ld_function: insert,
  } = await import("../media/libxgwx.js");
  const bytes = fs.readFileSync(fixture), before = parse_xgwx(bytes), program = before.ladder[0];
  const block = program.iecFunctions.find(b => b.rowIndex === 63 && b.rawX === 16);
  const linked = program.sourceStrings.filter(s => program.iecFunctionOperandLinks.some(l =>
    l.targetRecordOffset === block.recordOffset && s.iecRecordOffset === l.recordOffset));
  const input = linked.find(s => s.value === "0"), output = linked.find(s => s.value === "자기유지2");
  assert.ok(update(bytes, 0, input.offset, "0", "1"));
  assert.ok(update(bytes, 0, output.offset, "자기유지2", "자기유지1"));
  assert.throws(() => update(bytes, 0, input.offset, "0", "2"));
  const deleted = remove(bytes, 0, block.recordOffset, "MOVE");
  for (const value of ["0", "1"]) {
    const filled = insert(deleted, 0, 63, 16, "MOVE", JSON.stringify([value, "자기유지2"]));
    const after = parse_xgwx(filled);
    assert.equal(after.ladder[0].iecFunctions.find(b => b.rowIndex === 63).name, "MOVE");
    for (let i = 1; i < 7; i++) assert.deepEqual(after.ladder[i], before.ladder[i]);
  }
  assert.throws(() => insert(deleted, 0, 63, 16, "MOVE", JSON.stringify(["2", "자기유지2"])));
  assert.throws(() => insert(deleted, 0, 63, 16, "MOVE", JSON.stringify(["TRUE", "%MW700"])));
});

test("IEC parallel contact MOVE retains both branches through Delete and refill", async t => {
  const fixture = process.env.LIBXGWX_XGI_FIXTURE;
  if (!fixture) { t.skip("set LIBXGWX_XGI_FIXTURE"); return; }
  await init({ module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm")) });
  const { delete_xgwx_iec_ld_scalar_chain_function: remove,
    insert_xgwx_iec_ld_function: insert,
    replace_xgwx_iec_ld_scalar_chain_function: replace } = await import("../media/libxgwx.js");
  const bytes = fs.readFileSync(fixture), before = parse_xgwx(bytes);
  const block = before.ladder[0].iecFunctions.find(b => b.rowIndex === 48 && b.rawX === 19);
  const deleted = remove(bytes, 0, block.recordOffset, "MOVE");
  const filled = insert(deleted, 0, 48, 19, "MOVE", JSON.stringify(["0", "%MW600"]));
  assert.deepEqual(replace(bytes, 0, block.recordOffset, "MOVE", "MOVE", JSON.stringify(["0", "%MW600"])), filled);
  const restored = parse_xgwx(filled), after = parse_xgwx(deleted);
  const next = restored.ladder[0].iecFunctions.find(b => b.rowIndex === 48 && b.rawX === 19);
  assert.deepEqual(remove(filled, 0, next.recordOffset, "MOVE"), deleted);
  assert.throws(() => insert(deleted, 0, 48, 19, "ADD", JSON.stringify(["1", "2", "%MW600"])));
  for (let i = 1; i < 7; i++) {
    assert.deepEqual(after.ladder[i], before.ladder[i]);
    assert.deepEqual(restored.ladder[i], before.ladder[i]);
  }
});

test("IEC upper staggered MOVE splits and merges groups without shifting its neighbor", async t => {
  const fixture = process.env.LIBXGWX_XGI_FIXTURE;
  if (!fixture) { t.skip("set LIBXGWX_XGI_FIXTURE"); return; }
  await init({ module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm")) });
  const { delete_xgwx_iec_ld_scalar_chain_function: remove,
    insert_xgwx_iec_ld_function: insert,
    replace_xgwx_iec_ld_scalar_chain_function: replace } = await import("../media/libxgwx.js");
  const bytes = fs.readFileSync(fixture), before = parse_xgwx(bytes);
  const block = before.ladder[0].iecFunctions.find(b => b.rowIndex === 52 && b.rawX === 16);
  assert.ok(before.ladder[0].iecScalarChainDeletionSites.some(s => s.blockOffset === block.recordOffset));
  const deleted = remove(bytes, 0, block.recordOffset, "MOVE");
  const filled = insert(deleted, 0, 52, 16, "MOVE", JSON.stringify(["0", "%MW700"]));
  assert.deepEqual(replace(bytes, 0, block.recordOffset, "MOVE", "MOVE", JSON.stringify(["0", "%MW700"])), filled);
  const after = parse_xgwx(deleted), restored = parse_xgwx(filled);
  for (const doc of [after, restored]) {
    const lower = doc.ladder[0].iecFunctions.find(b => b.rowIndex === 53 && b.rawX === 4);
    assert.equal(lower.name, "MOVE");
    for (let i = 1; i < 7; i++) assert.deepEqual(doc.ladder[i], before.ladder[i]);
  }
  const next = restored.ladder[0].iecFunctions.find(b => b.rowIndex === 52 && b.rawX === 16);
  assert.deepEqual(remove(filled, 0, next.recordOffset, "MOVE"), deleted);
  assert.throws(() => insert(deleted, 0, 52, 16, "ADD", JSON.stringify(["1", "2", "%MW700"])));
});

test("IEC upper contact MOVE preserves both branch spines and its lower MOVE", async t => {
  const fixture = process.env.LIBXGWX_XGI_FIXTURE;
  if (!fixture) { t.skip("set LIBXGWX_XGI_FIXTURE"); return; }
  await init({ module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm")) });
  const { delete_xgwx_iec_ld_scalar_chain_function: remove,
    insert_xgwx_iec_ld_function: insert,
    replace_xgwx_iec_ld_scalar_chain_function: replace } = await import("../media/libxgwx.js");
  const bytes = fs.readFileSync(fixture), before = parse_xgwx(bytes);
  const block = before.ladder[0].iecFunctions.find(b => b.rowIndex === 84 && b.rawX === 16);
  assert.ok(before.ladder[0].iecScalarChainDeletionSites.some(s => s.blockOffset === block.recordOffset));
  const deleted = remove(bytes, 0, block.recordOffset, "MOVE");
  const filled = insert(deleted, 0, 84, 16, "MOVE", JSON.stringify(["0", "%MW10"]));
  assert.deepEqual(replace(bytes, 0, block.recordOffset, "MOVE", "MOVE", JSON.stringify(["0", "%MW10"])), filled);
  const after = parse_xgwx(deleted), restored = parse_xgwx(filled);
  for (const doc of [after, restored]) {
    const lower = doc.ladder[0].iecFunctions.find(b => b.rowIndex === 87 && b.rawX === 16);
    assert.equal(lower.name, "MOVE");
    for (let i = 1; i < 7; i++) assert.deepEqual(doc.ladder[i], before.ladder[i]);
  }
  const next = restored.ladder[0].iecFunctions.find(b => b.rowIndex === 84 && b.rawX === 16);
  assert.deepEqual(remove(filled, 0, next.recordOffset, "MOVE"), deleted);
  assert.throws(() => insert(deleted, 0, 84, 16, "ADD", JSON.stringify(["1", "2", "%MW10"])));
});

test("IEC comparison deletion and refill retain the terminal result coil", async t => {
  const fixture = process.env.LIBXGWX_XGI_FIXTURE;
  if (!fixture) { t.skip("set LIBXGWX_XGI_FIXTURE"); return; }
  await init({ module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm")) });
  const { delete_xgwx_iec_ld_scalar_chain_function: remove,
    insert_xgwx_iec_ld_function: insert,
    replace_xgwx_iec_ld_scalar_chain_function: replace } = await import("../media/libxgwx.js");
  const bytes = fs.readFileSync(fixture), before = parse_xgwx(bytes);
  const block = before.ladder[2].iecFunctions.find(b => b.rowIndex === 5 && b.rawX === 7);
  assert.ok(before.ladder[2].iecScalarChainDeletionSites.some(s => s.blockOffset === block.recordOffset));
  const deleted = remove(bytes, 2, block.recordOffset, "EQ"), after = parse_xgwx(deleted);
  assert.ok(after.ladder[2].iecWiredComparisonInsertionSites.some(s => s.rowIndex === 5 && s.rawX === 7));
  const operands = JSON.stringify(["변환", "8718"]);
  const filled = insert(deleted, 2, 5, 7, "EQ", operands);
  assert.deepEqual(replace(bytes, 2, block.recordOffset, "EQ", "EQ", operands), filled);
  const alternate = insert(deleted, 2, 5, 7, "GT", operands);
  for (const doc of [after, parse_xgwx(filled), parse_xgwx(alternate)]) {
    for (let i = 0; i < 7; i++) if (i !== 2) assert.deepEqual(doc.ladder[i], before.ladder[i]);
  }
  const next = parse_xgwx(filled).ladder[2].iecFunctions.find(b => b.rowIndex === 5 && b.rawX === 7);
  assert.deepEqual(remove(filled, 2, next.recordOffset, "EQ"), deleted);
  assert.throws(() => insert(deleted, 2, 5, 7, "MOVE", JSON.stringify(["0", "%MW0"])));
});


test("IEC contact mesh MOVE retains all six branch rows", async t => {
  const fixture = process.env.LIBXGWX_XGI_FIXTURE;
  if (!fixture) { t.skip("set LIBXGWX_XGI_FIXTURE"); return; }
  await init({ module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm")) });
  const { delete_xgwx_iec_ld_scalar_chain_function: remove,
    insert_xgwx_iec_ld_function: insert,
    replace_xgwx_iec_ld_scalar_chain_function: replace } = await import("../media/libxgwx.js");
  const bytes = fs.readFileSync(fixture), before = parse_xgwx(bytes);
  const block = before.ladder[6].iecFunctions.find(b => b.rowIndex === 80 && b.rawX === 19);
  assert.ok(before.ladder[6].iecScalarChainDeletionSites.some(s => s.blockOffset === block.recordOffset));
  const deleted = remove(bytes, 6, block.recordOffset, "MOVE");
  const filled = insert(deleted, 6, 80, 19, "MOVE", JSON.stringify(["0", "%MW129"]));
  assert.deepEqual(replace(bytes, 6, block.recordOffset, "MOVE", "MOVE", JSON.stringify(["0", "%MW129"])), filled);
  const after = parse_xgwx(deleted), restored = parse_xgwx(filled);
  for (const doc of [after, restored]) {
    assert.equal(doc.ladder[6].iecRows.filter(r => r.rowIndex >= 80 && r.rowIndex <= 85).length, 6);
    for (let i = 0; i < 6; i++) assert.deepEqual(doc.ladder[i], before.ladder[i]);
  }
  const next = restored.ladder[6].iecFunctions.find(b => b.rowIndex === 80 && b.rawX === 19);
  assert.deepEqual(remove(filled, 6, next.recordOffset, "MOVE"), deleted);
  assert.throws(() => insert(deleted, 6, 80, 19, "ADD", JSON.stringify(["1", "2", "%MW129"])));
});

test("IEC heating mesh leading contact Delete and refill retain MOVE and branches", async t => {
  const fixture = process.env.LIBXGWX_XGI_FIXTURE;
  if (!fixture) { t.skip("set LIBXGWX_XGI_FIXTURE"); return; }
  await init({ module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm")) });
  const bytes = fs.readFileSync(fixture), before = parse_xgwx(bytes);
  const site = before.ladder[6].iecNoContactDeletionSites.find(s => s.rowIndex === 80 && s.rawX === 1);
  assert.ok(site);
  const deleted = delete_xgwx_iec_ld_contact(bytes, 6, site.contactOffset, 1, "NO", "%MX729");
  const after = parse_xgwx(deleted);
  assert.ok(after.ladder[6].iecLeadingContactInsertionSites.some(s => s.rowIndex === 80));
  assert.equal(after.ladder[6].iecRows.filter(r => r.rowIndex >= 80 && r.rowIndex <= 85).length, 6);
  const branches = p => p.iecCircuitGraph.edges.filter(e => e.kind === "verticalBranch")
    .map(e => ({start: e.start, end: e.end}));
  assert.ok(branches(before.ladder[6]).length > 0);
  assert.deepEqual(branches(after.ladder[6]), branches(before.ladder[6]));
  assert.deepEqual(after.ladder.slice(0, 6), before.ladder.slice(0, 6));
  const filled = insert_xgwx_iec_ld_single_element(deleted, 6, 80, 1, "contact", "NO", "%MX729");
  const restored = parse_xgwx(filled);
  const next = restored.ladder[6].iecNoContactDeletionSites.find(s => s.rowIndex === 80 && s.rawX === 1);
  assert.deepEqual(delete_xgwx_iec_ld_contact(filled, 6, next.contactOffset, 1, "NO", "%MX729"), deleted);
  assert.throws(() => insert_xgwx_iec_ld_single_element(deleted, 6, 80, 1, "contact", "NO", "%MW129"));
  assert.throws(() => delete_xgwx_iec_ld_contact(bytes, 6, site.contactOffset, 1, "NO", "%MX730"));
});

test("IEC interior contacts refill between branch endpoints and preserve original records", async t => {
  const fixture = process.env.LIBXGWX_XGI_FIXTURE;
  if (!fixture) { t.skip("set LIBXGWX_XGI_FIXTURE"); return; }
  await init({ module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm")) });
  const bytes = fs.readFileSync(fixture), before = parse_xgwx(bytes);
  for (const [p,row,x,kind,operand] of [[6,80,7,"NC","%MX726"],[6,81,7,"NC","%MX727"],
    [6,85,1,"NO","%MX734"],[0,3,1,"NO","시작"],[1,1,1,"NO","커튼_제어"]]) {
    const site = before.ladder[p].iecNoContactDeletionSites.find(s => s.rowIndex === row && s.rawX === x);
    assert.ok(site, `published p${p} L${row} x${x}`);
    const removed = delete_xgwx_iec_ld_contact(bytes,p,site.contactOffset,x,kind,operand);
    const restored = insert_xgwx_iec_ld_single_element(removed,p,row,x,"contact",kind,operand);
    assert.deepEqual(parse_xgwx(restored).ladder,before.ladder, `exact refill p${p} L${row} x${x}`);
    assert.throws(() => delete_xgwx_iec_ld_contact(bytes,p,site.contactOffset,x,kind,"STALE"));
    assert.throws(() => insert_xgwx_iec_ld_single_element(removed,p,row,x,"contact",kind,"%MW129"));
  }
});


test("IEC system BOOL flags resolve after their last contact is deleted", async t => {
  const fixture = process.env.LIBXGWX_XGI_FIXTURE;
  if (!fixture) { t.skip("set LIBXGWX_XGI_FIXTURE"); return; }
  await init({ module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm")) });
  const bytes = fs.readFileSync(fixture), before = parse_xgwx(bytes);
  const flags = before.iecSystemVariables;
  assert.equal(flags.length,13);
  assert.equal(new Set(flags.map(f => f.name)).size,13);
  assert.ok(flags.every(f => f.dataType === "BOOL" && f.writable === false && f.description));
  assert.ok(flags.some(f => f.name === "_ON"));
  const site = before.ladder[6].iecNoContactDeletionSites.find(s => s.rowIndex === 30 && s.rawX === 4);
  assert.ok(site);
  const removed = delete_xgwx_iec_ld_contact(bytes,6,site.contactOffset,4,"NO","_ON");
  const restored = insert_xgwx_iec_ld_single_element(removed,6,30,4,"contact","NO","_ON");
  assert.deepEqual(parse_xgwx(restored).ladder,before.ladder);
  for (const operand of ["_ON_EXTRA","_UNKNOWN","%MW129"]) {
    assert.throws(() => insert_xgwx_iec_ld_single_element(removed,6,30,4,"contact","NO",operand));
  }
  assert.throws(() => insert_xgwx_iec_ld_single_element(removed,6,30,4,"coil","OUT","_ON"));
});


test("IEC addressed coil Delete and refill preserve branched and function-fed rows", async t => {
  const fixture = process.env.LIBXGWX_XGI_FIXTURE;
  if (!fixture) { t.skip("set LIBXGWX_XGI_FIXTURE"); return; }
  await init({ module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm")) });
  const bytes = fs.readFileSync(fixture), before = parse_xgwx(bytes);
  for (const [p,row,operand] of [[6,24,"%MX727"],[3,64,"%MX71"],[0,2,"시작"],
    [0,12,"조명_2"],[1,1,"커튼닫힘"],[2,6,"공동현관_엘베"]]) {
    const coil = before.ladder[p].sourceStrings.find(s => s.iecRowIndex === row && s.iecPosition?.[0] === 94 && s.value === operand);
    assert.ok(coil, `coil p${p} L${row}`);
    const removed = delete_xgwx_iec_ld_terminal_coil(bytes,p,coil.iecRecordOffset,operand);
    const restored = insert_xgwx_iec_ld_single_element(removed,p,row,94,"coil","OUTPUT",operand);
    assert.deepEqual(parse_xgwx(restored).ladder,before.ladder, `exact refill p${p} L${row}`);
    assert.throws(() => delete_xgwx_iec_ld_terminal_coil(bytes,p,coil.iecRecordOffset,"STALE"));
    assert.throws(() => insert_xgwx_iec_ld_single_element(removed,p,row,94,"coil","OUTPUT","%MW129"));
    assert.throws(() => insert_xgwx_iec_ld_single_element(removed,p,row,94,"coil","OUTPUT","_ON"));
  }
});


test("IEC disabled unresolved switch contacts refill without declaring variables", async t => {
  const fixture = process.env.LIBXGWX_XGI_FIXTURE;
  if (!fixture) { t.skip("set LIBXGWX_XGI_FIXTURE"); return; }
  await init({ module_or_path: fs.readFileSync(path.join(root, "media/libxgwx_bg.wasm")) });
  const bytes = fs.readFileSync(fixture), before = parse_xgwx(bytes);
  for (const [row,operand] of [[2,"스위치_1"],[6,"스위치_2"]]) {
    const site = before.ladder[0].iecNoContactDeletionSites.find(s => s.rowIndex === row && s.rawX === 1);
    assert.ok(site);
    const removed = delete_xgwx_iec_ld_contact(bytes,0,site.contactOffset,1,"RISING",operand);
    const restored = insert_xgwx_iec_ld_single_element(removed,0,row,1,"contact","RISING",operand);
    const after = parse_xgwx(restored);
    assert.deepEqual(after.ladder,before.ladder);
    assert.deepEqual(after.localVariables,before.localVariables);
    assert.deepEqual(after.variables,before.variables);
    for (const invalid of ["%MW129","A B","A+B","1Invalid"]) {
      assert.throws(() => insert_xgwx_iec_ld_single_element(removed,0,row,1,"contact","RISING",invalid));
    }
    assert.throws(() => insert_xgwx_iec_ld_single_element(removed,0,row,1,"coil","OUTPUT","UnresolvedDestination"));
  }
});

test("IEC contact-fed comparison chain restores its row and supports repeat Delete/refill", async t => {
  const fixture = process.env.LIBXGWX_XGI_FIXTURE;
  if (!fixture) { t.skip("set LIBXGWX_XGI_FIXTURE"); return; }
  await init({module_or_path:fs.readFileSync(path.join(root,"media/libxgwx_bg.wasm"))});
  const {delete_xgwx_iec_ld_eq_chain_head, delete_xgwx_iec_ld_scalar_chain_function, insert_xgwx_iec_ld_function} = await import("../media/libxgwx.js");
  const source = fs.readFileSync(fixture), before = parse_xgwx(source);
  const block = before.ladder[0].iecFunctions.find(b => b.rowIndex === 67 && b.rawX === 16);
  const deleted = delete_xgwx_iec_ld_eq_chain_head(source,0,block.recordOffset,"EQ");
  const args = JSON.stringify(["%MW10","0","%MX0"]);
  const restored = insert_xgwx_iec_ld_function(deleted,0,67,16,"EQ",args);
  const after = parse_xgwx(restored);
  assert.deepEqual(after.localVariables,before.localVariables);
  assert.deepEqual(after.ladder.slice(1),before.ladder.slice(1));
  assert.deepEqual(after.ladder[0].iecFunctions.map(b=>[b.rowIndex,b.rawX,b.name]),before.ladder[0].iecFunctions.map(b=>[b.rowIndex,b.rawX,b.name]));
  assert.equal(after.ladder[0].iecFunctions.length,before.ladder[0].iecFunctions.length);
  const added = after.ladder[0].iecFunctions.find(b=>b.rowIndex===67 && b.rawX===16);
  assert.ok(after.ladder[0].iecScalarChainDeletionSites.some(s=>s.blockOffset===added.recordOffset));
  const removed = delete_xgwx_iec_ld_scalar_chain_function(restored,0,added.recordOffset,"EQ");
  assert.deepEqual(insert_xgwx_iec_ld_function(removed,0,67,16,"EQ",args),restored);
  assert.throws(()=>delete_xgwx_iec_ld_scalar_chain_function(restored,0,added.recordOffset,"GT"));
  for(const output of ["%MW0","_ON"]) {
    assert.throws(()=>insert_xgwx_iec_ld_function(deleted,0,67,16,"EQ",JSON.stringify(["%MW10","0",output])));
  }
});

test("IEC heating comparison head restores both continuing feeds", async t => {
  const fixture = process.env.LIBXGWX_XGI_FIXTURE;
  if (!fixture) { t.skip("set LIBXGWX_XGI_FIXTURE"); return; }
  await init({module_or_path:fs.readFileSync(path.join(root,"media/libxgwx_bg.wasm"))});
  const {delete_xgwx_iec_ld_heating_chain_head, delete_xgwx_iec_ld_scalar_chain_function, insert_xgwx_iec_ld_function} = await import("../media/libxgwx.js");
  const source = fs.readFileSync(fixture), before = parse_xgwx(source);
  const block = before.ladder[6].iecFunctions.find(b => b.rowIndex === 46 && b.rawX === 19);
  const deleted = delete_xgwx_iec_ld_heating_chain_head(source,6,block.recordOffset,"EQ");
  const args = JSON.stringify(["%MW129","1","%MX729"]);
  const restored = insert_xgwx_iec_ld_function(deleted,6,46,19,"EQ",args);
  const after = parse_xgwx(restored);
  assert.deepEqual(after.localVariables,before.localVariables);
  assert.deepEqual(after.ladder.slice(0,6),before.ladder.slice(0,6));
  assert.deepEqual(after.ladder[6].iecFunctions.map(b=>[b.rowIndex,b.rawX,b.name]),before.ladder[6].iecFunctions.map(b=>[b.rowIndex,b.rawX,b.name]));
  const added = after.ladder[6].iecFunctions.find(b=>b.rowIndex===46 && b.rawX===19);
  assert.ok(after.ladder[6].iecScalarChainDeletionSites.some(s=>s.blockOffset===added.recordOffset));
  const removed = delete_xgwx_iec_ld_scalar_chain_function(restored,6,added.recordOffset,"EQ");
  assert.deepEqual(insert_xgwx_iec_ld_function(removed,6,46,19,"EQ",args),restored);
  assert.throws(()=>delete_xgwx_iec_ld_scalar_chain_function(restored,6,added.recordOffset,"GT"));
  for(const output of ["%MW0","_ON"]) {
    assert.throws(()=>insert_xgwx_iec_ld_function(deleted,6,46,19,"EQ",JSON.stringify(["%MW129","1",output])));
  }
});

test("IEC heating middle comparisons restore both branch continuations", async t => {
  const fixture = process.env.LIBXGWX_XGI_FIXTURE;
  if (!fixture) { t.skip("set LIBXGWX_XGI_FIXTURE"); return; }
  await init({module_or_path:fs.readFileSync(path.join(root,"media/libxgwx_bg.wasm"))});
  const {delete_xgwx_iec_ld_heating_chain_middle, delete_xgwx_iec_ld_scalar_chain_function, insert_xgwx_iec_ld_function} = await import("../media/libxgwx.js");
  const source = fs.readFileSync(fixture), before = parse_xgwx(source);
  for (const [row,value,output] of [[50,"2","%MX730"],[54,"3","%MX731"]]) {
    const block = before.ladder[6].iecFunctions.find(b=>b.rowIndex===row && b.rawX===19);
    const deleted = delete_xgwx_iec_ld_heating_chain_middle(source,6,block.recordOffset,"EQ");
    const args = JSON.stringify(["%MW129",value,output]);
    const restored = insert_xgwx_iec_ld_function(deleted,6,row,19,"EQ",args);
    const after = parse_xgwx(restored);
    assert.deepEqual(after.localVariables,before.localVariables);
    assert.deepEqual(after.ladder.slice(0,6),before.ladder.slice(0,6));
    assert.deepEqual(after.ladder[6].iecFunctions.map(b=>[b.rowIndex,b.rawX,b.name]),before.ladder[6].iecFunctions.map(b=>[b.rowIndex,b.rawX,b.name]));
    const added = after.ladder[6].iecFunctions.find(b=>b.rowIndex===row && b.rawX===19);
    assert.ok(after.ladder[6].iecScalarChainDeletionSites.some(s=>s.blockOffset===added.recordOffset));
    const removed = delete_xgwx_iec_ld_scalar_chain_function(restored,6,added.recordOffset,"EQ");
    assert.deepEqual(insert_xgwx_iec_ld_function(removed,6,row,19,"EQ",args),restored);
    assert.throws(()=>delete_xgwx_iec_ld_scalar_chain_function(restored,6,added.recordOffset,"GT"));
    for (const bad of ["%MW0","_ON"]) {
      assert.throws(()=>insert_xgwx_iec_ld_function(deleted,6,row,19,"EQ",JSON.stringify(["%MW129",value,bad])));
    }
  }
});

test("IEC heating outer comparison restores its feed and continuation", async t => {
  const fixture = process.env.LIBXGWX_XGI_FIXTURE;
  if (!fixture) { t.skip("set LIBXGWX_XGI_FIXTURE"); return; }
  await init({module_or_path:fs.readFileSync(path.join(root,"media/libxgwx_bg.wasm"))});
  const {delete_xgwx_iec_ld_heating_chain_x3_eq_repaired, delete_xgwx_iec_ld_scalar_chain_function, insert_xgwx_iec_ld_function} = await import("../media/libxgwx.js");
  const source = fs.readFileSync(fixture), before = parse_xgwx(source);
  for (const [row,value,output] of [[58,"0","%MX735"]]) {
    const block = before.ladder[6].iecFunctions.find(b=>b.rowIndex===row && b.rawX===19);
    const deleted = delete_xgwx_iec_ld_heating_chain_x3_eq_repaired(source,6,block.recordOffset,"EQ");
    const args = JSON.stringify(["%MW129",value,output]);
    const restored = insert_xgwx_iec_ld_function(deleted,6,row,19,"EQ",args);
    const after = parse_xgwx(restored);
    assert.deepEqual(after.localVariables,before.localVariables);
    assert.deepEqual(after.ladder.slice(0,6),before.ladder.slice(0,6));
    assert.deepEqual(after.ladder[6].iecFunctions.map(b=>[b.rowIndex,b.rawX,b.name]),before.ladder[6].iecFunctions.map(b=>[b.rowIndex,b.rawX,b.name]));
    const added = after.ladder[6].iecFunctions.find(b=>b.rowIndex===row && b.rawX===19);
    assert.ok(after.ladder[6].iecScalarChainDeletionSites.some(s=>s.blockOffset===added.recordOffset));
    const removed = delete_xgwx_iec_ld_scalar_chain_function(restored,6,added.recordOffset,"EQ");
    assert.deepEqual(insert_xgwx_iec_ld_function(removed,6,row,19,"EQ",args),restored);
    assert.throws(()=>delete_xgwx_iec_ld_scalar_chain_function(restored,6,added.recordOffset,"GT"));
    for (const bad of ["%MW0","_ON"]) {
      assert.throws(()=>insert_xgwx_iec_ld_function(deleted,6,row,19,"EQ",JSON.stringify(["%MW129",value,bad])));
    }
  }
});

test("IEC heating contact comparison restores its feed and continuation", async t => {
  const fixture = process.env.LIBXGWX_XGI_FIXTURE;
  if (!fixture) { t.skip("set LIBXGWX_XGI_FIXTURE"); return; }
  await init({module_or_path:fs.readFileSync(path.join(root,"media/libxgwx_bg.wasm"))});
  const {delete_xgwx_iec_ld_heating_chain_contact_eq, delete_xgwx_iec_ld_scalar_chain_function, insert_xgwx_iec_ld_function} = await import("../media/libxgwx.js");
  const source = fs.readFileSync(fixture), before = parse_xgwx(source);
  for (const [row,value,output] of [[62,"1","%MX732"]]) {
    const block = before.ladder[6].iecFunctions.find(b=>b.rowIndex===row && b.rawX===19);
    const deleted = delete_xgwx_iec_ld_heating_chain_contact_eq(source,6,block.recordOffset,"EQ");
    const args = JSON.stringify(["%MW129",value,output]);
    const restored = insert_xgwx_iec_ld_function(deleted,6,row,19,"EQ",args);
    const after = parse_xgwx(restored);
    assert.deepEqual(after.localVariables,before.localVariables);
    assert.deepEqual(after.ladder.slice(0,6),before.ladder.slice(0,6));
    assert.deepEqual(after.ladder[6].iecFunctions.map(b=>[b.rowIndex,b.rawX,b.name]),before.ladder[6].iecFunctions.map(b=>[b.rowIndex,b.rawX,b.name]));
    const added = after.ladder[6].iecFunctions.find(b=>b.rowIndex===row && b.rawX===19);
    assert.ok(after.ladder[6].iecScalarChainDeletionSites.some(s=>s.blockOffset===added.recordOffset));
    const removed = delete_xgwx_iec_ld_scalar_chain_function(restored,6,added.recordOffset,"EQ");
    assert.deepEqual(insert_xgwx_iec_ld_function(removed,6,row,19,"EQ",args),restored);
    assert.throws(()=>delete_xgwx_iec_ld_scalar_chain_function(restored,6,added.recordOffset,"GT"));
    for (const bad of ["%MW0","_ON"]) {
      assert.throws(()=>insert_xgwx_iec_ld_function(deleted,6,row,19,"EQ",JSON.stringify(["%MW129",value,bad])));
    }
  }
});

test("IEC comparison refill composes with missing contacts", async t => {
  const fixture = process.env.LIBXGWX_XGI_FIXTURE;
  if (!fixture) { t.skip("set LIBXGWX_XGI_FIXTURE"); return; }
  await init({module_or_path:fs.readFileSync(path.join(root,"media/libxgwx_bg.wasm"))});
  const {delete_xgwx_iec_ld_scalar_chain_function, insert_xgwx_iec_ld_function} = await import("../media/libxgwx.js");
  const source=fs.readFileSync(fixture), original=parse_xgwx(source);
  const target=original.ladder[6].iecFunctions.find(b=>b.rowIndex===62 && b.rawX===19);
  const base=delete_xgwx_iec_ld_heating_chain_contact_eq(source,6,target.recordOffset,"EQ");
  const args=JSON.stringify(["%MW129","1","%MX732"]);
  const canonical=insert_xgwx_iec_ld_function(base,6,62,19,"EQ",args);
  const contacts=[[1,7,"NO","%MX727"],[2,10,"NC","%MX726"],[4,13,"NC","타이머3.Q"]];
  for(let mask=1;mask<=7;mask++) {
    let bytes=base;
    for(const [bit,x,kind,value] of contacts) {
      if(!(mask&bit)) continue;
      const site=parse_xgwx(bytes).ladder[6].iecNoContactDeletionSites.find(s=>s.rowIndex===62 && s.rawX===x);
      assert.ok(site,`contact site mask ${mask} x${x}`);
      bytes=delete_xgwx_iec_ld_contact(bytes,6,site.contactOffset,x,kind,value);
    }
    const filled=insert_xgwx_iec_ld_function(bytes,6,62,19,"EQ",args);
    const view=parse_xgwx(filled), block=view.ladder[6].iecFunctions.find(b=>b.rowIndex===62 && b.rawX===19);
    assert.ok(view.ladder[6].iecScalarChainDeletionSites.some(s=>s.blockOffset===block.recordOffset),`Delete site mask ${mask}`);
    const removed=delete_xgwx_iec_ld_scalar_chain_function(filled,6,block.recordOffset,"EQ");
    bytes=insert_xgwx_iec_ld_function(removed,6,62,19,"EQ",args);
    assert.deepEqual(bytes,filled,`repeat mask ${mask}`);
    for(const [bit,x,kind,value] of contacts) {
      if(mask&bit) bytes=insert_xgwx_iec_ld_single_element(bytes,6,62,x,"contact",kind,value);
    }
    assert.deepEqual(bytes,canonical,`completed mask ${mask}`);
    assert.deepEqual(parse_xgwx(bytes).localVariables,original.localVariables);
  }
});

test("IEC heating comparisons remain editable after row and group shifts", async t => {
  const fixture = process.env.LIBXGWX_XGI_FIXTURE;
  if (!fixture) { t.skip("set LIBXGWX_XGI_FIXTURE"); return; }
  await init({module_or_path:fs.readFileSync(path.join(root,"media/libxgwx_bg.wasm"))});
  const api = await import("../media/libxgwx.js");
  const source = fs.readFileSync(fixture);
  const cases = [[46,api.delete_xgwx_iec_ld_heating_chain_head,"1","%MX729"],
    [50,api.delete_xgwx_iec_ld_heating_chain_middle,"2","%MX730"],
    [54,api.delete_xgwx_iec_ld_heating_chain_middle,"3","%MX731"],
    [58,api.delete_xgwx_iec_ld_heating_chain_x3_eq_repaired,"0","%MX735"],
    [62,api.delete_xgwx_iec_ld_heating_chain_contact_eq,"1","%MX732"]];
  for (const comment of [false,true]) {
    let shifted = api.insert_xgwx_iec_ld_blank_row(source,6,45);
    if (comment) shifted = api.insert_xgwx_iec_ld_comment(shifted,6,46,"shift audit");
    const before = parse_xgwx(shifted);
    for (const [row,remove,value,output] of cases) {
      const block = before.ladder[6].iecFunctions.find(b=>b.rowIndex===row+1 && b.rawX===19);
      assert.ok(block);
      assert.throws(()=>remove(shifted,6,block.recordOffset,"NE"));
      const deleted = remove(shifted,6,block.recordOffset,"EQ");
      const oldBlock = parse_xgwx(source).ladder[6].iecFunctions.find(b=>b.rowIndex===row && b.rawX===19);
      let expected = api.insert_xgwx_iec_ld_blank_row(remove(source,6,oldBlock.recordOffset,"EQ"),6,45);
      if (comment) expected = api.insert_xgwx_iec_ld_comment(expected,6,46,"shift audit");
      assert.deepEqual(deleted,expected,`shift/delete commute L${row}, comment=${comment}`);
      const args = JSON.stringify(["%MW129",value,output]);
      const restored = api.insert_xgwx_iec_ld_function(deleted,6,row+1,19,"EQ",args);
      const after = parse_xgwx(restored);
      assert.deepEqual(after.localVariables,before.localVariables);
      assert.deepEqual(after.ladder.slice(0,6),before.ladder.slice(0,6));
      const added = after.ladder[6].iecFunctions.find(b=>b.rowIndex===row+1 && b.rawX===19);
      const again = api.delete_xgwx_iec_ld_scalar_chain_function(restored,6,added.recordOffset,"EQ");
      assert.deepEqual(api.insert_xgwx_iec_ld_function(again,6,row+1,19,"EQ",args),restored);
    }
  }
});

test("IEC contact kind edits compose with comparison deletion and refill", async t => {
  const fixture=process.env.LIBXGWX_XGI_FIXTURE;
  if(!fixture){t.skip("set LIBXGWX_XGI_FIXTURE");return;}
  await init({module_or_path:fs.readFileSync(path.join(root,"media/libxgwx_bg.wasm"))});
  const api=await import("../media/libxgwx.js"), source=fs.readFileSync(fixture);
  const capture=process.env.LIBXGWX_CONTACT_KIND_CAPTURE;
  const contact=(bytes,row,x)=>{
    const body=parse_xgwx(bytes).ladder[6];
    return body.sourceStrings.find(e=>e.iecRowIndex===row && e.iecPosition?.[0]===x && e.iecRecordKind==='Contact');
  };
  const block=(bytes,row)=>parse_xgwx(bytes).ladder[6].iecFunctions.find(b=>b.rowIndex===row && b.rawX===19);
  const args=JSON.stringify(["%MW129","1","%MX732"]);
  for(const shifted of [false,true]) {
    const delta=Number(shifted);
    const base=shifted?api.insert_xgwx_iec_ld_blank_row(source,6,45):source;
    const deletedBase=api.delete_xgwx_iec_ld_heating_chain_contact_eq(base,6,block(base,62+delta).recordOffset,"EQ");
    for(const [row,x,oldKind,retained] of [[62,7,'NO',true],[62,10,'NC',true],[62,13,'NC',true],[63,7,'NO',false]]) {
      for(const [index,kind] of ['NO','NC','RISING','FALLING','NEGATED_RISING','NEGATED_FALLING'].entries()) {
        const element=contact(base,row+delta,x);
        assert.ok(element,`contact L${row+delta} x${x}`);
        const changed=api.update_xgwx_iec_ld_contact_kind(base,6,element.offset,oldKind,kind);
        assert.throws(()=>api.delete_xgwx_iec_ld_heating_chain_contact_eq(changed,6,block(changed,62+delta).recordOffset,'NE'));
        const deleted=api.delete_xgwx_iec_ld_heating_chain_contact_eq(changed,6,block(changed,62+delta).recordOffset,'EQ');
        const expected=retained?api.update_xgwx_iec_ld_contact_kind(deletedBase,6,contact(deletedBase,row+delta,x).offset,oldKind,kind):deletedBase;
        assert.deepEqual(deleted,expected,`kind/delete commute L${row}, x${x}, ${kind}, shifted=${shifted}`);
        const filled=api.insert_xgwx_iec_ld_function(deleted,6,62+delta,19,'EQ',args);
        const again=api.delete_xgwx_iec_ld_scalar_chain_function(filled,6,block(filled,62+delta).recordOffset,'EQ');
        assert.deepEqual(api.insert_xgwx_iec_ld_function(again,6,62+delta,19,'EQ',args),filled);
        assert.deepEqual(parse_xgwx(filled).localVariables,parse_xgwx(base).localVariables);
        if(capture && !shifted && row===62 && x===10) {
          for(const [state,bytes] of [['C',changed],['D',deleted],['R',filled]]) {
            assert.deepEqual(Buffer.from(bytes),fs.readFileSync(path.join(capture,`K${index+6}${state}.xgwx`)));
          }
        }
      }
    }
  }
});

test("IEC contact-first deletion composes with comparison deletion and refill", async t => {
  const fixture=process.env.LIBXGWX_XGI_FIXTURE;
  if(!fixture){t.skip("set LIBXGWX_XGI_FIXTURE");return;}
  await init({module_or_path:fs.readFileSync(path.join(root,"media/libxgwx_bg.wasm"))});
  const api=await import("../media/libxgwx.js"), source=fs.readFileSync(fixture);
  const capture=process.env.LIBXGWX_CONTACT_FIRST_CAPTURE;
  const contact=(bytes,row,x)=>parse_xgwx(bytes).ladder[6].sourceStrings.find(e=>e.iecRowIndex===row && e.iecPosition?.[0]===x && e.iecRecordKind==='Contact');
  const block=(bytes,row)=>parse_xgwx(bytes).ladder[6].iecFunctions.find(b=>b.rowIndex===row && b.rawX===19);
  const removeContact=(bytes,row,x,kind)=>{
    const element=contact(bytes,row,x);
    assert.ok(element,`contact L${row} x${x}`);
    return api.delete_xgwx_iec_ld_contact(bytes,6,element.iecRecordOffset,x,kind,element.value);
  };
  const args=JSON.stringify(["%MW129","1","%MX732"]);
  for(const shifted of [false,true]) {
    const row=62+Number(shifted);
    const base=shifted?api.insert_xgwx_iec_ld_blank_row(source,6,45):source;
    const before=parse_xgwx(base);
    const deletedBase=api.delete_xgwx_iec_ld_heating_chain_contact_eq(base,6,block(base,row).recordOffset,"EQ");
    const canonical=api.insert_xgwx_iec_ld_function(deletedBase,6,row,19,"EQ",args);
    const sites=[[row,7,"NO"],[row,10,"NC"],[row,13,"NC"],[row+1,7,"NO"]];
    for(let mask=1;mask<16;mask++) {
      const compare=(state,bytes)=>{
        if(capture && !shifted) assert.deepEqual(Buffer.from(bytes),fs.readFileSync(path.join(capture,`A${mask}${state}.xgwx`)),`Rust ${state} mask ${mask}`);
      };
      let bytes=base, expected=deletedBase;
      for(const [index,[r,x,kind]] of sites.entries()) {
        if(!(mask&(1<<index))) continue;
        bytes=removeContact(bytes,r,x,kind);
        if(index<3) expected=removeContact(expected,r,x,kind);
      }
      compare("C",bytes);
      assert.throws(()=>api.delete_xgwx_iec_ld_heating_chain_contact_eq(bytes,6,block(bytes,row).recordOffset,"NE"));
      bytes=api.delete_xgwx_iec_ld_heating_chain_contact_eq(bytes,6,block(bytes,row).recordOffset,"EQ");
      if((mask&7)!==7) assert.deepEqual(bytes,expected,`contact/delete commute mask ${mask}, shifted=${shifted}`);
      compare("D",bytes);
      bytes=api.insert_xgwx_iec_ld_function(bytes,6,row,19,"EQ",args);
      compare("R",bytes);
      assert.deepEqual(bytes,api.insert_xgwx_iec_ld_function(expected,6,row,19,"EQ",args),`refill cleanup mask ${mask}`);
      const filled=bytes;
      bytes=api.delete_xgwx_iec_ld_scalar_chain_function(bytes,6,block(bytes,row).recordOffset,"EQ");
      bytes=api.insert_xgwx_iec_ld_function(bytes,6,row,19,"EQ",args);
      assert.deepEqual(bytes,filled,`repeat mask ${mask}, shifted=${shifted}`);
      for(const [index,[r,x,kind]] of sites.slice(0,3).entries()) {
        if(mask&(1<<index)) bytes=api.insert_xgwx_iec_ld_single_element(bytes,6,r,x,"contact",kind,contact(base,r,x).value);
      }
      compare("F",bytes);
      assert.deepEqual(bytes,canonical,`completed mask ${mask}, shifted=${shifted}`);
      const after=parse_xgwx(bytes);
      assert.deepEqual(after.localVariables,before.localVariables);
      assert.deepEqual(after.ladder.slice(0,6),before.ladder.slice(0,6));
    }
  }
});

test("IEC refills native contact-first Delete Line captures", async t => {
  const capture=process.env.LIBXGWX_CONTACT_FIRST_CAPTURE;
  const fixture=process.env.LIBXGWX_XGI_FIXTURE;
  if(!capture || !fixture){t.skip("set native contact-first capture and source fixture");return;}
  await init({module_or_path:fs.readFileSync(path.join(root,"media/libxgwx_bg.wasm"))});
  const api=await import("../media/libxgwx.js"), source=fs.readFileSync(fixture);
  const contact=x=>parse_xgwx(source).ladder[6].sourceStrings.find(e=>e.iecRowIndex===62 && e.iecPosition?.[0]===x && e.iecRecordKind==='Contact');
  const args=JSON.stringify(["%MW129","1","%MX732"]);
  for(const mask of [1,8,7]) {
    const original=fs.readFileSync(path.join(capture,`A${mask}NS.xgwx`));
    const before=parse_xgwx(original);
    let bytes=api.insert_xgwx_iec_ld_function(original,6,62,19,"EQ",args);
    assert.deepEqual(Buffer.from(bytes),fs.readFileSync(path.join(capture,`N${mask}R.xgwx`)),`native Rust refill mask ${mask}`);
    const filled=bytes;
    const block=parse_xgwx(bytes).ladder[6].iecFunctions.find(b=>b.rowIndex===62 && b.rawX===19);
    bytes=api.delete_xgwx_iec_ld_scalar_chain_function(bytes,6,block.recordOffset,"EQ");
    bytes=api.insert_xgwx_iec_ld_function(bytes,6,62,19,"EQ",args);
    assert.deepEqual(bytes,filled,`native repeat mask ${mask}`);
    for(const [index,x] of [7,10,13].entries()) {
      if(mask&(1<<index)) bytes=api.insert_xgwx_iec_ld_single_element(bytes,6,62,x,"contact",x===7?"NO":"NC",contact(x).value);
    }
    assert.deepEqual(Buffer.from(bytes),fs.readFileSync(path.join(capture,`N${mask}F.xgwx`)),`native Rust completion mask ${mask}`);
    assert.deepEqual(parse_xgwx(bytes).localVariables,before.localVariables);
  }
});

test("XGK quoted string operands preserve embedded spaces and commas through edits", async () => {
  await init({module_or_path:fs.readFileSync(path.join(root,"media/libxgwx_bg.wasm"))});
  const source=fs.readFileSync(path.join(libraryRoot,"fixtures/elements.xgwx"));
  const operands=["'Room A, on (night)'","D100"];
  const inserted=insert_xgwx_ladder_instruction(source,0,52,"$MOV",JSON.stringify(operands));
  const cell=parse_xgwx(inserted).ladder[0].cells.find(c=>c.rawY===52&&c.value==="$MOV");
  assert.deepEqual(cell.operands,operands);
  const edited=update_xgwx_ladder_cell(inserted,0,cell.offset,cell.sourceText,"$MOV,'Room B, off',D104");
  const changed=parse_xgwx(edited).ladder[0].cells.find(c=>c.rawY===52&&c.value==="$MOV");
  assert.deepEqual(changed.operands,["'Room B, off'","D104"]);
  const restored=update_xgwx_ladder_cell(edited,0,changed.offset,changed.sourceText,cell.sourceText);
  assert.deepEqual(restored,inserted);
  const removed=delete_xgwx_ladder_instruction(inserted,0,cell.offset,cell.sourceText);
  assert.deepEqual(insert_xgwx_ladder_instruction(removed,0,52,"$MOV",JSON.stringify(operands)),inserted);
  assert.throws(()=>insert_xgwx_ladder_instruction(source,0,52,"MOV",JSON.stringify(operands)),/string constant/);
  assert.throws(()=>insert_xgwx_ladder_instruction(source,0,52,"$MOV",JSON.stringify(["D100","'bad'"])),/string constant/);
});

test("XGK instruction choices and writes honor reviewed CPU model restrictions", async () => {
  await init({module_or_path:fs.readFileSync(path.join(root,"media/libxgwx_bg.wasm"))});
  const source=fs.readFileSync(path.join(libraryRoot,"fixtures/elements.xgwx"));
  for (const [model, supported] of [["XGK-CPUH",false],["XGK-CPUHN",true],["XGK-CPUSN",true],["XGK-CPUUN",true]]) {
    const bytes=select_xgwx_cpu(source,model);
    const choices=parse_xgwx(bytes).ladder[0].instructionChoices.map(c=>c.mnemonic);
    assert.equal(choices.includes("INLATCH"),supported,model);
    assert.equal(choices.includes("GETIP"),supported,model);
    assert.ok(choices.includes("MOV"),model);
    assert.equal(choices.includes("GETCOMM"),false,model);
    if (!supported) {
      assert.throws(()=>insert_xgwx_ladder_instruction(bytes,0,52,"INLATCH",JSON.stringify(["0","D100"])),/selected XGK CPU/);
      const inserted=insert_xgwx_ladder_instruction(bytes,0,52,"MOV",JSON.stringify(["0","D100"]));
      const cell=parse_xgwx(inserted).ladder[0].cells.find(c=>c.rawY===52&&c.value==="MOV");
      assert.throws(()=>update_xgwx_ladder_cell(inserted,0,cell.offset,cell.sourceText,"INLATCH,0,D100"),/selected XGK CPU/);
    } else {
      const inserted=insert_xgwx_ladder_instruction(bytes,0,52,"INLATCH",JSON.stringify(["0","D100"]));
      assert.ok(parse_xgwx(inserted).ladder[0].cells.some(c=>c.value==="INLATCH"));
      const older=select_xgwx_cpu(inserted,"XGK-CPUH");
      const summary=parse_xgwx(older).ladder[0];
      assert.equal(summary.instructionChoices.some(c=>c.mnemonic==="INLATCH"),false);
      assert.ok(summary.retainedInstructionChoices.some(c=>c.mnemonic==="INLATCH"));
      const cell=summary.cells.find(c=>c.rawY===52&&c.value==="INLATCH");
      const repaired=update_xgwx_ladder_cell(older,0,cell.offset,cell.sourceText,"INLATCH,0,D200");
      assert.deepEqual(parse_xgwx(repaired).ladder[0].cells.find(c=>c.value==="INLATCH").operands,["0","D200"]);
    }
  }
});

test("XGK output commands from interior branch cursors preserve the branch and existing output", async () => {
  await init({module_or_path:fs.readFileSync(path.join(root,"media/libxgwx_bg.wasm"))});
  const {xgkBlankCommands,xgkInsertionColumn}=await import('../media/ladder-commands.js');
  const source=fs.readFileSync(path.join(libraryRoot,"fixtures/elements.xgwx"));
  const before=parse_xgwx(source).ladder[0];
  for (const [rawY,column,mnemonic,operands] of [[12,2,'OUT',['M00030']],[16,5,'SET',['M00031']],[12,8,'MOV',['1','D100']]]) {
    const position={rawY,column};const choice=xgkBlankCommands(before,position).find(c=>c.mnemonic===mnemonic);
    const bytes=choice.category==='function'
      ?insert_xgwx_ladder_instruction(source,0,rawY,mnemonic,JSON.stringify(operands))
      :edit_xgwx_ladder_cell(source,0,{rawY,column:xgkInsertionColumn(choice,position),expected:null,replacement:{kind:choice.kind,operand:operands[0]}});
    const after=parse_xgwx(bytes).ladder[0];
    assert.deepEqual(after.branchConnections,before.branchConnections);
    assert.deepEqual(after.cells.find(c=>c.rawY===8&&c.coil),before.cells.find(c=>c.rawY===8&&c.coil));
    assert.ok(after.cells.some(c=>c.rawY===rawY&&(c.value===operands[0]&&c.coil||c.value===mnemonic)),mnemonic);
    assert.ok(after.horizontalLines.some(line=>line.rawY===rawY&&line.rawXEnd>=85),mnemonic);
  }
});
