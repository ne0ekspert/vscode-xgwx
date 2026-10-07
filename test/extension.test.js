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
const { recoverStartupEditors, XgwxDocument, XgwxEditorProvider, bytesEqual, promptIecContact, promptLadderInsertion, promptInstruction, tokenizeInstruction } = require(path.resolve(__dirname, "../extension.js"));
Module._load = originalLoad;

function uri(value) {
  return { fsPath: value, path: value, toString: () => value };
}

test("startup recovery respects editor choices, dirty tabs, file magic and asynchronous closure", async () => {
  class TextInput { constructor(uri) { this.uri = uri; } }
  class CustomInput { constructor(uri) { this.uri = uri; this.viewType = "xgwx.workspaceViewer"; } }
  mockVscode.TabInputText = TextInput;
  mockVscode.TabInputCustom = CustomInput;
  const calls = [];
  mockVscode.commands = { executeCommand: async (...args) => calls.push(args) };
  mockVscode.workspace.textDocuments = [];
  let associations = { "*.md": "default" };
  let binaryEditor;
  mockVscode.workspace.getConfiguration = (section) => ({ get: (key, fallback) => {
    if (section === "workbench" && key === "editorAssociations") return associations;
    if (section === "workbench.editor" && key === "defaultBinaryEditor") return binaryEditor ?? fallback;
    throw new Error(`Unexpected configuration key: ${section}.${key}`);
  } });
  const target = uri("/startup/project.xgwx");
  files.set(target.toString(), [0x58, 0x47, 1]);
  const tab = { input: new TextInput(target), isDirty: false, isActive: true, isPreview: true };
  const group = { tabs: [tab], viewColumn: 2 };
  const closed = [];
  mockVscode.window = { tabGroups: { all: [group], close: async (target) => closed.push(target) } };
  mockVscode.commands.executeCommand = async (...args) => {
    calls.push(args);
    group.tabs.push({ input: new CustomInput(target) });
  };
  await recoverStartupEditors();
  assert.deepEqual(calls.splice(0), [["vscode.openWith", target, "xgwx.workspaceViewer", {
    viewColumn: 2, preserveFocus: false, preview: true,
  }]]);
  assert.deepEqual(closed, [tab]);
  group.tabs.pop();
  for (const pattern of ["*.xgwx", "**/*.xgwx", "/startup/{project,other}.xgwx"]) {
    associations = { [pattern]: "default" };
    await recoverStartupEditors();
    assert.equal(calls.length, 0, pattern);
  }
  associations = {};
  binaryEditor = "default";
  await recoverStartupEditors();
  binaryEditor = undefined;
  tab.isDirty = true;
  await recoverStartupEditors();
  tab.isDirty = false;
  mockVscode.workspace.textDocuments = [{ uri: target, isDirty: true }];
  await recoverStartupEditors();
  mockVscode.workspace.textDocuments = [];
  group.tabs.push({ input: new CustomInput(target) });
  await recoverStartupEditors();
  group.tabs.pop();
  files.set(target.toString(), [1, 2]);
  await recoverStartupEditors();
  assert.equal(calls.length, 0);
  const readFile = mockVscode.workspace.fs.readFile;
  try {
    mockVscode.workspace.fs.readFile = async () => {
      group.tabs = [];
      return Uint8Array.from([0x58, 0x47]);
    };
    await recoverStartupEditors();
    assert.equal(calls.length, 0);
  } finally {
    mockVscode.workspace.fs.readFile = readFile;
  }
});

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


test("XGK string prompt accepts complete quoted operands and keeps constants out of destinations", async () => {
  let picker;
  mockVscode.window = { createQuickPick: () => (picker = {
    activeItems: [], items: [],
    onDidChangeValue(callback) { this.changed = callback; },
    onDidAccept(callback) { this.accepted = callback; },
    onDidHide(callback) { this.hidden = callback; },
    set value(value) { this._value = value; this.changed?.(value); },
    get value() { return this._value; }, show() {}, dispose() {},
  }) };
  const rules = [{label:'S',dataTypes:['STRING'],allowsConstant:true}, {label:'D',dataTypes:['STRING'],allowsConstant:false}];
  const result = promptInstruction({structuredResult:true, choices:[{mnemonic:'$MOV',operandCount:2,operandRules:rules}]}, 'Insert');
  picker.value = "$MOV 'Room A, on (night)' 'bad destination'";
  assert.equal(picker.items.some(item=>item.insert),false);
  picker.value = "$MOV 'Room A, on (night)' D100";
  assert.equal(picker.items[0].insert,true);
  await picker.accepted();
  assert.deepEqual(await result,{command:'$MOV',operands:["'Room A, on (night)'",'D100']});
});

