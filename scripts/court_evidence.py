"""Structural court evidence checks; never substitutes for reading an act."""
from datetime import date
from urllib.parse import urlsplit

HOSTS = ("ksrf.ru", "vsrf.ru", "sudrf.ru", "mos-gorsud.ru", "arbitr.ru")

def official_url(url):
    try:
        p = urlsplit(url)
        h = (p.hostname or "").lower().rstrip(".")
        return (p.scheme == "https" and bool(p.path) and not p.username and
                not p.password and p.port in (None,443) and
                any(h == host or h.endswith("." + host) for host in HOSTS))
    except (ValueError,TypeError):
        return False

def official_pdf(url):
    if not official_url(url):
        return False
    p = urlsplit(url)
    h = (p.hostname or "").lower().rstrip(".")
    return (p.path.lower().endswith(".pdf") or
            (h in ("vsrf.ru", "www.vsrf.ru") and
             p.path.startswith("/lk/practice/stor_pdf/") and
             p.path.removeprefix("/lk/practice/stor_pdf/").isdigit() and
             not p.query and not p.fragment))

def regulator_copy_url(url):
    """Only explicit file endpoints of the state consumer-protection register."""
    try:
        p = urlsplit(url)
        return (p.scheme == "https" and p.netloc == "zpp.rospotrebnadzor.ru"
                and not p.query and not p.fragment
                and p.path.startswith("/Show/File/")
                and p.path.removeprefix("/Show/File/").isdigit())
    except (ValueError,TypeError):
        return False

def regulator_case_url(url):
    try:
        p = urlsplit(url)
        tail = p.path.removeprefix("/adjudications/regional/")
        return (p.scheme == "https" and p.netloc == "zpp.rospotrebnadzor.ru"
                and not p.query and not p.fragment
                and p.path.startswith("/adjudications/regional/")
                and bool(tail) and "/" not in tail)
    except (ValueError,TypeError):
        return False

def _v(row,key):
    return str(row.get(key) or "").strip().casefold()

def validate_published_acts(acts):
    """A review marker and specific official PDF are needed for full-text status."""
    seen=set()
    for a in acts:
        identity=tuple(_v(a,k) for k in ("court","type","number","date"))
        if not all(identity) or identity in seen:
            raise ValueError("Missing or duplicate act identity")
        seen.add(identity)
        if a.get("verification") != "official_full_text_reviewed_" + a.get("reviewedAt",""):
            raise ValueError("No editorial full-text review marker")
        if date.fromisoformat(a["reviewedAt"]) > date.today():
            raise ValueError("Future review date")
        date.fromisoformat(a["date"])
        urls=[s.get("url","") for s in a.get("sources",[])]
        if a.get("sourceKind") == "regulator_published_court_copy":
            if not any(regulator_copy_url(u) for u in urls) or not any(regulator_case_url(u) for u in urls):
                raise ValueError("Missing state register copy or case record")
            required_copies = a.get("requiredCopyUrls")
            if required_copies is not None:
                if (not isinstance(required_copies,list) or len(required_copies)<2
                        or len(set(required_copies)) != len(required_copies)
                        or not all(regulator_copy_url(u) and u in urls for u in required_copies)):
                    raise ValueError("Incomplete multi-file court copy")
            if a.get("instance") != "first" or not all(a.get(k) for k in ("uid","status","appeal","amounts","evidence","plan")):
                raise ValueError("Incomplete first-instance evidence")
            if a.get("outcome") not in ("granted","partial","partial_by_defendant","dismissed"):
                raise ValueError("Unknown first-instance outcome")
        elif len(set(urls))<2 or not any(official_pdf(u) for u in urls):
            raise ValueError("No distinct sources or no direct official full-text PDF")
        if not all(a.get(k) for k in ("finding","result","legal")):
            raise ValueError("Incomplete editorial summary")
    return len(seen)

def corroborate(records,key):
    """Conflicts are held; repeated URLs are not independent corroboration."""
    populated=[(str(r.get(key) or "").strip(),r.get("url",""),r.get("source"))
               for r in records if str(r.get(key) or "").strip()]
    if not populated: return "unknown"
    if len({v.casefold() for v,_,_ in populated})>1: return "conflict"
    official={u for _,u,source in populated
              if source=="official_registry" and official_url(u)}
    if not official: return "unverified"
    return "corroborated" if len(official)>=2 else "official_record"

def link_appeal(first,appeal):
    """Only equal UIDs link two instances; registration is NOT a reversal."""
    for row,instance in ((first,"first"),(appeal,"appeal")):
        if row.get("instance")!=instance: return "conflict"
        if row.get("source")!="official_registry" or not official_url(row.get("url","")):
            return "hold"
        if not all(_v(row,k) for k in ("uid","court","number")): return "hold"
    if _v(first,"uid")!=_v(appeal,"uid"): return "conflict"
    if not appeal.get("registered_at"): return "hold"
    return "appeal_result_recorded" if appeal.get("result") else "appeal_registered"
