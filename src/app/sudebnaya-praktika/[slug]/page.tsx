import Link from "next/link";
import {notFound} from "next/navigation";
import cases from "@/data/verified-court-cases.json";
import {getSituation,documents} from "@/lib/content";
import {getContextualTitle} from "@/lib/consumer-case-guidance.mjs";
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
 <div className="notice"><strong>Статус: официальный первоисточник · проверено {c.reviewedAt}</strong><p>{c.comment}</p></div>
 <h2>Предмет рассмотрения</h2><p>{c.issue}</p>
 <h2>Основная правовая позиция</h2><p>{c.finding}</p>
 {"evidence" in c && Array.isArray(c.evidence) && <><h2>Что исследовал суд</h2><ul className="guide-checklist">{c.evidence.map((e,i)=><li key={i}>{e}</li>)}</ul></>}
 <h2>Результат рассмотрения</h2><p>{c.result}</p>
 {"amounts" in c && <p><strong>Присуждённые суммы:</strong> {c.amounts}</p>}
 {"status" in c && <><h2>Вступление в силу и обжалование</h2><p>{c.status}</p><p>{c.appeal}</p></>}
 <h2>Нормативные положения</h2><ul className="guide-checklist">{c.legal.map((x,i)=><li key={i}>{x}</li>)}</ul>
 <h2>Как применять к потребительскому спору</h2><p>Выводы необходимо сопоставить с видом договора, датой событий и обстоятельствами. Судебный акт не означает автоматического разрешения аналогичного иска в пользу заявителя.</p>
 {"plan" in c && Array.isArray(c.plan) && <ol className="steps">{c.plan.map((step,i)=><li key={i}>{step}</li>)}</ol>}
 <h2>Документы для аналогичной ситуации</h2>
 {c.situationSlugs.map(slug=>{const s=getSituation(slug);if(!s)return null;return <div className="notice" key={slug}><Link href={"/razbor/"+slug}>{s.title} — открыть профильный генератор →</Link><ul className="guide-checklist">{s.documents.map(id=>{const d=documents.find(x=>x.slug===id);return d?<li key={id}>{getContextualTitle(slug,id,d.title)}</li>:null})}</ul></div>})}
 <p>Профильный генератор расположен на странице ситуации. Документы — редактируемые черновики, а не копии судебных исков.</p>
 <h2>Первоисточник и дополнительные материалы</h2><div className="linkstack">{c.sources.map(s=><SourceLink key={s.url} href={s.url}>{s.label}</SourceLink>)}</div>
 </section></>
}