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
Generate and commit `pnpm-lock.yaml` via `pnpm install` on a machine with official registry access. Until that file exists, dependency installation is not frozen and a green build cannot be treated as an immutable, reproducible release.
