const path = require("node:path");
const vscode = require("vscode");
const picomatch = require("./media/vendor/picomatch");
const { operandError, suggestionMatches } = require("./media/ladder-operand-rules.cjs");

const { createNewWorkspace } = require("./new-workspace.cjs");

const VIEW_TYPE = "xgwx.workspaceViewer";

class XgwxDocument {
  constructor(uri, bytes) {
    this.uri = uri;
    this.bytes = Uint8Array.from(bytes);
    this.savedBytes = Uint8Array.from(bytes);
    this.dirty = false;
  }

  dispose() {}
}

class XgwxEditorProvider {
  constructor(context) {
    this.context = context;
    this.editors = new Set();
    this.changeEmitter = new vscode.EventEmitter();
    this.onDidChangeCustomDocument = this.changeEmitter.event;
  }

  async openCustomDocument(uri, openContext) {
    const source = openContext?.backupId ? vscode.Uri.parse(openContext.backupId) : uri;
    const bytes = await vscode.workspace.fs.readFile(source);
    const document = new XgwxDocument(uri, bytes);
    if (openContext?.backupId) {
      document.savedBytes = Uint8Array.from(await vscode.workspace.fs.readFile(uri));
      document.dirty = !bytesEqual(document.bytes, document.savedBytes);
    }
    return document;
  }

