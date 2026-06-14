---
name: grill-with-docs-onboarding
description: >-
  Onboards a developer to a codebase by discovering domain language from code
  and docs, then grilling them one question at a time to build CONTEXT.md.
  Use when the user is new to a project or job, wants to learn the domain fast,
  mentions onboarding, or invokes /grill-with-docs-onboarding. Not for
  stress-testing an existing plan (use grill-with-docs instead). For onboarding
  that also captures architectural decisions, use grill-with-docs-onboarding-full.
---

# Grill with docs — onboarding (simple)

Build project vocabulary fast. Single output: a small, opinionated `CONTEXT.md` at the repo root. No ADRs, no rename pass, no implementation — glossary only.

Sibling skill **[grill-with-docs](../grill-with-docs/SKILL.md)** is for stress-testing a **plan** you already have. This skill is for **discovery** when you are new.

## What to do

The user is onboarding. There is no plan to validate yet.

1. **Recon (read-only)** — Skim README, existing `CONTEXT.md`, `CONTEXT-MAP.md`, and the messiest domain-heavy modules. Pick **one bounded context** for this session (not the whole monorepo).
2. **Propose candidates** — From code and docs, list 5–10 overloaded or ambiguous terms. Note code vs speech mismatches.
3. **Grill** — Interview the user relentlessly, one question at a time, with a **recommended answer** each time. Wait for feedback before the next question.
4. **Update `CONTEXT.md` inline** — As terms resolve, update immediately (do not batch). Follow [CONTEXT-FORMAT.md](../grill-with-docs/CONTEXT-FORMAT.md).
5. **Close** — Freeze v1 glossary (~15–25 domain terms). Suggest validating **Flagged ambiguities** and **Example dialogue** with a senior engineer.

If a question can be answered by exploring the codebase, explore instead of asking.

## Rules

| Do | Don't |
|----|--------|
| Scope one context per session | Rename symbols or "clean up" code |
| Flag "unknown — confirm with expert" | Invent definitions when nobody can confirm |
| Skip general programming terms | Put implementation details in `CONTEXT.md` |
| Stop when marginal terms are generic CS | Grow glossary past ~100 lines without `CONTEXT-MAP.md` |

## Session flow

```text
Recon → pick context → propose terms → grill (1 Q at a time) → CONTEXT.md v1 → validate externally
```

**Opening question** (after recon): confirm which bounded context to glossary first, or present your recommendation.

## During the session

Apply the same session behaviors as the sibling skill: challenge the glossary, sharpen fuzzy language, cross-reference code, stress-test with scenarios. See [grill-with-docs](../grill-with-docs/SKILL.md) for the full list.

### `CONTEXT.md` only

Follow [CONTEXT-FORMAT.md](../grill-with-docs/CONTEXT-FORMAT.md) exactly. No file paths, stores, constants, or rename lists in `CONTEXT.md`.

## Multi-context repos

- `CONTEXT-MAP.md` at root → read it; glossary one context per session
- Single `CONTEXT.md` at root → default for small repos
- Create files lazily when the first term resolves

## When to stop

- User says glossary is frozen
- Remaining candidates are framework/util jargon, not domain language
- User has no answers and no expert scheduled — pause and book validation first

## Example opening

```text
/grill-with-docs-onboarding

I'm new to this codebase. Explore read-only, propose 5–10 candidate domain terms
from the messiest modules, then grill me one question at a time to build CONTEXT.md v1.
No renames, no ADRs, glossary only.
```
