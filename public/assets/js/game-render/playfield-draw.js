import {
  HORIZONTAL_DIMENSIONS,
  VERTICAL_DIMENSIONS,
} from '../config/settings.js';
import { isSpaceFilled } from '../shared/utils.js';
import { checkBlocksCollision } from '../shared/collision.js';
import { colorFactory } from '../lib/tetrominoes.js';
import { playfieldRenderState } from './playfield-state.js';
import { getBoardContext } from './playfield-metrics.js';
import { refreshPlayfieldLayout } from './playfield-layout.js';

const drawPlayfieldBackground = (ctx, { cssWidth, cssHeight }) => {
  const background = ctx.createLinearGradient(0, 0, 0, cssHeight);
  background.addColorStop(0, '#11141d');
  background.addColorStop(1, '#06080d');
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, cssWidth, cssHeight);
};

const drawPlayfieldGrid = (
  ctx,
  { cssWidth, cssHeight, horizontalStep, verticalStep }
) => {
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;

  for (let x = 0; x <= HORIZONTAL_DIMENSIONS; x += 1) {
    const px = x * horizontalStep + 0.5;
    ctx.beginPath();
    ctx.moveTo(px, 0);
    ctx.lineTo(px, cssHeight);
    ctx.stroke();
  }

  for (let y = 0; y <= VERTICAL_DIMENSIONS; y += 1) {
    const py = y * verticalStep + 0.5;
    ctx.beginPath();
    ctx.moveTo(0, py);
    ctx.lineTo(cssWidth, py);
    ctx.stroke();
  }
};

const drawPlayfieldCell = (
  ctx,
  { y, x },
  color,
  { horizontalStep, verticalStep, cellW, cellH }
) => {
  const pxX = x * horizontalStep;
  const pxY = y * verticalStep;
  const left = pxX + 1;
  const top = pxY + 1;

  ctx.fillStyle = color;
  ctx.fillRect(left, top, cellW, cellH);

  const shade = ctx.createLinearGradient(left, top, left, top + cellH);
  shade.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
  shade.addColorStop(1, 'rgba(0, 0, 0, 0.18)');
  ctx.fillStyle = shade;
  ctx.fillRect(left, top, cellW, cellH);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.strokeRect(left + 0.5, top + 0.5, cellW - 1, cellH - 1);
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.strokeRect(left, top, cellW, cellH);
};

const drawGhostCell = (
  ctx,
  { y, x },
  color,
  { horizontalStep, verticalStep, cellW, cellH }
) => {
  const pxX = x * horizontalStep;
  const pxY = y * verticalStep;
  const left = pxX + 1;
  const top = pxY + 1;

  ctx.save();
  ctx.globalAlpha = 0.28;
  ctx.fillStyle = color;
  ctx.fillRect(left, top, cellW, cellH);
  ctx.globalAlpha = 0.55;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.strokeRect(left + 0.5, top + 0.5, cellW - 1, cellH - 1);
  ctx.restore();
};

const drawLockedLayer = (ctx, renderState) => {
  const { lockedMap, cellW, cellH, horizontalStep, verticalStep } = renderState;
  lockedMap.forEach((row, y) => {
    row.forEach((spaceNum, x) => {
      if (isSpaceFilled(spaceNum)) {
        drawPlayfieldCell(ctx, { y, x }, colorFactory(spaceNum), {
          horizontalStep,
          verticalStep,
          cellW,
          cellH,
        });
      }
    });
  });
};

const canBlocksMoveDown = (blocks, lockedMap) =>
  checkBlocksCollision(
    blocks.map(({ y, x }) => ({ y: y + 1, x })),
    lockedMap
  );

const computeGhostBlocks = (fallingBlocks, lockedMap) => {
  if (!fallingBlocks.length) return [];

  let ghost = fallingBlocks.map((block) => ({ ...block }));

  while (canBlocksMoveDown(ghost, lockedMap)) {
    ghost = ghost.map(({ y, x }) => ({ y: y + 1, x }));
  }

  return ghost;
};

const updateGhostBlocks = () => {
  const { fallingBlocks, lockedMap } = playfieldRenderState;
  playfieldRenderState.ghostBlocks = computeGhostBlocks(
    fallingBlocks,
    lockedMap
  );
};

