---
name: grill-with-docs-onboarding
description: >-
  Onboards a developer to a codebase by discovering domain language from code
  and docs, then grilling them one question at a time to build CONTEXT.md.
  Use when the user is new to a project or job, wants to learn the domain fast,
  mentions onboarding, or invokes /grill-with-docs-onboarding. Not for
  stress-testing an existing plan (use grill-with-docs instead).
---

# Grill with docs — onboarding

Build project vocabulary fast. Output is a small, opinionated [`CONTEXT.md`](../../CONTEXT.md) agents can read every session—not a rewrite of the codebase.

Sibling skill **[grill-with-docs](../grill-with-docs/SKiLL.md)** is for stress-testing a **plan** you already have. This skill is for **discovery** when you are new.

## What to do

The user is onboarding. There is no plan to validate yet.

1. **Recon (read-only)** — Run app/README if feasible; find existing `CONTEXT.md`, `CONTEXT-MAP.md`, `docs/adr/`, README, and the messiest domain-heavy modules. Pick **one bounded context** for this session (not the whole monorepo).
2. **Propose candidates** — From code and docs, list 5–10 overloaded or ambiguous terms. Note code vs speech mismatches.
3. **Grill** — Interview the user relentlessly, one question at a time, with a **recommended answer** each time. Wait for feedback before the next question.
4. **Update docs inline** — As terms resolve, update `CONTEXT.md` immediately (do not batch). Follow [CONTEXT-FORMAT.md](../grill-with-docs/CONTEXT-FORMAT.md).
5. **Close** — Freeze v1 glossary (~15–25 domain terms). Suggest validating **Flagged ambiguities** and **Example dialogue** with a senior engineer.

If a question can be answered by exploring the codebase, explore instead of asking.

## Onboarding rules (different from plan mode)

| Do | Don't |
|----|--------|
| Scope one context per session | Rename symbols or “clean up” code in week 1 |
| Flag “unknown—confirm with expert” | Invent definitions when nobody can confirm |
| Skip general programming terms | Put implementation details in `CONTEXT.md` |
| Record hard trade-offs per [ADR-FORMAT](../grill-with-docs/ADR-FORMAT.md) | Duplicate ADRs if the team already uses another log (e.g. `NEXT_STEPS.md` **Domain decisions**) |
| Stop when marginal terms are generic CS | Grow glossary past ~100 lines without `CONTEXT-MAP.md` |

## Session flow

```text
Recon → pick context → propose terms → grill (1 Q at a time) → CONTEXT.md v1 → validate externally
```

**Opening question** (after recon): which bounded context to glossary first—or confirm your recommendation.

**Typical questions**

- What is the canonical term when code uses A but tickets say B?
- Which concepts share a word but are unrelated (e.g. two different “locks”)?
- Stress-test with a concrete scenario: “User does X—what terms apply in order?”

## During the session

Reuse the same behaviors as [grill-with-docs](../grill-with-docs/SKiLL.md):

- Challenge against existing `CONTEXT.md`
- Sharpen fuzzy language; propose canonical terms
- Cross-reference code; surface contradictions
- Concrete scenarios for boundaries

### `CONTEXT.md` only

Follow [CONTEXT-FORMAT.md](../grill-with-docs/CONTEXT-FORMAT.md):

- `# {Context Name}` + short intro
- `## Language` — `**Term**:`, `_Avoid_:`, subheadings when clustered
- `## Flagged ambiguities`
- `## Example dialogue` (dev vs domain expert)

No file paths, stores, constants, or rename lists in `CONTEXT.md`.

### Trade-offs

Offer to record a decision only when all three are true ([ADR-FORMAT.md](../grill-with-docs/ADR-FORMAT.md)): hard to reverse, surprising without context, real trade-off. Write to `docs/adr/` or the project’s existing decision log—not both.

## Multi-context repos

- `CONTEXT-MAP.md` at root → read it; glossary one context per session
- Single `CONTEXT.md` at root → default for small repos
- Create files lazily when the first term resolves

## When to stop

- User says glossary is frozen
- Remaining candidates are framework/util jargon, not domain language
- User has no answers and no expert scheduled—pause and book validation first

## Invoke

`/grill-with-docs-onboarding` or “onboard me on this repo’s domain language.”
