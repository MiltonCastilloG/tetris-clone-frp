import {
  LOCKED_MAP,
  BOARD_WIDTH,
  BOARD_HEIGHT,
  HORIZONTAL_DIMENSIONS,
  VERTICAL_DIMENSIONS,
  HORIZONTAL_MOVEMENT,
  VERTICAL_MOVEMENT,
} from './config/settings.js';
import {
  HOLD_TETROMINO_CLASS,
  SCORE_CLASS,
  LINE_SCORE_CLASS,
  UPCOMMING_TETROMINO_QUEUE,
} from './config/selectors.js';
import { isSpaceFilled } from './utils.js';
import { checkBlocksCollision } from './collision.js';
import { colorFactory } from './lib/tetrominoes.js';

const getBoardCanvas = () => document.querySelector('.js-board');

const MIN_CELL_CSS_PX = 13;
const RESIZE_DEBOUNCE_MS = 125;
const MOBILE_MAX_WIDTH_PX = 720;
const MOBILE_RAIL_SLOT_COUNT = 4;
const MAX_CSS_WIDTH = BOARD_WIDTH;
const MAX_CSS_HEIGHT = BOARD_HEIGHT;
const MIN_VERTICAL_INSET_PX = 24;
const VERTICAL_INSET_VIEWPORT_RATIO = 0.04;

const isMobileLayout = () =>
  window.matchMedia(`(max-width: ${MOBILE_MAX_WIDTH_PX}px)`).matches;

const getUpcomingVisibleSlotCount = () =>
  isMobileLayout() ? 1 : UPCOMMING_QUEUE_SLOTS;

const createPlayfieldRenderState = () => ({
  lockedMap: LOCKED_MAP.map((row) => [...row]),
  fallingBlocks: [],
  fallingColor: null,
  ghostBlocks: [],
  flashRows: [],
  flashUntilMs: 0,
  flashFrameId: null,
  cssWidth: BOARD_WIDTH,
  cssHeight: BOARD_HEIGHT,
  horizontalStep: HORIZONTAL_MOVEMENT,
  verticalStep: VERTICAL_MOVEMENT,
  cellW: HORIZONTAL_MOVEMENT - 2,
  cellH: VERTICAL_MOVEMENT - 2,
  dpr: null,
  canvasPixelWidth: null,
  canvasPixelHeight: null,
});

const playfieldRenderState = createPlayfieldRenderState();

const PREVIEW_FALLBACK_SIZE = 150;
const HOLD_GRID_COLUMNS = 4;
const HOLD_GRID_ROWS = 4;
const UPCOMMING_QUEUE_COLUMNS = 4;
const UPCOMMING_QUEUE_ROWS = 12;
const UPCOMMING_QUEUE_SLOTS = 3;

const getViewportSize = () => {
  const visualViewport = window.visualViewport;
  if (visualViewport) {
    return {
      width: visualViewport.width,
      height: visualViewport.height,
    };
  }

  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
};

const getPlayfieldLayoutShell = (board) =>
  board?.closest('.game-container') || board?.parentElement;

const getVerticalInset = (viewportHeight) =>
  Math.max(
    MIN_VERTICAL_INSET_PX,
    Math.round(viewportHeight * VERTICAL_INSET_VIEWPORT_RATIO)
  );

const measureAvailableBounds = (board) => {
  const shell = getPlayfieldLayoutShell(board);
  if (!shell) return null;

  const shellStyle = window.getComputedStyle(shell);
  const paddingX =
    (Number.parseFloat(shellStyle.paddingLeft) || 0) +
    (Number.parseFloat(shellStyle.paddingRight) || 0);
  const paddingY =
    (Number.parseFloat(shellStyle.paddingTop) || 0) +
    (Number.parseFloat(shellStyle.paddingBottom) || 0);

  const { width: viewportWidth, height: viewportHeight } = getViewportSize();
  const verticalInset = getVerticalInset(viewportHeight);
  let availableWidth = viewportWidth - paddingX;
  const availableHeight = Math.max(
    0,
    viewportHeight - paddingY - verticalInset * 2
  );

  const row = board.closest('.game-layout') || board.closest('.row-container');
  if (!row) {
    return { width: Math.max(0, availableWidth), height: availableHeight };
  }

  const rowStyle = window.getComputedStyle(row);
  const gap = Number.parseFloat(rowStyle.gap) || 0;

  if (isMobileLayout()) {
    return {
      width: Math.max(0, availableWidth),
      height: availableHeight,
      gap,
      mobile: true,
    };
  }

  const hold = row.querySelector('.panel-hold');
  const upcoming = row.querySelector('.panel-upcoming');
  const leftWidth = hold?.getBoundingClientRect().width || 0;
  const rightWidth = upcoming?.getBoundingClientRect().width || 0;
  availableWidth -= leftWidth + rightWidth + gap * 2;

  return {
    width: Math.max(0, availableWidth),
    height: availableHeight,
    mobile: false,
  };
};

