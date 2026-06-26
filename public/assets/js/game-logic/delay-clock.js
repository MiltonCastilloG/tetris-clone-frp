const DELAY_CLOCK_TICKS = 2;
const DELAY_CLOCK_TICK_RESET_CAP = 15;

export const createDelayClock = () => {
  const state = { active: false, ticksRemaining: 0, resetsUsed: 0 };

  const clearGroundDelayClockTicks = () => {
    state.active = false;
    state.ticksRemaining = 0;
  };
  const resetDelayClockTicksForNewPiece = () => {
    clearGroundDelayClockTicks();
    state.resetsUsed = 0;
  };
  const consumeGroundContactTick = () => {
    if (!state.active) {
      state.active = true;
      state.ticksRemaining = DELAY_CLOCK_TICKS;
      return false;
    }

    state.ticksRemaining -= 1;
    return state.ticksRemaining <= 0;
  };
  const resetDelayClockTicksFromMovement = () => {
    if (!state.active) return;
    if (state.resetsUsed >= DELAY_CLOCK_TICK_RESET_CAP) return;
    state.resetsUsed += 1;
    state.ticksRemaining = DELAY_CLOCK_TICKS;
  };

  return {
    clearGroundDelayClockTicks,
    resetDelayClockTicksForNewPiece,
    consumeGroundContactTick,
    resetDelayClockTicksFromMovement,
  };
};
