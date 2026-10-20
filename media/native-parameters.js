// Native selectors, names and storage bounds come from the library inventory.
const selectedRecords = new Map();
export function nativeTargetLabel(target) {
  switch (target.kind) {
    case 'safety_communication': return 'Communication settings';
    case 'hsc_channel': return `Channel ${target.channel + 1}`;
    case 'pid_calculation': case 'pid_tuning': return 'Shared settings';
    case 'pid_calculation_loop': case 'pid_tuning_loop': return `Loop ${target.loop_index + 1}`;
    case 'position_axis': return `Axis ${['X','Y','Z','U'][target.axis_index] || target.axis_index + 1} settings`;
    case 'position_step': return `Axis ${['X','Y','Z','U'][target.axis_index] || target.axis_index + 1} · Step ${target.step_index + 1}`;
    default: return 'Unknown record';
  }
}
const hscChoices = {
  counter_mode: ['Linear counter', 'Ring counter'],
  pulse_input_mode: ['1-phase, 1-input, 1×', '1-phase, 2-input, 1×', 'CW/CCW', '2-phase, 4×'],
};
function fieldLabel(name) {
  return ({IPAddress:'IP address', Subnet:'Subnet mask', Gateway:'Gateway', RcvWaitTime:'Receive wait (s)', RetransTime:'Retransmission (×10 ms)', GlofaSocketCnt:'Dedicated connections', DriverType:'Driver', EnableHostTable:'Host table', counter_mode:'Counter mode', pulse_input_mode:'Pulse input mode', unit_time_ms:'Unit time (ms)', pulses_per_revolution:'Pulses per revolution'})[name]
    || name.replace(/^ENUM_/, '').replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2') + (name.startsWith('ENUM_') ? ' (code)' : '');
}
export function nativeIpv4(value) {
  return [0, 8, 16, 24].map(shift => (Number(value) >>> shift) & 255).join('.');
}
function isIpv4(field) {
  return field.target.kind === 'safety_communication' && ['IPAddress', 'Gateway', 'Subnet'].includes(field.name);
}
export function nativeParameterChanges(controls) {
  const changes = [];
  for (const {field, input} of controls) {
    let text = input.value;
    if (isIpv4(field)) {
      if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(text) || text.split('.').some(octet => Number(octet) > 255)) {
        throw new Error(`${field.name}: enter four decimal IPv4 octets from 0 to 255.`);
      }
      const octets = text.split('.').map(Number);
      if (field.name === 'Subnet') {
        const mask = octets.reduce((value, octet) => ((value << 8) | octet) >>> 0, 0);
        const inverse = (~mask) >>> 0;
        if ((inverse & ((inverse + 1) >>> 0)) !== 0) throw new Error('Subnet mask must contain contiguous leading ones.');
      }
      text = String(octets.reduce((value, octet, index) => value + octet * 2 ** (index * 8), 0));
    }
    if (!/^-?\d+$/.test(text) || !Number.isSafeInteger(Number(text))
      || Number(text) < field.minimum || Number(text) > field.maximum) {
      throw new Error(`${nativeTargetLabel(field.target)}: ${fieldLabel(field.name)} must be an integer from ${field.minimum} to ${field.maximum}.`);
    }
    const replacement = Number(text);
    if (replacement !== Number(field.value)) changes.push({target:field.target, name:field.name, expected:field.value, replacement});
  }
  return changes;
}
export function renderNativeParameters({host, parameter, element, property, button, commit, selectionKey}) {
  host.append(element('h3', '', parameter.parameterType.replace(' PARAMETER', '') + ' settings'));
  const fields = parameter.nativeFields || [];
  if (!fields.length) {
    host.append(element('p', 'selection-note', 'This parameter layout is read-only.'));
    return;
  }
  if (parameter.parameterType === 'HSC PARAMETER') {
    host.append(element('p', 'selection-note', 'Counter and pulse modes, unit time, and pulses per revolution are editable. Other fields are preserved.'));
  } else if (parameter.parameterType === 'FENET PARAMETER') {
    host.append(element('p', 'selection-note', 'Legacy FEnet addresses and settings. Module network settings are available in Networks. Channel mappings and host-table entries are preserved.'));
  } else {
    host.append(element('p', 'selection-note', 'Values use native integer encodings. Check the CPU manual for operating limits, option codes, and related settings.'));
  }
  const groups = new Map();
  fields.forEach(field => {
    const key = JSON.stringify(field.target);
    if (!groups.has(key)) groups.set(key, {target:field.target, fields:[]});
    groups.get(key).fields.push(field);
  });
  const selectorRow = element('label', 'property-field');
  selectorRow.append(element('span', 'property-label', 'Record'));
  const selector = document.createElement('select');
  selector.setAttribute('aria-label', 'Parameter record');
  for (const [key, group] of groups) {
    const option = element('option', '', nativeTargetLabel(group.target));
    option.value = key; selector.append(option);
  }
  if (selectionKey && groups.has(selectedRecords.get(selectionKey))) selector.value = selectedRecords.get(selectionKey);
  selectorRow.append(selector); host.append(selectorRow);
  const form = element('div', 'native-parameter-fields'); host.append(form);
  const controls = new Map();
  const panels = new Map();
  const status = element('p', 'selection-note', ''); status.setAttribute('role', 'status');
  let pending = false;
  const apply = button('Apply parameters', 'primary-button', async () => {
    if (!validate()) return;
    pending = true; validate();
    let failure;
    try { await commit(nativeParameterChanges(controls.values())); }
    catch (error) { failure = String(error); }
    finally {
      pending = false; validate();
      if (failure) { status.textContent = failure; status.classList.add('invalid'); }
    }
  });
  apply.textContent = 'Apply parameters';
  function validate() {
    try {
      const changes = nativeParameterChanges(controls.values());
      status.textContent = `${changes.length} changed field${changes.length === 1 ? '' : 's'}. Changes across records apply together.`;
      status.classList.remove('invalid'); apply.disabled = pending || !changes.length;
      return !pending && changes.length > 0;
    } catch (error) {
      status.textContent = error.message; status.classList.add('invalid'); apply.disabled = true; return false;
    }
  }
  function show() {
    for (const panel of panels.values()) panel.hidden = true;
    const key = selector.value;
    if (!panels.has(key)) {
      const panel = element('div', ''); panels.set(key, panel); form.append(panel);
      for (const field of groups.get(key).fields) {
        const choices = field.target.kind === 'hsc_channel' ? hscChoices[field.name]?.map((label,value)=>({label,value}))
          : field.target.kind === 'safety_communication' ? ({DriverType:[{value:2,label:'XGT server'},{value:5,label:'Modbus TCP/IP server'}],EnableHostTable:[{value:0,label:'Disabled'},{value:1,label:'Enabled'}]})[field.name] : null;
        let input;
        if (choices) {
          const row = element('label', 'property-field'); row.append(element('span', 'property-label', fieldLabel(field.name)));
          input = document.createElement('select');
          choices.forEach(({label, value}) => {const option = element('option', '', label); option.value = String(value); input.append(option);});
          input.value = field.value; row.append(input); panel.append(row);
        } else if (isIpv4(field)) {
          input = property(panel, fieldLabel(field.name), nativeIpv4(field.value), false);
          input.type = 'text';
        } else {
          input = property(panel, fieldLabel(field.name), field.value, false);
          input.type = 'number'; input.step = '1'; input.min = String(field.minimum); input.max = String(field.maximum);
        }
        input.setAttribute('aria-label', fieldLabel(field.name));
        input.title = `${field.name} · ${field.minimum} to ${field.maximum}`;
        controls.set(key + ':' + field.name, {field, input});
        input.addEventListener('input', validate); input.addEventListener('change', validate);
      }
    }
    panels.get(key).hidden = false; validate();
  }
  selector.addEventListener('change', () => {
    if (selectionKey) selectedRecords.set(selectionKey, selector.value);
    show();
  });
  host.append(status, apply); show();
}
