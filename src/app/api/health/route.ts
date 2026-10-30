import {NextResponse} from "next/server";
export const dynamic="force-dynamic";
export async function GET(){return NextResponse.json({service:"consumer-rights-portal",status:"ok",deployment:"unverified",version:"0.1.0"},{headers:{"Cache-Control":"no-store"}})}
