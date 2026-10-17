// Task identity includes its PLC because task names can repeat across configurations.
export function taskKey(task) {
  const d = task.definition || {};
  return `task:${encodeURIComponent(task.expected?.configuration_guid || `plc-${task.configurationIndex}`)}:${encodeURIComponent(d.name || '')}:${d.kind}:${d.task_index}`;
}
export function editableTask(task) {
  const d = task?.definition;
  return Boolean(task?.expected && task.creationSupported && task.settings && d?.version === 257
    && d.type_code === 0 && d.attribute === 2 && [1, 2, 3].includes(d.kind));
}
export function taskProgramCreation(summary, task) {
  const d = task?.definition;
  return Boolean(task?.expected && !task.membershipError && [0, 1, 2, 3].includes(d?.kind)
    && d.version === 257 && d.type_code === 0 && d.attribute === 2
    && summary.counts?.configurations === 1 && summary.programLanguages?.length);
}
export function taskSchedule(task) {
  const t = task.settings?.trigger;
  if (task.definition?.kind === 0) return 'Scan';
  if (t?.kind === 'initialization') return 'Initialization';
  if (t?.kind === 'periodic') return `Every ${t.interval_ms} ms`;
  if (t?.kind === 'internal_bit') return `${t.device} · ${t.condition}`;
  if (t?.kind === 'internal_word') return `${t.device} ${wordSymbols[t.condition]} ${t.value}`;
  return `Native kind ${task.definition?.kind ?? '?'}`;
}
const wordSymbols = {less:'<',less_or_equal:'≤',equal:'=',greater_or_equal:'≥',greater:'>'};
const bitChoices = [['rising','Rising edge'],['falling','Falling edge'],['changed','Either edge'],['on','On'],['off','Off']];
const wordChoices = Object.entries(wordSymbols);
const triggers = [['periodic','Periodic'],['initialization','Initialization'],['internal_bit','Internal bit device'],['internal_word','Internal word device']];
const el = (tag, cls, text) => { const n=document.createElement(tag); if(cls)n.className=cls; if(text != null)n.textContent=text;return n; };
const btn = (name, action, cls='secondary-button') => {const n=el('button',cls,name);n.type='button';n.addEventListener('click',action);return n;};
function field(host, name, value, choices) {
  const label=el('label','property-field');label.append(el('span','property-label',name));
  const input=el(choices?'select':'input');
  if(choices) for(const [value,text] of choices) {const option=el('option','',text);option.value=value;input.append(option);}
  input.value=String(value ?? '');input.setAttribute('aria-label',name);label.append(input);host.append(label);return input;
}
function number(host,label,value,min,max) {const n=field(host,label,value);n.type='number';n.min=min;n.max=max;n.step=1;return n;}
export function nextTaskNumber(tasks, configurationIndex, kind, excludeIndex) {
  const [min,max] = kind.startsWith('internal_') ? [64,95] : [0,31];
  const used=new Set(tasks.filter(t=>t.configurationIndex===configurationIndex && t.index!==excludeIndex && [2,3].includes(t.definition.kind)).map(t=>t.definition.task_index));
  for(let n=min;n<=max;n++)if(!used.has(n))return n;
  return min;
}
export function renderTaskWorkspace(canvas, inspector, options) {
  const {summary, selectedKey, creating, onSelect, onNew, onCancel, onSave, onDelete, onCreateProgram, onOpenProgram}=options;
  const tasks=summary.tasks || [];
  canvas.append(el('h2','','Tasks'));
  const toolbar=el('div','task-toolbar');const create=btn('Create Task',onNew,'primary-button');
  create.disabled=!tasks.some(t=>t.creationSupported && t.expected);toolbar.append(create);canvas.append(toolbar);
  if(!create.disabled) canvas.append(el('p','muted','Select a task to edit its schedule or create a program.'));
  else canvas.append(el('p','muted','Task scheduling is read-only for this CPU or project layout.'));
  const layout=el('div','task-workspace');
  const list=el('div','task-list');list.setAttribute('aria-label','Tasks');
  for(const task of tasks) {
    const row=btn('',()=>onSelect(task));row.className='task-row';row.setAttribute('aria-label',`Select task ${task.definition.name}`);
    row.setAttribute('aria-pressed',String(!creating && taskKey(task)===selectedKey));
    row.append(el('strong','',task.definition.name || 'Unnamed task'),el('span','muted',`${task.configurationName || `PLC ${(task.configurationIndex ?? 0)+1}`} · ${taskSchedule(task)} · ${task.programIndices.length} programs`));list.append(row);
  }
  if(!tasks.length)list.append(el('p','muted','No task definitions found.'));
  layout.append(list);
  const detail=el('section','task-detail');detail.setAttribute('aria-label',creating?'New task':'Task properties');layout.append(detail);canvas.append(layout);
  inspector.append(el('div','pane-heading inspector-heading','TASKS'),el('p','muted','Task priority and conditions control scheduling. Program order within each task controls execution order.'));
  const selected=tasks.find(t=>taskKey(t)===selectedKey) || tasks[0];
  if(creating) {
    detail.append(el('h3','','Create Task'));
    const owners=[...new Map(tasks.filter(t=>t.creationSupported && t.expected).map(t=>[t.configurationIndex,t])).values()];
    if(!owners.length)return;
    const owner=field(detail,'PLC',selected?.creationSupported?selected.configurationIndex:owners[0].configurationIndex,owners.map(t=>[t.configurationIndex,`${t.configurationName || 'PLC'} (${t.configurationIndex+1})`]));
    const host=el('div');detail.append(host);
    const render=()=>renderTaskForm(host,{summary,owner:owners.find(t=>String(t.configurationIndex)===owner.value),onSave,onCancel});
    owner.addEventListener('change',render);render();return;
  }
  if(!selected)return;
  detail.append(el('h3','',selected.definition.name));
  if(editableTask(selected)) {const formHost=el('div');detail.append(formHost);renderTaskForm(formHost,{summary,owner:selected,selected,onSave});}
  else {
    detail.append(el('p','muted',selected.definition.kind===0?'The scan task runs continuously. Its built-in definition cannot be changed.':'This native task definition is read-only.'));
    const dl=el('dl','task-native-fields');for(const [label,value] of [['Schedule',taskSchedule(selected)],['Priority',selected.definition.priority],['Task number',selected.definition.task_index]])dl.append(el('dt','',label),el('dd','',value));detail.append(dl);
  }
  detail.append(el('h3','','Programs'));
  if(selected.membershipError)detail.append(el('p','validation-summary invalid',selected.membershipError));
  for(const index of selected.programIndices) {
    const program=summary.programs[index];if(program)detail.append(btn(program.name || `Program ${index+1}`,()=>onOpenProgram(index),'task-program-link'));
  }
  if(!selected.programIndices.length)detail.append(el('p','muted','No programs assigned.'));
  const actions=el('div','task-toolbar');const add=btn('Create Program',()=>onCreateProgram(selected),'primary-button');add.disabled=!taskProgramCreation(summary,selected);actions.append(add);
  if(editableTask(selected)) {const remove=btn('Delete Task',()=>onDelete(selected));remove.disabled=selected.programIndices.length>0;remove.title=remove.disabled?'Reassign or delete the programs before deleting this task.':'Delete this empty task';actions.append(remove);}
  detail.append(actions);
}
function renderTaskForm(host,{summary,owner,selected,onSave,onCancel}) {
  host.replaceChildren();
  const original=selected?.settings;
  const form=el('form','task-form');host.append(form);
  const name=field(form,'Task name',original?.name || 'NewTask');name.maxLength=32;name.required=true;
  const trigger=field(form,'Execution condition',original?.trigger.kind || 'periodic',triggers);
  const priority=number(form,'Priority',original?.priority ?? 2,2,7);
  const taskNumber=number(form,'Task number',original?.task_number ?? nextTaskNumber(summary.tasks,owner.configurationIndex,'periodic'),0,31);
  const fields=el('div','task-condition-fields');form.append(fields);
  const status=el('p','validation-summary');status.setAttribute('role','status');
  const actions=el('div','task-toolbar');const save=btn(selected?'Apply task':'Create task',()=>form.requestSubmit(),'primary-button');actions.append(save);
  if(onCancel)actions.append(btn('Cancel',onCancel));form.append(status,actions);
  let duration,device,condition,value;
  const read=()=> {
    const kind=trigger.value;
    const t=kind==='periodic'?{kind,interval_ms:Number(duration.value)}:kind==='initialization'?{kind}:
      {kind,device:device.value.trim(),condition:condition.value,...(kind==='internal_word'?{value:Number(value.value)}:{})};
    return {name:name.value,priority:Number(priority.value),task_number:Number(taskNumber.value),trigger:t};
  };
  const validate=()=> {
    const s=read();let error='';
    if(!s.name || s.name.length>32 || !/^[\p{L}\p{N}_]+$/u.test(s.name))error='Use 1–32 letters, digits or underscores for the task name.';
    else if(summary.tasks.some(t=>t.configurationIndex===owner.configurationIndex && t.index!==selected?.index && t.definition.name?.toLowerCase()===s.name.toLowerCase()))error='A task with this name already exists in this PLC.';
    else if(!form.checkValidity())error='Enter whole numbers within the displayed ranges.';
    else if(s.trigger.kind==='initialization' && summary.tasks.some(t=>t.configurationIndex===owner.configurationIndex && t.index!==selected?.index && t.definition.kind===1))error='This PLC already has an initialization task.';
    else if(s.trigger.kind!=='initialization' && summary.tasks.some(t=>t.configurationIndex===owner.configurationIndex && t.index!==selected?.index && [2,3].includes(t.definition.kind) && t.definition.task_index===s.task_number))error='This task number is already in use.';
    else if(device && !s.trigger.device)error='Enter a device address.';
    status.textContent=error || (selected?'Changes are applied to this task and its program references.':'A new task will be added to the selected PLC.');status.classList.toggle('invalid',Boolean(error));
    save.disabled=Boolean(error) || Boolean(original && JSON.stringify(s)===JSON.stringify(original));
    return !error;
  };
  const conditionFields=(changed=false)=> {
    fields.replaceChildren();duration=device=condition=value=null;
    const kind=trigger.value,t=original?.trigger.kind===kind?original.trigger:null;
    priority.disabled=kind==='initialization';taskNumber.disabled=kind==='initialization';
    taskNumber.min=kind.startsWith('internal_')?'64':'0';taskNumber.max=kind.startsWith('internal_')?'95':'31';
    if(kind==='initialization')taskNumber.max='95';
    if(changed && kind!=='initialization')taskNumber.value=String(nextTaskNumber(summary.tasks,owner.configurationIndex,kind,selected?.index));
    if(kind==='periodic')duration=number(fields,'Interval (ms)',t?.interval_ms ?? 100,1,4294967295);
    else if(kind.startsWith('internal_')) {
      const bit=kind==='internal_bit';const initial=owner.deviceSyntax==='iec'?(bit?'%MX0':'%MW0'):(bit?'M00000':'D000000');
      device=field(fields,'Device address',t?.device || initial);device.required=true;
      condition=field(fields,bit?'Bit condition':'Word comparison',t?.condition || (bit?'rising':'equal'),bit?bitChoices:wordChoices);
      if(!bit)value=number(fields,'Comparison value',t?.value ?? 0,0,65535);
    }
    const hint=el('p','muted',kind==='initialization'?'Runs during STOP-to-RUN initialization.':'Lower priority numbers run first. Periodic task numbers: 0–31. Internal-device task numbers: 64–95.');fields.append(hint);
    validate();
  };
  trigger.addEventListener('change',()=>conditionFields(true));form.addEventListener('input',event=>{if(event.target!==trigger)validate();});form.addEventListener('change',event=>{if(event.target!==trigger)validate();});
  form.addEventListener('submit',async e=>{e.preventDefault();if(!validate())return;save.disabled=true;await onSave(owner,read(),selected);if(form.isConnected)validate();});
  conditionFields();
}
