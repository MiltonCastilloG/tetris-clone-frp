const translateStateBlocks = ({ blocks, offsetX = 0 }, spawnAnchor) =>
    blocks.map(block => ({
        x: block.x + spawnAnchor.x + offsetX,
        y: block.y + spawnAnchor.y
    }));

const buildTetrominoStates = definition =>
    definition.states.map(state => translateStateBlocks(state, definition.spawnAnchor));

const getNewTetromino = definition => ({
    color: definition.color,
    type: definition.color,
    tetromino: buildTetrominoStates(definition),
    orientation: 0
});

const getRandomTetromino = () => {
    const color = TETROMINO_COLORS[Math.floor(Math.random() * TETROMINO_COLORS.length)];
    return getNewTetromino(TETROMINO_DEFINITIONS[color]);
};

const getSpecificTetromino = color => getNewTetromino(TETROMINO_DEFINITIONS[color]);
const moveTetrominoHorizontal = (direction, { tetromino }) => tetromino.map(form => form.map(block => ({ ...block, x: block.x + direction })));
const moveTetrominoDown = ({ tetromino }) => tetromino.map(form => form.map(block => ({ ...block, y: block.y + 1 })));
const moveTetrominoByOffset = ({ dx = 0, dy = 0 }, { tetromino }) =>
    tetromino.map(form => form.map(block => ({ ...block, x: block.x + dx, y: block.y + dy })));
const changeTetrominoOrientation = ({ tetromino, orientation }) => orientation < tetromino.length - 1 ? orientation + 1 : 0;
const currentTetromino = ({ tetromino, orientation }) => tetromino[orientation];