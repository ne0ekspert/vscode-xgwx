const { spawn } = require("node:child_process");
const { createHash } = require("node:crypto");
const os = require("node:os");
const path = require("node:path");

const [executable, checkout, port, ...extraArgs] = process.argv.slice(2);
if (!executable || !checkout || !/^\d+$/.test(port || "")) {
  throw new Error("Expected VS Code executable, extension checkout, and inspector port");
}
const profileKey = createHash("sha256").update(checkout).digest("hex").slice(0, 12);
const profile = path.join(os.tmpdir(), `xgwx-extension-host-${profileKey}`);
const env = { ...process.env };
// The child is an Electron application, not another debugger-instrumented Node process.
for (const name of ["ELECTRON_RUN_AS_NODE", "NODE_OPTIONS", "VSCODE_INSPECTOR_OPTIONS", "VSCODE_IPC_HOOK_CLI"]) {
  delete env[name];
}
const child = spawn(executable, [
  `--user-data-dir=${profile}`,
  `--extensionDevelopmentPath=${checkout}`,
  `--inspect-extensions=${port}`,
  "--new-window",
  ...extraArgs,
], { env, stdio: "inherit" });
let stopping = false;
const stop = () => {
  if (stopping) return;
  stopping = true;
  child.kill("SIGTERM");
};
process.on("SIGTERM", stop);
process.on("SIGINT", stop);
child.on("error", (error) => {
  console.error(error.message);
  process.exitCode = 1;
});
child.on("exit", (code) => {
  process.exitCode = stopping ? 0 : (code ?? 1);
});
