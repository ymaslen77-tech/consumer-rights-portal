import json
import sys
import unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from court_evidence import official_url,validate_published_acts,corroborate,link_appeal

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

    def test_existing_full_text_entries(self):
        root=Path(__file__).resolve().parents[2]
        rows=json.loads((root/"src/data/verified-court-cases.json").read_text(encoding="utf8"))
        self.assertEqual(validate_published_acts(rows),len(rows))
        with self.assertRaises(ValueError):
            validate_published_acts([{**rows[0],"verification":"official_registry"}])
        with self.assertRaises(ValueError):
            validate_published_acts([{**rows[0],"sources":[{"url":"https://ksrf.ru/Decision/"},rows[0]["sources"][1]]}])

if __name__=="__main__":unittest.main()
