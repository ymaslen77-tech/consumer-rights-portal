import json
import sys
import unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from court_evidence import official_url,official_pdf,regulator_copy_url,validate_published_acts,corroborate,link_appeal

class CourtEvidenceTests(unittest.TestCase):
    def setUp(self):
        self.first=dict(instance="first",uid="77RS0018-02-2025-003155-71",
            court="Никулинский районный суд",number="02-0514/2026",
            source="official_registry",url="https://m.mos-gorsud.ru/first")
        self.appeal=dict(instance="appeal",uid=self.first["uid"],
            court="Московский городской суд",number="Ж-65034/2026",
            registered_at="2026-09-30",source="official_registry",
            url="https://m.mos-gorsud.ru/appeal")
    def test_registered_appeal_does_not_imply_reversal(self):
        self.assertEqual(link_appeal(self.first,self.appeal),"appeal_registered")
    def test_uid_mismatch(self):
        self.assertEqual(link_appeal(self.first,{**self.appeal,"uid":"OTHER"}),"conflict")
    def test_nonofficial(self):
        self.assertEqual(link_appeal(self.first,{**self.appeal,"url":"https://sudact.ru/a"}),"hold")
        self.assertFalse(official_url("https://ksrf.ru.evil.test/act.pdf"))
    def test_sources_corroborate_and_conflict(self):
        rows=[dict(value="Отказано",source="official_registry",url="https://mos-gorsud.ru/a"),
              dict(value="отказано",source="official_registry",url="https://m.mos-gorsud.ru/b")]
        self.assertEqual(corroborate(rows,"value"),"corroborated")
        rows[1]["url"]=rows[0]["url"]
        self.assertEqual(corroborate(rows,"value"),"official_record")
        rows[1]["value"]="Удовлетворено"
        self.assertEqual(corroborate(rows,"value"),"conflict")
    def test_constitutional_court_seven_p_links_only_remote_returns(self):
        root=Path(__file__).resolve().parents[2]
        rows=json.loads((root/"src/data/verified-court-cases.json").read_text(encoding="utf8"))
        case=next(row for row in rows if row["number"]=="7-П" and row["date"]=="2026-02-17")
        self.assertEqual(case["situationSlugs"],["internet-magaziny-5","internet-magaziny-3","marketpleysy-2"])
        self.assertIn("не соответствующими Конституции",case["result"])
        self.assertIn("расходы и риск",case["result"])
        self.assertIn("подлежат пересмотру",case["result"])
        self.assertTrue(any("KSRFDecision889199.pdf" in ref["url"] for ref in case["sources"]))

    def test_new_court_cards(self):
        root=Path(__file__).resolve().parents[2]
        rows=json.loads((root/"src/data/verified-court-cases.json").read_text(encoding="utf8"))
        situations={r["slug"]:r for r in json.loads((root/"src/data/situations.json").read_text(encoding="utf8"))}
        for number in ("25-П","72-КГ23-1-К8","4-КГ24-57-К1"):
            row=next(r for r in rows if r["number"]==number)
            self.assertGreaterEqual(len({r["url"].split("/")[2] for r in row["sources"]}),3)
            self.assertEqual(len(row["plan"]),4)
            self.assertTrue(all(s in situations and situations[s]["topic"] in row["topics"] for s in row["situationSlugs"]))
            self.assertIn("пересмотр" if number=="25-П" else "новое рассмотрение",row["result"])
        self.assertTrue(official_pdf("https://vsrf.ru/lk/practice/stor_pdf/2275040"))
        self.assertFalse(official_pdf("https://vsrf.ru/lk/practice/cases/2275040"))
        self.assertFalse(official_pdf("https://vsrf.ru.evil.test/lk/practice/stor_pdf/2275040"))
        self.assertFalse(official_pdf("https://vsrf.ru/lk/practice/stor_pdf/2275040/anything"))

    def test_regional_court_copies(self):
        root=Path(__file__).resolve().parents[2]
        rows=json.loads((root/"src/data/verified-court-cases.json").read_text(encoding="utf8"))
        situations={r["slug"]:r for r in json.loads((root/"src/data/situations.json").read_text(encoding="utf8"))}
        local=[r for r in rows if r.get("sourceKind")=="regulator_published_court_copy"]
        self.assertEqual(len(local),6)
        for row in local:
            self.assertTrue(all(s in situations and situations[s]["topic"] in row["topics"] for s in row["situationSlugs"]))
            self.assertEqual(len(row["plan"]),4)
            self.assertTrue(row["evidence"])
            with self.assertRaises(ValueError):
                validate_published_acts([{**row,"sources":row["sources"][1:]}])
            with self.assertRaises(ValueError):
                validate_published_acts([{**row,"status":""}])
        self.assertTrue(regulator_copy_url("https://zpp.rospotrebnadzor.ru/Show/File/64980"))
        self.assertFalse(regulator_copy_url("https://zpp.rospotrebnadzor.ru.evil.test/Show/File/64980"))
        self.assertFalse(regulator_copy_url("https://zpp.rospotrebnadzor.ru/Show/File/64980?file=other"))
        self.assertFalse(regulator_copy_url("https://zpp.rospotrebnadzor.ru/adjudications/regional/576468"))
        by_number={r["number"]:r for r in local}
        self.assertEqual(by_number["2-164/2026"]["date"],"2026-01-20")
        self.assertEqual(by_number["2-164/2026"]["outcome"],"partial_by_defendant")
        self.assertIn("128 669,26",by_number["2-1332/2025"]["amounts"])
        self.assertIn("не подтверждены",by_number["2-1332/2025"]["status"])

    def test_new_repair_marketplace_and_magistrate_cards(self):
        root=Path(__file__).resolve().parents[2]
        rows=json.loads((root/"src/data/verified-court-cases.json").read_text(encoding="utf8"))
        by_number={r["number"]:r for r in rows}
        repair=by_number["2-51/2026"]
        self.assertIn("1 193 190",repair["amounts"])
        self.assertIn("374 960",repair["finding"])
        marketplace=by_number["2-1499/2026"]
        self.assertIn("75 800,18",marketplace["amounts"])
        self.assertTrue(all(any(x["url"].endswith("/"+n) for x in marketplace["sources"]) for n in ("66299","66300")))
        self.assertIn("не подтверждены",marketplace["status"])
        magistrate=by_number["2-97-1246/2026"]
        self.assertEqual(magistrate["date"],"2026-08-27")
        self.assertIn("08.09.2026",magistrate["status"])
        self.assertIn("54 099,06",magistrate["amounts"])
        self.assertIn("16.06.2026",magistrate["comment"])
        self.assertIn("не исправляется",magistrate["comment"])
        self.assertTrue(magistrate["court"].startswith("Мировой судья"))
        self.assertEqual(len(rows),11)

    def test_existing_full_text_entries(self):
        root=Path(__file__).resolve().parents[2]
        rows=json.loads((root/"src/data/verified-court-cases.json").read_text(encoding="utf8"))
        self.assertEqual(validate_published_acts(rows),len(rows))
        with self.assertRaises(ValueError):
            validate_published_acts([{**rows[0],"verification":"official_registry"}])
        with self.assertRaises(ValueError):
            validate_published_acts([{**rows[0],"sources":[{"url":"https://ksrf.ru/Decision/"},rows[0]["sources"][1]]}])

if __name__=="__main__":unittest.main()
