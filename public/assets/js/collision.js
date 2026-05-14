import { isSpaceFilled } from './utils.js';

const checkTopBorder = ({ y }) => y <= 0;

const booleanReducer = (acc, value) => acc && value;
export const checkBlocksCollision = (blocks, binaryMap) =>
  blocks
    .map(
      ({ y, x }) =>
        y >= 0 &&
        y < binaryMap.length &&
        x >= 0 &&
        x < binaryMap[0].length &&
        !isSpaceFilled(binaryMap[y][x])
    )
    .reduce(booleanReducer, true);

const ROTATION_KICKS = [
  { dx: 0, dy: 0 },
  { dx: -1, dy: 0 },
  { dx: 1, dy: 0 },
  { dx: -2, dy: 0 },
  { dx: 2, dy: 0 },
  { dx: 0, dy: -1 },
];

export const projectTetrominoMovement = (state, movement) => {
  const orientationLen = state.tetromino.length;
  const orientation = movement.rotate
    ? (state.orientation + (movement.rotationDirection || 1) + orientationLen) %
      orientationLen
    : state.orientation;

  return state.tetromino[orientation].map((block) => ({
    y: block.y + (movement.dy || 0),
    x: block.x + (movement.dx || 0),
  }));
};

export const checkTetrominoCollisionBottom =
  (getBinaryMap) => (tetrominoState) =>
    checkBlocksCollision(
      projectTetrominoMovement(tetrominoState, { dy: 1 }),
      getBinaryMap()
    );
export const checkTetrominoCollisionRight =
  (getBinaryMap) => (tetrominoState) =>
    checkBlocksCollision(
      projectTetrominoMovement(tetrominoState, { dx: 1 }),
      getBinaryMap()
    );
export const checkTetrominoCollisionLeft = (getBinaryMap) => (tetrominoState) =>
  checkBlocksCollision(
    projectTetrominoMovement(tetrominoState, { dx: -1 }),
    getBinaryMap()
  );

export const getValidRotationKick =
  (getBinaryMap, rotationDirection = 1) =>
  (tetrominoState) => {
    const binaryMap = getBinaryMap();
    for (const kick of ROTATION_KICKS) {
      const projectedBlocks = projectTetrominoMovement(tetrominoState, {
        rotate: true,
        rotationDirection,
        ...kick,
      });
      if (checkBlocksCollision(projectedBlocks, binaryMap)) return kick;
    }
    return null;
  };

const topBooleanReducer = (acc, value) => acc || value;
export const checkTetrominoCollisionTop = (tetromino) =>
  tetromino.map(checkTopBorder).reduce(topBooleanReducer);
