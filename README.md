# XGWX Workspace Editor for VS Code

A custom editor for LS ELECTRIC XG5000 `.xgwx` workspace files,
powered by the sibling `libxgwx` project during development.

## Current scope

- Opens `*.xgwx` files directly as a VS Code custom editor.
- Shows project counts and metadata.
- Enables CPU choices only when the bundled writer accepts the retained hardware.
  Cross-family and compact-model conversions are disabled.
- Identifies the captured XBM-DR16S built-in I/O and disables unsupported compact
  module selection, deletion, and settings. Module comments remain editable.
- Edits module comments through the normal Save and Undo/Redo document flow.
- Uses an editor-style explorer, dense module table, and contextual inspector.
- Supports Up/Down row navigation and undoable Delete for supported XGK hardware.
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
- Identifies XGI CPU models and shows the stored language of each program.
  IEC `ProjectType 2` programs show a scrollable layout of captured row
  positions, comments, contacts, coils, horizontal wires, vertical branches,
  and function blocks with decoded body geometry, control/data port labels,
  reference ordinals, and IEC types. Contacts and coils appear as ladder
  symbols on their wires; clicking one opens its source element for editing.
  Function expressions appear at their
  stored positions; selecting one opens its source editor. The source table displays
  Unicode text fragments in file order with search. Captured IEC LD comments, contact/output-coil variables, and
  function operand expressions can be edited up to 255 UTF-16 units. Contact
  and coil edits and insertions check known BOOL symbols and direct bit addresses; coil edits
  reject input addresses. Unclassified expressions still need Check Program.
  Function pin types are checked for classified symbols and literals; XG5000 4.82.1
  opened, checked, and byte-preserved every decoded program payload after a
  typed `TON.PT` edit from `T#5s` to `T#6s`.
  Function operands also accept typed numeric arithmetic with `+`, `-`, `*`, `/`, unary
  signs, and parentheses. The program 1 `MOVE.IN=0+1` webview edit matched the
  generated project byte-for-byte; XG5000 rendered it, checked all programs
  with 0 errors, and preserved all seven ProgramData payloads on Save As.
  Function blocks support ADD/SUB/MUL/DIV and EQ/GT/GE/LT/LE replacement. The source
  editor can change existing elements among all six addressed contact kinds
  and all six coil kinds while preserving their operands and positions. The IEC
  contact menus reuse the six addressed XGK contact variants in marker order;
  INV/PUP/PDN remain separate operations. Stored positions are shown for
  recognized contacts, coils, and fixed function
  blocks. Stored row and group IDs are shown for every captured text fragment.
  The program header counts stored rows, records, function blocks, and block
  links. The source table names each function expression's owning block and
  input or output pin. Linear rows with alternating contacts and long wires
  ending in a coil offer guarded insertion of all six addressed contact kinds
  at captured wire grid positions. Framed long wires in branched rows also
  offer insertion where the resulting circuit graph remains valid. A contact
  between matching long-wire fragments can be deleted on a branched row;
  XG5000 opened and resaved the generated L3 deletion without changing any
  decoded program payload. XG5000 4.82.1 rendered, checked, and
  byte-preserved generated falling-edge and negated-falling-edge insertions in
  an existing multi-contact row during Save As.
  Inserted operands must resolve to BOOL or reuse an operand already present in
  a captured contact or coil in the same program. This permits `스위치_1` on
  program 0 L2 even though its declaration is absent from the decoded symbol
  tables; unknown names remain guarded. The webview inserted `NO ON` and then
  `NC 스위치_1` into that row's long wire, producing bytes identical to the
  library-generated project. XG5000 rendered both serial contacts, checked the
  project with 0 errors, and preserved every program payload on Save As.
  XG5000 checked and resaved a normally
  open insertion into the supplied project's five-record row and a normally
  closed `ON` insertion into its first lighting rung; both native Save As files
  preserved every decoded program payload. Matching long-wire fragments in
  linear and eligible branched rows offer guarded Cell Delete for all six
  addressed contact kinds. XG5000 opened and resaved the generated L3 branch
  Cell Delete without changing any decoded program payload. Cell Delete closes
  the removed cell by moving later contacts and wires left while keeping the output coil fixed.
  XG5000 checked and resaved a generated rising-edge Cell Delete with every
  decoded program payload preserved. Direct native mutation captures currently
  cover NO and NC deletion. Existing deletion gaps, including the L3 branch, can be
  reconnected with the captured short horizontal-wire operation. XG5000's F5
  repair and the generated repair have matching decoded payloads and restore the
  supplied project to its baseline Check Program result.
  **Remove horizontal wire** lists four graph-validated one-cell segments in
  the supplied project. Removing program 0 L52 generated the exact library
  bytes from the rendered editor; XG5000 displayed the resulting gap, reported
  the expected disconnected-circuit errors, and retained all seven ProgramData
  and PB50 payloads byte-for-byte after Save As. Reinserting the wire restores
  the original ProgramData payloads.
  The Delete contact form also covers the first x1 contact on a captured
  two-row branch. XG5000 opened and resaved a generated L3 deletion with all
  seven decoded program payloads unchanged.
  An empty first x1 cell on that branch now offers **Insert leading contact**
  for an existing BOOL operand. The generated `NO 시작` insertion matched the
  native XG5000 payload byte-for-byte and survived native open and Save As.
  Cell Delete on the occupied first x1 cell moves the next contact into x1
  and leaves a short wire at x4. The generated edit matches the native capture
  byte-for-byte and survived XG5000 open and Save As.
  Captured one-cell wires offer **Replace short wire with contact** when a
  BOOL operand and the resulting circuit graph are valid. The L3 x4 generated
  insertion matched the native capture byte-for-byte and survived XG5000
  open and Save As.
  The simple-rung inspector can also delete an occupied row and shift later
  IEC lines up. The supplied project's L2 operation matches XG5000 Ctrl+D
  apart from eight unrelated row display-cache bytes; XG5000 opened and
  resaved the generated file without changing any decoded program payload.
  Eligible two-row branches offer **Delete upper branch row**, matching XG5000
  Ctrl+D on the supplied project's L3. The lower contacts remain and later rows
  shift up. XG5000 opened and resaved the generated file with every decoded
  program payload preserved.
  Captured vertical branch segments can be added between adjacent simple rows.
  Program 6 groups 4 and 9 offer **Delete middle branch row** at L4, L6,
  L21, and L23. This
  removes the contact row, reconnects the outer x3 branch, removes the two
  inner branches, and shifts following rows. All four locations match native
  XG5000 Ctrl+D apart from row display-cache bytes; XG5000 opened, checked,
  and resaved the generated L4 and L21 results with every decoded program payload
  unchanged. The final output row L7 is excluded because native Check Program
  reports an error after deleting it.
  Removal supports parallel segments and the captured two-row, contact-only
  final-branch shape; removing that final segment deletes its lower row and
  shifts later IEC coordinates as XG5000 does. The controls preflight each
  change through the writer before enabling it. XG5000 opened and resaved a
  generated parallel-segment removal with every ProgramData payload
  byte-identical to the generated file. The final-branch guard also accepts
  the supplied project's program 0 L42–L43 shape, where an `OFF` contact
  follows the branch on the upper row. XG5000's Ctrl+D removed the lower row;
  the writer produced the same records, and XG5000 rendered, checked, and
  resaved the generated result with all seven ProgramData payloads preserved.
  The same control accepts program 3 L17–L18, whose upper `NC` contact sits
  directly after the branch. XG5000 rendered, checked, and resaved that
  generated result with all seven ProgramData payloads preserved.
  It also accepts the two-leading-contact x6 branches in programs 4 and 5.
  The program 4 edit matches XG5000's direct deletion byte-for-byte, and
  XG5000 rendered, checked, and resaved the combined edits with all seven
  ProgramData payloads preserved.
  The same branch control also removes the x6 short-wire lower rows in
  programs 1 and 2. XG5000 rendered and checked both generated edits, then
  preserved all seven ProgramData payloads on Save As.
  It also removes the two x24 lower output branches in program 3. The first
  edit matches XG5000's Delete Line group byte-for-byte; XG5000 rendered and
  checked both generated edits and preserved all seven decoded program and
  local-symbol payloads on Save As.
  Program 3's groups 11–15 also allow removal of a terminal x6 contact and
  short-wire branch row from a larger contact-only group. Native Delete Line
  on group 11 matches the writer's group bytes. XG5000 rendered, checked, and
  resaved a generated project with all five terminal rows removed, preserving
  every decoded program and local-symbol payload.
  Groups 16 and 17 also allow removal of their terminal two-contact rows.
  The group 16 edit matches native Delete Line bytes; XG5000 rendered,
  checked, and resaved both generated edits with every decoded program and
  local-symbol payload preserved.
  Their middle two-contact rows can also be removed: the writer reconnects
  the surviving lower row to the preceding branch. Native group 16 Delete
  Line matches byte-for-byte, and XG5000 checked and resaved a project with
  both group 16 and 17 middle rows removed while preserving every decoded
  program and local-symbol payload.
  Program 3 groups 11–17 also allow removal of their first lower two-contact
  rows. The group 11 edit matches native Delete Line bytes. XG5000 checked
  and resaved a generated project with all seven rows removed (0 errors,
  1 warning, 42 messages), preserving every decoded program and local-symbol
  payload byte-for-byte. Group 15's middle contact and short-wire row can
  also be removed; native Delete Line bytes match, and XG5000 checked and
  resaved the generated edit with every decoded program and local-symbol
  payload preserved. Program 3 group 20's last single-contact branch row
  also deletes at x3, as does its middle single-contact row. XG5000 checked
  and resaved both generated edits with all seven decoded program payloads
  preserved byte-for-byte. The branch removal preflight now accepts 75 of
  192 vertical segments in the supplied project.
  The supplied project's program 0 L15 also offers **Delete L15 FF output
  branch row**. It removes the connected `FF` block with the lower branch row,
  matching native Delete Line. XG5000 rendered and checked the generated
  file, then preserved all seven decoded program and local-symbol payloads on
  Save As. This action is guarded to that exact captured group shape.
  Blank-row controls apply the captured IEC Ctrl+L and Ctrl+D operations after
  decoded stored rows and to empty gaps. They move later rows and every decoded
  branch, function, pin, and expression coordinate as one guarded edit. XG5000 opened the
  generated L30 insertion and L31 deletion, reported 0 errors, 1 warning
  category, and 42 messages for each, and preserved all seven ProgramData payloads during
  each Save As.
  **Insert IEC comment** fills an empty row with a standalone comment. For a
  program with no gap, insert a blank IEC row first. The program 1 L6 sequence
  shifted MOVE down, then inserted a comment; the rendered webview produced
  bytes identical to the generated file. XG5000 rendered, checked, and resaved
  it with all seven decoded program and local-symbol payloads preserved.
  Selecting an empty IEC row or cell offers a native single-row rung from any of six
  addressed BOOL contact kinds, a rail-spanning wire, and any of six BOOL coil
  kinds. This includes the empty row after the final network; after creating
  a rung, the next empty row is available for another. Operand fields suggest
  local BOOL names and accept direct bit addresses. The writer preflights the
  target gap and both operands. XG5000 4.82.1 checked an appended rung in all
  seven smart home programs with zero errors and the baseline 27 warnings.
  Save As preserved all seven ProgramData payloads and all parsed local symbol
  fields. The rendered webview also created two successive appended rungs,
  matching the library output byte-for-byte. Five generated
  representatives cover all 12 record codes; XG5000 4.82.1 rendered each one,
  checked each with 0 errors, 1 warning category, 27 warning instances, and 42
  messages, then preserved all seven ProgramData payloads byte-for-byte during
  every Save As. The matching delete control requires the exact guarded kinds,
  operands, and contact-wire-coil shape and restores the prior implicit
  blank-row file byte-for-byte.
  **Add parallel contact** is available on a simple addressed BOOL contact to
  addressed BOOL coil rung, including `OUTPUT`, `INVERSE`, `SET`, `RESET`,
  `RISING`, and `FALLING` coils. It adds a selected BOOL contact on a new lower row and connects
  both paths before the existing long wire. XG5000 rendered the generated
  program 0 L31/L32 branch and its all-program check reported 0 errors, 1
  warning category, and 42 messages. Its Save As retained all seven generated
  ProgramData payloads byte-for-byte. **Remove branch segment** on this new
  two-row shape restores the source project bytes exactly. XG5000 also opened,
  checked, and resaved a generated `NC %MX760` branch beneath `NO %MX761` on
  the supplied project's program 5 `SET %MX762` rung. All seven ProgramData
  payloads were byte-identical after native Save As. The bundled WASM emitted
  the same generated file and removing the branch restored the SET-only file.
  The operand field also accepts direct BOOL device addresses and suggests
  captured contact names. On the supplied project's program 5 L4 rung, the
  webview generated the exact project bytes for a new `%MX760` lower contact;
  XG5000 rendered it, checked with 0 errors, and preserved all seven generated
  ProgramData payloads on Save As.
  The parallel-contact form now selects any of the six addressed BOOL contact
  kinds. Selecting `NC` for `%MX760` on that rung produced bytes identical to
  the generated file; XG5000 rendered its slashed contact, checked all programs
  with 0 errors, and preserved all seven ProgramData payloads on Save As.
  All six kinds pass local branch and removal checks; this native branch check
  covers `NC`.
  The form also accepts existing simple rungs whose leading contact has any
  of the six addressed kinds. For the original project's program 0 L2
  rising-edge `스위치_1` rung, it added `NO ON` below the top contact and emitted
  bytes identical to the generated project. XG5000 rendered and checked the
  resulting branch with 0 errors, then retained all seven decoded ProgramData
  payloads on Save As.
  A separate **Delete output coil** control removes the terminal wire and
  coil from an eligible one-row rung while retaining its contact. This matches
  XG5000's native Delete save at program 0 L2. The resulting contact-only row
  offers **Insert output coil**; restoring `OUTPUT 시작` reproduces the original
  seven decoded program payloads byte-for-byte. A clean XG5000 Save As of the
  generated deletion preserved all seven payloads; a generated `SET 시작` coil
  also passed Check Program with 0 errors and survived Save As unchanged.
  **Delete complete IEC network** clears any decoded network group and leaves
  its rows available for later insertion. The writer validates every captured
  group in the supplied smart-home project locally. XG5000 opened, checked,
  and byte-preserved native Save As outputs for a branched L3-L4 group and a
  five-row R_TRIG/ADD/MOVE group at L20-L24.
  **Move complete IEC network** offers empty row ranges that fit the selected
  network. It moves contacts, branches, function blocks, pins, and operand
  links as one unit and leaves the original rows empty. A one-row move and a
  five-row function-network move both passed XG5000 Check Program with 0 errors;
  native Save As retained all seven program payloads byte-for-byte.
  **Copy complete IEC network** uses the same empty row ranges while keeping
  the source network. It copies contacts, branches, function blocks, pins, and
  operand links together. XG5000 4.82.1 checked both a one-row copy and a
  five-row R_TRIG/ADD/MOVE copy with 0 errors; Save As retained all seven
  program payloads byte-for-byte. The five-row copy raised 29 warning instances
  versus the project's baseline 27. XG5000 classified the two extras as
  duplicate output writes (`R0000`) from the copied ADD and MOVE. Copies retain
  operands and function instance names, so reassign outputs and stateful
  function instances before using independent logic, then run Check Program.
  **Replace complete IEC network** copies a selected network over another
  occupied network in the same program as one undoable edit. The source stays
  in place. Replacing program 0 L6 with L2 in the supplied project produced
  the library-generated bytes in the rendered editor. XG5000 rendered the new
  L6 network, checked all programs with 0 errors, 1 warning category, and 42
  messages, and saved all seven ProgramData and PB50 payloads byte-for-byte.
  Review reused output operands and function instances after replacement.
  **Copy network from another program** lists complete contact, coil, wire,
  branch, comment, and function networks for empty destination rows. It checks
  local names, types, mapped addresses, and required function instances.
  **Copy missing local variables** creates absent supported primitive locals
  in the destination and retains mapped BOOL addresses as part of the same
  undoable edit. A conflicting name, mapped bit, or function instance is
  rejected. In the supplied project, the rendered editor copied program 0
  L48–L50 into program 6 L0–L2 with `OFF` `%MX7` and `ON` `%MX8` declarations;
  its bytes matched the library output. XG5000 rendered the branch and `MOVE`
  block, checked all programs with 0 errors, and preserved every ProgramData
  and PB50 payload through Save As. A separate `WORD_TO_UDINT` network copy
  into program 3 also passed the XG5000 check and Save As.
  The option also copies captured missing function-instance declarations and
  Unicode-named automatic primitives. Program 4 received an R_TRIG instance
  and, in a separate edit, the `변환` UDINT output local; both copies passed
  XG5000 Check Program and Save As. **Replace network from another program**
  combines an occupied-network deletion with the same guarded copy in one
  undoable edit. The program 0 R_TRIG to program 4 L22–L25 replacement emitted
  the exact bytes already accepted and resaved by XG5000.
  An IEC function instance row offers **Separate instance** to create a new
  local PB50 declaration and rebind only that block. The copied R_TRIG case
  passed XG5000 Check Program with 0 errors and preserved all seven ProgramData
  and local-symbol payloads through Save As.
  The copied ADD and MOVE operands can be edited in the Source text table.
  Reassigning their output destinations to `%MW701` and `%MW201` through the
  rendered editor produced the same XGWX bytes as libxgwx. XG5000 rendered
  the result, checked it with 0 errors and the baseline 27 warning instances,
  and preserved all seven program and local-symbol payloads through Save As.
  Eligible terminal MOVE blocks now show **Delete block** in the source table.
  The guarded edit preserves the leading contact and removes the preceding
  wire, function record, and otherwise empty pin rows. XG5000 4.82.1 rendered
  the generated deletion, reported the expected unfinished-network result of
  1 error, 0 warnings, and 36 messages, and preserved all seven ProgramData
  payloads byte-for-byte during Save As.
  After deleting any of the five elevator `MOVE` blocks at L1, L4, L7, L10,
  or L13, the retained contact exposes an **Insert terminal MOVE block** form.
  The L1 and L4 insertions were captured directly in XG5000. The generated L4
  file rendered correctly, checked with 0 errors, 27 warnings, and 42 messages,
  and retained all seven ProgramData payloads byte-for-byte after Save As.
  Program 0's lighting `MOVE` at L63 also supports reinsertion after deletion.
  Its default `0` to `자기유지2` form restores the original payload byte-for-byte;
  XG5000 rendered an alternate `1` to `자기유지1` edit, checked it with 0 errors,
  and preserved all seven ProgramData payloads during Save As.
  The standalone `WORD_TO_UDINT` group in program 2 also shows **Delete
  block**. Its guarded edit removes the complete three-row group and leaves
  L1-L3 as an implicit blank gap. XG5000 4.82.1 rendered the generated
  deletion, reported the project baseline of 0 errors, 1 warning category, 27
  warning instances, and 42 messages, and preserved all seven ProgramData
  payloads byte-for-byte during Save As.
  After this deletion, the L1-L3 gap exposes **Insert WORD_TO_UDINT** with a
  WORD input field and writable UDINT local output selector. XG5000 4.82.1
  opened generated files with the original `%MW301`/`변환` binding and a new
  `%MW302`/`변환_2` binding, reported 0 errors, 27 warnings, and 42 messages,
  and preserved all seven ProgramData payloads and IEC local symbol summaries
  during Save As.
  The connected single-output `FF` cell at program 0 L14 also shows **Delete
  block**. Its guarded edit removes the function and output-link records while
  retaining both stored rows and all surrounding rung records. XG5000 4.82.1
  rendered the generated deletion, reported the project baseline of 0 errors,
  1 warning category, 27 warning instances, and 42 messages, and preserved all
  seven ProgramData payloads byte-for-byte during Save As.
  After that deletion, the captured L14 gap exposes an **Insert FF block** form.
  It selects an existing local `FF` instance and restores the connected
  function and output link. XG5000 4.82.1 rendered the generated insertion,
  reported the same baseline diagnostics, and preserved all seven ProgramData
  payloads byte-for-byte during Save As.
  The connected `ADD` at program 0 L20 and `SUB` at L26 show **Delete block**
  for their captured R_TRIG/arithmetic/MOVE groups. Each edit removes the
  arithmetic block, incoming wire, and linked pin records, leaving R_TRIG and
  MOVE in separate groups. XG5000 4.82.1 opened and rendered both generated
  edits; Save As preserved all seven ProgramData payloads and local symbol
  summaries byte-for-byte in each case.
  Program 0 L67's first `EQ` also shows **Delete block** for the captured
  16-row comparison chain. It removes that block and its linked pins, closes
  one row, and preserves the x12 feed to the next `EQ`. XG5000 opened the
  generated file and preserved all seven ProgramData payloads on Save As.
  Program 6 L46's first `EQ` shows **Delete block** for the captured heating
  comparison chain. The native L47 Delete Line removes that block and one row,
  reconnecting the x3 and x15 feeds. XG5000 checked the generated edit with
  0 errors and preserved all seven ProgramData payloads on Save As.
  The head, two middle, contact-fed, and two x15-fed comparisons in that chain
  can also be deleted successively in either direction. The rendered editor
  emitted the same bytes as the library after six Delete block clicks. XG5000
  checked the combined project with 0 errors and preserved all seven decoded
  ProgramData payloads on Save As. The x3-fed comparison can also be deleted
  with those six blocks; two seven-edit sequences produced identical bytes in
  the bundled WASM test and rendered editor. XG5000 opens and preserves the
  seven-edit file on Save As, but Check Program reports one input/output
  connection error at the remaining contact-only heating network. Delete that
  complete network or reconnect it to an output before using this intermediate
  project.
  The WASM summary exposes a validated circuit graph containing element and
  wire edges, occupied grid areas, connected geometry components, and typed
  function bindings. Every current IEC writer validates that graph before and
  after an edit. All function-block body fields, pin positions, directions,
  reference ordinals, and IEC type masks in the supplied project are decoded.
  Multi-row group construction and merging, general element insertion,
  additional function insertion and connected-function deletion shapes,
  and broader function replacement remain guarded.
