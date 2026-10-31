#!/usr/bin/env python3
"""One-time, manual-only Coolify project + app registration for Consumer Rights.

Run inside the Coolify SERVER terminal. Requires a short-lived team API token
with read+write rights; no deploy/root permissions required. Never sends a token
to GitHub, never stores it on disk, never changes other named applications.
"""
from __future__ import annotations

import getpass
import json
import sys
import urllib.error
import urllib.request
from typing import Any

API = "https://coolify.dgi-pravo.ru/api/v1"
PROJECT = "consumer-rights-portal"
APPLICATION = "consumer-web"
SERVER = "localhost"
REPOSITORY = "https://github.com/ymaslen77-tech/consumer-rights-portal"
BRANCH = "infra/coolify-russian-vps"
DOCKERFILE = "/Dockerfile.coolify"
RELEASE_FLAGS = {
    "SITE_CUTOVER": "false",
    "SITE_RELEASE_APPROVED": "no",
    "PORT": "3000",
}


class SetupError(Exception):
    """Safe error that does not expose credentials."""


def require(condition: bool, message: str) -> None:
    if not condition:
        raise SetupError(message)


def api(method: str, path: str, token: str, data: dict[str, Any] | None = None) -> Any:
    payload = json.dumps(data).encode("utf-8") if data is not None else None
    request = urllib.request.Request(
        API + path,
        data=payload,
        method=method,
        headers={
            "Authorization": "Bearer " + token,
            "Accept": "application/json",
            **({"Content-Type": "application/json"} if payload is not None else {}),
        },
    )
    try:
        with urllib.request.urlopen(request, timeout=40) as response:
            raw = response.read()
            return json.loads(raw) if raw else {}
    except urllib.error.HTTPError as error:
        # The response body contains Coolify validation errors; never log headers.
        info = error.read(1200).decode("utf-8", "replace")
        raise SetupError(f"Coolify {method} {path}: HTTP {error.code}; {info}") from None
    except urllib.error.URLError as error:
        raise SetupError(f"Connection to Coolify failed: {error.reason}") from None
    except (ValueError, json.JSONDecodeError) as error:
        raise SetupError(f"Invalid JSON returned by Coolify on {method} {path}: {error}") from None


def single_named(items: Any, name: str, noun: str) -> dict[str, Any] | None:
    require(isinstance(items, list), f"Unexpected Coolify response for {noun}s")
    matches = [item for item in items if isinstance(item, dict) and item.get("name") == name]
    require(len(matches) <= 1, f"More than one {noun} named '{name}'; refusing to guess")
    return matches[0] if matches else None


def app_is_safe(app: dict[str, Any]) -> bool:
    return (
        app.get("name") == APPLICATION
        and app.get("git_repository") == REPOSITORY
        and app.get("git_branch") == BRANCH
        and app.get("build_pack") == "dockerfile"
        and app.get("dockerfile_location") == DOCKERFILE
        and app.get("is_auto_deploy_enabled") in (False, 0)
        and not (app.get("fqdn") or app.get("domains"))
    )


