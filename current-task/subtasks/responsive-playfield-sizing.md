---
worktree: responsive-playfield-sizing
generated_by: subtask-maker
spec: current-task/specs/responsive-playfield-sizing.yaml
context: current-task/status.json
title: Responsive playfield sizing
constraints:
  - no-commit
  - no-new-deps
---

# Subtasks

- [x] Keep abstract game logic on 10-column by 20-row grid coordinates while responsive sizing affects display scale and pixel metrics only.
- [x] Make the playfield layout shell fluid with max-width 100%, height auto, and centered flex or grid placement instead of fixed pixel widths on mobile.
- [x] Apply safe-area-inset padding on the layout shell so the playfield and surrounding UI are not clipped under notched device system chrome.
- [x] Stack side panels below the playfield at narrow breakpoints when horizontal space cannot fit side-by-side layout.
- [x] Set touch-action none on the playfield canvas so touch gestures during play do not steal page scroll.
- [x] Compute display scale from the playfield container bounds combined with viewport limits, using visualViewport width and height when available and window inner dimensions as fallback.
- [x] Cap display scale on large desktop viewports so the playfield does not exceed a comfortable maximum size.
- [x] Enforce a minimum readable cell size on narrow phone viewports (approximately 12–14 CSS pixels per cell or equivalent constraint).
- [x] On each layout refresh, set canvas CSS pixel size and backing-store width and height together so backing dimensions equal CSS size times devicePixelRatio rounded to integers.
- [x] Recompute cell width and height in CSS pixels from the CSS grid size divided by abstract column and row counts whenever layout is refreshed.
- [x] Register debounced listeners for window resize, orientationchange, and visualViewport resize (approximately 100–150 ms) to refresh scale and cell metrics without layout thrashing.
- [x] Move layout reads such as container measurement out of per-tick draw and movement paths so hot paths use cached cell metrics from render state only.
- [x] Verify grid visuals remain sharp on 2× and 3× DPR displays after resize with no blur from mismatched CSS and backing store dimensions.
- [x] Verify browser resize and mobile emulator rotation recompute scale and cell metrics while the abstract grid stays logically 10×20.
- [x] Verify narrow portrait layout shows minimum readable cell size, respects safe-area insets, and playfield touch does not cause unintended page scroll.
- [x] Verify side panels stack below the playfield on narrow breakpoints and orientation change or mobile browser chrome resize triggers debounced metric refresh.
- [x] Verify desktop wide viewport does not produce an oversized playfield beyond the scale cap and piece movement ticks do not invoke layout reads.

## Fix
<!-- ref: current-task/review-validations/r2-validation.yaml -->
- [x] Compact side panels to minimal height — sized to preview canvases only, not tall 180px+ margin blocks
- [x] Single-screen layout: playfield, hold, upcoming, and score visible together without panels stacking off-screen
- [x] Remove all side panel text labels (Hold, Score:, Lines:, Upcoming) — canvases and numeric values only
- [x] Refresh playfield layout when game container becomes visible, not only at DOMContentLoaded while hidden
- [x] Fix min-cell sizing so board fits viewports smaller than 130×260 without overflow
- [x] Add viewport-fit=cover to index.html meta viewport for iOS safe-area insets
- [x] Compact side panel CSS: reduce fixed widths and margins; panels fit preview canvas dimensions

## Fix (round 2)
<!-- ref: current-task/review-validations/r4-validation.yaml -->
- [x] On mobile viewports show only playfield, hold piece, and score — hide upcoming queue and all other side UI not in that list
- [x] On mobile hide pause and upload buttons and any other game chrome outside playfield, hold, and score
- [x] Keep desktop layout with fuller compact horizontal UI (hold, upcoming, score) unchanged on non-mobile breakpoints
- [x] Main menu Play Game and Restore buttons use width 100%
- [x] Main menu page fits viewport height without vertical scroll before game starts

## Fix (round 3)
<!-- ref: current-task/review-validations/r5-validation.yaml -->
- [x] Prevent hidden game-container from reserving viewport height while menu is shown so main menu fits without vertical scroll
