#!/usr/bin/env python3
"""Offline regression checks for consumer-web's isolated Coolify build behavior.

These tests do not establish VPS reachability or the state of Coolify's queue.
"""
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


class CoolifyBuildResilienceTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.dockerfile = (ROOT / "Dockerfile.coolify").read_text(encoding="utf-8")

    def test_isolated_npm_and_pnpm_buildkit_caches(self):
        self.assertIn("id=consumer-rights-npm-cache", self.dockerfile)
        self.assertIn("target=/root/.npm,sharing=locked", self.dockerfile)
        self.assertIn("id=consumer-rights-pnpm-store", self.dockerfile)
        self.assertIn("target=/pnpm/store,sharing=locked", self.dockerfile)

    def test_bootstrap_pinned_and_network_retries_bounded(self):
        self.assertIn("npm install -g pnpm@10.0.0", self.dockerfile)
        self.assertGreaterEqual(self.dockerfile.count("--fetch-retries=4"), 2)
        self.assertGreaterEqual(self.dockerfile.count("--fetch-timeout=90000"), 2)
        self.assertIn("timeout -s TERM -k 10s 600s", self.dockerfile)
        self.assertIn("timeout -s TERM -k 10s 900s", self.dockerfile)

    def test_runtime_healthcheck_and_release_gates_unchanged(self):
        self.assertIn("FROM node:22-bookworm-slim AS runner", self.dockerfile)
        self.assertIn('EXPOSE 3000', self.dockerfile)
        self.assertIn('CMD ["node", "server.js"]', self.dockerfile)
        self.assertNotIn("SITE_CUTOVER=true", self.dockerfile)
        self.assertNotIn("SITE_RELEASE_APPROVED=yes", self.dockerfile)


if __name__ == "__main__":
    unittest.main()
