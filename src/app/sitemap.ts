import type {MetadataRoute} from "next";
import {topics,situations,institutions,documents,isReleased,siteUrl} from "@/lib/content";
import seoGuides from "@/data/seo-guides.json";
export const dynamic="force-dynamic";
export default function sitemap():MetadataRoute.Sitemap {if(!isReleased())return [];const paths=["/","/situacii","/organy","/dokumenty","/istochniki","/sudebnaya-praktika","/novosti","/normativnye-akty","/o-proekte",...seoGuides.map(x=>x.path),...topics.map(x=>'/situacii/'+x.slug),...situations.map(x=>'/razbor/'+x.slug),...institutions.map(x=>'/organy/'+x.slug),...documents.map(x=>'/dokumenty/'+x.slug)];return paths.map(x=>({url:siteUrl(x),changeFrequency:"monthly"}));}
