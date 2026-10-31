"use client";
import {useMemo, useState} from "react";
import {makeDocx} from "@/lib/office-export.mjs";
import {draftText,validateDraft,type DraftFields,type ClaimType} from "@/lib/document-compose.mjs";

type Meta={slug:string;title:string;recipient:string;requestHint:string;legalBasis:string;claimType:ClaimType;
 legalLinks?:Array<{title:string;url:string}>; contextTitle?:string; inline?:boolean};
const initial:DraftFields={
 recipient:"",sender:"",address:"",contact:"",agreement:"",eventDate:"",
 description:"",request:"",evidence:"",claimAmount:"",counterpartyName:"",counterpartyAddress:""
};
const choices:Record<string,string[]>={
 "pretensiya-vozvrat":["Прошу вернуть уплаченную за товар сумму в связи с установленным недостатком на основании применимого требования статьи 18 Закона № 2300-1."],
 "pretensiya-obmen":["Прошу обменять товар надлежащего качества при соблюдении условий статьи 25 Закона № 2300-1."],
 "pretensiya-remont":["Прошу безвозмездно устранить подтверждённые недостатки в срок, применимый к настоящему требованию."],
 "trebovanie-vozvrat-predoplaty":["Прошу возвратить сумму предварительной оплаты за товар, не переданный в согласованный срок; условия статьи 23.1 подлежат проверке."],
 "zhaloba-rospotrebnadzor":["Прошу рассмотреть изложенные обстоятельства на предмет нарушения обязательных требований и сообщить о результатах в установленном законом порядке."],
 "finansovyy-upolnomochennyy-obrashchenie":["Прошу рассмотреть имущественное требование к финансовой организации после соблюдения предусмотренного досудебного порядка."],
 "uvedomlenie-otkaz-podpiska":["Уведомляю об отказе от дальнейшего использования ранее предоставленных платёжных реквизитов при периодических списаниях; прошу подтвердить получение уведомления."],
 "zayavlenie-pereraschet-zhkh":["Прошу проверить расчёт платы по указанному периоду и произвести перерасчёт при подтверждении оснований по Правилам № 354."],
 "zapros-medicinskie-dokumenty":["Прошу предоставить копии указанных медицинских документов в порядке, предусмотренном действующими правилами."],
 "pretenziya-perevozchik":["Прошу рассмотреть требование, связанное с нарушением условий перевозки, в установленном отраслевым законодательством порядке."]
};
const descriptors: Array<{key:keyof DraftFields;label:string;hint:string;multiline?:boolean}>= [
 {key:"recipient",label:"Адресат (полное наименование) *",hint:"Конкретная организация, ведомство или суд"},
 {key:"sender",label:"Заявитель (Ф. И. О.) *",hint:"Полностью"},
 {key:"address",label:"Почтовый адрес для ответа *",hint:"Укажите индекс и адрес"},
 {key:"contact",label:"Контактные данные",hint:"Телефон / email (по необходимости)"},
 {key:"agreement",label:"Договор, заказ или сведения о покупке",hint:"№, дата, название товара / услуги"},
 {key:"eventDate",label:"Дата нарушения или покупки",hint:"ДД.ММ.ГГГГ"},
 {key:"description",label:"Фактические обстоятельства *",hint:"Что произошло, даты, подтверждения; без оценочных утверждений",multiline:true},
 {key:"request",label:"Выбранное законное требование *",hint:"Сформулируйте конкретное требование, проверьте условия и сроки",multiline:true},
 {key:"claimAmount",label:"Сумма требования, руб. (при наличии)",hint:"Например, 1250,50; без автоматической неустойки"},
 {key:"evidence",label:"Приложения и доказательства",hint:"Перечень копий документов",multiline:true},
];
const fieldNames:Record<string,string>={
 recipient:"Адресат",sender:"Ф. И. О. заявителя",address:"Почтовый адрес",description:"Обстоятельства",
 request:"Сформулированное требование",counterpartyName:"Наименование ответчика",
 counterpartyAddress:"Адрес ответчика",claimAmount:"Корректная сумма в рублях"
};
function toFileName(slug:string,ext:string){return slug.replace(/[^a-z0-9-]/g,"-")+"-draft."+ext;}
function plainHtml(text:string){
 return text.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
            .replace(/"/g,"&quot;").replace(/'/g,"&#39;");
}
function saveBlob(blob:Blob,name:string){
 const url=URL.createObjectURL(blob);
 const link=document.createElement("a"); link.href=url;link.download=name;
 document.body.appendChild(link);link.click();link.remove();
 window.setTimeout(()=>URL.revokeObjectURL(url),1500);
}
export function DocumentBuilder(meta:Meta){
 const [fields,setFields]=useState<DraftFields>(initial);
 const [showWarnings,setShowWarnings]=useState(false);
 const [feedback,setFeedback]=useState("");
 const content=useMemo(()=>draftText(fields,meta),[fields,meta.title,meta.legalBasis,meta.claimType,meta.contextTitle,meta.legalLinks]);
 const problems=useMemo(()=>validateDraft(fields,meta.claimType),[fields,meta.claimType]);
 const valid=problems.length===0;
 const update=(key:keyof DraftFields,value:string)=>{setFields(f=>({...f,[key]:value}));setFeedback("");};
 function allowExport(){
   setShowWarnings(true);
   if(!valid){setFeedback("Заполните обязательные поля и исправьте ошибки суммы перед выгрузкой.");return false;}
   setFeedback("");return true;
 }
 function exportText(){
   if(!allowExport())return;
   saveBlob(new Blob([content],{type:"text/plain;charset=utf-8"}),toFileName(meta.slug,"txt"));
 }
 function exportDocx(){
   if(!allowExport())return;
   try{
     const bytes=makeDocx(content);
     const blob=new Blob([new Uint8Array(bytes)],{type:"application/vnd.openxmlformats-officedocument.wordprocessingml.document"});
     saveBlob(blob,toFileName(meta.slug,"docx"));
   }catch{setFeedback("DOCX не удалось подготовить. Можно сохранить TXT или воспользоваться печатью.");}
 }
 function printPdf(){
   if(!allowExport())return;
   const windowRef=window.open("","_blank");
   if(!windowRef){setFeedback("Окно печати заблокировано браузером. Разрешите всплывающее окно для этой страницы.");return;}
   windowRef.opener=null;
   const html='<!doctype html><html lang="ru"><head><meta charset="utf-8">'+
      '<title>Черновик документа</title><style>@page{size:A4;margin:20mm 18mm 20mm 25mm}'+
      'html{color:#111;background:#fff}body{font-family:"Times New Roman",serif;font-size:12pt;line-height:1.45}'+
      'main{white-space:pre-wrap;overflow-wrap:anywhere}h1{font-size:12pt}'+
      '</style></head><body><main>'+plainHtml(content)+'</main></body></html>';
   windowRef.document.open();windowRef.document.write(html);windowRef.document.close();
   windowRef.focus();
   windowRef.setTimeout(()=>windowRef.print(),250);
   setFeedback("В диалоге печати выберите «Сохранить как PDF». Документ остаётся только в вашем браузере.");
 }
 const options=choices[meta.slug]||[];
 const essentials=descriptors.filter(x=>["recipient","sender","address","description","request"].includes(x.key));
 const additional=descriptors.filter(x=>!["recipient","sender","address","description","request"].includes(x.key));
 const renderField=(item:(typeof descriptors)[number])=><label key={item.key}>{item.label}
   {item.multiline?<textarea value={fields[item.key]} onChange={e=>update(item.key,e.target.value)}
     placeholder={item.hint} rows={item.key==="description"?5:3} maxLength={6000}/>:
   <input value={fields[item.key]} onChange={e=>update(item.key,e.target.value)} placeholder={item.hint} maxLength={500}/>}
 </label>;
 return <div className="builder">
  <div className="builderform">
   <h2>Подготовить юридический черновик</h2>
   <p className="subtle">Все поля заполняются локально в браузере. Мы не получаем ваши Ф. И. О., адрес, документы или содержание требований.</p>
   <div className="notice"><strong>Перед отправкой проверьте</strong><p>Адресата, юридическое основание и исключения, сроки, доказательства, расчёты и порядок подачи. Автоматически не начисляем неустойку, штраф, проценты и госпошлину.</p></div>
   {meta.claimType==="court_document"&&<div className="notice">
    <strong>Судебный документ требует отдельной проверки</strong>
    <p>Укажите точный суд, ответчика и его адрес, проверьте подсудность, цену иска, приложения и направление копий участникам до подачи.</p>
   </div>}
   <p className="subtle"><strong>Подсказка по предмету:</strong> {meta.requestHint}</p>
   {meta.legalLinks?.length?<div className="situation-legal-links">
    <strong>Нормативные акты и официальные источники</strong>
    <p>Проверьте актуальную редакцию и применимость. URL попадут в скачиваемый документ.</p>
    <ul>{meta.legalLinks.map(x=><li key={x.url}><a href={x.url} target="_blank" rel="noopener noreferrer">{x.title}</a></li>)}</ul>
   </div>:null}
   {options.length>0&&<label>Пример возможной формулировки
    <select value="" onChange={e=>{if(e.target.value)update("request",e.target.value);}}>
     <option value="">Выберите для заполнения поля требования</option>
     {options.map(v=><option key={v} value={v}>{v}</option>)}
    </select><small>Это ориентир, а не юридическое заключение. Отредактируйте формулировку под свои обстоятельства.</small>
   </label>}
   {meta.claimType==="court_document"&&<>{[
    {key:"counterpartyName" as const,label:"Ответчик *",hint:"Полное наименование, Ф. И. О. или организационно-правовая форма"},
    {key:"counterpartyAddress" as const,label:"Адрес ответчика *",hint:"Адрес регистрации или местонахождения"}
   ].map(item=><label key={item.key}>{item.label}
    <input value={fields[item.key]} onChange={e=>update(item.key,e.target.value)} placeholder={item.hint} maxLength={400}/>
   </label>)}</>}
   {essentials.map(renderField)}
   <details className="builder-optional">
    <summary>Дополнительные сведения: дата, номер заказа, сумма, приложения</summary>
    {additional.map(renderField)}
   </details>
   {showWarnings&&problems.length>0&&<div className="notice" role="alert">
    <strong>Не хватает для сохранения документа</strong>
    <ul>{problems.map(key=><li key={key}>{fieldNames[key]||key}</li>)}</ul>
   </div>}
  </div>
  <div className="builderpreview">
   <div className="previewhead"><h2>Предварительный просмотр</h2></div>
   <div className="document-actions">
    <button className="btn primary small" type="button" onClick={exportDocx}>Сохранить DOCX</button>
    <button className="btn outline small" type="button" onClick={printPdf}>Печать / PDF</button>
    <button className="btn outline small" type="button" onClick={exportText}>TXT</button>
   </div>
   {feedback&&<p className="disclaimer" role="status">{feedback}</p>}
   <pre>{content}</pre>
   <p className="disclaimer">Черновик формируется только в браузере. DOCX редактируется в Word/LibreOffice; PDF сохраняется через диалог печати. Ни один файл автоматически не направляется адресату или в ведомство.</p>
  </div>
 </div>;
}
