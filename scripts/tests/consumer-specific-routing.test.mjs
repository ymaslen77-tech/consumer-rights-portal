import test from "node:test";
import assert from "node:assert/strict";
import {CONTEXTUAL_DRAFTS,getContextualDraft,getContextualTitle} from "../../src/lib/consumer-case-guidance.mjs";
import {draftText,getDocumentLegalGrounds} from "../../src/lib/document-compose.mjs";
import {makeDocx} from "../../src/lib/office-export.mjs";
import situations from "../../src/data/situations.json" with {type:"json"};
import documents from "../../src/data/documents.json" with {type:"json"};

const cases=new Map(situations.map(s=>[s.slug,s]));
const docs=new Map(documents.map(d=>[d.slug,d]));
const exampleFields={
 recipient:"ООО «Тестовый адресат»",sender:"Тестов Иван Иванович",
 address:"г. Тест, д. 1",contact:"test@example.invalid",
 agreement:"Договор № Т-1",eventDate:"01.11.2026",
 description:"Факт и дата нарушения подтверждаются приложениями.",
 request:"Прошу проверить указанные нарушения и дать мотивированный ответ.",
 evidence:"Копии договора и переписки",claimAmount:"1500.00"
};

test("all context-specific legal draft pairs exist and keep drafts unapproved",()=>{
 assert.equal(Object.keys(CONTEXTUAL_DRAFTS).length,23);
 for(const [key, guidance] of Object.entries(CONTEXTUAL_DRAFTS)){
   const [caseSlug,documentSlug]=key.split("|");
   const s=cases.get(caseSlug),d=docs.get(documentSlug);
   assert.ok(s,key+" missing situation");
   assert.ok(d,key+" missing template");
   assert.ok(s.documents.includes(documentSlug),key+" not a linked document");
   assert.equal(d.status,"draft_template",key);
   assert.ok(guidance.title.length>20,key);
   assert.ok(guidance.legalGrounds.length>65,key);
   assert.ok(guidance.examples.length>0,key);
   assert.ok(guidance.examples.every(x=>x.length>60),key);
   const title=getContextualTitle(caseSlug,documentSlug,d.title);
   assert.equal(title,guidance.title,key);
   const grounds=getDocumentLegalGrounds(d.legalBasis,caseSlug,documentSlug);
   assert.equal(grounds,guidance.legalGrounds,key);
   const body=draftText(exampleFields,{
      title,legalBasis:grounds,claimType:d.claimType,contextTitle:s.title,
   });
   assert.ok(body.includes(grounds),key+" missing legal basis");
   assert.ok(body.includes(title.toUpperCase()),key+" missing title");
   assert.ok(!body.includes("https://"),key+" editorial links leaked");
   assert.doesNotMatch(body,/не применяется автоматически|не рассчитывается автоматически|не подменяя спор|не назначаются без проверки/iu,key+" editorial caveat leaked into legal grounds");
   assert.ok(makeDocx(body).length>1000,key+" DOCX too small");
 }
 assert.equal(getContextualDraft("foo","bar"),null);
 assert.equal(getContextualTitle("foo","bar","Fallback"),"Fallback");
});

test("insurance refund and payout are distinct in exported legal grounds",()=>{
 const payout=getContextualDraft("banki-strahovanie-3","pretenziya-strahovshchiku");
 const refusal=getContextualDraft("banki-strahovanie-1","pretenziya-strahovshchiku");
 const partial=getContextualDraft("banki-strahovanie-7","pretenziya-strahovshchiku");
 assert.notEqual(payout.title,refusal.title);
 assert.notEqual(refusal.title,partial.title);
 assert.match(payout.legalGrounds,/страховани/);
 assert.match(refusal.legalGrounds,/353-ФЗ/);
 assert.match(partial.legalGrounds,/досрочн/);
});

test("no defective-goods platform provision used as a universal basis for missing orders",()=>{
 for(const id of ["marketpleysy-2","marketpleysy-3","marketpleysy-5"]){
   const s=cases.get(id);
   assert.ok(s);
   assert.ok(s.legalBasis.every(b=>!b.includes("пункт 3.1 статьи 18")),id);
 }
 for(const id of ["marketpleysy-1","marketpleysy-5"]){
   const s=cases.get(id);
   assert.ok(s.legalBasis.some(x=>x.includes("23.1")),id);
   const g=getContextualDraft(id,"pretenziya-marketpleys");
   assert.match(g.legalGrounds,/23.1/);
   assert.doesNotMatch(g.examples.join(" "),/недостаток товар/iu);
 }
 const mismatch=getContextualDraft("marketpleysy-4","pretenziya-marketpleys");
 assert.match(mismatch.legalGrounds,/Пункт 3.1 статьи 18 применяется/);
});

test("remote quality-goods return cites 2026 Constitutional Court decision, not loss of goods",()=>{
 const remote=cases.get("internet-magaziny-5");
 assert.ok(remote.legalBasis.some(x=>x.includes("7-П")));
 assert.ok(remote.sources.some(u=>u.includes("ksrf.ru/news/37787")));
 assert.ok(remote.sources.some(u=>u.includes("rospotrebnadzor.ru/news/regional/573482")));
 const draft=getContextualDraft("internet-magaziny-5","pretensiya-distanciya");
 assert.match(draft.legalGrounds,/7-П/);
 assert.match(draft.examples[0],/дистанционн/);
 const missing=cases.get("marketpleysy-5");
 assert.ok(missing.legalBasis.every(x=>!x.includes("7-П")));
});

test("unauthorized bank payments and loan repayment use separate law references",()=>{
 const unauth=getContextualDraft("banki-strahovanie-4","pretenziya-operatsiya-banka");
 assert.match(unauth.legalGrounds,/161-ФЗ/);
 assert.match(unauth.legalGrounds,/части 11–15/);
 const repayment=getContextualDraft("banki-strahovanie-8","pretenziya-dosrochnoe-pogashenie");
 assert.match(repayment.legalGrounds,/353-ФЗ/);
 assert.doesNotMatch(repayment.legalGrounds,/161-ФЗ/);
 const ddu=getContextualDraft("dolevoe-stroitelstvo-1","uvedomlenie-prosrochka-ddu");
 assert.match(ddu.legalGrounds,/214-ФЗ/);
 assert.match(ddu.legalGrounds,/2227/);
});
