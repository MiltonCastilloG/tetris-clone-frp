import { EMPTY_SPACE } from '../config/settings.js';

export const pipe =
  (...fns) =>
  (x) =>
    fns.reduce((v, f) => f(v), x);

export const isSpaceFilled = (number) => number !== EMPTY_SPACE;
export const isLineFull = (map) =>
  map.length == map.filter(isSpaceFilled).length;

export const findLinesToClear = (lockedMap) => {
  const linesToClear = lockedMap.reduce((acc, value, index) => {
    if (isLineFull(value)) acc.push(index);
    return acc;
  }, []);
  return linesToClear;
};
