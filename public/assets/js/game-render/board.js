export { drawBoard, flashLineClearRows, remapLockedMapVisualization } from './playfield-draw.js';
export {
  moveFallingTetromino,
  updateTetrominoColor,
  addTetrominoToBoard,
  removeFallingPiece,
} from './playfield-draw.js';
export {
  addHoldToBoard,
  addScoreToBoard,
  addUpcomingTetrominoesToBoard,
} from './preview-panels.js';

import { drawBoard } from './playfield-draw.js';
import { initPlayfieldLayout } from './playfield-layout.js';

if (typeof window !== 'undefined') {
  const boot = () => initPlayfieldLayout(() => drawBoard());
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
}
