import Link from "next/link";
import type { Metadata } from "next";
import guides from "@/data/seo-guides.json";
import { isReleased, siteUrl } from "@/lib/content";
import { PageIntro, SourceLink, Trail } from "@/components/SiteShell";

type SeoGuide = (typeof guides)[number];
export function getSeoGuide(id: string): SeoGuide {
  const guide = guides.find(item => item.id === id);
  if (!guide) throw new Error("Unknown SEO guide: " + id);
  return guide;
}
export function seoGuideMetadata(guide: SeoGuide): Metadata {
  return {
    title: guide.seoTitle,
    description: guide.description,
    alternates: isReleased() ? { canonical: siteUrl(guide.path) } : undefined,
  };
}
export function SeoGuidePage({ guide }: { guide: SeoGuide }) {
  const isRpn = guide.id.startsWith("rpn-");
  return <>
    <PageIntro eyebrow={guide.eyebrow} title={guide.title} lead={guide.lead}/>
    <section className="container section narrow">
      <Trail items={[{label: "Защита прав потребителей",href:"/"},{label:guide.title}]}/>
      <div className="notice"><strong>Независимый справочник · проверка 31.10.2026</strong><p>{guide.notice}</p></div>
      {isRpn && <div className="callout">
        <strong>Официальная электронная приёмная</strong>
        <p>Для подачи электронного обращения используйте исключительно официальный ресурс с авторизацией ЕСИА.</p>
        <SourceLink href="https://petition.rospotrebnadzor.ru/petition/">Перейти на официальный портал Роспотребнадзора</SourceLink>
      </div>}
      <h2>Пошаговый порядок действий</h2>
      <ol className="steps">{guide.steps.map((step,index)=><li key={index}>{step}</li>)}</ol>
      {guide.sections.map(section=><section key={section.title} className="guide-section">
        <h2>{section.title}</h2>
        {section.paragraphs.map((paragraph,index)=><p key={index}>{paragraph}</p>)}
      </section>)}
      <h2>Частые вопросы</h2>
      <div className="guide-faq">{guide.faq.map(item=><section className="info-card" key={item.q}>
        <h3>{item.q}</h3><p>{item.a}</p>
      </section>)}</div>
      <h2>Документы, маршруты и связанные страницы</h2>
      <div className="linkstack">{guide.links.map(item=><Link key={item.href} href={item.href}>{item.title}<span aria-hidden="true">→</span></Link>)}</div>
      <h2>Правовые основания и официальные источники</h2>
      <p className="subtle">Ведомственные публикации помогают разобраться в процедуре; перед направлением юридически значимого требования проверьте действующую редакцию норм и особенности своей ситуации.</p>
      <div className="linkstack">{guide.sources.map(source=><SourceLink key={source.url} href={source.url}>{source.label}</SourceLink>)}</div>
    </section>
  </>;
}
