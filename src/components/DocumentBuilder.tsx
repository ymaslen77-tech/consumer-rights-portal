"use client";
import {useMemo, useState} from "react";
import {makeDocx} from "@/lib/office-export.mjs";
import {LawyerReviewRequest} from "@/components/LawyerReviewRequest";
import {draftText,validateDraft,getRecipientPrompt,type DraftFields,type ClaimType} from "@/lib/document-compose.mjs";
import {getContextualDraft} from "@/lib/consumer-case-guidance.mjs";

type Meta={slug:string;title:string;recipient:string;requestHint:string;legalBasis:string;claimType:ClaimType;
 legalLinks?:Array<{title:string;url:string}>; contextTitle?:string; inline?:boolean;
 legalRisk?:string; reviewDate?:string; topicSlug?:string; situationSlug?:string};
const initial:DraftFields={
 recipient:"",sender:"",address:"",contact:"",agreement:"",eventDate:"",
 description:"",request:"",evidence:"",claimAmount:"",counterpartyName:"",counterpartyAddress:"",
 courtBirth:"",courtIdentifier:"",courtNotices:"",courtPretrial:"",courtCalculation:"",courtFee:""
};
const choices:Record<string,string[]>={
 "zayavlenie-vozvrat-otmena-meropriyatiya":["Прошу в связи с подтверждённой отменой либо переносом мероприятия рассмотреть возврат цены билета в соответствии со статьёй 52.1 Основ законодательства РФ о культуре. Дополнительные платежи прошу оценить отдельно по их правовому основанию."],
 "zayavlenie-vozvrat-bileta-po-otkazu":["Уведомляю об отказе от посещения указанного мероприятия и прошу рассчитать подлежащую возврату стоимость билета с учётом даты заявления, статьи 52.1 Основ законодательства РФ о культуре и Правил № 1491."],
 "zayavlenie-vozvrat-bileta-bolezn":["Прошу рассмотреть заявление о возврате цены билета по документально подтверждённой болезни посетителя согласно статье 52.1 Основ законодательства РФ о культуре и Правилам № 1491 с учётом приложенных документов."],

 "zayavlenie-otkaz-fitnes":["Уведомляю об отказе от договора фитнес-услуг с указанной даты; прошу представить расчёт фактически оказанного и документально подтверждённых расходов, вернуть причитающийся остаток оплаты."],
 "pretenziya-neokazanny-fitnes":["Прошу проверить факты неоказания оплаченных занятий и удовлетворить конкретное требование по договору и применимым последствиям нарушения."],
 "pretenziya-srok-izgotovleniya-mebeli":["Прошу рассмотреть нарушение подтверждённого срока изготовления мебели и исполнить выбранное требование по применимому договору изготовления."],
 "pretenziya-nedostatki-mebeli":["Прошу обследовать указанные недостатки изготовленной мебели или монтажа и исполнить заявленное требование при подтверждении ответственности исполнителя."],
 "pretenziya-kachestvo-salon":["Прошу рассмотреть перечисленные недостатки бытовой услуги салона красоты и удовлетворить заявленное требование при подтверждении предусмотренных законом оснований."],
 "zayavlenie-otkaz-salon":["Уведомляю об отказе от предварительно оплаченной бытовой услуги и прошу предоставить расчёт фактических расходов и вернуть подлежащий возврату остаток."],
 "pretenziya-defekty-ddu":["Прошу застройщика проверить указанные дефекты объекта долевого строительства, согласовать предусмотренные законом меры устранения и предоставить мотивированный ответ."],
 "uvedomlenie-prosrochka-ddu":["Прошу разъяснить нарушение договорного срока передачи квартиры и порядок исполнения обязательства с учётом специальных положений Закона № 214-ФЗ и действующих на дату нарушения норм."],
 "zayavlenie-akt-osmotra-ddu":["Прошу зафиксировать перечисленные замечания при осмотре объекта долевого строительства и предоставить экземпляр соответствующего документа."],
 "pretenziya-neokazanny-urist":["Прошу представить доказательства фактически оказанных юридических услуг и удовлетворить выбранное требование в связи с подтверждённым нарушением договора."],
 "zayavlenie-otkaz-urist":["Уведомляю об отказе от договора юридических услуг и прошу рассчитать подтверждённые расходы исполнителя и возвратить причитающийся остаток."],
 "pretenziya-rielter-neokazal":["Прошу представить отчёт об исполненных обязанностях по договору риелторских услуг и удовлетворить требование по документально неоказанной части."],
 "zayavlenie-otkaz-rielter":["Уведомляю об отказе от договора с риелторским агентством; прошу представить расчёт подтверждённых расходов и вернуть причитающийся остаток."],
 "pretenziya-spornaya-summa-taksi":["Прошу проверить списания и расчёт платы за указанную поездку, представить данные тарифа и маршрута и возвратить необоснованно удержанную сумму при подтверждении нарушения."],
 "pretenziya-neokazannaya-poezdka":["Прошу проверить фактическое неоказание оплаченной поездки и возвратить подтверждённую необоснованную оплату с мотивированным ответом."],
 "pretenziya-povtornyy-defekt":["Прошу рассмотреть повторно выявленный недостаток технически сложного товара с учётом актов ремонтов и удовлетворить законное требование при наличии основания по статье 18."],
 "trebovanie-podmenny-tovar":["Прошу предоставить товар с аналогичными основными потребительскими свойствами на время ремонта при условии, что товар не относится к установленным исключениям."],
 "zayavlenie-elektro-ushcherb":["Прошу зарегистрировать сообщение о качестве электроснабжения, провести проверку и оформить акт; при подтверждении ответственности рассмотреть возмещение документально доказанного ущерба."],
 "pretenziya-dopuslugi-svyaz":["Прошу предоставить подтверждение согласия на дополнительную платную услугу связи и вернуть списанную сумму, если законного основания для подключения и оплаты нет."],
 "pretenziya-dosrochnoe-pogashenie":["Прошу предоставить подробный расчёт досрочного погашения, проверить спорную комиссию и исправить подтверждённые ошибки в начислениях и графике."],
 "zapros-soglasie-smeta-med":["Прошу предоставить предусмотренные законом копии информированных согласий и смету платных медицинских услуг, а также разъяснить согласование спорных начислений."],
 "zapros-turagent-turoperator":["Прошу сообщить сведения о туроператоре, основании полномочий турагента, существенных условиях туристского продукта и подтверждении бронирования."],

 "pretenziya-strahovshchiku":["Прошу пересмотреть отказ в страховой выплате, проверить обстоятельства страхового случая и направить мотивированный ответ согласно применимому закону и условиям договора."],
 "pretenziya-cena-na-kasse":["Прошу вернуть разницу между фактической оплатой и ценой, доведённой на ценнике при выборе товара, по приложенным чеку и фотографии."],
 "pretenziya-dvoynoe-spisanie":["Прошу вернуть повторную оплату по одному заказу после сверки двух операций и подтверждения отсутствия основания для второго платежа."],
 "zayavlenie-otkaz-dopuslug-kredit":["Уведомляю об отказе от указанной дополнительной услуги и прошу рассчитать и вернуть причитающуюся сумму по применимому порядку с мотивированным ответом."],
 "pretenziya-kreditnye-komissii":["Прошу проверить правовое основание и согласование указанной комиссии, представить расчёт и при отсутствии законного основания вернуть удержанную сумму."],
 "trebovanie-vozvrat-meduslugi":["Прошу вернуть плату за услугу, которая не была оказана в согласованное время по указанным обстоятельствам, с мотивированным расчётом."],
 "zapros-prodavca-marketpleys":["Прошу предоставить предусмотренные законом сведения о юридическом продавце, условиях заказа и реквизитах для направления требования."],
 "pretenziya-zaderzhka-avia":["Прошу проверить обстоятельства задержки или отмены авиарейса, рассмотреть подтверждённые расходы и удовлетворить законное требование."],
 "zayavlenie-vozvrat-avia":["Уведомляю о вынужденном отказе от перевозки по указанному подтверждённому основанию и прошу вернуть соответствующую провозную плату."],
 "pretenziya-otmena-broni":["Прошу проверить условия отмены подтверждённого бронирования, представить расчёт удержаний и возвратить причитающуюся сумму."],
 "pretenziya-ushcherb-avtoservis":["Прошу провести проверку обстоятельств повреждения автомобиля при ремонте и возместить документально подтверждённый вред при наличии установленных оснований."],
 "pretenziya-spisanie-posle-otkaza":["Прошу проверить списание, совершённое после полученного отказа от использования ранее сохранённых платёжных реквизитов, и вернуть сумму при наличии законного основания."],
 "zayavlenie-rastorzhenie-svyaz":["Прошу прекратить действие договора связи в установленном порядке с указанной даты, подтвердить расторжение и предоставить итоговый расчёт."],
 "zayavlenie-otkaz-obuchenie":["Уведомляю об отказе от платного обучения по указанному договору и прошу определить подлежащую возврату сумму с мотивированным расчётом."],
 "pretenziya-dostavka-edy":["Прошу проверить несоответствие доставленного заказа согласованному составу и удовлетворить конкретное подтверждённое требование."],
 "pretensiya-vozvrat":["Прошу вернуть уплаченную за товар сумму в связи с установленным недостатком на основании применимого требования статьи 18 Закона № 2300-1."],
 "pretensiya-obmen":["Прошу обменять товар надлежащего качества при соблюдении условий статьи 25 Закона № 2300-1."],
 "pretensiya-remont":["Прошу безвозмездно устранить подтверждённые недостатки в срок, применимый к настоящему требованию."],
 "trebovanie-vozvrat-predoplaty":["Прошу возвратить сумму предварительной оплаты за товар, не переданный в согласованный срок; условия статьи 23.1 подлежат проверке."],
 "zhaloba-rospotrebnadzor":["Прошу рассмотреть изложенные обстоятельства на предмет нарушения обязательных требований и сообщить о результатах в установленном законом порядке."],
 "finansovyy-upolnomochennyy-obrashchenie":["Прошу рассмотреть имущественное требование к финансовой организации после соблюдения предусмотренного досудебного порядка."],
 "uvedomlenie-otkaz-podpiska":["Уведомляю об отказе от дальнейшего использования ранее предоставленных платёжных реквизитов при периодических списаниях; прошу подтвердить получение уведомления."],
 "zayavlenie-proverka-kachestva-zhkh":["Прошу провести проверку качества коммунальной услуги в указанном помещении и составить акт по Правилам № 354 с выдачей экземпляра."],
 "zayavlenie-akt-ushcherba-zhkh":["Прошу обследовать повреждения имущества и оформить акт с описанием обстоятельств и предполагаемой причины, предоставив экземпляр."],
 "trebovanie-remont-obshchego-imushchestva":["Прошу обследовать указанный элемент общего имущества и устранить подтверждённое нарушение содержания в пределах обязанностей по управлению домом."],
 "zhaloba-gzhi":["Прошу рассмотреть изложенные сведения о возможных нарушениях управления многоквартирным домом и принять меры в пределах установленных полномочий."],
 "obrashchenie-kapremont":["Прошу предоставить сведения о сроках и объёме предусмотренного капитального ремонта и исполнении соответствующих обязанностей по региональной программе."],
 "trebovanie-pereraschet-soderzhanie-zhkh":["Прошу проверить основание и расчёт платы за содержание жилого помещения и исправить подтверждённые ошибки начислений."],
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
 const contextualOptions=getContextualDraft(meta.situationSlug,meta.slug)?.examples;
 const options=contextualOptions?.length?contextualOptions:choices[meta.slug]||[];
 const recipientPrompt=getRecipientPrompt(meta);
 const isHousing=meta.topicSlug==="zhkh"||/коммун|управляющ|жилищн|капремонт/iu.test(meta.recipient);
 const fieldTopic=meta.topicSlug||"";
 const subjectLabels:Record<string,[string,string,string,string]>={
  "kulturnye-meropriyatiya":["Билет, заказ или абонемент","№ билета, название и дата мероприятия","Дата проведения и дата обращения","Дата мероприятия и подачи заявления"],
  "fitnes-sport":["Договор и абонемент фитнес-клуба","Номер абонемента, период действия","Дата отказа или неоказания услуги","Дата обращения, период недоступности"],
  "mebel-na-zakaz":["Договор изготовления и спецификация","Номер договора, заказ и замерный лист","Дата передачи или выявления недостатка","Дата изготовления, приёмки, обнаружения"],
  "salony-krasoty":["Договор или запись на услугу салона","Запись, название процедуры и квитанция","Дата процедуры или отказа от записи","Дата посещения или отмены записи"],
  "dolevoe-stroitelstvo":["Договор долевого участия и адрес объекта","Номер ДДУ, адрес и номер квартиры","Дата передачи или обнаружения дефекта","Дата договорной передачи / осмотра"],
  "yuridicheskie-uslugi":["Договор юридических услуг","Номер договора и предмет поручения","Дата нарушения срока или отказа","Дата поручения, неисполнения или отказа"],
  "rieltorskie-uslugi":["Договор с риелторским агентством","Номер договора и предмет поиска","Дата нарушения или отказа","Дата обращения к риелтору / отказа"],
  "taksi-agregatory":["Номер и детали поездки в такси","Номер заказа, тариф, маршрут","Дата и время поездки","Дата и время заказа или поездки"]
 };
 const labels=subjectLabels[fieldTopic];
 const agreementLabel=isHousing?"Адрес помещения / лицевой счёт / номер обращения":labels?.[0]||"Договор, заказ или сведения о покупке";
 const agreementHint=isHousing?"Адрес дома, квартира, лицевой счёт или регистрационный номер заявки":labels?.[1]||"№, дата, название товара / услуги";
 const eventDateLabel=isHousing?"Дата или период нарушения коммунальной услуги":labels?.[2]||"Дата нарушения или покупки";
 const eventDateHint=isHousing?"Дата, время или период неоказания услуги":labels?.[3]||"ДД.ММ.ГГГГ";
 const essentials=descriptors.filter(x=>["recipient","sender","address","description","request"].includes(x.key));
 const additional=descriptors.filter(x=>!["recipient","sender","address","description","request"].includes(x.key));
 const renderField=(item:(typeof descriptors)[number])=><label key={item.key}>{item.key==="recipient"?recipientPrompt.label:item.key==="agreement"?agreementLabel:item.key==="eventDate"?eventDateLabel:item.label}
   {item.multiline?<textarea value={fields[item.key]} onChange={e=>update(item.key,e.target.value)}
     placeholder={item.key==="recipient"?recipientPrompt.hint:item.key==="agreement"?agreementHint:item.key==="eventDate"?eventDateHint:item.hint} rows={item.key==="description"?5:3} maxLength={6000}/>:
   <input value={fields[item.key]} onChange={e=>update(item.key,e.target.value)} placeholder={item.key==="recipient"?recipientPrompt.hint:item.key==="agreement"?agreementHint:item.key==="eventDate"?eventDateHint:item.hint} maxLength={500}/>}
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
   {meta.topicSlug==="banki-strahovanie"&&<div className="notice" role="note">
    <strong>Досудебный порядок по финансовым услугам</strong>
    <p>При имущественном споре проверьте компетенцию финансового уполномоченного по Закону № 123-ФЗ. Если он обязателен, сначала направьте обращение в финансовую организацию и дождитесь ответа или установленного срока, затем обратитесь к уполномоченному. Жалоба в Банк России этот порядок не заменяет.</p>
   </div>}
   <p className="subtle"><strong>Подсказка по предмету:</strong> {meta.requestHint}</p>
   {meta.legalRisk&&<div className="notice" role="note">
     <strong>Ключевые ограничения для выбора требования</strong>
     <p>{meta.legalRisk}</p>
     <p className="subtle">Дата последней сверки справочных ссылок: {meta.reviewDate}. Это не подтверждение самостоятельной юридической экспертизы документа; применимость норм зависит от даты и обстоятельств спора.</p>
   </div>}
   {meta.legalLinks?.length?<div className="situation-legal-links">
    <strong>Нормативные тексты и разъяснения для проверки</strong>
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
    {isHousing&&<p className="subtle">Для коммунальной услуги укажите фактического исполнителя по договору. Им может быть управляющая организация, ТСЖ, ресурсоснабжающая организация или региональный оператор по обращению с ТКО; не подставляйте управляющую компанию автоматически.</p>}
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
