import {NextRequest,NextResponse} from "next/server";
export const dynamic="force-dynamic";
const active=new Map<string,number>();
const TTL=120000;
function response(online:number){return NextResponse.json({online},{headers:{"Cache-Control":"no-store"}});}
export async function POST(request:NextRequest){
 const contentLength=Number(request.headers.get("content-length")||"0");
 if(contentLength>500)return NextResponse.json({error:"invalid"},{status:400});
 let id:unknown;
 try{id=(await request.json()).id;}catch{return NextResponse.json({error:"invalid"},{status:400});}
 if(typeof id!=="string"||!/^[a-f0-9-]{36}$/i.test(id)){
  return NextResponse.json({error:"invalid"},{status:400});
 }
 const now=Date.now();
 for(const [key,last] of active)if(now-last>TTL)active.delete(key);
 if(active.size>20000)active.clear();
 active.set(id,now);
 return response(active.size);
}
