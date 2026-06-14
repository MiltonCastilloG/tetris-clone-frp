import { CLOCK_TICK_MS, LOCKED_MAP_ROW } from './config/settings.js';
import { Stream } from './lib/stream.js';
import { redux } from './lib/redux.js';
import { pipe, findLinesToClear } from './utils.js';
import {
  checkTetrominoCollisionBottom,
  checkTetrominoCollisionLeft,
  checkTetrominoCollisionRight,
  checkTetrominoCollisionTop,
  getValidRotationKick,
} from './collision.js';
import {
  moveTetrominoDown,
  moveTetrominoHorizontal,
  moveTetrominoByOffset,
  changeTetrominoOrientation,
  currentTetromino,
  getRandomTetromino,
  getSpecificTetromino,
} from './tetromino.js';
import {
  moveFallingTetromino,
  updateTetrominoColor,
  addTetrominoToBoard,
  removeFallingPiece,
  addHoldToBoard,
  addScoreToBoard,
  addUpcomingTetrominoesToBoard,
  remapLockedMapVisualization,
  flashLineClearRows,
} from './board.js';
import { fetchForUpload } from './api.js';

const ticks = new Stream((next) => setInterval(next, CLOCK_TICK_MS));
const keyDowns = new Stream((next) =>
  document.addEventListener('keydown', next)
);
const pauseGame = new Stream((next) =>
  document.querySelector('.js-pause-btn').addEventListener('click', next)
);
const uploadGame = new Stream((next) =>
  document.querySelector('.js-upload-game-btn').addEventListener('click', next)
);
const DELAY_CLOCK_TICKS = 2;
const DELAY_CLOCK_TICK_RESET_CAP = 15;

