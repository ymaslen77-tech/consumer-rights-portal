import test from "node:test";
import assert from "node:assert/strict";
import {makeDocx} from "../../src/lib/office-export.mjs";
import {draftText,validateDraft} from "../../src/lib/document-compose.mjs";
import {getLegalAudit,STATUTES} from "../../src/lib/consumer-law-audit.mjs";
import topics from "../../src/data/topics.json" with {type:"json"};
import situations from "../../src/data/situations.json" with {type:"json"};
import documents from "../../src/data/documents.json" with {type:"json"};

const sample={
 recipient:"ООО «Пример»",sender:"Тестов Иван Иванович",address:"г. Тест, ул. Проверочная, 1",
 contact:"test@example.invalid",agreement:"Договор № 2026-ТЕСТ от 15.10.2026",
 eventDate:"20.10.2026",description:"Согласно договору услуга не была исполнена в согласованный срок. Приложены доказательства.",
 request:"Прошу рассмотреть указанное требование по подтверждённым обстоятельствам.",
 evidence:"Копия договора, копия квитанции, переписка",claimAmount:"1250,00",
 counterpartyName:"ООО «Пример»",counterpartyAddress:"г. Тест, ул. Юридическая, 2",
 courtBirth:"01.01.1990, Москва",courtIdentifier:"СНИЛС тестовый",courtNotices:"Почтовое отправление № TEST123",
 courtPretrial:"Потребитель направил претензию 01.10.2026",courtCalculation:"1250,00 руб.; дополнительные суммы не заявлены",courtFee:"Основание льготы требует проверки"
};
function sanity(bytes,docname){
 assert.ok(bytes instanceof Uint8Array&&bytes.length>1000,docname+" DOCX empty");
 assert.equal(bytes[0],0x50);assert.equal(bytes[1],0x4b);
 const raw=new TextDecoder().decode(bytes);
 assert.match(raw,/word\/document\.xml/,docname);
 assert.match(raw,/Тестов Иван Иванович/,docname);
 assert.match(raw,/ПРАВОВЫЕ ОСНОВАНИЯ/,docname);
}
test("all 68 situation routes generate legally referenced DOCX and text",()=>{
 const docs=new Map(documents.map(d=>[d.slug,d]));
 let count=0;
 for(const situation of situations){
  assert.ok(topics.some(x=>x.slug===situation.topic),situation.slug);
  for(const slug of situation.documents){
   const d=docs.get(slug);assert.ok(d,slug);
   const audit=getLegalAudit(situation.topic,slug,d.claimType,situation.slug);
   const lawLinks=audit.links.map(x=>({title:x.name,url:x.url}));
   const body=draftText(sample,{
    title:d.title,claimType:d.claimType,contextTitle:situation.title,
    legalBasis:lawLinks.map(x=>x.title).join("; "),
    legalRisk:audit.risk,legalLinks:lawLinks
   });
   assert.doesNotMatch(body,/ПРОЕКТ ДОКУМЕНТА/);
   assert.doesNotMatch(body,/ОСОБЫЕ УСЛОВИЯ ПРИМЕНЕНИЯ НОРМ/);
   assert.match(body,/ПРАВОВЫЕ ОСНОВАНИЯ/);
   assert.ok(body.includes(situation.title),situation.slug);
   assert.ok(lawLinks.every(ref=>!body.includes(ref.url)),slug);
   assert.deepEqual(validateDraft(sample,d.claimType),[]);
   assert.doesNotMatch(body,/неустойка\s*:\s*\d+\s*руб\./i);
   sanity(makeDocx(body),situation.slug+"/"+slug);
   count++;
  }
 }
 assert.equal(situations.length,68);
 assert.ok(count>=80,"Expected 80+ distinct case-document combinations; got "+count);
 console.log("ALL_LEGAL_GENERATORS_TESTED",count,"documents in",situations.length,"situations");
});
test("all 34 standalone documents can generate an editable Word file",()=>{
 let count=0;
 for(const d of documents){
  const links =d.claimType==="court_document"?
   [STATUTES.courtForm,STATUTES.plenum17,STATUTES.courtPenalty,STATUTES.statute2026]:
   d.claimType==="state_notification"?[STATUTES.regulator,STATUTES.overview]:
   [STATUTES.overview,STATUTES.statute2026];
  const text=draftText(sample,{title:d.title,claimType:d.claimType,legalBasis:d.legalBasis,
   legalLinks:links.map(x=>({title:x.name,url:x.url}))});
  assert.ok(links.every(x=>!text.includes(x.url)),d.slug);
  if(d.claimType==="court_document"){
   assert.match(text,/ГПК РФ/);
   assert.match(text,/Ответчик:/);
   assert.match(text,/Доказательство направления копий иска/);
  }
  sanity(makeDocx(text),d.slug);count++;
 }
 assert.equal(count,34);
 console.log("STANDALONE_DOCUMENT_TEMPLATES_TESTED",count);
});
test("invalid amount and missing parties are blocked before export",()=>{
 assert.ok(validateDraft({...sample,recipient:""},"pretrial_claim").includes("recipient"));
 assert.ok(validateDraft({...sample,claimAmount:"2+2"},"pretrial_claim").includes("claimAmount"));
 assert.ok(validateDraft({...sample,counterpartyAddress:""},"court_document").includes("counterpartyAddress"));
});
