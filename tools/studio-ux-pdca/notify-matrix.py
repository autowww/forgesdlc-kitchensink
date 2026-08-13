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

_LIB = Path(__file__).resolve().parent / "lib"
if str(_LIB) not in sys.path:
    sys.path.insert(0, str(_LIB))

from matrix_messages import (  # noqa: E402
    build_campaign_message,
    build_complete_message,
    build_progress_message,
    build_start_message,
    image_label,
    matrix_message_content,
    short_cycle_ref,
)

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


THREAD_FILE = "matrix-thread.json"


def _matrix_config() -> tuple[str, str, str, str, str]:
    homeserver = os.environ.get("MATRIX_HOMESERVER", "https://matrix.forgedc.net").rstrip("/")
    token = os.environ.get("MATRIX_ACCESS_TOKEN", "")
    user = os.environ.get("MATRIX_USER", "")
    password = os.environ.get("MATRIX_PASSWORD", "")
    room = (
        os.environ.get("FM_STUDIO_UX_MATRIX_ROOM_ID")
        or os.environ.get("MATRIX_STUDIO_UX_ROOM")
        or os.environ.get("MATRIX_CURSOR_ROOM")
        or os.environ.get("MATRIX_OPS_ROOM")
        or "#studio-ux:matrix.forgedc.net"
    )
    return homeserver, token, user, password, room


def _thread_path(cycle_dir: Path) -> Path:
    return cycle_dir / THREAD_FILE


def _campaign_thread_path(cycle_dir: Path) -> Path:
    # cycle_dir = .../pages/<slug>/iter-NNN → campaign root is parents[2]
    try:
        if cycle_dir.parent.name and cycle_dir.parents[1].name == "pages":
            return cycle_dir.parents[2] / THREAD_FILE
    except IndexError:
        pass
    return cycle_dir / THREAD_FILE


def _load_thread_event(cycle_dir: Path) -> str:
    for path in (_thread_path(cycle_dir), _campaign_thread_path(cycle_dir)):
        if not path.exists():
            continue
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            continue
        event_id = data.get("event_id") or data.get("root_event_id")
        if event_id:
            return str(event_id)
    return ""


def _save_thread_event(cycle_dir: Path, event_id: str, *, also_campaign: bool = False) -> None:
    payload = {"event_id": event_id, "ref": short_cycle_ref(cycle_dir)}
    _thread_path(cycle_dir).write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    if also_campaign:
        camp = _campaign_thread_path(cycle_dir)
        if camp != _thread_path(cycle_dir):
            camp.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")


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


def _with_thread(content: dict[str, Any], thread_root: str) -> dict[str, Any]:
    if not thread_root:
        return content
    relates = dict(content.get("m.relates_to") or {})
    relates["rel_type"] = "m.thread"
    relates["event_id"] = thread_root
    # Element shows the reply in-thread when is_falling_back is set with in_reply_to.
    relates["is_falling_back"] = True
    relates["m.in_reply_to"] = {"event_id": thread_root}
    content = {**content, "m.relates_to": relates}
    return content


async def _send_content(client: Any, room_id: str, content: dict[str, Any]) -> str:
    resp = await client.room_send(room_id, "m.room.message", content)
    event_id = getattr(resp, "event_id", None) or ""
    return str(event_id)


async def _send_text(
    client: Any,
    room_id: str,
    body: str,
    *,
    msgtype: str = "m.text",
    thread_root: str = "",
) -> str:
    content = matrix_message_content(body, msgtype=msgtype)
    content = _with_thread(content, thread_root)
    return await _send_content(client, room_id, content)


async def _send_image(
    client: Any,
    room_id: str,
    image_path: Path,
    *,
    label: str,
    thread_root: str = "",
) -> None:
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
        await _send_text(
            client,
            room_id,
            f"(screenshot upload failed: {label})",
            thread_root=thread_root,
        )
        return
    content: dict[str, Any] = {
        "msgtype": "m.image",
        "body": label,
        "url": resp.content_uri,
        "info": {"mimetype": mime, "size": len(data)},
    }
    content = _with_thread(content, thread_root)
    await _send_content(client, room_id, content)


