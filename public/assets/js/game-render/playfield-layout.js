import {
  HORIZONTAL_DIMENSIONS,
  VERTICAL_DIMENSIONS,
} from '../config/settings.js';
import {
  getBoardCanvas,
  isMobileLayout,
  MIN_CELL_CSS_PX,
  MAX_CSS_WIDTH,
  MAX_CSS_HEIGHT,
  MIN_VERTICAL_INSET_PX,
  VERTICAL_INSET_VIEWPORT_RATIO,
  MOBILE_RAIL_SLOT_COUNT,
  RESIZE_DEBOUNCE_MS,
} from './playfield-state.js';
import {
  updateCachedMetrics,
  applyPlayfieldCanvasSize,
  syncMobileSideRail,
  clearMobileSideRail,
} from './playfield-metrics.js';

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

export const refreshPlayfieldLayout = () => {
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
    clearMobileSideRail(board);
  }

  return true;
};

let resizeTimer = null;

const schedulePlayfieldLayoutRefresh = (onLayoutRefreshed) => {
  if (resizeTimer) {
    clearTimeout(resizeTimer);
  }

  resizeTimer = setTimeout(() => {
    resizeTimer = null;
    if (refreshPlayfieldLayout()) {
      onLayoutRefreshed();
    }
  }, RESIZE_DEBOUNCE_MS);
};

const bindPlayfieldResizeListeners = (onLayoutRefreshed) => {
  const handler = () => schedulePlayfieldLayoutRefresh(onLayoutRefreshed);
  window.addEventListener('resize', handler);
  window.addEventListener('orientationchange', handler);
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', handler);
  }
};

const isGameContainerVisible = (shell) => {
  if (!shell) return false;
  const style = window.getComputedStyle(shell);
  return style.visibility !== 'hidden' && style.display !== 'none';
};

const bindGameContainerVisibilityObserver = (onLayoutRefreshed) => {
  const shell = document.querySelector('.game-container');
  if (!shell) return;

  const refreshWhenVisible = () => {
    if (!isGameContainerVisible(shell)) return;
    schedulePlayfieldLayoutRefresh(onLayoutRefreshed);
  };

  const observer = new MutationObserver(refreshWhenVisible);
  observer.observe(shell, {
    attributes: true,
    attributeFilter: ['style', 'class'],
  });
};

export const initPlayfieldLayout = (onLayoutRefreshed) => {
  refreshPlayfieldLayout();
  bindPlayfieldResizeListeners(onLayoutRefreshed);
  bindGameContainerVisibilityObserver(onLayoutRefreshed);
};
