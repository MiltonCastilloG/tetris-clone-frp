import { INTIAL_CLOCK_SPEED, BINARY_MAP_ROW } from './config/settings.js';
import { Stream } from './lib/stream.js';
import { redux } from './lib/redux.js';
import { pipe, eraseLines } from './utils.js';
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
  removeFallingBlocks,
  addHoldToBoard,
  addScoreToBoard,
  addUpcomingTetrominoesToBoard,
  remapBlocksVisualization,
  flashClearedRows,
} from './board.js';
import { fetchForUpload } from './api.js';

const ticks = new Stream((next) => setInterval(next, INTIAL_CLOCK_SPEED));
const keyDowns = new Stream((next) =>
  document.addEventListener('keydown', next)
);
const pauseGame = new Stream((next) =>
  document.querySelector('.js-pause-btn').addEventListener('click', next)
);
const uploadGame = new Stream((next) =>
  document.querySelector('.js-upload-game-btn').addEventListener('click', next)
);
const LOCK_DELAY_TICKS = 2;
const LOCK_DELAY_RESET_CAP = 15;

export const InitGame = ({ tetrominoState, mapState, boardState }) => {
  const lockDelayState = {
    active: false,
    ticksRemaining: 0,
    resetsUsed: 0,
  };
  const clearGroundLockDelay = () => {
    lockDelayState.active = false;
    lockDelayState.ticksRemaining = 0;
  };
  const resetLockDelayForNewPiece = () => {
    clearGroundLockDelay();
    lockDelayState.resetsUsed = 0;
  };
  const consumeGroundContactTick = () => {
    if (!lockDelayState.active) {
      lockDelayState.active = true;
      lockDelayState.ticksRemaining = LOCK_DELAY_TICKS;
      return false;
    }

    lockDelayState.ticksRemaining -= 1;
    return lockDelayState.ticksRemaining <= 0;
  };
  const resetLockDelayFromMovement = () => {
    if (!lockDelayState.active) return;
    if (lockDelayState.resetsUsed >= LOCK_DELAY_RESET_CAP) return;
    lockDelayState.resetsUsed += 1;
    lockDelayState.ticksRemaining = LOCK_DELAY_TICKS;
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

  const updateBinaryMap = (state = mapState, action) => {
    switch (action.type) {
      case 'FILL_SPACE': {
        state[action.y][action.x] = action.fillWith;
        return state;
      }
      case 'ERASE_LINES': {
        const newBinaryMap = state.filter((arrElem, index) => {
          for (const value of action.yPositions) {
            if (value === index) return false;
          }
          return true;
        });
        action.yPositions.forEach(() =>
          newBinaryMap.unshift([...BINARY_MAP_ROW])
        );
        state = newBinaryMap;
        return state;
      }
      case 'SET':
        return action.newBinaryMap;
      case 'RESTART':
        return state.map((row) => row.map(() => 0));
      default:
        return state;
    }
  };

  const binaryMap = redux.createStore(updateBinaryMap);
  const binaryMapState = binaryMap.getState;
  binaryMap.subscribe(() => {});

  const updateBoardData = (state = boardState, action) => {
    switch (action.type) {
      case 'HOLD':
        return { ...state, hold: action.newTetromino, lockHold: true };
      case 'UNLOCK_HOLD':
        return { ...state, lockHold: false };
      case 'HOLD&TETROMINO': {
        state.tetrominoesBank.shift();
        state.tetrominoesBank.push(action.lastInBank);
        return {
          ...state,
          hold: action.newTetromino,
          tetrominoesBank: state.tetrominoesBank,
        };
      }
      case 'COMPLETE_LANDING': {
        state.tetrominoesBank.shift();
        state.tetrominoesBank.push(action.lastInBank);
        return {
          ...state,
          tetrominoesBank: state.tetrominoesBank,
          lockHold: false,
          totalLines: state.totalLines + action.erasedLines,
          score: state.score + state.scoreByErasedLines[action.erasedLines - 1],
        };
      }
      case 'PARTIAL_LANDING': {
        state.tetrominoesBank.shift();
        state.tetrominoesBank.push(action.lastInBank);
        return {
          ...state,
          tetrominoesBank: state.tetrominoesBank,
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
    const { hold, score, totalLines, tetrominoesBank } = state;
    addHoldToBoard(hold);
    addScoreToBoard(score, totalLines);
    addUpcomingTetrominoesToBoard(tetrominoesBank);
  });
  const fillMapSpace =
    (color) =>
    ({ y, x }) =>
      binaryMap.dispatch({ type: 'FILL_SPACE', x: x, y: y, fillWith: color });
  const canCurrentTetrominoMoveDown = () =>
    checkTetrominoCollisionBottom(binaryMapState)(getTetrominoState());
  const isCurrentTetrominoInTopCollision = () =>
    pipe(getCurrentTetromino, checkTetrominoCollisionTop)();

  const settleCurrentTetromino = () => {
    const newTetromino = boardData.getState().tetrominoesBank[0];
    const nextTetromino = getRandomTetromino();

    resetLockDelayForNewPiece();
    removeFallingBlocks();
    getCurrentTetromino().forEach(fillMapSpace(tetromino.getState().color));
    const linesToErase = eraseLines(binaryMapState());

    tetromino.dispatch({ type: 'RESTART', newState: newTetromino });
    if (linesToErase.length > 0) {
      flashClearedRows(linesToErase);
      binaryMap.dispatch({ type: 'ERASE_LINES', yPositions: linesToErase });
      boardData.dispatch({
        type: 'COMPLETE_LANDING',
        lastInBank: nextTetromino,
        erasedLines: linesToErase.length,
      });
    } else
      boardData.dispatch({
        type: 'PARTIAL_LANDING',
        lastInBank: nextTetromino,
      });

    remapBlocksVisualization(binaryMapState());
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
    clearGroundLockDelay();
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
        binaryMapState,
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
    resetLockDelayFromMovement();
  });
  downKeyDowns.subscribe(() => {
    const canMoveDown = canCurrentTetrominoMoveDown();
    if (canMoveDown) {
      clearGroundLockDelay();
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
    const { hold, tetrominoesBank } = boardData.getState();
    const fallingTetromino = getSpecificTetromino(color);
    const newTetrominoInBoard = hold || tetrominoesBank[0];
    if (hold === undefined)
      boardData.dispatch({
        type: 'HOLD&TETROMINO',
        newTetromino: fallingTetromino,
        lastInBank: getRandomTetromino(),
      });
    else boardData.dispatch({ type: 'HOLD', newTetromino: fallingTetromino });

    resetLockDelayForNewPiece();
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
      checkTetrominoCollisionLeft(binaryMapState)(getTetrominoState())
    )
    .map(() => LEFT);
  const rightKeyDowns = keyDowns
    .filter(isRight)
    .filter(() =>
      checkTetrominoCollisionRight(binaryMapState)(getTetrominoState())
    )
    .map(() => RIGHT);
  const movements = Stream.merge(leftKeyDowns, rightKeyDowns);
  movements.subscribe((direction) => {
    tetromino.dispatch({ type: 'HORIZONTAL', direction: direction });
    resetLockDelayFromMovement();
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
      const binaryMapTosave = binaryMap.getState();
      const boardDataToSave = boardData.getState();
      const response = await fetchForUpload(
        tetrominoToSave,
        binaryMapTosave,
        boardDataToSave
      );
      const data = await response.json();
      alert(`Game save with hash ${data.hash}`);
    });
};
