// Browser-level regression test without additional dependencies.
// Uses Chrome DevTools Protocol from Node 22 to fill the real React UI, download
// DOCX and render a PDF through Chromium. No real consumer data are used.
import assert from "node:assert/strict";
import {spawn,spawnSync} from "node:child_process";
import {mkdtempSync,readdirSync,readFileSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";

const origin=process.env.CONSUMER_SMOKE_ORIGIN||"http://127.0.0.1:3000";
const candidates=[process.env.CHROME_BIN,"google-chrome","google-chrome-stable","chromium","chromium-browser"].filter(Boolean);
let binary;
for(const name of candidates){
 const test=spawnSync("which",[name],{encoding:"utf8"});
 if(test.status===0){binary=test.stdout.trim();break;}
}
assert.ok(binary,"A chromium-based browser is required for acceptance tests");
const home=mkdtempSync(join(tmpdir(),"consumer-cdp-"));
const downloads=mkdtempSync(join(tmpdir(),"consumer-docx-"));
const chrome=spawn(binary,[
 "--headless=new","--no-sandbox","--disable-gpu","--disable-dev-shm-usage",
 "--disable-popup-blocking","--no-first-run","--remote-debugging-port=9223",
 "--user-data-dir="+home,"about:blank"
],{stdio:"ignore"});
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function chromeJson(path,options){
 const response=await fetch("http://127.0.0.1:9223"+path,options);
 if(!response.ok)throw new Error("CDP HTTP "+response.status);
 return response.json();
}
class CDP{
 constructor(wsUrl){this.ws=new WebSocket(wsUrl);this.counter=0;this.pending=new Map();
  this.ready=new Promise((resolve,reject)=>{
   this.ws.addEventListener("open",resolve,{once:true});
   this.ws.addEventListener("error",reject,{once:true});
  });
  this.ws.addEventListener("message",event=>{
   const msg=JSON.parse(event.data);
   if(msg.id&&this.pending.has(msg.id)){
    const job=this.pending.get(msg.id);this.pending.delete(msg.id);
    if(msg.error)job.reject(Error(msg.error.message));else job.resolve(msg.result||{});
   }
  });
 }
 async send(method,params={}){
  await this.ready;const id=++this.counter;
  return new Promise((resolve,reject)=>{
   this.pending.set(id,{resolve,reject});
   this.ws.send(JSON.stringify({id,method,params}));
  });
 }
 async evaluate(expression){
  const answer=await this.send("Runtime.evaluate",{expression,awaitPromise:true,returnByValue:true});
  if(answer.exceptionDetails)throw new Error("CDP evaluation: "+answer.exceptionDetails.text);
  return answer.result?.value;
 }
 close(){this.ws.close();}
}
async function until(callback,label,max=60){
 for(let i=0;i<max;i++){
  try{const value=await callback();if(value)return value;}catch(e){if(i===max-1)throw e;}
  await sleep(200);
 }
 throw new Error("Browser check timed out: "+label);
}
let client;
try{
 await until(()=>chromeJson("/json/version"),"Chrome CDP endpoint");
 const target=await chromeJson("/json/new?about:blank",{method:"PUT"});
 client=new CDP(target.webSocketDebuggerUrl);await client.ready;
 await client.send("Page.enable");
 await client.send("Runtime.enable");
 await client.send("Page.setDownloadBehavior",{behavior:"allow",downloadPath:downloads});
 await client.send("Page.navigate",{url:origin+"/razbor/nekachestvennyy-tovar-1"});
 await until(()=>client.evaluate('Boolean(document.querySelector(".builderform input") && document.querySelector(".legal-confirmation input"))'),"React form");
 await sleep(1100); // hydration
 const setForm=`(()=>{
   const form=document.querySelector(".builderform");
   const all=[...form.querySelectorAll("input:not([type=checkbox])")];
   const ta=[...form.querySelectorAll("textarea")];
   const fire=(element,value)=>{
     const proto=element.tagName==="TEXTAREA"?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;
     Object.getOwnPropertyDescriptor(proto,"value").set.call(element,value);
     element.dispatchEvent(new Event("input",{bubbles:true}));
     element.dispatchEvent(new Event("change",{bubbles:true}));
   };
   [ "ООО Тест", "Тестовый Клиент", "Москва, Тестовая 1"].forEach((v,i)=>fire(all[i],v));
   fire(ta[0],"Товар не работает при соблюдении условий эксплуатации; запись о покупке сохранена.");
   fire(ta[1],"Прошу рассмотреть претензию по статье 18 при наличии необходимых условий.");
   document.querySelector(".legal-confirmation input").click();
   return true;
 })()`;
 assert.equal(await client.evaluate(setForm),true);
 await until(()=>client.evaluate('document.querySelector(".builderpreview pre")?.textContent?.includes("Тестовый Клиент")'),"preview updates");
 assert.ok(await client.evaluate('document.querySelector(".builderpreview pre")?.textContent?.includes("Закон РФ № 2300-1")'));
 await client.evaluate('document.querySelector(".document-actions button").click()');
 const filename=await until(()=>{
  const files=readdirSync(downloads).filter(x=>x.endsWith(".docx"));
  return files[0]||false;
 },"downloaded DOCX",80);
 const bytes=readFileSync(join(downloads,filename));
 assert.ok(bytes.length>1000);
 assert.equal(bytes[0],0x50);assert.equal(bytes[1],0x4b);
 console.log("BROWSER_UI_DOCX_DOWNLOAD_OK",filename,bytes.length);
 // Ask Chromium to render the actual document preview as a PDF, verifying that
 // print layout works without depending on the native PDF printer dialog.
 const pdf=await client.send("Page.printToPDF",{printBackground:true,preferCSSPageSize:true});
 const pdfBytes=Buffer.from(pdf.data,"base64");
 assert.ok(pdfBytes.length>1000 && pdfBytes.subarray(0,4).toString()==="%PDF");
 console.log("BROWSER_PDF_RENDER_OK",pdfBytes.length);
 // Switch document in the same React wizard: there must be a second draft.
 const switched=await client.evaluate(`(()=>{
   const select=document.querySelector("#situation-document-select");
   const next=[...select.options].find(x=>x.value!==select.value);
   if(!next)return false;
   const setter=Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,"value").set;
   setter.call(select,next.value);select.dispatchEvent(new Event("change",{bubbles:true}));return true;
 })()`);
 assert.equal(switched,true);
 await until(()=>client.evaluate('document.querySelector(".builderpreview pre")?.textContent?.includes("ПРОЕКТ ДОКУМЕНТА")'),"second document");
 console.log("BROWSER_MULTI_DOCUMENT_SELECTOR_OK");
}finally{
 client?.close();chrome.kill("SIGKILL");
 rmSync(home,{recursive:true,force:true});rmSync(downloads,{recursive:true,force:true});
}
