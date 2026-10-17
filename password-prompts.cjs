// Passwords live only for this request; never write them to extension state.
async function promptPassword(window, { title, action = "unlock", protected: protectedValue = false }) {
  const ask = prompt => window.showInputBox({ title, prompt, password: true, ignoreFocusOut: true });
  const current = action === "unlock" || protectedValue ? await ask("Current password") : undefined;
  if ((action === "unlock" || protectedValue) && current === undefined) return null;
  if (action === "unlock") return { current };
  if (action === "remove") return { current, replacement: null };
  const replacement = await ask("New password (1–8 characters)");
  if (replacement === undefined) return null;
  const confirmation = await ask("Confirm new password");
  if (confirmation === undefined) return null;
  if (replacement !== confirmation) { await window.showErrorMessage("Passwords do not match."); return null; }
  if (!replacement || [...replacement].length > 8 || replacement.includes("\0")) {
    await window.showErrorMessage("Password must contain 1–8 characters without NUL."); return null;
  }
  return { current: current ?? null, replacement };
}
module.exports = { promptPassword };
