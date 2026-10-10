const vscode = require("vscode");
const PROGRAM_MIME = "application/vnd.code.tree.xgwx.explorer";

class XgwxExplorer {
  constructor(navigate) {
    this.navigate = navigate;
    this.nodes = new Map();
    this.roots = [];
    this.emitter = new vscode.EventEmitter();
    this.onDidChangeTreeData = this.emitter.event;
    this.dragMimeTypes = [PROGRAM_MIME];
    this.dropMimeTypes = [PROGRAM_MIME];
  }
  setEditor(editor) {
    this.editor = editor;
    this.update(editor?.explorerState);
  }
  update(state) {
    this.state = state;
    this.nodes.clear();
    const wrap = (node, parent) => {
      const item = { ...node, parent, uri: state.uri };
      this.nodes.set(item.id, item);
      item.children = node.children?.map(child => wrap(child, item));
      return item;
    };
    this.roots = state ? [wrap({ id: "root", label: state.fileName, icon: "file", children: state.nodes })] : [];
    this.emitter.fire();
    if (this.view) this.view.message = state ? undefined : "Open an .xgwx file to explore its XG5000 workspace.";
    const selected = this.nodes.get(state?.selectedId);
    if (selected && this.view?.visible) void this.view.reveal(selected, { select: true, focus: false, expand: false }).catch(() => {});
  }
  getChildren(item) { return item ? item.children || [] : this.roots; }
  getParent(item) { return item.parent; }
  getTreeItem(item) {
    const result = new vscode.TreeItem(item.label, item.children?.length ? vscode.TreeItemCollapsibleState.Expanded : vscode.TreeItemCollapsibleState.None);
    result.id = `${this.state.uri}:${item.id}`;
    result.iconPath = new vscode.ThemeIcon(item.icon);
    result.contextValue = item.contextValue;
    if (item.target) result.command = { command: "xgwx.explorerNavigate", title: "Open", arguments: [{ id: item.id, uri: this.state.uri }] };
    return result;
  }
  dispatch(item, action = "navigate", extra = {}) {
    // Context menus can outlive a selection refresh. Resolve their stable identity
    // against the current tree, while rejecting rows from another editor or removed nodes.
    const current = item && this.nodes.get(item.id);
    if (!current || item.uri !== this.state?.uri) return;
    return this.navigate(this.editor, { type: "explorerAction", uri: this.state.uri, action, target: current.target, ...extra });
  }
  handleDrag(items, transfer) {
    const item = items.length === 1 ? items[0] : null;
    const current = item && this.nodes.get(item.id);
    if (current?.contextValue !== "xgwxProgram" || item.uri !== this.state?.uri) return;
    transfer.set(PROGRAM_MIME, new vscode.DataTransferItem({ uri: this.state.uri, objectId: current.target.objectId }));
  }
  async handleDrop(target, transfer) {
    const source = transfer.get(PROGRAM_MIME)?.value;
    if (!source || source.uri !== this.state?.uri || target?.contextValue !== "xgwxProgram") return;
    const from = [...this.nodes.values()].find(item => item.target?.objectId === source.objectId);
    if (from) await this.dispatch(target, "moveProgram", { sourceObjectId: source.objectId });
  }
  dispose() { this.emitter.dispose(); }
}
module.exports = { XgwxExplorer };
