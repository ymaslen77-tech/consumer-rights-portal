import {NextResponse} from "next/server";
import topics from "@/data/topics.json";
import situations from "@/data/situations.json";
import documents from "@/data/documents.json";
import news from "@/data/news.json";

export const dynamic="force-dynamic";

// Coolify provides SOURCE_COMMIT at runtime for Git-based applications.
// Never guess the deployed revision from the latest GitHub branch HEAD.
function reportedCommit(){
 const value=(process.env.SOURCE_COMMIT||"").trim();
 return /^[a-f\d]{7,40}$/i.test(value)?value.toLowerCase():null;
}

export async function GET(){
 const sourceCommit=reportedCommit();
 return NextResponse.json({
  service:"consumer-rights-portal",
  status:"ok",
  deployment:sourceCommit?"reported":"unverified",
  sourceCommit,
  branch:(process.env.COOLIFY_BRANCH||"").trim()||null,
  version:"0.1.0",
  content:{
   topics:topics.length,
   situations:situations.length,
   documents:documents.length,
   situationDocumentChoices:situations.reduce((n,s)=>n+s.documents.length,0),
   news:news.length
  }
 },{headers:{"Cache-Control":"no-store"}});
}
