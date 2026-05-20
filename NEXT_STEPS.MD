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
- `9` replace const-only `Array.from(...).forEach` index loops in `board.js` with `for...of` (or `for...in` only where index keys matter and style agrees).
- `10` second pass on `public/assets/js/lib/stream.js`: review `mutableRef` holder pattern for `scan` / `withLatestFrom`; keep semantics, simplify or document invariants (e.g. `withLatestFrom` may emit before `other` has emitted).
- `11` native ESM (`import`/`export`, module entry in `index.html`), client split (`config/`, `utils`, `collision`, `api`, `initGame`); ESLint `public/**/*.js` is `sourceType: 'module'` with `no-undef` and `no-unused-vars` enabled.
- `0` canonical rename pass (`CONTEXT.md` naming: `lockedMap`, `tetrominoQueue`, `CLOCK_TICK_MS`, `DELAY_CLOCK_TICKS`, `*Piece`, line-clear symbols).

Left:
- `1` richer board renderer state refactor.
- `2` responsive playfield sizing.
- `3` ghost piece rendering.
- `5.5` spawn delay clock ticks after settle.
- `6` compatibility pass and minimal integration hooks verification.
- `8` full validation checklist run.
- `11.1` bundler / dev-server evaluation: **esbuild** vs **Vite** vs thin **Express** on top of `server.js`; optional prod bundle and HMR; **Nest** / **Next** only if you want a full framework shell.

## Domain decisions

Glossary: [`CONTEXT.md`](./CONTEXT.md) — small, agent-readable domain terms only. No `docs/adr/`; record trade-offs here instead.

**Tick** = one game-step **clock tick**, never ms. Ms interval → `CLOCK_TICK_MS`.

**Delay clock ticks** (pre-settle ground grace): default `2` (`DELAY_CLOCK_TICKS`). **Spawn delay clock ticks** (post-settle before next active piece): `1` after partial landing, `2` after complete landing — two config constants.

**Ghost piece** rest position = same as **hard drop** rest position for the active piece.

**Locked cells**: empty cell (`0`) or **locked cell** with a **color** string ID (not boolean `1`).

**Rotation:** **orientation** (0–3); **rotation kick** for blocked rotates (see `CONTEXT.md`).

**Line clear** is the canonical term (not erase/erased). Applied in code: `findLinesToClear`, `CLEAR_LINES`, `linesCleared`, `flashLineClearRows`, etc.

**Order:** glossary → rename pass (`0`, done) → remaining items in this file.

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

- Pending. Blocks validation item `Ghost always matches rest position` in step `8`.

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

- Lock delay uses **delay clock ticks** (default `2` clock ticks before settle on ground contact).
- Reset lock delay on successful left/right/rotate movement, capped at `15` resets.
- Ensure floor-aware rotation kick (including upward kick) counts as movement for lock-delay reset.
- Add a renderer function like `flashClearedRows(yPositions)`.
- In `game.js`, call it when a **line clear** occurs (today: `linesToErase.length > 0`; rename in step `0`).
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

## 5.5) Spawn delay clock ticks after settle

Files:

- `public/assets/js/game.js`
- `public/assets/js/config/settings.js`

Actions:

- After **settle**, wait before spawning the next **active piece** (distinct from **delay clock ticks**).
- Two constants: `1` clock tick after **partial landing**, `2` after **complete landing** (line clear).
- Do not conflate with pre-settle **delay clock ticks** (`DELAY_CLOCK_TICKS`, default `2`).

## 0) Canonical rename pass

Files:

- `public/assets/js/game.js`, `board.js`, `api.js`, `collision.js`, `utils.js`, `config/settings.js`, and any module still using legacy names.

Actions:

- Apply renames listed in **Domain decisions** so code matches `CONTEXT.md`.
- No gameplay behavior change in this step unless required by a rename.
- Run `pnpm lint` after.

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
- [ ] Ghost always matches **rest position** (blocked: ghost rendering not implemented yet).
- [x] **Line clear flash** appears only on rows removed by a **line clear**.
- [~] Playfield and previews stay crisp on DPR screens and resize correctly (DPR scaling present; responsive resize work still pending in step `2`).

## 9) Prefer `for...of` over index `forEach` for grid / queue loops

Files:

- `public/assets/js/board.js`

Context:

- ESLint const-only rule replaced `for (let i …)` with `Array.from({ length: n }, …).forEach(…)`.
- Prefer explicit `for (const x of …)` (e.g. over a small range iterator or `keys()`-style sequence) instead of `forEach`, unless a callback API is required.

Actions:

- Refactor playfield grid loops (`HORIZONTAL_DIMENSIONS`, `VERTICAL_DIMENSIONS`) and upcoming queue slot index loop (`maxVisible`) to `for...of` (or `for...in` on a dense array of indices if that reads clearer than a generator).
- Re-run `pnpm lint` after edits.

## 10) `stream.js` const-holder follow-up

Files:

- `public/assets/js/lib/stream.js`

Actions:

- Re-read `scan` and `withLatestFrom` after const-only migration (`mutableRef` cells for `acc` / `latest`).
- Decide whether to keep holders, switch to a single shared cell type, or fold with a tiny helper; document invariants (e.g. `withLatestFrom` may emit before `other` has emitted).

## 11) Real `no-undef` / `no-unused-vars` for client JS — **done**

Delivered via native ESM and `eslint.config.mjs` (`sourceType: 'module'` for `public/**/*.js`, `globals.browser`); removed overrides that disabled `no-undef` and `no-unused-vars`. No `settings.js` script-order globals list required.


## 11.1) Bundler / dev server (after ESM baseline)

Status: **pending** — native ESM + existing `server.js` static file serving is the current baseline.

Files (expected once a tool is chosen):

- `package.json` / lockfile
- `public/index.html` (script `src` if build output path changes)
- optional: `server.js` or a small wrapper if `/upload/game` and `/fetch/game` stay on Node while static assets are served by Vite middleware

Actions:

- Compare **esbuild** (CLI or programmatic) vs **Vite** for dev + production build.
- Optionally add a minimal **Express** app that serves `public/` and proxies or implements the same JSON save/load routes instead of hand-rolled `http`; **Nest** / **Next** are heavier than this repo usually needs.
- Keep game source as ESM modules; bundler should mainly change how assets are delivered (and optionally minify).
- Document chosen commands (e.g. `pnpm dev`, `pnpm build`) and output directory for deployment.

## Suggested execution order

1. Gameplay canvas upgrades (ghost + flash + responsive board)
2. Preview migration (hold/upcoming from images to canvas)
3. Small code-quality pass: items `9` (done) → `10` → `10.1` when ready (independent of canvas work except touching same files)
