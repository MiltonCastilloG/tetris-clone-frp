const pipe =
  (...fns) =>
  (x) =>
    fns.reduce((v, f) => f(v), x);

const isSpaceFilled = (number) => number !== EMPTY_SPACE;
const isLineFull = (map) => map.length == map.filter(isSpaceFilled).length;
//const eraseLine = y => BINARY_MAP[y] = BINARY_MAP[y].map(()=>0);
const eraseLines = (binaryMap) => {
  const linesToErase = binaryMap.reduce((acc, value, index) => {
    if (isLineFull(value)) acc.push(index);
    return acc;
  }, []);
  return linesToErase;
};

const checkTopBorder = ({ y }) => y <= 0;
const checkBottomBorder = (rowIndex, binaryMapLen) =>
  rowIndex < binaryMapLen - 1;
const checkLeftBorder = (columnIndex) => columnIndex > 0;
const checkRightBorder = (columnIndex, binaryMapRowLen) =>
  columnIndex < binaryMapRowLen - 1;
const checkCollisionBottom =
  (binaryMap) =>
  ({ y, x }) =>
    checkBottomBorder(y, binaryMap.length)
      ? !isSpaceFilled(binaryMap[y + 1][x])
      : false;
const checkCollisionLeft =
  (binaryMap) =>
  ({ y, x }) =>
    checkLeftBorder(x) ? !isSpaceFilled(binaryMap[y][x - 1]) : false;
const checkCollisionRight =
  (binaryMap) =>
  ({ y, x }) =>
    checkRightBorder(x, binaryMap[0].length)
      ? !isSpaceFilled(binaryMap[y][x + 1])
      : false;

const booleanReducer = (acc, value) => acc && value;
const checkBlocksCollision = (blocks, binaryMap) =>
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
const projectTetrominoMovement = (state, movement) => {
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
const checkTetrominoCollisionBottom = (getBinaryMap) => (tetrominoState) =>
  checkBlocksCollision(
    projectTetrominoMovement(tetrominoState, { dy: 1 }),
    getBinaryMap()
  );
const checkTetrominoCollisionRight = (getBinaryMap) => (tetrominoState) =>
  checkBlocksCollision(
    projectTetrominoMovement(tetrominoState, { dx: 1 }),
    getBinaryMap()
  );
const checkTetrominoCollisionLeft = (getBinaryMap) => (tetrominoState) =>
  checkBlocksCollision(
    projectTetrominoMovement(tetrominoState, { dx: -1 }),
    getBinaryMap()
  );
const getValidRotationKick =
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
const checkTetrominoCollisionRotate = (getBinaryMap) => (tetrominoState) =>
  !!getValidRotationKick(getBinaryMap)(tetrominoState);
const topBooleanReducer = (acc, value) => acc || value;
const checkTetrominoCollisionTop = (tetromino) =>
  tetromino.map(checkTopBorder).reduce(topBooleanReducer);

const tetrominoLanding = () => {
  const erasedLinesLen = eraseLines();
  return erasedLinesLen;
};

const fetchForUpload = async (
  tetrominoToSave,
  binaryMapTosave,
  boardDataToSave
) => {
  return await fetch('upload/game', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({
      tetromino: tetrominoToSave,
      binaryMap: binaryMapTosave,
      boardData: boardDataToSave,
    }),
  });
};

const fetchForSetup = async (hash) => {
  return await fetch(`fetch/game?hash=${hash}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
};
