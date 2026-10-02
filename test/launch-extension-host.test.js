const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const { once } = require("node:events");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
test("development launcher keeps its host alive and closes it on Stop", { timeout: 5000 }, async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "xgwx-launch-test-"));
  const captured = path.join(dir, "started.json");
  const stopped = path.join(dir, "stopped");
  const fake = path.join(dir, "fake-code");
  await fs.writeFile(fake, `#!/usr/bin/env node
const fs = require("node:fs");
fs.writeFileSync(process.env.XGWX_TEST_CAPTURE, JSON.stringify({
  args: process.argv.slice(2),
  nodeOptions: process.env.NODE_OPTIONS,
  inspector: process.env.VSCODE_INSPECTOR_OPTIONS,
  ipc: process.env.VSCODE_IPC_HOOK_CLI
}));
process.on("SIGTERM", () => {
  fs.writeFileSync(process.env.XGWX_TEST_STOPPED, "stopped");
  process.exit(0);
});
setInterval(() => {}, 1000);
`, { mode: 0o755 });
  const launcher = spawn(process.execPath, [path.resolve(__dirname, "../scripts/launch-extension-host.cjs"), fake, dir, "9230"], {
    env: { ...process.env, NODE_OPTIONS: "--no-warnings", VSCODE_INSPECTOR_OPTIONS: "parent-inspector", VSCODE_IPC_HOOK_CLI: "parent-ipc", XGWX_TEST_CAPTURE: captured, XGWX_TEST_STOPPED: stopped },
    stdio: "ignore",
  });
  try {
    for (let i = 0; i < 100; i++) {
      try { await fs.access(captured); break; } catch { await pause(20); }
    }
    const started = JSON.parse(await fs.readFile(captured, "utf8"));
    assert.ok(started.args.includes(`--extensionDevelopmentPath=${dir}`));
    assert.ok(started.args.includes("--inspect-extensions=9230"));
    assert.equal(started.nodeOptions, undefined);
    assert.equal(started.inspector, undefined);
    assert.equal(started.ipc, undefined);
    assert.equal(launcher.exitCode, null);
    const exited = once(launcher, "exit");
    launcher.kill("SIGTERM");
    assert.deepEqual(await exited, [0, null]);
    assert.equal(await fs.readFile(stopped, "utf8"), "stopped");
  } finally {
    if (launcher.exitCode === null) launcher.kill("SIGTERM");
    await fs.rm(dir, { recursive: true, force: true });
  }
});
