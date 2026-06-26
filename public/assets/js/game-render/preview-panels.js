import {
  HOLD_TETROMINO_CLASS,
  SCORE_CLASS,
  LINE_SCORE_CLASS,
  UPCOMMING_TETROMINO_QUEUE,
} from '../config/selectors.js';
import { colorFactory } from '../lib/tetrominoes.js';
import {
  PREVIEW_FALLBACK_SIZE,
  HOLD_GRID_COLUMNS,
  HOLD_GRID_ROWS,
  UPCOMMING_QUEUE_COLUMNS,
  UPCOMMING_QUEUE_ROWS,
  getUpcomingVisibleSlotCount,
} from './playfield-state.js';

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

const drawFlatPreviewCell = (ctx, left, top, size, color) => {
  const inset = Math.max(1, Math.floor(size * 0.08));
  const width = Math.max(1, size - inset * 2);
  const height = Math.max(1, size - inset * 2);
  ctx.fillStyle = color;
  ctx.fillRect(left + inset, top + inset, width, height);
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

export const addHoldToBoard = (holdTetromino) => {
  drawHoldTetromino(holdTetromino);
};

export const addScoreToBoard = (score, lineScore) => {
  document.querySelector(`.${SCORE_CLASS}`).textContent = score;
  document.querySelector(`.${LINE_SCORE_CLASS}`).textContent = lineScore;
};

export const addUpcomingTetrominoesToBoard = (tetrominoQueue) => {
  const queueCanvas = document.querySelector(`.${UPCOMMING_TETROMINO_QUEUE}`);
  const queuePreview = getPreviewContext(queueCanvas);
  if (!queuePreview) return;

  const { ctx, width, height } = queuePreview;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, width, height);

  const visibleSlots = getUpcomingVisibleSlotCount();
  const slotWidth = width;
  const slotHeight = height / visibleSlots;
  const logicalCellSize = Math.floor(
    Math.min(
      slotWidth / UPCOMMING_QUEUE_COLUMNS,
      slotHeight / (UPCOMMING_QUEUE_ROWS / visibleSlots)
    )
  );
  const maxVisible = Math.min(visibleSlots, tetrominoQueue.length);

  for (let slotIndex = 0; slotIndex < maxVisible; slotIndex += 1) {
    const tetrominoData = tetrominoQueue[slotIndex];
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
      logicalCellSize * (UPCOMMING_QUEUE_ROWS / visibleSlots);
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
      (UPCOMMING_QUEUE_ROWS / visibleSlots - pieceHeight) / 2
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
