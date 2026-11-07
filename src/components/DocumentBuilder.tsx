"use client";
import {useMemo, useState} from "react";
import {makeDocx} from "@/lib/office-export.mjs";
import {LawyerReviewRequest} from "@/components/LawyerReviewRequest";
import {draftText,validateDraft,type DraftFields,type ClaimType} from "@/lib/document-compose.mjs";

type Meta={slug:string;title:string;recipient:string;requestHint:string;legalBasis:string;claimType:ClaimType;
 legalLinks?:Array<{title:string;url:string}>; contextTitle?:string; inline?:boolean;
 legalRisk?:string; reviewDate?:string};
const initial:DraftFields={
 recipient:"",sender:"",address:"",contact:"",agreement:"",eventDate:"",
 description:"",request:"",evidence:"",claimAmount:"",counterpartyName:"",counterpartyAddress:"",
 courtBirth:"",courtIdentifier:"",courtNotices:"",courtPretrial:"",courtCalculation:"",courtFee:""
};
const choices:Record<string,string[]>={
 "pretenziya-strahovshchiku":["Прошу пересмотреть отказ в страховой выплате, проверить обстоятельства страхового случая и направить мотивированный ответ согласно применимому закону и условиям договора."],
 "pretenziya-cena-na-kasse":["Прошу вернуть разницу между фактической оплатой и ценой, доведённой на ценнике при выборе товара, по приложенным чеку и фотографии."],
 "pretenziya-dvoynoe-spisanie":["Прошу вернуть повторную оплату по одному заказу после сверки двух операций и подтверждения отсутствия основания для второго платежа."],
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
 {key:"recipient",label:"Адресат (полное наименование) *",hint:"Полное наименование адресата"},
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
 counterpartyAddress:"Адрес ответчика",claimAmount:"Корректная сумма в рублях",
 courtBirth:"Дата и место рождения истца",courtIdentifier:"Идентификатор истца",
 courtNotices:"Подтверждение направления копий иска",evidence:"Доказательства и приложения"
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
 const [lawConfirmed,setLawConfirmed]=useState(false);
 const content=useMemo(()=>draftText(fields,meta),[fields,meta.title,meta.legalBasis,meta.claimType,meta.contextTitle,meta.legalLinks,meta.legalRisk]);
 const problems=useMemo(()=>validateDraft(fields,meta.claimType),[fields,meta.claimType]);
 const valid=problems.length===0;
 const update=(key:keyof DraftFields,value:string)=>{setFields(f=>({...f,[key]:value}));setFeedback("");};
 function allowExport(){
   setShowWarnings(true);
   if(!valid){setFeedback("Заполните обязательные поля и исправьте ошибки суммы перед выгрузкой.");return false;}
   if(meta.legalRisk && !lawConfirmed){
     setFeedback("Прочитайте ограничения по выбранной ситуации и подтвердите проверку обстоятельств перед сохранением.");
     return false;
   }
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
 const recipientLabel = meta.claimType==="court_document" ? "Суд (наименование) *" :
   meta.slug==="finansovyy-upolnomochennyy-obrashchenie" ? "Финансовый уполномоченный *" :
   meta.claimType==="state_notification" ? "Государственный орган (наименование) *" :
   "Продавец, исполнитель или иное обязанное лицо *";
 const recipientHint = meta.claimType==="court_document" ? "Например, районный суд по установленной подсудности" :
   meta.slug==="finansovyy-upolnomochennyy-obrashchenie" ? "Финансовому уполномоченному" :
   meta.claimType==="state_notification" ? "Например, территориальное управление Роспотребнадзора" :
   (meta.recipient || "Наименование организации или Ф. И. О. индивидуального предпринимателя");
 const essentials=descriptors.filter(x=>["recipient","sender","address","description","request"].includes(x.key));
 const additional=descriptors.filter(x=>!["recipient","sender","address","description","request"].includes(x.key));
 const renderField=(item:(typeof descriptors)[number])=><label key={item.key}>{item.key==="recipient"?recipientLabel:item.label}
   {item.multiline?<textarea value={fields[item.key]} onChange={e=>update(item.key,e.target.value)}
     placeholder={item.key==="recipient"?recipientHint:item.hint} rows={item.key==="description"?5:3} maxLength={6000}/>:
   <input value={fields[item.key]} onChange={e=>update(item.key,e.target.value)} placeholder={item.key==="recipient"?recipientHint:item.hint} maxLength={500}/>}
 </label>;
 return <div className="builder">
  <div className="builderform">
   <h2>Подготовить юридический черновик</h2>
   <p className="subtle">Сведения остаются в браузере при подготовке и скачивании. Передача юристу возможна только после отдельного согласия и подключения защищённой связи.</p>
   <div className="notice"><strong>Перед отправкой проверьте</strong><p>Адресата, юридическое основание и исключения, сроки, доказательства, расчёты и порядок подачи. Автоматически не начисляем неустойку, штраф, проценты и госпошлину.</p></div>
   {meta.claimType==="court_document"&&<div className="notice">
    <strong>Судебный документ требует отдельной проверки</strong>
    <p>Укажите точный суд, ответчика и его адрес, проверьте подсудность, цену иска, приложения и направление копий участникам до подачи.</p>
   </div>}
   <p className="subtle"><strong>Подсказка по предмету:</strong> {meta.requestHint}</p>
   {meta.legalRisk&&<div className="notice" role="note">
     <strong>Ключевые ограничения для выбора требования</strong>
     <p>{meta.legalRisk}</p>
     <p className="subtle">Первоисточники сверены {meta.reviewDate}. Применимость зависит от даты и фактов вашего дела.</p>
   </div>}
   {meta.legalLinks?.length?<div className="situation-legal-links">
    <strong>Нормативные акты и официальные источники</strong>
    <p>Проверьте актуальную редакцию и применимость. Ссылки предназначены для проверки норм и не добавляются в текст обращения.</p>
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
    {key:"counterpartyAddress" as const,label:"Адрес ответчика *",hint:"Адрес регистрации или местонахождения"},
    {key:"courtBirth" as const,label:"Дата и место рождения истца *",hint:"Дата и населённый пункт рождения"},
    {key:"courtIdentifier" as const,label:"Идентификатор истца *",hint:"СНИЛС или ИНН / паспорт / водительское удостоверение"},
    {key:"courtNotices" as const,label:"Доказательства отправки копий участникам *",hint:"Квитанция отправки, дата, опись и адрес"},
    {key:"courtPretrial" as const,label:"Досудебный порядок",hint:"Претензия и ответ / отметка о неприменимости"},
    {key:"courtCalculation" as const,label:"Расчёт иска",hint:"Разбивка по суммам; не добавлять штраф без подтверждения"},
    {key:"courtFee" as const,label:"Госпошлина / основание льготы",hint:"Укажите основание или документ; размер не рассчитывается автоматически"}
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
  {meta.legalRisk&&<label className="legal-confirmation">
    <input type="checkbox" checked={lawConfirmed} onChange={e=>{setLawConfirmed(e.target.checked);setFeedback("");}}/>
    <span>Я проверил факты своего дела, вид требования и ограничения, указанные выше. Документ остаётся черновиком до проверки реквизитов и применимой редакции закона.</span>
   </label>}
  <div className="builderpreview">
   <div className="previewhead"><h2>Предварительный просмотр</h2></div>
   <div className="document-actions">
    <button className="btn primary small" type="button" onClick={exportDocx}>Сохранить DOCX</button>
    <button className="btn outline small" type="button" onClick={printPdf}>Печать / PDF</button>
    <button className="btn outline small" type="button" onClick={exportText}>TXT</button>
   </div>
   {feedback&&<p className="disclaimer" role="status">{feedback}</p>}
   <pre>{content}</pre>
   <LawyerReviewRequest kind="document" title={meta.title} documentText={content}
     isReady={valid && (!meta.legalRisk || lawConfirmed)}/>
   <p className="disclaimer">Черновик формируется только в браузере. DOCX редактируется в Word/LibreOffice; PDF сохраняется через диалог печати. Самостоятельно сохранённый файл не направляется адресату. Запрос юридической проверки передаётся только с вашего согласия, при наличии защищённого канала.</p>
  </div>
 </div>;
}
