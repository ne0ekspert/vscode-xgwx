const vscode = require('vscode');
const fs = require('node:fs/promises');

let libraryPromise;
async function loadLibrary(context) {
  if (!libraryPromise) {
    libraryPromise = (async () => {
      const moduleUri = vscode.Uri.joinPath(context.extensionUri, 'media', 'libxgwx.js');
      const wasmUri = vscode.Uri.joinPath(context.extensionUri, 'media', 'libxgwx_bg.wasm');
      // Load the web-target ESM glue independently of the extension's CommonJS package.
      const source = await fs.readFile(moduleUri.fsPath || moduleUri.path);
      const library = await import(`data:text/javascript;base64,${source.toString('base64')}`);
      await library.default({ module_or_path: await fs.readFile(wasmUri.fsPath || wasmUri.path) });
      return library;
    })().catch(error => { libraryPromise = undefined; throw error; });
  }
  return libraryPromise;
}

const PROJECT_TEMPLATES = [
  { label: 'XGK ladder project', description: 'XGK-CPUSN · Ladder Diagram', cpuModel: 'XGK-CPUSN', language: 'LD' },
  { label: 'XGI IEC ladder project', description: 'XGI-CPUE · IEC Ladder Diagram', cpuModel: 'XGI-CPUE', language: 'LD' },
  { label: 'XGI SFC project', description: 'XGI-CPUE · Sequential Function Chart', cpuModel: 'XGI-CPUE', language: 'SFC' },
  { label: 'XGI ST project', description: 'XGI-CPUE · Structured Text', cpuModel: 'XGI-CPUE', language: 'ST' },
  { label: 'XGI IL project', description: 'XGI-CPUE · Instruction List (IEC)', cpuModel: 'XGI-CPUE', language: 'IL' },
  { label: 'XGK IL project', description: 'XGK-CPUSN · Vendor Instruction List', cpuModel: 'XGK-CPUSN', language: 'IL', programView: 'vendorIl' },
  { label: 'XGK ST project', description: 'XGK-CPUA · Auto-allocation Structured Text', cpuModel: 'XGK-CPUA', language: 'ST' },
  ...[['xece','XEC-E'],['xech','XEC-H'],['xecs','XEC-S'],['xecu','XEC-U'],['xemh2','XEM-H2'],['xemhp','XEM-HP'],['gipam','GIPAM'],['kl','KL'],['xgr','XGR-CPUH']].flatMap(([stem,cpu]) => ['ST','IL'].map(language => ({label:`${cpu} ${language} project`, description: `${cpu} · ${language === 'ST' ? 'Structured Text' : 'Instruction List (IEC)'}`, cpuModel: ({xece:'XGB-XECE',xech:'XGB-XECH',xecs:'XGB-XECS',xecu:'XGB-XECU',xemh2:'XGB-XEMH2',xemhp:'XGB-XEMHP',gipam:'XGB-GIPAM',kl:'XGB-KL',xgr:'XGR-CPUH'})[stem], language}))),
];

async function createNewWorkspace(context) {
  const template = await vscode.window.showQuickPick(PROJECT_TEMPLATES, {
    title: 'New XGWX File', placeHolder: 'Choose the PLC project type', ignoreFocusOut: true,
  });
  if (!template) return;
  const folder = vscode.workspace.workspaceFolders?.[0]?.uri;
  const uri = await vscode.window.showSaveDialog({
    title: 'Create XGWX File', saveLabel: 'Create', filters: { 'XG5000 workspace': ['xgwx'] },
    defaultUri: folder ? vscode.Uri.joinPath(folder, 'NewProject.xgwx') : undefined,
  });
  if (!uri) return;
  const target = /\.xgwx$/i.test(uri.path) ? uri : uri.with({ path: `${uri.path}.xgwx` });
  try {
    const library = await loadLibrary(context);
    const bytes = library.create_xgwx_project(template.cpuModel, template.language);
    const edit = new vscode.WorkspaceEdit();
    edit.createFile(target, { contents: bytes, overwrite: false, ignoreIfExists: false });
    if (!await vscode.workspace.applyEdit(edit)) {
      throw new Error('The file could not be created. Choose a new file name.');
    }
    if (template.programView) await context.workspaceState?.update(`xgwx.initialProgramView:${target.toString()}`, template.programView);
    await vscode.commands.executeCommand('vscode.openWith', target, 'xgwx.workspaceViewer', { preview: false });
    return target;
  } catch (error) {
    await vscode.window.showErrorMessage(`XGWX: ${error instanceof Error ? error.message : String(error)}`);
  }
}
module.exports = { createNewWorkspace, PROJECT_TEMPLATES };
