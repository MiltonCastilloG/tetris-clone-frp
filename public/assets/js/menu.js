const showBoard = () => {
    document.querySelector(".music").play()
    document.querySelector(".js-menu-container").style.display = "none";
    document.querySelector(".game-container").style.visibility = "visible";
}

const prepareGame = () =>{
    const tetronimoState = getRandomTetronimo();
    const boardState = {
        tetronimoesBank: [getRandomTetronimo(),getRandomTetronimo(),getRandomTetronimo()],
        hold: undefined,
        lastHold: undefined,
        score: 0,
        totalLines: 0,
        scoreByErasedLines: BASE_ERASE_SCORE,
        lockHold: false
    }
    const mapState = [...BINARY_MAP];
    addTetronimoToBoard(tetronimoState, FALLING_BLOCK_CLASS)
    showBoard();
    return {tetronimoState, mapState, boardState};
}
const loadGame = async () => {
    const hash = document.querySelector(".js-game-hash").value
    const response = await fetchForSetup(hash);
    const data = await response.json();
    const tetronimoState = data.tetronimo;
    const mapState = data.binaryMap;
    const boardState = data.boardData;
    showBoard()

    const {hold, score, totalLines, tetronimoesBank} = boardState;
    if(hold !== undefined)
        addHoldToBoard(hold);
    addScoreToBoard(score, totalLines);
    addUpcomingTetronimoesToBoard(tetronimoesBank)
    remapBlocksVisualization( mapState )
    addTetronimoToBoard(tetronimoState, FALLING_BLOCK_CLASS)

    return {tetronimoState, mapState, boardState}
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