import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import init, { parse_xgwx } from "../media/libxgwx.js";
import { iecGapOffsets } from "../media/iec-layout-positions.js";

test("IEC layout closes the visual width of a deleted wire for downstream elements", async (context) => {
  const originalPath = "/home/ne0ekspert/Downloads/smarthome_project_0225.xgwx";
  const deletedPath = "/home/ne0ekspert/VMs/xg5000-win10/captures/smarthome-iec-wire-delete/generated_l52_deleted.xgwx";
  if (!fs.existsSync(originalPath) || !fs.existsSync(deletedPath)) {
    context.skip("native IEC wire-deletion fixture is unavailable");
    return;
  }
  await init({ module_or_path: fs.readFileSync(new URL("../media/libxgwx_bg.wasm", import.meta.url)) });
  const original = parse_xgwx(fs.readFileSync(originalPath)).ladder[0];
  const deleted = parse_xgwx(fs.readFileSync(deletedPath)).ladder[0];
  const before = iecGapOffsets(original);
  const after = iecGapOffsets(deleted);

  assert.equal(before(52, 16), 0);
  assert.equal(after(52, 1), 0); // Leading contact stays put.
  assert.equal(after(52, 10), 3); // Next gray wire closes the deleted x7..x10 cell.
  assert.equal(after(52, 16), 3); // MOVE and its pins move by the same 72 px.
  assert.equal(after(53, 4), 0); // Other rows retain their stored positions.
});
