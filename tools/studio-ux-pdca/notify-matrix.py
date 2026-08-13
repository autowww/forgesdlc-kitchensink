#!/usr/bin/env python3
"""Matrix notifications for Studio UX PDCA — login, room resolve, image upload."""

from __future__ import annotations

import argparse
import asyncio
import json
import mimetypes
import os
import sys
from pathlib import Path
from typing import Any

try:
    from nio import (
        AsyncClient,
        AsyncClientConfig,
        JoinError,
        LoginError,
        UploadError,
    )
except ImportError:
    AsyncClient = None  # type: ignore


def _load_json(path: Path) -> dict:
    if not path.exists():
        return {}
    return json.loads(path.read_text(encoding="utf-8"))


def _matrix_config() -> tuple[str, str, str, str, str]:
    homeserver = os.environ.get("MATRIX_HOMESERVER", "https://matrix.forgedc.net").rstrip("/")
    token = os.environ.get("MATRIX_ACCESS_TOKEN", "")
    user = os.environ.get("MATRIX_USER", "")
    password = os.environ.get("MATRIX_PASSWORD", "")
    room = (
        os.environ.get("FM_STUDIO_UX_MATRIX_ROOM_ID")
        or os.environ.get("MATRIX_CURSOR_ROOM")
        or os.environ.get("MATRIX_OPS_ROOM")
        or "#cursor-plain:matrix.forgedc.net"
    )
    return homeserver, token, user, password, room


def _build_cycle_message(consumer_id: str, page_slug: str, iteration: int, cycle_dir: Path) -> str:
    scores = _load_json(cycle_dir / "scores.json")
    gates = _load_json(cycle_dir / "gates.json")
    summary = (
        (cycle_dir / "changes-summary.md").read_text(encoding="utf-8").strip()
        if (cycle_dir / "changes-summary.md").exists()
        else ""
    )
    before = scores.get("before", {}).get("overall", "?")
    after = scores.get("after", {}).get("overall", "?")
    tests = []
    if gates.get("gates", {}).get("pytest_ok"):
        tests.append("pytest OK")
    if gates.get("gates", {}).get("playwright_ok"):
        tests.append("playwright OK")
    test_line = ", ".join(tests) if tests else "tests pending"
    return (
        f"[{consumer_id} Studio UX] page={page_slug} iter={iteration}\n"
        f"Scores: {before}→{after}\n"
        f"Changes: {summary[:400] or '(see workbench)'}\n"
        f"Tests: {test_line}\n"
        f"Log: {cycle_dir}"
    )


def _build_start_message(
    *,
    consumer_id: str,
    page_slug: str,
    page_title: str,
    page_path: str,
    purpose: str,
    campaign_id: str,
    cycle_dir: Path,
) -> str:
    return (
        f"[{consumer_id} Studio UX] cycle started\n"
        f"Campaign: {campaign_id}\n"
        f"Page: {page_slug} — {page_title}\n"
        f"Route: {page_path}\n"
        f"Purpose: {purpose}\n"
        f"Workbench: {cycle_dir}"
    )


async def _ensure_client() -> tuple[Any, str]:
    if AsyncClient is None:
        raise RuntimeError("matrix-nio not installed")
    homeserver, token, user, password, room = _matrix_config()
    client = AsyncClient(
        homeserver,
        user or "",
        config=AsyncClientConfig(encryption_enabled=False),
    )
    if token:
        client.access_token = token
    elif user and password:
        login = await client.login(password)
        if isinstance(login, LoginError):
            raise RuntimeError(f"Matrix login failed: {login}")
    else:
        raise RuntimeError("Set MATRIX_ACCESS_TOKEN or MATRIX_USER + MATRIX_PASSWORD")

    room_id = room
    if room.startswith("#"):
        join = await client.join(room)
        if isinstance(join, JoinError):
            for rid, r in client.rooms.items():
                alias = (r.canonical_alias or "").lower()
                if alias == room.lower():
                    room_id = rid
                    break
            else:
                raise RuntimeError(f"Could not join room {room}: {join}")
        else:
            room_id = join.room_id
    return client, room_id


async def _send_text(client: Any, room_id: str, body: str) -> None:
    await client.room_send(room_id, "m.room.message", {"msgtype": "m.text", "body": body})


