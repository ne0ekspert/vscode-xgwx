# XGWX Workspace Editor for VS Code

A custom editor for LS ELECTRIC XG5000 `.xgwx` workspace files,
powered by the sibling `libxgwx` project during development.

## Current scope

- Opens `*.xgwx` files directly as a VS Code custom editor.
- Creates blank projects from **File → New File… → XGWX: New File**, or the
  **XGWX: New File** command. Choose XGK ladder (XGK-CPUSN), XGI IEC ladder,
  XGI SFC, XGI ST, or XGI IL (XGI-CPUE), choose a new `.xgwx` path,
  and open `NewProgram`. ST and IL projects start with one empty source program.
  The native template defaults to project `NewProject` and PLC `LSPLC`.
  SFC projects start with an empty main block. Use **Create loop** for a starter
  chart, or add steps, transitions, labels, and jumps individually.
- Right-click **Programs** in the sidebar (or focus it and press Shift+F10) and
  choose **Create program**. Native VS Code prompts select LD/SFC/ST/IL and a unique
  name. Right-click a program for **Delete program**, also available with Shift+F10.
  Deleting the last program leaves Programs available for creating a replacement.
  The new blank scan program opens selected and uses the usual undo/save
  lifecycle. XGK offers LD; supported XGI CPUs offer LD and SFC. IEC function
  blocks belong to LD programs; XG5000 4.82.1's XGI program dialog has no separate
  FBD language. Existing application code and declarations stay intact.
- Drag programs in the sidebar to reorder them; a line marks the insertion position.
  The saved order controls execution order within each scan/task. Task assignments,
  the viewed program and unapplied SFC ST drafts are preserved. Reordering supports Undo.
- Shows project counts and metadata.
- Enables CPU choices only when the bundled writer accepts the retained hardware.
  Supported SFC, ST and IEC IL projects with captured default parameters and empty I/O tables
  can switch among XGI-CPUE, CPUS, CPUH, CPUU, CPUU/D and CPUUN. Changes preserve
  all program source and declarations and update default memory ranges. CPUUN adds/removes
  its default local Ethernet and empty motion sections. Custom settings and other
  XGI conversions require migration or further native validation.
  Cross-family and compact-model conversions are disabled.
  Standalone ST/IL conversions preserve source and local declarations; native
  XG5000 strict checks on all six models and Save As round trips passed with zero
  errors and warnings. All six captured model pairs are covered by writer/WASM tests.
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
- Edits network names and module config names, aliases, and comments in the
  sidebar text fields. Select a network module to edit
  its FEnet IP address, subnet, gateway, DNS, and DHCP settings, grouped by
  interface with DHCP checkboxes, including stored secondary interface fields. IPv4 octets and subnet masks are validated;
  use **Apply FEnet settings** to apply the edited fields as one undoable change.
  Station, driver type, receive/client timeout counts, and Glofa socket count
  are editable too. Drivers use named choices; timeout labels show the stored
  seconds or 10 ms unit and preserve it. Station bounds follow the existing
  RAPIEnet mode (0–63 when disabled, otherwise 0–220); timeout counts use 2–255
  and socket count uses 1–16. XG5000 reports that firmware V6.0 and later
  ignores the socket count and uses 64 connections.
  Edits participate in Save and Undo/Redo. Protocol identities and undecoded
  communication settings remain read-only.
- Edits Cnet ports for XGL-C22A/B, XGL-CH2A/B, and XGL-C42A/B from the
  network sidebar: electrical mode, baud rate, operation mode, station,
  data/stop/parity bits, response wait, delay, inter-character wait, parity-error
  acceptance, and termination resistance. Related changes use **Apply Cnet
  settings** as one undoable transaction. Selecting Modbus ASCII/RTU sets the
  required data-bit count; repeater mode synchronizes both baud rates.
  New Cnet modules receive captured native port defaults. Other Cnet hardware
  layouts remain read-only until validated. Modbus address maps, modem
  initialization commands, and P2P program creation are not edited here.
- Edits program name, task, and comment metadata.
- Identifies XGI CPU models and shows the stored language of each program.
  IEC `ProjectType 2` programs show a scrollable layout of captured row
  positions, comments, contacts, coils, horizontal wires, vertical branches,
  and function blocks with decoded body geometry, control/data port labels,
  reference ordinals, and IEC types. Contacts and coils appear as ladder
  symbols on their wires; double-click or Enter opens their instruction editor.
  Function expressions appear at their
  stored positions; double-click or Enter opens the owning block’s instruction editor. The source table displays
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
  Double-click a blank IEC cell or press Enter to use the native command
  input: MOVE, ADD/SUB/MUL/DIV, and EQ/GT/GE/LT/LE. Enter space-separated scalar
  inputs followed by the writable output. Placement needs room for the pin rows
  and adjacent operand cells, and rejects overlaps. The ten-function native
  acceptance project compiled with 0 errors and retained every program payload
  byte-for-byte on Save As.
  XGK blank contact cells offer the captured `=`, `>`, `<`, `>=`, `<=`, and `<>` comparisons; the output
  column offers application instructions including MOV and I2R. The command input uses
  spaces between operands; the source inspector retains comma-separated text. Complete the rung's input condition
  before running XG5000 Check Program.
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
  function bindings. Structural IEC writers validate their supported graph shapes. Nonstructural
  text/kind edits preserve decoded geometry and typed bindings, including open
  endpoints. All function-block body fields, pin positions, directions,
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
- Edits variable name, address area/number, data type, and description. Names
  and comments may grow or shrink up to 255 UTF-16 units; address-area and
  data-type text retains its encoded length.
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

Blank ladder cells use VS Code's native insertion picker and text inputs.
Double-click a blank cell or press Enter after selecting it, choose the element,
and enter its operands. This applies to XGK cells and supported IEC contacts,
single contacts or coils on empty rows, comments, and captured function insertion sites. Canceling
returns focus to the selected cell; Enter opens the picker again. The sidebar
shows the selection without an element insertion form.

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
XGWX Workspace Editor** if you explicitly chose the text editor. Startup
recovery opens clean `.xgwx` binary tabs in the workspace editor after activation,
including `code --new-window FILE.xgwx` on VS Code 1.137.0. It checks the XGWX
signature and respects configured editor associations, the binary editor choice,
and unsaved text. Recovery runs once; later **Reopen Editor With…** choices are
preserved.

The debug configuration launches a development host in a separate temporary
VS Code profile and attaches to its inspector through `127.0.0.1:9230`.
This avoids the bundled debugger's IPv6 localhost discovery failure. The
launcher keeps the host process alive and closes it on Stop or Restart;
Restart launches this checkout again. Close an older development host before
starting a session if it still uses port 9230. The host starts without waiting
for a debugger, so Run Without Debugging also opens the editor. The prelaunch
task checks JavaScript syntax. Use **Developer: Open Webview Developer Tools**
in the development host to inspect the ladder webview.

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

XGK contact and coil operands accept individual D-register bits, for example
`NO D0000.F` and `OUT D0001.0`. The suffix is one hex digit from `0` to `F`;
word instructions continue to use the whole register, such as `MOV D0000 D0001`.

Verified linear and branched LD layouts support inserting, replacing and deleting normally open/closed, rising/falling-edge and negated edge contacts; INV, PUP and PDN operations; and output, inverse, set/reset and rising/falling-edge coils. Select a cell and use the Element and Device address controls; operandless operations hide the address field. Delete removes selected supported elements and leaves wiring gaps. Arrow-key navigation includes rung comments; press Delete or Backspace on a selected comment to remove it. Click a rung comment to select it, double-click it to edit it, or right-click it to edit or delete it. Double-click an output comment to edit it. Right-click a ladder cell to copy, cut, or paste supported structural elements, add a rung comment above that row, or add an output comment on the row. Drag-selected rectangles retain their selection when right-clicked; copied blank positions clear the corresponding destination cells. Ctrl+L inserts a row before the cursor and stretches crossing branch connections. The Rows and branches inspector adds or removes vertical connections after columns 1–9 to the row below. Select a function block and use Instruction to change its mnemonic, then edit its comma-separated operands in Source text. The catalog offers 859 fixed-arity application instructions; blocks resize with their operand counts and reject overlaps. Operand text can change length. Instruction availability and operand validity depend on the selected PLC; use XG5000 Check Program after editing. Legacy LD row deletion and horizontal-wire editing are not supported yet. Check edited programs in XG5000; disconnected branches can produce program errors.


