import {
  checkTetrominoCollisionLeft,
  checkTetrominoCollisionRight,
  getValidRotationKick,
} from '../shared/collision.js';
import { updateTetrominoColor } from '../game-render/board.js';
import { keyDowns } from './streams.js';
import { Stream } from '../lib/stream.js';
import {
  getRandomTetromino,
  getSpecificTetromino,
} from './tetromino.js';

export const wireInput = ({
  tetromino,
  boardData,
  lockedMapState,
  getTetrominoState,
  canCurrentTetrominoMoveDown,
  clearGroundDelayClockTicks,
  resetDelayClockTicksFromMovement,
  resetDelayClockTicksForNewPiece,
  settleCurrentTetrominoIfSafe,
}) => {
  const isDown = (event) => 'ArrowDown' === event.code;
  const ROTATE_LEFT = -1;
  const ROTATE_RIGHT = 1;
  const isRotateLeft = (event) => 'KeyA' === event.code;
  const isRotateRight = (event) => 'KeyS' === event.code;
  const rotateLeftKeyDowns = keyDowns
    .filter(isRotateLeft)
    .map(() => ROTATE_LEFT);
  const rotateRightKeyDowns = keyDowns
    .filter(isRotateRight)
    .map(() => ROTATE_RIGHT);
  const rotateKeyDowns = Stream.merge(rotateLeftKeyDowns, rotateRightKeyDowns);
  const downKeyDowns = keyDowns.filter(isDown);
  const safeRotateKeyDowns = rotateKeyDowns
    .map((rotationDirection) => ({
      rotationDirection,
      rotationKick: getValidRotationKick(
        lockedMapState,
        rotationDirection
      )(getTetrominoState()),
    }))
    .filter(({ rotationKick }) => rotationKick !== null);
  safeRotateKeyDowns.subscribe(({ rotationDirection, rotationKick }) => {
    tetromino.dispatch({
      type: 'CHANGE_ORIENTATION',
      rotationKick,
      rotationDirection,
    });
    resetDelayClockTicksFromMovement();
  });
  downKeyDowns.subscribe(() => {
    const canMoveDown = canCurrentTetrominoMoveDown();
    if (canMoveDown) {
      clearGroundDelayClockTicks();
      tetromino.dispatch({ type: 'DOWN' });

      const canMoveAfterDrop = canCurrentTetrominoMoveDown();
      if (!canMoveAfterDrop) settleCurrentTetrominoIfSafe();
      return;
    }

    settleCurrentTetrominoIfSafe();
  });

  const isUp = (event) => 'ArrowUp' === event.code;
  const hardDropKeyDowns = keyDowns.filter(isUp);
  hardDropKeyDowns.subscribe(() => {
    while (canCurrentTetrominoMoveDown()) {
      tetromino.dispatch({ type: 'DOWN' });
    }

    settleCurrentTetrominoIfSafe();
  });

  const isD = (event) => 'KeyD' === event.code;
  const dKeyDowns = keyDowns
    .filter(isD)
    .filter(() => !boardData.getState().lockHold);
  dKeyDowns.subscribe(() => {
    const { color } = tetromino.getState();
    const { hold, tetrominoQueue } = boardData.getState();
    const fallingTetromino = getSpecificTetromino(color);
    const newTetrominoInBoard = hold || tetrominoQueue[0];
    if (hold === undefined)
      boardData.dispatch({
        type: 'HOLD&TETROMINO',
        newTetromino: fallingTetromino,
        lastInBank: getRandomTetromino(),
      });
    else boardData.dispatch({ type: 'HOLD', newTetromino: fallingTetromino });

    resetDelayClockTicksForNewPiece();
    tetromino.dispatch({ type: 'RESTART', newState: newTetrominoInBoard });
    updateTetrominoColor(newTetrominoInBoard.color);
  });

  const LEFT = -1;
  const RIGHT = 1;
  const isLeft = (event) => 'ArrowLeft' === event.code;
  const isRight = (event) => 'ArrowRight' === event.code;
  const leftKeyDowns = keyDowns
    .filter(isLeft)
    .filter(() =>
      checkTetrominoCollisionLeft(lockedMapState)(getTetrominoState())
    )
    .map(() => LEFT);
  const rightKeyDowns = keyDowns
    .filter(isRight)
    .filter(() =>
      checkTetrominoCollisionRight(lockedMapState)(getTetrominoState())
    )
    .map(() => RIGHT);
  const movements = Stream.merge(leftKeyDowns, rightKeyDowns);
  movements.subscribe((direction) => {
    tetromino.dispatch({ type: 'HORIZONTAL', direction: direction });
    resetDelayClockTicksFromMovement();
  });

  return { safeRotateKeyDowns, movements };
};
