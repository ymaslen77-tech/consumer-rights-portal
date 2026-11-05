import {NextResponse} from "next/server";
export const dynamic="force-dynamic";
export function GET(){
 let enabled=false;
 try{
  const url=new URL(process.env.LAWYER_REVIEW_WEBHOOK_URL||"");
  enabled=process.env.LAWYER_REVIEW_ENABLED==="true"&&
   Boolean(process.env.LAWYER_REVIEW_WEBHOOK_TOKEN)&&url.protocol==="https:"&&
   !url.username&&!url.password;
 }catch{}
 // A configured intake channel does not prove that a lawyer is currently online.
 return NextResponse.json({enabled,lawyerOnline:null},{headers:{"Cache-Control":"no-store"}});
}
