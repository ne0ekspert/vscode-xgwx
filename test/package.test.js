const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));

test("declares GPLv3-or-later while retaining the bundled library license", () => {
  assert.equal(manifest.license, "GPL-3.0-or-later");
  assert.equal(manifest.repository.url, "https://github.com/ne0ekspert/vscode-xgwx.git");

  const projectLicense = fs.readFileSync(path.join(root, "LICENSE"), "utf8");
  const apacheLicense = fs.readFileSync(path.join(root, "LICENSES", "Apache-2.0.txt"), "utf8");
  const thirdPartyNotices = fs.readFileSync(path.join(root, "THIRD_PARTY_NOTICES.md"), "utf8");

  assert.match(projectLicense, /GNU GENERAL PUBLIC LICENSE/);
  assert.match(projectLicense, /Version 3, 29 June 2007/);
  assert.match(apacheLicense, /Apache License/);
  assert.match(apacheLicense, /Version 2\.0, January 2004/);
  assert.match(thirdPartyNotices, /libxgwx/);
  assert.match(thirdPartyNotices, /https:\/\/github\.com\/ne0ekspert\/libxgwx\/tree\/[0-9a-f]{40}/);
});

test("registers a default editable XGWX custom editor", () => {
  const editor = manifest.contributes.customEditors[0];
  assert.equal(editor.viewType, "xgwx.workspaceViewer");
  assert.equal(editor.priority, "default");
  assert.deepEqual(editor.selector, [{ filenamePattern: "*.xgwx" }]);
  assert.equal(manifest.capabilities.untrustedWorkspaces.supported, true);
  assert.ok(manifest.activationEvents.includes("onStartupFinished"));
});

test("ships the parser assets used by the webview", () => {
  for (const asset of ["media/libxgwx.js", "media/libxgwx_bg.wasm", "media/hardware-slots.js", "media/ladder-elements.js", "media/ladder-selection.js", "media/ladder-clipboard.js", "media/module-option-groups.js", "media/iec-layout-positions.js", "media/variable-edit.js", "media/main.js", "media/main.css", "media/sfc.js", "media/sfc-actions.js", "media/sfc-declarations.js", "media/sfc-clipboard.js", "media/st-diagnostics.js", "media/sfc-limits.js"]) {
    const stat = fs.statSync(path.join(root, asset));
    assert.ok(stat.size > 0, `${asset} should not be empty`);
  }
});

test("optimizes the production WASM bundle when wasm-opt is available", () => {
  const buildScript = fs.readFileSync(path.join(root, "scripts/build-wasm.sh"), "utf8");
  assert.match(buildScript, /wasm_opt/);
  assert.match(buildScript, /-Oz/);
  assert.match(buildScript, /wasm_bindgen/);
  assert.match(buildScript, /wasm32-unknown-unknown/);
});

test("uses editable custom-document save support", () => {
  const commands = manifest.contributes.commands.map((command) => command.command);
  assert.deepEqual(commands, ["xgwx.refreshViewer", "xgwx.newFile"]);
  const extension = fs.readFileSync(path.join(root, "extension.js"), "utf8");
  for (const method of ["saveCustomDocument", "saveCustomDocumentAs", "revertCustomDocument", "backupCustomDocument"]) {
    assert.match(extension, new RegExp(`\\b${method}\\b`));
  }
});

test("uses editor workbench structure without decorative gradients", () => {
  const script = fs.readFileSync(path.join(root, "media/main.js"), "utf8");
  const styles = fs.readFileSync(path.join(root, "media/main.css"), "utf8");

  for (const className of ["editor-shell", "explorer-pane", "editor-pane", "inspector-pane", "status-bar"]) {
    assert.match(script, new RegExp(className));
  }
  assert.doesNotMatch(styles, /(?:linear|radial|conic)-gradient/);
  assert.doesNotMatch(script, /metric-card|rack-card/);
});

