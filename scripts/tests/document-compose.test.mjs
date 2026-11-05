import test from "node:test";
import assert from "node:assert/strict";
import {parseRubles,validateDraft,draftText,REQUIRED_FIELDS} from "../../src/lib/document-compose.mjs";
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
 assert.match(text,/Исходная правовая ситуация: Просроченный продукт/);
 assert.match(text,/ПРАВОВЫЕ ОСНОВАНИЯ/);
 assert.doesNotMatch(text,/НОРМАТИВНЫЕ ИСТОЧНИКИ|ПРОЕКТ ДОКУМЕНТА|ОСОБЫЕ УСЛОВИЯ ПРИМЕНЕНИЯ НОРМ/);
 assert.match(text,/Федеральный закон № 59-ФЗ/);
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
