"use client";
import {useState} from "react";
import Link from "next/link";
import {DocumentBuilder} from "@/components/DocumentBuilder";
import type {ClaimType} from "@/lib/document-compose.mjs";

type Law={title:string;url:string};
export type SituationDocumentOption={
 slug:string;title:string;recipient:string;requestHint:string;
 legalBasis:string;claimType:ClaimType;sourceUrl:string;lawLinks:Law[];
 legalRisk:string;reviewDate:string;topicSlug:string;situationSlug:string;
};
export function SituationDocumentWizard({situationTitle,checks,documents}:{
 situationTitle:string;checks:string[];documents:SituationDocumentOption[]
}){
 const [selected,setSelected]=useState(documents[0]?.slug || "");
 const current=documents.find(d=>d.slug===selected);
 // Keep the first three practical questions and the last two legal eligibility checks visible.
 const visibleChecks=checks.length<=5?checks:[...checks.slice(0,3),...checks.slice(-2)];
 if(!current)return <div className="notice">Для ситуации не найден подходящий документ. Обратитесь к каталогу документов.</div>;
 return <div className="situation-wizard" id="situation-document-generator">
 <div className="situation-wizard-header">
 <span className="eyebrow">ДОКУМЕНТЫ ПО ВАШЕЙ СИТУАЦИИ</span>
 <h2>Составить документ по этой ситуации</h2>
 <p>Выберите подходящий документ, укажите адресата по его назначению и заполните обстоятельства. Сохраните документ в DOCX, TXT или PDF через печать.</p>
 </div>
 <div className="situation-wizard-choice">
 <label htmlFor="situation-document-select">Какой документ подготовить?</label>
 <select id="situation-document-select" value={selected} onChange={e=>setSelected(e.target.value)}>
 {documents.map(d=><option key={d.slug} value={d.slug}>{d.title}</option>)}
 </select>
 <p className="subtle">Каждый документ формируется отдельно. После переключения типа документа несохранённый текст текущей формы не переносится.</p>
 </div>
 <div className="situation-wizard-context">
 <strong>Что проверить применительно к вашей ситуации</strong>
 <ul>{visibleChecks.map((check,i)=><li key={i}>{check}</li>)}</ul>
 <p>Подставляйте только свои подтверждённые факты. Не копируйте пример требования без проверки его применимости.</p>
 </div>
 <DocumentBuilder key={current.slug} slug={current.slug} title={current.title}
 recipient={current.recipient} requestHint={current.requestHint}
 legalBasis={current.legalBasis} claimType={current.claimType}
 topicSlug={current.topicSlug} situationSlug={current.situationSlug}
 legalLinks={current.lawLinks} contextTitle={situationTitle} inline={true}
 legalRisk={current.legalRisk} reviewDate={current.reviewDate}/>
 <p className="situation-wizard-footer">
 <Link href={"/dokumenty/"+current.slug}>Открыть отдельную страницу документа</Link>
 <span> · </span>
 <Link href="/rospotrebnadzor/obrashchenie">Как официально направить обращение в Роспотребнадзор</Link>
 </p>
 </div>;
}
