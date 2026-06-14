import { TETROMINO_DEFINITIONS } from './tetromino-definitions.js';

export const TETROMINO_COLORS = Object.keys(TETROMINO_DEFINITIONS);
export const colorFactory = (color) => color;