def _parse_optional_int(value: str | int | None) -> int | None:
    if value is None or value == "":
        return None
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


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
    status: str = "",
    detail: str = "",
    page_index: int | None = None,
    page_total: int | None = None,
    pages_done: int | None = None,
    cursor_applied: int | None = None,
    cursor_total: int | None = None,
    campaign_dir: Path | None = None,
) -> dict:
    try:
        client, room_id = await _ensure_client()
    except Exception as exc:
        body = f"Matrix notify failed: {exc}"
        print(f"[studio-ux-notify] {body}", file=sys.stderr)
        return {"notified": False, "reason": str(exc)}

    try:
        thread_root = ""
        msgtype = "m.text"
        body = ""

        if event == "cycle-start":
            body = build_start_message(
                consumer_id=consumer_id,
                page_slug=page_slug,
                page_title=page_title,
                page_path=page_path,
                purpose=purpose,
                campaign_id=campaign_id,
                cycle_dir=cycle_dir,
                page_index=page_index,
                page_total=page_total,
            )
            msgtype = "m.notice"
            # Prefer campaign thread when present so pages nest under campaign root.
            thread_root = _load_thread_event(cycle_dir)
        elif event == "cycle-complete":
            body = build_complete_message(
                consumer_id=consumer_id,
                page_slug=page_slug,
                iteration=iteration,
                cycle_dir=cycle_dir,
                campaign_id=campaign_id,
                page_index=page_index,
                page_total=page_total,
                cursor_applied=cursor_applied,
                cursor_total=cursor_total,
            )
            thread_root = _load_thread_event(cycle_dir)
        elif event == "progress":
            body = build_progress_message(
                consumer_id=consumer_id,
                page_slug=page_slug,
                iteration=iteration,
                status=status,
                detail=detail,
                campaign_id=campaign_id,
            )
            msgtype = "m.notice"
            thread_root = _load_thread_event(cycle_dir)
        elif event in {"campaign-start", "campaign-complete"}:
            camp = campaign_dir or cycle_dir
            body = build_campaign_message(
                consumer_id=consumer_id,
                campaign_id=campaign_id or camp.name,
                event=event,
                page_total=page_total or 0,
                pages_done=pages_done or 0,
                status=status,
                campaign_dir=camp,
            )
            msgtype = "m.notice"
            if event == "campaign-complete":
                thread_root = ""
                if (camp / THREAD_FILE).exists():
                    try:
                        thread_root = json.loads((camp / THREAD_FILE).read_text(encoding="utf-8")).get(
                            "event_id", ""
                        )
                    except (OSError, json.JSONDecodeError):
                        thread_root = ""
        else:
            body = f"[{consumer_id}] unknown event={event}"
            msgtype = "m.notice"

        event_id = await _send_text(
            client,
            room_id,
            body,
            msgtype=msgtype,
            thread_root=thread_root if event != "campaign-start" else "",
        )

        if event == "campaign-start" and event_id and campaign_dir is not None:
            (campaign_dir / THREAD_FILE).write_text(
                json.dumps({"event_id": event_id, "campaign_id": campaign_id}, indent=2) + "\n",
                encoding="utf-8",
            )
        if event == "cycle-start" and event_id:
            # Nest images/progress under this cycle when no campaign root exists.
            root = thread_root or event_id
            _save_thread_event(cycle_dir, root, also_campaign=False)
            if not thread_root:
                # Standalone cycle: use start as thread root for follow-ups.
                _save_thread_event(cycle_dir, event_id)

        shot_root = _load_thread_event(cycle_dir) or thread_root or event_id
        if event == "cycle-start":
            shot = cycle_dir / "before.png"
            if shot.exists():
                await _send_image(
                    client,
                    room_id,
                    shot,
                    label=image_label("before", page_slug),
                    thread_root=shot_root,
                )
        elif event == "cycle-complete":
            for kind in ("before", "after"):
                img = cycle_dir / f"{kind}.png"
                if img.exists():
                    await _send_image(
                        client,
                        room_id,
                        img,
                        label=image_label(kind, page_slug),
                        thread_root=shot_root,
                    )

        return {
            "notified": True,
            "room_id": room_id,
            "event": event,
            "body": body,
            "event_id": event_id,
            "thread_root": shot_root if event != "campaign-start" else event_id,
        }
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
    page_index: int | None = None,
    page_total: int | None = None,
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
            page_index=page_index,
            page_total=page_total,
        )
    )