test("instruction prompt keeps quoted string spaces, commas and parentheses intact", () => {
  assert.deepEqual(tokenizeInstruction("$MOV 'Room A, on (night)' D100").tokens,
    ["$MOV", "'Room A, on (night)'", "D100"]);
  assert.equal(tokenizeInstruction("$MOV 'Room A '").trailingSeparator, false);
  assert.equal(tokenizeInstruction("$MOV 'Room A' ").trailingSeparator, true);
  assert.match(tokenizeInstruction("$MOV 'Room A").error, /single quote/);
});

test("instruction operands preserve nested expressions and reject unmatched parentheses", () => {
  assert.deepEqual(tokenizeInstruction("MOVE (%MW0 MOD 7 + 1) %MW1000").tokens,
    ["MOVE", "(%MW0 MOD 7 + 1)", "%MW1000"]);
  assert.deepEqual(tokenizeInstruction("MOVE (%MX0 OR NOT %MX1 AND (%MW2 >= 2)) %MX1002").tokens,
    ["MOVE", "(%MX0 OR NOT %MX1 AND (%MW2 >= 2))", "%MX1002"]);
  assert.deepEqual(tokenizeInstruction("MOV D100 D200").tokens, ["MOV", "D100", "D200"]);
  assert.match(tokenizeInstruction("MOVE (%MW0 + 1").error, /Close/);
  assert.match(tokenizeInstruction("MOVE %MW0) %MW1").error, /Unexpected/);
});

test("IEC instruction prompt completes inside grouped operands and advances to destination", async () => {
  let picker;
  mockVscode.window = { createQuickPick: () => (picker = {
    activeItems: [], items: [],
    onDidChangeValue(callback) { this.changed = callback; },
    onDidAccept(callback) { this.accepted = callback; },
    onDidHide(callback) { this.hidden = callback; },
    set value(value) { this._value = value; this.changed?.(value); },
    get value() { return this._value; }, show() {}, dispose() {},
  }) };
  const result = promptInstruction({ structuredResult: true,
    choices: [{ mnemonic: "MOVE", operandCount: 2 }],
    suggestions: [{ value: "%MW0" }, { value: "%MW1000" }],
  }, "Insert");
  picker.value = "MOVE (%MW0 + %MW";
  assert.equal(picker.items.some(item => item.insert), false);
  const completion = picker.items.find(item => item.completion === "MOVE (%MW0 + %MW1000");
  assert.ok(completion);
  picker.activeItems = [completion];
  await picker.accepted();
  assert.equal(picker.value, "MOVE (%MW0 + %MW1000");
  picker.value = "MOVE (%MW0 MOD 7 + 1) ";
  assert.match(picker.title, /Destination operand/);
  picker.value = "MOVE (%MW0 MOD 7 + 1) %MW1000";
  await picker.accepted();
  assert.deepEqual(await result, { command: "MOVE", operands: ["(%MW0 MOD 7 + 1)", "%MW1000"] });
});

test('variable popup uses native text input validation and a cancellable swap notification', async () => {
  let receive, options, choice = 'Cancel';
  const messages = [], notifications = [];
  mockVscode.window = {
    showInputBox: async value => { options = value; return 'P00001'; },
    showInformationMessage: async (...args) => { notifications.push(args); return choice; },
  };
  const document = new XgwxDocument(uri('/workspace/variables.xgwx'), [1,2,3]);
  const provider = new XgwxEditorProvider({});
  const panel = { visible: true, webview: { cspSource:'test', asWebviewUri:value=>value,
    onDidReceiveMessage(callback){receive=callback;return{dispose(){}};},
    async postMessage(message){messages.push(message);}}, reveal(){}, onDidDispose(){} };
  await provider.resolveCustomEditor(document, panel);
  await receive({type:'promptVariableField',requestId:31,title:'Edit address',value:'P00000',prompt:'Address'});
  assert.equal(options.value, 'P00000');
  const validating = options.validateInput('P00001');
  const validation = messages.at(-1);
  await receive({type:'ladderInstructionValidationResult',validationId:validation.validationId,error:'Duplicate'});
  assert.equal(await validating, 'Duplicate');
  await receive({type:'confirmVariableSwap',requestId:32,message:'Swap addresses?'});
  assert.deepEqual(notifications[0], ['Swap addresses?', 'Swap addresses', 'Cancel']);
  assert.equal(messages.at(-1).value, false);
  choice = 'Swap addresses';
  await receive({type:'confirmVariableSwap',requestId:33,message:'Swap addresses?'});
  assert.equal(messages.at(-1).value, true);
  assert.deepEqual([...document.bytes], [1,2,3]);
});