const drawGhostLayer = (ctx, renderState) => {
  const {
    ghostBlocks,
    fallingColor,
    cellW,
    cellH,
    horizontalStep,
    verticalStep,
  } = renderState;
  if (!ghostBlocks.length) return;

  const ghostColor = fallingColor
    ? colorFactory(fallingColor)
    : 'rgba(255, 255, 255, 0.35)';
  ghostBlocks.forEach((block) =>
    drawGhostCell(ctx, block, ghostColor, {
      horizontalStep,
      verticalStep,
      cellW,
      cellH,
    })
  );
};

const drawFallingLayer = (ctx, renderState) => {
  const {
    fallingBlocks,
    fallingColor,
    cellW,
    cellH,
    horizontalStep,
    verticalStep,
  } = renderState;
  if (!fallingColor) return;

  const color = colorFactory(fallingColor);
  fallingBlocks.forEach((block) =>
    drawPlayfieldCell(ctx, block, color, {
      horizontalStep,
      verticalStep,
      cellW,
      cellH,
    })
  );
};

const drawFlashOverlay = (ctx, renderState, nowMs) => {
  const { flashRows, flashUntilMs, cssWidth, verticalStep } = renderState;
  if (!flashRows.length || nowMs >= flashUntilMs) return;

  const remainingMs = flashUntilMs - nowMs;
  const alpha = Math.min(0.75, Math.max(0.2, remainingMs / 140));

  ctx.save();
  ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
  flashRows.forEach((y) => {
    const top = y * verticalStep;
    ctx.fillRect(0, top, cssWidth, verticalStep);
  });
  ctx.restore();
};

const runFlashRedrawLoop = () => {
  if (playfieldRenderState.flashFrameId) {
    cancelAnimationFrame(playfieldRenderState.flashFrameId);
  }

  const repaint = () => {
    drawBoard();
    if (Date.now() < playfieldRenderState.flashUntilMs) {
      playfieldRenderState.flashFrameId = requestAnimationFrame(repaint);
      return;
    }

    playfieldRenderState.flashRows = [];
    playfieldRenderState.flashFrameId = null;
    drawBoard();
  };

  playfieldRenderState.flashFrameId = requestAnimationFrame(repaint);
};

export const drawBoard = () => {
  const ctx = getBoardContext(refreshPlayfieldLayout);
  if (!ctx) return;
  updateGhostBlocks();
  const nowMs = Date.now();
  const { cssWidth, cssHeight } = playfieldRenderState;

  ctx.clearRect(0, 0, cssWidth, cssHeight);
  drawPlayfieldBackground(ctx, playfieldRenderState);
  drawPlayfieldGrid(ctx, playfieldRenderState);
  drawLockedLayer(ctx, playfieldRenderState);
  drawGhostLayer(ctx, playfieldRenderState);
  drawFallingLayer(ctx, playfieldRenderState);
  drawFlashOverlay(ctx, playfieldRenderState, nowMs);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, cssWidth - 2, cssHeight - 2);
};

export const flashLineClearRows = (yPositions, durationMs = 110) => {
  if (!Array.isArray(yPositions) || !yPositions.length) return;

  playfieldRenderState.flashRows = [...yPositions];
  playfieldRenderState.flashUntilMs = Date.now() + durationMs;
  runFlashRedrawLoop();
};

export const remapLockedMapVisualization = (lockedMap) => {
  playfieldRenderState.lockedMap = lockedMap.map((row) => [...row]);
  drawBoard();
};

export const moveFallingTetromino = (tetromino) => {
  playfieldRenderState.fallingBlocks = tetromino.map((block) => ({ ...block }));
  drawBoard();
};

export const updateTetrominoColor = (color) => {
  playfieldRenderState.fallingColor = color;
  drawBoard();
};

export const addTetrominoToBoard = ({ tetromino, orientation, color }) => {
  playfieldRenderState.fallingBlocks = tetromino[orientation].map((block) => ({
    ...block,
  }));
  playfieldRenderState.fallingColor = color;
  drawBoard();
};

export const removeFallingPiece = () => {
  playfieldRenderState.fallingBlocks = [];
  playfieldRenderState.fallingColor = null;
  drawBoard();
};
