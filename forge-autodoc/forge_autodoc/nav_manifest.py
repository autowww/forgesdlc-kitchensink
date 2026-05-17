"""Optional ``docs/nav.yml`` manifest for Forge Lenses–style handbook builds."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
import yaml


@dataclass(frozen=True)
class NavEntry:
    path: str
    nav_title: str | None = None


@dataclass(frozen=True)
class NavSection:
    id: str
    title: str
    entries: tuple[NavEntry, ...]


@dataclass(frozen=True)
class LensNavManifest:
    version: int
    sections: tuple[NavSection, ...]
    enforce_public_frontmatter: bool

    def paths_in_sections(self, section_ids: tuple[str, ...]) -> frozenset[str]:
        """Return Markdown paths declared under any section whose ``id`` is in *section_ids*."""
        want = frozenset(section_ids)
        out: list[str] = []
        for sec in self.sections:
            if sec.id not in want:
                continue
            for ent in sec.entries:
                out.append(ent.path.replace("\\", "/"))
        return frozenset(out)

    def flatten_paths(self) -> list[str]:
        out: list[str] = []
        for sec in self.sections:
            for ent in sec.entries:
                if ent.path not in out:
                    out.append(ent.path)
        return out

    def sidebar_model(self) -> list[tuple[str, list[str]]]:
        """Section title → ordered list of md rel paths (posix)."""
        return [(sec.title, [e.path for e in sec.entries]) for sec in self.sections]


def load_lens_nav_manifest(path: Path) -> LensNavManifest:
    raw = yaml.safe_load(path.read_text(encoding="utf-8"))
    if not isinstance(raw, dict):
        raise ValueError(f"nav manifest root must be a mapping: {path}")
    ver = int(raw.get("version", 1))
    enforce = bool(raw.get("enforce_public_frontmatter", False))
    secs_raw = raw.get("sections")
    if not isinstance(secs_raw, list):
        raise ValueError(f"nav manifest missing sections: list: {path}")
    sections: list[NavSection] = []
    for i, block in enumerate(secs_raw):
        if not isinstance(block, dict):
            raise ValueError(f"section {i} must be a mapping in {path}")
        sid = str(block.get("id", f"section-{i}"))
        title = str(block.get("title", sid))
        ent_raw = block.get("entries") or block.get("pages")
        if not isinstance(ent_raw, list):
            raise ValueError(f"section {sid!r} needs entries: list in {path}")
        entries: list[NavEntry] = []
        for j, er in enumerate(ent_raw):
            if isinstance(er, str):
                entries.append(NavEntry(path=_norm_rel(er), nav_title=None))
            elif isinstance(er, dict):
                p = er.get("path") or er.get("source")
                if not p:
                    raise ValueError(f"section {sid} entry {j} needs path/source in {path}")
                nt = er.get("nav_title")
                entries.append(
                    NavEntry(path=_norm_rel(str(p)), nav_title=str(nt) if nt else None)
                )
            else:
                raise ValueError(f"section {sid} entry {j} invalid in {path}")
        sections.append(NavSection(id=sid, title=title, entries=tuple(entries)))
    return LensNavManifest(
        version=ver,
        sections=tuple(sections),
        enforce_public_frontmatter=enforce,
    )


def _norm_rel(p: str) -> str:
    return p.strip().replace("\\", "/")


def resolve_nav_titles(
    manifest: LensNavManifest,
    title_by_rel: dict[str, str],
) -> dict[str, str]:
    """Map md rel path → sidebar label (nav_title override or built-in title)."""
    out: dict[str, str] = {}
    for sec in manifest.sections:
        for ent in sec.entries:
            label = ent.nav_title or title_by_rel.get(ent.path)
            if label:
                out[ent.path] = label
    return out


def manifest_section_labels(manifest: LensNavManifest) -> dict[str, str]:
    """Map md rel → section id for frontmatter checks."""
    labels: dict[str, str] = {}
    for sec in manifest.sections:
        for ent in sec.entries:
            r = _norm_rel(ent.path)
            if r not in labels:
                labels[r] = sec.id
    return labels
