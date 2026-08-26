const path = require("node:path");
const vscode = require("vscode");

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
    panel.webview.html = this.getHtml(panel.webview);

    const editor = { document, panel, ready: false };
    this.editors.add(editor);

    const load = async () => {
      if (!editor.ready) {
        return;
      }

      try {
        await panel.webview.postMessage({
          type: "load",
          fileName: path.basename(document.uri.fsPath || document.uri.path),
          uri: document.uri.toString(),
          byteLength: document.bytes.byteLength,
          bytes: Array.from(document.bytes),
          dirty: document.dirty,
        });
      } catch (error) {
        await panel.webview.postMessage({
          type: "error",
          message: error instanceof Error ? error.message : String(error),
        });
      }
    };

    const messages = panel.webview.onDidReceiveMessage(async (message) => {
      if (message?.type === "ready") {
        editor.ready = true;
        await load();
      } else if (message?.type === "refresh") {
        await load();
      } else if (message?.type === "edit") {
        this.updateDocument(document, message.bytes, message.label);
      } else if (message?.type === "save") {
        await vscode.commands.executeCommand("workbench.action.files.save");
      } else if (message?.type === "showError") {
        void vscode.window.showErrorMessage(`XGWX: ${String(message.message)}`);
      }
    });

    panel.onDidDispose(() => {
      this.editors.delete(editor);
      messages.dispose();
    });
  }

  updateDocument(document, bytes, label) {
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
    void this.broadcast(document);
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

  async broadcast(document, type = "load") {
    const targets = [...this.editors].filter((editor) => editor.document === document);
    await Promise.all(targets.map(async (editor) => {
      if (type === "load") {
        await editor.panel.webview.postMessage({
          type: "load",
          fileName: path.basename(document.uri.fsPath || document.uri.path),
          uri: document.uri.toString(),
          byteLength: document.bytes.byteLength,
          bytes: Array.from(document.bytes),
          dirty: document.dirty,
        });
      } else {
        await editor.panel.webview.postMessage({ type, dirty: document.dirty });
      }
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

function activate(context) {
  const provider = new XgwxEditorProvider(context);
  context.subscriptions.push(
    vscode.window.registerCustomEditorProvider(VIEW_TYPE, provider, {
      supportsMultipleEditorsPerDocument: true,
      webviewOptions: { retainContextWhenHidden: true },
    }),
    vscode.commands.registerCommand("xgwx.refreshViewer", () => provider.refreshActive()),
  );
}

function deactivate() {}

module.exports = { activate, deactivate, XgwxDocument, XgwxEditorProvider, bytesEqual };