For XGK hardware, select a base in the explorer, choose **Slot count** (4, 6, 8,
10 or 12), then **Apply slot count**. Each base retains its own count. Shrinking
past an installed module, including a two-slot module, is rejected. The edit
uses the normal Save, Undo and Redo flow. Compact XGB base sizes remain protected.

Function insertion uses one native VS Code command picker, for example `MOV D100 D200`
or `MOVE 1 Target`. The title and variable suggestions follow the final operand
as you type. Selecting a suggestion fills that operand; Enter on “Insert instruction”
confirms the complete command. Source/destination hints are provided for moves,
I2R, arithmetic, and comparisons. Other catalog instructions show operand numbers.
The built-in picker does not report caret position, so hints follow the last token
when editing earlier text too. Operands containing whitespace are not supported
in this command field. Existing Source text editing still uses commas.

XGK command operand hints and symbol suggestions use type and device permissions
from the V3.5 instruction help manual (714 matching instruction entries).
For example, MOV suggests WORD symbols, DMOV suggests DWORD symbols, and I2R
switches from WORD/INT sources to REAL destinations. Invalid constants in device
operands and disallowed device areas are rejected by both the picker and writer.
Raw word devices can address multiword storage. Shared manual type unions remain
unions except reviewed variants; undocumented instructions retain existing behavior.
Numeric ranges, alignment, indexed addresses and CPU-specific availability still
need native Check Program validation.

XGK comparison contacts open the native instruction prompt with double-click or
Enter, prefilled with the current operator and operands. Delete removes the
complete comparison contact and its operand references, leaving a three-cell
wiring gap. Cancellation returns focus so Enter can reopen the prompt.

### Direct ladder command input

Single-click selects a cell. Double-click or Enter immediately opens the VS Code
native command prompt, without an action chooser. Empty cells start blank;
existing contacts, coils, comparisons, and functions are prefilled. Input and
output expressions follow pin order, with outputs last and EN/ENO wiring omitted.

- Contacts: `NO` (`A`), `NC` (`B`), `P`, `P/`, `N`, `N/`.
- Coils: `OUT`, `OUT/`, `SET`, `RST` (`RESET`), `OUTP`, `OUTN`.
  `P`/`N` are coil aliases when editing a coil or using an XGK output cell.
- XGK operandless commands: `INV`, `PUP`, `PDN`.
- Comparisons/functions retain their native mnemonics, e.g. `>= D100 D102`,
  `MOV D100 D200`, or IEC `ADD Temperature 1 Result`.

Commands are case-insensitive. IEC variable spelling is preserved. Autocomplete
and hints follow the current operand type. Placement and writer errors keep the
prompt open; kind and operand changes apply as one undoable edit. Existing
elements can change within their supported family. Cancel returns focus so Enter
can reopen the prompt. Structural row/comment operations remain separate.

New IEC contacts advance the cursor one cell to the right after a successful
insertion. Press Enter to continue entering contacts on the same row. Empty
cells on existing rows accept a single contact or coil without adding a rung or
wire. Existing wires use the supported contact-replacement operations.

`WORD_TO_UDINT Source Destination` is available at previously verified
standalone insertion sites. General conversion placement remains disabled
because its generated project has not passed native open acceptance.
XGK instruction constants are checked against the decoded operand type ranges;
full device spans, indexed-device syntax and CPU restrictions still require
native XG5000 Check Program.


### Terminal IEC branch feeds

In **IEC operations**, choose the last segment of a supported terminal contact
feed and select **Remove terminal feed and tail**. The feed row and open tail
are removed as one undoable edit while function blocks remain in place. Native
incomplete circuits stay visible; an existing open terminal tail can be removed
through its final segment. Final function continuation references sharing the preceding branch row are
retained. Program 3 L73 and L67 pass native all-program checking together with zero errors
and the original 27 warnings; all seven program payloads survive native Save As
unchanged. Forked tails and other function-reference row shapes remain guarded.


### IEC arithmetic blocks beside a branch spine

Delete or Backspace on a focused function marker invokes the guarded block
deletion directly. The inspector's Delete block action uses the same writer.
Four-row scalar ADD/SUB/MUL/DIV blocks beside a simple external branch spine
can be removed while retaining the spine and neighboring blocks. Later rows
shift up once. Other layouts remain guarded.

Deleting the original project's program 5 ADD at L15 and program 6 ADD at L30
passes XG5000 strict all-program checking with zero errors and the original
27 warnings. Native Save As preserves all seven program payloads unchanged.
The other arithmetic names share the writer shape but have no separate native
mutation captures. Browser acceptance verifies the diagram Delete key emits
one undoable edit; its VS Code host bridge is mocked.


Branch removal also reconnects simple branch-only or single-contact spine rows
inside function groups. This exposes program 2 L21/L28 and program 6 L83/L84
through the existing segment picker. It uses the same native-validated writers
as Delete branch-only row and Delete chained contact row, and preserves all
function bindings. General multi-row network reconstruction remains unfinished.


### Connected IEC trigger deletion

Delete/Backspace on supported R_TRIG blocks removes their body and output
reference while retaining neighboring functions, rows and local symbols.
Reconnect the resulting gap through **More IEC operations… → Reconnect
horizontal wire gap → Insert horizontal wire**.

Program 0 L20's deletion alone has three native errors. Its repaired
circuit passes XG5000 strict all-program checking with zero errors and the
original 27 warnings; all seven program payloads survive native Save As
unchanged. Fixture checks also cover L26/L32's wire-fed layouts; those do not
have separate native mutation captures. The browser test verifies Delete and
repair as two undoable edits with a mock VS Code bridge.


A compatible gap left by connected R_TRIG deletion also accepts
`R_TRIG InstanceName` through the blank-cell Enter/double-click instruction
prompt. Autocomplete offers declared R_TRIG instances. This restores the block
and its output reference while preserving the surrounding rows and functions.
All three lighting-program trigger restorations match the original program
payloads exactly in fixture tests; the generated L20 restoration passes native
XG5000 strict all-program checking with zero errors and 27 warnings.
General trigger placement and new instance declaration creation remain guarded.

Native Save As of the generated L20 trigger restoration preserves all seven
decoded ProgramData payloads byte for byte.


### Compound IEC operand input

Parentheses keep a spaced operand together in the instruction prompt.
Autocomplete continues inside an unfinished group; after its closing
parenthesis and a space, the hint advances to the next operand. Reopening a
spaced operand groups it without changing its stored text.

Comparison, Boolean, bitwise and MOD compound operand text is currently
rejected. A native five-MOVE test reports ten XG5000 Check Program errors,
even though native Save As preserves the generated program bytes. These forms
need a native-valid expression representation or construction using connected
function blocks. The existing `0+1` capture proves check/save compatibility,
not arithmetic evaluation semantics.


### Vertical wires on shared function rows

Click a vertical wire and press Delete or Backspace to remove its paired wire
records while retaining the rows, function blocks, operands, and references.
A gap between adjacent exposed endpoints shows a small `+` control. Double-click
it or press Enter to reconnect; keyboard focus follows the gap and restored wire.
The branch picker also offers row-preserving removal for shared rows and can
reconnect gaps alongside function blocks. Operations that would empty a stored
row still need row-group reconstruction. Text, supported contact/coil kinds, and arithmetic/comparison operator edits
remain available while wiring is open, provided record topology and typed pin
bindings remain unchanged. Structural edits retain their own guards.

All 192 original vertical segments pass fixture deletion/restoration checks
with exact program payload recovery. The generated program 0 L69-L70 deletion
separately passes native XG5000 strict all-program checking with zero errors
and the baseline 27 warnings; native Save As preserves all seven generated
program payloads byte for byte. This native capture validates that operation;
it does not prove that every possible wire deletion leaves a working circuit.


Operand, comment, supported contact/coil-kind and arithmetic/comparison-operator
edits can preserve an existing open wire layout. They must retain its electrical
geometry, record order and typed function bindings. A combined vertical-wire
deletion, EQ operand length change and EQ-to-GE replacement passes native strict
all-program checking with zero errors and the baseline 27 warnings; Save As
preserves all seven generated program payloads byte for byte.


### Joining and separating IEC networks

Select a diagram cell and press F6 to connect its left boundary to the next
stored row. Consecutive networks can be joined when both electrical points
exist and the boundary clears function bodies. A joined network is disabled
if either source network is disabled. Existing rows, elements and function
bindings remain in place.

After removing crossing wires, **More IEC operations → Separate networks**
splits a disconnected row boundary. Both resulting networks keep the current
execution setting. Each operation supports undo. New rows and connections
without existing electrical points still require additional construction support.


The combined contact, branched-network and EQ-network join candidate passes
native XG5000 strict all-program checking with zero errors and 27 original
warnings. Native Save As preserves all seven generated program payloads exactly.


