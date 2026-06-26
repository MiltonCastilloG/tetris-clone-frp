import { Stream } from '../lib/stream.js';
import { fetchForUpload } from '../api.js';
import { pauseGame, uploadGame } from './streams.js';

export const wireLifecycle = ({
  tetromino,
  lockedMap,
  boardData,
  movementTicks,
  safeRotateKeyDowns,
  movements,
  topLanding,
}) => {
  const endGame = (gameEnded) => {
    if (!gameEnded) {
      Stream.pauseAll(movementTicks, safeRotateKeyDowns, movements);
      alert('You lose');
    }
  };
  topLanding
    .scan((flag) => flag + 1, 0)
    .subscribe((gameEnded) => endGame(gameEnded > 1));
  pauseGame
    .scan((paused) => !paused, true)
    .subscribe((paused) =>
      paused
        ? Stream.resumeAll(movementTicks, safeRotateKeyDowns, movements)
        : Stream.pauseAll(movementTicks, safeRotateKeyDowns, movements)
    );

  uploadGame
    .scan((flag) => flag + 1, 0)
    .subscribe(async () => {
      Stream.pauseAll(movementTicks, safeRotateKeyDowns, movements);
      const tetrominoToSave = tetromino.getState();
      const lockedMapToSave = lockedMap.getState();
      const boardDataToSave = boardData.getState();
      const response = await fetchForUpload(
        tetrominoToSave,
        lockedMapToSave,
        boardDataToSave
      );
      const data = await response.json();
      alert(`Game save with hash ${data.hash}`);
    });
};
