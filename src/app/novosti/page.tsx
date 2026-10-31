import Link from "next/link";
import {PageIntro,SourceLink} from "@/components/SiteShell";
import news from "@/data/news.json";
export const metadata={title:"Новости защиты прав потребителей — правовые изменения и разъяснения 2026",description:"Проверенные юридические разъяснения Роспотребнадзора и Конституционного Суда: возврат интернет-покупок, сроки требований и новые правила."};
export default function News(){return <>
 <PageIntro eyebrow="НОВОСТИ И ОФИЦИАЛЬНЫЕ РАЗЪЯСНЕНИЯ" title="Новости защиты прав потребителей" lead="Собственные краткие обзоры правовых событий со ссылками на полный первоисточник, датой события и проверкой актуальности."/>
 <section className="container section narrow">
 <div className="notice"><strong>Редакционная проверка</strong><p>В материалах отдельно указаны дата правового события и дата сверки источника. Обзоры не заменяют текст закона или судебного акта. Приоритет — официальным разъяснениям и точным реквизитам документов.</p></div>
 <div className="stack">{news.map(x=><article key={x.slug} className="info-card news-card">
 <span className="eyebrow">ПРАВО И РАЗЪЯСНЕНИЯ · {x.date}</span>
 <h2>{x.title}</h2>
 <p>{x.summary}</p>
 <p className="subtle">Источник проверен: {x.checkedAt}</p>
 <SourceLink href={x.sourceUrl}>Открыть первоисточник</SourceLink>
 <Link className="textlink" href={x.relatedUrl}>{x.relatedTitle} →</Link>
 </article>)}</div>
 <h2>Другие официальные источники</h2><div className="linkstack">
 <SourceLink href="https://www.rospotrebnadzor.ru/">Федеральный Роспотребнадзор</SourceLink>
 <SourceLink href="https://zpp.rospotrebnadzor.ru/">ГИС ЗПП</SourceLink>
 <SourceLink href="https://prav.mos.ru/">Московский портал потребителя</SourceLink>
 </div>
 </section></>}