  async resolveCustomEditor(document, panel) {
    const mediaRoot = vscode.Uri.joinPath(this.context.extensionUri, "media");
    panel.webview.options = {
      enableScripts: true,
      localResourceRoots: [mediaRoot],
    };
    const editor = { document, panel, ready: false };
    this.editors.add(editor);

    const load = async () => {
      if (!editor.ready) {
        return;
      }

      try {
        const initialViewKey = `xgwx.initialProgramView:${document.uri.toString()}`;
        const initialProgramView = this.context.workspaceState?.get(initialViewKey);
        await panel.webview.postMessage({
          type: "load",
          initialProgramView,
          fileName: path.basename(document.uri.fsPath || document.uri.path),
          uri: document.uri.toString(),
          byteLength: document.bytes.byteLength,
          bytes: Array.from(document.bytes),
          dirty: document.dirty,
        });
        if (initialProgramView) await this.context.workspaceState.update(initialViewKey, undefined);
      } catch (error) {
        await panel.webview.postMessage({
          type: "error",
          message: error instanceof Error ? error.message : String(error),
        });
      }
    };

    const validations = new Map();
    let nextValidationId = 0;
    const messages = panel.webview.onDidReceiveMessage(async (message) => {
      if (message?.type === "ready") {
        editor.ready = true;
        await load();
      } else if (message?.type === "refresh") {
        await load();
      } else if (message?.type === "ladderInstructionValidationResult") {
        const resolve = validations.get(message.validationId);
        if (resolve) { validations.delete(message.validationId); resolve(message.error || undefined); }
      } else if (message?.type === "promptModuleSelection") {
        const choice = await vscode.window.showQuickPick(message.items, {
          title: message.title,
          placeHolder: "Choose a module model",
          matchOnDescription: true,
          matchOnDetail: true,
          ignoreFocusOut: true,
        });
        await new Promise(resolve => setImmediate(resolve));
        if (this.editors.has(editor) && panel.visible) panel.reveal(undefined, false);
        await panel.webview.postMessage({ type: "iecContactInputResult", requestId: message.requestId, value: choice?.label ?? null });
      } else if (message?.type === "promptSfcAction") {
        const qualifiers = [["N","Non-stored"],["R","Reset"],["S","Set"],["L","Time limited"],["D","Time delayed"],
          ["P","Pulse"],["SD","Stored and delayed"],["DS","Delayed and stored"],["SL","Stored and time limited"]];
        let kind = message.kind || "variable";
        let kindCancelled = false;
        if (message.chooseActionType) {
          const kinds = [{label:"Boolean variable",description:"Control a BOOL operand",kind:"variable"},{label:"ST program",description:"Typed values, arithmetic, and function blocks",kind:"program"}];
          kinds.sort((a,b) => Number(b.kind === kind) - Number(a.kind === kind));
          const picked = await vscode.window.showQuickPick(kinds, {title:message.title,placeHolder:"Choose an action type",ignoreFocusOut:true});
          if (picked) kind = picked.kind; else kindCancelled = true;
        }
        const currentQualifier = message.qualifier || "N";
        const items = qualifiers.map(([label,description]) => ({label,description}));
        items.sort((a,b) => Number(b.label === currentQualifier) - Number(a.label === currentQualifier));
        const choice = kindCancelled ? null : await vscode.window.showQuickPick(items, {title:message.title, placeHolder:"Choose an SFC action qualifier", ignoreFocusOut:true});
        const validateAction = value => new Promise(resolve => {
          const validationId = ++nextValidationId; validations.set(validationId,resolve);
          panel.webview.postMessage({type:"validateLadderInstruction",requestId:message.requestId,validationId,value});
        });
        let value = null;
        if (choice) {
          const qualifier = choice.label;
          const timed = ["L","D","SD","DS","SL"].includes(qualifier);
          const time = timed ? await vscode.window.showInputBox({title:`${message.title} · Time`,
            value:message.time || "T#2s", prompt:"Enter a TIME literal, for example T#2s or T#500ms.", ignoreFocusOut:true,
            validateInput:time => validateAction({operand:kind === "program" ? "Action0" : message.value || "%MX0",qualifier,time,...(message.chooseActionType ? {kind} : {})}),
          }) : "";
          if (time != null) {
            const operand = await vscode.window.showInputBox({title:`${message.title} · ${qualifier}`,
              value:kind === "program" && !message.value?.startsWith("%") ? message.value || "Action0" : kind === "program" ? "Action0" : message.value || "", prompt:kind === "program" ? "Enter an ST action program name (32 characters max)." : "Enter a %MX address or a declared BOOL variable. Leave empty to remove the action.", ignoreFocusOut:true,
              validateInput:operand => validateAction({operand,qualifier,time,...(message.chooseActionType ? {kind} : {})}),
            });
            if (operand != null) value = {operand,qualifier,time,...(message.chooseActionType ? {kind} : {})};
          }
        }
        await new Promise(resolve => setImmediate(resolve));
        if (this.editors.has(editor) && panel.visible) panel.reveal(undefined,false);
        await panel.webview.postMessage({type:"iecContactInputResult",requestId:message.requestId,value});
      } else if (message?.type === "promptNewProgram") {
        const allowed = ["LD", "SFC", "ST", "IL"].filter(language => message.languages?.includes(language));
        const language = await vscode.window.showQuickPick(allowed.map(language => ({label:language, description:{LD:"Ladder Diagram",SFC:"Sequential Function Chart",ST:"Structured Text",IL:"Instruction List (IEC)"}[language]})), {title:"Create program", placeHolder:"Choose the program language",ignoreFocusOut:true});
        let value = null;
        if (language) {
          const name = await vscode.window.showInputBox({title:`Create ${language.label} program`,value:message.name || "NewProgram",prompt:"Program name",ignoreFocusOut:true,
            validateInput: name => !/^[A-Za-z_][A-Za-z0-9_]*$/.test(name) ? "Use letters, digits and underscores; begin with a letter or underscore." : message.existingNames?.some(existing => existing.toLowerCase() === name.toLowerCase()) ? "A program with this name already exists." : null});
          if (name != null) value = {language:language.label,name};
        }
        await new Promise(resolve => setImmediate(resolve));
        if (this.editors.has(editor) && panel.visible) panel.reveal(undefined,false);
        await panel.webview.postMessage({type:"iecContactInputResult",requestId:message.requestId,value});
      } else if (message?.type === "promptVariableField" || message?.type === "promptSfcField") {
        const value = await vscode.window.showInputBox({
          title: message.title, value: message.value || "", prompt: message.prompt,
          ignoreFocusOut: true,
          validateInput: value => new Promise(resolve => {
            const validationId = ++nextValidationId;
            validations.set(validationId, resolve);
            panel.webview.postMessage({ type: "validateLadderInstruction", requestId: message.requestId, validationId, value });
          }),
        });
        await new Promise(resolve => setImmediate(resolve));
        if (this.editors.has(editor) && panel.visible) panel.reveal(undefined, false);
        await panel.webview.postMessage({ type: "iecContactInputResult", requestId: message.requestId, value: value ?? null });
      } else if (message?.type === "confirmVariableSwap") {
        const choice = await vscode.window.showInformationMessage(message.message, "Swap addresses", "Cancel");
        if (this.editors.has(editor) && panel.visible) panel.reveal(undefined, false);
        await panel.webview.postMessage({ type: "iecContactInputResult", requestId: message.requestId, value: choice === "Swap addresses" });
      } else if (message?.type === "promptLadderInstruction") {
        const validate = value => new Promise(resolve => {
          const validationId = ++nextValidationId;
          validations.set(validationId, resolve);
          panel.webview.postMessage({ type: "validateLadderInstruction", requestId: message.requestId, validationId, value });
        });
        const value = await promptInstruction({ ...message.instruction, structuredResult: true }, message.title, validate);
        await new Promise(resolve => setImmediate(resolve));
        if (this.editors.has(editor) && panel.visible) panel.reveal(undefined, false);
        await panel.webview.postMessage({ type: "iecContactInputResult", requestId: message.requestId, value: value ?? null });
      } else if (message?.type === "edit") {
        this.updateDocument(document, message.bytes, message.label, editor);
      } else if (message?.type === "promptIecContact" || message?.type === "promptLadderInsertion") {
        const value = message.type === "promptLadderInsertion"
          ? await promptLadderInsertion(message.actions, message.title)
          : await promptIecContact(message.value, message.suggestions, message.rowIndex);
        // Let the QuickPick finish closing before returning keyboard focus to the webview.
        await new Promise((resolve) => setImmediate(resolve));
        if (this.editors.has(editor) && panel.visible) panel.reveal(undefined, false);
        await panel.webview.postMessage({
          type: "iecContactInputResult",
          requestId: message.requestId,
          value: value ?? null,
        });
      } else if (message?.type === "save") {
        await vscode.commands.executeCommand("workbench.action.files.save");
      } else if (message?.type === "showError") {
        void vscode.window.showErrorMessage(`XGWX: ${String(message.message)}`);
      }
    });

    panel.onDidDispose(() => {
      this.editors.delete(editor);
      messages.dispose();
      for (const resolve of validations.values()) resolve("Editor closed");
      validations.clear();
    });

    // Register the ready handler before starting the webview. A fast webview
    // (or a paused debugger) can otherwise send ready before we are listening.
    panel.webview.html = this.getHtml(panel.webview);
  }

