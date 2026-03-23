#!/usr/bin/env python3
"""Add a Firebase Hosting custom domain via the Hosting REST API (no Firebase Console UI).

Uses Application Default Credentials from the active gcloud user:
  gcloud auth login
  gcloud config set project YOUR_PROJECT_ID

API reference:
  https://firebase.google.com/docs/reference/hosting/rest/v1beta1/projects.sites.customDomains/create

After this script runs, add the DNS records shown under requiredDnsUpdates in Cloud DNS
(or your registrar). SSL is provisioned by Firebase once DNS is correct.

Example:
  ./scripts/hosting-custom-domain-api.py --domain ks.forgesdlc.com
  ./scripts/hosting-custom-domain-api.py --project my-firebase-project --site my-firebase-project \\
      --domain ks.forgesdlc.com --enable-apis
"""
from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

API_BASE = "https://firebasehosting.googleapis.com/v1beta1"


def _token() -> str:
    return subprocess.check_output(
        ["gcloud", "auth", "print-access-token"],
        text=True,
    ).strip()


def _request(method: str, url: str, token: str, body: dict | None = None) -> dict:
    data = None
    headers = {"Authorization": f"Bearer {token}"}
    if body is not None:
        data = json.dumps(body).encode("utf-8")
        headers["Content-Type"] = "application/json"
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            raw = resp.read().decode()
            return json.loads(raw) if raw else {}
    except urllib.error.HTTPError as e:
        err_body = e.read().decode(errors="replace")
        raise RuntimeError(f"HTTP {e.code} {e.reason}: {err_body}") from e


def _poll_operation(operation_name: str, token: str, timeout_s: int) -> dict:
    # LRO name is a single path segment: encode "/" only (Google API convention).
    url = f"{API_BASE}/{operation_name.replace('/', '%2F')}"
    deadline = time.monotonic() + timeout_s
    while time.monotonic() < deadline:
        op = _request("GET", url, token)
        if op.get("done"):
            if op.get("error"):
                raise RuntimeError(json.dumps(op["error"], indent=2))
            return op
        time.sleep(3)
    raise TimeoutError(f"Operation did not finish within {timeout_s}s: {operation_name}")


def _enable_apis(project: str) -> None:
    subprocess.run(
        [
            "gcloud",
            "services",
            "enable",
            "firebasehosting.googleapis.com",
            f"--project={project}",
        ],
        check=True,
    )


def _get_custom_domain(parent: str, domain_id: str, token: str) -> dict:
    url = f"{API_BASE}/{parent}/customDomains/{domain_id}"
    return _request("GET", url, token)


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument(
        "--project",
        default=os.environ.get("GOOGLE_CLOUD_PROJECT")
        or os.environ.get("FIREBASE_PROJECT_ID")
        or os.environ.get("GCLOUD_PROJECT"),
        help="Firebase / GCP project id (default: $GOOGLE_CLOUD_PROJECT)",
    )
    ap.add_argument(
        "--site",
        default=None,
        help="Hosting site id (default: same as --project)",
    )
    ap.add_argument(
        "--domain",
        default="ks.forgesdlc.com",
        help="Hostname to attach (e.g. ks.forgesdlc.com)",
    )
    ap.add_argument(
        "--enable-apis",
        action="store_true",
        help="Run: gcloud services enable firebasehosting.googleapis.com",
    )
    ap.add_argument(
        "--timeout",
        type=int,
        default=600,
        help="Seconds to wait for long-running operations (default: 600)",
    )
    args = ap.parse_args()

    if not args.project:
        print(
            "Set --project or GOOGLE_CLOUD_PROJECT / FIREBASE_PROJECT_ID.",
            file=sys.stderr,
        )
        return 1

    site = args.site or args.project
    token = _token()

    if args.enable_apis:
        print("[hosting-api] Enabling firebasehosting.googleapis.com ...")
        _enable_apis(args.project)

    parent = f"projects/{args.project}/sites/{site}"
    q = urllib.parse.urlencode({"customDomainId": args.domain})
    create_url = f"{API_BASE}/{parent}/customDomains?{q}"

    print(f"[hosting-api] POST customDomains (domain={args.domain}, site={site}) ...")
    try:
        op_or_resource = _request("POST", create_url, token, {})
    except RuntimeError as e:
        msg = str(e)
        if "409" in msg or "already exists" in msg.lower():
            print(
                "[hosting-api] Domain already registered; fetching current resource ...",
                file=sys.stderr,
            )
            resource = _get_custom_domain(parent, args.domain, token)
        else:
            raise
    else:
        op_name = op_or_resource.get("name")
        if not op_name:
            print(json.dumps(op_or_resource, indent=2))
            raise SystemExit("Unexpected response (no operation name).")

        print(f"[hosting-api] Waiting for operation ... ({op_name})")
        _poll_operation(op_name, token, args.timeout)
        resource = _get_custom_domain(parent, args.domain, token)

    print()
    print("=== Custom domain resource (summary) ===")
    print(json.dumps(resource, indent=2))
    print()
    print("=== DNS: apply records from requiredDnsUpdates.desired in Cloud DNS ===")
    updates = resource.get("requiredDnsUpdates") or {}
    desired = updates.get("desired") or []
    if not desired:
        print(
            "(No desired records yet - wait a few minutes and run this script again, "
            "or inspect the JSON above.)"
        )
    for rs in desired:
        d = rs.get("domainName", "")
        for rec in rs.get("records") or []:
            print(
                f"  {d}  {rec.get('type')}  {rec.get('rdata')!r}  "
                f"action={rec.get('requiredAction')}"
            )

    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (RuntimeError, TimeoutError, subprocess.CalledProcessError) as e:
        print(str(e), file=sys.stderr)
        raise SystemExit(1)
