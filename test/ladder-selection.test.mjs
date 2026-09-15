import assert from "node:assert/strict";
import test from "node:test";

import {
  ladderSelectionKeys,
  moveLadderCursor,
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

test("arrow movement lands on rung comments and returns to the ladder column", () => {
  const layoutRows = [
    { type: "comment", comment: { rawY: 0 } },
    { type: "rung", rawY: 4 },
    { type: "rung", rawY: 8 },
  ];
  assert.deepEqual(moveLadderCursor(
    layoutRows, { type: "rung", rawY: 4, column: 3 }, "ArrowUp",
  ), { type: "comment", rawY: 0, column: 3 });
  assert.deepEqual(moveLadderCursor(
    layoutRows, { type: "comment", rawY: 0, column: 3 }, "ArrowDown",
  ), { type: "rung", rawY: 4, column: 3 });
});
