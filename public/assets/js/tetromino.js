import { TETROMINO_DEFINITIONS } from './lib/tetromino-definitions.js';
import { TETROMINO_COLORS } from './lib/tetrominoes.js';

const translateStateBlocks = ({ blocks, offsetX = 0 }, spawnAnchor) =>
  blocks.map((block) => ({
    x: block.x + spawnAnchor.x + offsetX,
    y: block.y + spawnAnchor.y,
  }));

const buildTetrominoStates = (definition) =>
  definition.states.map((state) =>
    translateStateBlocks(state, definition.spawnAnchor)
  );

const getNewTetromino = (definition) => ({
  color: definition.color,
  type: definition.color,
  tetromino: buildTetrominoStates(definition),
  orientation: 0,
});

export const getRandomTetromino = () => {
  const color =
    TETROMINO_COLORS[Math.floor(Math.random() * TETROMINO_COLORS.length)];
  return getNewTetromino(TETROMINO_DEFINITIONS[color]);
};

export const getSpecificTetromino = (color) =>
  getNewTetromino(TETROMINO_DEFINITIONS[color]);

export const moveTetrominoHorizontal = (direction, { tetromino }) =>
  tetromino.map((form) =>
    form.map((block) => ({ ...block, x: block.x + direction }))
  );

export const moveTetrominoDown = ({ tetromino }) =>
  tetromino.map((form) => form.map((block) => ({ ...block, y: block.y + 1 })));

export const moveTetrominoByOffset = ({ dx = 0, dy = 0 }, { tetromino }) =>
  tetromino.map((form) =>
    form.map((block) => ({ ...block, x: block.x + dx, y: block.y + dy }))
  );

export const changeTetrominoOrientation = (
  { tetromino, orientation },
  rotationDirection = 1
) => (orientation + rotationDirection + tetromino.length) % tetromino.length;

export const currentTetromino = ({ tetromino, orientation }) =>
  tetromino[orientation];