### Extending an IEC branch into a blank row

F6 can extend a group's final row into the next empty row when the selected
boundary has an electrical point and clears function bodies. Delete on the new
wire removes its branch-only row. Shared function rows retain their separate
row-preserving deletion behavior. The generated L4-L5 extension passes native
strict checking with zero errors and 27 original warnings; Save As retains all
seven program payloads exactly. Leading contact placement on the new branch-only row is now supported.


Enter or double-click the first cell of a new branch-only row to insert a
BOOL contact using the instruction prompt. The cursor advances after insertion.
Delete or Backspace on a contact uses supported native deletion and returns
focus to the empty cell. The L5 NO ON insertion matches native records and
passes strict checking with zero errors and 27 original warnings; native Save
As preserves all seven program payloads exactly. Enter or double-click an empty cell to the right of an incoming x3 branch
endpoint and enter `OUT %MX0` to create a right-rail coil and its feed wire.
The cursor advances to the next row. Delete or Backspace removes the coil
and feed while retaining the branch endpoint. Wider x6 and x24 branch feeds are also supported. Coils can be inserted or
deleted while another branch remains open; function bindings and other open
endpoints are preserved. The x93 boundary beside a right-rail output still
needs further support.

The incoming x3 branch row also accepts `MOVE`, arithmetic, and comparison
blocks at raw x7. Placement creates the required body rows and shifts later
networks and their pin links. Disabled networks remain disabled. Delete or
Backspace removes the block and its operands while retaining the branch rows;
Enter in the selected empty cell can insert another scalar block. A shorter
MOVE preserves the extra branch row; a taller arithmetic or comparison block
extends a MOVE scaffold and makes room below it. Other branch boundaries
remain guarded pending native validation.

Generated MOVE, ADD, and EQ placements each pass native XG5000 strict
all-program checking with zero errors and 27 original warnings. Native Save As
preserves all seven program payloads exactly. Two-pin and three-pin deletion
results also pass native strict checking with the same baseline counts, and
native Save As preserves their program payloads exactly. Browser interaction checks use a
mock VS Code bridge; they cover insertion, deletion, blank-cell focus, and
reinsertion.


### Deleting a terminal timer

Delete or Backspace on the supported gas-control TON at L15 removes the block,
its short feed, and its owned pins while preserving the contact, later rows,
and local timer declaration. The result matches native XG5000 Delete, which
leaves an unfinished contact-only rung: strict checking reports one input/output
error. Complete it by double-clicking the vacated cell or pressing Enter and
entering `TON Timer 시간 카운터` to restore the original block. The instruction
prompt takes an existing TON instance, TIME preset, and writable TIME elapsed
destination. A TIME literal such as `T#2s` can replace the preset. Insertion
preserves the local declaration and returns focus to the block. Other timer
layouts and creation of new timer declarations remain guarded.

### Replacing an IEC scalar block directly

Double-click a supported branch scalar block or press Enter to edit its complete
instruction. The prompt offers MOVE, arithmetic, and comparison commands with
operand descriptions and type rules. Changing the command replaces the block
as one edit; taller blocks extend the retained scaffold and shorter blocks keep
surplus native branch rows. Invalid types, stale targets, and unsupported
layouts leave the document unchanged. Existing operand-only and family editors
remain available for other decoded layouts.

Direct MOVE-to-ADD and ADD-to-MOVE outputs are byte-identical to the generated
projects validated by native XG5000 strict checking and Save As. Rendered prompt
checks use a mock VS Code bridge.

### Editing shared IEC scalar chains

Delete or Backspace can remove a scalar block from a supported horizontal chain
without removing its neighbors or shared operand rows. Tail deletion trims the
unused trailing wires. Deleting a leading block leaves an unfinished gap until
it is refilled. Enter or double-click in the empty cell opens the instruction
prompt. `INT_TO_UDINT Source Destination` requires an INT source and a writable
UDINT destination. Refilling either gas-control L18 block with its original
operands restores all seven original program payloads exactly. Focus returns
to the new block, where Enter reopens its operand editor. Mixed function layouts
remain guarded until their native record topology is verified.

Shared horizontal scalar chains also support different block heights. Delete
removes only the selected block and its owned pins; trailing empty body rows
become implicit blank rows, while later ladder row numbers remain unchanged.
The empty-cell prompt also accepts `UDINT_TO_TIME`, `TIME_TO_UDINT`, and
`UDINT_TO_INT`, with typed sources and writable destinations. Refilling the
captured gas-control MUL/conversion and conversion/DIV chains restores all
original program payloads exactly.

The captured lighting L32 scalar tail after `R_TRIG` also supports Delete,
typed refill and replacement between MOVE, arithmetic and comparisons.
Deleting the scalar retains the contact, trigger instance and its reference;
only unused trailing pin rows disappear. Enter on a supported chain block
opens the instruction editor with atomic scalar replacement. Invalid operand
types leave the original document unchanged.

Lighting L38 `MOVE`, driven by the L37 `EQ` result, supports Delete and
Enter/double-click refill with `MOVE Source Destination`. Deletion removes
its feed wire and retains both comparison inputs and all later row numbers.
Refill reconnects the comparison result. Other instruction kinds in this
shared result-row scaffold remain guarded.

The connected comparison at lighting L37 supports `EQ`, `GT`, `GE`, `LT`
and `LE` with two source operands. Enter or double-click opens its instruction
editor; its BOOL result stays wired to MOVE. Delete retains MOVE and its feed,
and Enter/double-click on the vacated comparison cell restores the header and
left rail connection. Changing both source types in one edit is atomic.

IEC standalone block deletion also accepts the native one-cell short wire
feed. This enables deleting the last MUL or conversion left after removing a
chain tail, and the standalone gas-control GE comparison. Later rung numbers
and other programs stay unchanged.
Deleting a contiguous final standalone group also trims the program row
count at that group, matching native XG5000 deletion.

Staggered `MOVE` blocks below a neighboring function also support Delete in the
captured layout, including lighting L22, L28, and L53 in the IEC project. The
neighbor's pins remain intact. Enter on the vacated cell opens the instruction
input for refill. Deletion retains the native feed wire, so the intermediate
program has an unfinished input/output path until refilled or disconnected.

Completed scalar branch tails also support Delete, Enter-to-refill, and
replacement between MOVE, arithmetic, and comparisons. This covers boiler L19,
boiler L36, heating L34/L42/L74, and lighting L79/L87 in the IEC project, including
the captured disabled lighting networks. The upper block and vertical
branch remain intact. Removing the tail leaves an open branch until refilled;
refill reconnects it without extending the branch through the new pin rows.
Deleting the final lighting MOVE also trims the program's editable row count;
refill expands it to fit the replacement block.
Long-wire drawing now reaches the next cell and connects to incoming branches,
matching the native editor's wiring display.


Captured contact-fed scalar tails support the same Delete, Enter refill and
replacement flow: boiler MOVE L43 after its NC contact and retained branch,
and curtain MOVE L6 after its NO contact in a disabled network. Deletion keeps
the contact and removes the block's feed and owned pin rows. Refill creates a
single native wire from the contact to EN. A three-pin curtain replacement
makes room before the next network using the native blank-row operation.
Other contact-prefix, block-position and execution-mode combinations remain
guarded.

Captured contact-fed upper branches also support scalar body Delete, typed
refill and replacement: boiler LE L24 and MOVE L40, and heating LT L38.
Deletion preserves both leading contacts and the continuing branch rows.
The captured boiler GE L28 branch also retains its NO/NC contacts and both
branch connections during Delete, typed refill and scalar replacement.
Replacing the upper boiler MOVE with arithmetic or a comparison adds one
branch row, moving the lower MOVE from L43 to L44. Deleting that replacement
retains the expanded scaffold for further editing.


Scalar blocks on the captured continuing branch spines support body Delete,
Enter refill and replacement between MOVE, arithmetic and comparisons. This
covers boiler LT L32, lighting EQ L71/L75 and heating EQ L66/L70. Body deletion keeps the four
branch rows and the following blocks at their original rows. MOVE uses three
of those rows and keeps the spare row; deleting the replacement restores the
same branch-only state. Disabled continuing-branch refill marks the body,
feed and operands disabled. Other spine and execution-mode combinations stay
guarded.


The captured curtain TON at L1/x19 now supports Delete and typed refill while
retaining its contact branch and Q output coil. Enter or double-click on the
empty cell opens `TON Instance Preset`; autocomplete filters TON instances and
TIME operands. The source network's disabled mode and later row numbers are
preserved. Other connected timer layouts remain guarded.