test("renders decoded LD programs in a ten-column ladder canvas", () => {
  const script = fs.readFileSync(path.join(root, "media/main.js"), "utf8");
  const styles = fs.readFileSync(path.join(root, "media/main.css"), "utf8");

  assert.match(script, /const LD_COLUMN_COUNT = 10;/);
  assert.match(script, /function renderLadderDiagram\b/);
  assert.match(script, /moveLadderCursor/);
  assert.match(script, /ladderSelectionKeys/);
  assert.match(script, /edit_xgwx_ladder_cell/);
  assert.match(script, /event\.shiftKey/);
  assert.match(script, /event\.key === "Delete"/);
  assert.match(script, /Copy/);
  assert.match(script, /Cut/);
  assert.match(script, /Paste/);
  assert.match(script, /Delete rung comment/);
  assert.match(script, /event\.key === "Backspace"/);
  assert.match(script, /data-ladder-comment-key/);
  assert.match(script, /ladderSelectionKeys\(rowValues, selectedLadderAnchor, selectedLadderFocus\)\.has\(key\)/);
  assert.doesNotMatch(script, /Decoded cells/);
  assert.match(script, /ladder\.horizontalLines/);
  assert.match(script, /ladder\.verticalLines/);
  assert.match(script, /function ldWireStartX\b/);
  assert.match(script, /function ldWireEndX\b/);
  assert.match(script, /Blank cell, rung/);
  assert.match(styles, /\.ld-board\b/);
  assert.match(styles, /\.ld-blank-cell\b/);
  assert.match(styles, /\.ld-cell\b/);
  assert.match(styles, /\.ld-cell\.instruction\.selected/);
  assert.match(styles, /\.ld-glyph[^}]+background: var\(--vscode-editor-background, Canvas\)/s);
  assert.match(styles, /\.ld-value[^}]+background: transparent/s);
  assert.doesNotMatch(styles, /\.ld-cell:not\(\.instruction\) \.ld-glyph::before/);
  assert.doesNotMatch(script, /─\|/);
});

test("provides catalog-backed module selection in base hardware inspectors", () => {
  const script = fs.readFileSync(path.join(root, "media/main.js"), "utf8");
  const styles = fs.readFileSync(path.join(root, "media/main.css"), "utf8");

  assert.match(script, /xgk_module_catalog/);
  assert.match(script, /select_xgwx_module/);
  assert.match(script, /insert_xgwx_module/);
  assert.match(script, /delete_xgwx_module/);
  assert.match(script, /set_xgwx_module_option/);
  assert.match(script, /xgwx_module_option_values/);
  assert.match(script, /Apply module selection/);
  assert.match(script, /Apply module options/);
  assert.match(script, /entry\.visibleOptions/);
  assert.match(script, /groupModuleOptions/);
  assert.match(script, /module-option-channel-group/);
  assert.match(script, /option\.scope === "fileData"/);
  assert.match(script, /formatModuleOptionDefault/);
  assert.match(script, /All captured options are shown/);
  assert.match(script, /module-option-readonly/);
  assert.match(script, /function moduleSlotRange/);
  assert.match(script, /"Slot width"/);
  assert.doesNotMatch(script, /entry\.name === module\.name/);
  assert.match(script, /Base, slot, and comment are preserved/);
  assert.match(script, /event\.key === "ArrowUp"/);
  assert.match(script, /event\.key === "ArrowDown"/);
  assert.match(script, /event\.key === "Delete"/);
  assert.match(script, /selectedSlotKey/);
  assert.match(script, /data-module-key/);
  assert.match(script, /hardwareSlotRows/);
  assert.match(script, /"Empty slot"/);
  assert.match(script, /Adds the selected module/);
  assert.match(script, /module-slot-\$\{slotRow\.kind\}/);
  assert.match(styles, /\.module-slot-empty/);
  assert.match(styles, /\.module-picker\b/);
  assert.match(styles, /\.module-options\b/);
  assert.match(styles, /\.module-option-channel-group/);
  assert.match(styles, /data-view="hardware"/);
  assert.doesNotMatch(script, /treeItem\(`Modules \(\$\{modules\.length\}\)`/);
  assert.match(script, /let activeView = "overview";/);
});

test("shows configured network modules in the explorer", () => {
  const script = fs.readFileSync(path.join(root, "media/main.js"), "utf8");
  const styles = fs.readFileSync(path.join(root, "media/main.css"), "utf8");

  assert.match(script, /function buildNetworkGroup\b/);
  assert.match(script, /network\.modules \|\| \[\]/);
  assert.match(script, /function networkModuleLabel\b/);
  assert.match(script, /function renderNetworkInspector\b/);
  assert.match(script, /appendNetworkConfigurationFields/);
  assert.match(script, /Network device settings/);
  assert.match(script, /catalogEntry\?\.visibleOptions/);
  assert.match(script, /formatNetworkAttributeLabel/);
  assert.match(script, /summary\.xgpd/);
  assert.match(script, /findNetworkConfiguration/);
  assert.match(script, /IP address/);
  assert.match(script, /update_xgwx_network_module/);
  assert.match(script, /Apply network properties/);
  assert.match(styles, /\.network-module-row\b/);
});
