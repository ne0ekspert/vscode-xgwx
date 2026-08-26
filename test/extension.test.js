const assert = require("node:assert/strict");
const Module = require("node:module");
const path = require("node:path");
const test = require("node:test");

class MockEventEmitter {
  constructor() {
    this.listeners = new Set();
    this.event = (listener) => {
      this.listeners.add(listener);
      return { dispose: () => this.listeners.delete(listener) };
    };
  }

  fire(value) {
    this.listeners.forEach((listener) => listener(value));
  }
}

const files = new Map();
const writes = [];
const mockVscode = {
  EventEmitter: MockEventEmitter,
  Uri: {
    parse: (value) => ({ value, toString: () => value }),
  },
  workspace: {
    fs: {
      readFile: async (uri) => Uint8Array.from(files.get(uri.toString()) || []),
      writeFile: async (uri, bytes) => {
        const value = Uint8Array.from(bytes);
        files.set(uri.toString(), value);
        writes.push([uri.toString(), value]);
      },
      delete: async (uri) => files.delete(uri.toString()),
    },
  },
};

const originalLoad = Module._load;
Module._load = function load(request, parent, isMain) {
  if (request === "vscode") return mockVscode;
  return originalLoad.call(this, request, parent, isMain);
};
const { XgwxDocument, XgwxEditorProvider, bytesEqual } = require(path.resolve(__dirname, "../extension.js"));
Module._load = originalLoad;

function uri(value) {
  return { fsPath: value, path: value, toString: () => value };
}

test("editable document participates in dirty, undo, redo, save, and backup lifecycle", async () => {
  const target = uri("/workspace/program.xgwx");
  const document = new XgwxDocument(target, [1, 2, 3]);
  const provider = new XgwxEditorProvider({});
  const changes = [];
  provider.onDidChangeCustomDocument((event) => changes.push(event));

  provider.updateDocument(document, [1, 9, 3], "Edit ladder cell");
  assert.equal(document.dirty, true);
  assert.equal(changes.length, 1);
  assert.equal(changes[0].label, "Edit ladder cell");

  await changes[0].undo();
  assert.equal(document.dirty, false);
  assert.equal(bytesEqual(document.bytes, Uint8Array.from([1, 2, 3])), true);
  await changes[0].redo();
  assert.equal(document.dirty, true);

  await provider.saveCustomDocument(document);
  assert.equal(document.dirty, false);
  assert.deepEqual(Array.from(writes.at(-1)[1]), [1, 9, 3]);

  const destination = uri("/backup/program.xgwx");
  const backup = await provider.backupCustomDocument(document, { destination });
  assert.equal(backup.id, destination.toString());
  assert.deepEqual(Array.from(files.get(destination.toString())), [1, 9, 3]);
  await backup.delete();
  assert.equal(files.has(destination.toString()), false);
});

test("opening a hot-exit backup restores its dirty state against disk", async () => {
  const target = uri("/workspace/recovered.xgwx");
  const backup = uri("/backup/recovered.xgwx");
  files.set(target.toString(), Uint8Array.from([4, 5, 6]));
  files.set(backup.toString(), Uint8Array.from([4, 8, 6]));
  const provider = new XgwxEditorProvider({});

  const document = await provider.openCustomDocument(target, { backupId: backup.toString() });
  assert.equal(document.dirty, true);
  assert.deepEqual(Array.from(document.bytes), [4, 8, 6]);
  assert.deepEqual(Array.from(document.savedBytes), [4, 5, 6]);
});
