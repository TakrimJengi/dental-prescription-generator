import React, { useEffect, useMemo, useState } from 'react';

const API = 'http://localhost:5000/api';
const categories = [
  ['complaint','Chief complaints'],['examination','On examination'],
  ['diagnosis','Diagnosis'],['investigation','Investigation'],['advice','Advice']
];
const emptyMedicine = { name:'', generic_name:'', strength:'', form:'', route:'', default_dose:'', default_frequency:'', default_duration:'', notes:'', active:1 };

async function request(path, options={}) {
  const res = await fetch(API + path, { headers:{'Content-Type':'application/json'}, ...options });
  const data = await res.json().catch(()=>({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

function App() {
  const [page,setPage] = useState('prescription');
  const [options,setOptions] = useState([]);
  const [medicines,setMedicines] = useState([]);
  const [settings,setSettings] = useState({});
  const [error,setError] = useState('');
  const [toast,setToast] = useState('');

  const refresh = async () => {
    try {
      const [o,m,s] = await Promise.all([request('/options'),request('/medicines'),request('/settings')]);
      setOptions(o); setMedicines(m); setSettings(s); setError('');
    } catch(e) { setError(e.message + ' — check that the backend and MySQL are running.'); }
  };
  useEffect(()=>{ refresh(); },[]);
  const notify = (msg) => { setToast(msg); setTimeout(()=>setToast(''),2800); };

  return <div className="app">
    <aside className="sidebar">
      <div className="brand"><div className="brandIcon">✚</div><div><b>DentalRx</b><small>Prescription Studio</small></div></div>
      <div className="navLabel">WORKSPACE</div>
      <button className={page==='prescription'?'nav active':'nav'} onClick={()=>setPage('prescription')}>▤ <span>New prescription</span></button>
      <div className="navLabel">CONFIGURATION</div>
      <button className={page==='lists'?'nav active':'nav'} onClick={()=>setPage('lists')}>☷ <span>Manage lists</span></button>
      <button className={page==='medicines'?'nav active':'nav'} onClick={()=>setPage('medicines')}>✚ <span>Medicine catalogue</span></button>
      <button className={page==='clinic'?'nav active':'nav'} onClick={()=>setPage('clinic')}>⚙ <span>Clinic settings</span></button>
      <div className="sideNote">Local development version<br/>DentalRx v1.0</div>
    </aside>
    <main className="main">
      <header className="topbar"><div><div className="eyebrow">DENTAL PRESCRIPTION GENERATOR</div><h1>{({prescription:'Create prescription',lists:'Manage selectable lists',medicines:'Medicine catalogue',clinic:'Clinic settings'})[page]}</h1></div><div className="topPill"><span className="dot"/> Local workspace</div></header>
      {error && <div className="alert">{error}</div>}
      {page==='prescription' && <Prescription options={options} medicines={medicines} settings={settings} notify={notify}/>}
      {page==='lists' && <Lists options={options} refresh={refresh} notify={notify}/>}
      {page==='medicines' && <Medicines refresh={refresh} notify={notify}/>}
      {page==='clinic' && <Clinic settings={settings} setSettings={setSettings} notify={notify}/>}
      {toast && <div className="toast">{toast}</div>}
    </main>
  </div>;
}

function SectionPicker({title,category,options,selected,onChange}) {
  const rows=options.filter(o=>o.category===category);
  return <section className="formSection"><div className="sectionHead"><h3>{title}</h3><span>{selected.length} selected</span></div>
    {rows.length===0?<p className="muted">No options yet. Add them in Manage lists.</p>:
    <div className="checks">{rows.map(o=><label className="check" key={o.id}><input type="checkbox" checked={selected.includes(o.label)} onChange={e=>onChange(e.target.checked?[...selected,o.label]:selected.filter(x=>x!==o.label))}/><span>{o.label}</span></label>)}</div>}
    <input className="customInput" placeholder={`Add a one-time custom ${title.toLowerCase()}...`} onKeyDown={e=>{if(e.key==='Enter'&&e.target.value.trim()){onChange([...selected,e.target.value.trim()]);e.target.value='';}}}/>
  </section>;
}

function Prescription({options,medicines,settings,notify}) {
  const [patient,setPatient]=useState({name:'',age:'',gender:'',weight:'',phone:'',date:new Date().toISOString().slice(0,10)});
  const [selected,setSelected]=useState({complaint:[],examination:[],diagnosis:[],investigation:[],advice:[]});
  const [items,setItems]=useState([]);
  const [followup,setFollowup]=useState('');
  const [notes,setNotes]=useState('');
  const update=(key,value)=>setPatient(p=>({...p,[key]:value}));
  const setCategory=(key,value)=>setSelected(s=>({...s,[key]:value}));
  const addMedicine=()=>setItems(x=>[...x,{key:Date.now()+Math.random(),medicine_id:'',name:'',dose:'',frequency:'',duration:'',instructions:''}]);
  const updateItem=(key,field,value)=>setItems(xs=>xs.map(x=>x.key===key?{...x,[field]:value}:x));
  const chooseMedicine=(key,id)=>{const m=medicines.find(x=>String(x.id)===String(id));setItems(xs=>xs.map(x=>x.key===key?{...x,medicine_id:id,name:m?.name||'',dose:m?.default_dose||'',frequency:m?.default_frequency||'',duration:m?.default_duration||''}:x));};
  const print=()=>{if(!patient.name.trim()){notify('Enter the patient name first.');return;}window.print();};
  return <div className="workspace">
    <div className="formColumn">
      <div className="card"><div className="cardTitle"><div><h2>Patient information</h2><p>Enter the basic patient details.</p></div><span className="step">01</span></div>
        <div className="grid two">
          <Field label="Patient name" value={patient.name} onChange={v=>update('name',v)} placeholder="Full name"/>
          <Field label="Date" type="date" value={patient.date} onChange={v=>update('date',v)}/>
          <Field label="Age" value={patient.age} onChange={v=>update('age',v)} placeholder="e.g. 25 years"/>
          <SelectField label="Gender" value={patient.gender} onChange={v=>update('gender',v)} options={['Female','Male','Other']}/>
          <Field label="Weight" value={patient.weight} onChange={v=>update('weight',v)} placeholder="e.g. 55 kg"/>
          <Field label="Phone (optional)" value={patient.phone} onChange={v=>update('phone',v)} placeholder="Phone number"/>
        </div>
      </div>
      <div className="card"><div className="cardTitle"><div><h2>Clinical information</h2><p>Select one or more relevant entries.</p></div><span className="step">02</span></div>
        {categories.map(([key,title])=><SectionPicker key={key} title={title} category={key} options={options} selected={selected[key]} onChange={v=>setCategory(key,v)}/>)}
        <label className="field"><span>Additional clinical notes</span><textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Optional notes..." rows="3"/></label>
      </div>
      <div className="card"><div className="cardTitle"><div><h2>Prescription (Rx)</h2><p>Select catalogue medicines and confirm the instructions.</p></div><span className="step">03</span></div>
        {items.map((it,i)=><div className="medicineEditor" key={it.key}><div className="medTop"><b>Medicine {i+1}</b><button className="textDanger" onClick={()=>setItems(xs=>xs.filter(x=>x.key!==it.key))}>Remove</button></div>
          <label className="field"><span>Medicine</span><select value={it.medicine_id} onChange={e=>chooseMedicine(it.key,e.target.value)}><option value="">Choose from catalogue</option>{medicines.map(m=><option value={m.id} key={m.id}>{m.name} {m.strength} {m.form}</option>)}</select></label>
          <div className="grid two"><Field label="Dose" value={it.dose} onChange={v=>updateItem(it.key,'dose',v)} placeholder="Clinician enters dose"/><Field label="Frequency" value={it.frequency} onChange={v=>updateItem(it.key,'frequency',v)} placeholder="Clinician enters frequency"/><Field label="Duration" value={it.duration} onChange={v=>updateItem(it.key,'duration',v)} placeholder="Clinician enters duration"/><Field label="Additional instructions" value={it.instructions} onChange={v=>updateItem(it.key,'instructions',v)} placeholder="As clinically appropriate"/></div>
        </div>)}
        <button className="secondaryButton" onClick={addMedicine}>＋ Add medicine</button>
        {medicines.length===0&&<p className="muted">Your medicine catalogue is empty. Add entries under Medicine catalogue.</p>}
      </div>
      <div className="card"><div className="cardTitle"><div><h2>Follow-up</h2><p>Optional follow-up date or instruction.</p></div><span className="step">04</span></div><Field label="Follow-up" value={followup} onChange={setFollowup} placeholder="e.g. Review in 7 days"/></div>
      <div className="actionRow"><button className="primaryButton" onClick={print}>Print / Save as PDF ↗</button><button className="secondaryButton" onClick={()=>{setPatient({name:'',age:'',gender:'',weight:'',phone:'',date:new Date().toISOString().slice(0,10)});setSelected({complaint:[],examination:[],diagnosis:[],investigation:[],advice:[]});setItems([]);setNotes('');setFollowup('');}}>Clear form</button></div>
    </div>
    <div className="previewColumn"><PrescriptionPreview patient={patient} selected={selected} items={items} notes={notes} followup={followup} settings={settings}/></div>
  </div>;
}

function PrescriptionPreview({patient,selected,items,notes,followup,settings}) {
  const names={complaint:'Chief Complaint',examination:'On Examination',diagnosis:'Diagnosis',investigation:'Investigation',advice:'Advice'};
  return <div className="previewWrap"><div className="previewLabel">LIVE PRESCRIPTION PREVIEW</div><article className="paper" id="prescription-paper">
    <div className="paperHeader"><h2>{settings.clinic_name||'Dental Clinic'}</h2><b>{settings.doctor_name}</b><div>{settings.qualifications}</div><div>{settings.registration_no&&`Registration: ${settings.registration_no}`}</div><div>{settings.address}</div><div>{settings.phone}{settings.email&&` | ${settings.email}`}</div></div>
    <div className="paperMeta"><div><b>Patient:</b> {patient.name||'—'}<br/><b>Age:</b> {patient.age||'—'}<br/><b>Gender:</b> {patient.gender||'—'}</div><div><b>Date:</b> {patient.date||'—'}<br/><b>Weight:</b> {patient.weight||'—'}<br/><b>Phone:</b> {patient.phone||'—'}</div></div>
    <div className="paperBody"><div className="paperLeft">
      {categories.map(([key])=><div className="paperBlock" key={key}><b>{names[key]}</b>{selected[key].length?selected[key].map((x,i)=><div key={i}>• {x}</div>):<div className="paperBlank">—</div>}</div>)}
      {notes&&<div className="paperBlock"><b>Additional Notes</b><div>{notes}</div></div>}
    </div><div className="paperRight"><div className="rxMark">Rx</div>
      {items.length?items.map((it,i)=><div className="paperMedicine" key={it.key}><b>{i+1}. {it.name||'Medicine not selected'}</b><div>{it.dose}</div><div>{it.frequency}</div><div>{it.duration}</div><div>{it.instructions}</div></div>):<div className="paperBlank">No medicines selected</div>}
      {followup&&<div className="paperBlock"><b>Follow-up</b><div>{followup}</div></div>}
    </div></div>
    <div className="signature"><div>________________________<br/>Doctor's signature</div></div>
    <div className="paperFooter">{settings.footer_text}</div>
  </article><p className="previewHint">The preview updates as you complete the form. Print to paper or choose "Save as PDF".</p></div>;
}

function Lists({options,refresh,notify}) {
  const [category,setCategory]=useState('complaint');
  const [label,setLabel]=useState('');
  const [editing,setEditing]=useState(null);
  const [active,setActive]=useState(true);
  const visible=options.filter(o=>o.category===category);
  const save=async()=>{try{if(!label.trim())return notify('Enter an option name.');if(editing)await request(`/admin/options/${editing.id}`,{method:'PUT',body:JSON.stringify({...editing,label,active})});else await request('/admin/options',{method:'POST',body:JSON.stringify({category,label})});setLabel('');setEditing(null);await refresh();notify('List updated.');}catch(e){notify(e.message);}};
  const edit=o=>{setEditing(o);setLabel(o.label);setActive(!!o.active);};
  const remove=async id=>{if(!confirm('Permanently delete this option?'))return;try{await request(`/admin/options/${id}`,{method:'DELETE'});await refresh();notify('Option deleted.');}catch(e){notify(e.message);}};
  return <div className="singlePage"><div className="card"><div className="cardTitle"><div><h2>Selectable prescription lists</h2><p>Manage the choices shown in the prescription form.</p></div></div>
    <div className="tabs">{categories.map(([key,title])=><button className={category===key?'tab activeTab':'tab'} onClick={()=>{setCategory(key);setEditing(null);setLabel('');}} key={key}>{title}</button>)}</div>
    <div className="editorRow"><input value={label} onChange={e=>setLabel(e.target.value)} placeholder={`Enter ${category} option`}/>{editing&&<label className="inlineCheck"><input type="checkbox" checked={active} onChange={e=>setActive(e.target.checked)}/> Active</label>}<button className="primaryButton" onClick={save}>{editing?'Save changes':'Add option'}</button>{editing&&<button className="secondaryButton" onClick={()=>{setEditing(null);setLabel('');}}>Cancel</button>}</div>
    <div className="listRows">{visible.map(o=><div className="listRow" key={o.id}><span>{o.label}</span><span className={o.active?'status':'status inactive'}>{o.active?'Active':'Inactive'}</span><div className="rowActions"><button onClick={()=>edit(o)}>Edit</button><button className="textDanger" onClick={()=>remove(o.id)}>Delete</button></div></div>)}{visible.length===0&&<p className="muted">No entries in this list yet.</p>}</div>
  </div></div>;
}

function Medicines({refresh,notify}) {
  const [rows,setRows]=useState([]);
  const [form,setForm]=useState(emptyMedicine);
  const [editing,setEditing]=useState(null);
  const load=async()=>{try{setRows(await request('/admin/medicines'));}catch(e){notify(e.message);}};
  useEffect(()=>{load();},[]);
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const save=async()=>{try{if(!form.name.trim())return notify('Medicine name is required.');const body=JSON.stringify(form);if(editing)await request(`/admin/medicines/${editing}`,{method:'PUT',body});else await request('/admin/medicines',{method:'POST',body});setForm(emptyMedicine);setEditing(null);await load();await refresh();notify('Medicine saved.');}catch(e){notify(e.message);}};
  const edit=m=>{setEditing(m.id);setForm({...m,active:!!m.active});};
  const del=async id=>{if(!confirm('Permanently delete this medicine?'))return;try{await request(`/admin/medicines/${id}`,{method:'DELETE'});await load();await refresh();notify('Medicine deleted.');}catch(e){notify(e.message);}};
  const fields=[['name','Medicine / brand name'],['generic_name','Generic name'],['strength','Strength'],['form','Form (tablet, syrup, drops...)'],['route','Route'],['default_dose','Suggested dose template'],['default_frequency','Suggested frequency template'],['default_duration','Suggested duration template']];
  return <div className="singlePage"><div className="card"><div className="cardTitle"><div><h2>{editing?'Edit medicine':'Add medicine'}</h2><p>Only enter medicine information and templates verified by a qualified clinician.</p></div></div>
    <div className="grid two">{fields.map(([k,l])=><Field key={k} label={l} value={form[k]||''} onChange={v=>set(k,v)}/>)}</div>
    <label className="field"><span>Notes / safety information</span><textarea rows="2" value={form.notes||''} onChange={e=>set('notes',e.target.value)}/></label>
    {editing&&<label className="inlineCheck"><input type="checkbox" checked={!!form.active} onChange={e=>set('active',e.target.checked)}/> Active in prescription list</label>}
    <div className="actionRow"><button className="primaryButton" onClick={save}>{editing?'Save changes':'Add medicine'}</button>{editing&&<button className="secondaryButton" onClick={()=>{setEditing(null);setForm(emptyMedicine);}}>Cancel</button>}</div>
  </div><div className="card"><div className="cardTitle"><div><h2>Medicine catalogue</h2><p>{rows.length} entries</p></div></div>
    {rows.map(m=><div className="listRow" key={m.id}><div><b>{m.name}</b><div className="muted small">{[m.generic_name,m.strength,m.form].filter(Boolean).join(' · ')}</div></div><span className={m.active?'status':'status inactive'}>{m.active?'Active':'Inactive'}</span><div className="rowActions"><button onClick={()=>edit(m)}>Edit</button><button className="textDanger" onClick={()=>del(m.id)}>Delete</button></div></div>)}
    {rows.length===0&&<p className="muted">No medicines added yet.</p>}
  </div></div>;
}

function Clinic({settings,setSettings,notify}) {
  const [form,setForm]=useState(settings);
  useEffect(()=>setForm(settings),[settings]);
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const save=async()=>{try{await request('/settings',{method:'PUT',body:JSON.stringify(form)});setSettings(form);notify('Clinic settings saved.');}catch(e){notify(e.message);}};
  const fields=[['clinic_name','Clinic name'],['doctor_name','Doctor name'],['qualifications','Qualifications'],['registration_no','Registration number'],['phone','Phone'],['email','Email']];
  return <div className="singlePage"><div className="card"><div className="cardTitle"><div><h2>Prescription header and footer</h2><p>These details appear on the printed prescription.</p></div></div>
    <div className="grid two">{fields.map(([k,l])=><Field key={k} label={l} value={form[k]||''} onChange={v=>set(k,v)}/>)}</div>
    <label className="field"><span>Clinic address</span><textarea rows="2" value={form.address||''} onChange={e=>set('address',e.target.value)}/></label>
    <label className="field"><span>Footer text</span><textarea rows="2" value={form.footer_text||''} onChange={e=>set('footer_text',e.target.value)}/></label>
    <button className="primaryButton" onClick={save}>Save clinic settings</button>
    <p className="muted small">Logo and handwritten signature image upload can be added in a later iteration.</p>
  </div></div>;
}

function Field({label,value,onChange,placeholder='',type='text'}) {
  return <label className="field"><span>{label}</span><input type={type} value={value??''} placeholder={placeholder} onChange={e=>onChange(e.target.value)}/></label>;
}
function SelectField({label,value,onChange,options}) {
  return <label className="field"><span>{label}</span><select value={value} onChange={e=>onChange(e.target.value)}><option value="">Select</option>{options.map(o=><option key={o}>{o}</option>)}</select></label>;
}

export default App;