test('single IEC pin prompt edits a value, retains type completion and validates before closing', async () => {
  let picker;
  mockVscode.window = { createQuickPick: () => (picker = {
    activeItems: [], items: [], onDidChangeValue(cb) { this.changed = cb; },
    onDidAccept(cb) { this.accepted = cb; }, onDidHide(cb) { this.hidden = cb; },
    set value(value) { this._value = value; this.changed?.(value); },
    get value() { return this._value; }, show() {}, dispose() {},
  }) };
  const instruction = { iec: true, singleValue: true, structuredResult: true, mode: 'edit', value: 'T#5s',
    choices: [{ mnemonic: 'TON', operandCount: 1, operandRules: [{label:'PT',dataTypes:['TIME']}] }],
    suggestions: [{value:'PresetTime',dataType:'TIME'}, {value:'Counter',dataType:'INT'}] };
  const validated = [];
  const result = promptInstruction(instruction, 'Edit TON.PT', async value => {
    validated.push(value); return value.operands[0] === 'bad' ? 'Invalid TIME value' : undefined;
  });
  assert.equal(picker.value, 'T#5s');
  assert.equal(picker.items[0].description, 'Apply value');
  picker.value = '';
  assert.deepEqual(picker.items.map(item => item.completion), ['PresetTime']);
  picker.value = 'bad';
  await picker.accepted();
  assert.match(picker.title, /Invalid TIME value/);
  picker.value = 'T#10s';
  await picker.accepted();
  assert.deepEqual(await result, {command:'TON',operands:['T#10s']});
  assert.equal(validated.length, 2);
  const cancelled = promptInstruction(instruction, 'Edit TON.PT');
  picker.hidden();
  assert.equal(await cancelled, undefined);
});

test('comparison creation accepts two sources or a BOOL destination while arithmetic requires three operands', async () => {
  let picker;
  mockVscode.window = { createQuickPick: () => (picker = {
    activeItems: [], items: [],
    onDidChangeValue(callback) { this.changed = callback; },
    onDidAccept(callback) { this.accepted = callback; },
    onDidHide(callback) { this.hidden = callback; },
    set value(value) { this._value=value;this.changed?.(value); },
    get value() { return this._value; }, show() {}, dispose() {},
  }) };
  const choices = [
    {mnemonic:'EQ',operandCount:3,minOperandCount:2,operandRules:[
      {label:'Source 1',dataTypes:['WORD']},{label:'Source 2',dataTypes:['WORD']},
      {label:'Destination',dataTypes:['BOOL'],allowsConstant:false}]},
    {mnemonic:'ADD',operandCount:3},
  ];
  for(const value of ['EQ %MW0 1','EQ %MW0 1 %MX3']) {
    const result=promptInstruction({choices,iec:true,structuredResult:true},'Insert');
    picker.value='ADD %MW0 1';
    assert.equal(picker.items.some(item=>item.insert),false);
    picker.value=value;
    assert.equal(picker.items[0].insert,true);
    await picker.accepted();
    assert.deepEqual((await result).operands,value.split(' ').slice(1));
  }
});

test('single OUT value can be cleared with a visible action while input values stay required', async () => {
  let picker;
  mockVscode.window={createQuickPick:()=> (picker={activeItems:[],items:[],
    onDidChangeValue(f){this.changed=f;},onDidAccept(f){this.accepted=f;},onDidHide(f){this.hidden=f;},
    set value(v){this._value=v;this.changed?.(v);},get value(){return this._value;},show(){},dispose(){}})};
  const result=promptInstruction({singleValue:true,allowEmpty:true,iec:true,structuredResult:true,
    choices:[{mnemonic:'ADD',operandCount:1,minOperandCount:0,operandRules:[{label:'OUT',dataTypes:['INT'],allowsConstant:false}]}]},'Edit');
  picker.value='';
  assert.equal(picker.items[0].label,'Remove output assignment');
  assert.equal(picker.items[0].insert,true);
  assert.match(picker.title,/leave blank to remove assignment/);
  await picker.accepted();assert.deepEqual((await result).operands,[]);
  const input=promptInstruction({singleValue:true,iec:true,structuredResult:true,
    choices:[{mnemonic:'ADD',operandCount:1,operandRules:[{label:'IN1',dataTypes:['INT']}]}]},'Edit');
  picker.value='';assert.equal(picker.items.some(i=>i.insert),false);
  picker.hidden();assert.equal(await input,undefined);
});
