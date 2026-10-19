export const dietaryOptions=[{id:'UNSPECIFIED',name:'Not specified'},{id:'VEGAN',name:'Vegan'},{id:'NON_VEGAN',name:'Non-vegan'}];
export const dietaryLabel=value=>dietaryOptions.find(option=>option.id===value)?.name||'Not specified';

export function categoryRows(categories){
  const ordered=[...categories].sort((a,b)=>(a.displayOrder||0)-(b.displayOrder||0)||a.name.localeCompare(b.name));
  const roots=ordered.filter(c=>!c.parentId);
  return roots.flatMap(root=>[{...root,path:root.name,depth:0},...ordered.filter(c=>c.parentId===root.id).map(child=>({...child,path:`${root.name} / ${child.name}`,depth:1}))]);
}

export function filterMenuCategories(categories,{category='all',diet='all',search=''}={}){
  const query=search.trim().toLowerCase();
  return categoryRows(categories).filter(c=>category==='all'||c.id===category||c.parentId===category)
    .map(c=>({...c,items:c.items.filter(item=>(diet==='all'||item.dietaryType===diet)&&`${item.name} ${item.description||''}`.toLowerCase().includes(query))}))
    .filter(c=>c.items.length);
}
