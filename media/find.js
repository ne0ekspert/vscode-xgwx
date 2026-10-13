import {ilCode} from "./il-editor.js";

// Literal search: never interpret PLC addresses or source as regular expressions.
export function findRanges(text, query, matchCase = false) {
  if (!query) return [];
  // Preserve UTF-16 offsets even when Unicode case folding changes string length.
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return [...text.matchAll(new RegExp(escaped, matchCase ? 'gu' : 'giu'))]
    .map(match => ({start: match.index, end: match.index + match[0].length}));
}

function iecAddressKey(value, matchCase = false) {
  const match = /^%([a-z]+)(\d+(?:\.\d+)*)$/i.exec(value);
  if (!match) return null;
  const area = matchCase ? match[1] : match[1].toUpperCase();
  return `%${area}${match[2].split('.').map(part => part.replace(/^0+(?=\d)/, '')).join('.')}`;
}

function addressMatches(address, queryKey, matchCase) {
  const key = iecAddressKey(address, matchCase);
  return key === queryKey || key?.startsWith(`${queryKey}.`);
}

// Resolve references using this program's declarations before global/system names.
// Alias matches retain the displayed/source offsets so navigation highlights the reference.
export function createProgramFindRanges(summary, programIndex) {
  const variables = [
    ...(summary.localVariables?.[programIndex] || []),
    ...(summary.textPrograms?.find(program => program.programIndex === programIndex)?.variables || []),
    ...(summary.sfc?.find(program => program.programIndex === programIndex)?.variables || []),
    ...(summary.variables || []),
    ...(summary.iecSystemVariables || []),
  ];
  const names = new Map(), addresses = new Map();
  for (const variable of variables) {
    if (!variable.name) continue;
    const key = variable.name.toUpperCase();
    if (!names.has(key)) names.set(key, variable);
  }
  for (const variable of names.values()) {
    if (!variable.address) continue;
    const key = iecAddressKey(variable.address) || variable.address.toUpperCase();
    if (!addresses.has(key)) addresses.set(key, []);
    addresses.get(key).push(variable);
  }
  return (text, query, matchCase = false, {references = text} = {}) => {
    const literalRanges = findRanges(text, query, matchCase);
    if (!query) return literalRanges;
    const ranges = [];
    let literalIndex = 0;
    const queryAddress = iecAddressKey(query, matchCase);
    for (const token of references.matchAll(/[%_\p{L}][\p{L}\p{N}_]*(?:\.[\p{L}\p{N}_]+)*/gu)) {
      const start = token.index, end = start + token[0].length;
      // Both streams are ordered and non-overlapping. Keep a crossing literal
      // pending until it ends or an address token replaces it.
      while (literalIndex < literalRanges.length && literalRanges[literalIndex].end <= start) {
        ranges.push(literalRanges[literalIndex++]);
      }
      const tokenAddress = iecAddressKey(token[0]);
      let addressMatch = false;
      if (queryAddress && tokenAddress) {
        // Address queries compare numeric components, retaining original source offsets.
        while (literalIndex < literalRanges.length && literalRanges[literalIndex].start < end) literalIndex++;
        addressMatch = addressMatches(token[0], queryAddress, matchCase);
        if (addressMatch) ranges.push({start, end});
      }
      const key = token[0].toUpperCase();
      const named = names.get(key);
      const aliases = named ? [named.address] : (addresses.get(tokenAddress || key) || []).map(variable => variable.name);
      if (aliases.some(alias => alias && (queryAddress && iecAddressKey(alias)
        ? addressMatches(alias, queryAddress, matchCase) : findRanges(alias, query, matchCase).length))) {
        if (!addressMatch && (literalIndex === literalRanges.length || literalRanges[literalIndex].start >= end)) ranges.push({start, end});
      }
    }
    while (literalIndex < literalRanges.length) ranges.push(literalRanges[literalIndex++]);
    return ranges;
  };
}

