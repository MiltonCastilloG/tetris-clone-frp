import { CLOCK_TICK_MS } from '../config/settings.js';
import { Stream } from '../lib/stream.js';

export const ticks = new Stream((next) => setInterval(next, CLOCK_TICK_MS));
export const keyDowns = new Stream((next) =>
  document.addEventListener('keydown', next)
);
const isSpace = (event) => 'Space' === event.code;
export const pauseBtnClicks = new Stream((next) =>
  document.querySelector('.js-pause-btn').addEventListener('click', next)
);
const spaceKeyDowns = keyDowns.filter(isSpace).map((event) => {
  event.preventDefault();
  return event;
});
export const pauseGame = Stream.merge(pauseBtnClicks, spaceKeyDowns);
export const uploadGame = new Stream((next) =>
  document.querySelector('.js-upload-game-btn').addEventListener('click', next)
);
