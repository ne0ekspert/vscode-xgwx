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
const { XgwxDocument, XgwxEditorProvider, bytesEqual, promptIecContact } = require(path.resolve(__dirname, "../extension.js"));
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

test("an edit updates sibling editors without echoing bytes to its source", async () => {
  const target = uri("/workspace/shared.xgwx");
  const document = new XgwxDocument(target, [1, 2, 3]);
  const provider = new XgwxEditorProvider({});
  const sourceMessages = [];
  const siblingMessages = [];
  const source = {
    document,
    panel: { webview: { postMessage: async (message) => sourceMessages.push(message) } },
  };
  const sibling = {
    document,
    panel: { webview: { postMessage: async (message) => siblingMessages.push(message) } },
  };
  provider.editors.add(source);
  provider.editors.add(sibling);

  provider.updateDocument(document, [1, 9, 3], "Edit once", source);
  await new Promise((resolve) => setImmediate(resolve));

  assert.equal(sourceMessages.length, 0);
  assert.equal(siblingMessages.length, 1);
  assert.equal(siblingMessages[0].type, "load");
  assert.deepEqual(siblingMessages[0].bytes, [1, 9, 3]);
});

test("native contact prompt accepts suggestions and free text, and cancels without a value", async () => {
  let picker;
  mockVscode.window = { createQuickPick: () => {
    picker = {
      activeItems: [], items: [],
      onDidChangeValue(callback) { this.changed = callback; },
      onDidAccept(callback) { this.accepted = callback; },
      onDidHide(callback) { this.hidden = callback; },
      set value(value) { this._value = value; this.changed?.(value); },
      get value() { return this._value; },
      show() {}, dispose() {},
    };
    return picker;
  } };
  const suggested = promptIecContact("%MX709", ["%MX709", "%MX710"], 3);
  picker.value = "%MX71";
  assert.deepEqual(picker.items.map((item) => item.label), ["%MX71", "%MX710"]);
  picker.activeItems = [picker.items[1]];
  picker.accepted();
  assert.equal(await suggested, "%MX710");

  const typed = promptIecContact("%MX709", ["%MX709"], 3);
  picker.value = "NewBool";
  picker.activeItems = [picker.items[0]];
  picker.accepted();
  assert.equal(await typed, "NewBool");

  const canceled = promptIecContact("%MX709", [], 3);
  picker.hidden();
  assert.equal(await canceled, undefined);
});

test("closing the native contact picker returns focus to its webview", async () => {
  let picker;
  mockVscode.window = { createQuickPick: () => {
    picker = {
      activeItems: [], items: [],
      onDidChangeValue(callback) { this.changed = callback; },
      onDidAccept(callback) { this.accepted = callback; },
      onDidHide(callback) { this.hidden = callback; },
      set value(value) { this._value = value; this.changed?.(value); },
      get value() { return this._value; },
      show() {}, dispose() {},
    };
    return picker;
  } };
  mockVscode.Uri.joinPath = (root, ...parts) => ({ toString: () => `${root}/${parts.join("/")}` });
  const provider = new XgwxEditorProvider({ extensionUri: "/extension" });
  const document = new XgwxDocument(uri("/workspace/program.xgwx"), [1, 2, 3]);
  const messages = [];
  const reveals = [];
  let receive;
  const panel = {
    visible: true,
    webview: {
      cspSource: "test-source",
      asWebviewUri: (value) => value,
      onDidReceiveMessage(callback) { receive = callback; return { dispose() {} }; },
      async postMessage(message) { messages.push(message); },
    },
    reveal(...args) { reveals.push(args); },
    onDidDispose() {},
  };
  await provider.resolveCustomEditor(document, panel);
  const pending = receive({ type: "promptIecContact", requestId: 42,
    value: "%MX709", suggestions: [], rowIndex: 3 });
  picker.hidden();
  await pending;
  assert.deepEqual(reveals, [[undefined, false]]);
  assert.deepEqual(messages, [{ type: "iecContactInputResult", requestId: 42, value: null }]);
});
