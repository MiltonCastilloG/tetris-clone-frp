const tetronimoBoard = [0, 0, 0, 0].map(() => [0, 0, 0, 0]);
const states = [
  {
    offsetX: 0,
    blocks: [
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 1, y: 2 },
    ],
  },
  {
    offsetX: 0,
    blocks: [
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 1, y: 2 },
      { x: 0, y: 1 },
    ],
  },
  {
    offsetX: 0,
    blocks: [
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
    ],
  },
  {
    offsetX: 0,
    blocks: [
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 1, y: 2 },
      { x: 2, y: 1 },
    ],
  },
];

const piecesBoard = {
  0: [...tetronimoBoard],
  1: [...tetronimoBoard],
  2: [...tetronimoBoard],
  3: [...tetronimoBoard],
};

for (const [i, state] of states.entries()) {
  const currentPiece = structuredClone(piecesBoard[i]);
  for (const filledSpace of state.blocks) {
    currentPiece[filledSpace.x][filledSpace.y] = 1;
  }

  const stringifyT = currentPiece.map((level) => JSON.stringify(level));

  console.log(stringifyT.join('\n'), '\n');
}
