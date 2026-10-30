# CI and protected branch rollout

The repository has a draft initial PR; no merge/deploy is permitted until all checks and branch protections work.

## Proposed required jobs
- `content-checks`: 20 groups, 60 situations, links, sources and no unverified courts; release defaults.
- `web-checks`: Node 22, pnpm 10, TypeScript, Next build and HTTP smoke (all preview pages **noindex**).
- `approval-policy`: independent release/data protection gate; no deploy permission.
- `docker-build-check`: Dockerfile image build + preview HTTP test; does not push or deploy.

The checks do NOT prove legal correctness or authorize public publication.

## GitHub configuration owner action
1. Actions failed without job steps. Inspect `Settings → Actions → General` and `Settings → Billing and licensing → Actions`, including minutes/storage budgets. Retry PR checks only once the issue is resolved.
2. Repository visibility changed to **public** on 30 October 2026. Ruleset listing now works, but its result is **empty**: no active branch protection yet.
3. Apply the [production ruleset](RULESET_SETUP.md) to `infra/coolify-russian-vps` in GitHub Settings → Rules → Rulesets. Required checks and PR rules are in [the exact JSON](../config/github-production-ruleset.json). Optionally protect `main` with a separate rule. CODEOWNERS and a JSON file alone do **not** enforce protection.
4. Set Coolify deployment on push **OFF**; never merge or deploy from a failed CI.

## Reproducibility
A real `pnpm-lock.yaml` was adapted from the current DGI workspace lockfile (source Git blob `3655b8c15e9910da5e118f0bef003b696e9e902f`) by keeping all original package resolutions and integrity hashes while restricting the single importer to the consumer package's matching dependency specifiers. CI and Docker now use `pnpm install --frozen-lockfile`. This **must pass an actual runner installation** before release; the source provenance does not replace a build check.
