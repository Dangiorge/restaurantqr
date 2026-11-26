"use client";

import {useEffect} from 'react';

// Effects run only after the whole page has hydrated, so this marks the moment the
// animated sections are wired up and the loading screen may open.
export default function ReadySignal(){
  useEffect(()=>{
    window.__rominaReady=true;
    window.dispatchEvent(new Event('romina:ready'));
  },[]);
  return null;
}