Terminal IEC TON blocks at verified x22 layouts can now be deleted and refilled
with Enter or double-click. The instruction prompt accepts an existing unused
TON instance and a TIME preset, preserves the input contacts, and restores the
long feed wire and pin rows. Deletion leaves an unfinished rung until refill,
matching XG5000. Other timer layouts remain guarded.

IEC staggered comparison pairs can now be deleted and refilled while keeping
the output branch, contacts, and coil. The supported normal layouts place
comparisons at x4/x13 or x7/x16 with three or four branch segments. Delete
handles either block or both in sequence; Enter and double-click request two
compatible input expressions for the wired comparison. Native XG5000 checks
and thirteen Save As round trips validate the generated layouts. Other
connected layouts remain guarded.

IEC `INT_TO_UDINT` / `UDINT_TO_TIME` pairs sharing an input branch with a TON
now support Delete and typed refill at the verified x10/x19 positions.
Enter or double-click requests the source and writable destination operands;
the timer and its bindings remain unchanged. Either conversion or both can
be deleted and restored in either order. Unknown layouts remain guarded.

The captured shared conversion branches in the boiler and heating programs also
support TON deletion and refill while retaining their input branches and other
blocks. The prompt accepts `TON <local instance> <TIME preset>`; supported
connected TON blocks expose both fields when editing. Conversion edits remain
available while the shared timer is absent. Browser checks cover keyboard and
double-click refill, cancel/reopen, TIME literal replacement and deleting and
restoring all three blocks, using real WASM with a mock VS Code prompt bridge.
Original smart-home function deletion preflight coverage is now 79/81; two
layouts remain guarded, and this does not establish full IEC editability.

Shared timer native acceptance covered twelve generated Open / strict all-program
Check Program / Save As cases with all 84 decoded program payloads unchanged.
The eight restored cases had zero errors and the existing 27 warnings. Deletion
leaves unfinished networks: individual timer removal reports one error, and
removing all three blocks reports two errors until the network is completed.

The enabled common-entry TON at L31/x19 also supports guarded Delete, refill,
preset editing and replacement with an unused declared local TON instance.
The input branch and coil remain available while the timer is absent. Enter
and double-click use the same typed `TON <local instance> <TIME preset>` prompt.

Five native generated-file checks and Save As round trips preserve all 35
decoded program payloads exactly. Refills, preset and instance replacement,
and combined timer edits report zero errors with the existing 27 warnings.
Timer deletion leaves three unfinished-circuit errors until the block is restored.

The enabled common-entry MOVE at L36/x19 now supports Delete and typed refill
through Enter or double-click. Deletion retains its leading contact, and refill
restores the native continuous feed. The original and refilled blocks remain
editable. Known scalar operand types are checked together; a BOOL source cannot
be assigned through MOVE to a WORD destination. Supported scalar instruction
prompts apply changed operands atomically, allowing a valid pair of operands to
change together. Browser checks use real WASM and a mock VS Code prompt bridge.

Three native Open / strict all-program Check Program / Save As cases preserve
all 21 program payloads exactly. Original and alternate MOVE operands pass
with zero errors and the existing 27 warnings. Deletion leaves one unfinished
circuit error until the block is restored.

Lighting MOVE L56/x16 and L59/x16 also support Delete and typed refill through
Enter or double-click, retaining the leading contact. Refill reproduces the
native layout after reopening the saved deletion file. Four generated native
Open / strict all-program Check Program / Save As cases preserve all 28 program
payloads exactly. Both refills report zero errors and the existing 27 warnings;
each deletion leaves one incomplete-circuit error until restored. Browser checks
use real WASM and a mock VS Code prompt bridge.

Two original function positions remain guarded: common EQ L5/x7 and heating
MOVE L80/x19. Broader IEC
placement, wiring and declaration editing still need work.

IEC MOVE operand edits and refill accept numeric `0` and `1` for BOOL
destinations, including the existing lighting L63 block. Other scalar
instructions retain their operand type checks. Native strict checking rejects
numeric `2` for this BOOL destination with L0706. Four generated native Check
Program / Save As cases pass with zero errors and the existing 27 warnings;
all 28 decoded program payloads match exactly. Browser interaction checks use
real WASM with a mock VS Code prompt bridge.

Lighting MOVE L48/x19 supports Delete and typed refill while preserving its
two parallel contacts and both branch connections. Enter and double-click
use the shared instruction editor. Native Delete and fresh refill records
match the writer exactly; two generated native Check Program / Save As cases
preserve all 14 decoded program payloads exactly. Refill reports zero errors
and the existing 27 warnings. Deletion leaves one L0000 input/output error
until the MOVE is restored. Browser checks use real WASM with a mock VS Code
prompt bridge and match all five emitted edits to Rust artifacts.

Lighting MOVE L52/x16 also supports Delete, typed refill and atomic replacement.
The independent lower MOVE at L53/x4 and its operands keep their row positions.
Delete splits the contact row and lower MOVE into separate groups; refill merges
them and preserves the existing row caches. Enter and double-click use the shared
instruction editor. Two generated native Check Program / Save As cases preserve
all 14 decoded program payloads exactly. Refill reports zero errors and the
existing 27 warnings; deletion leaves one L0000 input/output error until restored.
Browser checks use real WASM with a mock VS Code prompt bridge and match all five
emitted edits to Rust artifacts.


Lighting MOVE L84/x16 supports Delete, typed refill and atomic replacement
while retaining its two contact branch spines and the lower L87 MOVE. Native
refill preserves the six-row disabled network and its cached coordinates.
Both generated Delete and refill projects pass strict all-program checks with
zero errors and the existing 27 warnings; native Save As preserves all 14
program payloads exactly. Rust and WASM regressions cover replacement and repeat
deletion. Browser checks cover Delete, Enter refill, double-click replacement,
physical blank-cell double-click, and cancel/reopen, using real WASM and a mock
VS Code prompt bridge.

The comparison feeding a terminal coil at x94 supports Delete, typed EQ refill
and GT replacement at x7. Deletion keeps the result wire and coil; the prompt
accepts the two comparison inputs and reconnects the output on refill. Generated
EQ refill and GT replacement pass strict all-program checks with zero errors
and the existing 27 warnings. The intermediate deletion reports L0000 and
L0401 for its unconnected coil. Native Save As preserves all 21 program payloads
across these three cases exactly. Browser interaction uses real WASM with a
mock VS Code prompt bridge.

Heating MOVE L80/x19 supports Delete, typed refill and atomic replacement while
retaining its six contact rows and branch wires. Three focused WASM regressions
pass, and five browser edits match Rust output exactly. Generated refill passes
strict all-program checking with zero errors and the existing 27 warnings;
deletion reports L0000 until refilled. Native Save As preserves all 14 program
payloads across both cases exactly. Browser checks use real WASM with a mock
VS Code prompt bridge. Original function deletion preflight is 81/81.

Full IEC editing remains incomplete: broader placement and wiring, and
creation of function-block instance declarations, still need more work.

The verified six-row heating mesh supports leading-contact Delete and typed
refill while retaining its MOVE, operands and branch wiring. Native XG5000
checks pass for both generated cases, and Save As preserves all seven program
payloads exactly per case. Unsupported contact layouts retain editing guards.

IEC addressed-contact deletion now covers all 284 original contacts in the
validation workspace. Blank-cell refill preserves branch boundaries and native
execution flags; all 284 contacts recover their original program records in the
full-project preflight. The two undeclared switch operands can be restored in
explicitly disabled rows with captured disabled record flags, without creating
declarations. Representative upper and lower branch contacts have native and
browser validation; preflight coverage is not individual native acceptance of
every contact.


IEC operand autocomplete now includes the 13 BOOL system flags documented in
XG5000 IEC instruction help, including `_ON` and `_OFF`. Their symbolic names
remain read-only and do not create local declarations. The `_ON` contact can be
deleted and restored even after its last program usage is removed.


IEC right-rail coil Delete and typed refill now cover all 67 original coils in
the validation workspace preflight, restoring their program payloads exactly.
Branches and function-fed rows retain their surrounding records and pin
bindings. Native heating coil Delete/refill agrees on all circuit records,
with three explicitly checked display-height refreshes. Browser interaction
checks use real WASM with a mock VS Code prompt bridge. Read-only BOOL flags
remain available for source operands and are excluded from destination
suggestions.

