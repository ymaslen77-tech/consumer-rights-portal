# GitHub production protection: exact owner action

The repository is **public** as of 30 October 2026, so its Free-plan public-repository branch rulesets can be enabled. The checked-in JSON is a **proposed API payload**, **not** an already applied ruleset.

## Match DGI production pattern

Open [Consumer rights repository settings](https://github.com/ymaslen77-tech/consumer-rights-portal/settings/rules) → **Rulesets** → **New ruleset** → **New branch ruleset**.

- Ruleset name: `Consumer Rights - Production Protection`; enforcement: **Active**.
- Target branch: **Include by pattern** `infra/coolify-russian-vps` (not `main` or a development branch).
- Enable **Restrict deletions**, **Block force pushes**, and **Require a pull request before merging**.
- Approvals: `0`, as in current DGI ruleset. Do not rely on a review count to prevent self-merge; ensure status checks are mandatory.
- Enable **Require status checks to pass** and enter exactly:
  - `content-checks`
  - `web-checks`
  - `approval-policy`
  - `docker-build-check`
- GitHub Actions is the intended check issuer. Do not allow bypass actors. Save the ruleset, then re-open it and confirm **Active**.

Equivalent API request payload is stored in [config/github-production-ruleset.json](../config/github-production-ruleset.json). Using it via GitHub REST requires an independently authorized administrator tool; the current connector has no create-ruleset action.

## Before merging PR #1

1. Check [GitHub Actions](https://github.com/ymaslen77-tech/consumer-rights-portal/actions): four job names on the **final** SHA must be **success**. Queued or cancelled jobs are not green.
2. Resolve any runner/account limitations. Earlier failures had empty step logs; likely runner provisioning or account policy, not yet proven application code failures.
3. Generate **real** `pnpm-lock.yaml` using official registry; lock dependencies and change both Docker and CI to frozen-lockfile installs. No fabricated lockfile.
4. Keep [PR #1](https://github.com/ymaslen77-tech/consumer-rights-portal/pull/1) as Draft until all requirements pass. The protected branch currently contains README only.
5. Coolify remains **manual deploy only**. Never copy DGI app UUID/DB/secrets.

This document is a technical checklist, not an assertion of production safety.
