import {
  createFreshGamePayload,
  createLoadedGamePayload,
  startGameLoop,
} from '../initGame.js';

const showBoard = () => {
  document.querySelector('.music').play();
  document.querySelector('.js-menu-container').style.display = 'none';
  document.querySelector('.game-container').style.visibility = 'visible';
};

const showInputForFetch = () => {
  document.querySelector('.js-load-btn').style.display = 'none';
  document.querySelector('.js-game-hash').style.visibility = 'visible';
  document.querySelector('.js-game-hash-btn').style.visibility = 'visible';
};

document.querySelector('.js-game-start-btn').addEventListener('click', () => {
  const states = createFreshGamePayload();
  showBoard();
  startGameLoop(states);
});

document
  .querySelector('.js-load-btn')
  .addEventListener('click', showInputForFetch);

document
  .querySelector('.js-game-hash-btn')
  .addEventListener('click', async () => {
    const hash = document.querySelector('.js-game-hash').value;
    const states = await createLoadedGamePayload(hash);
    showBoard();
    startGameLoop(states);
  });
