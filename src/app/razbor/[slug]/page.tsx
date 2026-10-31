import Link from "next/link";
import {notFound} from "next/navigation";
import {situations,getSituation,getTopic,documents} from "@/lib/content";
import {PageIntro,SourceLink,Trail} from "@/components/SiteShell";
type Params={params:Promise<{slug:string}>};
export function generateStaticParams(){return situations.map(x=>({slug:x.slug}))}
export async function generateMetadata({params}:Params){const {slug}=await params;const s=getSituation(slug);return {title:s?.title||"Разбор ситуации",description:s?.summary}}
export default async function CasePage({params}:Params){
 const {slug}=await params;const s=getSituation(slug);if(!s)notFound();
 const topic=getTopic(s.topic);const checked=s.legalStatus==="source_checked_2026-10-31";const expanded=s.legalStatus.startsWith("sector_sources_checked");
 return <><PageIntro eyebrow="РАЗБОР СИТУАЦИИ" title={s.title} lead={s.summary}/>
 <section className="container section narrow">
 <Trail items={[{label:"Ситуации",href:"/situacii"},{label:topic?.title||"Тема",href:"/situacii/"+s.topic},{label:s.title}]}/>
 <div className="notice"><strong>{checked?"Алгоритм сверён с источниками 31.10.2026":expanded?"Отраслевой маршрут расширен; требуется проверка конкретных оснований":"Материал требует индивидуальной правовой доработки"}</strong>
 <p>{checked?"Практические шаги и нормы сверены с указанными источниками. Выбор требования, применимость исключений и сроков зависят от обстоятельств конкретного спора и действующей редакции права на дату события.":expanded?"Для этой ситуации приведены индивидуальные действия, доказательства, правовые ориентиры и ведомственные источники по отрасли. Конкретная норма, срок, исключения и допустимое требование проверяются на дату события; это ещё не окончательная юридическая квалификация.":"Это универсальный первичный алгоритм. Право на конкретное требование, сроки и исключения должны проверяться индивидуально до использования документа."}</p></div>
 {s.checks.length>0&&<><h2>Что выяснить перед выбором требования</h2><ul className="guide-checklist">{s.checks.map((x,i)=><li key={i}>{x}</li>)}</ul></>}
 <h2>Порядок действий</h2><ol className="steps">{s.steps.map((x,i)=><li key={i}>{x}</li>)}</ol>
 {s.cautions.length>0&&<><h2>Исключения и риски</h2><div className="notice">{s.cautions.map((x,i)=><p key={i}>{x}</p>)}</div></>}
 {s.legalBasis.length>0&&<><h2>Нормативные основания</h2><ul className="guide-checklist">{s.legalBasis.map((x,i)=><li key={i}>{x}</li>)}</ul><p><Link className="textlink" href="/normativnye-akty">Смотреть нормативные акты и изменения →</Link></p></>}
 <h2>Документы, которые могут понадобиться</h2>
 <div className="linkstack">{s.documents.map(key=>{const d=documents.find(x=>x.slug===key);return d?<Link href={"/dokumenty/"+d.slug} key={key}>▤ {d.title}<span>→</span></Link>:null})}</div>
 <h2>Первоисточники</h2><div className="linkstack">{s.sources.map(url=><SourceLink key={url} href={url}>{url}</SourceLink>)}</div>
 <h2>Смежные вопросы</h2><div className="linkstack">
 {s.relatedTopics.map(key=>{const rel=getTopic(key);return rel?<Link href={"/situacii/"+rel.slug} key={key}>{rel.title}<span>→</span></Link>:null})}
 {s.relatedPages.map(x=><Link href={x.href} key={x.href}>{x.title}<span>→</span></Link>)}
 </div></section></>
}