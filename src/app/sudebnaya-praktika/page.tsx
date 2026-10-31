import Link from "next/link";
import { PageIntro, SourceLink, Trail } from "@/components/SiteShell";
import cases from "@/data/verified-court-cases.json";
export const metadata={title:"Судебная практика по защите прав потребителей — решения и правовые позиции",description:"Проверенные судебные акты по защите прав потребителей: постановления Конституционного Суда, правовые позиции, ссылки на полные официальные решения."};
export default function Courts(){return <>
 <PageIntro eyebrow="ПРОВЕРЕННАЯ СУДЕБНАЯ ПРАКТИКА" title="Решения и правовые позиции судов по защите прав потребителей" lead="Только документы с подтверждёнными реквизитами и полным текстом официального первоисточника; постановления, решения по искам и обзоры не смешиваются."/>
 <section className="container section narrow"><Trail items={[{label:"Судебная практика"}]}/>
 <div className="notice"><strong>Что считается проверенным решением</strong><p>Публикуем акт только после сверки номера, суда, даты, предмета, правовой позиции и официального полного текста. Для решения имущественного спора отдельно фиксируем исход и статус. Статистические сообщения ведомств без судебного акта не выдаём за проверенную судебную карточку.</p></div>
 <h2>Подтверждённые судебные акты ({cases.length})</h2><div className="stack">
 {cases.map(c=><Link className="listcard" key={c.slug} href={"/sudebnaya-praktika/"+c.slug}>
 <span className="listnum">§</span><span><strong>{c.court}: {c.type} № {c.number}</strong>
 <small>{c.title} · {c.date}</small></span><span className="arrow">→</span>
 </Link>)}
 </div>
 <h2>Источники для дальнейшего расширения базы</h2><div className="linkstack">
 <SourceLink href="https://www.ksrf.ru/">Конституционный Суд РФ</SourceLink>
 <SourceLink href="https://vsrf.ru/">Верховный Суд РФ</SourceLink>
 <SourceLink href="https://sudrf.ru/">ГАС «Правосудие»</SourceLink>
 <SourceLink href="https://zpp.rospotrebnadzor.ru/">ГИС ЗПП — реестр судебной практики</SourceLink>
 </div></section></>
}