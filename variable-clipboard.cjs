// Keep clipboard access in the extension host so it works across editor tabs.
async function variableClipboard(clipboard, request) {
  try {
    if (request.action === 'write') {
      if (typeof request.text !== 'string' || request.text.length > 1024 * 1024) throw new Error('Variable clipboard must fit 1 MiB of text.');
      await clipboard.writeText(request.text);
      return {value: null};
    }
    if (request.action === 'read') {
      const value = await clipboard.readText();
      if (value.length > 1024 * 1024) throw new Error('Variable clipboard must fit 1 MiB of text.');
      return {value};
    }
    throw new Error('Unknown variable clipboard action.');
  } catch (error) { return {error: String(error)}; }
}
module.exports = {variableClipboard};
