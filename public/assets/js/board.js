const getBoardCanvas = () => document.querySelector('.js-board');

const boardViewState = {
  lockedMap: BINARY_MAP.map((row) => [...row]),
  fallingBlocks: [],
  fallingColor: null,
  flashRows: [],
  flashUntilMs: 0,
  flashFrameId: null,
};
const PREVIEW_FALLBACK_SIZE = 150;
const PREVIEW_PADDING_RATIO = 0.16;
const HOLD_GRID_COLUMNS = 4;
const HOLD_GRID_ROWS = 4;
const UPCOMMING_QUEUE_COLUMNS = 4;
const UPCOMMING_QUEUE_ROWS = 12;
const UPCOMMING_QUEUE_SLOTS = 3;

const drawPlayfieldBackground = (ctx) => {
  const background = ctx.createLinearGradient(0, 0, 0, BOARD_HEIGHT);
  background.addColorStop(0, '#11141d');
  background.addColorStop(1, '#06080d');
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);
};

const drawPlayfieldGrid = (ctx) => {
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
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

const drawFlashOverlay = (ctx, nowMs) => {
  if (!boardViewState.flashRows.length || nowMs >= boardViewState.flashUntilMs)
    return;
  const remainingMs = boardViewState.flashUntilMs - nowMs;
  const alpha = Math.min(0.75, Math.max(0.2, remainingMs / 140));

  ctx.save();
  ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
  boardViewState.flashRows.forEach((y) => {
    const top = y * VERTICAL_MOVEMENT;
    ctx.fillRect(0, top, BOARD_WIDTH, VERTICAL_MOVEMENT);
  });
  ctx.restore();
};

const runFlashRedrawLoop = () => {
  if (boardViewState.flashFrameId) {
    cancelAnimationFrame(boardViewState.flashFrameId);
  }

  const repaint = () => {
    drawBoard();
    if (Date.now() < boardViewState.flashUntilMs) {
      boardViewState.flashFrameId = requestAnimationFrame(repaint);
      return;
    }

    boardViewState.flashRows = [];
    boardViewState.flashFrameId = null;
    drawBoard();
  };

  boardViewState.flashFrameId = requestAnimationFrame(repaint);
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

  const ctx = board.getContext('2d');
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
  shade.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
  shade.addColorStop(1, 'rgba(0, 0, 0, 0.18)');
  ctx.fillStyle = shade;
  ctx.fillRect(left, top, width, height);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.strokeRect(left + 0.5, top + 0.5, width - 1, height - 1);
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.strokeRect(left, top, width, height);
};

const getPreviewDimensions = (canvas) => ({
  width: canvas.clientWidth || PREVIEW_FALLBACK_SIZE,
  height: canvas.clientHeight || PREVIEW_FALLBACK_SIZE,
});

const getPreviewContext = (canvas) => {
  if (!canvas) return null;
  const { width, height } = getPreviewDimensions(canvas);
  const dpr = window.devicePixelRatio || 1;
  const expectedWidth = Math.floor(width * dpr);
  const expectedHeight = Math.floor(height * dpr);

  if (canvas.width !== expectedWidth || canvas.height !== expectedHeight) {
    canvas.width = expectedWidth;
    canvas.height = expectedHeight;
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, width, height };
};

const drawPreviewCell = (ctx, left, top, size, color) => {
  const inset = Math.max(1, Math.floor(size * 0.08));
  const width = Math.max(1, size - inset * 2);
  const height = Math.max(1, size - inset * 2);
  const x = left + inset;
  const y = top + inset;

  ctx.fillStyle = color;
  ctx.fillRect(x, y, width, height);

  const shade = ctx.createLinearGradient(x, y, x, y + height);
  shade.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
  shade.addColorStop(1, 'rgba(0, 0, 0, 0.18)');
  ctx.fillStyle = shade;
  ctx.fillRect(x, y, width, height);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.strokeRect(x + 0.5, y + 0.5, width - 1, height - 1);
};

const drawPreviewBackground = (ctx, width, height) => {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#090b10';
  ctx.fillRect(0, 0, width, height);
};

const drawFlatPreviewCell = (ctx, left, top, size, color) => {
  const inset = Math.max(1, Math.floor(size * 0.08));
  const width = Math.max(1, size - inset * 2);
  const height = Math.max(1, size - inset * 2);
  ctx.fillStyle = color;
  ctx.fillRect(left + inset, top + inset, width, height);
};

const drawTetrominoPreview = (canvas, tetrominoData) => {
  const preview = getPreviewContext(canvas);
  if (!preview) return;
  const { ctx, width, height } = preview;
  drawPreviewBackground(ctx, width, height);
  if (!tetrominoData || !tetrominoData.tetromino || !tetrominoData.tetromino[0])
    return;

  const previewBlocks = tetrominoData.tetromino[0];
  if (!previewBlocks.length) return;

  const xs = previewBlocks.map((block) => block.x);
  const ys = previewBlocks.map((block) => block.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const pieceWidth = maxX - minX + 1;
  const pieceHeight = maxY - minY + 1;

  const availableWidth = width * (1 - PREVIEW_PADDING_RATIO * 2);
  const availableHeight = height * (1 - PREVIEW_PADDING_RATIO * 2);
  const cellSize = Math.floor(
    Math.min(availableWidth / pieceWidth, availableHeight / pieceHeight)
  );
  const renderedWidth = pieceWidth * cellSize;
  const renderedHeight = pieceHeight * cellSize;
  const offsetX = Math.floor((width - renderedWidth) / 2);
  const offsetY = Math.floor((height - renderedHeight) / 2);
  const color = colorFactory(tetrominoData.color);

  previewBlocks.forEach(({ x, y }) => {
    const previewX = x - minX;
    const previewY = y - minY;
    drawPreviewCell(
      ctx,
      offsetX + previewX * cellSize,
      offsetY + previewY * cellSize,
      cellSize,
      color
    );
  });
};

const drawHoldTetromino = (holdTetromino) => {
  const holdCanvas = document.querySelector(`.${HOLD_TETROMINO_CLASS}`);
  const holdPreview = getPreviewContext(holdCanvas);
  if (!holdPreview) return;

  const { ctx, width, height } = holdPreview;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, width, height);
  if (!holdTetromino || !holdTetromino.tetromino || !holdTetromino.tetromino[0])
    return;

  const previewBlocks = holdTetromino.tetromino[0];
  if (!previewBlocks.length) return;

  const logicalCellSize = Math.floor(
    Math.min(width / HOLD_GRID_COLUMNS, height / HOLD_GRID_ROWS)
  );
  const renderedLogicalWidth = logicalCellSize * HOLD_GRID_COLUMNS;
  const renderedLogicalHeight = logicalCellSize * HOLD_GRID_ROWS;
  const gridOffsetX = Math.floor((width - renderedLogicalWidth) / 2);
  const gridOffsetY = Math.floor((height - renderedLogicalHeight) / 2);
  const xs = previewBlocks.map((block) => block.x);
  const ys = previewBlocks.map((block) => block.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const pieceWidth = Math.max(...xs) - minX + 1;
  const pieceHeight = Math.max(...ys) - minY + 1;
  const pieceOffsetX = Math.floor((HOLD_GRID_COLUMNS - pieceWidth) / 2);
  const pieceOffsetY = Math.floor((HOLD_GRID_ROWS - pieceHeight) / 2);
  const color = colorFactory(holdTetromino.color);

  ctx.save();
  ctx.beginPath();
  ctx.rect(
    gridOffsetX,
    gridOffsetY,
    renderedLogicalWidth,
    renderedLogicalHeight
  );
  ctx.clip();

  previewBlocks.forEach(({ x, y }) => {
    const normalizedX = x - minX + pieceOffsetX;
    const normalizedY = y - minY + pieceOffsetY;
    drawFlatPreviewCell(
      ctx,
      gridOffsetX + normalizedX * logicalCellSize,
      gridOffsetY + normalizedY * logicalCellSize,
      logicalCellSize,
      color
    );
  });

  ctx.restore();
};

const drawBoard = () => {
  const ctx = getBoardContext();
  if (!ctx) return;
  const nowMs = Date.now();

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
    boardViewState.fallingBlocks.forEach((block) =>
      drawCell(ctx, block, colorFactory(boardViewState.fallingColor))
    );
  }

  drawFlashOverlay(ctx, nowMs);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, BOARD_WIDTH - 2, BOARD_HEIGHT - 2);
};

