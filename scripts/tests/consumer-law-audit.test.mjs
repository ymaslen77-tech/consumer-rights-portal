import test from "node:test";
import assert from "node:assert/strict";
import {STATUTES,CASE_LEGAL_REFERENCES,getLegalAudit,validateLegalReferenceMatrix} from "../../src/lib/consumer-law-audit.mjs";
import topics from "../../src/data/topics.json" with {type:"json"};
import documents from "../../src/data/documents.json" with {type:"json"};
import situations from "../../src/data/situations.json" with {type:"json"};
test("all 28 domains and all 71 document drafts have legal reference coverage",()=>{
 assert.equal(validateLegalReferenceMatrix(topics.map(x=>x.slug),documents.map(x=>x.slug)),true);
});
test("every situation/document choice has multiple legal links and caveats",()=>{
 const docs=new Map(documents.map(x=>[x.slug,x]));
 let checked=0;
 for(const s of situations)for(const slug of s.documents){
  const d=docs.get(slug);assert.ok(d,"Missing document "+slug);
  const r=getLegalAudit(s.topic,slug,d.claimType,s.slug);
  assert.ok(r.links.length>=2,s.slug+" / "+slug);
  assert.ok(r.links.every(l=>l.url.startsWith("https://")&&l.name.length>15),slug);
  assert.ok(r.risk.length>60,s.slug);
  assert.equal(r.eligibilityRequired,true);
  checked++;
 }
 assert.equal(situations.length,145);
 assert.equal(Object.keys(CASE_LEGAL_REFERENCES).length,145);
 assert.ok(situations.every(x=>Array.isArray(CASE_LEGAL_REFERENCES[x.slug])));
 assert.ok(checked>=80,"Expected a selection of document choices in 60 routes");
});
test("Plenum is only required automatically on court draft",()=>{
 const a=getLegalAudit("zhkh","zayavlenie-pereraschet-zhkh","pretrial_claim");
 assert.equal(a.links.some(x=>/Пленума/.test(x.name)),false);
 const b=getLegalAudit("nekachestvennyy-tovar","isk-zpp","court_document");
 assert.ok(b.links.some(x=>/Пленума/.test(x.name)));
 assert.ok(b.links.some(x=>/500-ФЗ/.test(x.name)));
});

test("2026 trade, platform, tour changes and specialized documents",()=>{
 assert.equal(documents.length,71);
 const docs=new Set(documents.map(x=>x.slug));
 assert.ok(docs.has("pretenziya-strahovshchiku"));
 assert.ok(docs.has("pretenziya-dvoynoe-spisanie"));
 assert.ok(getLegalAudit("marketpleysy","pretenziya-marketpleys","pretrial_claim","marketpleysy-3").links.some(x=>x.url.includes("cons_doc_LAW_511088")));
 assert.ok(getLegalAudit("turizm-gostinicy","pretenziya-turprodukt","pretrial_claim","turizm-gostinicy-1").links.some(x=>x.url.includes("cons_doc_LAW_534242")));
 assert.ok(getLegalAudit("vozvrat-obmen","pretensiya-obmen","pretrial_claim","vozvrat-obmen-3").links.some(x=>x.url.includes("cons_doc_LAW_535649")));
});

test("expanded housing paths use their own procedural documents and sources",()=>{
 const byDoc=new Map(documents.map(d=>[d.slug,d]));
 const housing=situations.filter(s=>s.topic==="zhkh");
 assert.equal(housing.length,14);
 for(const s of housing){assert.ok(s.documents.length);for(const slug of s.documents)assert.ok(byDoc.has(slug));}
 const a=getLegalAudit("zhkh","zayavlenie-proverka-kachestva-zhkh","pretrial_claim","zhkh-4");
 assert.ok(a.links.some(l=>l.url.includes("cons_doc_LAW_114247")));
 const b=getLegalAudit("zhkh","trebovanie-remont-obshchego-imushchestva","pretrial_claim","zhkh-6");
 assert.ok(b.links.some(l=>l.url.includes("cons_doc_LAW_62293")));
 const c=getLegalAudit("zhkh","obrashchenie-kapremont","pretrial_claim","zhkh-7");
 assert.ok(c.links.some(l=>l.url.includes("cons_doc_LAW_51057")));
 assert.equal(byDoc.get("zhaloba-gzhi").claimType,"state_notification");
 assert.equal(byDoc.get("obrashchenie-kapremont").claimType,"pretrial_claim");
});

test("2026 finance medical and platform expansion is backed by official sources",()=>{
 const ids=["banki-strahovanie-4","banki-strahovanie-5","banki-strahovanie-6","banki-strahovanie-7","medicina-4","medicina-5","medicina-6","marketpleysy-4","marketpleysy-5","internet-magaziny-4","internet-magaziny-5"];
 for(const id of ids){const s=situations.find(x=>x.slug===id);assert.ok(s,id);assert.ok(s.sources.length>=2,id);assert.equal(s.steps.length,5);assert.equal(s.legalStatus,"sector_sources_checked_individual_facts_required_2026-11-09");}
});

