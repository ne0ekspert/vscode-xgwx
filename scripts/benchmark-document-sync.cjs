// Synthetic extension-host work only; excludes VS Code IPC and webview parsing.
const Module = require('node:module');
const { performance } = require('node:perf_hooks');
const load = Module._load;
Module._load = function(request, ...args) {
  if (request === 'vscode') return { EventEmitter: class { event = () => {}; } };
  return load.call(this, request, ...args);
};
const { XgwxDocument, XgwxEditorProvider } = require('../extension.js');
Module._load = load;
const size = Number(process.argv[2] || 1048576);
const iterations = Number(process.argv[3] || 30);
if (!Number.isSafeInteger(size) || size <= 0 || !Number.isSafeInteger(iterations) || iterations <= 0) {
  throw new Error('Usage: node scripts/benchmark-document-sync.cjs [bytes>0] [iterations>0]');
}
(async () => {
  const document = new XgwxDocument({ fsPath:'/synthetic.xgwx', toString:()=>'synthetic' }, new Uint8Array(size));
  const results = [];
  for (const siblings of [1, 2, 4]) {
    const provider = new XgwxEditorProvider({});
    let received = 0;
    for (let i = 0; i < siblings; i++) provider.editors.add({ document, panel:{ webview:{ postMessage: async message => {
      if (message.bytes.length !== size) throw new Error('Incomplete broadcast');
      received++;
    } } } });
    for (let i = 0; i < 5; i++) await provider.broadcast(document);
    received = 0;
    const start = performance.now();
    for (let i = 0; i < iterations; i++) await provider.broadcast(document);
    results.push({ siblings, averageMs:(performance.now()-start)/iterations, messages:received });
  }
  console.log(JSON.stringify({ bytes:size, iterations, results }, null, 2));
})().catch(error => { console.error(error); process.exitCode = 1; });
