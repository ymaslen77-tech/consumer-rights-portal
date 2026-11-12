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
        self.assertEqual(c["sourceUrlCoverage"]["at_least_3_urls"], 87)
        self.assertEqual(c["publisherGroupCoverage"]["1"], 35)
        self.assertEqual(c["publisherGroupCoverage"]["2"], 98)
        self.assertEqual(c["publisherGroupCoverage"]["3_or_more"], 12)
        self.assertTrue(all(x["editorialLegalReview"] == "required" for x in result["situations"]))
        self.assertEqual(len(result["suspectedOverlaps"]), 3)

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

    def test_illness_ticket_instructions_specify_special_statutory_deadline(self):
        case = next(s for s in self.situations if s["slug"] == "kulturnye-meropriyatiya-4")
        self.assertIn("не позднее дня проведения мероприятия", case["steps"][2])
        self.assertIn("14 дней", case["steps"][2])
        self.assertIn("пункты 23, 25 и 27", case["legalBasis"][1])
        self.assertIn("https://zpp.rospotrebnadzor.ru/news/federal/252994", case["sources"])

    def test_plain_http_and_credentials_are_rejected(self):
        self.assertFalse(audit.valid_https("http://example.org"))
        self.assertFalse(audit.valid_https("https://user:secret@example.org"))
        self.assertTrue(audit.valid_https("https://zpp.rospotrebnadzor.ru/news/federal/594003"))

if __name__ == "__main__":
    unittest.main()