def main() -> None:
    print("Consumer Rights / Coolify one-time bootstrap")
    print("Target:", API)
    print("Creates only the separate consumer-rights-portal / consumer-web.")
    print("No Deploy, no domain, no changes to DGI/Courts/Pravopoisk.\n")
    try:
        token = getpass.getpass("Paste the temporary Coolify API token (hidden): ").strip()
    except (EOFError, KeyboardInterrupt):
        raise SetupError("Token input cancelled") from None
    require(bool(token), "No token provided")
    # Validate token permissions and correct team before any write.
    team = api("GET", "/teams/current", token)
    require(isinstance(team, dict), "Could not identify the token's Coolify team")
    print("Authenticated to Coolify team:", team.get("name", "(name unavailable)"))

    projects = api("GET", "/projects", token)
    servers = api("GET", "/servers", token)
    apps = api("GET", "/applications", token)
    server = single_named(servers, SERVER, "server")
    require(server is not None, f"Server {SERVER!r} was not found in this Coolify team")
    server_uuid = server.get("uuid")
    require(isinstance(server_uuid, str) and server_uuid, "Server UUID missing")
    print("Target server:", SERVER, server_uuid)

    # The most important fail-closed check: never take over an unrelated app.
    existing_app = single_named(apps, APPLICATION, "application")
    if existing_app is not None:
        uuid = existing_app.get("uuid")
        require(isinstance(uuid, str) and uuid, "Existing app has no UUID")
        full = api("GET", "/applications/" + uuid, token)
        require(isinstance(full, dict) and app_is_safe(full),
                "An app named consumer-web exists, but its configuration is different. "
                "Stopped without changing it.")
        print("App already registered and safe:", uuid)
        print("No changes made. Auto Deploy OFF; no domain.")
        return

    existing_project = single_named(projects, PROJECT, "project")
    if existing_project is None:
        print("Creating independent project:", PROJECT)
        existing_project = api("POST", "/projects", token, {
            "name": PROJECT,
            "description": "Consumer rights legal portal (separate from DGI).",
        })
    project_uuid = existing_project.get("uuid") if isinstance(existing_project, dict) else None
    require(isinstance(project_uuid, str) and project_uuid, "Project UUID missing")
    print("Project UUID:", project_uuid)

    # Coolify normally creates 'production' automatically; verify before using it.
    environments = api("GET", "/projects/" + project_uuid + "/environments", token)
    require(isinstance(environments, list), "Could not read project environments")
    matches = [e for e in environments if isinstance(e, dict) and e.get("name") == "production"]
    require(len(matches) <= 1, "Duplicate production environments; refusing to proceed")
    if not matches:
        print("Creating project environment: production")
        api("POST", "/projects/" + project_uuid + "/environments", token, {"name": "production"})

    print("Registering application from the public GitHub repository (NO DEPLOY)")
    result = api("POST", "/applications/public", token, {
        "project_uuid": project_uuid,
        "server_uuid": server_uuid,
        "environment_name": "production",
        "git_repository": REPOSITORY,
        "git_branch": BRANCH,
        "build_pack": "dockerfile",
        "dockerfile_location": DOCKERFILE,
        "base_directory": "/",
        "ports_exposes": "3000",
        "name": APPLICATION,
        "description": "Consumer rights portal; manual deployments only.",
        "is_auto_deploy_enabled": False,
        "is_preview_deployments_enabled": False,
        "instant_deploy": False,
        "autogenerate_domain": False,
        "domains": "",
        "health_check_enabled": True,
        "health_check_path": "/api/health",
        "health_check_port": "3000",
        "health_check_method": "GET",
        "health_check_return_code": 200,
    })
    uuid = result.get("uuid") if isinstance(result, dict) else None
    require(isinstance(uuid, str) and uuid, "App creation did not return an UUID; inspect Coolify.")

    # Enforce safe settings once again in the API; no deployment command is used.
    api("PATCH", "/applications/" + uuid, token, {
        "git_repository": REPOSITORY,
        "git_branch": BRANCH,
        "build_pack": "dockerfile",
        "dockerfile_location": DOCKERFILE,
        "ports_exposes": "3000",
        "is_auto_deploy_enabled": False,
        "is_preview_deployments_enabled": False,
        "instant_deploy": False,
        "autogenerate_domain": False,
        "domains": "",
        "health_check_enabled": True,
        "health_check_path": "/api/health",
        "health_check_port": "3000",
        "health_check_method": "GET",
        "health_check_return_code": 200,
    })

    print("Creating release-safe environment variables")
    current_envs = api("GET", "/applications/" + uuid + "/envs", token)
    require(isinstance(current_envs, list), "Could not verify app envs")
    known = {e.get("key") for e in current_envs if isinstance(e, dict)}
    for key, value in RELEASE_FLAGS.items():
        if key not in known:
            api("POST", "/applications/" + uuid + "/envs", token, {
                "key": key,
                "value": value,
                "is_preview": False,
                "is_literal": True,
            })

    full = api("GET", "/applications/" + uuid, token)
    require(isinstance(full, dict) and app_is_safe(full),
            "Application was created but security/source verification failed; inspect it "
            "in Coolify before any deployment.")
    print("\nSUCCESS: Coolify application is registered.")
    print("Application UUID:", uuid)
    print("Project:", PROJECT, "| branch:", BRANCH, "| Dockerfile:", DOCKERFILE)
    print("Port: 3000 | Auto Deploy: OFF | Domain: NONE | Deploy: NOT STARTED")
    print("Open Coolify > Projects > consumer-rights-portal > production > consumer-web")
    print("After verification, revoke the temporary API token in Coolify.")


if __name__ == "__main__":
    try:
        main()
    except SetupError as err:
        print("\nSTOPPED:", err, file=sys.stderr)
        print("No deployment was started. Review the message before retrying.", file=sys.stderr)
        sys.exit(1)
