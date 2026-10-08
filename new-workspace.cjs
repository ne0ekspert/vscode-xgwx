const vscode = require('vscode');

const PROJECT_TEMPLATES = [
  { label: 'XGK ladder project', description: 'XGK-CPUSN · Ladder Diagram', file: 'new-xgk.xgwx' },
  { label: 'XGI IEC ladder project', description: 'XGI-CPUE · IEC Ladder Diagram', file: 'new-xgi.xgwx' },
  { label: 'XGI SFC project', description: 'XGI-CPUE · Sequential Function Chart', file: 'new-xgi-sfc.xgwx' },
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
    const bytes = await vscode.workspace.fs.readFile(vscode.Uri.joinPath(context.extensionUri, 'media', 'templates', template.file));
    const edit = new vscode.WorkspaceEdit();
    edit.createFile(target, { contents: bytes, overwrite: false, ignoreIfExists: false });
    if (!await vscode.workspace.applyEdit(edit)) {
      throw new Error('The file could not be created. Choose a new file name.');
    }
    await vscode.commands.executeCommand('vscode.openWith', target, 'xgwx.workspaceViewer', { preview: false });
    return target;
  } catch (error) {
    await vscode.window.showErrorMessage(`XGWX: ${error instanceof Error ? error.message : String(error)}`);
  }
}
module.exports = { createNewWorkspace, PROJECT_TEMPLATES };
