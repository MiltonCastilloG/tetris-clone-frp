import { pipe } from '../shared/utils.js';
import { checkTetrominoCollisionTop } from '../shared/collision.js';
import { ticks } from './streams.js';

export const wireGameLoop = ({
  tetromino,
  canCurrentTetrominoMoveDown,
  getCurrentTetromino,
  clearGroundDelayClockTicks,
  consumeGroundContactTick,
  settleCurrentTetromino,
}) => {
  const actionTicks = ticks.map(canCurrentTetrominoMoveDown);
  const movementTicks = actionTicks.filter((inBorder) => inBorder);
  const landingTicks = actionTicks
    .filter((inBorder) => !inBorder)
    .map(pipe(getCurrentTetromino, checkTetrominoCollisionTop));
  const topLanding = landingTicks.filter((topBorder) => topBorder);
  const groundLanding = landingTicks
    .filter((topBorder) => !topBorder)
    .filter(() => consumeGroundContactTick());

  movementTicks.subscribe(() => {
    clearGroundDelayClockTicks();
    tetromino.dispatch({ type: 'DOWN' });
  });
  groundLanding.subscribe(settleCurrentTetromino);

  return { movementTicks, topLanding };
};
