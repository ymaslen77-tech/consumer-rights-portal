import test from "node:test";
import assert from "node:assert/strict";
import {STATUTES,CASE_LEGAL_REFERENCES,getLegalAudit,validateLegalReferenceMatrix} from "../../src/lib/consumer-law-audit.mjs";
import topics from "../../src/data/topics.json" with {type:"json"};
import documents from "../../src/data/documents.json" with {type:"json"};
import situations from "../../src/data/situations.json" with {type:"json"};
test("all 20 domains and all 28 document drafts have legal reference coverage",()=>{
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
 assert.equal(situations.length,60);
 assert.equal(Object.keys(CASE_LEGAL_REFERENCES).length,60);
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
 assert.equal(documents.length,28);
 const docs=new Set(documents.map(x=>x.slug));
 assert.ok(docs.has("pretenziya-strahovshchiku"));
 assert.ok(docs.has("pretenziya-dvoynoe-spisanie"));
 assert.ok(getLegalAudit("marketpleysy","pretenziya-marketpleys","pretrial_claim","marketpleysy-3").links.some(x=>x.url.includes("cons_doc_LAW_511088")));
 assert.ok(getLegalAudit("turizm-gostinicy","pretenziya-turprodukt","pretrial_claim","turizm-gostinicy-1").links.some(x=>x.url.includes("cons_doc_LAW_534242")));
 assert.ok(getLegalAudit("vozvrat-obmen","pretensiya-obmen","pretrial_claim","vozvrat-obmen-3").links.some(x=>x.url.includes("cons_doc_LAW_535649")));
});
