const getBoardCanvas = () => document.querySelector(".js-board");

const boardViewState = {
    lockedMap: BINARY_MAP.map(row => [...row]),
    fallingBlocks: [],
    fallingColor: null
};

const drawPlayfieldBackground = ctx => {
    const background = ctx.createLinearGradient(0, 0, 0, BOARD_HEIGHT);
    background.addColorStop(0, "#11141d");
    background.addColorStop(1, "#06080d");
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);
};

const drawPlayfieldGrid = ctx => {
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 1;

    for (let x = 0; x <= HORIZONTAL_DIMENSIONS; x += 1) {
        const px = x * HORIZONTAL_MOVEMENT + 0.5;
        ctx.beginPath();
        ctx.moveTo(px, 0);
        ctx.lineTo(px, BOARD_HEIGHT);
        ctx.stroke();
    }

    for (let y = 0; y <= VERTICAL_DIMENSIONS; y += 1) {
        const py = y * VERTICAL_MOVEMENT + 0.5;
        ctx.beginPath();
        ctx.moveTo(0, py);
        ctx.lineTo(BOARD_WIDTH, py);
        ctx.stroke();
    }
};

const getBoardContext = () => {
    const board = getBoardCanvas();
    if (!board) return null;
    const dpr = window.devicePixelRatio || 1;
    const expectedWidth = BOARD_WIDTH * dpr;
    const expectedHeight = BOARD_HEIGHT * dpr;

    if (board.width !== expectedWidth || board.height !== expectedHeight) {
        board.width = expectedWidth;
        board.height = expectedHeight;
        board.style.width = `${BOARD_WIDTH}px`;
        board.style.height = `${BOARD_HEIGHT}px`;
    }

    const ctx = board.getContext("2d");
    if (!ctx) return null;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return ctx;
};

const drawCell = (ctx, { y, x }, color) => {
    const pxX = x * HORIZONTAL_MOVEMENT;
    const pxY = y * VERTICAL_MOVEMENT;
    const width = HORIZONTAL_MOVEMENT - 2;
    const height = VERTICAL_MOVEMENT - 2;
    const left = pxX + 1;
    const top = pxY + 1;

    ctx.fillStyle = color;
    ctx.fillRect(left, top, width, height);

    // Soft vertical shading for a subtle 3D block feel.
    const shade = ctx.createLinearGradient(left, top, left, top + height);
    shade.addColorStop(0, "rgba(255, 255, 255, 0.2)");
    shade.addColorStop(1, "rgba(0, 0, 0, 0.18)");
    ctx.fillStyle = shade;
    ctx.fillRect(left, top, width, height);

    ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
    ctx.strokeRect(left + 0.5, top + 0.5, width - 1, height - 1);
    ctx.strokeStyle = "rgba(0, 0, 0, 0.45)";
    ctx.strokeRect(left, top, width, height);
};

const drawBoard = () => {
    const ctx = getBoardContext();
    if (!ctx) return;

    ctx.clearRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);
    drawPlayfieldBackground(ctx);
    drawPlayfieldGrid(ctx);

    boardViewState.lockedMap.forEach((row, y) => {
        row.forEach((spaceNum, x) => {
            if (isSpaceFilled(spaceNum)) {
                drawCell(ctx, { y, x }, colorFactory(spaceNum));
            }
        });
    });

    if (boardViewState.fallingColor) {
        boardViewState.fallingBlocks.forEach(block =>
            drawCell(ctx, block, colorFactory(boardViewState.fallingColor))
        );
    }

    ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, BOARD_WIDTH - 2, BOARD_HEIGHT - 2);
};

const moveFallingTetronimo = tetronimo => {
    boardViewState.fallingBlocks = tetronimo.map(block => ({ ...block }));
    drawBoard();
};

const updateTetronimoColor = color => {
    boardViewState.fallingColor = color;
    drawBoard();
};

const addTetronimoToBoard = ({ tetronimo, orientation, color }) => {
    boardViewState.fallingBlocks = tetronimo[orientation].map(block => ({ ...block }));
    boardViewState.fallingColor = color;
    drawBoard();
};

const removeFallingBlocks = () => {
    boardViewState.fallingBlocks = [];
    boardViewState.fallingColor = null;
    drawBoard();
};

const addHoldToBoard = holdTetronimo => document.querySelector(`.${HOLD_TETRONIMO_CLASS}`).style.backgroundImage = `url(./assets/img/tetronimo_${holdTetronimo.color}.png)`;
const addScoreToBoard = (score, lineScore) => {
    document.querySelector(`.${SCORE_CLASS}`).textContent = score;
    document.querySelector(`.${LINE_SCORE_CLASS}`).textContent = lineScore;
};
const addUpcomingTetronimoesToBoard = tetronimoesBank => {
    const upcommingSpace = document.querySelector(`.${UPCOMMING_TETRONIMOES}`);
    upcommingSpace.innerHTML = "";
    tetronimoesBank.forEach(tetronimo => {
        const upcomming = document.createElement("div");
        upcomming.className = `upcomming js-upcomming`;
        upcomming.style.backgroundImage = `url(./assets/img/tetronimo_${tetronimo.color}.png)`;
        upcommingSpace.appendChild(upcomming);
    });
};

const remapBlocksVisualization = binaryMap => {
    boardViewState.lockedMap = binaryMap.map(row => [...row]);
    drawBoard();
};