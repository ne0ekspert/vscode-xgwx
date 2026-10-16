// Retain the actual form nodes so validation state and drafts survive navigation.
// A new document revision drops forms, while surviving row expansion stays open.
export function createInlineProperties() {
  const documents = new Map();
  let nextId = 0;
  const state = uri => {
    if (!documents.has(uri)) documents.set(uri, new Map());
    return documents.get(uri);
  };
  const entry = (uri, key) => {
    const rows = state(uri);
    if (!rows.has(key)) rows.set(key, { open: false, content: null });
    return rows.get(key);
  };
  return {
    open(uri, key) { entry(uri, key).open = true; },
    invalidate(uri) {
      for (const item of state(uri).values()) item.content = null;
    },
    prune(uri, keys) {
      const rows = state(uri);
      for (const key of rows.keys()) if (!keys.has(key)) rows.delete(key);
    },
    attach({ uri, key, row, label, render, onSelect = () => {} }) {
      const item = entry(uri, key);
      const document = row.ownerDocument;
      const detail = document.createElement('tr');
      detail.className = 'inline-detail-row';
      const cell = detail.insertCell();
      cell.colSpan = row.cells.length;
      row.after(detail);
      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'inline-properties-toggle';
      toggle.setAttribute('aria-label', `Properties for ${label}`);
      toggle.setAttribute('aria-controls', `inline-properties-${++nextId}`);
      cell.id = toggle.getAttribute('aria-controls');
      row.dataset.inlineKey = key;
      row.cells[0].prepend(toggle);
      const update = () => {
        detail.hidden = !item.open;
        row.setAttribute('aria-expanded', String(item.open));
        toggle.setAttribute('aria-expanded', String(item.open));
        toggle.textContent = item.open ? '▾' : '▸';
        if (item.open) {
          if (!item.content) {
            item.content = document.createElement('div');
            item.content.className = 'inline-properties';
            item.content.setAttribute('role', 'region');
            item.content.setAttribute('aria-label', `${label} properties`);
            render(item.content);
          }
          cell.replaceChildren(item.content);
        }
      };
      const select = () => onSelect();
      const toggleOpen = () => {
        select();
        if (item.open && detail.contains(document.activeElement)) toggle.focus();
        item.open = !item.open;
        update();
      };
      toggle.addEventListener('click', event => { event.stopPropagation(); toggleOpen(); });
      row.addEventListener('click', event => { if (event.detail <= 1) toggleOpen(); });
      row.addEventListener('keydown', event => {
        if (event.target !== row || !['Enter', ' '].includes(event.key)) return;
        event.preventDefault();
        toggleOpen();
      });
      update();
      return { select, open() { item.open = true; update(); } };
    },
  };
}
