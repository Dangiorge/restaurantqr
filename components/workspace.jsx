"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import UploadField from './upload-field';
import Operations from './operations';
import { createAuthClient } from 'better-auth/react';
import { appOrigin } from '@/lib/app-origin.mjs';
import {categoryRows,dietaryOptions,dietaryLabel} from '@/modules/menus/taxonomy.mjs';
const auth = createAuthClient({baseURL:typeof window==='undefined'?appOrigin():window.location.origin});

async function api(path, data, method = 'POST') {
  const response = await fetch(path, data === undefined ? { cache: 'no-store' } : { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  const result = await response.json();
  if (!response.ok) throw new Error(result.fields?.map(f => `${f.field}: ${f.message}`).join(' · ') || result.error || 'Request failed.');
  return result;
}

function Field({ field, initial = {}, restaurantId, onBusy, menuId }) {
  const [key, label, type = 'text', options] = field;
  const val = initial[key];
  if(type==='parent-category'){
    const parents=options.filter(c=>c.menuId===menuId);
    const selected=initial.menuId===menuId&&parents.some(c=>c.id===val)?val:'';
    return <label className="field">{label}<select aria-label={label} name={key} key={menuId} defaultValue={selected}><option value="">No parent (top-level category)</option>{parents.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select><small className="muted">Choose a parent in the same menu, or leave this as a top-level category.</small></label>;
  }
  if(type==='upload-image'||type==='upload-menu') return <UploadField name={key} label={label} initialValue={val||''} restaurantId={restaurantId} kind={type==='upload-menu'?'menu':key==='logoUrl'?'logo':'dish'} onBusy={onBusy}/>;
  if (type === 'hours') return <fieldset className="hours"><legend>{label}</legend>{['mon','tue','wed','thu','fri','sat','sun'].map(day => { const times = val?.[day]?.split('-') || []; return <div className="hours-day" key={day}><span>{day.toUpperCase()}</span><label><span className="sr-only">{day} opening time</span><input type="time" name={`${key}.${day}.open`} defaultValue={times[0] === 'closed' ? '' : times[0]} /></label><span>to</span><label><span className="sr-only">{day} closing time</span><input type="time" name={`${key}.${day}.close`} defaultValue={times[1]} /></label></div>; })}<small className="muted">Leave both times empty for a closed day.</small></fieldset>;
  if (type === 'checkbox') return <label className="check"><input name={key} type="checkbox" defaultChecked={val ?? true} />{label}</label>;
  if (type === 'multiselect') return <label className="field">{label}<select name={key} multiple defaultValue={val || []} size={Math.min(6, Math.max(2, options.length))}>{options.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}</select><small className="muted">Select one or more. Hold Ctrl or Command to select multiple.</small></label>;
  const value = type === 'json' ? JSON.stringify(val || {}) : type === 'list' ? (val || []).join(', ') : val ?? '';
  return <label className="field">{label}{type === 'select' ? <select aria-label={label} name={key} defaultValue={value} required><option value="">Select…</option>{options.map(o => <option value={o.id} key={o.id}>{o.name}</option>)}</select> : type === 'textarea' || type === 'json' ? <textarea name={key} defaultValue={value} rows={3} /> : <input name={key} type={['json','list'].includes(type) ? 'text' : type} defaultValue={value} required={['name','slug','email','basePrice','timezone','primaryColor','currency','taxRate','serviceChargeRate'].includes(key)} maxLength={key === 'description' ? 2000 : 500} step={key === 'basePrice' ? '0.01' : undefined} min={type === 'number' ? 0 : undefined} />}</label>;
}

function Editor({ title, fields, initial = {}, save, close, restaurantId }) {
  const [menuId,setMenuId]=useState(initial.menuId||'');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [uploading,setUploading]=useState(false);
  async function submit(event) {
    event.preventDefault(); setError(''); setBusy(true);
    if(uploading){setError('Please wait for the upload to finish.');setBusy(false);return;}
    try {
      const form = new FormData(event.currentTarget);
      const data = {};
      for (const [key, , type] of fields) {
        const value = form.get(key);
        if (type === 'hours') {
          data[key] = {};
          for (const day of ['mon','tue','wed','thu','fri','sat','sun']) {
            const open = form.get(`${key}.${day}.open`), close = form.get(`${key}.${day}.close`);
            if (Boolean(open) !== Boolean(close)) throw new Error(`Enter both opening and closing times for ${day}.`);
            data[key][day] = open ? `${open}-${close}` : 'closed';
          }
          continue;
        }
        data[key] = type === 'checkbox' ? form.has(key) : type === 'multiselect' ? form.getAll(key) : type === 'list' ? String(value).split(',').map(v => v.trim()).filter(Boolean) : type === 'json' ? JSON.parse(value || '{}') : value;
      }
      await save(data);
      close();
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  return <div className="modal-backdrop"><section className="modal" role="dialog" aria-modal="true" aria-label={title}><div className="section-heading"><h2>{title}</h2><button type="button" className="icon-button" onClick={close} aria-label="Close editor">✕</button></div><form onSubmit={submit} onChange={event=>{if(event.target.name==='menuId')setMenuId(event.target.value);}}><div className="form-grid">{fields.map(f => <Field key={f[0]} field={f} initial={initial} restaurantId={restaurantId} onBusy={setUploading} menuId={menuId} />)}</div>{error && <p role="alert" className="error">{error}</p>}<div className="form-actions"><button type="button" className="secondary" onClick={close}>Cancel</button><button disabled={busy || uploading}>{busy ? 'Saving…' : 'Save changes'}</button></div></form></section></div>;
}

function Login({ done }) {
  const [signup, setSignup] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('');
    const form = new FormData(event.currentTarget);
    try {
      const data = { email: form.get('email'), password: form.get('password') };
      const result = signup ? await auth.signUp.email({ ...data, name: form.get('name') }) : await auth.signIn.email(data);
      if (result.error) throw new Error(result.error.message || 'Authentication failed.');
      await done();
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  return <main className="auth-shell"><Link className="wordmark" href="/">▦ <span>Tableline</span></Link><div className="auth-card"><span className="eyebrow">YOUR RESTAURANT, CONNECTED</span><h1>{signup ? 'Start your workspace.' : 'Welcome back.'}</h1><p className="muted">One place for your branches, menus, and tables.</p><form onSubmit={submit}>{signup && <label className="field">Your name<input name="name" autoComplete="name" required maxLength={120} /></label>}<label className="field">Email address<input name="email" type="email" autoComplete="email" required /></label><label className="field">Password<input name="password" type="password" autoComplete={signup ? 'new-password' : 'current-password'} minLength={12} maxLength={128} required /></label>{signup && <p className="small muted">Use at least 12 characters.</p>}{error && <p role="alert" className="error">{error}</p>}<button disabled={busy} className="full">{busy ? 'Please wait…' : signup ? 'Create account' : 'Sign in'}</button></form><button className="text-button" onClick={() => { setSignup(!signup); setError(''); }}>{signup ? 'Already registered? Sign in' : 'New here? Create an account'}</button></div><p className="small muted">Built for the way Ethiopian restaurants work.</p></main>;
}

export default function Workspace() {
  const [account, setAccount] = useState(null);
  const [restaurantId, setRestaurantId] = useState('');
  const [workspace, setWorkspace] = useState(null);
  const [tab, setTab] = useState('overview');
  const [editor, setEditor] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [invite, setInvite] = useState('');
  const [platform, setPlatform] = useState(null);
  const [itemDiet,setItemDiet]=useState('all');

  async function loadAccount() {
    const value = await api('/api/restaurants');
    setAccount(value); setRestaurantId(prev => value.restaurants.some(r => r.id === prev) ? prev : value.restaurants[0]?.id || '');
  }
  async function refresh(id = restaurantId) {
    if (id) setWorkspace(await api(`/api/workspace/${id}/overview`));
  }
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (/^[A-Za-z0-9_-]{43}$/.test(hash)) { Promise.resolve().then(() => setInvite(hash)); window.history.replaceState(null, '', window.location.pathname); }
    api('/api/restaurants').then(value => { setAccount(value); setRestaurantId(value.restaurants[0]?.id || ''); }).catch(e => { if (e.message !== 'Please sign in.') setError(e.message); }).finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    let live = true;
    if (restaurantId) api(`/api/workspace/${restaurantId}/overview`).then(value => { if (live) { setWorkspace(value); setError(''); } }).catch(e => { if (live) { setWorkspace(null); setError(e.message); } });
    return () => { live = false; };
  }, [restaurantId]);

  async function run(operation, success) {
    setError('');
    try { await operation(); if (success) setMessage(success); }
    catch (e) { setError(e.message); }
  }
  async function save(resource, data, id) {
    const result = await api(`/api/workspace/${restaurantId}/${resource}${id ? `?id=${id}` : ''}`, data, id ? 'PATCH' : 'POST');
    await refresh();
    setMessage(result.invitationToken ? `Share privately with the invited staff member: ${window.location.origin}/workspace#${result.invitationToken}` : 'Changes saved.');
  }
  function edit(resource, title, fields, initial = {}) { setEditor({ title, fields, initial, save: data => save(resource, data, initial.id) }); }
  const w = workspace;
  const can = p => w?.permissions.includes(p);
  const globalAccess = w?.allBranches;
  const categories = w?.menus.flatMap(m => categoryRows(m.categories).map(c=>({...c,name:c.path}))) || [];
  const items = categories.flatMap(c => c.items.map(i => ({ ...i, categoryName: c.name })));
  const visibleItems=items.filter(item=>itemDiet==='all'||(item.dietaryType||'UNSPECIFIED')===itemDiet);
  const branchOptions = w?.branches || [];
  const branchFields = [['name','Branch name'],['address','Address','textarea'],['phone','Contact phone'],['timezone','Time zone'],['openingHours','Weekly opening hours','hours'],['active','Active','checkbox']];
  const tableFields = [['name','Table number or name'],['branchId','Branch','select',branchOptions],['areaId','Dining area','select',[{id:'none',name:'No area'}, ...(w?.areas || []).map(a => ({ ...a, name: `${a.name} · ${w?.branches.find(b => b.id === a.branchId)?.name || ''}` }))]],['active','Active','checkbox']];
  const categoryFields=(category={})=>[['name','Category name'],['menuId','Menu','select',w.menus],['parentId','Parent category','parent-category',categories.filter(c=>!c.parentId&&c.id!==category.id&&(!category.id||!categories.some(child=>child.parentId===category.id)))],['displayOrder','Display order','number'],['active','Active','checkbox']];
  const itemFields = [['name','Dish name'],['categoryId','Category','select',categories],['description','Description','textarea'],['basePrice','Base price (ETB)','number'],['photoUrl','Dish photo','upload-image'],['dietaryType','Dietary type','select',dietaryOptions],['dietaryLabels','Dietary labels (comma-separated)','list'],['allergens','Allergens (comma-separated)','list'],['displayOrder','Display order','number'],['active','Visible','checkbox'],['available','Available','checkbox']];

  if (loading) return <main className="loading">Opening your workspace…</main>;
  if (!account) return <><Login done={loadAccount} />{error && <p className="error auth-error" role="alert">{error}</p>}</>;
  return <div className="app-shell"><aside className="sidebar"><Link className="wordmark" href="/">▦ <span>Tableline</span></Link><p className="nav-label">WORKSPACE</p><label className="sr-only" htmlFor="restaurant-switch">Restaurant</label><select id="restaurant-switch" value={restaurantId} onChange={e => { setWorkspace(null); setRestaurantId(e.target.value); }}>{account.restaurants.length ? account.restaurants.map(r => <option key={r.id} value={r.id}>{r.name}</option>) : <option value="">No restaurants yet</option>}</select><nav>{[['overview','◫','Overview'],['branches','⌂','Branches'],['menus','☷','Menus'],['tables','▦','Tables & QR'],['team','♧','Team & roles'],['service','◷','Live service'],['settings','⚙','Settings']].map(([id, icon, label]) => <button key={id} className={tab === id ? 'nav-active' : ''} onClick={() => setTab(id)}><span aria-hidden="true">{icon}</span>{label}</button>)}</nav><div className="sidebar-bottom"><span className="avatar">{account.user.name.slice(0,1).toUpperCase()}</span><div><strong>{account.user.name}</strong><button className="text-button" onClick={() => run(async () => { await auth.signOut(); setAccount(null); setWorkspace(null); })}>Sign out</button></div></div></aside><main className="workspace"><header className="topbar"><span>Restaurant workspace <span className="slash">/</span> {tab === 'tables' ? 'Tables & QR' : tab[0].toUpperCase() + tab.slice(1)}</span><span className="status"><i /> Development foundation</span></header><div className="workspace-body">{error && <div role="alert" className="notice error">{error}<button className="text-button" onClick={() => setError('')}>Dismiss</button></div>}{message && <div role="status" className="notice success">{message}<button className="text-button" onClick={() => setMessage('')}>Dismiss</button></div>}
    {invite && <section className="panel invite-panel"><h2>You have a staff invitation</h2><p>Accept it using the account registered with the invited email address.</p><button onClick={() => run(async () => { const value = await api('/api/invitations/accept', { token: invite }); setInvite(''); await loadAccount(); setRestaurantId(value.restaurantId); }, 'Invitation accepted.')}>Accept invitation</button></section>}
    {!restaurantId ? <section className="welcome panel"><span className="eyebrow">LET’S SET YOUR TABLE</span><h1>Your restaurant starts here.</h1><p>Create a workspace to organize your branches, build your menu, and connect each table.</p><button onClick={() => setEditor({ title: 'Create your restaurant', fields: [['name','Restaurant name'],['slug','Public slug (lowercase, hyphen-separated)'],['brand','Brand profile','select',[{id:'neutral',name:'Neutral'},{id:'romina',name:'Romina Restaurants'}]]], save: async data => { const r = await api('/api/restaurants', data); await loadAccount(); setRestaurantId(r.id); } })}>Create restaurant</button></section> : !w ? <p className="muted">Loading restaurant…</p> : <>
      <div className="page-heading"><div><span className="eyebrow">{w.restaurant.name.toUpperCase()}</span><h1>{({overview:'A little more connected.',branches:'Every branch. One workspace.',menus:'Make something worth ordering.',tables:'A seat at every table.',team:'Good service starts with your team.',service:'Your tables, in the moment.',settings:'Make it yours.'})[tab]}</h1><p className="muted">{({overview:'Your restaurant foundation, at a glance.',branches:'Manage locations, contact details, and opening hours.',menus:'Organize your dishes and keep your menu up to date.',tables:'Create tables and give each one a secure menu QR code.',team:'Invite staff and give each person the access they need.',service:'Respond to guest orders, waiter calls, and bill requests.',settings:'Your restaurant profile and operating preferences.'})[tab]}</p></div>{tab === 'overview' && <button className="secondary" onClick={() => setEditor({ title: 'Create another restaurant', fields: [['name','Restaurant name'],['slug','Public slug'],['brand','Brand profile','select',[{id:'neutral',name:'Neutral'},{id:'romina',name:'Romina Restaurants'}]]], save: async data => { const r = await api('/api/restaurants', data); await loadAccount(); setRestaurantId(r.id); } })}>+ New restaurant</button>}</div>
      {tab === 'overview' && <><div className="stats">{[['Branches',w.branches.length,'Locations you can access'],['Menu items',items.length,'Across accessible menus'],['Tables',w.tables.length,'Tables you can manage'],['Active QR codes',w.tables.reduce((n,t) => n + t.qrCodes.filter(q => !q.expiresAt || new Date(q.expiresAt) > new Date()).length,0),'Ready to connect guests']].map(([label,value,caption]) => <div className="stat" key={label}><span>{label}</span><strong>{value}</strong><small>{caption}</small></div>)}</div><section className="panel getting-started"><div><span className="eyebrow">THE FOUNDATION FOR GREAT SERVICE</span><h2>From your kitchen to their screen.</h2><p>Set up your locations, add the dishes your guests love, and create a QR code for each table.</p><button onClick={() => setTab('menus')}>Build your menu <span aria-hidden="true">↗</span></button></div><div className="steps">{[['01','Add a branch','Keep each location organized.','branches'],['02','Create your menu','Categories, descriptions, and base prices.','menus'],['03','Connect your tables','Secure QR codes guests can scan.','tables']].map(([n,title,desc,destination]) => <button key={n} onClick={() => setTab(destination)}><span>{n}</span><div><strong>{title}</strong><p>{desc}</p></div><span>→</span></button>)}</div></section><p className="small muted">Ordering, payments, promotions, and sales reporting will be introduced in later phases.</p></>}
      {tab === 'branches' && <section className="panel"><div className="section-heading"><h2>Branches <span className="count">{w.branches.length}</span></h2>{can('branches.manage') && globalAccess && <button onClick={() => edit('branches','New branch',branchFields,{timezone:'Africa/Addis_Ababa'})}>+ Add branch</button>}</div><div className="card-grid">{w.branches.map(b => <article className="record-card" key={b.id}><span className="tile-icon">⌂</span><span className={`badge ${!b.active ? 'inactive' : ''}`}>{b.active ? 'Active' : 'Inactive'}</span><h3>{b.name}</h3><p>{b.address || 'No address added'}</p><p className="small muted">{b.timezone} · {b.phone || 'No phone added'}</p>{can('branches.manage') && globalAccess && <button className="secondary" onClick={() => edit('branches','Edit branch',branchFields,b)}>Edit branch</button>}</article>)}</div>{!w.branches.length && <Empty title="Your first location awaits." text="Add a branch to start creating dining areas and tables." />}</section>}
      {tab === 'menus' && <><section className="panel"><div className="section-heading"><h2>Menus & categories</h2><Link className="text-button" href={`/r/${w.restaurant.slug}/menu`} target="_blank">Open guest menu</Link>{can('menu.edit') && globalAccess && <div className="actions"><button className="secondary" onClick={() => edit('menus','New menu',[['name','Menu name'],['documentUrl','Menu file','upload-menu'],['active','Active','checkbox']])}>+ Menu</button><button onClick={() => edit('categories','New category',categoryFields(),{displayOrder:0,menuId:w.menus.length===1?w.menus[0].id:''})}>+ Category</button></div>}</div>{w.menus.map(m => <div className="menu-line" key={m.id}><strong>{m.name} {!m.active && '(hidden)'}</strong><div className="actions">{categoryRows(m.categories).map(c => <button className={`chip ${c.depth?'category-child':''}`} key={c.id} disabled={!can('menu.edit') || !globalAccess} onClick={() => edit('categories','Edit category',categoryFields(c),c)}>{c.depth?'↳ ':''}{c.name} · {c.items.length}{!c.active && ' · hidden'}</button>)}{can('menu.edit') && globalAccess && <button className="text-button" onClick={() => edit('menus','Edit menu',[['name','Menu name'],['documentUrl','Menu file','upload-menu'],['active','Active','checkbox']],m)}>Edit menu</button>}</div></div>)}</section><section className="panel"><div className="section-heading"><h2>Menu items <span className="count">{visibleItems.length}</span></h2><label className="menu-diet-select">Dietary type<select aria-label="Filter dishes by dietary type" value={itemDiet} onChange={event=>setItemDiet(event.target.value)}><option value="all">All dietary types</option>{dietaryOptions.map(option=><option key={option.id} value={option.id}>{option.name}</option>)}</select></label>{can('menu.edit') && can('prices.manage') && globalAccess && <button disabled={!categories.length} onClick={() => edit('items','New menu item',itemFields,{displayOrder:0,dietaryType:'UNSPECIFIED'})}>+ Add dish</button>}</div>{items.length ? <div className="table-scroll"><table><thead><tr><th>Dish</th><th>Category</th><th>Dietary type</th><th>Base price</th><th>Availability</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{visibleItems.map(i => <tr key={i.id}><td><strong>{i.name}</strong><small>{i.description}</small></td><td>{i.categoryName}</td><td><span className={`dietary-badge ${i.dietaryType==='VEGAN'?'vegan':''}`}>{dietaryLabel(i.dietaryType)}</span></td><td>{Number(i.basePrice).toFixed(2)} ETB</td><td><span className={`badge ${!i.active || !i.available ? 'inactive' : ''}`}>{!i.active ? 'Hidden' : i.available ? 'Available' : 'Out of stock'}</span></td><td>{can('menu.edit') && globalAccess && <button className="text-button" onClick={() => edit('items','Edit menu item',itemFields,i)}>Edit</button>}</td></tr>)}</tbody></table>{!visibleItems.length&&<p className="muted">No dishes match this dietary type.</p>}</div> : <Empty title="Good food deserves a good menu." text="Create a category, then add your first dish. Prices are stored in ETB." />}</section></>}
      {tab === 'tables' && <><section className="panel"><div className="section-heading"><h2>Dining areas</h2>{can('tables.manage') && <button className="secondary" disabled={!w.branches.length} onClick={() => edit('areas','New dining area',[['name','Area name'],['branchId','Branch','select',branchOptions]])}>+ Add area</button>}</div><div className="actions">{w.areas.map(a => <button className="chip" key={a.id} onClick={() => edit('areas','Edit dining area',[['name','Area name'],['branchId','Branch','select',branchOptions]],a)}>{a.name} · {w.branches.find(b => b.id === a.branchId)?.name}</button>)}</div></section><section className="panel"><div className="section-heading"><h2>Tables & QR codes</h2>{can('tables.manage') && <button disabled={!w.branches.length} onClick={() => setEditor({title:'New table',fields:tableFields,initial:{areaId:'none'},save:data => save('tables',{...data,areaId:data.areaId === 'none' ? null : data.areaId})})}>+ Add table</button>}</div><div className="card-grid">{w.tables.map(t => { const qr = t.qrCodes.find(q => !q.expiresAt || new Date(q.expiresAt) > new Date()); return <article className="record-card" key={t.id}><span className="tile-icon">▦</span><span className={`badge ${!t.active ? 'inactive' : ''}`}>{t.active ? 'Active' : 'Inactive'}</span><h3>{t.name}</h3><p className="muted">{w.branches.find(b => b.id === t.branchId)?.name}</p><div className="actions">{can('tables.manage') && <button className="secondary" onClick={() => setEditor({title:'Edit table',fields:tableFields,initial:{...t,areaId:t.areaId || 'none'},save:data => save('tables',{...data,areaId:data.areaId === 'none' ? null : data.areaId},t.id)})}>Edit</button>}{can('qr.manage') && <button className="secondary" onClick={() => run(() => save('qr',{tableId:t.id,action:'generate',expiresAt:null}))}>{qr ? 'Regenerate QR' : 'Create QR'}</button>}</div>{qr && can('qr.manage') && <div className="qr-actions"><a href={`/q/${qr.token}`} target="_blank" rel="noreferrer">Open menu ↗</a><a href={`/api/qr/${qr.id}?restaurantId=${restaurantId}`}>Download QR</a><a href={`/print/${qr.id}?restaurantId=${restaurantId}`} target="_blank" rel="noreferrer">Print card</a><button className="text-button danger" onClick={() => run(() => save('qr',{tableId:t.id,action:'revoke',expiresAt:null}))}>Revoke QR</button></div>}</article>; })}</div>{!w.tables.length && <Empty title="Connect your first table." text="Add a branch, then create a named or numbered table." />}</section></>}
      {tab === 'service' && <Operations restaurantId={restaurantId} permissions={w.permissions} branches={w.branches} />}
      {tab === 'team' && <Team w={w} can={can} edit={edit} save={save} run={run} />}
      {tab === 'settings' && <section className="panel"><h2>Restaurant settings</h2><p className="muted">Currency is ETB in Phase 1. Tax and service rates are configuration only; ordering is deferred.</p>{can('restaurant.manage') && globalAccess ? <><button className="secondary" onClick={() => edit('settings','Restaurant settings',[['name','Restaurant name'],['description','Description','textarea'],['address','Address','textarea'],['phone','Phone'],['logoUrl','Restaurant logo','upload-image'],['primaryColor','Primary color','color'],['currency','Currency'],['timezone','Default time zone'],['taxRate','Tax rate (%)','number'],['serviceChargeRate','Service charge (%)','number']],{...w.restaurant,...w.restaurant.settings})}>Edit settings</button><dl className="settings-list"><dt>Public slug</dt><dd>{w.restaurant.slug}</dd><dt>Time zone</dt><dd>{w.restaurant.settings.timezone}</dd><dt>Currency</dt><dd>{w.restaurant.settings.currency}</dd><dt>Tax rate</dt><dd>{w.restaurant.settings.taxRate}%</dd><dt>Service charge</dt><dd>{w.restaurant.settings.serviceChargeRate}%</dd></dl></> : <p>You do not have permission to change restaurant settings.</p>}</section>}
    </>}
    {account.user.platformAdmin && <section className="panel"><div className="section-heading"><h2>Platform administration</h2><button className="secondary" onClick={() => run(async () => setPlatform(await api('/api/platform')))}>Load restaurants</button></div>{platform?.restaurants.map(r => <div className="menu-line" key={r.id}><span>{r.name} · {r.status}</span><button className="secondary" onClick={() => run(async () => { await api('/api/platform',{id:r.id,status:r.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE'},'PATCH'); setPlatform(await api('/api/platform')); },'Restaurant status updated.')}>{r.status === 'ACTIVE' ? 'Suspend' : 'Activate'}</button></div>)}</section>}
    <footer className="workspace-footer">Tableline <span>Built around your table.</span></footer></div></main>{editor && <Editor {...editor} restaurantId={restaurantId} close={() => setEditor(null)} />}</div>;
}

function Empty({ title, text }) { return <div className="empty"><span aria-hidden="true">◇</span><h3>{title}</h3><p>{text}</p></div>; }

function Team({ w, can, edit, save, run }) {
  const memberFields = [['roleId','Role','select',w.roles.filter(r => !r.isOwner)],['allBranches','All branches','checkbox'],['branchIds','Assigned branches','multiselect',w.branches]];
  const inviteFields = [['email','Staff email','email'],...memberFields];
  return <><section className="panel"><div className="section-heading"><h2>Staff memberships</h2>{can('staff.manage') && w.allBranches && <button onClick={() => edit('invitations','Invite a staff member',inviteFields,{allBranches:false})}>+ Invite staff</button>}</div><p className="small muted">Invitation links expire after 72 hours. Share them privately. The recipient signs in with the invited email.</p><div className="table-scroll"><table><thead><tr><th>Person</th><th>Role</th><th>Access</th><th>Status</th><th>Action</th></tr></thead><tbody>{w.members.map(m => <tr key={m.id}><td><strong>{m.user.name}</strong><small>{m.user.email}</small></td><td>{w.roles.find(r => r.id === m.roleId)?.name}</td><td>{m.allBranches ? 'All branches' : m.branches.map(b => w.branches.find(v => v.id === b.branchId)?.name).join(', ')}</td><td>{m.status}</td><td>{!w.roles.find(r => r.id === m.roleId)?.isOwner && m.userId !== w.currentUserId && <button className="text-button" onClick={() => edit('members','Edit staff access',[...memberFields,['status','Account status','select',[{id:'ACTIVE',name:'Active'},{id:'SUSPENDED',name:'Suspended'}]]],{...m,branchIds:m.branches.map(b => b.branchId)})}>Edit</button>}</td></tr>)}</tbody></table></div>{!w.members.length && <p className="muted">Staff management requires restaurant-wide access.</p>}{w.invitations.map(i => <div className="menu-line" key={i.id}><span>Pending · {i.email}</span><button className="text-button danger" onClick={() => run(() => save('revoke-invitation',{},i.id))}>Revoke</button></div>)}</section><section className="panel"><div className="section-heading"><h2>Roles & permissions</h2>{can('roles.manage') && w.allBranches && <button className="secondary" onClick={() => edit('roles','Create a custom role',[['name','Role name'],['permissions','Permissions','multiselect',w.permissions.map(p => ({id:p,name:p.replaceAll('.',' ? ')}))]])}>+ Custom role</button>}</div><div className="card-grid">{w.roles.map(r => <article className="record-card" key={r.id}><h3>{r.name.replaceAll('_',' ')}</h3><p className="small muted">{r.permissions.map(p => p.permissionKey).join(' · ') || 'No permissions'}</p>{!r.isOwner && can('roles.manage') && w.allBranches && <button className="secondary" onClick={() => edit('roles','Edit role',[['name','Role name'],['permissions','Permissions','multiselect',w.permissions.map(p => ({id:p,name:p.replaceAll('.',' ? ')}))]],{...r,permissions:r.permissions.map(p => p.permissionKey)})}>Edit permissions</button>}</article>)}</div></section></>;
}
