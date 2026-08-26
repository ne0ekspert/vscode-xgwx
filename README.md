# XGWX Workspace Editor for VS Code

A custom editor for LS ELECTRIC XG5000 `.xgwx` workspace files,
powered by the sibling `libxgwx` project during development.

## Current scope

- Opens `*.xgwx` files directly as a VS Code custom editor.
- Shows project counts and metadata.
- Uses an editor-style explorer, dense module table, and contextual inspector.
- Decodes known XGI-D24A/B input-filter values from module `Details`.
- Provides searchable module and variable tables.
- Edits program name, task, and comment metadata.
- Renders decoded LD programs as a selectable 10-column ladder diagram with
  contacts, coils, function blocks, rails, and decoded branch wiring. Empty
  rung/column positions are selectable for coordinate-aware editing workflows.
- Edits decoded ladder cell text when the UTF-16 encoded length is unchanged.
- Edits variable name, address area/number, data type, and description. Variable
  string fields retain their UTF-16 length to preserve opaque symbol records.
- Participates in VS Code Save, Save As, Revert, Undo/Redo, and hot-exit backup.
- Shows program and network summaries.
- Provides an explicit refresh action for the current editor document.
- Adapts to narrow editor groups by collapsing the inspector below 980 px.

Program editing is intentionally fail-closed. Ladder edits keep the original
UTF-16 length so proprietary record offsets and undecoded topology bytes remain
stable. Unsupported layouts or length-changing edits are rejected. Keep a
backup and validate edited workspaces in the target XG5000 version.

## Development

The extension uses plain JavaScript and requires no compile step:

```bash
npm run check
npm test
```

To refresh the bundled parser after changing `libxgwx`:

```bash
npm run build:wasm
```

The script expects `libxgwx` at `../libxgwx` by default. Set `LIBXGWX_DIR` to
override that path. If a rustup toolchain with the WASM target is installed, the
script prefers it over a system Rust installation without that target. A failed
WASM rebuild stops the build instead of copying an older package.

To run the extension, open this directory in VS Code and press `F5`. In the
Extension Development Host, open an `.xgwx` file. Use **Reopen Editor With… →
XGWX Workspace Viewer** if another editor association is already configured.

## Packaging

Install dependencies and create a VSIX:

```bash
npm install
npm run package
```
