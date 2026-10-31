import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

const origin = process.env.CONSUMER_SMOKE_ORIGIN || "http://127.0.0.1:3000";
const topics = JSON.parse(readFileSync("src/data/topics.json", "utf8"));
const situations = JSON.parse(readFileSync("src/data/situations.json", "utf8"));
const docs = JSON.parse(readFileSync("src/data/documents.json", "utf8"));
const seoGuides = JSON.parse(readFileSync("src/data/seo-guides.json", "utf8"));
const cases = ["/", "/situacii", "/organy", "/dokumenty", "/istochniki",
  "/sudebnaya-praktika", "/novosti", "/normativnye-akty", "/o-proekte",
  ...seoGuides.map(g => g.path), "/situacii/" + topics[0].slug, "/razbor/" + situations[0].slug,
  "/dokumenty/" + docs[0].slug, "/dokumenty/trebovanie-vozvrat-predoplaty",
  "/razbor/internet-magaziny-2", "/api/health"];

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
for (const path of cases) await get(path);
const robots = await get("/robots.txt");
assert.match(robots, /Disallow:\s*\//i);
const sitemap = await get("/sitemap.xml");
assert.doesNotMatch(sitemap, /https:\/\//i, "Closed preview must not advertise public URLs");
console.log("PREVIEW_HTTP_SMOKE_OK", cases.length + 2, "routes; noindex enforced");
