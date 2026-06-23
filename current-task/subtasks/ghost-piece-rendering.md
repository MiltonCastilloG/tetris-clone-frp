---
worktree: ghost-piece-rendering
generated_by: subtask-maker
spec: current-task/specs/ghost-piece-rendering.yaml
context: current-task/status.json
title: Ghost piece rendering
constraints:
  - no-commit
  - no-new-deps
---

# Subtasks

- [x] Confirm playfield draw order is background and grid, then locked blocks, ghost layer, then active falling piece.
- [x] Confirm ghost cell drawing already uses the active piece color at roughly 0.28 alpha and change nothing if compliant.
- [x] Implement ghost rest-position simulation by stepping falling block positions downward against the locked map until one more step would collide or leave bounds.
- [x] Recompute ghost blocks from that simulation at the start of each board redraw using current falling blocks and locked map.
- [x] When simulation cannot move down, set ghost blocks to the same cells as the active falling piece.
- [x] Leave ghost blocks empty when there is no active falling piece so the ghost layer draws nothing.
- [x] Manually confirm ghost rest position matches hard drop for a falling piece above the stack.
- [x] Manually confirm ghost cells overlap the active piece when it cannot move down.
- [x] Manually confirm ghost updates after horizontal move, rotation, soft drop, and locked-map visualization change.
- [x] Run npm run lint on changed files and fix any issues.
