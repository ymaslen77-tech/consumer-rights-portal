import {createHash,randomUUID} from "node:crypto";
import {NextRequest,NextResponse} from "next/server";
export const dynamic="force-dynamic";
const limits=new Map<string,{count:number;until:number}>();
function reply(error:string,status:number){return NextResponse.json({error},{status,headers:{"Cache-Control":"no-store"}});}
export async function POST(request:NextRequest){
 if(process.env.LAWYER_REVIEW_ENABLED!=="true"||
    !process.env.LAWYER_REVIEW_WEBHOOK_URL||!process.env.LAWYER_REVIEW_WEBHOOK_TOKEN){
  return reply("unavailable",503);
 }
 let target:URL;
 try{target=new URL(process.env.LAWYER_REVIEW_WEBHOOK_URL);}
 catch{return reply("unavailable",503);}
 if(target.protocol!=="https:"||target.username||target.password||target.hostname==="localhost"||
   target.hostname.endsWith(".local"))return reply("unavailable",503);
 const proto=(request.headers.get("x-forwarded-proto")||request.nextUrl.protocol.replace(":","")).split(",")[0].trim();
 if(proto!=="https")return reply("https_required",403);
 let origin:URL;
 try{origin=new URL(request.headers.get("origin")||"");}
 catch{return reply("invalid_origin",403);}
 const host=request.headers.get("x-forwarded-host")||request.headers.get("host");
 if(!host||origin.protocol!=="https:"||origin.host!==host)return reply("invalid_origin",403);
 if(Number(request.headers.get("content-length")||"0")>22000)return reply("too_large",413);
 let body:unknown;
 try{const raw=await request.text();if(raw.length>22000)return reply("too_large",413);body=JSON.parse(raw);}
 catch{return reply("invalid",400);}
 if(!body||typeof body!=="object")return reply("invalid",400);
 const d=body as Record<string,unknown>;
 if(!["document","consultation"].includes(String(d.kind))||
   typeof d.title!=="string"||d.title.length<4||d.title.length>200||
   typeof d.text!=="string"||d.text.trim().length<20||d.text.length>16000||
   typeof d.contact!=="string"||d.contact.trim().length<5||d.contact.length>200||
   d.consent!==true||d.website!=="")return reply("invalid",400);
 // Approximate abuse throttle; no raw IP address or customer submissions are retained.
 const ip=(request.headers.get("x-forwarded-for")||"unknown").split(",")[0].trim();
 const key=createHash("sha256").update(process.env.LAWYER_REVIEW_WEBHOOK_TOKEN+":"+ip).digest("hex");
 const now=Date.now();
 for(const [k,v] of limits)if(v.until<now)limits.delete(k);
 const entry=limits.get(key);
 if(entry&&entry.count>=3&&entry.until>now)return reply("rate_limited",429);
 limits.set(key,{count:(entry?.until&&entry.until>now?entry.count:0)+1,until:entry?.until&&entry.until>now?entry.until:now+600000});
 try{
  const res=await fetch(target.toString(),{
   method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+process.env.LAWYER_REVIEW_WEBHOOK_TOKEN},
   body:JSON.stringify({requestId:randomUUID(),kind:d.kind,title:d.title,text:d.text,contact:d.contact,
    consent:true,receivedAt:new Date().toISOString()}),
   signal:AbortSignal.timeout(10000),cache:"no-store"
  });
  if(!res.ok)return reply("delivery_failed",502);
  return NextResponse.json({accepted:true},{headers:{"Cache-Control":"no-store"}});
 }catch{return reply("delivery_failed",502);}
}
