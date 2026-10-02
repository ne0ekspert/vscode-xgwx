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
const { XgwxDocument, XgwxEditorProvider, bytesEqual, promptIecContact, promptLadderInsertion, promptInstruction } = require(path.resolve(__dirname, "../extension.js"));
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


test("native insertion picker collects element choices and text, and cancels at either stage", async () => {
  const actions = [{ label: "Contact", fields: [
    { label: "Kind", value: "NO", choices: [{ label: "Normally open", value: "NO" }, { label: "Normally closed", value: "NC" }] },
    { label: "Operand", value: "%MX0" },
  ] }];
  const calls = [];
  mockVscode.window = {
    showQuickPick: async (items, options) => {
      calls.push(options);
      return items[items.length - 1];
    },
    showInputBox: async (options) => {
      assert.equal(options.prompt, "Operand");
      assert.ok(options.validateInput("bad\noperand"));
      assert.equal(options.validateInput("%MX42"), undefined);
      return "%MX42";
    },
  };
  assert.deepEqual(await promptLadderInsertion(actions, "Insert"), { actionIndex: 0, values: ["NC", "%MX42"] });
  assert.equal(calls.length, 2);
  mockVscode.window.showQuickPick = async () => undefined;
  assert.equal(await promptLadderInsertion(actions, "Insert"), undefined);
  mockVscode.window.showQuickPick = async (items) => items[0];
  mockVscode.window.showInputBox = async () => undefined;
  assert.equal(await promptLadderInsertion(actions, "Insert"), undefined);
});


test("webview ready sent during HTML assignment loads the document", async () => {
  mockVscode.Uri.joinPath = (root, ...parts) => ({ toString: () => `${root}/${parts.join("/")}` });
  const provider = new XgwxEditorProvider({ extensionUri: "/extension" });
  const document = new XgwxDocument(uri("/workspace/startup.xgwx"), [1, 2, 3]);
  const messages = [];
  let receive;
  let handshake;
  const panel = {
    webview: {
      cspSource: "test-source",
      asWebviewUri: (value) => value,
      onDidReceiveMessage(callback) { receive = callback; return { dispose() {} }; },
      async postMessage(message) { messages.push(message); },
      set html(value) {
        assert.match(value, /Loading XGWX parser/);
        assert.equal(typeof receive, "function", "ready listener must exist before HTML starts");
        handshake = receive({ type: "ready" });
      },
    },
    onDidDispose() {},
  };
  await provider.resolveCustomEditor(document, panel);
  await handshake;
  assert.equal(messages.length, 1);
  assert.equal(messages[0].type, "load");
  assert.deepEqual(messages[0].bytes, [1, 2, 3]);
});


test("instruction prompt changes operand hints, completes variables, and returns existing writer fields", async () => {
  let picker;
  mockVscode.window = { createQuickPick: () => (picker = {
    activeItems: [], items: [],
    onDidChangeValue(callback) { this.changed = callback; },
    onDidAccept(callback) { this.accepted = callback; },
    onDidHide(callback) { this.hidden = callback; },
    set value(value) { this._value = value; this.changed?.(value); },
    get value() { return this._value; },
    show() {}, dispose() {},
  }) };
  const instruction = { choices: [
    { mnemonic: "MOV", operandCount: 2 }, { mnemonic: "ADD", operandCount: 3 },
    { mnemonic: "=", operandCount: 2 },
  ], suggestions: [{ value: "D100", description: "Temperature · WORD" },
    { value: "D200", description: "Target · WORD" }] };
  const result = promptInstruction(instruction, "Insert");
  picker.value = "MO";
  assert.equal(picker.items[0].label, "MOV");
  picker.accepted();
  assert.equal(picker.value, "MOV ");
  assert.match(picker.title, /Source operand/);
  assert.equal(picker.items[0].label, "MOV D100");
  picker.accepted();
  assert.equal(picker.value, "MOV D100 ");
  assert.match(picker.title, /Destination operand/);
  picker.value = "MOV D100 D2";
  const match = picker.items.find(item => item.completion === "MOV D100 D200");
  assert.ok(match);
  picker.activeItems = [match];
  picker.accepted();
  assert.equal(picker.value, "MOV D100 D200");
  picker.accepted();
  assert.deepEqual(await result, ["MOV", "D100, D200"]);

  const arithmetic = promptInstruction(instruction, "Insert");
  picker.value = "ADD 1 ";
  assert.match(picker.title, /Second source operand/);
  picker.value = "ADD 1 2 ";
  assert.match(picker.title, /Destination operand/);
  picker.value = "ADD 1 2 D200 extra";
  assert.equal(picker.items.some(item => item.insert), false);
  picker.value = "ADD 1 2 D200";
  picker.accepted();
  assert.deepEqual(await arithmetic, ["ADD", "1, 2, D200"]);

  const comparison = promptInstruction(instruction, "Insert");
  picker.value = "= D100 ";
  assert.match(picker.title, /Second source operand/);
  picker.hidden();
  assert.equal(await comparison, undefined);
  const reopened = promptInstruction(instruction, "Insert");
  picker.value = "MOV 123 D200";
  picker.accepted();
  assert.deepEqual(await reopened, ["MOV", "123, D200"]);

  const edit = promptInstruction({ ...instruction, value: "= D100 D200" }, "Edit comparison");
  assert.equal(picker.value, "= D100 D200");
  picker.accepted();
  assert.deepEqual(await edit, ["=", "D100, D200"]);
});

