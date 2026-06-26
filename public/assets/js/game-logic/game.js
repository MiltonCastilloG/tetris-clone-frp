import { pipe } from '../shared/utils.js';
import { redux } from '../lib/redux.js';
import { checkTetrominoCollisionBottom } from '../shared/collision.js';
import { currentTetromino } from './tetromino.js';
import {
  updateTetrominoPosition,
  updateLockedMap,
  updateBoardData,
} from './reducers.js';
import { createDelayClock } from './delay-clock.js';
import { createSettlement } from './settlement.js';
import { wireGameLoop } from './game-loop.js';
import { wireInput } from './input.js';
import { wireLifecycle } from './lifecycle.js';
import {
  moveFallingTetromino,
  addHoldToBoard,
  addScoreToBoard,
  addUpcomingTetrominoesToBoard,
} from '../game-render/board.js';

export const InitGame = ({ tetrominoState, mapState, boardState }) => {
  const {
    clearGroundDelayClockTicks,
    resetDelayClockTicksForNewPiece,
    consumeGroundContactTick,
    resetDelayClockTicksFromMovement,
  } = createDelayClock();

  const tetromino = redux.createStore((state, action) =>
    updateTetrominoPosition(state ?? tetrominoState, action)
  );
  const getCurrentTetromino = pipe(tetromino.getState, currentTetromino);
  const getTetrominoState = tetromino.getState;
  tetromino.subscribe(pipe(currentTetromino, moveFallingTetromino));

  const lockedMap = redux.createStore((state, action) =>
    updateLockedMap(state ?? mapState, action)
  );
  const lockedMapState = lockedMap.getState;
  lockedMap.subscribe(() => {});

  const boardData = redux.createStore((state, action) =>
    updateBoardData(state ?? boardState, action)
  );
  boardData.subscribe((state) => {
    const { hold, score, totalLines, tetrominoQueue } = state;
    addHoldToBoard(hold);
    addScoreToBoard(score, totalLines);
    addUpcomingTetrominoesToBoard(tetrominoQueue);
  });

  const fillMapSpace =
    (color) =>
    ({ y, x }) =>
      lockedMap.dispatch({ type: 'FILL_SPACE', x: x, y: y, fillWith: color });
  const canCurrentTetrominoMoveDown = () =>
    checkTetrominoCollisionBottom(lockedMapState)(getTetrominoState());

  const { settleCurrentTetromino, settleCurrentTetrominoIfSafe } =
    createSettlement({
      tetromino,
      boardData,
      lockedMap,
      lockedMapState,
      getCurrentTetromino,
      fillMapSpace,
      resetDelayClockTicksForNewPiece,
    });

  const { movementTicks, topLanding } = wireGameLoop({
    tetromino,
    canCurrentTetrominoMoveDown,
    getCurrentTetromino,
    clearGroundDelayClockTicks,
    consumeGroundContactTick,
    settleCurrentTetromino,
  });

  const { safeRotateKeyDowns, movements } = wireInput({
    tetromino,
    boardData,
    lockedMapState,
    getTetrominoState,
    canCurrentTetrominoMoveDown,
    clearGroundDelayClockTicks,
    resetDelayClockTicksFromMovement,
    resetDelayClockTicksForNewPiece,
    settleCurrentTetrominoIfSafe,
  });

  wireLifecycle({
    tetromino,
    lockedMap,
    boardData,
    movementTicks,
    safeRotateKeyDowns,
    movements,
    topLanding,
  });
};
