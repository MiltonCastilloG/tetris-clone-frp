import { LOCKED_MAP_ROW } from '../config/settings.js';
import {
  moveTetrominoDown,
  moveTetrominoHorizontal,
  moveTetrominoByOffset,
  changeTetrominoOrientation,
} from './tetromino.js';

export const updateTetrominoPosition = (state, action) => {
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

export const updateLockedMap = (state, action) => {
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

export const updateBoardData = (state, action) => {
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
