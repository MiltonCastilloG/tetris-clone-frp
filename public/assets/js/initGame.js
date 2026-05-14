import { BINARY_MAP, BASE_ERASE_SCORE } from './config/settings.js';
import { fetchForSetup } from './api.js';
import { getRandomTetromino } from './tetromino.js';
import {
  addTetrominoToBoard,
  addHoldToBoard,
  addScoreToBoard,
  addUpcomingTetrominoesToBoard,
  remapBlocksVisualization,
} from './board.js';
import { InitGame } from './game.js';

export const startGameLoop = (states) => InitGame(states);

export const createFreshGamePayload = () => {
  const tetrominoState = getRandomTetromino();
  const boardState = {
    tetrominoesBank: [
      getRandomTetromino(),
      getRandomTetromino(),
      getRandomTetromino(),
    ],
    hold: undefined,
    lastHold: undefined,
    score: 0,
    totalLines: 0,
    scoreByErasedLines: BASE_ERASE_SCORE,
    lockHold: false,
  };
  const mapState = [...BINARY_MAP];
  addTetrominoToBoard(tetrominoState);
  return { tetrominoState, mapState, boardState };
};

export const createLoadedGamePayload = async (hash) => {
  const response = await fetchForSetup(hash);
  const data = await response.json();
  const tetrominoState = data.tetromino;
  const mapState = data.binaryMap;
  const boardState = data.boardData;

  const { hold, score, totalLines, tetrominoesBank } = boardState;
  if (hold !== undefined) addHoldToBoard(hold);
  addScoreToBoard(score, totalLines);
  addUpcomingTetrominoesToBoard(tetrominoesBank);
  remapBlocksVisualization(mapState);
  addTetrominoToBoard(tetrominoState);

  return { tetrominoState, mapState, boardState };
};
