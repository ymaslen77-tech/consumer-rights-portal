import test from "node:test";
import assert from "node:assert/strict";
import {parseRubles,validateDraft,draftText,getDocumentLegalGrounds,getRecipientPrompt,REQUIRED_FIELDS} from "../../src/lib/document-compose.mjs";
const f = {recipient:"ООО «Продавец»",sender:"Иванова М.",address:"Москва, ул. Лесная, 1",
description:"Оплаченный заказ не доставлен",request:"Вернуть предоплату",agreement:"№ 123",
eventDate:"01.11.2026",evidence:"Копия чека",claimAmount:"1250,50"};
test("amount parsing rejects non-numeric and accepts positive decimals",()=>{
 assert.equal(parseRubles("1 250,50"),1250.5);
 assert.equal(parseRubles(""),null);
 assert.ok(Number.isNaN(parseRubles("-4")));
 assert.ok(Number.isNaN(parseRubles("foo")));
 assert.ok(Number.isNaN(parseRubles("0")));
});
test("state complaint wording is different from commercial money demand",()=>{
 const str = draftText(f,{title:"Обращение в Роспотребнадзор",legalBasis:"Закон № 59-ФЗ",claimType:"state_notification"});
 assert.match(str,/ПРОШУ ОРГАН РАССМОТРЕТЬ ОБРАЩЕНИЕ/);
 assert.match(str,/1\s?250,50 руб/);
 assert.doesNotMatch(str,/ПРОШУ СУД/);
 assert.equal(validateDraft(f,"state_notification").length,0);
});
test("court drafts require respondent details",()=>{
 assert.ok(validateDraft(f,"court_document").includes("counterpartyAddress"));
 const completed={...f,counterpartyName:"ООО",counterpartyAddress:"адрес",courtBirth:"01.01.1990, Москва",courtIdentifier:"ИНН тестовый",courtNotices:"квитанция отправки",evidence:"договор и чек"};
 assert.deepEqual(validateDraft(completed,"court_document"),[]);
});
test("incomplete drafts are not valid for export",()=>{
 const missing = validateDraft({sender:"А"}, "pretrial_claim");
 assert.ok(REQUIRED_FIELDS.every(k=> k==="sender" || missing.includes(k)));
});