test("function insertion routes the command picker into the existing field bridge", async () => {
  let picker;
  mockVscode.window = {
    showQuickPick: async items => items[0],
    createQuickPick: () => (picker = {
      activeItems: [], items: [],
      onDidChangeValue(callback) { this.changed = callback; },
      onDidAccept(callback) { this.accepted = callback; },
      onDidHide(callback) { this.hidden = callback; },
      set value(value) { this._value = value; this.changed?.(value); },
      get value() { return this._value; },
      show() {}, dispose() {},
    }),
  };
  const result = promptLadderInsertion([{ label: "Function block", fields: [],
    instruction: { choices: [{ mnemonic: "MOVE", operandCount: 2 }],
      suggestions: [{ value: "Target", description: "INT" }] } }], "Insert");
  await new Promise(resolve => setImmediate(resolve));
  picker.value = "MOVE 1 Target";
  picker.accepted();
  assert.deepEqual(await result, { actionIndex: 0, values: ["MOVE", "1, Target"] });
});

test("manual operand rules filter symbols, change type hints, and prevent invalid insertion", async () => {
  let picker;
  mockVscode.window = { createQuickPick: () => (picker = {
    activeItems: [], items: [],
    onDidChangeValue(callback) { this.changed = callback; },
    onDidAccept(callback) { this.accepted = callback; },
    onDidHide(callback) { this.hidden = callback; },
    set value(value) { this._value = value; this.changed?.(value); },
    get value() { return this._value; }, show() {}, dispose() {},
  }) };
  const source = { label: 'S', dataTypes: ['INT'], allowsConstant: true,
    deviceAreas: ['PMK','D','R','F'] };
  const destination = { label: 'D', dataTypes: ['REAL'], allowsConstant: false,
    deviceAreas: ['PMK','D','R'] };
  const result = promptInstruction({ choices: [{ mnemonic: 'I2R', operandCount: 2,
    operandRules: [source, destination] }], suggestions: [
    { value: 'D100', dataType: 'WORD' }, { value: 'D200', dataType: 'REAL' },
    { value: 'M0000A', dataType: 'BIT' }, { value: 'D300', dataType: 'DWORD' },
  ] }, 'Insert');
  picker.value = 'I2R ';
  assert.match(picker.title, /Source operand · INT/);
  assert.deepEqual(picker.items.map(item => item.label), ['I2R D100']);
  picker.value = 'I2R D100 ';
  assert.match(picker.title, /Destination operand · REAL/);
  assert.deepEqual(picker.items.map(item => item.label), ['I2R D100 D200']);
  picker.value = 'I2R D100 1';
  assert.match(picker.title, /use a device, not a constant/);
  assert.equal(picker.items.some(item => item.insert), false);
  picker.accepted();
  picker.value = 'I2R D100 F100';
  assert.match(picker.title, /devices are not permitted/);
  assert.equal(picker.items.some(item => item.insert), false);
  // A raw D address can span REAL storage even without a declared REAL symbol.
  picker.value = 'I2R D100 D400';
  picker.accepted();
  assert.deepEqual(await result, ['I2R', 'D100, D400']);
});


