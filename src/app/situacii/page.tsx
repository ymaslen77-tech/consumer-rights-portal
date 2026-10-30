import Link from "next/link";
import {topics} from "@/lib/content";
import {PageIntro} from "@/components/SiteShell";
export default function Situations(){return <><PageIntro eyebrow="ПРАВОВЫЕ СИТУАЦИИ" title="Выберите направление" lead="20 тематических групп. В каждой — типичные проблемы, первичные шаги, документы и проверяемые официальные источники."/><section className="container section"><div className="topicgrid">{topics.map((x,i)=><Link key={x.slug} className="topiccard" href={'/situacii/'+x.slug}><span className="topicnum">{String(i+1).padStart(2,'0')}</span><strong>{x.title}</strong><p>{x.description}</p><span className="more">Открыть раздел →</span></Link>)}</div></section></>}
