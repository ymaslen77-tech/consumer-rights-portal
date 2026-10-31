# One-time registration of the Consumer Rights application in Coolify

This is **not a deployment**. The Python 3 script [bootstrap-coolify-once.py](../scripts/bootstrap-coolify-once.py) uses the existing Coolify API to register only the isolated project and application.

## Preconditions

- Log into Coolify as an owner/admin of **Root Team**.
- Open **Keys & Tokens → API Tokens**. Create a temporary token named `consumer-rights-one-time-registration`.
- Select permissions **read** and **write** only. No `root`, `deploy`, or `read:sensitive` required. Select the shortest convenient expiration and revoke the token after the script succeeds.
- Copy the token, but **never paste it into GitHub, ChatGPT or a shared screenshot**.
- Coolify **Settings → Advanced → API access: Enabled** (already verified).
- Use **Terminal → server localhost**, not any running application container.

## Run

Download the script from an immutable audited Git commit (use the pinned command supplied after the PR is merged) and run with Python 3. The script prompts for the API token using masked terminal input and holds it only in memory. It uses Python standard library; nothing needs to be installed.

## What it does

1. Calls `GET /teams/current` and inventories projects, apps and server `localhost`.
2. Rejects name collisions and does **not** change existing projects/apps other than reusing an existing project with the exact target name.
3. Creates `consumer-rights-portal` project if missing and ensures the `production` environment exists.
4. Registers **public** GitHub repository `ymaslen77-tech/consumer-rights-portal` into independent application `consumer-web` on `infra/coolify-russian-vps`.
5. Sets `dockerfile` build pack, `/Dockerfile.coolify`, port 3000, health path `/api/health`.
6. Explicitly disables **Auto Deploy**, preview deployments, instant deploy, domain autogeneration; leaves domain blank.
7. Creates non-secret envs `SITE_CUTOVER=false`, `SITE_RELEASE_APPROVED=no`, `PORT=3000`. Intentionally leaves `SITE_URL` and `PUBLIC_RELEASE_HOST` unset.
8. Reads back configuration to confirm expected repository, branch and no publishing.

## What it never does

- Never deploys or starts anything.
- Never creates a domain, database or shared secret.
- Never changes DGI, Courts or Pravopoisk.
- Never writes the token to disk or logs.
- Never makes a root API request or disables IP allowlists.

**Important:** This only makes the target app available for future manual **Deploy**. The consumer portal is an initial prototype; production/public launch, DNS and legal-content approval remain separate decisions.

On non-success, read the safe error message in the terminal and **do not manually guess IDs or retry with broader privileges**. Re-run after the problem is understood. Existing matching app is treated read-only.