test("direct instruction prompt canonicalizes aliases, validates before closing and reopens", async () => {
  let picker;
  mockVscode.window = { createQuickPick: () => (picker = {
    activeItems: [], items: [], disposed: false,
    onDidChangeValue(callback) { this.changed = callback; },
    onDidAccept(callback) { this.accepted = callback; },
    onDidHide(callback) { this.hidden = callback; },
    set value(value) { this._value = value; this.changed?.(value); },
    get value() { return this._value; }, show() {}, dispose() { this.disposed = true; },
  }), showQuickPick() { throw Error("No action chooser should open"); } };
  const instruction = { structuredResult: true, mode: "edit", value: "NO Start",
    choices: [{mnemonic:"NO",aliases:["A"],operandCount:1}, {mnemonic:"NC",aliases:["B"],operandCount:1},
      {mnemonic:"INV",operandCount:0}], suggestions: [] };
  const seen=[];
  const result=promptInstruction(instruction,"Edit",async value=>{
    seen.push(value);return value.operands[0]==="Bad" ? "Unsupported BOOL operand" : undefined;
  });
  assert.equal(picker.value,"NO Start");
  assert.equal(picker.items[0].description,"Apply instruction");
  picker.value="b Bad";await picker.accepted();
  assert.equal(picker.disposed,false);assert.match(picker.title,/Unsupported BOOL/);
  assert.deepEqual(seen[0],{command:"NC",operands:["Bad"]});
  picker.value="b Start";await picker.accepted();
  assert.deepEqual(await result,{command:"NC",operands:["Start"]});
  const cancelled=promptInstruction(instruction,"Edit");picker.hidden();assert.equal(await cancelled,undefined);
  const reopened=promptInstruction({...instruction,value:"INV"},"Edit");await picker.accepted();
  assert.deepEqual(await reopened,{command:"INV",operands:[]});
});


test("direct editor validates through the webview before returning one command and restoring focus", async () => {
  let picker, receive;
  const messages=[], reveals=[];
  mockVscode.window = { createQuickPick: () => (picker = {
    activeItems: [], items: [], disposed:false,
    onDidChangeValue(callback) { this.changed=callback; }, onDidAccept(callback) { this.accepted=callback; },
    onDidHide(callback) { this.hidden=callback; },
    set value(value) { this._value=value;this.changed?.(value); }, get value() { return this._value; },
    show() {}, dispose() { this.disposed=true; },
  }), showQuickPick() { throw Error("Unexpected action chooser"); } };
  const document=new XgwxDocument(uri("/workspace/direct.xgwx"),[1,2,3]);
  const provider=new XgwxEditorProvider({});
  const panel={visible:true,webview:{cspSource:"test",asWebviewUri:value=>value,
    onDidReceiveMessage(callback){receive=callback;return{dispose(){}};},async postMessage(message){messages.push(message);}},
    reveal(...args){reveals.push(args);},onDidDispose(){}};
  await provider.resolveCustomEditor(document,panel);
  const pending=receive({type:"promptLadderInstruction",requestId:7,title:"Edit",instruction:{mode:"edit",value:"NC Start",
    choices:[{mnemonic:"NC",operandCount:1}],suggestions:[]}});
  let accepting=picker.accepted();
  let validation=messages.at(-1);assert.equal(validation.type,"validateLadderInstruction");
  await receive({type:"ladderInstructionValidationResult",validationId:validation.validationId,error:"Invalid BOOL"});await accepting;
  assert.equal(picker.disposed,false);assert.match(picker.title,/Invalid BOOL/);
  picker.value="NC Ready";accepting=picker.accepted();validation=messages.at(-1);
  await receive({type:"ladderInstructionValidationResult",validationId:validation.validationId,error:null});await accepting;await pending;
  assert.deepEqual(messages.at(-1),{type:"iecContactInputResult",requestId:7,value:{command:"NC",operands:["Ready"]}});
  assert.deepEqual(reveals,[[undefined,false]]);assert.deepEqual([...document.bytes],[1,2,3]);
});
