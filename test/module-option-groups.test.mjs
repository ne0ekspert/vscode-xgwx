import assert from "node:assert/strict";
import test from "node:test";

import { groupModuleOptions } from "../media/module-option-groups.js";

test("groups repeated channel settings by channel", () => {
  const groups = groupModuleOptions([
    { key: "range", label: "Range", section: "", scope: "channel", count: 2 },
    { key: "format", label: "Format", section: "", scope: "channel", count: 2 },
    { key: "outputMode", label: "Output mode", section: "", scope: "module", count: 1 },
  ]);

  assert.deepEqual(groups.map(({ section, channelIndex }) => ({ section, channelIndex })), [
    { section: "", channelIndex: 0 },
    { section: "", channelIndex: 1 },
    { section: "", channelIndex: null },
  ]);
  assert.deepEqual(groups[0].items.map(({ option, index }) => [option.key, index]), [
    ["range", 0],
    ["format", 0],
  ]);
  assert.deepEqual(groups[1].items.map(({ option, index }) => [option.key, index]), [
    ["range", 1],
    ["format", 1],
  ]);
  assert.equal(groups[2].items[0].option.key, "outputMode");
});

test("keeps input and output channels in separate section groups", () => {
  const groups = groupModuleOptions([
    { key: "input.range", label: "Range", section: "input", scope: "channel", count: 2 },
    { key: "input.filter", label: "Filter", section: "input", scope: "channel", count: 2 },
    { key: "output.range", label: "Range", section: "output", scope: "channel", count: 2 },
    { key: "output.type", label: "Type", section: "output", scope: "channel", count: 2 },
  ]);

  assert.deepEqual(groups.map(({ section, channelIndex }) => [section, channelIndex]), [
    ["input", 0],
    ["input", 1],
    ["output", 0],
    ["output", 1],
  ]);
  assert.deepEqual(groups[2].items.map(({ option }) => option.key), ["output.range", "output.type"]);
});

test("does not add a channel group to a single-channel module", () => {
  const groups = groupModuleOptions([
    { key: "range", label: "Range", section: "input", scope: "channel", count: 1 },
    { key: "filter", label: "Filter", section: "input", scope: "channel", count: 1 },
  ]);

  assert.equal(groups.length, 1);
  assert.equal(groups[0].section, "input");
  assert.equal(groups[0].channelIndex, null);
  assert.ok(groups[0].items.every(({ groupedByChannel }) => !groupedByChannel));
});
