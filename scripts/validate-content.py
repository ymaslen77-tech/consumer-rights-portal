#!/usr/bin/env python3
"""Offline checks; do not substitute for reviewing official legal text."""
from pathlib import Path
from urllib.parse import urlsplit
from datetime import date
import json, sys
ROOT=Path(__file__).resolve().parents[1]
def read(name):return json.loads((ROOT/'src/data'/name).read_text(encoding='utf8'))
topics=read('topics.json');cases=read('situations.json');institutions=read('institutions.json');docs=read('documents.json');sources=read('official-sources.json');guides=read('seo-guides.json')
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

assert len(guides)==3, "SEO guide count must be 3 distinct search intents"
paths=[g['path'] for g in guides]
assert len(paths)==len(set(paths)) and all(p.startswith('/') for p in paths)
for g in guides:
    assert len(g['steps'])>=4 and len(g['faq'])>=3 and len(g['sections'])>=3
    assert len(g['sources'])>=2 and all(x['url'].startswith('https://') for x in g['sources'])
    assert len(g['description'])>=80 and len(g['description'])<240
    assert len(g['title'])>30
for case in cases:
    assert isinstance(case['checks'],list) and isinstance(case['cautions'],list)
    assert isinstance(case['relatedPages'],list) and isinstance(case['legalBasis'],list)
    if case['legalStatus'].startswith('source_checked'):
        assert len(case['steps'])>=5 and len(case['checks'])>=2 and len(case['sources'])>=2
        assert len(case['legalBasis'])>=2 and len(case['cautions'])>=1
    for link in case['relatedPages']:
        assert link['href'] in paths
assert sum(s['legalStatus'].startswith('source_checked') for s in cases)>=13
for d in docs:
    assert d.get('requestHint'), "Document template must carry a tailored request hint"
links=set(['/','/situacii','/organy','/dokumenty','/normativnye-akty',*paths])
links.update('/situacii/'+t for t in known_topics)
links.update('/razbor/'+c for c in known_cases)
links.update('/dokumenty/'+d for d in known_docs)
links.update('/organy/'+i['slug'] for i in institutions)
for g in guides:
    assert all(link['href'] in links for link in g['links']), "Unresolved SEO guide link"

print(json.dumps({'result':'OK','topics':len(topics),'situations':len(cases),'institutions':len(institutions),'draft_documents':len(docs),'official_sources':len(sources),'verified_court_acts':0},ensure_ascii=False))
