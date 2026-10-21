export default function MenuIcon({name,size=22,...props}){
  const paths={
    leaf:<><path d="M20 3C9 2 3 8 5 15s14 9 15-12Z"/><path d="M3 21 15 9M8 16l-1-6m6 1 5 1"/></>,
    expand:<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>,
    contract:<path d="M3 8h5V3m13 5h-5V3M8 21v-5H3m13 5v-5h5"/>,
    more:<><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></>,
    back:<path d="M19 12H5m6-6-6 6 6 6"/>,
    home:<><path d="m3 11 9-8 9 8M5 10v11h14V10M10 21v-7h4v7"/></>,
    pause:<><path d="M8 5v14M16 5v14"/></>,
    play:<path d="m8 4 12 8-12 8V4Z"/>,
    menu:<><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></>,
    cart:<><path d="M3 4h2l2.4 11h11.3l2-8H6"/><circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/></>,
    bell:<><path d="M4 17h16M6 17v-6a6 6 0 0 1 12 0v6M10 21h4M12 3V2"/></>,
    bill:<><path d="M6 3h12v19l-3-2-3 2-3-2-3 2V3Z"/><path d="M9 8h6M9 12h6M9 16h3"/></>,
    water:<><path d="M12 2S5 10 5 15a7 7 0 0 0 14 0c0-5-7-13-7-13Z"/><path d="M9 15a3 3 0 0 0 3 3"/></>,
    cutlery:<><path d="M4 2v7a3 3 0 0 0 6 0V2M7 2v20M20 22V2s-5 3-5 9h5"/></>,
    help:<><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 2-2.5 2-2.5 4M12 17h.01"/></>,
    search:<><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></>,
    arrow:<><path d="M5 12h14m-6-6 6 6-6 6"/></>,
    close:<path d="m6 6 12 12M6 18 18 6"/>,
    plus:<path d="M12 5v14M5 12h14"/>,
    minus:<path d="M5 12h14"/>,
    check:<path d="m5 12 4 4L19 6"/>,
    clock:<><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    pin:<><path d="M19 10c0 5-7 12-7 12S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2"/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name]||paths.menu}</svg>;
}
