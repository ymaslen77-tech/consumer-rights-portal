// Curated source pointers for independent legal review; never infer a right solely
// from a topic. Every draft displays a scope warning and requires the user to
// select the legal demand. These links go into the exported document as URLs.
export type LawLink={title:string;url:string;note?:string};
const L={
 consumer:{title:"Закон РФ от 07.02.1992 № 2300-1 «О защите прав потребителей»",url:"https://www.consultant.ru/document/cons_doc_LAW_305/"},
 trade:{title:"Правила розничной и дистанционной торговли, постановление № 2463",url:"https://www.consultant.ru/document/cons_doc_LAW_373622/"},
 citizens:{title:"Федеральный закон от 02.05.2006 № 59-ФЗ «О порядке рассмотрения обращений граждан»",url:"https://www.consultant.ru/document/cons_doc_LAW_59999/"},
 proc:{title:"Гражданский процессуальный кодекс РФ",url:"https://www.consultant.ru/document/cons_doc_LAW_39570/"},
 housing:{title:"Жилищный кодекс РФ",url:"https://www.consultant.ru/document/cons_doc_LAW_51057/"},
 utility:{title:"Правила предоставления коммунальных услуг, постановление № 354",url:"https://www.consultant.ru/document/cons_doc_LAW_114247/"},
 medicine:{title:"Федеральный закон № 323-ФЗ «Об основах охраны здоровья граждан»",url:"https://www.consultant.ru/document/cons_doc_LAW_121895/"},
 medicineRules:{title:"Правила платных медицинских услуг, постановление № 659 (с 01.09.2026)",url:"https://www.consultant.ru/document/cons_doc_LAW_535622/"},
 education:{title:"Федеральный закон № 273-ФЗ «Об образовании в РФ»",url:"https://www.consultant.ru/document/cons_doc_LAW_140174/"},
 travel:{title:"Федеральный закон № 132-ФЗ «Об основах туристской деятельности»",url:"https://www.consultant.ru/document/cons_doc_LAW_12462/"},
 aviation:{title:"Воздушный кодекс РФ (для воздушной перевозки)",url:"https://www.consultant.ru/document/cons_doc_LAW_13744/"},
 finances:{title:"Федеральный закон № 123-ФЗ «Об уполномоченном по правам потребителей финансовых услуг»",url:"https://base.garant.ru/71958414/"},
 insurance:{title:"Федеральный закон № 40-ФЗ «Об ОСАГО» (только если спор об ОСАГО)",url:"https://www.consultant.ru/document/cons_doc_LAW_36528/"},
 communication:{title:"Федеральный закон № 126-ФЗ «О связи»",url:"https://www.consultant.ru/document/cons_doc_LAW_43224/"},
 ad:{title:"Федеральный закон № 38-ФЗ «О рекламе»",url:"https://www.consultant.ru/document/cons_doc_LAW_58968/"},
 renewal:{title:"Разъяснение Роспотребнадзора об автоплатежах за подписки с 01.03.2026",url:"https://zpp.rospotrebnadzor.ru/news/federal/571840"},
 safety:{title:"Роспотребнадзор: правовые вопросы качества и безопасности пищевой продукции",url:"https://zpp.rospotrebnadzor.ru/"},
 rpn:{title:"Официальная электронная приёмная Роспотребнадзора (ЕСИА)",url:"https://petition.rospotrebnadzor.ru/petition/"},
};
const topicKeys:Record<string,(keyof typeof L)[]>={
 "nekachestvennyy-tovar":["consumer","trade"],
 "vozvrat-obmen":["consumer","trade"],
 "internet-magaziny":["consumer","trade"],
 "marketpleysy":["consumer","trade"],
 "dostavka-oplata":["consumer","trade"],
 "garantiya-servis":["consumer"],
 "tehnicheski-slozhnye":["consumer"],
 "avtomobili":["consumer"],
 "bytovye-uslugi":["consumer"],
 "remont-stroitelstvo":["consumer"],
 "zhkh":["housing","utility","consumer"],
 "medicina":["medicine","medicineRules","consumer"],
 "obrazovanie":["education","consumer"],
 "turizm-gostinicy":["travel","consumer"],
 "transport":["aviation","consumer"],
 "banki-strahovanie":["finances","consumer"],
 "svyaz-internet":["communication","consumer"],
 "podpiski-cifrovye":["consumer","renewal"],
 "produkty-pitanie":["consumer","safety"],
 "navyazannye-usloviya":["consumer","ad"],
};
export function lawsForSituation(topic:string,documentSlug:string):LawLink[]{
  if(!topicKeys[topic])throw new Error("Unknown topic in legal reference map: "+topic);
  const baseKeys: (keyof typeof L)[] =
   documentSlug==="zhaloba-rospotrebnadzor"?["citizens","consumer","rpn"]:
   documentSlug==="zhaloba-fas-reklama"?["ad","citizens"]:
   documentSlug==="finansovyy-upolnomochennyy-obrashchenie"?["finances"]:
   documentSlug==="isk-zpp"?["proc","consumer"]:
   topicKeys[topic];
  // For regulatory letters, additional sector regulations are context, not
  // proof of a breach. For consumer claims, do not add a state-appeal statute.
  const optional: (keyof typeof L)[] =
    documentSlug==="zhaloba-rospotrebnadzor" ? topicKeys[topic].filter(x=>x!=="consumer") : [];
  const seen=new Set<string>();
  return [...baseKeys,...optional].map(key=>L[key]).filter(x=>{
    if(seen.has(x.url))return false;seen.add(x.url);return true;
  });
}