  updateDocument(document, bytes, label, sourceEditor = null) {
    const previous = Uint8Array.from(document.bytes);
    const next = Uint8Array.from(bytes || []);
    const apply = async (value) => {
      document.bytes = Uint8Array.from(value);
      document.dirty = !bytesEqual(document.bytes, document.savedBytes);
      await this.broadcast(document);
    };

    document.bytes = next;
    document.dirty = !bytesEqual(document.bytes, document.savedBytes);
    this.changeEmitter.fire({
      document,
      label: typeof label === "string" ? label : "Edit XGWX program",
      undo: () => apply(previous),
      redo: () => apply(next),
    });
    // The source webview already applied and parsed these bytes. Keep sibling
    // editors synchronized without serializing the entire workspace back to
    // the source and making it parse the same edit a second time.
    void this.broadcast(document, "load", sourceEditor);
  }

  async saveCustomDocument(document) {
    await vscode.workspace.fs.writeFile(document.uri, document.bytes);
    document.savedBytes = Uint8Array.from(document.bytes);
    document.dirty = false;
    await this.broadcast(document, "saved");
  }

  async saveCustomDocumentAs(document, destination) {
    await vscode.workspace.fs.writeFile(destination, document.bytes);
    document.savedBytes = Uint8Array.from(document.bytes);
    document.dirty = false;
    await this.broadcast(document, "saved");
  }

