import { LOCKED_MAP, BASE_LINE_CLEAR_SCORE } from './config/settings.js';
import { fetchForSetup } from './api.js';
import { getRandomTetromino } from './game-logic/tetromino.js';
import {
  addTetrominoToBoard,
  addHoldToBoard,
  addScoreToBoard,
  addUpcomingTetrominoesToBoard,
  remapLockedMapVisualization,
} from './game-render/board.js';
import { InitGame } from './game-logic/game.js';

export const startGameLoop = (states) => InitGame(states);

export const createFreshGamePayload = () => {
  const tetrominoState = getRandomTetromino();
  const boardState = {
    tetrominoQueue: [
      getRandomTetromino(),
      getRandomTetromino(),
      getRandomTetromino(),
    ],
    hold: undefined,
    lastHold: undefined,
    score: 0,
    totalLines: 0,
    scoreByLineClear: BASE_LINE_CLEAR_SCORE,
    lockHold: false,
  };
  const mapState = structuredClone(LOCKED_MAP);
  addTetrominoToBoard(tetrominoState);
  return { tetrominoState, mapState, boardState };
};

const normalizeLoadedBoardState = (boardData) => ({
  ...boardData,
  tetrominoQueue: boardData.tetrominoQueue ?? boardData.tetrominoesBank,
  scoreByLineClear: boardData.scoreByLineClear ?? boardData.scoreByErasedLines,
});

export const createLoadedGamePayload = async (hash) => {
  const response = await fetchForSetup(hash);
  const data = await response.json();
  const tetrominoState = data.tetromino;
  const mapState = data.lockedMap ?? data.binaryMap;
  const boardState = normalizeLoadedBoardState(data.boardData);

  const { hold, score, totalLines, tetrominoQueue } = boardState;
  if (hold !== undefined) addHoldToBoard(hold);
  addScoreToBoard(score, totalLines);
  addUpcomingTetrominoesToBoard(tetrominoQueue);
  remapLockedMapVisualization(mapState);
  addTetrominoToBoard(tetrominoState);

  return { tetrominoState, mapState, boardState };
};
