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
2. GitHub private repository rulesets/branch protection are not available on GitHub Free. GitHub Pro/Team unlocks them; **do not change visibility to public without consent**.
3. Once available, create branch ruleset for `infra/coolify-russian-vps`: require Pull Request, required checks above, block force pushes and deletions, and require latest-head checks. Protect `main` as well. CODEOWNERS exists but isn't enforcement by itself.
4. Set Coolify deployment on push **OFF**; never merge or deploy from a failed CI.

## Reproducibility
Generate and commit `pnpm-lock.yaml` via `pnpm install` on a machine with official registry access. Until that file exists, dependency installation is not frozen and a green build cannot be treated as an immutable, reproducible release.
