---
name: grill-with-docs-onboarding-full
description: >-
  Onboards a developer to a codebase by building CONTEXT.md and capturing
  architectural decisions as ADRs. Extends grill-with-docs-onboarding with
  trade-off recording. Use when the user is onboarding and also wants to
  document hard decisions, or invokes /grill-with-docs-onboarding-full.
  For glossary-only onboarding use grill-with-docs-onboarding instead.
---

# Grill with docs — onboarding (full)

Extends **[grill-with-docs-onboarding](../grill-with-docs-onboarding/SKILL.md)** with ADR recording. Everything in that skill applies here; this file only adds the trade-off layer.

Use this when you are settled enough in the codebase to recognise hard, surprising decisions worth capturing — typically week 2+ or after a validation session with a senior.

## What to do

Follow all steps from [grill-with-docs-onboarding](../grill-with-docs-onboarding/SKILL.md), then additionally:

**After each term is resolved** — ask: does this decision meet all three ADR criteria (below)? If yes, offer to record it. If no, skip.

## ADR criteria

Only record a decision when all three are true (see [ADR-FORMAT.md](../grill-with-docs/ADR-FORMAT.md)):

1. **Hard to reverse** — the cost of changing your mind later is meaningful
2. **Surprising without context** — a future reader will wonder "why did they do it this way?"
3. **The result of a real trade-off** — there were genuine alternatives and you picked one for specific reasons

If any of the three is missing, skip it.

## Where to write ADRs

- Default: `docs/adr/NNNN-slug.md` (create `docs/adr/` lazily)
- If the project already logs decisions elsewhere (e.g. a `NEXT_STEPS.md` **Domain decisions** section), append there — do not duplicate in both places

## Rules (additions to simple version)

| Do | Don't |
|----|--------|
| Offer an ADR only when all three criteria are met | Record obvious or easy-to-reverse decisions |
| Write to the team's existing decision log if one exists | Duplicate ADRs across `docs/adr/` and another log |
| Keep ADRs to 1–3 sentences unless consequences are non-obvious | Fill out ADR sections that add no value |

## Example opening

```text
/grill-with-docs-onboarding-full

I'm onboarding and want to build CONTEXT.md and capture hard architectural
decisions. Explore read-only, propose candidate terms and any surprising
design choices, then grill me one question at a time. No renames or features.
```
