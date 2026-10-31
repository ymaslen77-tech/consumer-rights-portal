// Browser-only, dependency-free DOCX output. No field values leave the browser.
// ZIP STORE is used intentionally: Office files remain small enough for typical claims.
const encoder = new TextEncoder();

export function escapeXml(value) {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

function crc32(input) {
  let result = 0xffffffff;
  for (const b of input) {
    result ^= b;
    for (let j = 0; j < 8; j++) result = (result >>> 1) ^ ((result & 1) ? 0xedb88320 : 0);
  }
  return (result ^ 0xffffffff) >>> 0;
}

function write16(target, offset, v) {
  target[offset] = v & 255;
  target[offset + 1] = (v >>> 8) & 255;
}
function write32(target, offset, v) {
  write16(target, offset, v & 65535);
  write16(target, offset + 2, v >>> 16);
}

export function zipStore(files) {
  if (!Array.isArray(files) || files.length < 1 || files.length > 100) throw new Error("Invalid ZIP entries");
  const parts = [];
  const central = [];
  let offset = 0;
  const names = new Set();
  for (const item of files) {
    if (!item || typeof item.name !== "string" || !/^[a-zA-Z0-9_./\[\]-]+$/.test(item.name) ||
        item.name.startsWith("/") || item.name.includes("..") || names.has(item.name)) throw new Error("Invalid ZIP filename");
    names.add(item.name);
    const name = encoder.encode(item.name);
    const data = typeof item.data === "string" ? encoder.encode(item.data) : item.data;
    if (!(data instanceof Uint8Array) || data.length > 2_000_000) throw new Error("Invalid ZIP data");
    const checksum = crc32(data);
    const local = new Uint8Array(30 + name.length + data.length);
    write32(local, 0, 0x04034b50);
    write16(local, 4, 20);
    write16(local, 6, 0);
    write16(local, 8, 0);
    write32(local, 10, 0);
    write32(local, 14, checksum);
    write32(local, 18, data.length);
    write32(local, 22, data.length);
    write16(local, 26, name.length);
    write16(local, 28, 0);
    local.set(name, 30);
    local.set(data, 30 + name.length);
    parts.push(local);
    const cd = new Uint8Array(46 + name.length);
    write32(cd, 0, 0x02014b50);
    write16(cd, 4, 20);
    write16(cd, 6, 20);
    write16(cd, 8, 0);
    write16(cd, 10, 0);
    write32(cd, 12, 0);
    write32(cd, 16, checksum);
    write32(cd, 20, data.length);
    write32(cd, 24, data.length);
    write16(cd, 28, name.length);
    write32(cd, 30, 0);
    write32(cd, 34, 0);
    write32(cd, 38, 0);
    write32(cd, 42, offset);
    cd.set(name, 46);
    central.push(cd);
    offset += local.length;
  }
  const centralSize = central.reduce((sum, p) => sum + p.length, 0);
  const end = new Uint8Array(22);
  write32(end, 0, 0x06054b50);
  write16(end, 8, central.length);
  write16(end, 10, central.length);
  write32(end, 12, centralSize);
  write32(end, 16, offset);
  const result = new Uint8Array(offset + centralSize + end.length);
  let pos = 0;
  for (const part of [...parts, ...central, end]) { result.set(part, pos); pos += part.length; }
  return result;
}

function paragraph(line, index) {
  const data = escapeXml(line);
  if (!line.trim()) return "<w:p/>";
  const bold = index < 5 && (/^[А-ЯЁ\s:0-9№().-]+$/u.test(line) || line.startsWith("Кому:"));
  const properties = bold ? "<w:rPr><w:b/></w:rPr>" : "";
  return "<w:p><w:r>" + properties + "<w:t xml:space=\"preserve\">" + data +
    "</w:t></w:r></w:p>";
}

export function makeDocx(text) {
  if (typeof text !== "string" || !text.trim() || text.length > 100_000) throw new Error("Document text is empty or too long");
  const content = text.replace(/\r\n?/g, "\n").split("\n");
  const documentXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">' +
    '<w:body>' + content.map(paragraph).join("") +
    '<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1417"/></w:sectPr></w:body></w:document>';
  const styles = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">' +
    '<w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>' +
    '<w:sz w:val="24"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="120" w:line="360" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults></w:styles>';
  const types = '<?xml version="1.0" encoding="UTF-8"?>' +
    '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
    '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
    '<Default Extension="xml" ContentType="application/xml"/>' +
    '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>' +
    '<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>';
  const rels = '<?xml version="1.0" encoding="UTF-8"?>' +
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>';
  const wordRels = '<?xml version="1.0" encoding="UTF-8"?>' +
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>';
  return zipStore([
    {name:"[Content_Types].xml",data:types},
    {name:"_rels/.rels",data:rels},
    {name:"word/document.xml",data:documentXml},
    {name:"word/styles.xml",data:styles},
    {name:"word/_rels/document.xml.rels",data:wordRels}
  ]);
}
