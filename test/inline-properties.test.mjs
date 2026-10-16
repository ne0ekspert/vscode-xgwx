import assert from 'node:assert/strict';
import test from 'node:test';
import { createInlineProperties } from '../media/inline-properties.js';

// Minimal DOM fixture: tests the lifecycle without introducing a DOM dependency.
class Node extends EventTarget {
  constructor(document) {
    super();
    this.ownerDocument = document;
    this.children = [];
    this.cells = [];
    this.dataset = {};
    this.attributes = new Map();
  }
  setAttribute(key, value) { this.attributes.set(key, value); }
  getAttribute(key) { return this.attributes.get(key); }
  insertCell() { const node = new Node(this.ownerDocument); this.cells.push(node); this.children.push(node); return node; }
  after(node) { this.detail = node; }
  prepend(node) { this.children.unshift(node); }
  replaceChildren(...nodes) { this.children = nodes; }
  contains(node) { return this === node || this.children.some(child => child.contains(node)); }
  focus() { this.ownerDocument.activeElement = this; }
}
function fixture() {
  const document = { createElement: () => new Node(document) };
  const panels = createInlineProperties();
  const attach = (key, uri = 'first.xgwx') => {
    const row = new Node(document);
    row.insertCell();
    let renders = 0, selects = 0;
    const controller = panels.attach({ uri, key, row, label: key,
      render(host) { renders++; host.draft = ''; }, onSelect() { selects++; },
    });
    return { row, controller, toggle: row.cells[0].children[0],
      get content() { return row.detail.cells[0].children[0]; },
      get renders() { return renders; }, get selects() { return selects; },
    };
  };
  return { panels, attach };
}
const click = node => node.dispatchEvent(new Event('click'));

test('rows start collapsed, open independently, and keep form state when remounted', () => {
  const { attach } = fixture();
  const first = attach('base:0:slot:0'), second = attach('base:0:slot:1');
  assert.equal(first.row.detail.hidden, true);
  assert.equal(first.renders, 0);
  click(first.toggle); click(second.toggle);
  assert.equal(first.row.getAttribute('aria-expanded'), 'true');
  assert.equal(second.row.getAttribute('aria-expanded'), 'true');
  first.content.draft = 'Unapplied comment';
  const content = first.content;
  click(first.toggle); click(first.toggle);
  assert.equal(first.content, content);
  assert.equal(first.renders, 1);
  const remounted = attach('base:0:slot:0');
  assert.equal(remounted.content, content);
  assert.equal(remounted.content.draft, 'Unapplied comment');
  assert.equal(remounted.renders, 0);
});

test('document revisions reset forms and drafts while retaining expansion', () => {
  const { panels, attach } = fixture();
  const first = attach('slot:0'); click(first.toggle); first.content.draft = 'Old draft';
  panels.invalidate('first.xgwx');
  const next = attach('slot:0');
  assert.equal(next.row.detail.hidden, false);
  assert.notEqual(next.content, first.content);
  assert.equal(next.content.draft, '');
  assert.equal(next.renders, 1);
});

test('documents and base identities do not share drafts or expansion', () => {
  const { attach } = fixture();
  const first = attach('base:0:slot:0'); click(first.toggle); first.content.draft = 'Local';
  const otherBase = attach('base:1:slot:0'), otherDocument = attach('base:0:slot:0', 'second.xgwx');
  assert.equal(otherBase.row.detail.hidden, true);
  assert.equal(otherDocument.row.detail.hidden, true);
  click(otherDocument.toggle);
  assert.equal(otherDocument.content.draft, '');
  assert.equal(first.content.draft, 'Local');
});

test('explorer can open a target and pruning removes deleted row state', () => {
  const { panels, attach } = fixture();
  panels.open('first.xgwx', 'network:0');
  const first = attach('network:0');
  assert.equal(first.row.detail.hidden, false);
  panels.prune('first.xgwx', new Set());
  const recreated = attach('network:0');
  assert.equal(recreated.row.detail.hidden, true);
  assert.equal(recreated.content, undefined);
});

test('buttons select their own row and expose matching accessibility controls', () => {
  const { attach } = fixture();
  const first = attach('slot:0'), second = attach('slot:1');
  click(first.toggle); click(second.toggle);
  assert.equal(first.selects, 1);
  assert.equal(second.selects, 1);
  assert.equal(first.toggle.getAttribute('aria-controls'), first.row.detail.cells[0].id);
  assert.notEqual(first.toggle.getAttribute('aria-controls'), second.toggle.getAttribute('aria-controls'));
  first.content.focus(); click(first.toggle);
  assert.equal(first.row.ownerDocument.activeElement, first.toggle);
  assert.equal(first.toggle.getAttribute('aria-expanded'), 'false');
});

test('keyboard toggles prevent scrolling and the second double-click event does not retoggle', () => {
  const { attach } = fixture();
  const first = attach('slot:0');
  const key = new Event('keydown', { cancelable: true });
  Object.defineProperty(key, 'key', { value: ' ' });
  first.row.dispatchEvent(key);
  assert.equal(key.defaultPrevented, true);
  assert.equal(first.row.getAttribute('aria-expanded'), 'true');
  const secondClick = new Event('click');
  Object.defineProperty(secondClick, 'detail', { value: 2 });
  first.row.dispatchEvent(secondClick);
  assert.equal(first.row.getAttribute('aria-expanded'), 'true');
});
