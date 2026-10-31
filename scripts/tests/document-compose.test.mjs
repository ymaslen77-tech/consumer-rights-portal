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
 const completed={...f,counterpartyName:"ООО",counterpartyAddress:"адрес"};
 assert.deepEqual(validateDraft(completed,"court_document"),[]);
});
test("incomplete drafts are not valid for export",()=>{
 const missing = validateDraft({sender:"А"}, "pretrial_claim");
 assert.ok(REQUIRED_FIELDS.every(k=> k==="sender" || missing.includes(k)));
});

test("draft carries explicit legislation links and names the selected situation",()=>{
 const text=draftText(f,{
  title:"Обращение в Роспотребнадзор",legalBasis:"Закон № 59-ФЗ",
  claimType:"state_notification",contextTitle:"Просроченный продукт",
  legalLinks:[
   {title:"Федеральный закон № 59-ФЗ",url:"https://www.consultant.ru/document/cons_doc_LAW_59999/"},
   {title:"Закон № 2300-1",url:"https://www.consultant.ru/document/cons_doc_LAW_305/"}
  ]
 });
 assert.match(text,/Исходная правовая ситуация: Просроченный продукт/);
 assert.match(text,/НОРМАТИВНЫЕ ИСТОЧНИКИ ДЛЯ СВЕРКИ РЕДАКЦИИ/);
 assert.match(text,/Федеральный закон № 59-ФЗ/);
 assert.match(text,/https:\/\/www.consultant.ru\/document\/cons_doc_LAW_59999\//);
 assert.match(text,/https:\/\/www.consultant.ru\/document\/cons_doc_LAW_305\//);
});
test("invalid links are not inserted into legal drafts",()=>{
 const text=draftText(f,{
  title:"Претензия",legalBasis:"Закон № 2300-1",claimType:"pretrial_claim",
  legalLinks:[{title:"unsafe",url:"javascript:alert(1)"},{title:"safe",url:"https://www.consultant.ru/document/cons_doc_LAW_305/"}]
 });
 assert.doesNotMatch(text,/javascript:alert/);
 assert.match(text,/https:\/\/www.consultant.ru/);
});