const computePlayfieldCssSize = (
  availableWidth,
  availableHeight,
  { mobile = false, gap = 0 } = {}
) => {
  if (availableWidth <= 0 || availableHeight <= 0) {
    return { cssWidth: 1, cssHeight: 1 };
  }

  if (mobile) {
    const boardWidthRatio =
      HORIZONTAL_DIMENSIONS / VERTICAL_DIMENSIONS + 1 / MOBILE_RAIL_SLOT_COUNT;
    const heightFromWidth = (availableWidth - gap) / boardWidthRatio;
    let cssHeight = Math.min(
      availableHeight,
      MAX_CSS_HEIGHT,
      Math.max(1, heightFromWidth)
    );
    let cssWidth =
      (cssHeight * HORIZONTAL_DIMENSIONS) / VERTICAL_DIMENSIONS;
    cssWidth = Math.min(cssWidth, MAX_CSS_WIDTH);
    cssHeight =
      (cssWidth * VERTICAL_DIMENSIONS) / HORIZONTAL_DIMENSIONS;

    return {
      cssWidth: Math.max(1, Math.round(cssWidth)),
      cssHeight: Math.max(1, Math.round(cssHeight)),
    };
  }

  const preferredMinWidth = HORIZONTAL_DIMENSIONS * MIN_CELL_CSS_PX;
  const preferredMinHeight = VERTICAL_DIMENSIONS * MIN_CELL_CSS_PX;
  const canHonorPreferredMin =
    availableWidth >= preferredMinWidth &&
    availableHeight >= preferredMinHeight;

  let cssWidth = Math.min(availableWidth, MAX_CSS_WIDTH);
  let cssHeight = (cssWidth * VERTICAL_DIMENSIONS) / HORIZONTAL_DIMENSIONS;

  if (cssHeight > Math.min(availableHeight, MAX_CSS_HEIGHT)) {
    cssHeight = Math.min(availableHeight, MAX_CSS_HEIGHT);
    cssWidth = (cssHeight * HORIZONTAL_DIMENSIONS) / VERTICAL_DIMENSIONS;
  }

  if (canHonorPreferredMin) {
    cssWidth = Math.max(cssWidth, preferredMinWidth);
    cssHeight = Math.max(cssHeight, preferredMinHeight);

    if (cssHeight > availableHeight) {
      cssHeight = availableHeight;
      cssWidth = (cssHeight * HORIZONTAL_DIMENSIONS) / VERTICAL_DIMENSIONS;
    }
    if (cssWidth > availableWidth) {
      cssWidth = availableWidth;
      cssHeight = (cssWidth * VERTICAL_DIMENSIONS) / HORIZONTAL_DIMENSIONS;
    }
  }

  cssWidth = Math.min(cssWidth, MAX_CSS_WIDTH);
  cssHeight = Math.min(cssHeight, MAX_CSS_HEIGHT);

  return {
    cssWidth: Math.max(1, Math.round(cssWidth)),
    cssHeight: Math.max(1, Math.round(cssHeight)),
  };
};

const syncMobileSideRail = (board, boardHeight) => {
  const rail = board.closest('.game-layout')?.querySelector('.side-rail');
  if (!rail) return;

  const cellSize = Math.max(
    1,
    Math.round(boardHeight / MOBILE_RAIL_SLOT_COUNT)
  );
  rail.style.height = `${boardHeight}px`;
  rail.style.width = `${cellSize}px`;
};

const updateCachedMetrics = (cssWidth, cssHeight, dpr) => {
  const horizontalStep = cssWidth / HORIZONTAL_DIMENSIONS;
  const verticalStep = cssHeight / VERTICAL_DIMENSIONS;

  playfieldRenderState.cssWidth = cssWidth;
  playfieldRenderState.cssHeight = cssHeight;
  playfieldRenderState.horizontalStep = horizontalStep;
  playfieldRenderState.verticalStep = verticalStep;
  playfieldRenderState.cellW = Math.max(1, horizontalStep - 2);
  playfieldRenderState.cellH = Math.max(1, verticalStep - 2);
  playfieldRenderState.dpr = dpr;
  playfieldRenderState.canvasPixelWidth = Math.round(cssWidth * dpr);
  playfieldRenderState.canvasPixelHeight = Math.round(cssHeight * dpr);
};

