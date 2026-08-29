import assert from "node:assert/strict";
import test from "node:test";

import {
  blankLadderCellText,
  ladderSelectionKeys,
  moveLadderPosition,
} from "../media/ladder-selection.js";

const rows = [0, 4, 12];

test("arrow movement follows ladder rows and clamps at the board edges", () => {
  assert.deepEqual(moveLadderPosition(rows, { rawY: 4, column: 3 }, "ArrowUp"), {
    rawY: 0,
    rowIndex: 0,
    column: 3,
  });
  assert.deepEqual(moveLadderPosition(rows, { rawY: 12, column: 9 }, "ArrowRight"), {
    rawY: 12,
    rowIndex: 2,
    column: 9,
  });
});

test("range selection includes every grid position in its rectangle", () => {
  const keys = ladderSelectionKeys(
    rows,
    { rawY: 0, column: 2 },
    { rawY: 4, column: 4 },
  );
  assert.deepEqual([...keys], ["0:2", "0:3", "0:4", "4:2", "4:3", "4:4"]);
});

test("deletion preserves the source text UTF-16 storage length", () => {
  assert.equal(blankLadderCellText("M00000"), "      ");
  assert.equal(blankLadderCellText("A😀B").length, 4);
});