The disabled `스위치_1` and `스위치_2` contact deletions and the common restored
project pass native strict all-program checking with 0 errors, 27 warnings and
42 messages. Native Save As preserves all 21 program payload comparisons and
every parsed local-symbol field exactly. Unknown names remain guarded in
enabled or unmarked rows and as coil destinations. Browser checks use real
WASM with a simulated VS Code prompt bridge.

Deleting and refilling the disabled lighting comparison-chain head now restores
its missing row and branch continuation automatically. Subsequent Delete/refill
retains that scaffold and reproduces the generated file exactly. Native manual
insertion matches every circuit record, with three checked display-height
refreshes. Both generated states pass strict all-program checking with 0 errors,
27 warnings and 42 messages; native Save As preserves all fourteen program
payloads and all parsed local-symbol fields exactly. Browser Delete, Enter,
double-click and cancel/reopen checks use real WASM with a simulated VS Code
prompt bridge.

The enabled heating comparison-chain head also restores its missing row and
both branch continuations automatically. Repeated Delete/refill reproduces the
generated file exactly. Native insertion matches every circuit record, with
seven checked display-height refreshes; native Save As of both generated states
preserves all fourteen program payloads and all parsed local-symbol fields
exactly. Both states pass strict all-program checking with 0 errors,
27 warnings and 42 messages. The refill retains the native post-deletion contact
feed, which differs from the original source. Two heating comparison-chain
refills remain unfinished. Browser interaction checks use real WASM with a
simulated VS Code prompt bridge.

The two middle heating comparisons also restore their missing row and both
branch continuations automatically. Delete, Enter, double click and prompt
reopening pass browser checks with real WASM and a simulated VS Code prompt
bridge. All four generated refill/deletion states pass native strict
all-program checking with 0 errors, 27 warnings and 42 messages. Native Save As
preserves all 28 program payloads and every parsed local-symbol field exactly.
Original-function preflight accepts 79 of 81 refills; the x3-fed and later
contact-fed heating comparisons remain unsupported. Full IEC editing remains
unfinished.

The outer-fed heating comparison also supports Delete/refill while retaining
its repaired branch shape. Both generated refill/deletion states pass native
strict all-program checking with 0 errors, 27 warnings and 42 messages. Native
Save As preserves all fourteen program payloads and every parsed local-symbol
field exactly. Browser interaction checks pass with real WASM and a simulated
VS Code prompt bridge. Original-function preflight now accepts 80 of 81
refills; the later contact-fed comparison remains unsupported. Full IEC editing
remains unfinished.

The contact-fed heating comparison at original L62 now has a structural
Delete/refill implementation in the checkout. Native placement and removal
captures match all circuit records, with seven explicit row-height changes.
Five chain-refill Rust capture fixtures and five focused WASM tests pass.
Browser checks pass Delete, Enter, double-click and cancel/reopen, with five
edits matching Rust output exactly; these checks use a simulated VS Code
prompt bridge. Original-function local preflight now accepts 81/81 deletions
and refills, of which 12 reproduce all original program payloads exactly.
Both generated L62 states pass native strict all-program checking with
0 errors and the baseline 27 warnings. Native Save As preserves all fourteen
decoded program payloads and all parsed local-symbol fields exactly. All five
chain-refill Save As fixture gates pass. This does not establish arbitrary
placement or combined edits.

The contact-fed comparison also supports deleting any subset of its three
retained contacts, refilling and deleting the comparison, and restoring the
contacts. Rust and WASM checks cover all seven nonempty subsets. Browser
workflows for the first and last contacts match Rust output exactly, using real
WASM with a simulated VS Code prompt bridge. Native Save As for four combined
editing states preserves all 28 program payloads and every parsed local-symbol
field exactly. Missing contacts produce native compiler errors until the circuit
is completed; the completed refill matches the previously validated program.
This coverage applies to the recognized comparison scaffold. Full IEC editing
remains unfinished.

Heating comparison deletion derives its location from decoded records, so
inserting rows or comments before the chain preserves editing support. Rust
and WASM checks cover all five original comparisons after row shifts, with
and without a comment that changes the group index. Five browser workflows
pass Delete, Enter refill, double-click editing and cancel/reopen; fifteen
edits match Rust exactly with a simulated VS Code prompt bridge. The shifted
source and ten deletion/refill states pass native strict all-program checks
with zero errors and the baseline 27 warnings. Native Save As preserves all
77 program payloads and every parsed local-symbol field exactly.

Contact-kind edits now compose with original contact-fed comparison deletion
and refill. Rust and WASM checks pass all six kinds at four contact positions,
before and after a preceding row insertion (48 combinations). Six browser
workflows pass contact editing, comparison Delete/refill, replacement and
cancel/reopen using real WASM with a simulated VS Code prompt bridge. Native
XG5000 checks of the L62 x10 contact across all six kinds and all three states
pass strict all-program checking with zero errors and the baseline 27 warnings.
Native Save As preserves all 126 program payloads and every parsed local-symbol
field exactly. Direct native Delete Line also matches the generated circuit
records, with six explicitly checked cached row-height changes and two local
record-offset changes; all symbol values and allocations remain unchanged.
Full arbitrary IEC placement and wiring remain unfinished.

Contact deletion also composes with comparison deletion and refill in the
recognized heating chain, including the state with all three top contacts
removed. Refill restores the contact feed before the missing contacts are
reinserted. Thirty Rust/WASM lifecycle cases and five browser workflows pass;
browser prompts use a simulated VS Code bridge. Native XG5000 validation covers
21 generated and native-import states. Save As preserves all 147 program
payloads and every parsed local-symbol field exactly. All eight completed
restorations check with zero errors and the baseline warning total; incomplete
contact feeds retain compiler errors until restored. Arbitrary IEC placement
and wiring remain unfinished.

A separate real VS Code host check covers built-in contact/comparison prompts,
cancel then Enter reopening, BOOL autocomplete, contact-first comparison
deletion/refill, single-contact restoration, cursor advance and Ctrl+S. The
restored QA file matches its starting bytes exactly. Clicking an empty IEC
cell keeps keyboard focus so Enter opens its instruction prompt.

Fresh `MOVE` placement below the stored IEC rows at the first function column
is native-validated. The generated file passes strict all-program checking
with zero errors and preserves all seven payloads and every local-symbol field
including offsets through native Save As. The diagram provides selectable
trailing blank rows and preserves its scroll position after saving. A real
VS Code host check covers L87 placement through Enter, double-click editing,
Escape then Enter reopening, and Ctrl+S; its output matches Rust byte-for-byte.

Fresh scalar placement also supports arithmetic and comparisons below the
stored rows. A generated-original MOVE/ADD/EQ sequence at distinct rows and
columns passes native strict all-program checking with 0 errors, 31 warnings
and 42 messages. Native Save As preserves all seven payloads and every local
field including offsets exactly. Real VS Code blank-cell Enter prompts and
Ctrl+S reproduce that sequence byte-for-byte and preserve diagram scroll.
This establishes fresh scalar placement; broader mixed-layout wiring still
requires additional implementation and native acceptance.

An earlier wire gap no longer blocks a scalar function in a separate new
network below the stored rows. The writer preserves earlier bytes, exposed
endpoints and existing pin bindings exactly. A native-saved open-layout
baseline plus fresh MOVE passes strict all-program checking with 0 errors
and the 27 baseline warnings; Save As preserves every program payload and
local field exactly. Real VS Code Enter insertion and Ctrl+S reproduce the
validated file and preserve diagram scroll.

FF and R_TRIG cells can also be deleted and refilled in a closed network while
another network retains a wire gap. Native Save As preserves every program
payload and local field exactly; refilling the three tested lighting cells
restores the baseline strict check result of zero errors and 27 warnings.
The intermediate deletion leaves missing connections and reports six errors.
Real VS Code Delete, Enter insertion and Ctrl+S reproduce both files exactly.
IEC instance names such as `FF` now use IEC type resolution in the instruction
prompt instead of XGK device-address validation.

Connected ADD/SUB deletion and refill now support an unrelated wire gap while
splitting and merging networks. A combined lighting ADD/SUB edit sequence passes
native strict checking with zero errors; refill restores the 27 baseline
warnings. Native Save As preserves all seven program payloads and every local
field exactly. WASM and real VS Code Delete, Enter refill and Ctrl+S reproduce
the validated files byte-for-byte.

MOVE and wired EQ deletion/refill also support a closed network beside an
unrelated wire gap. A four-block lighting edit sequence is verified through
real VS Code Delete, Enter insertion and Ctrl+S, WASM, and native XG5000 Save As.
All seven program payloads and every local-variable field match the generated
files exactly. The two intermediate deletion states report two and four
connection/input errors; restoring all blocks returns to zero errors and
the 27 baseline warnings. Edits within the open network itself remain limited.

