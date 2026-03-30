# Git workflow (Forge Team tier)

This repository uses **Forge SDLC Team** tier (5–12): protected `main`, short-lived branches, and **pull requests** with review. Methodology reference: [Git branching & commits (Forge)](https://blueprints.forgesdlc.com/sdlc--methodologies-forge-setup-branching-strategy.html) · [Blueprint source](https://github.com/autowww/blueprints/blob/main/sdlc/methodologies/forge/setup/BRANCHING-STRATEGY.md).

## Default branch

`main` — integrate via **pull requests** (no direct pushes to `main` once branch protection is enabled).

## Branch naming

- `feature/<short-topic>` — layouts, components, CSS, or generator changes.
- `fix/<short-topic>` — bugfixes.

## Pull requests

- Target **`main`**.
- At least **one** approval before merge.
- After changing `components/`, `css/`, `js/`, or `generator/`, run:

  ```bash
  python3 generator/build-showcase.py
  ```

- After changing `forge-autodoc/`, run:

  ```bash
  pip install -e './forge-autodoc[dev]'   # once per venv
  pytest forge-autodoc/tests -q
  ```

## Commits

Use **`type(scope): imperative summary`**. Common **scopes**:

| Scope | Typical use |
|-------|-------------|
| `components` | `components/layouts.py`, `components.py`, `transforms.py` |
| `css` | `css/` themes |
| `js` | `js/` client scripts |
| `generator` | `generator/build-showcase.py` and related |
| `forge_autodoc` | `forge-autodoc/forge_autodoc/` — Markdown handbook builder (tests under `forge-autodoc/tests/`) |
| `assets` | `assets/svg/` and shared static assets |

## Consumers

Sites such as **blueprints-website** and **forgesdlc** embed this repo as **`kitchensink/`**. After you merge meaningful changes here, **bump the submodule** in each consumer and rebuild those sites—see workspace **kitchensink propagation** / `sync-kitchensink-and-rebuild.sh` where applicable. Do not land consumer bumps inside this repository.

## GitHub branch protection (maintainers)

On `autowww/forgesdlc-kitchensink`, for **`main`**:

1. Require a **pull request** before merging; require **at least one** approval.
2. Require **status checks** when `.github/workflows/` defines jobs on `pull_request` (this repo may rely on org defaults—add CI if missing).
3. Block **force-push** and **deletion** on `main`.