def notify(
    cycle_dir: Path,
    consumer_id: str,
    page_slug: str,
    iteration: int,
    room_id: str = "",
    *,
    campaign_id: str = "",
    page_index: int | None = None,
    page_total: int | None = None,
    cursor_applied: int | None = None,
    cursor_total: int | None = None,
) -> dict:
    if room_id:
        os.environ["FM_STUDIO_UX_MATRIX_ROOM_ID"] = room_id
    return asyncio.run(
        _notify_async(
            event="cycle-complete",
            cycle_dir=cycle_dir,
            consumer_id=consumer_id,
            page_slug=page_slug,
            iteration=iteration,
            campaign_id=campaign_id,
            page_index=page_index,
            page_total=page_total,
            cursor_applied=cursor_applied,
            cursor_total=cursor_total,
        )
    )


def main() -> int:
    ap = argparse.ArgumentParser(description="Studio UX PDCA Matrix notifier")
    ap.add_argument(
        "--event",
        choices=[
            "cycle-start",
            "cycle-complete",
            "progress",
            "campaign-start",
            "campaign-complete",
        ],
        default="cycle-complete",
    )
    ap.add_argument("--cycle-dir", type=Path, default=None)
    ap.add_argument("--campaign-dir", type=Path, default=None)
    ap.add_argument("--consumer-id", required=True)
    ap.add_argument("--page-slug", default="")
    ap.add_argument("--iteration", type=int, default=1)
    ap.add_argument("--page-title", default="")
    ap.add_argument("--page-path", default="")
    ap.add_argument("--purpose", default="")
    ap.add_argument("--campaign-id", default="")
    ap.add_argument("--status", default="")
    ap.add_argument("--detail", default="")
    ap.add_argument("--page-index", default="")
    ap.add_argument("--page-total", default="")
    ap.add_argument("--pages-done", default="")
    ap.add_argument("--cursor-applied", default="")
    ap.add_argument("--cursor-total", default="")
    ap.add_argument("--matrix-room-id", default="")
    args = ap.parse_args()
    if args.matrix_room_id:
        os.environ["FM_STUDIO_UX_MATRIX_ROOM_ID"] = args.matrix_room_id

    cycle_dir = args.cycle_dir
    if cycle_dir is None:
        if args.campaign_dir is not None:
            cycle_dir = args.campaign_dir
        else:
            ap.error("--cycle-dir is required unless --campaign-dir is set for campaign events")

    result = asyncio.run(
        _notify_async(
            event=args.event,
            cycle_dir=cycle_dir,
            consumer_id=args.consumer_id,
            page_slug=args.page_slug or "campaign",
            iteration=args.iteration,
            page_title=args.page_title,
            page_path=args.page_path,
            purpose=args.purpose,
            campaign_id=args.campaign_id,
            status=args.status,
            detail=args.detail,
            page_index=_parse_optional_int(args.page_index),
            page_total=_parse_optional_int(args.page_total),
            pages_done=_parse_optional_int(args.pages_done),
            cursor_applied=_parse_optional_int(args.cursor_applied),
            cursor_total=_parse_optional_int(args.cursor_total),
            campaign_dir=args.campaign_dir,
        )
    )
    print(json.dumps(result))
    return 0 if result.get("notified") else 1


if __name__ == "__main__":
    raise SystemExit(main())
