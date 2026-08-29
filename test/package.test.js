const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));

test("registers a default editable XGWX custom editor", () => {
  const editor = manifest.contributes.customEditors[0];
  assert.equal(editor.viewType, "xgwx.workspaceViewer");
  assert.equal(editor.priority, "default");
  assert.deepEqual(editor.selector, [{ filenamePattern: "*.xgwx" }]);
});

test("ships the parser assets used by the webview", () => {
  for (const asset of ["media/libxgwx.js", "media/libxgwx_bg.wasm", "media/main.js", "media/main.css"]) {
    const stat = fs.statSync(path.join(root, asset));
    assert.ok(stat.size > 0, `${asset} should not be empty`);
  }
});

test("uses editable custom-document save support", () => {
  const commands = manifest.contributes.commands.map((command) => command.command);
  assert.deepEqual(commands, ["xgwx.refreshViewer"]);
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
  assert.match(script, /ladder\.horizontalLines/);
  assert.match(script, /ladder\.verticalLines/);
  assert.match(script, /function ldWireStartX\b/);
  assert.match(script, /function ldWireEndX\b/);
  assert.match(script, /Blank cell, rung/);
  assert.match(styles, /\.ld-board\b/);
  assert.match(styles, /\.ld-blank-cell\b/);
  assert.match(styles, /\.ld-cell\b/);
  assert.match(styles, /\.ld-glyph[^}]+background: var\(--vscode-editor-background, #000\)/s);
  assert.match(styles, /\.ld-value[^}]+background: transparent/s);
  assert.doesNotMatch(styles, /\.ld-cell:not\(\.instruction\) \.ld-glyph::before/);
  assert.doesNotMatch(script, /─\|/);
});

test("provides catalog-backed module selection in base hardware inspectors", () => {
  const script = fs.readFileSync(path.join(root, "media/main.js"), "utf8");
  const styles = fs.readFileSync(path.join(root, "media/main.css"), "utf8");

  assert.match(script, /xgk_module_catalog/);
  assert.match(script, /select_xgwx_module/);
  assert.match(script, /set_xgwx_module_option/);
  assert.match(script, /xgwx_module_option_values/);
  assert.match(script, /Apply module selection/);
  assert.match(script, /Apply module options/);
  assert.match(script, /entry\.visibleOptions/);
  assert.match(script, /option\.scope === "fileData"/);
  assert.match(script, /formatModuleOptionDefault/);
  assert.match(script, /All captured options are shown/);
  assert.match(script, /module-option-readonly/);
  assert.match(script, /function moduleSlotRange/);
  assert.match(script, /"Slot width"/);
  assert.doesNotMatch(script, /entry\.name === module\.name/);
  assert.match(script, /Base, slot, and comment are preserved/);
  assert.match(styles, /\.module-picker\b/);
  assert.match(styles, /\.module-options\b/);
  assert.match(styles, /data-view="hardware"/);
  assert.doesNotMatch(script, /treeItem\(`Modules \(\$\{modules\.length\}\)`/);
  assert.match(script, /let activeView = "overview";/);
});