  async revertCustomDocument(document) {
    const bytes = await vscode.workspace.fs.readFile(document.uri);
    document.bytes = Uint8Array.from(bytes);
    document.savedBytes = Uint8Array.from(bytes);
    document.dirty = false;
    await this.broadcast(document, "reverted");
  }

  async backupCustomDocument(document, context) {
    await vscode.workspace.fs.writeFile(context.destination, document.bytes);
    return {
      id: context.destination.toString(),
      delete: () => vscode.workspace.fs.delete(context.destination),
    };
  }

  async broadcast(document, type = "load", excludedEditor = null) {
    const targets = [...this.editors].filter((editor) => (
      editor.document === document && editor !== excludedEditor
    ));
    if (!targets.length) return;
    // Serialize once per broadcast, regardless of sibling count.
    const message = type === "load" ? {
      type: "load",
      fileName: path.basename(document.uri.fsPath || document.uri.path),
      uri: document.uri.toString(),
      byteLength: document.bytes.byteLength,
      bytes: Array.from(document.bytes),
      dirty: document.dirty,
    } : { type, dirty: document.dirty };
    await Promise.all(targets.map(async (editor) => {
      await editor.panel.webview.postMessage(message);
    }));
  }

  async refreshActive() {
    const active = [...this.editors].find((editor) => editor.panel.active);
    if (active) {
      await active.panel.webview.postMessage({ type: "requestRefresh" });
    }
  }

  getHtml(webview) {
    const nonce = createNonce();
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, "media", "main.js"),
    );
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, "media", "main.css"),
    );

    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src ${webview.cspSource} 'nonce-${nonce}' 'wasm-unsafe-eval'; connect-src ${webview.cspSource};">
  <link rel="stylesheet" href="${styleUri}">
  <title>XGWX Workspace Editor</title>
</head>
<body>
  <main id="app" aria-live="polite">
    <div class="loading-screen">
      <div class="spinner" aria-hidden="true"></div>
      <p>Loading XGWX parser…</p>
    </div>
  </main>
  <script type="module" nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
  }
}

function promptIecContact(currentValue, suggestions, rowIndex) {
  return new Promise((resolve) => {
    const picker = vscode.window.createQuickPick();
    picker.title = `Contact operand · L${rowIndex}`;
    picker.placeholder = "Enter a contact operand or choose a suggestion";
    picker.matchOnDescription = false;
    const names = [...new Set((Array.isArray(suggestions) ? suggestions : [])
      .filter((name) => typeof name === "string" && name))];
    const update = (value) => {
      const typed = value.trim();
      const matches = names.filter((name) => name.toLocaleLowerCase()
        .includes(typed.toLocaleLowerCase())).slice(0, 12);
      picker.items = [
        ...(typed ? [{ label: typed, description: "Use typed operand", operand: typed }] : []),
        ...matches.filter((name) => name !== typed)
          .map((name) => ({ label: name, operand: name })),
      ];
    };
    let settled = false;
    const finish = (value) => {
      if (settled) return;
      settled = true;
      picker.dispose();
      resolve(value);
    };
    picker.onDidChangeValue(update);
    picker.onDidAccept(() => {
      const value = (picker.activeItems[0]?.operand || picker.value).trim();
      if (!value || value.length > 255 || /[\p{Cc}]/u.test(value)) return;
      finish(value);
    });
    picker.onDidHide(() => finish(undefined));
    picker.value = String(currentValue || "");
    update(picker.value);
    picker.show();
  });
}

// Parentheses keep compound IEC expressions together as one instruction operand.
function tokenizeInstruction(value) {
  const tokens = [];
  let depth = 0;
  let quoted = false;
  let start = -1;
  let error;
  for (let i = 0; i < value.length; i++) {
    const char = value[i];
    if (char === "'") quoted = !quoted;
    if (/\s/.test(char) && depth === 0 && !quoted) {
      if (start >= 0) tokens.push(value.slice(start, i));
      start = -1;
      continue;
    }
    if (start < 0) start = i;
    if (!quoted && char === "(") depth++;
    if (!quoted && char === ")") {
      if (depth === 0) error = "Unexpected closing parenthesis";
      else depth--;
    }
  }
  if (start >= 0) tokens.push(value.slice(start));
  if (depth) error = "Close the expression parentheses";
  if (quoted) error = "Close the string's single quote";
  return { tokens, error, trailingSeparator: /\s$/.test(value) && depth === 0 && !quoted, depth, quoted };
}

