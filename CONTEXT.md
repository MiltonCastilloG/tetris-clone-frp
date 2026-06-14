# Tetris Gameplay

Vocabulary for the falling-piece game loop: playfield, pieces, timing, queue, hold, and line clears. For timing defaults and planned work, see `NEXT_STEPS.md` (**Domain decisions**).

## Language

### Playfield

**Playfield**:
The 10×20 grid where tetrominoes fall and lock.
_Avoid_: board (when meaning the grid, not the UI canvas)

**Empty cell**:
A playfield cell with no settled mino.
_Avoid_: empty space (in playfield logic), unfilled (use for preview slots only)

**Locked cell**:
A playfield cell occupied by a settled mino, identified by a **color**.
_Avoid_: filled cell, binary cell, block (for settled cells)

**Color**:
The tetromino type identity carried by an **active piece** or **locked cell**.
_Avoid_: fill value, block type (when meaning piece color)

### Pieces

**Active piece**:
The one tetromino currently falling on the **playfield**; it moves, rotates, and eventually **settles**.
_Avoid_: current piece, falling tetromino, player piece

**Falling piece**:
The renderer’s view of the **active piece** while it is in motion.
_Avoid_: falling blocks

**Orientation**:
Which of four rotation states (0–3) the **active piece** is in.
_Avoid_: rotation index (in domain speech), angle

**Rotation kick**:
A small shift that lets the **active piece** complete a rotation when the naive rotation would collide.
_Avoid_: wall kick (generic), nudge

**Rest position**:
Where the **active piece** would stop if dropped straight down from its current pose until blocked.
_Avoid_: landing position, drop position, ghost position (as the concept name)

**Ghost piece**:
A non-interactive preview of the **active piece** at its **rest position**.
_Avoid_: ghost blocks, shadow piece

**Hard drop**:
Moving the **active piece** instantly to its **rest position**, then **settling**.
_Avoid_: drop, slam (without “hard”)

### Queue and hold

**Queue**:
The ordered bag of tetrominoes waiting after the **active piece**; the next piece is taken from the front.
_Avoid_: bank, bag (alone), tetromino list

**Upcoming**:
The side-panel label for the queue preview, not the queue data structure itself.
_Avoid_: using “upcoming” for **queue** in code or docs

**Hold**:
A single slot holding one swapped-out tetromino, separate from the **queue**.
_Avoid_: reserve, storage

**Hold lock**:
A rule that **hold** cannot be used again until the next **active piece** spawns after a swap.
_Avoid_: hold delay, lock delay (see **delay clock ticks**)

### Timing

**Clock tick**:
One game-step pulse of the game clock; the unit for gravity and tick-based rules.
_Avoid_: tick (for milliseconds), frame, interval (for wall-clock ms)

**Delay clock ticks**:
The grace period, counted in **clock ticks**, between first ground contact and **settle** while the **active piece** may still move or rotate.
_Avoid_: lock delay (ambiguous with **hold lock**), ground timer

**Spawn delay clock ticks**:
The wait, counted in **clock ticks**, after **settle** before the next **active piece** appears.
_Avoid_: landing pause, spawn pause (without “clock ticks”)

**Settle**:
The **active piece** locks onto the **playfield**; its cells become **locked cells**.
_Avoid_: land (alone), lock (alone), place

**Complete landing**:
A **settle** that includes at least one **line clear** and updates score.
_Avoid_: full landing, erase landing

**Partial landing**:
A **settle** with no **line clear**.
_Avoid_: normal landing, empty landing

### Line clear

**Line clear**:
Removal of one or more full rows of **locked cells** after **settle**, with score and line-count updates.
_Avoid_: erase, erase lines, row delete, clear rows (without “line clear”)

**Line clear flash**:
A brief visual highlight on rows affected by a **line clear**; does not change rules or scoring.
_Avoid_: clear animation, erase flash

## Flagged ambiguities

| Ambiguous | Canonical | Notes |
|-----------|-----------|--------|
| Lock delay | **Delay clock ticks** | Pre-**settle** ground grace only |
| Hold lock / lock hold | **Hold lock** | Post-swap hold restriction only |
| Tick (ms) | **Clock tick** | Wall-clock spacing is not a tick |
| Erase / erased | **Line clear** | Domain and user-facing language |
| Blocks (tetromino) | **Piece** / **active piece** | **Falling piece**, **ghost piece** in the renderer |
| Bank | **Queue** | `tetrominoQueue` in code |
| Binary map | **Locked cell** / playfield occupancy | Logic state is a grid of **empty cells** and **locked cells** |
| Landing position | **Rest position** | Same for **ghost piece** and **hard drop** |
| Upcoming | **Queue** (data) vs panel label | “Upcoming” is UI copy only |

## Example dialogue

**Dev:** When the piece touches the stack, can the player still rotate?

**Expert:** Yes, for **delay clock ticks**—that’s the pre-**settle** grace. It’s not **hold lock**; that only blocks another **hold** swap until the next spawn.

**Dev:** And the gray preview at the bottom?

**Expert:** That’s the **ghost piece** at the **rest position**—where a **hard drop** would put the **active piece**. It isn’t **locked cells** and doesn’t collide.

**Dev:** They cleared two rows but scoring felt delayed.

**Expert:** **Settle** runs first; a **complete landing** includes the **line clear**. **Spawn delay clock ticks** wait after **settle** before the next **active piece**—longer after a **complete landing** than a **partial landing**. The **line clear flash** is only visual.

**Dev:** Should I call it erase in the code?

**Expert:** No—**line clear** everywhere. “Erase” is legacy naming.
