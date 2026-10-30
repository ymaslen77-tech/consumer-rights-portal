import Link from "next/link";
import {notFound} from "next/navigation";
import {getTopic,situations,topics} from "@/lib/content";
import {PageIntro,Trail} from "@/components/SiteShell";
type Params={params:Promise<{topic:string}>};
export function generateStaticParams(){return topics.map(x=>({topic:x.slug}))}
export async function generateMetadata({params}:Params){const {topic}=await params;return {title:getTopic(topic)?.title || 'Ситуация'}}
export default async function TopicPage({params}:Params){const {topic}=await params;const item=getTopic(topic);if(!item)notFound();const rows=situations.filter(x=>x.topic===topic);return <><PageIntro eyebrow="ПРАВОВОЕ НАПРАВЛЕНИЕ" title={item.title} lead={item.description}/><div className="container section narrow"><Trail items={[{label:'Ситуации',href:'/situacii'},{label:item.title}]}/><h2>Разберите свою ситуацию</h2><div className="stack">{rows.map((s,i)=><Link className="listcard" key={s.slug} href={'/razbor/'+s.slug}><span className="listnum">0{i+1}</span><span><strong>{s.title}</strong><small>{s.summary}</small></span><span className="arrow">→</span></Link>)}</div><div className="callout"><strong>Не нашли точную ситуацию?</strong><p>Используйте общий каталог документов или консультационные службы. Не применяйте автоматически правила одной категории к другой.</p><Link href="/organy">Контакты и помощь →</Link></div></div></>}
