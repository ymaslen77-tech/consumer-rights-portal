import {notFound} from "next/navigation";
import {getDocument,documents} from "@/lib/content";
import {PageIntro,SourceLink,Trail} from "@/components/SiteShell";
import {DocumentBuilder} from "@/components/DocumentBuilder";
type Params={params:Promise<{slug:string}>};
export function generateStaticParams(){return documents.map(x=>({slug:x.slug}))}
export async function generateMetadata({params}:Params){const {slug}=await params;return {title:getDocument(slug)?.title || 'Документ'}}
export default async function DocumentPage({params}:Params){const {slug}=await params;const x=getDocument(slug);if(!x)notFound();return <><PageIntro eyebrow="ЧЕРНОВИК ДОКУМЕНТА" title={x.title} lead={x.scope}/><section className="container section"><Trail items={[{label:'Документы',href:'/dokumenty'},{label:x.title}]}/><div className="notice"><strong>Не автоматическое юридическое заключение</strong><p>Внесите фактические сведения, затем проверьте применимость требований, актуальную редакцию норм, сроки и порядок подачи. Шаблон не хранит введённые персональные данные и не направляет документ адресату.</p><SourceLink href={x.sourceUrl}>Официальный источник по тематике</SourceLink></div><DocumentBuilder title={x.title} recipient={x.recipient} requestHint={x.requestHint}/></section></>}
