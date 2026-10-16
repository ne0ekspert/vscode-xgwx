// Native EOPCT settings use the library's field names and validation.
const fields = {
  applicationName: ['Application name', 'text'],
  port: ['OPC UA port', 'number', 1, 65535],
  publishingInterval: ['Minimum publishing interval (ms)', 'number', 20, 1000],
  samplingInterval: ['Minimum sampling interval (ms)', 'number', 20, 1000],
  nodeIdType: ['Node ID type', 'select', [[0, 'Numeric'], [1, 'String']]],
  securityPolicy: ['Security policies', 'policies'],
  acceptAllClientCertificates: ['Accept all client certificates', 'boolean'],
  allowAnonymous: ['Allow anonymous access', 'boolean'],
  allowUsernamePassword: ['Allow username and password access', 'boolean'],
  relay: ['Relay', 'boolean'], snmpEnabled: ['SNMP enabled', 'boolean'],
  autoNegotiationSpeedLimit: ['Limit auto negotiation to 100 Mbps', 'boolean'],
  sntpEnabled: ['NTP time synchronization', 'boolean'],
  sntpPowerOnReset: ['Synchronize time at power on', 'boolean'],
};
const policies = ['No security', 'Basic128Rsa15 · Sign', 'Basic128Rsa15 · Sign & Encrypt', 'Basic256 · Sign', 'Basic256 · Sign & Encrypt', 'Basic256Sha256 · Sign', 'Basic256Sha256 · Sign & Encrypt'];
export function renderOpcUaOptions({host, config, element, property, button, commit, validateChanges}) {
  const section = element('section', 'opcua-options');
  host.append(section); host = section;
  host.append(element('div', 'network-config-heading', 'EOPCT · OPC UA server'));
  const controls = [];
  for (const setting of config.fields) {
    const schema = fields[setting.field];
    if (!schema) continue;
    const [label, kind, options, maximum] = schema;
    if ((kind === 'boolean' && !['0', '1'].includes(setting.value)) ||
        (kind === 'policies' && (!/^\d+$/.test(setting.value) || Number(setting.value) < 1 || Number(setting.value) > 127))) {
      property(host, label, `Unknown (${setting.value})`, true);
      continue;
    }
    let readValue;
    if (kind === 'policies') {
      const group = element('fieldset', 'module-option-group');
      group.append(element('legend', '', label));
      const checkboxes = policies.map((name, i) => {
        const row = element('label', 'property-field property-checkbox');
        const input = document.createElement('input'); input.type = 'checkbox';
        input.checked = (Number(setting.value) & (1 << i)) !== 0;
        input.setAttribute('aria-label', name);
        row.append(element('span', 'property-label', name), input); group.append(row); return input;
      });
      host.append(group);
      readValue = () => String(checkboxes.reduce((mask, input, i) => mask | (input.checked ? 1 << i : 0), 0));
    } else if (kind === 'select') {
      const row = element('label', 'property-field'); row.append(element('span', 'property-label', label));
      const select = document.createElement('select'); select.setAttribute('aria-label', label);
      const choices = [...options];
      if (!choices.some(([value]) => String(value) === setting.value)) choices.push([setting.value, `Unknown (${setting.value})`]);
      for (const [value, text] of choices) { const option = element('option', '', text); option.value = String(value); select.append(option); }
      select.value = setting.value; row.append(select); host.append(row); readValue = () => select.value;
    } else {
      const input = property(host, label, setting.value, false); input.setAttribute('aria-label', label);
      if (kind === 'boolean') {
        input.type = 'checkbox'; input.checked = setting.value === '1'; input.parentElement.classList.add('property-checkbox');
        readValue = () => input.checked ? '1' : '0';
      } else {
        if (kind === 'number') { input.type = 'number'; input.min = String(options); input.max = String(maximum); input.step = '1'; }
        readValue = () => input.value;
      }
    }
    controls.push({setting, readValue});
  }
  property(host, 'Server endpoint', config.endpoint, true);
  const error = element('p', 'module-selection-error', ''); error.setAttribute('role', 'alert');
  const changes = () => controls.map(({setting, readValue}) => ({field: setting.field, expectedValue: setting.value, replacement: readValue()})).filter(c => c.expectedValue !== c.replacement);
  const apply = button('Apply OPC UA settings', 'primary-button', () => commit(changes()));
  apply.textContent = 'Apply OPC UA settings';
  const validate = () => {
    const edits = changes(); apply.disabled = edits.length === 0; error.textContent = '';
    if (!edits.length) return;
    try { validateChanges(edits); } catch (e) { error.textContent = String(e); apply.disabled = true; }
  };
  host.addEventListener('input', validate); host.addEventListener('change', validate);
  host.append(error, apply); validate();
}