const moveFallingTetromino = (tetromino) => {
  boardViewState.fallingBlocks = tetromino.map((block) => ({ ...block }));
  drawBoard();
};

const updateTetrominoColor = (color) => {
  boardViewState.fallingColor = color;
  drawBoard();
};

const addTetrominoToBoard = ({ tetromino, orientation, color }) => {
  boardViewState.fallingBlocks = tetromino[orientation].map((block) => ({
    ...block,
  }));
  boardViewState.fallingColor = color;
  drawBoard();
};

const removeFallingBlocks = () => {
  boardViewState.fallingBlocks = [];
  boardViewState.fallingColor = null;
  drawBoard();
};

const addHoldToBoard = (holdTetromino) => {
  drawHoldTetromino(holdTetromino);
};
const addScoreToBoard = (score, lineScore) => {
  document.querySelector(`.${SCORE_CLASS}`).textContent = score;
  document.querySelector(`.${LINE_SCORE_CLASS}`).textContent = lineScore;
};
const addUpcomingTetrominoesToBoard = (tetrominoesBank) => {
  const queueCanvas = document.querySelector(`.${UPCOMMING_TETROMINO_QUEUE}`);
  const queuePreview = getPreviewContext(queueCanvas);
  if (!queuePreview) return;

  const { ctx, width, height } = queuePreview;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, width, height);

  const slotWidth = width;
  const slotHeight = height / UPCOMMING_QUEUE_SLOTS;
  const logicalCellSize = Math.floor(
    Math.min(
      slotWidth / UPCOMMING_QUEUE_COLUMNS,
      slotHeight / (UPCOMMING_QUEUE_ROWS / UPCOMMING_QUEUE_SLOTS)
    )
  );
  const maxVisible = Math.min(UPCOMMING_QUEUE_SLOTS, tetrominoesBank.length);

  for (let slotIndex = 0; slotIndex < maxVisible; slotIndex += 1) {
    const tetrominoData = tetrominoesBank[slotIndex];
    if (
      !tetrominoData ||
      !tetrominoData.tetromino ||
      !tetrominoData.tetromino[0]
    )
      continue;

    const slotTop = slotIndex * slotHeight;
    const slotBottom = slotTop + slotHeight;
    const renderedLogicalWidth = logicalCellSize * UPCOMMING_QUEUE_COLUMNS;
    const renderedLogicalHeight =
      logicalCellSize * (UPCOMMING_QUEUE_ROWS / UPCOMMING_QUEUE_SLOTS);
    const slotOffsetX = Math.floor((slotWidth - renderedLogicalWidth) / 2);
    const slotOffsetY = Math.floor(
      slotTop + (slotHeight - renderedLogicalHeight) / 2
    );
    const previewBlocks = tetrominoData.tetromino[0];
    const xs = previewBlocks.map((block) => block.x);
    const ys = previewBlocks.map((block) => block.y);
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    const pieceWidth = Math.max(...xs) - minX + 1;
    const pieceHeight = Math.max(...ys) - minY + 1;
    const pieceOffsetX = Math.floor((UPCOMMING_QUEUE_COLUMNS - pieceWidth) / 2);
    const pieceOffsetY = Math.floor(
      (UPCOMMING_QUEUE_ROWS / UPCOMMING_QUEUE_SLOTS - pieceHeight) / 2
    );

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, slotTop, width, slotHeight);
    ctx.clip();

    previewBlocks.forEach(({ x, y }) => {
      const normalizedX = x - minX + pieceOffsetX;
      const normalizedY = y - minY + pieceOffsetY;
      const pixelX = slotOffsetX + normalizedX * logicalCellSize;
      const pixelY = slotOffsetY + normalizedY * logicalCellSize;

      if (pixelY >= slotTop && pixelY + logicalCellSize <= slotBottom) {
        drawFlatPreviewCell(
          ctx,
          pixelX,
          pixelY,
          logicalCellSize,
          colorFactory(tetrominoData.color)
        );
      }
    });

    ctx.restore();
  }
};

const remapBlocksVisualization = (binaryMap) => {
  boardViewState.lockedMap = binaryMap.map((row) => [...row]);
  drawBoard();
};

const flashClearedRows = (yPositions, durationMs = 110) => {
  if (!Array.isArray(yPositions) || !yPositions.length) return;

  boardViewState.flashRows = [...yPositions];
  boardViewState.flashUntilMs = Date.now() + durationMs;
  runFlashRedrawLoop();
};
