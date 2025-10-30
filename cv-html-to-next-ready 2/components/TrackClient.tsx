"use client";
import { useEffect } from "react";

export default function TrackClient(){
  useEffect(()=>{
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'pageview' })
    }).catch(() => {});

    function onClick(e: MouseEvent){
      const el = (e.target as HTMLElement)?.closest('a[data-cta]') as HTMLAnchorElement | null;
      if(!el) return;
      const label = el.getAttribute('data-cta') || 'cta';

      if(typeof window !== 'undefined' && (window as any).gtag){
        (window as any).gtag('event','cta_click',{ event_category:'engagement', event_label:label, value:1 });
      }

      try{
        const body = JSON.stringify({ type: 'cta_click', label });
        if('sendBeacon' in navigator){
          const blob = new Blob([body], { type:'application/json' });
          (navigator as any).sendBeacon('/api/track', blob);
        }else{
          fetch('/api/track',{ method:'POST', headers:{'Content-Type':'application/json'}, body });
        }
      }catch{}
    }

    async function onSubmit(e: Event){
      const form = e.target as HTMLFormElement;
      if(!form?.matches('form[data-send="contact"]')) return;
      e.preventDefault();
      const fd = new FormData(form);
      const payload: Record<string,string> = {};
      fd.forEach((v,k)=>{ payload[k]=String(v); });
      const res = await fetch('/api/contact',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
      if(res.ok){ alert('¡Enviado!'); form.reset(); } else { alert('Error al enviar'); }
    }

    document.addEventListener('click', onClick);
    document.addEventListener('submit', onSubmit as any);

    return ()=>{
      document.removeEventListener('click', onClick);
      document.removeEventListener('submit', onSubmit as any);
    };
  },[]);

  return null;
}