const applyPlayfieldCanvasSize = (board, cssWidth, cssHeight, dpr) => {
  const backingWidth = Math.round(cssWidth * dpr);
  const backingHeight = Math.round(cssHeight * dpr);

  board.style.width = `${cssWidth}px`;
  board.style.height = `${cssHeight}px`;
  board.width = backingWidth;
  board.height = backingHeight;
};

const refreshPlayfieldLayout = () => {
  const board = getBoardCanvas();
  if (!board) return false;

  const bounds = measureAvailableBounds(board);
  if (!bounds) return false;

  const { cssWidth, cssHeight } = computePlayfieldCssSize(
    bounds.width,
    bounds.height,
    { mobile: bounds.mobile, gap: bounds.gap || 0 }
  );
  const dpr = window.devicePixelRatio || 1;

  updateCachedMetrics(cssWidth, cssHeight, dpr);
  applyPlayfieldCanvasSize(board, cssWidth, cssHeight, dpr);

  if (bounds.mobile) {
    syncMobileSideRail(board, cssHeight);
  } else {
    const rail = board.closest('.game-layout')?.querySelector('.side-rail');
    if (rail) {
      rail.style.height = '';
      rail.style.width = '';
    }
  }

  return true;
};

const syncPlayfieldMetrics = (board) => {
  const dpr = window.devicePixelRatio || 1;
  const { cssWidth, cssHeight } = playfieldRenderState;

  if (!cssWidth || !cssHeight) {
    refreshPlayfieldLayout();
    return playfieldRenderState.dpr || dpr;
  }

  const expectedWidth = Math.round(cssWidth * dpr);
  const expectedHeight = Math.round(cssHeight * dpr);
  const metricsChanged =
    playfieldRenderState.dpr !== dpr ||
    playfieldRenderState.canvasPixelWidth !== expectedWidth ||
    playfieldRenderState.canvasPixelHeight !== expectedHeight;

  if (metricsChanged) {
    updateCachedMetrics(cssWidth, cssHeight, dpr);
    board.width = expectedWidth;
    board.height = expectedHeight;
    board.style.width = `${cssWidth}px`;
    board.style.height = `${cssHeight}px`;
    if (isMobileLayout()) {
      syncMobileSideRail(board, cssHeight);
    }
  }

  return dpr;
};

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

const getBoardContext = () => {
  const board = getBoardCanvas();
  if (!board) return null;

  const dpr = syncPlayfieldMetrics(board);
  const ctx = board.getContext('2d');
  if (!ctx) return null;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
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

export const drawBoard = () => {
  const ctx = getBoardContext();
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

export const remapLockedMapVisualization = (lockedMap) => {
  playfieldRenderState.lockedMap = lockedMap.map((row) => [...row]);
  drawBoard();
};

export const flashLineClearRows = (yPositions, durationMs = 110) => {
  if (!Array.isArray(yPositions) || !yPositions.length) return;

  playfieldRenderState.flashRows = [...yPositions];
  playfieldRenderState.flashUntilMs = Date.now() + durationMs;
  runFlashRedrawLoop();
};

let resizeTimer = null;

const schedulePlayfieldLayoutRefresh = () => {
  if (resizeTimer) {
    clearTimeout(resizeTimer);
  }

  resizeTimer = setTimeout(() => {
    resizeTimer = null;
    if (refreshPlayfieldLayout()) {
      drawBoard();
    }
  }, RESIZE_DEBOUNCE_MS);
};

const bindPlayfieldResizeListeners = () => {
  window.addEventListener('resize', schedulePlayfieldLayoutRefresh);
  window.addEventListener('orientationchange', schedulePlayfieldLayoutRefresh);
  if (window.visualViewport) {
    window.visualViewport.addEventListener(
      'resize',
      schedulePlayfieldLayoutRefresh
    );
  }
};

const isGameContainerVisible = (shell) => {
  if (!shell) return false;
  const style = window.getComputedStyle(shell);
  return style.visibility !== 'hidden' && style.display !== 'none';
};

const bindGameContainerVisibilityObserver = () => {
  const shell = document.querySelector('.game-container');
  if (!shell) return;

  const refreshWhenVisible = () => {
    if (!isGameContainerVisible(shell)) return;
    schedulePlayfieldLayoutRefresh();
  };

  const observer = new MutationObserver(refreshWhenVisible);
  observer.observe(shell, {
    attributes: true,
    attributeFilter: ['style', 'class'],
  });
};

const initPlayfieldLayout = () => {
  refreshPlayfieldLayout();
  bindPlayfieldResizeListeners();
  bindGameContainerVisibilityObserver();
};

if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPlayfieldLayout);
  } else {
    initPlayfieldLayout();
  }
}
