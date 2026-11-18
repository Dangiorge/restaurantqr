"use client";

import {useCallback,useEffect,useState} from 'react';
import {translate} from '@/modules/menus/i18n.mjs';

export default function useGuestLanguage(){
  const [language,setLanguage]=useState('en');
  useEffect(()=>{
    try{const saved=localStorage.getItem('romina-language');if(saved==='am'||saved==='en')setLanguage(saved);}catch{}
  },[]);
  const change=useCallback(next=>{
    setLanguage(next);
    try{localStorage.setItem('romina-language',next);}catch{}
  },[]);
  const t=useCallback((key,fallback)=>translate(language,key,fallback),[language]);
  return {language,setLanguage:change,t};
}
