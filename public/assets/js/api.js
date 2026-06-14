export const fetchForUpload = async (
  tetrominoToSave,
  lockedMapToSave,
  boardDataToSave
) => {
  return await fetch('upload/game', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({
      tetromino: tetrominoToSave,
      lockedMap: lockedMapToSave,
      boardData: boardDataToSave,
    }),
  });
};

export const fetchForSetup = async (hash) => {
  return await fetch(`fetch/game?hash=${hash}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
};
