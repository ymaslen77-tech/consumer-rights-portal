import Link from "next/link";
import type { ReactNode } from "react";
const links = [
 ["Ситуации","/situacii"],["Органы и контакты","/organy"],
 ["Документы","/dokumenty"],["Роспотребнадзор","/rospotrebnadzor/zhaloba"],["Источники","/istochniki"],
 ["Судебная практика","/sudebnaya-praktika"],["Новости","/novosti"],
] as const;
export function SiteShell({children}: {children:ReactNode}) {
 return <><div className="topline"><div className="container topbar"><span>Независимый информационно-правовой справочник</span><a href="tel:88005554943">Роспотребнадзор: 8 800 555-49-43</a></div></div>
 <header className="siteheader"><div className="container navrow"><Link href="/" className="brand"><span className="brandmark">§</span><span><strong>Права потребителя</strong><small>Правовые решения и документы</small></span></Link><nav aria-label="Основная навигация">{links.map(([label,href])=><Link key={href} href={href}>{label}</Link>)}</nav></div></header>
 <main id="main">{children}</main>
 <footer className="footer"><div className="container footgrid"><div><strong>Права потребителя</strong><p>Информационный сервис. Не является государственным органом, общественной организацией или сервисом Роспотребнадзора.</p></div><div><strong>Разделы</strong><Link href="/organy">Органы и общественные объединения</Link><Link href="/dokumenty">Претензии и документы</Link><Link href="/istochniki">Официальные первоисточники</Link><Link href="/normativnye-akty">Нормативные акты</Link><Link href="/rospotrebnadzor/zhaloba">Жалоба в Роспотребнадзор</Link><Link href="/rospotrebnadzor/obrashchenie">Написать обращение</Link><Link href="/zashchita-prav-potrebiteley/zhaloba">Жалоба потребителя</Link></div><div><strong>Проверка сведений</strong><p>Первичные источники и даты проверки указаны в карточках. Действующие редакции законодательства проверяются отдельно для каждой ситуации.</p><Link href="/o-proekte">О проекте</Link></div></div><div className="container copyright">© 2026 Независимый справочник · тестовая версия без публичного релиза</div></footer></>;
}
export function PageIntro({eyebrow,title,lead}:{eyebrow:string,title:string,lead:string}){return <section className="intro"><div className="container"><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{lead}</p></div></section>}
export function SourceLink({href,children}:{href:string,children:ReactNode}) {return <a className="external" href={href} target="_blank" rel="noopener noreferrer">{children} <span aria-hidden="true">↗</span></a>}
export function Trail({items}:{items:Array<{label:string,href?:string}>}){return <nav className="breadcrumbs" aria-label="Навигационная цепочка"><Link href="/">Главная</Link>{items.map((item,i)=><span key={i}><span className="sep">/</span>{item.href?<Link href={item.href}>{item.label}</Link>:item.label}</span>)}</nav>}
