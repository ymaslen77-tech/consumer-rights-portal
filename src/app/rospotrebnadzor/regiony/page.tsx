import Link from "next/link";
import { PageIntro, SourceLink, Trail } from "@/components/SiteShell";
import regions from "@/data/rospotrebnadzor-regions.json";
export const metadata={
 title:"Роспотребнадзор по регионам — адреса, телефоны и подача жалобы",
 description:"Роспотребнадзор в Москве, Подмосковье, Петербурге, Татарстане, Краснодарском крае, Свердловской, Новосибирской и Нижегородской областях: официальные контакты, обращения и компетенция."
};
export default function Regions(){
 return <><PageIntro eyebrow="ТЕРРИТОРИАЛЬНЫЕ ОРГАНЫ" title="Роспотребнадзор по регионам России" lead="Проверенные карточки управлений: контакты, территориальная компетенция и порядок подачи обращений. Для остальных субъектов воспользуйтесь федеральным реестром."/>
 <section className="container section"><Trail items={[{label:"Органы и контакты",href:"/organy"},{label:"Региональные управления"}]}/>
 <div className="notice"><strong>Официальная подача — на сайте ведомства</strong><p>Наш сайт не регистрирует обращения и не принимает документы от имени Роспотребнадзора. Адреса и телефоны периодически меняются — перед почтовой или личной подачей обязательно сверяйте реквизиты с первоисточником.</p></div>
 <div className="threegrid">{regions.map(r=><Link className="info-card" key={r.slug} href={"/rospotrebnadzor/regiony/"+r.slug}>
  <span className="eyebrow">{r.scope}</span><h3>{r.title}</h3><p>{r.summary}</p><span className="more">Контакты, адрес и порядок обращения →</span>
 </Link>)}</div>
 <h2>Обращения в другие субъекты Российской Федерации</h2><p>Не публикуем массовые региональные страницы без подтверждения конкретного управления. Выберите свой субъект в государственном справочнике.</p>
 <div className="linkstack"><SourceLink href="https://zpp.rospotrebnadzor.ru/organizations/gos">Федеральный реестр территориальных управлений ГИС ЗПП</SourceLink><Link href="/rospotrebnadzor/obrashchenie">Как написать официальное электронное обращение →</Link><Link href="/rospotrebnadzor/zhaloba">Как составить жалобу →</Link></div>
 </section></>
}