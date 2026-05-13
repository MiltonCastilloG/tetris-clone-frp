const showBoard = () => {
    document.querySelector(".music").play()
    document.querySelector(".js-menu-container").style.display = "none";
    document.querySelector(".game-container").style.visibility = "visible";
}

const prepareGame = () => {
    const tetrominoState = getRandomTetromino();
    const boardState = {
        tetrominoesBank: [getRandomTetromino(),getRandomTetromino(),getRandomTetromino()],
        hold: undefined,
        lastHold: undefined,
        score: 0,
        totalLines: 0,
        scoreByErasedLines: BASE_ERASE_SCORE,
        lockHold: false
    }
    const mapState = [...BINARY_MAP];
    addTetrominoToBoard(tetrominoState, FALLING_BLOCK_CLASS)
    showBoard();
    return {tetrominoState, mapState, boardState};
}
const loadGame = async () => {
    const hash = document.querySelector(".js-game-hash").value
    const response = await fetchForSetup(hash);
    const data = await response.json();
    const tetrominoState = data.tetromino;
    const mapState = data.binaryMap;
    const boardState = data.boardData;
    showBoard()

    const {hold, score, totalLines, tetrominoesBank} = boardState;
    if(hold !== undefined)
        addHoldToBoard(hold);
    addScoreToBoard(score, totalLines);
    addUpcomingTetrominoesToBoard(tetrominoesBank)
    remapBlocksVisualization( mapState )
    addTetrominoToBoard(tetrominoState, FALLING_BLOCK_CLASS)

    return {tetrominoState, mapState, boardState}
}

const showInputForFetch = () => {
    document.querySelector(".js-load-btn").style.display = "none";
    document.querySelector(".js-game-hash").style.visibility = "visible";
    document.querySelector(".js-game-hash-btn").style.visibility = "visible";
}
document.querySelector(".js-game-start-btn").addEventListener("click", pipe(prepareGame, InitGame) );
document.querySelector(".js-load-btn").addEventListener("click",  showInputForFetch);
document.querySelector(".js-game-hash-btn").addEventListener("click",  async () => {
    const states = await loadGame();
    InitGame(states) 
});