"""Regression tests: inventory must never mistake links for legal approval."""
import copy
import importlib.util
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
FILE = ROOT / "scripts" / "legal-readiness-audit.py"
spec = importlib.util.spec_from_file_location("legal_readiness_audit", FILE)
audit = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = audit
spec.loader.exec_module(audit)

class ReadinessAuditTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.topics = audit.load("topics.json")
        cls.situations = audit.load("situations.json")
        cls.documents = audit.load("documents.json")

    def test_all_routes_are_reported_without_automatic_certification(self):
        result = audit.build_report(self.topics, self.situations, self.documents)
        self.assertEqual(result["errors"], [])
        c = result["counts"]
        self.assertEqual((c["topics"], c["situations"], c["documentTemplates"], c["situationDocumentChoices"]),
                         (28, 145, 71, 243))
        self.assertEqual(c["sourceStatusLabels"]["previous_source_link_label"], 17)
        self.assertEqual(c["sourceStatusLabels"]["sector_sources_individual_facts_required"], 128)
        self.assertEqual(c["independentlyApprovedForFiling"], 0)
        self.assertEqual(c["sourceUrlCoverage"]["at_least_3_urls"],
                         sum(len(case["sources"]) >= 3 for case in self.situations))
        self.assertEqual(c["sourceUrlCoverage"]["fewer_than_3_urls"],
                         sum(len(case["sources"]) < 3 for case in self.situations))
        groups = [len(set(map(audit.publisher, case["sources"]))) for case in self.situations]
        self.assertEqual(sum(c["publisherGroupCoverage"].values()), len(groups))
        self.assertEqual(c["publisherGroupCoverage"].get("3_or_more", 0),
                         sum(n >= 3 for n in groups))
        self.assertTrue(all(x["editorialLegalReview"] == "required" for x in result["situations"]))
        self.assertEqual(len(result["suspectedOverlaps"]), 3)

    def test_six_overlapping_routes_have_distinct_intents_and_reciprocal_links(self):
        indexed = {s["slug"]: s for s in self.situations}
        for left, right in audit.DUPLICATE_CANDIDATES:
            a, b = indexed[left], indexed[right]
            self.assertNotEqual(a["title"], b["title"])
            self.assertIn(right, a["relatedSituations"])
            self.assertIn(left, b["relatedSituations"])

    def test_broken_related_situation_fails_closed(self):
        cases = copy.deepcopy(self.situations)
        cases[0]["relatedSituations"] = ["nonexistent-route"]
        result = audit.build_report(self.topics, cases, self.documents)
        self.assertTrue(any("broken or self-referencing" in e for e in result["errors"]))

    def test_financial_and_platform_post_2026_rules_keep_review_flags(self):
        cases = {s["slug"]: s for s in self.situations}
        for i in range(1, 10):
            case = cases[f"banki-strahovanie-{i}"]
            self.assertTrue(any("123-ФЗ" in text for text in case["cautions"]))
            self.assertTrue(any("299392" in url for url in case["sources"]))
        unauthorized = cases["banki-strahovanie-4"]
        self.assertIn("следующего за днём получения", unauthorized["steps"][0])
        for i in range(1, 6):
            case = cases[f"marketpleysy-{i}"]
            self.assertTrue(any("№ 290-ФЗ" in x for x in case["cautions"]))
            self.assertTrue(any("594313" in url for url in case["sources"]))

    def test_subdomains_of_one_regulator_are_one_publisher(self):
        self.assertEqual(audit.publisher("https://zpp.rospotrebnadzor.ru/news/federal/123"),
                         audit.publisher("https://86.rospotrebnadzor.ru/"))
        self.assertNotEqual(audit.publisher("https://www.consultant.ru/document/x"),
                            audit.publisher("https://publication.pravo.gov.ru/doc/x"))

    def test_missing_document_reference_fails_closed(self):
        cases = copy.deepcopy(self.situations)
        cases[0]["documents"] = ["document-that-does-not-exist"]
        result = audit.build_report(self.topics, cases, self.documents)
        self.assertTrue(any("missing document" in err for err in result["errors"]))

    def test_unapproved_filing_status_fails_closed(self):
        cases = copy.deepcopy(self.situations)
        cases[0]["legalStatus"] = "filing_ready"
        result = audit.build_report(self.topics, cases, self.documents)
        self.assertTrue(any("unknown or unapproved" in err for err in result["errors"]))

    def test_cultural_event_refund_rules_are_specific_to_the_cause(self):
        cases = {s["slug"]: s for s in self.situations}
        for key in ("kulturnye-meropriyatiya-1", "kulturnye-meropriyatiya-2"):
            self.assertIn("полной цены билета", cases[key]["steps"][3])
            self.assertTrue(any("594003" in url for url in cases[key]["sources"]))
        voluntary = cases["kulturnye-meropriyatiya-3"]["steps"][2]
        for threshold in ("10 дней", "5 дней", "3 дня", "100%", "50%", "30%"):
            self.assertIn(threshold, voluntary)
        self.assertIn("№ 1491", voluntary)

    def test_illness_ticket_instructions_specify_special_statutory_deadline(self):
        case = next(s for s in self.situations if s["slug"] == "kulturnye-meropriyatiya-4")
        self.assertIn("не позднее дня проведения мероприятия", case["steps"][2])
        self.assertIn("14 дней", case["steps"][2])
        self.assertIn("пункты 23, 25 и 27", case["legalBasis"][1])
        self.assertIn("https://zpp.rospotrebnadzor.ru/news/federal/252994", case["sources"])

    def test_ddu_2026_sanctions_are_not_described_as_an_universal_moratorium(self):
        case = next(s for s in self.situations if s["slug"] == "dolevoe-stroitelstvo-1")
        self.assertIn("№ 2227", case["steps"][2])
        self.assertIn("01.01.2026", case["cautions"][0])
        self.assertIn("31.12.2026", case["cautions"][0])
        self.assertIn("отсрочка уплаты", case["legalBasis"][1])
        self.assertTrue(any("law/hotdocs/92395" in url for url in case["sources"]))
        self.assertTrue(any("minstroy.kbr.ru" in url for url in case["sources"]))

    def test_plain_http_and_credentials_are_rejected(self):
        self.assertFalse(audit.valid_https("http://example.org"))
        self.assertFalse(audit.valid_https("https://user:secret@example.org"))
        self.assertTrue(audit.valid_https("https://zpp.rospotrebnadzor.ru/news/federal/594003"))

if __name__ == "__main__":
    unittest.main()
