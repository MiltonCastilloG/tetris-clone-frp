export const INTIAL_CLOCK_SPEED = 400; // in ms

export const BOARD_WIDTH = 300; // in px
export const BOARD_HEIGHT = 600; // in px

export const HORIZONTAL_DIMENSIONS = 10; // MUST BE A PAIR NUMBER
export const VERTICAL_DIMENSIONS = 20; // MUST BE A PAIR NUMBER
/*
Decided to use numbers instead of booleans since it allows
for a more expansive representation of data
*/
export const EMPTY_SPACE = 0;
export const FILLED_SPACE = 1;
export const BINARY_MAP_ROW = Array.from(
  { length: HORIZONTAL_DIMENSIONS },
  () => 0
);
export const BINARY_MAP = Array.from({ length: VERTICAL_DIMENSIONS }, () => [
  ...BINARY_MAP_ROW,
]);
export const HORIZONTAL_MOVEMENT = BOARD_WIDTH / HORIZONTAL_DIMENSIONS;
export const VERTICAL_MOVEMENT = BOARD_HEIGHT / VERTICAL_DIMENSIONS;
export const TETROMINO_STARTING_PLACE = HORIZONTAL_DIMENSIONS / 2 - 1;

export const BASE_ERASE_SCORE = [40, 100, 300, 400];