Parallel-contact, staggered upper and continuing-contact upper MOVE editing
also works beside an unrelated wire gap. The combined three-MOVE deletion
and reinsertion sequence is verified through real VS Code, WASM and native
XG5000 Save As; all program payloads and local-variable fields remain exact.
Restoration passes strict checking with zero errors and the 27 baseline
warnings. The deleted intermediate state reports two invalid I/O errors.

GE and continuing EQ deletion/refill also work within the tested network that
retains a wire gap. Deleting and reinserting its three comparisons is verified
through real VS Code Delete, Enter insertion and Ctrl+S, WASM, and native XG5000
Check Program and Save As. Both checkpoints report zero errors and the 27
baseline warnings; every program payload and local-variable field, including
offsets, matches exactly. Branches, exposed endpoints and rows outside each
edited function footprint are preserved. Broader mixed wiring remains limited.

Simple terminal output coils can be deleted and reinserted while another
network retains a wire gap. A three-coil sequence is verified through actual
VS Code Delete, Enter and Save, WASM, and native XG5000 Check Program/Save As.
Both checkpoints report zero errors and the 27 baseline warnings; all seven
program payloads and every local-variable field, including offsets, match
exactly. Restoration recovers the original program data. The writer audit
accepts deletion and exact reinsertion for all 67 existing coils on the tested
open-layout baseline; arbitrary mixed wiring still needs further work.

Blank row insertion/deletion also supports an existing wire gap. The tested
lighting sequence inserts a blank row after L10 and removes the resulting L11,
shifting later functions and gap endpoints while preserving their connections.
Actual VS Code operations and Save match the generated checkpoints exactly.
Both native XG5000 checks report zero errors and the 27 baseline warnings;
Save As preserves all seven program payloads and every local-variable field,
including offsets, exactly. Removal restores the source program data.

### Parallel-wire cleanup with an unrelated open network

Closed networks retain their branch-segment removal controls when another
network has a gap. The selected rows must retain a parallel connection, and
all unrelated network bytes, gaps and typed bindings are preserved. Open-tail
labels now refer to the selected network. Six additional lighting-network
removals pass writer preflight, raising cleanup coverage from 75/191 to 81/191.
Row-preserving wire removal remains 191/191; those counts are writer audits.

Both three-wire deletion sets and restoration survive native XG5000 Save As
with all seven program payloads and every local field including offsets exact.
Deleting L48–L49/x3 causes L0000/L0403 in both native interactive editing and
the generated file; the disconnected intermediate circuit does not compile.
The isolated L84–L85/x3 deletion passes strict all-program Check with zero
errors and the baseline 27 warnings. Reconnecting restores 0 errors,
27 warnings and 42 messages. Actual VS Code removal/insertion pickers and
four Ctrl+S checkpoints match Rust/WASM output byte for byte. Broader branch
reconstruction and full-project editability remain unfinished.

### Branch row cleanup with an unrelated open network

Captured contact/wire branch cleanup can now remove a lower row while another
network has a wiring gap. Untouched network bytes must match the verified row
coordinate translation exactly, including later function pins. Two independent
edits passed native XG5000 strict checking across all seven programs with the
baseline 0 errors and 27 warnings. Native Save As preserved every program payload
and every local-symbol field, including offsets, exactly. Rebuilt WASM and actual
VS Code removal, saving and undo also passed exact file comparisons. General
mixed branch reconstruction remains incomplete.

### Terminal feed cleanup beside other wiring gaps

Captured terminal feed and unique-tail removal now works when another network
has a gap, including long-wire feeds sharing a function continuation row. Other
networks must retain exactly the expected row-coordinate translation. Actual
VS Code removal, save and undo pass exact file checks. Four native Save As
checkpoints match all seven program payloads and every local-symbol field,
including offsets, exactly. Native strict checking returns each cleaned result
to its deliberately gapped baseline of two errors; the unrelated gap remains.
General mixed network reconstruction is still incomplete.

IEC whole-network deletion, copy, move, and replacement now preserve unrelated
wiring gaps. Six native XG5000 Check Program/Save As cases passed with zero errors
and exact equality of all seven program payloads and every local declaration field.
Copies retain operands and can add duplicate-write warnings; review outputs
after copying.
Actual VS Code checks also verified row deletion, clipboard copying (including
cross-program local declarations), move/replacement pickers, save, and undo.
Save acknowledgments update status without rebuilding the diagram or discarding
keyboard focus.

Copy and move also support selected incomplete IEC networks with a validated
decoded layout. Their exposed endpoints translate exactly while other network
bytes remain intact. Three additional native cases cover a four-comparison
network copied, moved, and copied across programs with local declarations:
zero errors, unchanged prepared-baseline warnings, and exact native Save As
equality of all seven program payloads and every local field including offsets.
Actual VS Code clipboard copy, move-picker placement, cross-program clipboard
copy, save and undo were checked against exact generated file checkpoints.

IEC local address editing supports all 19 captured primitive memory mappings:

| Address | Width in bits | Types |
| --- | --- | --- |
| `%MX` | 1 | BOOL |
| `%MB` | 8 | BYTE, SINT, USINT |
| `%MW` | 16 | WORD, INT, UINT, DATE |
| `%MD` | 32 | DWORD, DINT, UDINT, REAL, TIME, TIME_OF_DAY |
| `%ML` | 64 | LWORD, LINT, ULINT, LREAL, DATE_AND_TIME |

Assigning, clearing, and remapping update address text and allocation metadata.
Validation rejects wrong address sizes, malformed numbers, overflow, and
overlapping mapped ranges across widths. Clearing and reassigning all 19
types recreates their native declarations exactly. Generated remaps passed
strict all-program XG5000 checking with zero errors, 27 baseline warnings and
42 messages; Save As preserves all seven program payloads and every local
field including offsets exactly. Actual VS Code remapping, save, and undo of
all 19 types matched generated file checkpoints; WASM matched Rust.
Automatically allocated BOOL, INT, UDINT, and TIME locals can also be assigned
explicit memory addresses. The writer updates their existing allocation and
storage class without changing program payloads or reallocating other locals.
Native Check completed with zero errors, 27 baseline warnings and 42 messages;
Save As preserves all seven program payloads and every local field including
offsets exactly. Actual VS Code assignment, save, and undo of all four types
matched the generated file and original baseline; WASM matched Rust.
Numeric I/O shapes, automatic allocation of new declarations, other automatic
types, arrays, structures, and full global declaration editing remain guarded.

### XGK string literals

Instruction prompts accept single-quoted ASCII string operands, preserving spaces,
commas and parentheses: `$MOV 'Room A, on' D100`. Literal permissions and device
restrictions come from the manual's string usage tables. String constants are
limited to 31 printable ASCII characters; destinations, unknown literal
permissions, non-ASCII strings and apostrophe escapes remain guarded.
Native $MOV/$MOVP captures passed Check Program with 0 errors and 0 warnings;
the Rust writer reproduces the full 683-byte saved payload without normalization.
PLC execution and non-ASCII literal encodings are not yet validated.

### Reviewed XGK CPU restrictions

Instruction completion filters documented model incompatibilities for 31
commands from InstructionHelp V3.5. For example, INLATCH and GETIP require
XGK-CPUUN/HN/SN. Insertion and instruction replacement also reject these
incompatibilities in the writer. Other instructions and unknown CPU models
keep their existing behavior. Firmware and module requirements still need
XG5000 Check Program validation.

### Output entry from blank XGK cells

Double-click a blank cell or press Enter to type OUT, SET, RST, OUTP, OUTN
or a catalog application such as MOV. Output instructions are placed at the
right output position of the same physical row, including lower branch rows.
Contacts still use the selected cell, and P/N remain contact pulse commands
in interior cells (use OUTP/OUTN for pulse coils). Existing outputs are
protected by the writer's occupied-cell checks.

### Editing variable table fields

Double-click a variable's **Name**, **Address**, or **Comment** cell to open
VS Code's text input. Names are unique without regard to case among global
variables, or within an IEC program's local table. Invalid names and unsupported
edits stay in the prompt with a validation message.

An occupied address offers a **Swap addresses / Cancel** notification. Swap
changes both addresses as one undoable edit; Cancel and dismiss leave the file
unchanged. IEC swaps require two mapped variables with matching areas and
allocation widths. Ambiguous or incompatible mappings remain guarded.
Global and IEC names and comments may grow or shrink up to 255 UTF-16 units.
Empty comments are supported; names remain nonempty and unique. Address-area
and data-type changes retain their existing writer restrictions.


