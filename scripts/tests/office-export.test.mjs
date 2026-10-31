import test from "node:test";
import assert from "node:assert/strict";
import {makeDocx, escapeXml, zipStore} from "../../src/lib/office-export.mjs";

test("escapes injected markup and retains Cyrillic", () => {
  assert.equal(escapeXml('А & Б <script>"'), "А &amp; Б &lt;script&gt;&quot;");
  const buffer = makeDocx('Претензия\nФакты: покупка <товара> & возврат\nПодпись');
  assert.ok(buffer instanceof Uint8Array);
  const parsed = new TextDecoder().decode(buffer);
  assert.ok(parsed.includes("Претензия"));
  assert.ok(parsed.includes("&lt;товара&gt; &amp; возврат"));
  assert.ok(!parsed.includes("<товара>"));
  assert.ok(parsed.includes("word/document.xml"));
  assert.ok(parsed.includes("word/styles.xml"));
  assert.equal(buffer[0], 0x50);assert.equal(buffer[1], 0x4b);
  const dv = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  assert.equal(dv.getUint32(buffer.length-22,true),0x06054b50);
  assert.equal(dv.getUint16(buffer.length-12,true),5);
});
test("rejects empty and unsafe ZIP entries", () => {
  assert.throws(()=>makeDocx(" \n "),/empty/);
  assert.throws(()=>zipStore([{name:"../secret",data:"a"}]),/filename/);
  assert.throws(()=>zipStore([{name:"a.txt",data:"1"},{name:"a.txt",data:"2"}]),/filename/);
});
