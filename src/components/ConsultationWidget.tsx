"use client";
import {useEffect,useState} from "react";
import {LawyerReviewRequest} from "@/components/LawyerReviewRequest";

export function ConsultationWidget(){
 const [open,setOpen]=useState(false);
 const [online,setOnline]=useState<number|null>(null);
 useEffect(()=>{
  const id=crypto.randomUUID();
  let mounted=true;
  async function heartbeat(){
   try{
    const result=await fetch("/api/presence",{method:"POST",
     headers:{"Content-Type":"application/json"},cache:"no-store",body:JSON.stringify({id})});
    const data=result.ok?await result.json():null;
    if(mounted&&typeof data?.online==="number")setOnline(data.online);
   }catch{if(mounted)setOnline(null);}
  }
  void heartbeat();
  const timer=window.setInterval(()=>void heartbeat(),45000);
  return ()=>{mounted=false;window.clearInterval(timer);};
 },[]);
 return <aside className="consultation-widget" aria-label="Консультация юриста">
  <button type="button" className="consultation-toggle" aria-expanded={open}
   onClick={()=>setOpen(v=>!v)}>Консультация юриста</button>
  {open&&<div className="consultation-panel">
   <strong>Нужна помощь с вашей ситуацией?</strong>
   <p>Можно подготовить запрос на консультацию или направить созданный документ на проверку.</p>
   <p className="online-count">{online===null?"Число посетителей сейчас недоступно":
     "Посетителей сейчас: примерно "+online}</p>
   <p className="lawyer-status">Число посетителей не означает присутствие юриста онлайн. Возможность передачи запроса показана ниже.</p>
   <LawyerReviewRequest kind="consultation" title="Консультация по защите прав потребителей"/>
  </div>}
 </aside>;
}
