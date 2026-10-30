#!/usr/bin/env python3
"""Read-only reachability diagnostics; site or legal publication never depends on availability."""
import json,urllib.request,urllib.error,datetime
from pathlib import Path
root=Path(__file__).resolve().parents[1]
sources=json.loads((root/'src/data/official-sources.json').read_text(encoding='utf8'))
items=[]
for source in sources:
    try:
        req=urllib.request.Request(source['url'],headers={'User-Agent':'ConsumerPortalSourceAudit/0.1 (read-only)'},method='HEAD')
        with urllib.request.urlopen(req,timeout=9) as res: status=res.status
        items.append(dict(id=source['id'],status='available',http_status=status))
    except Exception as e:
        items.append(dict(id=source['id'],status='unavailable_or_unverified',error=type(e).__name__))
report={'checked_at_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'publication_approved':False,'items':items}
out=root/'test-results/source-availability.json';out.parent.mkdir(exist_ok=True)
out.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'
',encoding='utf8')
print(json.dumps(report,ensure_ascii=False))
# Individual remote timeout is not permission to suppress verified site content.
