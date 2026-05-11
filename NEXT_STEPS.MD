# Next Steps: Canvas Visual Upgrade

## Status Summary

Done:
- `4` Improve lock delay/floor rotation and implement line-clear flash
- `5` preview migration to canvas (hold + upcoming, PNG dependency removed).
- `5.1` canonical tetromino definitions + tetromino naming migration.
- `5.2` collision redesign with projected-state checks and rotation kick handling.
- `5.3` single upcoming queue canvas (`4x12`), 3 clipped `4x4` slots, `Upcoming` label, flat style.
- `5.4` side panel readability tuning for score/lines sizing and spacing.
- `7` key controls remap pass (`ArrowUp` hard drop, `Space` alias, `KeyA/KeyS` rotations, `ArrowDown` immediate floor settle).

Left:
- `1` richer board renderer state refactor.
- `2` responsive playfield sizing.
- `3` ghost piece rendering.
- `5.5` make a 1/2 tick pause when a piece lands
- `6` compatibility pass and minimal integration hooks verification.
- `8` full validation checklist run.

## Goal

Keep all game logic as-is, and expand visuals by:

- adding ghost piece
- adding line-clear flash
- adding responsive canvas scaling
- replacing hold/upcoming tetromino image previews with canvas-rendered previews

## 1) Refactor `board.js` into a richer renderer state

File:
- `/home/macastillo/Documentos/for_work/repos/tetris-clone-frp/public/assets/js/board.js`

Actions:
- Extend render state to include:
  - `lockedMap`
  - `fallingBlocks`, `fallingColor`
  - `ghostBlocks`
  - `flashRows`, `flashUntilMs`
  - cached board metrics (`cellW`, `cellH`, DPR-scaled sizes)
- Keep existing exported function names used by `game.js` so logic wiring remains stable.

## 2) Add responsive playfield sizing (runtime-light)

Files:
- `/home/macastillo/Documentos/for_work/repos/tetris-clone-frp/public/assets/js/board.js`
- `/home/macastillo/Documentos/for_work/repos/tetris-clone-frp/public/assets/css/index.css`

Actions:
- Keep abstract grid dimensions (10x20) unchanged.
- Compute a display scale based on viewport/container limits.
- Update canvas CSS size + backing buffer with DPR.
- Recompute cell pixel metrics on resize.
- Keep visuals crisp and avoid layout reads in hot movement paths.

## 3) Implement ghost piece rendering

File:
- `/home/macastillo/Documentos/for_work/repos/tetris-clone-frp/public/assets/js/board.js`

Status:
- Pending. Blocks validation item `Ghost always matches actual landing position` in step `8`.

Actions:
- Compute ghost from current falling blocks + locked map:
  - simulate downward movement until next step collides.
- Draw order:
  1. background/grid
  2. locked blocks
  3. ghost (low alpha)
  4. active falling piece
- Recompute ghost whenever falling piece/map changes.

## 4) Improve lock delay/floor rotation and implement line-clear flash

Files:
- `/home/macastillo/Documentos/for_work/repos/tetris-clone-frp/public/assets/js/board.js`
- `/home/macastillo/Documentos/for_work/repos/tetris-clone-frp/public/assets/js/game.js`
- `/home/macastillo/Documentos/for_work/repos/tetris-clone-frp/public/assets/js/utils.js`

Actions:
- Add lock delay of `1` gravity tick before ground settle.
- Reset lock delay on successful left/right/rotate movement, capped at `15` resets.
- Ensure floor-aware rotation kick (including upward kick) counts as movement for lock-delay reset.
- Add a renderer function like `flashClearedRows(yPositions)`.
- In `game.js`, call it when `linesToErase.length > 0`.
- In `board.js`, overlay a short (80–140ms) flash on affected rows, driven by timestamp and redraw.
- Keep existing line-clear scoring behavior unchanged.

## 5) Replace tetromino previews with canvas

Files:
- `/home/macastillo/Documentos/for_work/repos/tetris-clone-frp/public/index.html`
- `/home/macastillo/Documentos/for_work/repos/tetris-clone-frp/public/assets/css/index.css`
- `/home/macastillo/Documentos/for_work/repos/tetris-clone-frp/public/assets/js/board.js`

Actions:
- Replace image-background based tetrominoes with small canvases:
  - hold area: one canvas
  - upcoming area: one single queue canvas
- Render from tetromino shape data using state `0`.
- Keep current API calls:
  - `addHoldToBoard(holdTetromino)`
  - `addUpcomingTetrominoesToBoard(tetrominoesBank)`
- Remove PNG dependency for tetromino previews after this step.

## 5.1) Canonical tetromino definitions and gameplay source migration

