import {NextResponse,type NextRequest} from "next/server";
import {isReleased} from "@/lib/content";
export function proxy(_request:NextRequest){const response=NextResponse.next();if(!isReleased())response.headers.set("X-Robots-Tag","noindex, nofollow, noarchive");return response;}
export const config={matcher:"/:path*"};
