import { HORIZONTAL_DIMENSIONS, VERTICAL_DIMENSIONS } from '../config/settings.js';
import {
  getBoardCanvas,
  isMobileLayout,
  MOBILE_RAIL_SLOT_COUNT,
  playfieldRenderState,
} from './playfield-state.js';

export const updateCachedMetrics = (cssWidth, cssHeight, dpr) => {
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

export const applyPlayfieldCanvasSize = (board, cssWidth, cssHeight, dpr) => {
  const backingWidth = Math.round(cssWidth * dpr);
  const backingHeight = Math.round(cssHeight * dpr);

  board.style.width = `${cssWidth}px`;
  board.style.height = `${cssHeight}px`;
  board.width = backingWidth;
  board.height = backingHeight;
};

export const syncMobileSideRail = (board, boardHeight) => {
  const rail = board.closest('.game-layout')?.querySelector('.side-rail');
  if (!rail) return;

  const cellSize = Math.max(
    1,
    Math.round(boardHeight / MOBILE_RAIL_SLOT_COUNT)
  );
  rail.style.height = `${boardHeight}px`;
  rail.style.width = `${cellSize}px`;
};

export const clearMobileSideRail = (board) => {
  const rail = board.closest('.game-layout')?.querySelector('.side-rail');
  if (rail) {
    rail.style.height = '';
    rail.style.width = '';
  }
};

export const syncPlayfieldMetrics = (board, refreshLayout) => {
  const dpr = window.devicePixelRatio || 1;
  const { cssWidth, cssHeight } = playfieldRenderState;

  if (!cssWidth || !cssHeight) {
    refreshLayout();
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

export const getBoardContext = (refreshLayout) => {
  const board = getBoardCanvas();
  if (!board) return null;

  const dpr = syncPlayfieldMetrics(board, refreshLayout);
  const ctx = board.getContext('2d');
  if (!ctx) return null;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
};
