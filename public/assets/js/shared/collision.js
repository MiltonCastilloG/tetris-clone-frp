import { isSpaceFilled } from './utils.js';

const checkTopBorder = ({ y }) => y <= 0;

const booleanReducer = (acc, value) => acc && value;
export const checkBlocksCollision = (blocks, lockedMap) =>
  blocks
    .map(
      ({ y, x }) =>
        y >= 0 &&
        y < lockedMap.length &&
        x >= 0 &&
        x < lockedMap[0].length &&
        !isSpaceFilled(lockedMap[y][x])
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
  (getLockedMap) => (tetrominoState) =>
    checkBlocksCollision(
      projectTetrominoMovement(tetrominoState, { dy: 1 }),
      getLockedMap()
    );
export const checkTetrominoCollisionRight =
  (getLockedMap) => (tetrominoState) =>
    checkBlocksCollision(
      projectTetrominoMovement(tetrominoState, { dx: 1 }),
      getLockedMap()
    );
export const checkTetrominoCollisionLeft = (getLockedMap) => (tetrominoState) =>
  checkBlocksCollision(
    projectTetrominoMovement(tetrominoState, { dx: -1 }),
    getLockedMap()
  );

export const getValidRotationKick =
  (getLockedMap, rotationDirection = 1) =>
  (tetrominoState) => {
    const lockedMap = getLockedMap();
    for (const kick of ROTATION_KICKS) {
      const projectedBlocks = projectTetrominoMovement(tetrominoState, {
        rotate: true,
        rotationDirection,
        ...kick,
      });
      if (checkBlocksCollision(projectedBlocks, lockedMap)) return kick;
    }
    return null;
  };

const topBooleanReducer = (acc, value) => acc || value;
export const checkTetrominoCollisionTop = (tetromino) =>
  tetromino.map(checkTopBorder).reduce(topBooleanReducer);
