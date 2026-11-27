import Link from "next/link";
import {topics} from "@/lib/content";
import publicAppeals from "@/data/public-consumer-appeals.json";
import {PageIntro} from "@/components/SiteShell";
export default function Situations(){return <><PageIntro eyebrow="ПРАВОВЫЕ СИТУАЦИИ" title="Выберите направление" lead={topics.length+" тематических разделов. Для каждой ситуации — действия, доказательства, документы и ссылки на правовые источники."}/>
<section className="container section"><div className="topicgrid">{topics.map((x,i)=><Link key={x.slug} className="topiccard" href={'/situacii/'+x.slug}><span className="topicnum">{String(i+1).padStart(2,'0')}</span><strong>{x.title}</strong><p>{x.description}</p><span className="more">Открыть раздел →</span></Link>)}</div></section>
<section className="mutedband"><div className="container section">
<div className="sectiontitle"><div><span className="eyebrow">ПРАКТИЧЕСКИЕ ПРИМЕРЫ</span><h2>Разборы реальных обращений потребителей</h2></div></div>
<p className="subtle">Ситуации взяты из открытой виртуальной приёмной Роспотребнадзора без имён, телефонов, заказов и других личных данных. Описания отражают сообщения заявителей, а не установленные судом факты. Для каждого примера приведён возможный порядок действий и ссылка на публикацию.</p>
<div className="threegrid">{publicAppeals.map(x=><Link className="info-card" key={x.slug} href={'/razbor/'+x.situationSlug}>
<span className="eyebrow">ОБРАЩЕНИЕ · {x.publishedAt}</span><h3>{x.title}</h3>
<p>{x.facts}</p><span className="more">Доказательства и порядок действий →</span></Link>)}</div>
</div></section></>}
