# Next Steps: Canvas Visual Upgrade

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

Actions:
- Compute ghost from current falling blocks + locked map:
  - simulate downward movement until next step collides.
- Draw order:
  1. background/grid
  2. locked blocks
  3. ghost (low alpha)
  4. active falling piece
- Recompute ghost whenever falling piece/map changes.

## 4) Implement line-clear flash effect

Files:
- `/home/macastillo/Documentos/for_work/repos/tetris-clone-frp/public/assets/js/board.js`
- `/home/macastillo/Documentos/for_work/repos/tetris-clone-frp/public/assets/js/game.js`

Actions:
- Add a renderer function like `flashClearedRows(yPositions)`.
- In `game.js`, call it when `linesToErase.length > 0`.
- In `board.js`, overlay a short (80–140ms) flash on affected rows, driven by timestamp and redraw.
- Keep it visual-only (no timing or gameplay behavior changes).

## 5) Replace tetromino previews with canvas

Files:
- `/home/macastillo/Documentos/for_work/repos/tetris-clone-frp/public/index.html`
- `/home/macastillo/Documentos/for_work/repos/tetris-clone-frp/public/assets/css/index.css`
- `/home/macastillo/Documentos/for_work/repos/tetris-clone-frp/public/assets/js/board.js`

Actions:
- Replace image-background based tetrominoes with small canvases:
  - hold area: one canvas
  - upcoming area: one canvas per queued tetromino
- Render from tetromino shape data (same color palette), centered/scaled in preview canvas.
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

## 6) Keep compatibility with existing flow

Files:
- `/home/macastillo/Documentos/for_work/repos/tetris-clone-frp/public/assets/js/game.js`
- `/home/macastillo/Documentos/for_work/repos/tetris-clone-frp/public/assets/js/menu.js`

Actions:
- Ensure current subscriptions and calls still work.
- Only add minimal hook(s) needed for flash.
- Preserve existing startup/load behavior.

## 7) Validation checklist

- Game controls and collisions unchanged.
- Hold/swap still works.
- Queue updates correctly.
- Ghost always matches actual landing position.
- Flash appears only on cleared lines.
- Playfield and previews stay crisp on DPR screens and resize correctly.

## Suggested execution order

1. Gameplay canvas upgrades (ghost + flash + responsive board)
2. Preview migration (hold/upcoming from images to canvas)
