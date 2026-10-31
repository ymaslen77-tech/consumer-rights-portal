import Link from "next/link";
import { notFound } from "next/navigation";
import regions from "@/data/rospotrebnadzor-regions.json";
import { PageIntro, SourceLink, Trail } from "@/components/SiteShell";
type Props={params:Promise<{slug:string}>};
export function generateStaticParams(){return regions.map(r=>({slug:r.slug}))}
export async function generateMetadata({params}:Props){
 const {slug}=await params;const region=regions.find(r=>r.slug===slug);
 return {title:region?region.title+" — официальный адрес, телефон, подача жалобы":"Региональное управление",
 description:region?region.title+": контактный телефон, почтовый адрес, территориальная компетенция и официальный порядок обращения. Независимый справочник.":undefined};
}
export default async function RegionPage({params}:Props){
 const {slug}=await params;const r=regions.find(x=>x.slug===slug);if(!r)notFound();
 return <><PageIntro eyebrow="РОСПОТРЕБНАДЗОР · РЕГИОН" title={r.title} lead={r.summary}/>
 <section className="container section narrow"><Trail items={[{label:"Органы и контакты",href:"/organy"},{label:"Регионы",href:"/rospotrebnadzor/regiony"},{label:r.scope}]}/>
 <div className="notice"><strong>Проверено по ведомственным источникам 31.10.2026</strong><p>Это независимая справочная страница. Мы не являемся официальной электронной приёмной. Перед визитом, отправкой корреспонденции или звонком уточните контакты на сайте органа.</p></div>
 <h2>Официальные контакты</h2><div className="contactgrid">
  <div><span>Орган</span><strong>{r.subtitle}</strong></div>
  <div><span>Территория компетенции</span><strong>{r.scope}</strong></div>
  <div><span>Адрес</span><strong>{r.address}</strong></div>
  <div><span>{r.phonePurpose}</span><strong><a href={r.phoneHref}>{r.phone}</a></strong></div>
 </div><p>{r.note}</p>
 <div className="linkstack"><SourceLink href={r.official}>Официальный сайт управления</SourceLink><SourceLink href="https://petition.rospotrebnadzor.ru/petition/">Официальный федеральный портал приёма обращений</SourceLink></div>
 <h2>Как подать жалобу в этом регионе</h2><ol className="steps">{r.steps.map((step,i)=><li key={i}>{step}</li>)}</ol>
 <h2>Документы и связанные материалы</h2><div className="linkstack">
 <Link href="/rospotrebnadzor/zhaloba">Как правильно составить жалобу →</Link>
 <Link href="/rospotrebnadzor/obrashchenie">Электронная подача через ЕСИА →</Link>
 <Link href="/dokumenty/zhaloba-rospotrebnadzor">Подготовить черновик обращения →</Link>
 <Link href="/zashchita-prav-potrebiteley/zhaloba">Претензия продавцу, жалоба и суд →</Link>
 </div><h2>Основания проверки контактов</h2><div className="linkstack">{r.sources.map(url=><SourceLink key={url} href={url}>{url}</SourceLink>)}</div>
 </section></>
}