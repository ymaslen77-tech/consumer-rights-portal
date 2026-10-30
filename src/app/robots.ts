import type {MetadataRoute} from "next";
import {isReleased,siteUrl} from "@/lib/content";
export const dynamic="force-dynamic";
export default function robots():MetadataRoute.Robots {return isReleased()?{rules:{userAgent:"*",allow:"/",disallow:["/api/","/admin/"]},sitemap:siteUrl("/sitemap.xml")}:{rules:{userAgent:"*",disallow:"/"}};}
