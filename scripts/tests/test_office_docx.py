#!/usr/bin/env python3
"""Cross-runtime DOCX verification with the standard ZIP and XML parsers."""
from pathlib import Path
from tempfile import TemporaryDirectory
import subprocess
from xml.etree import ElementTree as ET
from zipfile import ZipFile

root = Path(__file__).resolve().parents[2]
script = (
    "import {makeDocx} from './src/lib/office-export.mjs';"
    "import {writeFileSync} from 'node:fs';"
    "writeFileSync(process.argv[1],makeDocx('ЗАЯВЛЕНИЕ\\n"
    "Покупка <товара> & возврат денег\\n"
    "Копия чека: 1250,50 руб.\\n"
    "Дата и подпись'));"
)
with TemporaryDirectory() as temporary:
    destination = Path(temporary) / "test.docx"
    subprocess.run(["node", "--input-type=module", "-e", script, str(destination)],
                   cwd=root, check=True)
    with ZipFile(destination) as document:
        assert document.testzip() is None, "Damaged DOCX ZIP"
        files = set(document.namelist())
        assert files == {
            "[Content_Types].xml", "_rels/.rels",
            "word/document.xml", "word/styles.xml",
            "word/_rels/document.xml.rels",
        }, files
        xml = document.read("word/document.xml")
        root_element = ET.fromstring(xml)
        ET.fromstring(document.read("[Content_Types].xml"))
        ET.fromstring(document.read("_rels/.rels"))
        ET.fromstring(document.read("word/styles.xml"))
        ET.fromstring(document.read("word/_rels/document.xml.rels"))
        text = "".join(root_element.itertext())
        assert "ЗАЯВЛЕНИЕ" in text
        assert "Покупка <товара> & возврат денег" in text
        assert "1250,50 руб." in text
print("DOCX_ZIP_OOXML_XML_VALIDATED")