export const InitGame = ({ tetrominoState, mapState, boardState }) => {
  const delayClockTicksState = {
    active: false,
    ticksRemaining: 0,
    resetsUsed: 0,
  };
  const clearGroundDelayClockTicks = () => {
    delayClockTicksState.active = false;
    delayClockTicksState.ticksRemaining = 0;
  };
  const resetDelayClockTicksForNewPiece = () => {
    clearGroundDelayClockTicks();
    delayClockTicksState.resetsUsed = 0;
  };
  const consumeGroundContactTick = () => {
    if (!delayClockTicksState.active) {
      delayClockTicksState.active = true;
      delayClockTicksState.ticksRemaining = DELAY_CLOCK_TICKS;
      return false;
    }

    delayClockTicksState.ticksRemaining -= 1;
    return delayClockTicksState.ticksRemaining <= 0;
  };
  const resetDelayClockTicksFromMovement = () => {
    if (!delayClockTicksState.active) return;
    if (delayClockTicksState.resetsUsed >= DELAY_CLOCK_TICK_RESET_CAP) return;
    delayClockTicksState.resetsUsed += 1;
    delayClockTicksState.ticksRemaining = DELAY_CLOCK_TICKS;
  };

  const updateTetrominoPosition = (state = tetrominoState, action) => {
    switch (action.type) {
      case 'DOWN':
        return { ...state, tetromino: moveTetrominoDown(state) };
      case 'HORIZONTAL':
        return {
          ...state,
          tetromino: moveTetrominoHorizontal(action.direction, state),
        };
      case 'CHANGE_ORIENTATION':
        return {
          ...state,
          tetromino: action.rotationKick
            ? moveTetrominoByOffset(action.rotationKick, state)
            : state.tetromino,
          orientation: changeTetrominoOrientation(
            state,
            action.rotationDirection
          ),
        };
      case 'RESTART':
        return action.newState;
      default:
        return state;
    }
  };
  const tetromino = redux.createStore(updateTetrominoPosition);
  const getCurrentTetromino = pipe(tetromino.getState, currentTetromino);
  const getTetrominoState = tetromino.getState;
  tetromino.subscribe(pipe(currentTetromino, moveFallingTetromino));

  const updateLockedMap = (state = mapState, action) => {
    switch (action.type) {
      case 'FILL_SPACE': {
        state[action.y][action.x] = action.fillWith;
        return state;
      }
      case 'CLEAR_LINES': {
        const newLockedMap = state.filter((arrElem, index) => {
          for (const value of action.yPositions) {
            if (value === index) return false;
          }
          return true;
        });
        action.yPositions.forEach(() =>
          newLockedMap.unshift([...LOCKED_MAP_ROW])
        );
        state = newLockedMap;
        return state;
      }
      case 'SET':
        return action.newLockedMap;
      case 'RESTART':
        return state.map((row) => row.map(() => 0));
      default:
        return state;
    }
  };

  const lockedMap = redux.createStore(updateLockedMap);
  const lockedMapState = lockedMap.getState;
  lockedMap.subscribe(() => {});

  const updateBoardData = (state = boardState, action) => {
    switch (action.type) {
      case 'HOLD':
        return { ...state, hold: action.newTetromino, lockHold: true };
      case 'UNLOCK_HOLD':
        return { ...state, lockHold: false };
      case 'HOLD&TETROMINO': {
        state.tetrominoQueue.shift();
        state.tetrominoQueue.push(action.lastInBank);
        return {
          ...state,
          hold: action.newTetromino,
          tetrominoQueue: state.tetrominoQueue,
        };
      }
      case 'COMPLETE_LANDING': {
        state.tetrominoQueue.shift();
        state.tetrominoQueue.push(action.lastInBank);
        return {
          ...state,
          tetrominoQueue: state.tetrominoQueue,
          lockHold: false,
          totalLines: state.totalLines + action.linesCleared,
          score: state.score + state.scoreByLineClear[action.linesCleared - 1],
        };
      }
      case 'PARTIAL_LANDING': {
        state.tetrominoQueue.shift();
        state.tetrominoQueue.push(action.lastInBank);
        return {
          ...state,
          tetrominoQueue: state.tetrominoQueue,
          lockHold: false,
        };
      }
      case 'RESTART':
        return action.newState;
      default:
        return state;
    }
  };
  const boardData = redux.createStore(updateBoardData);
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
  const isCurrentTetrominoInTopCollision = () =>
    pipe(getCurrentTetromino, checkTetrominoCollisionTop)();

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
    if (!isCurrentTetrominoInTopCollision()) {
      settleCurrentTetromino();
    }
  };

  const actionTicks = ticks.map(canCurrentTetrominoMoveDown);
  const movementTicks = actionTicks.filter((inBorder) => inBorder);
  const landingTicks = actionTicks
    .filter((inBorder) => !inBorder)
    .map(pipe(getCurrentTetromino, checkTetrominoCollisionTop));
  const topLanding = landingTicks.filter((topBorder) => topBorder);
  const groundLanding = landingTicks
    .filter((topBorder) => !topBorder)
    .filter(() => consumeGroundContactTick());
  movementTicks.subscribe(() => {
    clearGroundDelayClockTicks();
    tetromino.dispatch({ type: 'DOWN' });
  });

  groundLanding.subscribe(settleCurrentTetromino);

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
  const isSpace = (event) => 'Space' === event.code;
  const hardDropKeyDowns = Stream.merge(
    keyDowns.filter(isUp),
    keyDowns.filter(isSpace)
  );
  hardDropKeyDowns.subscribe(() => {
    while (canCurrentTetrominoMoveDown()) {
      tetromino.dispatch({ type: 'DOWN' });
    }

    settleCurrentTetrominoIfSafe();
  });

  const isC = (event) => 'KeyC' === event.code;
  const cKeyDowns = keyDowns
    .filter(isC)
    .filter(() => !boardData.getState().lockHold);
  cKeyDowns.subscribe(() => {
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

  const endGame = (gameEnded) => {
    if (!gameEnded) {
      Stream.pauseAll(movementTicks, safeRotateKeyDowns, movements);
      alert('You lose');
    }
  };
  topLanding
    .scan((flag) => flag + 1, 0)
    .subscribe((gameEnded) => endGame(gameEnded > 1));
  pauseGame
    .scan((paused) => !paused, true)
    .subscribe((paused) =>
      paused
        ? Stream.resumeAll(movementTicks, safeRotateKeyDowns, movements)
        : Stream.pauseAll(movementTicks, safeRotateKeyDowns, movements)
    );

  uploadGame
    .scan((flag) => flag + 1, 0)
    .subscribe(async () => {
      Stream.pauseAll(movementTicks, safeRotateKeyDowns, movements);
      const tetrominoToSave = tetromino.getState();
      const lockedMapToSave = lockedMap.getState();
      const boardDataToSave = boardData.getState();
      const response = await fetchForUpload(
        tetrominoToSave,
        lockedMapToSave,
        boardDataToSave
      );
      const data = await response.json();
      alert(`Game save with hash ${data.hash}`);
    });
};
