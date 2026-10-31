import Link from "next/link";
import {notFound} from "next/navigation";
import cases from "@/data/verified-court-cases.json";
import {PageIntro,SourceLink,Trail} from "@/components/SiteShell";
type Params={params:Promise<{slug:string}>};
export function generateStaticParams(){return cases.map(c=>({slug:c.slug}))}
export async function generateMetadata({params}:Params){
 const {slug}=await params;const c=cases.find(c=>c.slug===slug);
 return {title:c?c.court+" — "+c.type+" № "+c.number+" от "+c.date:"Судебный акт",description:c?.title};
}
export default async function CourtDecisionPage({params}:Params){
 const {slug}=await params;const c=cases.find(x=>x.slug===slug);if(!c)notFound();
 return <><PageIntro eyebrow="СУДЕБНЫЙ АКТ · ПОЛНЫЙ ПЕРВОИСТОЧНИК" title={c.title} lead={c.court+" · "+c.type+" от "+c.date+" № "+c.number}/>
 <section className="container section narrow"><Trail items={[{label:"Судебная практика",href:"/sudebnaya-praktika"},{label:c.type+" № "+c.number}]}/>
 <div className="notice"><strong>Статус: официальный полный текст изучен · 31.10.2026</strong><p>{c.comment}</p></div>
 <h2>Предмет рассмотрения</h2><p>{c.issue}</p>
 <h2>Основная правовая позиция</h2><p>{c.finding}</p>
 <h2>Результат рассмотрения</h2><p>{c.result}</p>
 <h2>Нормативные положения</h2><ul className="guide-checklist">{c.legal.map((x,i)=><li key={i}>{x}</li>)}</ul>
 <h2>Как применять к потребительскому спору</h2><p>Выводы необходимо сопоставить с видом товара, способом покупки, датой событий и обстоятельствами. Постановление не означает автоматического разрешения любого иска в пользу заявителя.</p>
 <div className="linkstack">{c.situationSlugs.map(slug=><Link key={slug} href={"/razbor/"+slug}>Правовой маршрут по связанному спору →</Link>)}</div>
 <h2>Официальные документы</h2><div className="linkstack">{c.sources.map(s=><SourceLink key={s.url} href={s.url}>{s.label}</SourceLink>)}</div>
 </section></>
}