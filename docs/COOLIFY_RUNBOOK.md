# Consumer rights portal — isolated Coolify/VPS preparation

**Current status:** source code and CI definitions are prepared only. No live domain, no app resource or deployment is asserted. This is NOT DGI.

## Source of truth
- GitHub: `ymaslen77-tech/consumer-rights-portal`
- Development branch: `feature/consumer-rights-initial`
- Release branch: `infra/coolify-russian-vps`
- Review PR: https://github.com/ymaslen77-tech/consumer-rights-portal/pull/1
- Release manifest: `config/release-policy.json`

## New Coolify resource — required, not yet created
1. Create a **new project** `consumer-rights-portal`, environment `production`, application `consumer-web`. Do not reuse DGI application UUID, database, env or Docker volume.
2. Connect the **private** GitHub repository with an authorized source integration and choose `infra/coolify-russian-vps`. Set application build pack: **Dockerfile**; Dockerfile path: `Dockerfile.coolify`; context: repository root `/`.
3. Container port: `3000`. Configure a health check GET `/api/health` on port 3000 (HTTP 200 means process is alive, not legal/SEO readiness).
4. Disable Auto Deploy / deployment on push. Do not configure any webhook to deploy automatically.
5. Configure `SITE_URL=`, `PUBLIC_RELEASE_HOST=`, `SITE_CUTOVER=false`, `SITE_RELEASE_APPROVED=no`, `PORT=3000` in the app **runtime** environment. Do not bake public release flags into the image.
6. Build and deploy ONLY after final-sha CI succeeds, owner approves, and application access is restricted for preview. No public FQDN or DNS cutover at this stage.
7. For future public launch: verify domain ownership, TLS, canonical, robots, sitemap, source legal review and privacy requirements; then set `SITE_URL=https://owned-domain.example/` and `PUBLIC_RELEASE_HOST=owned-domain.example` and, ONLY with explicit owner authorization, change BOTH release flags. Replace the example with an actual verified domain; do not copy DGI hostnames or analytics IDs.

## Build contract
```sh
pnpm install --no-frozen-lockfile  # provisional: create and commit pnpm-lock.yaml
python3 scripts/validate-content.py
python3 scripts/validate-release-config.py
pnpm typecheck
pnpm build
docker build --file Dockerfile.coolify --tag consumer-rights:preview .
```
The Dockerfile builds a self-contained Next.js standalone image (Node 22, port 3000). Do not push image artifacts to shared registries without a separate deployment policy.

## Release procedure (when GitHub protections become available)
1. Generate and commit a real `pnpm-lock.yaml` from the official registry, then switch CI and Docker build to `pnpm install --frozen-lockfile`.
2. Require status checks `content-checks`, `web-checks`, `approval-policy`, `docker-build-check` on release branch. Disallow force push, deletion, and direct pushes; require Pull Requests and final-SHA checks.
3. Merge reviewed PR, confirm release SHA in Coolify source, perform a **manual** Deploy, and verify `/api/health`, pages, PDF and SEO over HTTP. A completed image build alone is insufficient.
4. Keep previous good deployment for rollback. Any future DB migration requires an independent backup and reversible plan.

## Known blockers (30 October 2026)
- GitHub rejects private-repo rulesets under the current account plan: upgrade GitHub plan or make repo public only if the owner expressly authorizes that privacy change.
- Current GitHub Actions jobs failed before any job steps ran; their logs were not available. Check account Actions usage/billing, runner policy and Actions permissions. Do not label CI green.
- No package registry access in the current code-generation runtime to create a trustworthy lockfile. Dependency resolution is provisional.
- No direct Coolify API/SSH integration is available in this conversation; no application has been created. No DNS or production changes were made.