test("draft carries legal grounds without editorial source appendix",()=>{
 const text=draftText(f,{
  title:"Обращение в Роспотребнадзор",legalBasis:"Закон № 59-ФЗ",
  claimType:"state_notification",contextTitle:"Просроченный продукт",
  legalLinks:[
   {title:"Федеральный закон № 59-ФЗ",url:"https://www.consultant.ru/document/cons_doc_LAW_59999/"},
   {title:"Закон № 2300-1",url:"https://www.consultant.ru/document/cons_doc_LAW_305/"}
  ]
 });
 assert.match(text,/По вопросу: Просроченный продукт/);
 assert.match(text,/ПРАВОВЫЕ ОСНОВАНИЯ/);
 assert.doesNotMatch(text,/НОРМАТИВНЫЕ ИСТОЧНИКИ|ПРОЕКТ ДОКУМЕНТА|ОСОБЫЕ УСЛОВИЯ ПРИМЕНЕНИЯ НОРМ/);
 assert.match(text,/Закон № 59-ФЗ/);
 assert.doesNotMatch(text,/https:\/\//);
 assert.doesNotMatch(text,/https:\/\//);
});
test("editorial links never appear in formal legal drafts",()=>{
 const text=draftText(f,{
  title:"Претензия",legalBasis:"Закон № 2300-1",claimType:"pretrial_claim",
  legalLinks:[{title:"unsafe",url:"javascript:alert(1)"},{title:"safe",url:"https://www.consultant.ru/document/cons_doc_LAW_305/"}]
 });
 assert.doesNotMatch(text,/javascript:alert/);
 assert.doesNotMatch(text,/https:\/\//);
});

test("pretrial claims reject court recipients but court filings accept them",()=>{
 assert.ok(validateDraft({...f,recipient:"В районный суд"},"pretrial_claim").includes("recipient"));
 assert.ok(validateDraft({...f,recipient:"Мировому судье"},"pretrial_claim").includes("recipient"));
 assert.equal(validateDraft({...f,recipient:"ООО «Продавец»"},"pretrial_claim").length,0);
 assert.equal(validateDraft({...f,recipient:"Районный суд",counterpartyName:"ООО",counterpartyAddress:"Адрес",courtBirth:"Дата",courtIdentifier:"Идентификатор",courtNotices:"Отправлено",evidence:"Копии"},"court_document").length,0);
});

test("labels identify the correct recipient, not a seller for communal services",()=>{
 const tko=getRecipientPrompt({slug:"zayavlenie-proverka-kachestva-zhkh",topicSlug:"zhkh",situationSlug:"zhkh-11",recipient:"Исполнителю коммунальной услуги",claimType:"pretrial_claim"});
 assert.match(tko.label,/ТКО/);
 assert.match(tko.hint,/региональный оператор/);
 assert.doesNotMatch(tko.label,/Продавец|продавцу/);
 assert.match(getRecipientPrompt({slug:"pretensiya-vozvrat",recipient:"Продавцу",claimType:"pretrial_claim"}).label,/Продавцу/);
 assert.match(getRecipientPrompt({slug:"zhaloba-gzhi",recipient:"Органу государственного жилищного надзора",claimType:"state_notification"}).label,/жилищного надзора/);
 assert.match(getRecipientPrompt({slug:"isk-zpp",recipient:"Суду",claimType:"court_document"}).label,/Суд/);
});
test("TKO legal grounds reference Housing Code and correct clauses of Rules 354",()=>{
 const a=getDocumentLegalGrounds("Правила № 354, раздел X","zhkh-11","zayavlenie-proverka-kachestva-zhkh");
 assert.match(a,/Жилищный кодекс РФ, статья 157/);
 assert.match(a,/148\(49\)/);
 assert.match(a,/106, 109/);
 assert.doesNotMatch(a,/148\(38\)/);
 const b=getDocumentLegalGrounds("Правила № 354","zhkh-11","zayavlenie-pereraschet-zhkh");
 assert.match(b,/148\(45\)/);
 assert.match(b,/Жилищный кодекс РФ/);
 assert.match(getDocumentLegalGrounds("Закон № 2300-1","marketpleysy-5","pretenziya-marketpleys"),/23\.1/);
 assert.equal(getDocumentLegalGrounds("Закон № 2300-1","marketpleysy-999","pretenziya-marketpleys"),"Закон № 2300-1");
});
test("unfilled optional fields are not fake facts in formal drafts",()=>{
 const fields={...f,agreement:"",eventDate:"",contact:"",evidence:"",claimAmount:""};
 const text=draftText(fields,{title:"Заявление",legalBasis:getDocumentLegalGrounds("Правила № 354","zhkh-11","zayavlenie-proverka-kachestva-zhkh"),claimType:"pretrial_claim"});
 assert.match(text,/Жилищный кодекс РФ, статья 157/);
 assert.doesNotMatch(text,/\[наименование договора|\[дата события|\[телефон|\[перечислите приложенные/);
 assert.doesNotMatch(text,/НОРМАТИВНЫЕ ИСТОЧНИКИ|ПРОЕКТ ДОКУМЕНТА|проверить закон/);
});

test("cultural ticket recipients stay with organizers, never court or general trade seller",()=>{
 const items=[
  {slug:"zayavlenie-vozvrat-otmena-meropriyatiya",recipient:"Организации исполнительских искусств или музею",claimType:"pretrial_claim"},
  {slug:"zayavlenie-vozvrat-bileta-po-otkazu",recipient:"Организации исполнительских искусств или музею",claimType:"pretrial_claim"},
  {slug:"zayavlenie-vozvrat-bileta-bolezn",recipient:"Организации исполнительских искусств или музею",claimType:"pretrial_claim"}
 ];
 for(const item of items){
  const prompt=getRecipientPrompt(item);
  assert.match(prompt.label,/Организации исполнительских искусств/);
  assert.doesNotMatch(prompt.label,/Продавец, исполнитель или иное обязанное лицо|Суд/);
 }
});