// QuickPick exposes text changes, but no caret position: context follows the final token.
function promptInstruction(instruction, title, validate) {
  return new Promise((resolve) => {
    const picker = vscode.window.createQuickPick();
    picker.ignoreFocusOut = true;
    picker.matchOnDescription = false;
    picker.sortByLabel = false;
    const choices = instruction.choices || [];
    const suggestions = [...new Map((instruction.suggestions || [])
      .filter(item => typeof item.value === "string" && item.value && !/\s/.test(item.value))
      .map(item => [`${item.value}:${item.dataType || ""}`, item])).values()];
    let settled = false;
    let checking = false;
    let validationError;
    const finish = value => {
      if (settled) return;
      settled = true;
      picker.dispose();
      resolve(value);
    };
    const parse = value => {
      const parsed = tokenizeInstruction(value);
      const tokens = instruction.singleValue
        ? [choices[0]?.mnemonic, ...(value.trim() ? [value.trim()] : [])] : parsed.tokens;
      const groupingError = parsed.error;
      const choice = choices.find(item => [item.mnemonic, ...(item.aliases || [])].some(name => name.toUpperCase() === tokens[0]?.toUpperCase()));
      const operands = tokens.slice(1);
      const error = validationError || groupingError || (!choice && tokens.length && !choices.some(item => [item.mnemonic, ...(item.aliases || [])].some(name => name.toUpperCase().startsWith(tokens[0].toUpperCase()))) ? "Unknown or unavailable command" : undefined)
        || (choice && operands.length > choice.operandCount ? `Expected ${choice.operandCount} operands` : undefined)
        || operands.map((operand, index) => operandError(choice?.operandRules?.[index], operand, instruction.iec === true)).find(Boolean);
      const complete = !error && choice && operands.length >= (choice.minOperandCount ?? choice.operandCount) && operands.length <= choice.operandCount
        && value.length <= 255 && !/[\p{Cc}]/u.test(value)
        && tokens.every(token => !token.includes(",") || token.startsWith("'") && token.endsWith("'"));
      return { tokens, choice, operands, complete, error };
    };
    const update = value => {
      const { tokens, choice, operands, complete, error } = parse(value);
      const { trailingSeparator, depth, quoted } = tokenizeInstruction(value);
      const last = trailingSeparator ? "" : instruction.singleValue ? value.trim() : (tokens.at(-1) || "");
      let hint = "Instruction";
      let completions;
      if (!choice || !instruction.singleValue && tokens.length === 1 && !trailingSeparator) {
        completions = choices.filter(item => [item.mnemonic, ...(item.aliases || [])].some(name => name.toUpperCase().startsWith(value.trim().toUpperCase())))
          .slice(0, 50).map(item => ({ value: `${item.mnemonic} `,
            description: `${item.minOperandCount ? `${item.minOperandCount}–` : ""}${item.operandCount} operands` }));
      } else {
        const index = Math.max(0, operands.length - (last ? 1 : 0));
        const name = choice.mnemonic.toUpperCase();
        const roles = ["MOV", "MOVE", "I2R"].includes(name) ? ["Source operand", "Destination operand"]
          : ["ADD", "SUB", "MUL", "DIV", "EQ", "GT", "GE", "LT", "LE"].includes(name)
            ? ["First source operand", "Second source operand", "Destination operand"]
            : ["=", ">", "<", ">=", "<=", "<>"].includes(name) ? ["First source operand", "Second source operand"] : [];
        hint = index >= choice.operandCount ? "Ready to insert"
          : roles[index] || `Operand ${index + 1} of ${choice.operandCount}`;
        const rule = choice.operandRules?.[index];
        if (rule) {
          const label = rule.label === "S" ? "Source operand" : rule.label === "D" ? "Destination operand"
            : /^S\d+$/.test(rule.label) ? `Source operand ${rule.label.slice(1)}` : rule.label;
          hint = `${label} · ${rule.dataTypes.join("/")}${index >= (choice.minOperandCount ?? choice.operandCount) ? instruction.allowEmpty ? " · leave blank to remove assignment" : " · optional; omit to wire OUT" : ""}`;
        }
        const fragment = depth ? (value.match(/[\p{L}\p{N}_%.]*$/u)?.[0] || "") : last;
        const prefix = fragment ? value.slice(0, -fragment.length) : value;
        completions = index >= choice.operandCount || quoted || last.startsWith("'") ? [] : suggestions
          .filter(item => suggestionMatches(rule, item, instruction.iec === true)
            && item.value.toLocaleLowerCase().includes(fragment.toLocaleLowerCase()))
          .slice(0, 30).map(item => ({ value: prefix + item.value
            + (!depth && index + 1 < choice.operandCount ? " " : ""), description: item.description }));
      }
      picker.title = `${title} · ${error || hint}`;
      const groupingHint = instruction.iec !== true && choice?.operandRules?.some(rule => rule.dataTypes?.includes("STRING"))
        ? "quote strings with single quotes" : "group expressions in parentheses";
      picker.placeholder = instruction.singleValue ? `${hint} · enter a value or choose a variable`
        : `${hint} · separate operands with spaces; ${groupingHint}`;
      picker.items = [
        ...(complete ? [{ label: value.trim() || (instruction.allowEmpty ? "Remove output assignment" : ""), description: instruction.singleValue ? instruction.allowEmpty && !value.trim() ? "Clear output assignment" : "Apply value" : instruction.mode === "edit" ? "Apply instruction" : "Insert instruction", insert: true }] : []),
        ...(error ? [{ label: value.trim(), description: error, invalid: true }] : []),
        ...completions.filter(item => item.value !== value)
          .map(item => ({ label: item.value.trimEnd(), description: item.description, completion: item.value })),
      ];
      picker.activeItems = picker.items.slice(0, 1);
    };
    picker.onDidChangeValue(value => { validationError = undefined; update(value); });
    picker.onDidAccept(async () => {
      if (checking || settled) return;
      const selected = picker.activeItems[0];
      if (selected?.invalid) return;
      if (selected?.completion !== undefined) {
        picker.value = selected.completion;
        return;
      }
      const { choice, operands, complete } = parse(picker.value);
      if (!complete) return;
      const result = { command: choice.mnemonic, operands };
      if (validate) {
        checking = true; picker.busy = true;
        const value = picker.value;
        let error;
        try { error = await validate(result); } catch (failure) { error = String(failure); }
        checking = false;
        if (settled) return;
        picker.busy = false;
        if (picker.value !== value) return;
        if (error) { validationError = error; update(value); return; }
      }
      finish(instruction.structuredResult ? result : [choice.mnemonic, operands.join(", ")]);
    });
    picker.onDidHide(() => finish(undefined));
    picker.value = String(instruction.value || "");
    update(picker.value);
    picker.show();
  });
}

