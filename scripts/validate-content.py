#!/usr/bin/env python3
"""Offline checks; do not substitute for reviewing official legal text."""
from pathlib import Path
from urllib.parse import urlsplit
from datetime import date
import json, sys
ROOT=Path(__file__).resolve().parents[1]
def read(name):return json.loads((ROOT/'src/data'/name).read_text(encoding='utf8'))
topics=read('topics.json');cases=read('situations.json');institutions=read('institutions.json');docs=read('documents.json');sources=read('official-sources.json')
for name,items in [('topics',topics),('situations',cases),('institutions',institutions),('documents',docs),('sources',sources)]:
    ids=[x.get('slug') or x.get('id') for x in items]
    assert all(ids) and len(ids)==len(set(ids)),f'duplicate IDs in {name}'
assert len(topics)==20, len(topics)
assert len(cases)>=60, len(cases)
assert len(institutions)>=8
assert len(read('moscow-district-offices.json'))==12
assert len(docs)>=10
known_topics={x['slug'] for x in topics}
known_cases={x['slug'] for x in cases}
known_docs={x['slug'] for x in docs}
assert all(x['topic'] in known_topics for x in cases)
assert all(x['relatedTopics'] and all(k in known_topics for k in x['relatedTopics']) for x in cases)
assert all(all(k in known_docs for k in x['documents']) for x in cases)
assert all(set(x['situationSlugs'])=={c['slug'] for c in cases if c['topic']==x['slug']} for x in topics)
for row in sources:
    p=urlsplit(row['url'])
    assert p.scheme=='https' and p.hostname and not p.username and not p.password
for row in institutions:
    assert row['sourceUrl'].startswith('https://')
    assert all(url.startswith('https://') for _,url in row['other'])
for row in docs:
    assert row['sourceUrl'].startswith('https://') and row['status']=='draft_template'
assert not (ROOT/'src/data/verified-court-static.json').exists(), 'Unverified acts must not appear in public manifest'
assert (ROOT/'src/app/robots.ts').exists()
print(json.dumps({'result':'OK','topics':len(topics),'situations':len(cases),'institutions':len(institutions),'draft_documents':len(docs),'official_sources':len(sources),'verified_court_acts':0},ensure_ascii=False))
