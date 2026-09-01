# XGWX Workspace Editor for VS Code

A custom editor for LS ELECTRIC XG5000 `.xgwx` workspace files,
powered by the sibling `libxgwx` project during development.

## Current scope

- Opens `*.xgwx` files directly as a VS Code custom editor.
- Shows project counts and metadata.
- Uses an editor-style explorer, dense module table, and contextual inspector.
- Supports Up/Down row navigation and undoable Delete from the hardware module table.
- Inserts a catalog module into an empty physical slot from the module inspector.
- Keeps captured FDEnet, Dnet, and Rnet network records synchronized when those
  modules are inserted, replaced, or deleted.
- Keeps one hardware-table row per physical base slot, including empty slots
  and continuation rows for multi-slot modules.
- Selects XGK modules from the embedded latest-stable catalog. Selection
  preserves base, slot, and comment while restoring the chosen model's ID,
  subtype, name, and default `Details`.
- Decodes known XGI-D24A/B input-filter values from module `Details`.
- Provides searchable module and variable tables.
- Edits program name, task, and comment metadata.
- Renders decoded LD programs as a selectable 10-column ladder diagram with
  contacts, coils, function blocks, rails, and decoded branch wiring. Empty
  rung/column positions are selectable for coordinate-aware editing workflows.
- Edits decoded ladder cell text when the UTF-16 encoded length is unchanged.
- Edits catalog-backed module dropdown options per module, channel, or group
  when their XG5000 `Details` byte mappings have been verified.
- Shows captured but unmapped module options as read-only rows instead of
  hiding them.
- Displays each module's physical slot range and rejects overlapping multi-slot
  selections such as XGF-TC4UD.
- Edits variable name, address area/number, data type, and description. Variable
  string fields retain their UTF-16 length to preserve opaque symbol records.
- Participates in VS Code Save, Save As, Revert, Undo/Redo, and hot-exit backup.
- Shows program and network summaries.
- Provides an explicit refresh action for the current editor document.
- Adapts to narrow editor groups by collapsing the inspector below 980 px.

Editing is intentionally fail-closed. Module selection accepts only catalog
models, module option controls are limited to verified mappings and values, and ladder edits keep the original
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

The corresponding source for a published VSIX is available from the matching
release or tag in the [project repository](https://github.com/ne0ekspert/vscode-xgwx).
The exact `libxgwx` source revision used by the bundled WebAssembly artifacts is
recorded in [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md).

## License

XGWX Workspace Editor is licensed under the GNU General Public License, version
3 or (at your option) any later version (`GPL-3.0-or-later`). See
[`LICENSE`](LICENSE).

The bundled `libxgwx` JavaScript and WebAssembly artifacts remain licensed
under Apache-2.0. See [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md) and
[`LICENSES/Apache-2.0.txt`](LICENSES/Apache-2.0.txt).