async function promptLadderInsertion(actions, title) {
  if (!Array.isArray(actions) || !actions.length) return undefined;
  const action = await vscode.window.showQuickPick(actions.map((item, index) => ({
    label: item.label, index,
  })), { title, placeHolder: "Choose an element to insert", ignoreFocusOut: true });
  if (!action) return undefined;
  if (actions[action.index].instruction) {
    const values = await promptInstruction(actions[action.index].instruction, `${title} · ${action.label}`);
    return values ? { actionIndex: action.index, values } : undefined;
  }
  const fields = actions[action.index].fields;
  const values = [];
  for (const [index, field] of fields.entries()) {
    const options = { title: `${title} · ${action.label}`, step: index + 1, totalSteps: fields.length,
      ignoreFocusOut: true };
    let value;
    if (field.choices) {
      if (field.choices.length === 1) value = field.choices[0].value;
      else {
        const choice = await vscode.window.showQuickPick(field.choices.map((item) => ({
          label: item.label, value: item.value,
        })), { ...options, placeHolder: field.label });
        value = choice?.value;
      }
    } else {
      value = await vscode.window.showInputBox({ ...options, prompt: field.label,
        value: field.value, valueSelection: [0, field.value.length],
        validateInput: (text) => text.length > 255 || /[\p{Cc}]/u.test(text)
          ? "Use at most 255 characters without control characters" : undefined });
    }
    if (value === undefined) return undefined;
    values.push(value);
  }
  return { actionIndex: action.index, values };
}

