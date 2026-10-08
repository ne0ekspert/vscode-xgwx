# Blank XG5000 projects

Created and saved with native XG5000 on 2026-10-05:

- `new-xgk.xgwx`: XGK-CPUSN, XGK Ladder Diagram.
- `new-xgi.xgwx`: XGI-CPUE, IEC Ladder Diagram.

Created and saved with native XG5000 4.82.1 on 2026-10-08:

- `new-xgi-sfc.xgwx`: XGI-CPUE, Sequential Function Chart, empty main block.

All templates contain project `NewProject`, PLC `LSPLC`, and empty program `NewProgram`.
They contain no user application or smart-home project data. Untouched ladder
ProgramData decodes to an eight-byte zero header. XG5000 reports an empty-program
error until instructions are added; this is expected for a new blank project.
The blank SFC template reopens in XG5000 and reports `E0000` (empty program)
and `E4001` (no initial step), with no warnings, under strict all-program checking.
Native Save As preserves its SFC tree and local symbol payloads.
It contains no sample steps, transitions, actions, or user variables. Chart
structure can be added with **Create loop** or the row controls in the SFC view.

The New File command copies these native templates without changing their
internal project identities. CPU and project metadata can be edited afterward.
