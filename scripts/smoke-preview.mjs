import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

const origin = process.env.CONSUMER_SMOKE_ORIGIN || "http://127.0.0.1:3000";
const topics = JSON.parse(readFileSync("src/data/topics.json", "utf8"));
const situations = JSON.parse(readFileSync("src/data/situations.json", "utf8"));
const docs = JSON.parse(readFileSync("src/data/documents.json", "utf8"));
const seoGuides = JSON.parse(readFileSync("src/data/seo-guides.json", "utf8"));
const regions = JSON.parse(readFileSync("src/data/rospotrebnadzor-regions.json", "utf8"));
const courtCases = JSON.parse(readFileSync("src/data/verified-court-cases.json", "utf8"));
const cases = ["/", "/situacii", "/organy", "/dokumenty", "/istochniki",
  "/sudebnaya-praktika", ...courtCases.map(x => "/sudebnaya-praktika/" + x.slug), "/novosti", "/normativnye-akty", "/o-proekte",
  ...seoGuides.map(g => g.path), "/rospotrebnadzor/regiony", ...regions.map(r => "/rospotrebnadzor/regiony/" + r.slug), "/situacii/" + topics[0].slug, "/razbor/" + situations[0].slug,
  "/dokumenty/" + docs[0].slug, "/dokumenty/trebovanie-vozvrat-predoplaty",
  "/razbor/internet-magaziny-2", "/razbor/zhkh-1", "/razbor/banki-strahovanie-3", "/razbor/podpiski-cifrovye-3",
  "/dokumenty/finansovyy-upolnomochennyy-obrashchenie", "/dokumenty/zayavlenie-pereraschet-zhkh", "/api/health"];

async function get(path) {
  const response = await fetch(new URL(path, origin), { signal: AbortSignal.timeout(10000), redirect: "manual" });
  assert.equal(response.status, 200, path + " HTTP " + response.status);
  assert.match(response.headers.get("x-robots-tag") || "", /noindex/i, path + " is indexable");
  return response.text();
}

let ready = false;
for (let i = 0; i < 35; i++) {
  try {
    await get("/api/health");
    ready = true;
    break;
  } catch {
    await new Promise(r => setTimeout(r, 700));
  }
}
assert.ok(ready, "Next.js preview failed to start");
for (const path of cases) {
 const html=await get(path);
 if(path.startsWith("/razbor/")) assert.match(html,/situation-document-generator|Составить документ по этой ситуации/,path+" lacks inline generator");
}
const allSituationUrls=situations.map(x=>"/razbor/"+x.slug);
for(const path of allSituationUrls){
 const html=await get(path);
 assert.match(html,/situation-document-generator/,path+" missing generator");
}

const robots = await get("/robots.txt");
assert.match(robots, /Disallow:\s*\//i);
const sitemap = await get("/sitemap.xml");
assert.doesNotMatch(sitemap, /https:\/\//i, "Closed preview must not advertise public URLs");
// The legal-review intake MUST be disabled until a real HTTPS destination is configured.
const statusResponse=await fetch(new URL("/api/lawyer/status",origin),{cache:"no-store"});
assert.equal(statusResponse.status,200);
const intake=await statusResponse.json();
assert.equal(intake.enabled,false,"Preview must not accept legal submissions");
assert.equal(intake.lawyerOnline,null,"Never claim fictitious online lawyer availability");
const disabled=await fetch(new URL("/api/lawyer/review",origin),{
 method:"POST",headers:{"Content-Type":"application/json"},
 body:JSON.stringify({kind:"document",title:"Тестовая претензия",text:"Проверка текста претензии с тестовыми данными",contact:"test@example.invalid",consent:true,website:""})
});
assert.equal(disabled.status,503,"Unconfigured consultation intake must fail closed");
const visitor=await fetch(new URL("/api/presence",origin),{
 method:"POST",headers:{"Content-Type":"application/json"},
 body:JSON.stringify({id:"6f1b85b4-1bc0-4e9b-82ca-aac5779c2e6b"})
});
assert.equal(visitor.status,200);
assert.ok((await visitor.json()).online>=1,"Anonymous online counter should use actual heartbeats");
console.log("LAWYER_INTAKE_CLOSED_PREVIEW_AND_PRESENCE_OK");
console.log("PREVIEW_HTTP_SMOKE_OK", cases.length + 2, "routes; noindex enforced");
