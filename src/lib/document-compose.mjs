import {getContextualDraft} from "./consumer-case-guidance.mjs";
// Shared pure text model for the client-only legal document drafts.
// Deliberately does not determine entitlement, limitation periods, penalties or jurisdiction.
export const REQUIRED_FIELDS = ["recipient","sender","address","description","request"];

export function parseRubles(value) {
  const text = String(value || "").trim().replace(/\s/g,"").replace(",",".");
  if (!text) return null;
  if (!/^\d{1,11}(\.\d{1,2})?$/.test(text)) return NaN;
  const amount = Number(text);
  return Number.isSafeInteger(Math.round(amount * 100)) && amount > 0 ? amount : NaN;
}
export function validateDraft(fields, claimType) {
  const issues=[];
  for(const field of REQUIRED_FIELDS) if(!String(fields[field] || "").trim()) issues.push(field);
  // A pre-trial demand is sent to the obligated business/person, never to the court.
  if (claimType === "pretrial_claim" && /(^|[^а-яё])(суд(а|у|ом|е)?|судье|судьи|судью)(?=$|[^а-яё])/iu.test(String(fields.recipient || ""))) {
    if (!issues.includes("recipient")) issues.push("recipient");
  }
  if (claimType === "court_document") {
    if(!String(fields.counterpartyName || "").trim()) issues.push("counterpartyName");
    if(!String(fields.counterpartyAddress || "").trim()) issues.push("counterpartyAddress");
    if(!String(fields.courtBirth || "").trim()) issues.push("courtBirth");
    if(!String(fields.courtIdentifier || "").trim()) issues.push("courtIdentifier");
    if(!String(fields.courtNotices || "").trim()) issues.push("courtNotices");
    if(!String(fields.evidence || "").trim()) issues.push("evidence");
  }
  if(String(fields.claimAmount || "").trim() && !Number.isFinite(parseRubles(fields.claimAmount))) issues.push("claimAmount");
  return issues;
}
function orBlank(v, text) {
  return String(v||"").trim() || "[" + text + "]";
}
// The addressee must reflect the type of document and its actual obligated party.
export function getRecipientPrompt(meta) {
 const name=String(meta.recipient||"").trim();
 const slug=String(meta.slug||"");
 const topic=String(meta.topicSlug||"");
 if(meta.claimType==="court_document")
  return {label:"Суд, в который подаётся иск *",hint:"Полное наименование суда по установленной подсудности"};
 if(slug==="finansovyy-upolnomochennyy-obrashchenie")
  return {label:"Финансовый уполномоченный (адресат обращения) *",hint:"Укажите финансового уполномоченного по предмету спора"};
 if(meta.claimType==="state_notification")
  return {label:"Кому направляется жалоба: "+(name||"компетентному органу")+" *",
    hint:"Укажите полное наименование соответствующего территориального органа"};
 if(slug==="zayavlenie-proverka-kachestva-zhkh"||slug==="zayavlenie-pereraschet-zhkh"){
  return {
   label:topic==="zhkh"&&meta.situationSlug==="zhkh-11"?
     "Исполнитель услуги по обращению с ТКО (укажите полное наименование) *":
     "Исполнитель коммунальной услуги (укажите полное наименование) *",
   hint:meta.situationSlug==="zhkh-11"?
     "УК/ТСЖ или региональный оператор ТКО — установите исполнителя по договору":
     "УК, ТСЖ, РСО или иной исполнитель — проверьте договор"
  };
 }
 return {label:"Кому направляется: "+(name||"обязанному лицу")+" (полное наименование) *",
   hint:name||"Укажите юридическое наименование организации или Ф. И. О. ИП"};
}

// Select only source-supported, document-specific clauses for formal legal grounds.
// The wider index of legal reference titles stays in the UI, never replaces this text.
const SPECIFIC_LEGAL_GROUNDS={
 "zhkh-11|zayavlenie-proverka-kachestva-zhkh":
  "Жилищный кодекс РФ, статья 157 (части 4, 5), статья 157.2 (при прямом договоре); Правила предоставления коммунальных услуг, утверждённые постановлением Правительства РФ от 06.05.2011 № 354: пункты 106, 109, 148(49), раздел X и приложение № 1 (раздел VII — ТКО).",
 "zhkh-11|zayavlenie-pereraschet-zhkh":
  "Жилищный кодекс РФ, статья 157 (части 4, 5), статья 157.2 (при прямом договоре); Правила № 354: пункты 148(45)–148(49), разделы IX и X, приложение № 1 (раздел VII — ТКО).",
 "zhkh-4|zayavlenie-proverka-kachestva-zhkh":
  "Жилищный кодекс РФ, статья 157 (части 4, 5); Правила № 354: пункты 106, 109, раздел X и приложение № 1 (раздел VI — отопление).",
 "zhkh-10|zayavlenie-proverka-kachestva-zhkh":
  "Жилищный кодекс РФ, статья 157 (части 4, 5); Правила № 354: пункты 106, 109, раздел X и приложение № 1 (раздел I — холодное водоснабжение).",
 "zhkh-12|zayavlenie-proverka-kachestva-zhkh":
  "Жилищный кодекс РФ, статья 157 (части 4 и 5); Правила № 354, пункты 106 и 109, раздел X и приложение № 1 (раздел IV — электроснабжение): проверка перерывов с учётом типа питания.",
 "zhkh-14|zayavlenie-proverka-kachestva-zhkh":
  "Жилищный кодекс РФ, статья 157 (части 4 и 5); Правила № 354, пункты 106 и 109, раздел X и приложение № 1 (раздел III — водоотведение): проверка перерывов услуги. Ответственность за содержание общего имущества оценивается отдельно."
};
export function getDocumentLegalGrounds(legalBasis, situationSlug="", documentSlug="") {
 const base=String(legalBasis||"").trim();
 const contextual=getContextualDraft(situationSlug,documentSlug)?.legalGrounds;
 const specialized=SPECIFIC_LEGAL_GROUNDS[String(situationSlug)+"|"+String(documentSlug)];
 return contextual||specialized||base;
}

