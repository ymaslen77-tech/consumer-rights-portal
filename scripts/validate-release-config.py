#!/usr/bin/env python3
"""Static fail-closed guard; does not prove runtime or judicial accuracy."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
env_lines = (ROOT / ".env.example").read_text(encoding="utf-8").splitlines()
env = dict(line.split("=", 1) for line in env_lines if line and not line.lstrip().startswith("#") and "=" in line)
assert env.get("SITE_CUTOVER") == "false", "Preview must not expose itself"
assert env.get("SITE_RELEASE_APPROVED") == "no", "Release approval must default to no"
assert env.get("PUBLIC_RELEASE_HOST") == "", "Public hostname must remain unconfigured"
assert env.get("SITE_URL") == "", "Domain must be selected separately"
policy = json.loads((ROOT / "config/release-policy.json").read_text(encoding="utf-8"))
assert policy["production_branch"] == "infra/coolify-russian-vps"
assert policy["deploy_on_push"] is False and policy["manual_deploy_required"] is True
assert policy["site_release_approved"] is False and policy["public_hostname_configured"] is False
assert set(policy["required_checks"]) == {"content-checks", "web-checks", "approval-policy", "docker-build-check"}
guard = (ROOT / "src/lib/content.ts").read_text(encoding="utf-8")
assert 'PUBLIC_RELEASE_HOST' in guard and 'SITE_RELEASE_APPROVED' in guard and 'SITE_CUTOVER' in guard
docker = (ROOT / "Dockerfile.coolify").read_text(encoding="utf-8")
assert "EXPOSE 3000" in docker and 'CMD ["node", "server.js"]' in docker
assert "SITE_RELEASE_APPROVED=yes" not in docker and "SITE_CUTOVER=true" not in docker
for path in (ROOT / ".github/workflows").glob("*.yml"):
    source = path.read_text(encoding="utf-8")
    assert "coolify.dgi-pravo.ru" not in source
    assert "docker push" not in source
    assert "production" not in path.name or path.name == "production-readonly.yml"
assert not (ROOT / "src/data/verified-court-static.json").exists()
print("RELEASE_GATES_VALID: manual deploy; preview/noindex; no DGI secrets")
