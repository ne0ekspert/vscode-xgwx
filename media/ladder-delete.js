// Shared keyboard guard: do not intercept repeats or modified editing shortcuts.
export function isLadderDeleteKey(event) {
  return ['Delete', 'Backspace'].includes(event.key) && !event.repeat
    && !event.ctrlKey && !event.metaKey && !event.altKey && !event.shiftKey;
}