test("transport tourism repair additions are traceable to their sector-specific law",()=>{
 const ids=["transport-4","transport-5","transport-6","transport-7","turizm-gostinicy-4","turizm-gostinicy-5","turizm-gostinicy-6","remont-stroitelstvo-4","remont-stroitelstvo-5","avtomobili-4","avtomobili-5"];
 for(const id of ids){const s=situations.find(x=>x.slug===id);assert.ok(s,id);assert.ok(s.sources.length>=2,id);assert.equal(s.steps.length,5);assert.equal(s.legalStatus,"sector_sources_checked_individual_facts_required_2026-11-09");}
 for(const k of ["pretenziya-zaderzhka-avia","zayavlenie-vozvrat-avia","pretenziya-otmena-broni","pretenziya-ushcherb-avtoservis"])assert.ok(documents.some(x=>x.slug===k),k);
});

test("2026 subscription, telecom, education and food regulation guardrails",()=>{
 const ids=["podpiski-cifrovye-4","podpiski-cifrovye-5","svyaz-internet-4","svyaz-internet-5","obrazovanie-4","obrazovanie-5","obrazovanie-6","produkty-pitanie-4","produkty-pitanie-5","produkty-pitanie-6","produkty-pitanie-7"];
 for(const id of ids){const s=situations.find(x=>x.slug===id);assert.ok(s,id);assert.ok(s.sources.length>=2,id);assert.equal(s.steps.length,5);assert.equal(s.legalStatus,"sector_sources_checked_individual_facts_required_2026-11-09");}
 for(const slug of ["pretenziya-spisanie-posle-otkaza","zayavlenie-rastorzhenie-svyaz","zayavlenie-otkaz-obuchenie","pretenziya-dostavka-edy"])assert.ok(documents.some(x=>x.slug===slug),slug);
});

test("bus route cites the motor transport charter instead of railway act",()=>{
 const route=situations.find(x=>x.slug==="transport-6");
 assert.ok(route.sources.some(x=>x.includes("cons_doc_LAW_72388")));
 assert.ok(route.sources.every(x=>!x.includes("cons_doc_LAW_40444")));
 const audit=getLegalAudit("transport","pretenziya-perevozchik","pretrial_claim","transport-6");
 assert.ok(audit.links.some(x=>x.url.includes("cons_doc_LAW_72388")));
});

test("culture and event ticket routes apply article 52.1 with matching refund rules",()=>{
 const id=["kulturnye-meropriyatiya-1","kulturnye-meropriyatiya-2","kulturnye-meropriyatiya-3","kulturnye-meropriyatiya-4"];
 for(const slug of id){
  const s=situations.find(x=>x.slug===slug);
  assert.ok(s,slug);
  assert.equal(s.topic,"kulturnye-meropriyatiya");
  assert.equal(s.steps.length,5);
  assert.ok(s.sources.length>=3);
  assert.equal(s.legalStatus,"sector_sources_checked_individual_facts_required_2026-11-10");
  const doc=documents.find(x=>x.slug===s.documents[0]);assert.ok(doc);
  const law=getLegalAudit(s.topic,doc.slug,doc.claimType,slug);
  assert.ok(law.links.some(x=>x.url.includes("cons_doc_LAW_1870")),slug);
  if(slug.endsWith("-3")||slug.endsWith("-4"))assert.ok(law.links.some(x=>x.name.includes("1491")),slug);
  assert.equal(law.reviewDate,"2026-11-10");
 }
});

test("all ten development stages have separate sector sources and operative documents",()=>{
 const families=["kulturnye-meropriyatiya","fitnes-sport","mebel-na-zakaz","salony-krasoty","dolevoe-stroitelstvo","yuridicheskie-uslugi","rieltorskie-uslugi","taksi-agregatory"];
 for(const topic of families){
  const t=topics.find(x=>x.slug===topic);assert.ok(t,topic);
  const local=situations.filter(s=>s.topic===topic);
  assert.ok(local.length>=4,topic);
  assert.ok(local.every(s=>s.sourceReviewedAt==="2026-11-10"),topic);
  for(const s of local)for(const key of s.documents)assert.ok(documents.some(d=>d.slug===key),s.slug+"/"+key);
 }
 const additional=["tehnicheski-slozhnye-4","garantiya-servis-4","zhkh-12","zhkh-13","zhkh-14","svyaz-internet-6","banki-strahovanie-8","banki-strahovanie-9","medicina-7","medicina-8","turizm-gostinicy-7","turizm-gostinicy-8"];
 for(const id of additional){
  const s=situations.find(x=>x.slug===id);assert.ok(s,id);
  assert.equal(s.sourceReviewedAt,"2026-11-10");
  const d=documents.find(x=>x.slug===s.documents[0]);assert.ok(d,id);
  const audit=getLegalAudit(s.topic,d.slug,d.claimType,id);
  assert.ok(audit.links.length>=2,id);
  assert.equal(audit.reviewDate,"2026-11-10",id);
 }
});
