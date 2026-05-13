const TETROMINO_DEFINITIONS = {
  yellow: {
    color: 'yellow',
    spawnAnchor: { x: 4, y: 0 },
    states: [
      {
        offsetX: 0,
        blocks: [
          { x: 1, y: 0 },
          { x: 2, y: 0 },
          { x: 1, y: 1 },
          { x: 2, y: 1 },
        ],
      },
      {
        offsetX: 0,
        blocks: [
          { x: 1, y: 0 },
          { x: 2, y: 0 },
          { x: 1, y: 1 },
          { x: 2, y: 1 },
        ],
      },
      {
        offsetX: 0,
        blocks: [
          { x: 1, y: 0 },
          { x: 2, y: 0 },
          { x: 1, y: 1 },
          { x: 2, y: 1 },
        ],
      },
      {
        offsetX: 0,
        blocks: [
          { x: 1, y: 0 },
          { x: 2, y: 0 },
          { x: 1, y: 1 },
          { x: 2, y: 1 },
        ],
      },
    ],
  },
  lightblue: {
    color: 'lightblue',
    spawnAnchor: { x: 3, y: 0 },
    states: [
      {
        offsetX: 0,
        blocks: [
          { x: 0, y: 1 },
          { x: 1, y: 1 },
          { x: 2, y: 1 },
          { x: 3, y: 1 },
        ],
      },
      {
        offsetX: 0,
        blocks: [
          { x: 2, y: 0 },
          { x: 2, y: 1 },
          { x: 2, y: 2 },
          { x: 2, y: 3 },
        ],
      },
      {
        offsetX: 0,
        blocks: [
          { x: 0, y: 2 },
          { x: 1, y: 2 },
          { x: 2, y: 2 },
          { x: 3, y: 2 },
        ],
      },
      {
        offsetX: 0,
        blocks: [
          { x: 1, y: 0 },
          { x: 1, y: 1 },
          { x: 1, y: 2 },
          { x: 1, y: 3 },
        ],
      },
    ],
  },
  orange: {
    color: 'orange',
    spawnAnchor: { x: 3, y: 0 },
    states: [
      {
        offsetX: 0,
        blocks: [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
          { x: 2, y: 0 },
          { x: 2, y: 1 },
        ],
      },
      {
        offsetX: 0,
        blocks: [
          { x: 1, y: 0 },
          { x: 1, y: 1 },
          { x: 1, y: 2 },
          { x: 0, y: 2 },
        ],
      },
      {
        offsetX: 0,
        blocks: [
          { x: 0, y: 1 },
          { x: 0, y: 0 },
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
          { x: 2, y: 0 },
        ],
      },
    ],
  },
  blue: {
    color: 'blue',
    spawnAnchor: { x: 3, y: 0 },
    states: [
      {
        offsetX: 0,
        blocks: [
          { x: 0, y: 1 },
          { x: 0, y: 0 },
          { x: 1, y: 0 },
          { x: 2, y: 0 },
        ],
      },
      {
        offsetX: 0,
        blocks: [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
          { x: 0, y: 1 },
          { x: 0, y: 2 },
        ],
      },
      {
        offsetX: 0,
        blocks: [
          { x: 0, y: 1 },
          { x: 1, y: 1 },
          { x: 2, y: 1 },
          { x: 2, y: 0 },
        ],
      },
      {
        offsetX: 0,
        blocks: [
          { x: 2, y: 0 },
          { x: 2, y: 1 },
          { x: 2, y: 2 },
          { x: 1, y: 2 },
        ],
      },
    ],
  },
  red: {
    color: 'red',
    spawnAnchor: { x: 3, y: 0 },
    states: [
      {
        offsetX: 0,
        blocks: [
          { x: 1, y: 0 },
          { x: 2, y: 0 },
          { x: 0, y: 1 },
          { x: 1, y: 1 },
        ],
      },
      {
        offsetX: 0,
        blocks: [
          { x: 1, y: 0 },
          { x: 1, y: 1 },
          { x: 2, y: 1 },
          { x: 2, y: 2 },
        ],
      },
      {
        offsetX: 0,
        blocks: [
          { x: 1, y: 1 },
          { x: 2, y: 1 },
          { x: 0, y: 2 },
          { x: 1, y: 2 },
        ],
      },
      {
        offsetX: 0,
        blocks: [
          { x: 0, y: 0 },
          { x: 0, y: 1 },
          { x: 1, y: 1 },
          { x: 1, y: 2 },
        ],
      },
    ],
  },
  purple: {
    color: 'purple',
    spawnAnchor: { x: 3, y: 0 },
    states: [
      {
        offsetX: 0,
        blocks: [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
          { x: 2, y: 0 },
          { x: 1, y: 1 },
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
          { x: 0, y: 1 },
          { x: 1, y: 1 },
          { x: 1, y: 2 },
        ],
      },
    ],
  },
  green: {
    color: 'green',
    spawnAnchor: { x: 3, y: 0 },
    states: [
      {
        offsetX: 0,
        blocks: [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
          { x: 1, y: 1 },
          { x: 2, y: 1 },
        ],
      },
      {
        offsetX: 0,
        blocks: [
          { x: 2, y: 0 },
          { x: 1, y: 1 },
          { x: 2, y: 1 },
          { x: 1, y: 2 },
        ],
      },
      {
        offsetX: 0,
        blocks: [
          { x: 0, y: 1 },
          { x: 1, y: 1 },
          { x: 1, y: 2 },
          { x: 2, y: 2 },
        ],
      },
      {
        offsetX: 0,
        blocks: [
          { x: 1, y: 0 },
          { x: 0, y: 1 },
          { x: 1, y: 1 },
          { x: 0, y: 2 },
        ],
      },
    ],
  },
};