Files:
- `/home/macastillo/Documentos/for_work/repos/tetris-clone-frp/public/assets/js/lib/tetromino-definitions.js`
- `/home/macastillo/Documentos/for_work/repos/tetris-clone-frp/public/assets/js/tetromino.js`
- `/home/macastillo/Documentos/for_work/repos/tetris-clone-frp/public/assets/js/lib/tetrominoes.js`
- `/home/macastillo/Documentos/for_work/repos/tetris-clone-frp/public/assets/js/game.js`
- `/home/macastillo/Documentos/for_work/repos/tetris-clone-frp/public/assets/js/board.js`

Actions:
- Rename `tetronimo*` terminology to `tetromino*` across file names and symbols.
- Use string color names as canonical IDs in state and definitions.
- Define all 4 rotation states explicitly as coordinate arrays in a local 4x4 frame.
- Use piece-level spawn anchors and per-rotation offsets.
- Keep preview rendering on state `0`.

## 5.2) Collision redesign using tetromino metadata

Files:
- `/home/macastillo/Documentos/for_work/repos/tetris-clone-frp/public/assets/js/utils.js`
- `/home/macastillo/Documentos/for_work/repos/tetris-clone-frp/public/assets/js/tetromino.js`
- `/home/macastillo/Documentos/for_work/repos/tetris-clone-frp/public/assets/js/lib/tetromino-definitions.js`

Actions:
- Rework collision checks to consume tetromino metadata directly.
- Keep behavior equivalent first, then iterate improvements with tests.

## 5.3) Upcoming preview layout bugfix (single queue canvas)

Files:
- `/home/macastillo/Documentos/for_work/repos/tetris-clone-frp/public/index.html`
- `/home/macastillo/Documentos/for_work/repos/tetris-clone-frp/public/assets/css/index.css`
- `/home/macastillo/Documentos/for_work/repos/tetris-clone-frp/public/assets/js/board.js`

Actions:
- Replace multiple upcoming preview canvases with one queue canvas.
- Use a black queue canvas with logical dimensions `4x12` (grid units), scaled down relative to the main board.
- Render only the first 3 queued tetrominoes in 3 vertical `4x4` slots.
- Render tetrominoes with flat solid cells and hard-clip each slot to prevent overlap.
- Add an `Upcoming` label in the panel.
- Keep hold preview as its own canvas using the same flat style on a `4x4` logical grid.
- Keep current API call `addUpcomingTetrominoesToBoard(tetrominoesBank)` and adapt internals only.

## 5.4) Side panel readability tuning

Files:
- `/home/macastillo/Documentos/for_work/repos/tetris-clone-frp/public/assets/css/index.css`

Actions:
- Reduce empty space and tune score/lines typography scale.
- Keep labels compact and values readable without oversized text.

## 5.5) make a 1/2 tick pause when a piece lands

## 6) Keep compatibility with existing flow

Files:
- `/home/macastillo/Documentos/for_work/repos/tetris-clone-frp/public/assets/js/game.js`
- `/home/macastillo/Documentos/for_work/repos/tetris-clone-frp/public/assets/js/menu.js`

Actions:
- Ensure current subscriptions and calls still work.
- Only add minimal hook(s) needed for flash.
- Preserve existing startup/load behavior.

## 7) Key controls pass (lock-delay interactions)

Files:
- `/home/macastillo/Documentos/for_work/repos/tetris-clone-frp/public/assets/js/game.js`

Actions:
- Review active key mappings and behaviors (`ArrowLeft`, `ArrowRight`, `ArrowUp`, `ArrowDown`, `Space`, `KeyC`) to a new mapping (MovementLeft `ArrowLeft`, MovementRight `ArrowRight`, MovementDown `ArrowDown`, HardDrop `ArrowUp`, Hold `KeyC`, RotateLeft `KeyA`, rotateRight `KeyS`)
- Make MovementDown `ArrowDown` movement bypass ground lock-delay wait (immediate settle behavior once piece reaches floor).
- Ensure MovementDown `ArrowDown` behavior stays consistent with manual drop expectations and does not regress scoring/line clear flow.

## 8) Validation checklist

- [x] Game controls work correctly (mapping updated in code).
- [~] collisions unchanged (collision API paths unchanged; gameplay run still pending).
- [~] Hold/swap still works (flow unchanged; gameplay run still pending).
- [~] Queue updates correctly (update call unchanged; gameplay run still pending).
- [ ] Ghost always matches actual landing position (blocked: ghost rendering not implemented yet).
- [x] Flash appears only on cleared lines (triggered only when `linesToErase.length > 0`).
- [~] Playfield and previews stay crisp on DPR screens and resize correctly (DPR scaling present; responsive resize work still pending in step `2`).

## Suggested execution order

1. Gameplay canvas upgrades (ghost + flash + responsive board)
2. Preview migration (hold/upcoming from images to canvas)
