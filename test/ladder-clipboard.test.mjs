import assert from "node:assert/strict";
import test from "node:test";

import {
  captureLadderSelection,
  planLadderPaste,
} from "../media/ladder-clipboard.js";

const rows = [0, 4, 8];
const normallyOpen = { kind: "NormallyOpen", operand: "M1" };
const normallyClosed = { kind: "NormallyClosed", operand: "M2" };

test("captures a rectangular selection while retaining blank positions", () => {
  const clipboard = captureLadderSelection(
    rows,
    { rawY: 0, column: 1 },
    { rawY: 4, column: 2 },
    [
      { rawY: 0, column: 1, element: normallyOpen },
      { rawY: 4, column: 2, element: normallyClosed },
    ],
  );

  assert.deepEqual(clipboard, {
    rowCount: 2,
    columnCount: 2,
    cells: [
      { rowOffset: 0, columnOffset: 0, element: normallyOpen },
      { rowOffset: 1, columnOffset: 1, element: normallyClosed },
    ],
  });
});

test("plans an anchored block paste that also clears copied blank positions", () => {
  const clipboard = captureLadderSelection(
    rows,
    { rawY: 0, column: 1 },
    { rawY: 4, column: 2 },
    [
      { rawY: 0, column: 1, element: normallyOpen },
      { rawY: 4, column: 2, element: normallyClosed },
    ],
  );
  const edits = planLadderPaste(clipboard, rows, { rawY: 4, column: 4 }, [
    { rawY: 4, column: 5, element: normallyClosed },
  ]);

  assert.deepEqual(edits, [
    { rawY: 4, column: 4, expected: null, replacement: normallyOpen },
    { rawY: 4, column: 5, expected: normallyClosed, replacement: null },
    { rawY: 8, column: 5, expected: null, replacement: normallyClosed },
  ]);
});

test("rejects unsupported cells, overflow, and contacts pasted into the coil column", () => {
  assert.throws(() => captureLadderSelection(
    rows,
    { rawY: 0, column: 1 },
    { rawY: 0, column: 1 },
    [{ rawY: 0, column: 1, element: null }],
  ), /read-only instruction/);

  const clipboard = captureLadderSelection(
    rows,
    { rawY: 0, column: 1 },
    { rawY: 0, column: 1 },
    [{ rawY: 0, column: 1, element: normallyOpen }],
  );
  assert.throws(() => planLadderPaste(clipboard, rows, { rawY: 8, column: 9 }, []), /compatible columns/);
  assert.throws(() => planLadderPaste(
    { ...clipboard, rowCount: 2 }, rows, { rawY: 8, column: 1 }, [],
  ), /do not fit/);
  assert.throws(() => planLadderPaste(clipboard, rows, { rawY: 4, column: 2 }, [
    { rawY: 4, column: 2, element: null },
  ]), /read-only instruction/);
});