### Growing ladder canvas

XGK blank rows grow as you scroll, up to 65,535 physical rows. Blank cells are
rendered around the visible area, keeping large sparse programs responsive.
Double-click or Enter inserts directly at the selected cell; scrolling alone
never changes the file. XGK coordinate handling and the extended row-count
header were verified in native XG5000 at physical rows 256 and 65534 with zero
Check Program errors or warnings and byte-identical program payloads after
Save As. IEC retains its separately validated coordinate range.

### Delete ladder selections

Select a horizontal or vertical wire and press Delete (or Backspace) to remove
that wire. The same keys delete selected contacts, coils, comparisons and
application/function blocks. IEC rectangular selections delete their supported
items in one undoable edit; if an item has an unsupported layout, the entire
edit is rejected. Lone IEC contacts/coils can also be removed without deleting
the physical row. Wire deletion keeps shared rows and unrelated elements and
can leave a circuit disconnected. VS Code Undo restores the edit.

IEC scalar BOOL output pins support horizontal wires. Select ENO or a comparison
OUT and press F5 or Enter, or double-click the pin; F5 at the following blank
cell extends the wire. Arithmetic and conversion OUT fields retain their numeric
destination. Comparisons accept two sources and an optional BOOL destination;
wiring OUT replaces that assignment. Unsupported block layouts remain guarded.

Select an OUT value and press Delete/Backspace to remove its assignment, or clear
it in the single-value editor. Double-click or Enter on the empty OUT pin opens
its destination input. F5 still wires BOOL outputs; numeric OUT needs a variable.

### Ladder edit performance

The browser reuses decoded ladder summaries for programs whose complete XML and
CPU model are unchanged. The cache keeps only the last summary, within the
existing program, byte, and item budgets; edits, Undo, and workspace changes
invalidate affected entries. Instruction prompts also reuse the last successful
validated edit when it is accepted against the same source bytes.

To measure parsing and an available IEC contact insertion locally:

```sh
node scripts/benchmark-ladder-edits.mjs /path/to/project.xgwx
```

The benchmark reports timings and counts without printing project contents.

Document broadcasts serialize the full byte array once and reuse it for all
sibling editors. The editing webview already has the new bytes, so it receives
no echo. To measure the extension's serialization work with 1, 2, and 4 sibling
editors using a synthetic 1 MiB document:

```sh
node scripts/benchmark-document-sync.cjs 1048576 30
```

This benchmark excludes VS Code IPC and webview parsing or rendering costs.

### Generate digital I/O variables

Use **Hardware → Generate I/O variables** after selecting modules. The preview
lists names, P addresses, BIT types, comments, and whether each variable is new,
unchanged, or will overwrite an existing variable. **Generate and overwrite
duplicates** replaces matching names, I/O source mappings, and occupied addresses;
unrelated variables remain. Cancel leaves the workspace unchanged, and generation
is one Undo step.

