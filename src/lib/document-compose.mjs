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
  if (claimType === "court_document") {
    if(!String(fields.counterpartyName || "").trim()) issues.push("counterpartyName");
    if(!String(fields.counterpartyAddress || "").trim()) issues.push("counterpartyAddress");
  }
  if(String(fields.claimAmount || "").trim() && !Number.isFinite(parseRubles(fields.claimAmount))) issues.push("claimAmount");
  return issues;
}
function orBlank(v, text) {
  return String(v||"").trim() || "[" + text + "]";
}
export function draftText(fields, meta) {
  const f = fields;
  const isCourt = meta.claimType==="court_document";
  const isState = meta.claimType==="state_notification";
  const recipient = orBlank(f.recipient,"полное наименование адресата");
  const issuer = orBlank(f.sender,"Ф. И. О. заявителя");
  const counterparty = isCourt ?
    "\nОтветчик: " + orBlank(f.counterpartyName,"полное наименование ответчика") +
    "\nАдрес ответчика: " + orBlank(f.counterpartyAddress,"адрес ответчика") : "";
  const money = parseRubles(f.claimAmount);
  const amountLine = money === null ? "" : Number.isFinite(money) ?
    "\nУказанная стоимость / сумма денежного требования: " + money.toLocaleString("ru-RU",{minimumFractionDigits:2,maximumFractionDigits:2}) + " руб.\n(Это исходная сумма без автоматического расчёта неустойки, штрафа, процентов и госпошлины.)" :
    "\nСумма требует исправления: [введите положительное число с двумя десятичными знаками]";
  const requestHeading = isState ? "ПРОШУ ОРГАН РАССМОТРЕТЬ ОБРАЩЕНИЕ В ПРЕДЕЛАХ КОМПЕТЕНЦИИ:" :
    isCourt ? "ПРОШУ СУД (ТРЕБОВАНИЯ К СУДУ):" : "ТРЕБОВАНИЕ К АДРЕСАТУ:";
  const legal = orBlank(meta.legalBasis,"проверить закон");
  // Legal links are descriptive source pointers, not an assertion that all
  // listed provisions necessarily apply to the user's dispute.
  const legalLinks = Array.isArray(meta.legalLinks) ? meta.legalLinks.filter(x=>
    x && typeof x.title==="string" && typeof x.url==="string" &&
    /^https:\/\//.test(x.url) && !/[\s<>]/.test(x.url)
  ).slice(0,8) : [];
  const referenceText = legalLinks.length ?
    "\n\nНОРМАТИВНЫЕ ИСТОЧНИКИ ДЛЯ СВЕРКИ РЕДАКЦИИ:\n" +
    legalLinks.map((item,index)=>`${index+1}. ${item.title}\n${item.url}`).join("\n") : "";
  const context = meta.contextTitle ?
    "\nИсходная правовая ситуация: " + String(meta.contextTitle) : "";
  return "Кому: " + recipient + "\n" +
    "От: " + issuer + "\nАдрес для ответа: " + orBlank(f.address,"почтовый адрес") +
    "\nКонтакты: " + orBlank(f.contact,"телефон / электронная почта") + counterparty +
    "\n\n" + meta.title.toUpperCase() + context + "\n\n" +
    "Договор / заказ / предмет отношений: " + orBlank(f.agreement,"наименование договора, номер и дата") +
    "\nДата события: " + orBlank(f.eventDate,"дата события") +
    "\n\nФАКТИЧЕСКИЕ ОБСТОЯТЕЛЬСТВА:\n" + orBlank(f.description,"опишите обстоятельства по датам без необоснованных обвинений") +
    amountLine + "\n\n" + requestHeading + "\n" +
    orBlank(f.request,"укажите одно законное требование и обстоятельства, подтверждающие его применимость") +
    "\n\nПРАВОВЫЕ ОРИЕНТИРЫ ДЛЯ ПРОВЕРКИ ПЕРЕД ОТПРАВКОЙ:\n" + legal +
    "\n\nПРИЛОЖЕНИЯ (копии):\n" + orBlank(f.evidence,"перечислите приложенные подтверждения") + referenceText +
    (isCourt ? "\n\nПодсудность, цена иска, госпошлина и требования к приложениям должны быть проверены отдельно по ГПК РФ." : "") +
    "\n\nДата составления: _________________\nПодпись заявителя: _________________\n\n" +
    "ПРОЕКТ ДОКУМЕНТА. Не подан адресату. Требования, нормы, сроки, сумма и приложения требуют проверки по обстоятельствам и действующей редакции права.";
}
