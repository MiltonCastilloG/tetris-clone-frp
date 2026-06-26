import {
  LOCKED_MAP,
  BOARD_WIDTH,
  BOARD_HEIGHT,
  HORIZONTAL_MOVEMENT,
  VERTICAL_MOVEMENT,
} from '../config/settings.js';

export const getBoardCanvas = () => document.querySelector('.js-board');

export const MIN_CELL_CSS_PX = 13;
export const RESIZE_DEBOUNCE_MS = 125;
export const MOBILE_MAX_WIDTH_PX = 720;
export const MOBILE_RAIL_SLOT_COUNT = 4;
export const MAX_CSS_WIDTH = BOARD_WIDTH;
export const MAX_CSS_HEIGHT = BOARD_HEIGHT;
export const MIN_VERTICAL_INSET_PX = 24;
export const VERTICAL_INSET_VIEWPORT_RATIO = 0.04;

export const PREVIEW_FALLBACK_SIZE = 150;
export const HOLD_GRID_COLUMNS = 4;
export const HOLD_GRID_ROWS = 4;
export const UPCOMMING_QUEUE_COLUMNS = 4;
export const UPCOMMING_QUEUE_ROWS = 12;
export const UPCOMMING_QUEUE_SLOTS = 3;

export const isMobileLayout = () =>
  window.matchMedia(`(max-width: ${MOBILE_MAX_WIDTH_PX}px)`).matches;

export const getUpcomingVisibleSlotCount = () =>
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

export const playfieldRenderState = createPlayfieldRenderState();