The current generator supports XGK global symbols, variable-point allocation,
and 18 digital module types captured in native XG5000. Analog channel variables,
IEC global symbols, fixed-point allocation, and unverified module layouts remain
unsupported. Allocation follows the [LS XGK instruction manual](https://www.ls-electric.com/upload/customer/download/c4090ad3-f6a5-424a-a5fd-ef46a70eecd8/XGK_XGB_Instructions_Manual_Eng_V2.2.pdf).

### SFC programs

Native SFC blocks open in a dedicated chart with initial/ordinary steps,
transitions, labels, jumps, Boolean variable actions, and ST program actions. Click an entity to inspect it.
Double-click or press Enter on an editable entity to open its native text
prompt, prefilled with its name or operand. Values are validated before Apply;
Cancel restores chart focus without changing the file.
Arrow-key navigation keeps Up/Down in the current column and Left/Right
in the current row. Drag or hold Shift while pressing arrows to select a
rectangle across rows and columns, including action boxes and **+ New Action**.
Shift+Arrow can also contract the selection; a plain arrow or Escape returns
to a single cell. Dragging near the viewport edges scrolls the chart.
Delete removes selected rows and actions as one undoable edit and keeps focus
in the chart. Empty action slots are ignored; deleting labels also removes
their jumps, and removing the initial step assigns the first remaining step.
Selection alone does not change the file. These shortcuts apply inside the chart, leaving property
inputs and modified shortcuts alone. Read-only charts still support navigation and selection.
Captured linear main blocks support adding rows after the selection (or at the
end), moving rows up/down, and deleting rows. **Create loop** builds a starter
chart in an empty project.

Edit step names/comments, the initial step, label/jump names, direct `%MX`
BOOL transitions, and one direct `%MX` action per step with N, R, S, L, D, P,
SD, DS, or SL qualifier. **+ New Action** appears beside steps without an action
and participates in arrow-key navigation. Click it or press Enter to choose
a Boolean variable or ST program action, then a qualifier and time for timed types.
Boolean actions use the same picker through Enter, double-click, or **Edit action**.
ST actions and transitions focus their source editor on Enter or double-click.
Timed types accept TIME literals such as `T#2s`, `T#500ms`, or `T#1m2s`.
An empty action operand removes it. Renaming a label updates its jumps;
deleting a label also deletes its jumps. Names use letters, digits, and
underscores, up to 32 characters, with unique step and label names. Save and
Undo use the normal custom document lifecycle; incomplete charts can be saved
and may report errors in XG5000 until completed.


All nine variable action qualifiers passed native XG5000 strict Check Program
and Save As retention checks (`libxgwx/fixtures/sfc/action-qualifiers*`).

Balanced alternative and simultaneous branches are editable. Select a step for
the canvas **+ Add simultaneous branch** control;
selecting a step puts the split immediately before that step and its action stack;
the following node becomes the first path. The canvas branch control appends
a path when a matching branch is already selected. Select a split for **Add path**. **Extend paths** adds a step/transition pair to every path.
**Extend selected path** adds a pair only to the selected lane, retaining empty
connector rows in the others. **Remove path pair** removes a pair after the first
node from that lane, including its step actions, while retaining the branch.
Select a split/join for **Remove branch**, retaining the first path. Delete on a
node inside a branch removes its entire path; removing one of two paths restores
a linear chart. Branch actions, Boolean conditions, ST sources, names and
comments use the existing inspectors and text editor. Arrow keys navigate across
paths and split/join endpoints. Branch deletion accepts a single selected node
or action boxes; ambiguous multi-path range deletion leaves the chart unchanged.

Nested/crossing branches, path gaps without connector rows, custom alternative priorities,
LD/IL program-backed conditions/actions, unknown qualifiers, bookmarks/breakpoints,
unknown properties, and program names remain read only.
Unsupported charts retain the existing bounded comment/condition edits.
Unknown entity types are preserved and shown as placeholders; their connections
are not inferred. Creating a chart from the blank XGI-CPUE template, deleting
a step/transition pair, and changing names, operands, actions, and initial-step
status pass XG5000 4.82.1 strict all-program Check Program with 0 errors and
0 warnings. Native Save As preserves the row model and local symbol payloads;
XG5000 regenerates compiled internal names.

SFC action and transition programs can be created and edited as Structured Text.
Select a step/action or transition and choose **Create ST action** or
**Create ST transition**; edit the ST text editor beside the chart and apply it. Transitions assign a
Boolean expression to `TRANS`. **Use Boolean variable** converts the selected
reference back to an operand. Shared programs update all matching references.
ST edits participate in Save and Undo. XG5000 **Check Program** performs the ST
syntax and type check; the webview validates file structure and declarations, and provides bounded local ST diagnostics.

**Program variables** declares BOOL, BYTE/WORD/DWORD/LWORD, signed and unsigned
8/16/32/64-bit integers, REAL/LREAL, TIME, DATE, TIME_OF_DAY, and DATE_AND_TIME.
Named BOOL declarations can be used directly as chart actions and transitions.
The reserved `TRANS` and `GOTO_INIT` records cannot be changed. Removing a
referenced declaration is rejected. Existing allocation records are preserved.

Function block instances include TON, TOF, TP, CTU_DINT, CTD_DINT, CTUD_DINT,
R_TRIG, F_TRIG, RS, and SR. Declare an instance, then write its call using
autocomplete for the instance name and named parameters. Common functions
such as ADD are also available through autocomplete. Blocks retain state
between scans. N actions run each active
scan and P actions run once on activation. LD action-program editing, arrays,
structures, strings, and custom FB declarations remain outside this verified writer.

The ST text editor has line numbers, a cursor-position display, Tab/Shift+Tab
indentation, and Enter auto-indentation. Autocomplete matches declared variables,
function block instances, ST keywords, types, and common functions. Type
`Instance.` to suggest member pins, or type a named parameter inside an instance
call. Use Up/Down and Enter/Tab to accept, Escape to dismiss, and Ctrl+Space to
request suggestions. Comments and strings do not trigger suggestions. Drafts are
retained when switching chart selections and adding declarations; Apply commits
the source through the existing SFC writer. Narrow layouts put the editor below
the chart. Source editing and autocomplete keys stay inside the text editor.

Steps support multiple independent variable or ST actions. The italic **+ New
Action** remains available beneath the action stack and can be reached with arrow
keys and Enter. Each action retains its own qualifier, timer, and source. The
inspector can reorder actions; Delete removes selected action boxes and promotes
remaining actions without deleting their step. Removing or moving a linear step
includes its action stack. Branch paths use native continuation padding so adding
an action preserves every other path. Empty padding is removed when no path needs
it. Shared ST action names continue to share one source program.

Mixed ST/variable stacks in linear and simultaneous-branch charts passed native
XG5000 strict Check Program and Save As retention checks; UI interaction checks
use the rendered webview with a mocked VS Code host. Supported qualifiers remain
N/R/S/L/D/P/SD/DS/SL. Post-scan actions and unsupported native metadata remain
read only. XG5000 limits each program to 512 ordinary steps and 65,535
rows/columns; branches have no independent count cap. The editor separately
limits dense grids to 1,048,576 cells. A simultaneous branch can therefore have
511 single-step paths when its only other step is the initial step.

The declaration editor supports **Edit**, **Apply declaration**, and **Cancel
editing**, plus Retain and initial values. Arrays use up to three zero-based
inclusive bounds, for example `0..3` or `0..1, 0..2`. Initial values accept a
comma-separated prefix or repetition such as `4(2)`; remaining elements keep
their defaults. The editor validates BOOL, integer, real and TIME literals and
quoted ASCII STRING values (32 bytes). Array types appear in ST completions.
Referenced declarations keep their type and bounds; initial values, Retain and
descriptions remain editable. System declarations, mapped declarations,
custom structures, STRING/FB arrays, sparse initializers and uncaptured member
overrides remain guarded. Native validation covers a mixed project using 1D,
2D and 3D arrays in ST, retained variables and a retained TON instance, scalar
initial values and STRING, followed by strict checking and Save As comparison.


SFC chart clipboard operations use Ctrl/Cmd+C, X, and V when the chart has focus. Copying a step includes its full
action stack; copying action boxes appends their saved actions to the selected
step. Other selections copy the whole physical row span, including all branch
lanes. Include both split and join to copy a branch, and paste outside an existing
branch. Rows insert after the selected row or complete step/action stack.

The in-app clipboard persists between project/program selections in this webview.
Paste preserves comments, qualifiers, timers and saved ST source, makes copied
step/label/program names unique, and remaps copied label/jump pairs. Existing
initial steps are retained. Declarations are not copied: the destination must
already provide referenced variables. ST source remains verbatim; references
inside it keep their original meaning. Read-only layouts, incomplete branch spans,
missing jump labels and incompatible destination declarations are rejected before
an edit is applied. Cut and paste use the usual document undo/redo path. Text
editor clipboard shortcuts retain their normal behavior.

A pasted simultaneous branch with stacked actions passed native XG5000 4.82.1
all-program checks with zero errors. Duplicate-coil checking reported preserved
output operands used by both copies. Native Save As retained the complete row
set, saved ST programs and declarations exactly. Rendered keyboard/toolbar QA
uses a mocked VS Code host; document undo/redo uses the existing host edit bridge.


ST editors show **Local ST** diagnostics as you type. Click a diagnostic to select
its source range. Checks recognize nested comments and quoted strings, balanced
parentheses/brackets, IF/CASE/loop block boundaries, common missing semicolons,
missing assignment expressions, unknown local/global variables, captured FB pins
and parameter directions, simple BOOL literal assignments, constant array bounds,
and missing TRANS assignments in transition programs. Simple inline scalar
VAR declarations are recognized too. Declared global variables also participate
in autocomplete; local declarations take precedence in diagnostic lookup.

Diagnostics are advisory and do not disable Apply or change project bytes.
They inspect saved source and current drafts, clear after corrections, and show
at most 100 issues. This is not a full ST parser/type checker: custom types and
function signatures, expression inference, dynamic indices, control-flow coverage,
and CPU-specific instruction support still require native XG5000 Check Program.
No issues found means only that the supported local checks found none.

Captured FB pin checks and autocomplete share one table, including latch output
`Q`. Input `:=` and output `=>` call conventions and latch pins are checked
against the [LS instruction manual](https://ssq.ls-electric.com/uploads/document/16411827948890/XGI_XGR_XEC_XMC_Instruction_Manual_202012_V3.8_EN.pdf),
sections RS/SR and ST parameter calls.

The chart toolbar omits Add alternative branch. The inspector omits Add action
and Delete action buttons; use the canvas **+ New Action** affordance and the Delete key.

Step-row hover or step selection by click/arrow keys reveals **+ New Action** and **+ Add simultaneous branch** beside
the action area. Both remain keyboard reachable; simultaneous creation occurs
before the selected step. Initial steps and unsupported entry/exit layouts keep
branch creation disabled, and nested branch creation stays guarded. The inspector
omits Add simultaneous branch. Touch surfaces show the affordances directly.


### ST and IL programming

Open a supported `.xgwx`, select a standalone ST or IL program in the tree, and edit
its source. The program inspector provides local declarations, including
primitive variables, arrays, initial values, Retain, STRING and supported
function-block instances. Create ST/IL programs through the program tree's
**Create program** command. **New File → XGWX** includes XGI, XGK Auto-allocation ST, XGK vendor IL, XEC-E/H/S/U, XEM-H2/HP, GIPAM, KL and XGR-CPUH text projects.

XGK ST requires an Auto-allocation project and supports captured scalar declarations. Its variable type codes and native D allocation differ from IEC declarations. Arrays, STRING, timer/counter instances, initial values and Retain remain guarded for XGK. Classic XGK offers LD and vendor IL; the IL view writes native ladder records. Use **Edit XGK IL** / **Show ladder** to switch views. Series contacts, edge operators, outputs and validated catalog application instructions are editable. Branch/comment programs and Auto-allocation ladder IL remain read only in the text view; use the ladder editor for those programs.

XEC, XEM, GIPAM, KL and XGR source projects use the captured IEC ST/IL layouts and declarations. XGI-CPUS/P is excluded from source creation and conversion because its native profile was absent from the installed XG5000 CPU chooser.

The text editor provides line numbers, indentation, declaration completions,
and advisory diagnostics. **Ctrl+Space** requests completions; **Ctrl+Enter**
applies source. Drafts survive switching between programs. Click **Apply ST
source** or **Apply IL source** before saving; applied source and declaration
changes participate in the custom document's Undo, Redo, Save and Save As.
Referenced declarations cannot be deleted or have their type/bounds changed.
Source retains its existing CRLF convention when edited.

Standalone `.st` and `.il` files also have VS Code language modes, syntax
highlighting, comment/bracket support and snippets. IL uses IEC operators such
as `LD`, `ST`, `AND`, `JMPC` and `CAL`.

The source writer checks the original program identity, language and source,
limits code to 65536 UTF-16 units, and keeps unknown layouts, encryption and
bookmark/breakpoint metadata read only. Local checks cover a limited set of
mistakes; use XG5000 **Check Program** for full syntax and type validation.


Native acceptance on XG5000 4.82.1: four generated ST/IL programs passed strict
syntax and type checks with **0 errors and 0 warnings**. Native Save As retained
all sources, program identities and declarations. Fixtures and screenshots are
in the companion library's `fixtures/text-programs/`. Rendered editing,
declaration forms, drafts, completions and persisted-byte Undo/Redo simulation
were checked in a local webview harness at desktop and compact sizes; the VS
Code host was mocked for those browser checks.


Standalone IEC IL programs use IEC operators; the XGK IL view uses the vendor dialect. XGK-CPUSN uses the vendor ladder/IL
mnemonics documented in the [LS XGK/XGB instruction manual](https://www.ls-electric.com/upload/customer/download/1375/XGK_XGB_Instruction_English_Manual_V2.0.pdf),
including LOAD, OUT, AND NOT, LOADP and LOADN. The editor reports recognized XGK
mnemonics in IEC IL source; it does not automatically translate instructions.
In particular, XGK ANDN is a falling-edge contact while IEC IL ANDN means
negated AND. The CPU picker changes XGI models and preserves the existing dialect.
