#!/usr/bin/env python3
"""Offline inventory of legal-review gaps. Source counts never certify legal correctness.

No network access, personal data or automatic change of publication statuses.
The report is evidence for editors, not a legal opinion or filing approval.
"""
import argparse
import json
from collections import Counter
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "src" / "data"
SOURCE_ONLY = "source_checked_"
SECTOR_ONLY = "sector_sources_checked_"
DUPLICATE_CANDIDATES = (
    ("avtomobili-2", "avtomobili-4"),
    ("remont-stroitelstvo-3", "remont-stroitelstvo-5"),
    ("obrazovanie-2", "obrazovanie-6"),
)

def load(name):
    return json.loads((DATA / name).read_text(encoding="utf-8"))

def publisher(url):
    """Group subdomains of the same publisher; not an independence judgment."""
    host = (urlsplit(url).hostname or "").lower().removeprefix("www.")
    for suffix in ("rospotrebnadzor.ru", "consultant.ru", "garant.ru", "cbr.ru", "pravo.gov.ru"):
        if host == suffix or host.endswith("." + suffix):
            return suffix
    return host

def valid_https(url):
    if not isinstance(url, str):
        return False
    try:
        parsed = urlsplit(url)
        return parsed.scheme == "https" and bool(parsed.hostname) and not parsed.username and not parsed.password
    except ValueError:
        return False

def unique_slugs(rows, kind, errors):
    slugs = [row.get("slug") for row in rows]
    if not all(isinstance(s, str) and s.strip() for s in slugs):
        errors.append(f"{kind}: missing slug")
    if len(slugs) != len(set(slugs)):
        errors.append(f"{kind}: repeated slug")
    return set(slugs)

def build_report(topics, situations, documents):
    errors = []
    topic_ids = unique_slugs(topics, "topics", errors)
    case_ids = unique_slugs(situations, "situations", errors)
    doc_ids = unique_slugs(documents, "documents", errors)
    topic_index = {topic["slug"]: topic for topic in topics}
    by_slug = {s["slug"]: s for s in situations}
    doc_index = {d["slug"]: d for d in documents}
    rows = []
    old_statuses = Counter()
    source_counts = Counter()
    publisher_counts = Counter()
    for case in situations:
        slug = case["slug"]
        if case.get("topic") not in topic_ids:
            errors.append(f"{slug}: unknown topic")
        options = case.get("documents", [])
        if not isinstance(options, list) or not options:
            errors.append(f"{slug}: no document choices")
            options = []
        for doc in options:
            if doc not in doc_ids:
                errors.append(f"{slug}: missing document {doc}")
        if len(options) != len(set(options)):
            errors.append(f"{slug}: duplicate document choices")
        links = case.get("sources", [])
        if not isinstance(links, list) or not all(valid_https(link) for link in links):
            errors.append(f"{slug}: invalid source URL")
            links = []
        if len(links) != len(set(links)):
            errors.append(f"{slug}: duplicate source URL")
        groups = sorted({publisher(url) for url in links})
        status = case.get("legalStatus", "")
        if not (status.startswith(SOURCE_ONLY) or status.startswith(SECTOR_ONLY)):
            errors.append(f"{slug}: unknown or unapproved review status {status}")
        old_statuses["previous_source_link_label" if status.startswith(SOURCE_ONLY) else "sector_sources_individual_facts_required"] += 1
        source_counts["at_least_3_urls" if len(links) >= 3 else "fewer_than_3_urls"] += 1
        publisher_counts[str(min(len(groups), 3)) + ("_or_more" if len(groups) >= 3 else "")] += 1
        if not case.get("checks") or not case.get("cautions") or not case.get("legalBasis"):
            errors.append(f"{slug}: missing case-specific checks, cautions or legal basis")
        peers = case.get("relatedSituations")
        if not isinstance(peers, list):
            errors.append(f"{slug}: missing relatedSituations list")
            peers = []
        for peer in peers:
            if peer not in case_ids or peer == slug:
                errors.append(f"{slug}: broken or self-referencing related situation {peer}")
            elif slug not in by_slug[peer].get("relatedSituations", []):
                errors.append(f"{slug}: related situation {peer} lacks reverse link")
        if len(peers) != len(set(peers)):
            errors.append(f"{slug}: duplicate related situations")
        rows.append({
            "slug": slug, "topic": case.get("topic"), "title": case.get("title", ""),
            "previousSourceStatus": status,
            "sourceReviewedAt": case.get("sourceReviewedAt"),
            "sourceUrlsCount": len(links),
            "publisherGroups": groups,
            "documentSlugs": options,
            "relatedSituations": peers,
            "editorialLegalReview": "required",
            "reviewFlags": [
                "fewer_than_3_source_urls" if len(links) < 3 else "",
                "fewer_than_3_publisher_groups" if len(groups) < 3 else "",
                "claim_to_norm_applicability_not_established_by_automated_check",
            ],
        })
        rows[-1]["reviewFlags"] = [flag for flag in rows[-1]["reviewFlags"] if flag]
    for topic in topics:
        wanted = {s["slug"] for s in situations if s.get("topic") == topic["slug"]}
        actual = set(topic.get("situationSlugs", []))
        if wanted != actual:
            errors.append(f"{topic['slug']}: topic index does not match situation records")
    for doc in documents:
        slug = doc["slug"]
        if doc.get("status") != "draft_template":
            errors.append(f"{slug}: document status changed without acceptance")
        if doc.get("claimType") not in ("pretrial_claim", "state_notification", "court_document"):
            errors.append(f"{slug}: unsupported document type")
        if not valid_https(doc.get("sourceUrl")):
            errors.append(f"{slug}: invalid document source URL")
        for field in ("recipient", "legalBasis", "requestHint", "scope"):
            if not str(doc.get(field, "")).strip():
                errors.append(f"{slug}: missing {field}")
    pairs = [{
        "slugs": list(pair),
        "titles": [by_slug[slug].get("title", "") for slug in pair],
        "action": "intents_separated_crosslinks_added_final_legal_review_required",
    } for pair in DUPLICATE_CANDIDATES if all(s in case_ids for s in pair)]
    return {
        "method": "offline_structural_inventory_not_substantive_legal_review",
        "counts": {
            "topics": len(topics),
            "situations": len(situations),
            "documentTemplates": len(documents),
            "situationDocumentChoices": sum(len(s.get("documents", [])) for s in situations),
            "sourceStatusLabels": dict(old_statuses),
            "sourceUrlCoverage": dict(source_counts),
            "publisherGroupCoverage": dict(publisher_counts),
            "draftTemplates": sum(d.get("status") == "draft_template" for d in documents),
            "independentlyApprovedForFiling": 0,
        },
        "limitations": [
            "Three URLs or publisher groups do not prove three independent legal confirmations.",
            "Automated checks do not inspect legal text, effective dates, exceptions or facts.",
            "The 17 source_checked labels do not prove independent expert sign-off.",
            "No automated transition to filing-ready or public indexing is authorized.",
        ],
        "suspectedOverlaps": pairs,
        "situations": rows,
        "errors": errors,
    }

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--json", help="Write a machine-readable report to this path")
    args = parser.parse_args()
    report = build_report(load("topics.json"), load("situations.json"), load("documents.json"))
    if args.json:
        destination = Path(args.json)
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"result": "FAIL" if report["errors"] else "OK", **report["counts"],
                      "suspectedOverlaps": len(report["suspectedOverlaps"]),
                      "errors": report["errors"]}, ensure_ascii=False))
    if report["errors"]:
        raise SystemExit(1)

if __name__ == "__main__":
    main()