- The Variables view includes all 101 IEC program-local symbols in the supplied
  smart home project. It shows their owning program, mapped address, storage
  class, description, and captured function instance type. Mapped BOOL
  addresses can be edited within the same area, including different digit counts.
  The editor updates both the display text and the PB50 binary bit number.
  The `%MX8` to `%MX100` edit emitted the library-generated bytes; XG5000
  displayed and retained `%MX100` after Check Program and Save As. Its native
  save normalized program 0's PB50 table and four program display bytes.
  The inspector can also clear a mapped BOOL address, then assign a supported
  bit address to the unallocated BOOL or change its primitive type. Clearing
  `조명.ON` from `%MX8` emitted the library-generated bytes, which XG5000
  opened and checked with 0 errors, 1 warning category, and 42 messages.
  The library's fixture check clears and restores all 65 mapped BOOL symbols
  in the supplied project, covering its `%MX`, `%IX`, and `%QX` records. The
  bundled WASM also generated a two-address `%QX10` and `%IX0.0.7` unmap file
  byte-for-byte. XG5000 opened, checked, and resaved it with both mappings
  absent and 0 program errors; Save As retained all parsed local symbol fields.
  Local symbol
  renaming updates classified LD references and matching function instance
  markers in the owning program. Primitive
  types are displayed, and automatic variable types can be changed; XG5000
  clears their previous allocation after a type change. Program-local
  descriptions are editable, with a 255 UTF-16 code-unit limit. XG5000
  displayed and retained a generated `조명.ON` description after Check Program
  and Save As. The Variables view can add an unallocated primitive local
  variable to an IEC program. XG5000 opened, checked, and resaved a generated
  `TEST_LOCAL` BOOL variable; its local table matched the native-created table.
  The inspector can delete an unreferenced IEC local variable. XG5000's own
  deletion of `TEST_LOCAL` removed one PB50 record; the library deletion
  restores the original table. XG5000 opened, checked, and resaved that
  generated deletion with the original 15-row table intact.