function createNonce() {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let value = "";
  for (let index = 0; index < 32; index += 1) {
    value += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  }
  return value;
}

function bytesEqual(left, right) {
  if (left.byteLength !== right.byteLength) return false;
  return left.every((byte, index) => byte === right[index]);
}

async function recoverStartupEditors() {
  // Only inspect the startup snapshot. Later Reopen With choices belong to the user.
  const candidates = vscode.window.tabGroups.all.flatMap((group) =>
    group.tabs.filter((tab) => tab.input instanceof vscode.TabInputText
      && /\.xgwx$/i.test(tab.input.uri.path)).map((tab) => ({ group, tab, uri: tab.input.uri })));
  for (const { group, tab, uri } of candidates) {
    const eligible = () => {
      if (!vscode.window.tabGroups.all.includes(group) || !group.tabs.includes(tab) || tab.isDirty) return false;
      if (vscode.workspace.textDocuments.some((document) => document.uri.toString() === uri.toString() && document.isDirty)) return false;
      const configuration = vscode.workspace.getConfiguration("workbench.editor", uri);
      const binaryEditor = configuration.get("defaultBinaryEditor");
      if (binaryEditor && binaryEditor !== VIEW_TYPE) return false;
      const associations = vscode.workspace.getConfiguration("workbench", uri).get("editorAssociations", {});
      return !Object.entries(associations).some(([pattern, editor]) => {
        if (editor === VIEW_TYPE) return false;
        const target = pattern.includes("/") ? uri.path : path.posix.basename(uri.path);
        return picomatch.isMatch(target, pattern, { dot: true, nocase: true });
      });
    };
    try {
      if (!eligible()) continue;
      const bytes = await vscode.workspace.fs.readFile(uri);
      if (bytes[0] !== 0x58 || bytes[1] !== 0x47 || !eligible()) continue;
      const customIsOpen = () => vscode.window.tabGroups.all.some((other) => other.tabs.some((current) =>
        current.input instanceof vscode.TabInputCustom && current.input.viewType === VIEW_TYPE
        && current.input.uri.toString() === uri.toString()));
      // A custom tab may have opened while the read was in flight.
      if (customIsOpen()) continue;
      await vscode.commands.executeCommand("vscode.openWith", uri, VIEW_TYPE, {
        viewColumn: group.viewColumn, preserveFocus: !tab.isActive, preview: tab.isPreview,
      });
      if (customIsOpen() && eligible()) await vscode.window.tabGroups.close(tab, true);
    } catch (error) {
      // Startup recovery must not prevent normal custom-editor activation.
      console.warn("XGWX startup editor recovery:", error);
    }
  }
}

function activate(context) {
  const provider = new XgwxEditorProvider(context);
  context.subscriptions.push(
    vscode.window.registerCustomEditorProvider(VIEW_TYPE, provider, {
      supportsMultipleEditorsPerDocument: true,
      webviewOptions: { retainContextWhenHidden: true },
    }),
    vscode.commands.registerCommand("xgwx.refreshViewer", () => provider.refreshActive()),
    vscode.commands.registerCommand("xgwx.newFile", () => createNewWorkspace(context)),
  );
  void recoverStartupEditors();
}

function deactivate() {}

module.exports = { activate, deactivate, recoverStartupEditors, XgwxDocument, XgwxEditorProvider, bytesEqual, promptIecContact, promptLadderInsertion, promptInstruction, tokenizeInstruction };
