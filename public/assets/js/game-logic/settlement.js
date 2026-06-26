import { pipe, findLinesToClear } from '../shared/utils.js';
import { checkTetrominoCollisionTop } from '../shared/collision.js';
import { getRandomTetromino } from './tetromino.js';
import {
  removeFallingPiece,
  addTetrominoToBoard,
  remapLockedMapVisualization,
  flashLineClearRows,
} from '../game-render/board.js';

export const createSettlement = ({
  tetromino,
  boardData,
  lockedMap,
  lockedMapState,
  getCurrentTetromino,
  fillMapSpace,
  resetDelayClockTicksForNewPiece,
}) => {
  const settleCurrentTetromino = () => {
    const newTetromino = boardData.getState().tetrominoQueue[0];
    const nextTetromino = getRandomTetromino();

    resetDelayClockTicksForNewPiece();
    removeFallingPiece();
    getCurrentTetromino().forEach(fillMapSpace(tetromino.getState().color));
    const linesToClear = findLinesToClear(lockedMapState());

    tetromino.dispatch({ type: 'RESTART', newState: newTetromino });
    if (linesToClear.length > 0) {
      flashLineClearRows(linesToClear);
      lockedMap.dispatch({ type: 'CLEAR_LINES', yPositions: linesToClear });
      boardData.dispatch({
        type: 'COMPLETE_LANDING',
        lastInBank: nextTetromino,
        linesCleared: linesToClear.length,
      });
    } else
      boardData.dispatch({
        type: 'PARTIAL_LANDING',
        lastInBank: nextTetromino,
      });

    remapLockedMapVisualization(lockedMapState());
    addTetrominoToBoard(newTetromino);
  };
  const settleCurrentTetrominoIfSafe = () => {
    if (!pipe(getCurrentTetromino, checkTetrominoCollisionTop)()) {
      settleCurrentTetromino();
    }
  };

  return { settleCurrentTetromino, settleCurrentTetrominoIfSafe };
};
