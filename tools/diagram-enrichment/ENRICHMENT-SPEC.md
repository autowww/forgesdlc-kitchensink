# Diagram fence enrichment spec (agent instructions)

You are enriching `blueprint-diagram` fenced blocks in one Markdown file so
Kitchen Sink renders them as enriched flow figures (compact titles + per-step
details, plus an Expand flyout with deeper text).

## What to edit

Only fenced blocks that start with ` ```blueprint-diagram ` and:

- do **not** contain a `src:` line, and
- do **not** already contain `node:` lines.

Leave every other part of the file byte-identical. Do not reflow prose, do not
touch other fences, do not change headings or links.

## How to enrich each fence

Read the surrounding page content (the sections before and after the fence)
and the fence's existing `alt:` and `fallback_ascii:` to understand what the
flow describes **in this page's context**. Then add these metadata lines to
the fence, keeping the existing `key:`, `alt:`, `caption:`, and
`fallback_ascii:` lines exactly as they are:

1. `title:` — 3–7 words naming the flow (page-appropriate, not generic).
2. `summary:` — one sentence (max ~24 words) saying what the flow achieves.
3. For **each step** in the flow (each labeled box in `fallback_ascii`,
   in the same order):
   - `node:` — the step label. Copy the label text from the ASCII exactly
     (including parentheticals), so the ASCII view and flow view agree.
   - `detail:` — one short sentence (max ~14 words) explaining what this step
     does *on this page's topic*. Written for the compact view.
   - `more:` — one or two sentences of deeper explanation for the flyout:
     mechanism, inputs/outputs, failure/edge behavior, or where it is
     configured. Only include when you have real substance from the page or
     from well-established facts about the step; never pad or invent claims.

## Placement and format rules

- Metadata lines go **before** `fallback_ascii:` (which must remain the last
  metadata field, since everything after it is the ASCII body).
- Order inside the fence: `key:`, `alt:`, `title:`, `summary:`, then
  `node:`/`detail:`/`more:` groups, then `caption:` (if present), then
  `fallback_ascii:`.
- Each value is a single line. No YAML block scalars for the new fields, no
  trailing whitespace, no Markdown formatting inside values.
- `detail:` and `more:` must not repeat each other or the label verbatim.
- Voice: calm, precise, enterprise-grade (Forge copy). Prefer words like
  governed, traceable, reviewable, bounded. Never invent metrics,
  certifications, or capabilities not stated on the page or in the product's
  docs.
- If the ASCII has a standalone first line acting as an entry point (e.g.
  `Question`), treat it as the first `node:`.
- If a fence's flow is not a step sequence (e.g. a pure tree or venn), still
  enrich: one `node:` per labeled element, top-to-bottom, left-to-right.

## Example

Before:

````markdown
```blueprint-diagram
key: linear
alt: RAG answer flow question through retriever evidence pack answer task validators citations
fallback_ascii: |
  Question
      |
      v
  rag_query_plan (optional planner)
      |
      v
  Retriever → chunks → EvidencePack
      |
      v
  answer_from_evidence
      |
      v
  schema validators + citations (optional)
```
````

After:

````markdown
```blueprint-diagram
key: linear
alt: RAG answer flow question through retriever evidence pack answer task validators citations
title: RAG answer flow
summary: How a question becomes a governed, cited answer without requiring a vector database.
node: Question
detail: The caller's natural-language question enters the flow.
node: rag_query_plan (optional planner)
detail: Optional planner that decomposes the question into sub-queries.
more: Emits targeted sub-queries so retrieval covers every aspect of the ask before evidence is collected.
node: Retriever → chunks → EvidencePack
detail: Collects ranked chunks into an EvidencePack.
more: The default adapter wraps build_context_pack (repo scan + rank + trim), so no vector database is required.
node: answer_from_evidence
detail: Drafts the answer strictly from retrieved evidence.
more: The task is schema-aware; answers cite the evidence they used.
node: schema validators + citations (optional)
detail: Validates output shape and citation coverage before returning.
fallback_ascii: |
  Question
      |
      v
  rag_query_plan (optional planner)
      |
      v
  Retriever → chunks → EvidencePack
      |
      v
  answer_from_evidence
      |
      v
  schema validators + citations (optional)
```
````

## Definition of done

- Every src-less `blueprint-diagram` fence in the file has `title:`,
  `summary:`, and one `node:` (+ `detail:`) per flow step.
- `fallback_ascii` bodies are unchanged.
- The file has no other diffs.
