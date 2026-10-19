"use client";
import {useEffect,useState} from 'react';
import MenuIcon from './menu-icons';

const transitions={PLACED:['ACCEPTED','CANCELLED'],ACCEPTED:['PREPARING','CANCELLED'],PREPARING:['READY','CANCELLED'],READY:['SERVED'],SERVED:['COMPLETED']};
const labels={ACCEPTED:'Accept order',CANCELLED:'Cancel',PREPARING:'Start preparing',READY:'Mark ready',SERVED:'Mark served',COMPLETED:'Complete',ACKNOWLEDGED:'Acknowledge',RESOLVED:'Resolve'};
const requestLabels={WAITER:'Call waiter',BILL:'Bill requested',WATER:'Drinking water',CUTLERY:'Cutlery',HELP:'Assistance'};
export default function Operations({restaurantId,permissions,branches}){
  const [data,setData]=useState(null);
  const [error,setError]=useState('');
  const [busy,setBusy]=useState('');
  const can=p=>permissions.includes(p);
  const url=`/api/workspace/${restaurantId}/operations`;
  useEffect(()=>{
    let live=true;
    const refresh=()=>fetch(url,{cache:'no-store'}).then(async response=>{
      const value=await response.json();if(!response.ok)throw new Error(value.error||'Unable to load the queue.');return value;
    }).then(value=>{if(live){setData(value);setError('');}}).catch(e=>{if(live)setError(e.message);});
    refresh();const timer=setInterval(refresh,10000);
    return()=>{live=false;clearInterval(timer);};
  },[url]);
  async function update(kind,id,status){
    setBusy(id);setError('');
    try{
      const response=await fetch(url,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({kind,id,status})});
      const result=await response.json();if(!response.ok)throw new Error(result.error||'Unable to update status.');
      const refreshed=await fetch(url,{cache:'no-store'});const value=await refreshed.json();if(!refreshed.ok)throw new Error(value.error);setData(value);
    }catch(e){setError(e.message);}finally{setBusy('');}
  }
  return <div className="operations-board">{error&&<p role="alert" className="error">{error}</p>}<p className="small muted">Table orders and guest requests from the last 24 hours. This queue refreshes every 10 seconds. Order totals are not payment or collection records.</p>{!data?<p>Loading live service…</p>:<>
    {(can('orders.process')||can('kitchen.manage'))&&<section className="panel"><div className="section-heading"><h2>Incoming orders <span className="count">{data.orders.filter(o=>!['COMPLETED','CANCELLED'].includes(o.status)).length}</span></h2><MenuIcon name="cart"/></div>{data.orders.length?<div className="ops-cards">{data.orders.map(order=><article className="ops-card" key={order.id}><header><div><span className="small muted">{branches.find(b=>b.id===order.branchId)?.name}</span><h3>Table {order.table.name}</h3></div><span className={`badge ${order.status==='CANCELLED'?'inactive':''}`}>{order.status.replaceAll('_',' ')}</span></header><time className="small muted" dateTime={order.createdAt}>{new Intl.DateTimeFormat('en',{hour:'2-digit',minute:'2-digit',timeZone:'Africa/Addis_Ababa'}).format(new Date(order.createdAt))} · Addis Ababa time</time><ul>{order.items.map((item,index)=><li key={index}><span><strong>{item.quantity}×</strong> {item.name}</span><span>{Number(item.lineTotal).toFixed(2)}</span></li>)}</ul>{order.notes&&<p className="ops-note"><strong>Guest instructions:</strong> {order.notes}</p>}<div className="ops-total"><span>Order total</span><strong>{Number(order.total).toFixed(2)} {order.currency}</strong></div><div className="actions">{(transitions[order.status]||[]).filter(status=>can('orders.process')||(['PREPARING','READY'].includes(status)&&can('kitchen.manage'))).map(status=><button disabled={Boolean(busy)} className={status==='CANCELLED'?'secondary danger':''} key={status} onClick={()=>update('order',order.id,status)}>{busy===order.id?'Updating…':labels[status]}</button>)}</div></article>)}</div>:<div className="empty"><h3>No orders yet.</h3><p>Orders placed through a table QR will appear here.</p></div>}</section>}
    {can('service.manage')&&<section className="panel"><div className="section-heading"><h2>Guest requests <span className="count">{data.requests.filter(r=>r.status!=='RESOLVED').length}</span></h2><MenuIcon name="bell"/></div>{data.requests.length?<div className="ops-cards">{data.requests.map(r=><article className="ops-card" key={r.id}><header><div><span className="small muted">{branches.find(b=>b.id===r.branchId)?.name}</span><h3>Table {r.table.name}</h3></div><span className="badge">{r.status}</span></header><h3>{requestLabels[r.type]}</h3><p className="small muted">Received {new Intl.DateTimeFormat('en',{hour:'2-digit',minute:'2-digit',timeZone:'Africa/Addis_Ababa'}).format(new Date(r.createdAt))} · Addis Ababa time</p><div className="actions">{r.status==='OPEN'&&<button disabled={Boolean(busy)} onClick={()=>update('service',r.id,'ACKNOWLEDGED')}>Acknowledge</button>}{r.status!=='RESOLVED'&&<button disabled={Boolean(busy)} className="secondary" onClick={()=>update('service',r.id,'RESOLVED')}>Resolve</button>}</div></article>)}</div>:<div className="empty"><h3>Your tables are taken care of.</h3><p>Waiter, water, cutlery, assistance and bill requests will appear here.</p></div>}</section>}
  </>}</div>;
}