async def _send_image(client: Any, room_id: str, image_path: Path) -> None:
    if not image_path.exists():
        return
    mime, _ = mimetypes.guess_type(str(image_path))
    mime = mime or "image/png"
    data = image_path.read_bytes()
    resp, _ = await client.upload(
        lambda *_a, **_k: data,
        content_type=mime,
        filename=image_path.name,
        encrypt=False,
    )
    if isinstance(resp, UploadError):
        await _send_text(client, room_id, f"(screenshot upload failed: {image_path})")
        return
    content = {
        "msgtype": "m.image",
        "body": image_path.name,
        "url": resp.content_uri,
        "info": {"mimetype": mime},
    }
    await client.room_send(room_id, "m.room.message", content)


async def _notify_async(
    *,
    event: str,
    cycle_dir: Path,
    consumer_id: str,
    page_slug: str,
    iteration: int,
    page_title: str = "",
    page_path: str = "",
    purpose: str = "",
    campaign_id: str = "",
) -> dict:
    try:
        client, room_id = await _ensure_client()
    except Exception as exc:
        body = f"Matrix notify failed: {exc}"
        print(f"[studio-ux-notify] {body}", file=sys.stderr)
        return {"notified": False, "reason": str(exc)}

    try:
        if event == "cycle-start":
            body = _build_start_message(
                consumer_id=consumer_id,
                page_slug=page_slug,
                page_title=page_title,
                page_path=page_path,
                purpose=purpose,
                campaign_id=campaign_id,
                cycle_dir=cycle_dir,
            )
        else:
            body = _build_cycle_message(consumer_id, page_slug, iteration, cycle_dir)

        await _send_text(client, room_id, body)
        shot = cycle_dir / "before.png"
        if event == "cycle-start" and shot.exists():
            await _send_image(client, room_id, shot)
        elif event == "cycle-complete":
            for name in ("before.png", "after.png"):
                img = cycle_dir / name
                if img.exists():
                    await _send_image(client, room_id, img)
        return {"notified": True, "room_id": room_id, "event": event, "body": body}
    finally:
        await client.close()


def notify_cycle_start(
    *,
    cycle_dir: Path,
    consumer_id: str,
    page_slug: str,
    page_title: str,
    page_path: str,
    purpose: str,
    campaign_id: str,
) -> dict:
    return asyncio.run(
        _notify_async(
            event="cycle-start",
            cycle_dir=cycle_dir,
            consumer_id=consumer_id,
            page_slug=page_slug,
            iteration=1,
            page_title=page_title,
            page_path=page_path,
            purpose=purpose,
            campaign_id=campaign_id,
        )
    )


def notify(cycle_dir: Path, consumer_id: str, page_slug: str, iteration: int, room_id: str = "") -> dict:
    if room_id:
        os.environ["FM_STUDIO_UX_MATRIX_ROOM_ID"] = room_id
    return asyncio.run(
        _notify_async(
            event="cycle-complete",
            cycle_dir=cycle_dir,
            consumer_id=consumer_id,
            page_slug=page_slug,
            iteration=iteration,
        )
    )


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--event", choices=["cycle-start", "cycle-complete"], default="cycle-complete")
    ap.add_argument("--cycle-dir", type=Path, required=True)
    ap.add_argument("--consumer-id", required=True)
    ap.add_argument("--page-slug", required=True)
    ap.add_argument("--iteration", type=int, default=1)
    ap.add_argument("--page-title", default="")
    ap.add_argument("--page-path", default="")
    ap.add_argument("--purpose", default="")
    ap.add_argument("--campaign-id", default="")
    ap.add_argument("--matrix-room-id", default="")
    args = ap.parse_args()
    if args.matrix_room_id:
        os.environ["FM_STUDIO_UX_MATRIX_ROOM_ID"] = args.matrix_room_id
    if args.event == "cycle-start":
        result = notify_cycle_start(
            cycle_dir=args.cycle_dir,
            consumer_id=args.consumer_id,
            page_slug=args.page_slug,
            page_title=args.page_title,
            page_path=args.page_path,
            purpose=args.purpose,
            campaign_id=args.campaign_id,
        )
    else:
        result = notify(args.cycle_dir, args.consumer_id, args.page_slug, args.iteration, args.matrix_room_id)
    print(json.dumps(result))
    return 0 if result.get("notified") else 1


if __name__ == "__main__":
    raise SystemExit(main())