export function draftText(fields, meta) {
  const f = fields;
  const isCourt = meta.claimType==="court_document";
  const isState = meta.claimType==="state_notification";
  const recipient = orBlank(f.recipient,"полное наименование адресата");
  const issuer = orBlank(f.sender,"Ф. И. О. заявителя");
  const counterparty = isCourt ?
    "\nОтветчик: " + orBlank(f.counterpartyName,"полное наименование ответчика") +
    "\nАдрес ответчика: " + orBlank(f.counterpartyAddress,"адрес ответчика") +
    "\nДата и место рождения истца: " + orBlank(f.courtBirth,"дата и место рождения истца") +
    "\nИдентификатор истца: " + orBlank(f.courtIdentifier,"СНИЛС / ИНН / документ") +
    "\nДоказательство направления копий иска и приложений участникам: " +
    orBlank(f.courtNotices,"подтверждение направления копий") : "";
  const money = parseRubles(f.claimAmount);
  const amountLine = money === null ? "" : Number.isFinite(money) ?
    "\nУказанная стоимость / сумма денежного требования: " + money.toLocaleString("ru-RU",{minimumFractionDigits:2,maximumFractionDigits:2}) + " руб." :
    "\nСумма требует исправления: [введите положительное число с двумя десятичными знаками]";
  const isFinancialOmbudsman = meta.slug === "finansovyy-upolnomochennyy-obrashchenie";
  const requestHeading = isFinancialOmbudsman ? "ПРОШУ ФИНАНСОВОГО УПОЛНОМОЧЕННОГО:" : isState ? "ПРОШУ ОРГАН РАССМОТРЕТЬ ОБРАЩЕНИЕ В ПРЕДЕЛАХ КОМПЕТЕНЦИИ:" :
    isCourt ? "ПРОШУ СУД:" : "ТРЕБОВАНИЕ К АДРЕСАТУ:";
  const legal = orBlank(meta.legalBasis,"проверить закон");
  const context = meta.contextTitle ?
    "\nПо вопросу: " + String(meta.contextTitle) : "";
  const optionalContact=String(f.contact||"").trim()?"\nКонтакты: "+String(f.contact).trim():"";
  const optionalAgreement=String(f.agreement||"").trim()?"\nДоговор / заказ / предмет отношений: "+String(f.agreement).trim():"";
  const optionalEventDate=String(f.eventDate||"").trim()?"\nДата события: "+String(f.eventDate).trim():"";
  const appendices=String(f.evidence||"").trim()?"\n\nПРИЛОЖЕНИЯ (копии):\n"+String(f.evidence).trim():"";
  return "Кому: " + recipient + "\n" +
    "От: " + issuer + "\nАдрес для ответа: " + orBlank(f.address,"почтовый адрес") +
    optionalContact + counterparty +
    "\n\n" + meta.title.toUpperCase() + context + optionalAgreement +
    optionalEventDate +
    "\n\nФАКТИЧЕСКИЕ ОБСТОЯТЕЛЬСТВА:\n" + orBlank(f.description,"опишите обстоятельства по датам без необоснованных обвинений") +
    amountLine + "\n\n" + requestHeading + "\n" +
    orBlank(f.request,"укажите одно законное требование и обстоятельства, подтверждающие его применимость") +
    "\n\nПРАВОВЫЕ ОСНОВАНИЯ:\n" + legal + appendices +
    (isCourt ?
      (String(f.courtPretrial||"").trim()?"\n\nСведения о досудебном порядке:\n"+String(f.courtPretrial).trim():"") +
      (String(f.courtCalculation||"").trim()?"\n\nРасчёт взыскиваемых сумм:\n"+String(f.courtCalculation).trim():"") +
      (String(f.courtFee||"").trim()?"\n\nГосударственная пошлина / льгота:\n"+String(f.courtFee).trim():"")
      : "") +
    "\n\nДата составления: _________________\nПодпись заявителя: _________________";
}
