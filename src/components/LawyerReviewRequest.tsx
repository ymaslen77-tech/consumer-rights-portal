"use client";
import {useEffect,useState,type FormEvent} from "react";

type RequestKind="document"|"consultation";
type Props={kind:RequestKind;title:string;documentText?:string;isReady?:boolean};

export function LawyerReviewRequest({kind,title,documentText="",isReady=true}:Props){
 const [expanded,setExpanded]=useState(false);
 const [enabled,setEnabled]=useState<boolean|null>(null);
 const [secure,setSecure]=useState(false);
 const [contact,setContact]=useState("");
 const [description,setDescription]=useState("");
 const [consent,setConsent]=useState(false);
 const [sending,setSending]=useState(false);
 const [message,setMessage]=useState("");
 useEffect(()=>{
   let mounted=true;
   setSecure(window.location.protocol==="https:");
   fetch("/api/lawyer/status",{cache:"no-store"})
     .then(r=>r.ok?r.json():null)
     .then(data=>{if(mounted)setEnabled(data?.enabled===true);})
     .catch(()=>{if(mounted)setEnabled(false);});
   return ()=>{mounted=false;};
 },[]);
 const heading=kind==="document"?"Отправить на проверку юриста":"Запросить консультацию юриста";
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();
  const text=kind==="document"?documentText:description;
  if(!isReady||!enabled||!secure||!consent||!contact.trim()||text.trim().length<20)return;
  setSending(true);setMessage("");
  try{
   const res=await fetch("/api/lawyer/review",{
    method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({kind,title,text,contact,consent,website:""})
   });
   if(!res.ok)throw new Error("unavailable");
   setMessage("Запрос передан на рассмотрение. Ответ поступит по указанному вами контакту.");
   setContact("");setDescription("");setConsent(false);
  }catch{
   setMessage("Не удалось отправить запрос. Никакого подтверждения передачи нет — попробуйте позже.");
  }finally{setSending(false);}
 }
 return <div className="lawyer-review-request">
  <button className="btn outline small" type="button" aria-expanded={expanded}
    onClick={()=>{setExpanded(x=>!x);setMessage("");}}>{heading}</button>
  {expanded&&<div className="lawyer-request-panel">
   {!isReady?<p role="status">Сначала заполните обязательные поля документа и подтвердите применимые ограничения.</p>:
    enabled===null?<p role="status">Проверяем доступность консультаций…</p>:
    !enabled?<p role="status">Приём обращений юристом пока не подключён. Вы можете сохранить документ; передача данных и запись на консультацию сейчас не выполняются.</p>:
    !secure?<p role="status">Для передачи личных данных нужен защищённый адрес HTTPS. Пока сайт работает по HTTP, отправка недоступна.</p>:
    <form onSubmit={submit}>
      <p>Данные будут переданы специалисту только после вашего подтверждения. Не указывайте паспортные данные и другие сведения, которые не нужны для обращения.</p>
      <label>Контакт для ответа (email или телефон)
        <input required autoComplete="email" value={contact} maxLength={200}
          onChange={e=>setContact(e.target.value)} placeholder="Как с вами связаться"/>
      </label>
      {kind==="consultation"&&<label>Опишите вашу ситуацию
       <textarea required value={description} maxLength={12000} rows={5}
         onChange={e=>setDescription(e.target.value)} placeholder="Какая помощь вам требуется?"/>
      </label>}
      <label className="lawyer-consent"><input type="checkbox" required checked={consent}
        onChange={e=>setConsent(e.target.checked)}/>
        <span>Согласен на передачу введённых сведений юристу для рассмотрения запроса и ответа.</span>
      </label>
      <button className="btn primary small" type="submit" disabled={sending||!consent||
       contact.trim().length<5||(kind==="consultation"&&description.trim().length<20)}>
        {sending?"Отправляем…":"Подтвердить отправку"}
      </button>
    </form>}
   {message&&<p role="status">{message}</p>}
  </div>}
 </div>;
}
