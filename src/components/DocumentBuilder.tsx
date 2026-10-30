"use client";
import {useMemo,useState} from "react";
type Fields={recipient:string,sender:string,address:string,contact:string,agreement:string,eventDate:string,description:string,request:string,evidence:string};
export function DocumentBuilder({title,recipient}:{title:string,recipient:string}){
 const [f,setF]=useState<Fields>({recipient:'',sender:'',address:'',contact:'',agreement:'',eventDate:'',description:'',request:'',evidence:''});
 const fields:[keyof Fields,string,string][]=[
 ['recipient','Кому (организация, наименование или суд)','Название организации / адресат'],
 ['sender','От кого (Ф. И. О.)','Ваши Ф. И. О.'],
 ['address','Адрес для ответа','Ваш адрес'],
 ['contact','Контакт для ответа','Телефон или email (по необходимости)'],
 ['agreement','Договор / заказ / покупка','Номер и дата договора или заказа'],
 ['eventDate','Дата события','Например, 15.10.2026'],
 ['description','Что произошло','Факты без оценочных выражений'],
 ['request','Какое требование заявляете','Укажите одно или несколько допустимых требований после проверки законодательства'],
 ['evidence','Приложения','Перечислите копии документов'],
 ];
 const content=useMemo(()=>`${f.recipient||'[наименование адресата]'}
От: ${f.sender||'[Ф. И. О.]'}
Адрес: ${f.address||'[почтовый адрес]'}
Контакт: ${f.contact||'[способ связи]'}

${title.toUpperCase()}

Отношения сторон: ${f.agreement||'[договор или заказ]'}
Дата события: ${f.eventDate||'[дата]'}

Обстоятельства:
${f.description||'[опишите фактические обстоятельства и приложенные доказательства]'}

Мои требования:
${f.request||'[сформулируйте законное требование с учётом условий конкретной ситуации]'}

Приложения:
${f.evidence||'[перечень прилагаемых документов]'}

Дата: ____________    Подпись: ____________

[Черновик составлен автоматически. Проверьте правильность адресата, требования, правовых оснований, сроков, способа подачи и приложений.]`,[f,title]);
 function exportText(){const blob=new Blob([content],{type:'text/plain;charset=utf-8'});const u=URL.createObjectURL(blob);const a=document.createElement('a');a.href=u;a.download='consumer-document-draft.txt';a.click();URL.revokeObjectURL(u)}
 return <div className="builder"><div className="builderform"><h2>Заполнить документ</h2>{fields.map(([key,label,placeholder])=><label key={key}>{label}{['description','request','evidence'].includes(key)?<textarea value={f[key]} onChange={e=>setF({...f,[key]:e.target.value})} placeholder={placeholder} rows={3} maxLength={3000}/>:<input value={f[key]} onChange={e=>setF({...f,[key]:e.target.value})} placeholder={placeholder} maxLength={300}/>}</label>)}</div><div className="builderpreview"><div className="previewhead"><h2>Предварительный просмотр</h2><button className="btn primary small" type="button" onClick={exportText}>Сохранить TXT</button></div><pre>{content}</pre><p className="disclaimer">Данные не отправляются на наш сервер. Сервис не осуществляет официальную подачу обращения.</p></div></div>
}
