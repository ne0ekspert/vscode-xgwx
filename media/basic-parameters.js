// Native encodings and legal choices come from libxgwx's verified schema.
export function renderBasicParameters({host, parameter, element, property, button, commit}) {
  host.append(element('h3', '', 'Basic operation settings'));
  const controls = (parameter.basicOperationFields || []).map(field => {
    const schema = field.control;
    let input;
    if (schema.kind === 'select') {
      const row = element('label', 'property-field');
      row.append(element('span', 'property-label', field.label));
      input = document.createElement('select');
      for (const choice of schema.choices) {
        const option = element('option', '', choice.label);
        option.value = String(choice.value); input.append(option);
      }
      input.value = field.value; row.append(input); host.append(row);
    } else {
      input = property(host, field.label, field.value, false);
      if (schema.kind === 'checkbox') {
        input.type = 'checkbox'; input.checked = Number(field.value) === schema.checked;
        input.parentElement.classList.add('property-checkbox');
      } else {
        input.type = 'number'; input.min = String(schema.minimum); input.max = String(schema.maximum); input.step = '1';
        input.title = `${schema.minimum}–${schema.maximum} ms`;
      }
    }
    input.setAttribute('aria-label', field.label);
    const read = () => schema.kind === 'checkbox' ? (input.checked ? schema.checked : schema.unchecked) : Number(input.value);
    return {field, input, read};
  });
  const byName = new Map(controls.map(control => [control.field.name, control]));
  const switches = [['RESET_DISABLE', 'O_RESET_DISABLE'], ['DCLEAR_DISABLE', 'O_DCLEAR_DISABLE']];
  for (const [parentName, overallName] of switches) {
    const parent = byName.get(parentName), overall = byName.get(overallName);
    parent?.input.addEventListener('change', () => {
      // XG5000 changes both when the full-switch block is toggled.
      if (overall) overall.input.checked = parent.input.checked;
      validate();
    });
  }
  const status = element('p', 'selection-note', ''); status.setAttribute('role', 'status');
  const changes = () => controls.filter(c => c.read() !== Number(c.field.value)).map(c => ({
    name: c.field.name, expected: c.field.value, replacement: c.read(),
  }));
  const apply = button('Apply basic parameters', 'primary-button', async () => {
    if (validate()) await commit(changes());
  });
  apply.textContent = 'Apply basic parameters';
  function validate() {
    for (const [parentName, overallName] of switches) {
      const parent = byName.get(parentName), overall = byName.get(overallName);
      if (overall) overall.input.disabled = !parent || parent.input.checked;
    }
    const cycle = byName.get('STATIC_PERIOD_TIME'), mode = byName.get('STATIC_PERIOD_MODE');
    if (cycle) cycle.input.disabled = !mode || !mode.input.checked;
    const invalid = controls.find(c => c.field.control.kind === 'number' && (!/^\d+$/.test(c.input.value)
      || !Number.isSafeInteger(c.read()) || c.read() < c.field.control.minimum || c.read() > c.field.control.maximum));
    status.textContent = invalid ? `${invalid.field.label} must be an integer from ${invalid.field.control.minimum} to ${invalid.field.control.maximum}.`
      : 'Changes apply together. Other parameter tabs are preserved.';
    status.classList.toggle('invalid', Boolean(invalid));
    apply.disabled = Boolean(invalid) || changes().length === 0;
    return !invalid && changes().length > 0;
  }
  if (controls.length) {
    controls.forEach(({input}) => {input.addEventListener('input', validate); input.addEventListener('change', validate);});
    host.append(status, apply); validate();
  } else {
    host.append(element('p', 'selection-note', 'This basic-parameter layout is read-only.'));
  }
  for (const section of parameter.sections || []) {
    const details = element('details', '');
    details.append(element('summary', '', `${section.name} · all stored fields (${section.attributes?.length || 0})`));
    for (const {name, value} of section.attributes || []) property(details, name, value, true);
    host.append(details);
  }
}
