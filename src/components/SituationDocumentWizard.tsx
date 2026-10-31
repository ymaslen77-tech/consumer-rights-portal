"use client";
import {useState} from "react";
import Link from "next/link";
import {DocumentBuilder} from "@/components/DocumentBuilder";
import type {ClaimType} from "@/lib/document-compose.mjs";

type Law={title:string;url:string};
export type SituationDocumentOption={
 slug:string;title:string;recipient:string;requestHint:string;
 legalBasis:string;claimType:ClaimType;sourceUrl:string;lawLinks:Law[];
};
export function SituationDocumentWizard({situationTitle,checks,documents}:{
 situationTitle:string;checks:string[];documents:SituationDocumentOption[]
}){
 const [selected,setSelected]=useState(documents[0]?.slug || "");
 const current=documents.find(d=>d.slug===selected);
 if(!current)return <div className="notice">Для ситуации не найден подходящий документ. Обратитесь к каталогу документов.</div>;
 return <div className="situation-wizard" id="situation-document-generator">
 <div className="situation-wizard-header">
 <span className="eyebrow">ДОКУМЕНТЫ ПО ВАШЕЙ СИТУАЦИИ</span>
 <h2>Составить документ по этой ситуации</h2>
 <p>Выберите адресата и документ. Укажите факты, затем сохраните DOCX, TXT или PDF через печать. Сведения об обстоятельствах останутся только в вашем браузере.</p>
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
 <ul>{checks.slice(0,3).map((check,i)=><li key={i}>{check}</li>)}</ul>
 <p>Подставляйте только свои подтверждённые факты. Не копируйте пример требования без проверки его применимости.</p>
 </div>
 <DocumentBuilder key={current.slug} slug={current.slug} title={current.title}
 recipient={current.recipient} requestHint={current.requestHint}
 legalBasis={current.legalBasis} claimType={current.claimType}
 legalLinks={current.lawLinks} contextTitle={situationTitle} inline={true}/>
 <p className="situation-wizard-footer">
 <Link href={"/dokumenty/"+current.slug}>Открыть отдельную страницу документа</Link>
 <span> · </span>
 <Link href="/rospotrebnadzor/obrashchenie">Как официально направить обращение в Роспотребнадзор</Link>
 </p>
 </div>;
}
