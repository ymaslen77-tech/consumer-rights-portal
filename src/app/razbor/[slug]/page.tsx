import Link from "next/link";
import {notFound} from "next/navigation";
import {situations,getSituation,getTopic,documents} from "@/lib/content";
import {PageIntro,SourceLink,Trail} from "@/components/SiteShell";
import {SituationDocumentWizard,type SituationDocumentOption} from "@/components/SituationDocumentWizard";
import {getLegalAudit} from "@/lib/consumer-law-audit.mjs";
import {getDocumentLegalGrounds,type ClaimType} from "@/lib/document-compose.mjs";
type Params={params:Promise<{slug:string}>};
export function generateStaticParams(){return situations.map(x=>({slug:x.slug}))}
export async function generateMetadata({params}:Params){const {slug}=await params;const s=getSituation(slug);return {title:s?.title||"Разбор ситуации",description:s?.summary}}
export default async function CasePage({params}:Params){
 const {slug}=await params;const s=getSituation(slug);if(!s)notFound();
 const topic=getTopic(s.topic);const checked=s.legalStatus.startsWith("source_checked_");const expanded=s.legalStatus.startsWith("sector_sources_checked");
 return <><PageIntro eyebrow="РАЗБОР СИТУАЦИИ" title={s.title} lead={s.summary}/>
 <section className="container section narrow">
 <Trail items={[{label:"Ситуации",href:"/situacii"},{label:topic?.title||"Тема",href:"/situacii/"+s.topic},{label:s.title}]}/>
 <div className="notice"><strong>{checked?"Источники ранее сверялись: "+s.sourceReviewedAt:expanded?"Отраслевой маршрут расширен; требуется проверка конкретных оснований":"Материал требует индивидуальной правовой доработки"}</strong>
 <p>{checked?"Указаны ранее подобранные нормативные тексты и разъяснения. Это не независимое правовое заключение: применимость норм, сроки, исключения и доказательства необходимо проверить на дату вашего события.":expanded?"Для этой ситуации приведены индивидуальные действия, доказательства, правовые ориентиры и ведомственные источники по отрасли. Конкретная норма, срок, исключения и допустимое требование проверяются на дату события; это ещё не окончательная юридическая квалификация.":"Это универсальный первичный алгоритм. Право на конкретное требование, сроки и исключения должны проверяться индивидуально до использования документа."}</p></div>
 {s.checks.length>0&&<><h2>Что выяснить перед выбором требования</h2><ul className="guide-checklist">{s.checks.map((x,i)=><li key={i}>{x}</li>)}</ul></>}
 <h2>Порядок действий</h2><ol className="steps">{s.steps.map((x,i)=><li key={i}>{x}</li>)}</ol>
 {s.cautions.length>0&&<><h2>Исключения и риски</h2><div className="notice">{s.cautions.map((x,i)=><p key={i}>{x}</p>)}</div></>}
 {s.legalBasis.length>0&&<><h2>Нормативные основания</h2><ul className="guide-checklist">{s.legalBasis.map((x,i)=><li key={i}>{x}</li>)}</ul><p><Link className="textlink" href="/normativnye-akty">Смотреть нормативные акты и изменения →</Link></p></>}
 <h2>Документы для защиты права</h2>
 <p className="subtle">Выберите подходящий документ и сохраните редактируемый черновик. Перед направлением проверьте факты, адресата и применимую норму.</p>
 <SituationDocumentWizard situationTitle={s.title} checks={s.checks} documents={s.documents.map(key=>{
   const d=documents.find(x=>x.slug===key);
   if(!d)throw new Error("Missing document for situation "+s.slug+": "+key);
   const audit=getLegalAudit(s.topic,d.slug,d.claimType,s.slug);
   const choice:SituationDocumentOption={
     slug:d.slug,title:d.title,recipient:d.recipient,claimType:d.claimType as ClaimType,
     topicSlug:s.topic,situationSlug:s.slug,
     sourceUrl:d.sourceUrl,requestHint:s.title+". "+d.requestHint,
     legalBasis:getDocumentLegalGrounds(d.legalBasis,s.slug,d.slug),
     lawLinks:audit.links.map(x=>({title:x.name,url:x.url})),
     legalRisk:[audit.risk,...s.cautions.slice(0,1)].filter(Boolean).join(' '),reviewDate:audit.reviewDate
   };
   return choice;
 })}/>
 <h2>Другие способы открыть документы</h2>
 <div className="linkstack">{s.documents.map(key=>{const d=documents.find(x=>x.slug===key);return d?<Link href={"/dokumenty/"+d.slug} key={key}>▤ {d.title}<span>→</span></Link>:null})}</div>
 <h2>Нормативные тексты и разъяснения</h2><div className="linkstack">{s.sources.map(url=><SourceLink key={url} href={url}>{url}</SourceLink>)}</div>
 <h2>Смежные вопросы</h2><div className="linkstack">
 {s.relatedTopics.map(key=>{const rel=getTopic(key);return rel?<Link href={"/situacii/"+rel.slug} key={key}>{rel.title}<span>→</span></Link>:null})}
 {s.relatedSituations.map(slug=>{const related=getSituation(slug);return related?<Link href={"/razbor/"+related.slug} key={slug}>{related.title}<span>→</span></Link>:null})}
 {s.relatedPages.map(x=><Link href={x.href} key={x.href}>{x.title}<span>→</span></Link>)}
 </div></section></>
}