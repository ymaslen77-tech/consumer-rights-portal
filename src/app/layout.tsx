import type { Metadata } from "next";
import { SiteShell } from "@/components/SiteShell";
import { isReleased } from "@/lib/content";
import "./globals.css";
export const dynamic = "force-dynamic";
export async function generateMetadata():Promise<Metadata>{
 const released=isReleased();
 return {title:{default:"Защита прав потребителей — ситуации, документы, контакты",template:"%s | Права потребителя"},description:"Независимый справочник: потребительские споры, документы, Роспотребнадзор, контакты и официальные источники.",robots:{index:released,follow:released}};
}
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="ru"><body><a className="skip" href="#main">Перейти к содержимому</a><SiteShell>{children}</SiteShell></body></html>}