- Renders supported legacy LD programs as a selectable 10-column ladder diagram with
  contacts, coils, function blocks, rails, and decoded branch wiring. Empty
  rung/column positions are selectable for coordinate-aware editing workflows.
- Copies, cuts, and pastes supported single cells or rectangular ladder
  selections from the cell context menu. Right-clicking within a drag selection
  keeps the full selection active.
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
models, module option controls are limited to verified mappings and values, and
undecoded legacy ladder strings keep their UTF-16 length. Captured IEC LD comment
records, contact/output-coil variables, and function operands support length
changes; other IEC
text and topology remain guarded. Keep a
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
XGWX Workspace Editor** if the file opens in VS Code's text editor. In VS Code
1.137.0, `code --new-window FILE.xgwx` can open the file as text during window
startup; opening it in a running window with `code --reuse-window FILE.xgwx`
selects the custom editor.

The debug launch task starts an Extension Development Host paused on inspector
port `9230`, then attaches the Node debugger directly to `127.0.0.1`. This avoids
the bundled JavaScript debugger's failing IPv4/IPv6 discovery during
`extensionHost` launches. Close the previous Development Host before starting
another session; the inspector port can serve only one host at a time.

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

Verified linear and branched LD layouts support inserting, replacing and deleting normally open/closed, rising/falling-edge and negated edge contacts; INV, PUP and PDN operations; and output, inverse, set/reset and rising/falling-edge coils. Select a cell and use the Element and Device address controls; operandless operations hide the address field. Delete removes selected supported elements and leaves wiring gaps. Arrow-key navigation includes rung comments; press Delete or Backspace on a selected comment to remove it. Click a rung comment to select it, double-click it to edit it, or right-click it to edit or delete it. Double-click an output comment to edit it. Right-click a ladder cell to copy, cut, or paste supported structural elements, add a rung comment above that row, or add an output comment on the row. Drag-selected rectangles retain their selection when right-clicked; copied blank positions clear the corresponding destination cells. Ctrl+L inserts a row before the cursor and stretches crossing branch connections. The Rows and branches inspector adds or removes vertical connections after columns 1–9 to the row below. Select a function block and use Instruction to change its mnemonic, then edit its comma-separated operands in Source text. The catalog offers 859 fixed-arity application instructions; blocks resize with their operand counts and reject overlaps. Operand text can change length. Instruction availability and operand validity depend on the selected PLC; use XG5000 Check Program after editing. Legacy LD row deletion and horizontal-wire editing are not supported yet. Check edited programs in XG5000; disconnected branches can produce program errors.


For XGK hardware, select a base in the explorer, choose **Slot count** (4, 6, 8,
10 or 12), then **Apply slot count**. Each base retains its own count. Shrinking
past an installed module, including a two-slot module, is rejected. The edit
uses the normal Save, Undo and Redo flow. Compact XGB base sizes remain protected.
