"""Network-free Coolify bootstrap tests: no actual VPS calls or token handling."""
from __future__ import annotations

import contextlib
import importlib.util
import io
import json
from pathlib import Path
import unittest
from unittest.mock import patch
from urllib.parse import urlparse


SOURCE = Path(__file__).resolve().parents[1] / "bootstrap-coolify-once.py"
spec = importlib.util.spec_from_file_location("bootstrap_coolify_once", SOURCE)
bootstrap = importlib.util.module_from_spec(spec)
assert spec and spec.loader
spec.loader.exec_module(bootstrap)


class Response:
    def __init__(self, data):
        self.data = json.dumps(data).encode("utf-8")

    def __enter__(self):
        return self

    def __exit__(self, *_args):
        return False

    def read(self):
        return self.data


class FakeCoolify:
    def __init__(self):
        self.calls = []
        self.projects = []
        self.servers = [{"name": "localhost", "uuid": "srv-1"}]
        self.apps = []
        self.envs = []
        self.environments = []

    def handle(self, request, timeout=40):
        method, path = request.get_method(), urlparse(request.full_url).path
        assert path.startswith("/api/v1/")
        path = path[len("/api/v1"):]
        body = json.loads(request.data) if request.data else {}
        self.calls.append((method, path, body))
        if (method, path) == ("GET", "/teams/current"):
            return Response({"name": "Root Team"})
        if (method, path) == ("GET", "/projects"):
            return Response(self.projects)
        if (method, path) == ("GET", "/servers"):
            return Response(self.servers)
        if (method, path) == ("GET", "/applications"):
            return Response(self.apps)
        if (method, path) == ("POST", "/projects"):
            obj = dict(body, uuid="project-1")
            self.projects.append(obj)
            return Response({"uuid": "project-1"})
        if (method, path) == ("GET", "/projects/project-1/environments"):
            return Response(self.environments)
        if (method, path) == ("POST", "/projects/project-1/environments"):
            self.environments.append(dict(body, uuid="env-1"))
            return Response({"uuid": "env-1"})
        if (method, path) == ("POST", "/applications/public"):
            obj = dict(body, uuid="app-1", fqdn="")
            self.apps.append(obj)
            return Response({"uuid": "app-1"})
        if (method, path) == ("PATCH", "/applications/app-1"):
            self.apps[0].update(body)
            return Response({"uuid": "app-1"})
        if (method, path) == ("GET", "/applications/app-1"):
            return Response(self.apps[0])
        if (method, path) == ("GET", "/applications/app-1/envs"):
            return Response(self.envs)
        if (method, path) == ("POST", "/applications/app-1/envs"):
            self.envs.append(dict(body, uuid="env-" + str(len(self.envs) + 1)))
            return Response({"uuid": self.envs[-1]["uuid"]})
        raise AssertionError(f"Unexpected request: {method} {path}")


class BootstrapTests(unittest.TestCase):
    def run_bootstrap(self, backend):
        sink = io.StringIO()
        with patch.object(bootstrap.urllib.request, "urlopen", backend.handle), \
             patch.object(bootstrap.getpass, "getpass", return_value="test-token"), \
             contextlib.redirect_stdout(sink):
            bootstrap.main()
        return sink.getvalue()

    def test_new_app_registered_without_deploy_or_domain(self):
        backend = FakeCoolify()
        output = self.run_bootstrap(backend)
        self.assertIn("SUCCESS:", output)
        self.assertEqual(len(backend.projects), 1)
        self.assertEqual(len(backend.apps), 1)
        app = backend.apps[0]
        self.assertEqual(app["git_branch"], "infra/coolify-russian-vps")
        self.assertEqual(app["dockerfile_location"], "/Dockerfile.coolify")
        self.assertEqual(app["is_auto_deploy_enabled"], False)
        self.assertEqual(app["instant_deploy"], False)
        self.assertEqual(app["domains"], "")
        self.assertEqual({x["key"]: x["value"] for x in backend.envs}, {
            "SITE_CUTOVER": "false", "SITE_RELEASE_APPROVED": "no", "PORT": "3000"
        })
        self.assertFalse(any("deploy" in path or "/start" in path for _, path, _ in backend.calls))

    def test_conflicting_app_is_never_modified(self):
        backend = FakeCoolify()
        backend.apps = [{
            "name": "consumer-web", "uuid": "app-1",
            "git_repository": "https://github.com/other/wrong",
            "git_branch": "main", "build_pack": "dockerfile",
            "is_auto_deploy_enabled": False, "fqdn": ""
        }]
        with self.assertRaises(bootstrap.SetupError):
            self.run_bootstrap(backend)
        self.assertTrue(all(method == "GET" for method, _, _ in backend.calls))

    def test_matching_app_is_read_only(self):
        backend = FakeCoolify()
        backend.apps = [{
            "name": "consumer-web", "uuid": "app-1",
            "git_repository": bootstrap.REPOSITORY,
            "git_branch": bootstrap.BRANCH, "build_pack": "dockerfile",
            "dockerfile_location": bootstrap.DOCKERFILE,
            "is_auto_deploy_enabled": False, "fqdn": "", "domains": ""
        }]
        output = self.run_bootstrap(backend)
        self.assertIn("already registered", output)
        self.assertTrue(all(method == "GET" for method, _, _ in backend.calls))

    def test_missing_server_aborts_before_creating_anything(self):
        backend = FakeCoolify()
        backend.servers = []
        with self.assertRaises(bootstrap.SetupError):
            self.run_bootstrap(backend)
        self.assertTrue(all(method == "GET" for method, _, _ in backend.calls))


if __name__ == "__main__":
    unittest.main()
