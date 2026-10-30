import topics from "@/data/topics.json";
import situations from "@/data/situations.json";
import institutions from "@/data/institutions.json";
import documents from "@/data/documents.json";
import officialSources from "@/data/official-sources.json";
export { topics, situations, institutions, documents, officialSources };
export function getTopic(slug: string) { return topics.find(t => t.slug === slug); }
export function getSituation(slug: string) { return situations.find(s => s.slug === slug); }
export function getInstitution(slug: string) { return institutions.find(x => x.slug === slug); }
export function getDocument(slug: string) { return documents.find(x => x.slug === slug); }
export function isReleased() {
  try {
    const target = new URL(process.env.SITE_URL || "");
    return process.env.SITE_CUTOVER === "true" &&
      process.env.SITE_RELEASE_APPROVED === "yes" &&
      target.protocol === "https:" && !!target.hostname &&
      !target.username && !target.password && !target.port &&
      target.pathname === "/" && !target.search && !target.hash &&
      !["localhost", "127.0.0.1", "example.com", "example.org"].includes(target.hostname);
  } catch { return false; }
}
export function siteUrl(path: string) { return new URL(path, process.env.SITE_URL || "http://localhost:3000").toString(); }