export function createFindController(doc = document) {
  let root, bar, input, count, caseButton, context, opened = false, query = '', matchCase = false;
  let matches = [], index = -1, previousFocus, onQuery, onClose, searchRanges = findRanges;
  const mirrors = new WeakMap();
  const clear = () => {
    root?.querySelectorAll('.find-match, .find-current').forEach(node => node.classList.remove('find-match', 'find-current'));
    root?.querySelectorAll('.find-source-overlay').forEach(node => node.remove());
  };
  const reveal = () => {
    root?.querySelectorAll('.find-current').forEach(node => node.classList.remove('find-current'));
    count.textContent = matches.length ? `${index + 1} of ${matches.length}` : query ? 'No results' : '0 results';
    const match = matches[index];
    if (!match) return;
    const {node, start, end} = match;
    (match.mark || node).classList.add('find-current');
    node.closest('details')?.setAttribute('open', '');
    node.scrollIntoView({block: 'center', inline: 'nearest'});
    if (node.tagName === 'TEXTAREA') {
      node.setSelectionRange(start, end);
      const line = node.value.slice(0, start).split('\n').length - 1;
      node.scrollTop = Math.max(0, (line - 3) * (parseFloat(getComputedStyle(node).lineHeight) || 22));
      node.dispatchEvent(new Event('scroll'));
    }
  };
  const refresh = () => {
    clear();
    onQuery?.(query, matchCase);
    matches = [];
    // Search meaningful program elements, not toolbar labels or diagnostics.
    for (const node of root.querySelectorAll('[data-find-text], .st-source-input, .text-program-readonly, .ld-cell, .ld-rung-comment, .ld-output-comment, .iec-layout-marker:not(.horizontal-wire):not(.vertical-wire), .iec-layout-pin-label, .sfc-entity, .sfc-st-preview')) {
      const text = node.dataset.findText ?? (node.tagName === 'TEXTAREA' ? node.value : node.textContent);
      let references = text || '';
      if (node.matches('.ld-rung-comment, .ld-output-comment, .iec-layout-marker.comment')) {
        references = '';
      } else if (node.matches('.st-source-input, .text-program-readonly, .sfc-st-preview')) {
        // Keep comments and quoted text searchable literally, but never resolve aliases in them.
        references = ilCode(references).code.replace(/^\s*Comment:[^\r\n]*/gmi, value => ' '.repeat(value.length));
      } else if (node.matches('.sfc-entity')) {
        const walker = doc.createTreeWalker(node, 4); // Text nodes, in textContent order.
        references = '';
        while (walker.nextNode()) {
          const part = walker.currentNode;
          references += part.parentElement.closest('.sfc-comment') ? ' '.repeat(part.textContent.length) : part.textContent;
        }
      }
      const ranges = searchRanges(text || '', query, matchCase, {references});
      // Diagram cells and variable rows are navigated once per element.
      for (const range of node.tagName === 'TEXTAREA' || node.matches('.text-program-readonly') ? ranges : ranges.slice(0, 1)) matches.push({node, ...range});
      if (ranges.length && node.tagName === 'TEXTAREA') {
        const overlay = doc.createElement('div'); overlay.className = 'find-source-overlay'; overlay.setAttribute('aria-hidden', 'true');
        const mirror = doc.createElement('pre'); overlay.append(mirror);
        let offset = 0;
        const nodeMatches = matches.filter(match => match.node === node);
        nodeMatches.forEach(match => {
          mirror.append(doc.createTextNode(text.slice(offset, match.start)));
          const mark = doc.createElement('mark'); mark.textContent = text.slice(match.start, match.end); mark.className = 'find-match';
          mirror.append(mark); match.mark = mark; offset = match.end;
        });
        mirror.append(doc.createTextNode(text.slice(offset)));
        node.parentElement.append(overlay);
        mirrors.set(node, mirror);
        const sync = () => { const target = mirrors.get(node); if (target?.isConnected) target.style.transform = `translate(${-node.scrollLeft}px, ${-node.scrollTop}px)`; };
        if (!node.dataset.findScrollBound) {node.addEventListener('scroll', sync); node.dataset.findScrollBound = 'true';}
        sync();
      } else if (ranges.length) node.classList.add('find-match');
    }
    index = matches.length ? 0 : -1;
    reveal();
  };
  const move = delta => {
    if (!matches.length) return;
    index = (index + delta + matches.length) % matches.length;
    reveal();
  };
  const close = () => {
    if (!opened) return;
    opened = false; bar.hidden = true; clear(); onClose?.();
    if (previousFocus?.isConnected) previousFocus.focus({preventScroll: true});
  };
  const open = () => {
    if (!root?.isConnected) return;
    if (!opened) previousFocus = doc.activeElement;
    opened = true; bar.hidden = false; refresh(); input.focus(); input.select();
  };
  doc.addEventListener('keydown', event => {
    if (!root?.isConnected) return;
    if ((event.ctrlKey || event.metaKey) && !event.altKey && event.key.toLowerCase() === 'f') {
      event.preventDefault(); event.stopImmediatePropagation(); open();
    } else if (opened && (event.key === 'F3' || (bar.contains(event.target) && event.key === 'Enter'))) {
      event.preventDefault(); event.stopImmediatePropagation(); move(event.shiftKey ? -1 : 1);
    } else if (opened && event.key === 'Escape') {
      event.preventDefault(); event.stopImmediatePropagation(); close();
    }
  }, true);
  return {
    open,
    bind(nextRoot, nextContext, options = {}) {
      clear();
      if (context !== nextContext) opened = false;
      context = nextContext; root = nextRoot; onQuery = options.onQuery; onClose = options.onClose; searchRanges = options.findRanges || findRanges;
      if (!root) return;
      bar = doc.createElement('div'); bar.className = 'find-bar'; bar.hidden = !opened;
      bar.setAttribute('role', 'search'); bar.setAttribute('aria-label', 'Find in current view');
      input = doc.createElement('input'); input.type = 'search'; input.placeholder = 'Find…'; input.value = query; input.setAttribute('aria-label', 'Find');
      count = doc.createElement('span'); count.className = 'find-count'; count.setAttribute('role', 'status');
      const control = (label, text, handler) => {
        const button = doc.createElement('button'); button.type = 'button'; button.textContent = text; button.title = label; button.setAttribute('aria-label', label); button.addEventListener('click', handler); return button;
      };
      caseButton = control('Match case', 'Aa', () => { matchCase = !matchCase; caseButton.setAttribute('aria-pressed', String(matchCase)); refresh(); });
      caseButton.setAttribute('aria-pressed', String(matchCase));
      bar.append(input, caseButton, count, control('Previous match (Shift+Enter)', '↑', () => move(-1)), control('Next match (Enter)', '↓', () => move(1)), control('Close find (Escape)', '×', close));
      input.addEventListener('input', () => {query = input.value; refresh();});
      root.prepend(bar);
      root.addEventListener('input', event => {
        const source = event.target;
        if (!opened || !source.matches('.st-source-input')) return;
        const {selectionStart, selectionEnd, scrollTop, scrollLeft} = source;
        refresh();
        source.setSelectionRange(selectionStart, selectionEnd);
        source.scrollTop = scrollTop; source.scrollLeft = scrollLeft;
        source.dispatchEvent(new Event('scroll'));
      });
      if (opened) refresh();
    },
  };
}
