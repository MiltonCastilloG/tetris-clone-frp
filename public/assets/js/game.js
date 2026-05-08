const { Stream, redux } = window;

const ticks = new Stream( next => setInterval(next, INTIAL_CLOCK_SPEED) )
const keyDowns = new Stream(next => document.addEventListener("keydown", next) );
const pauseGame = new Stream(next => document.querySelector(".js-pause-btn").addEventListener("click", next) );
const uploadGame = new Stream(next => document.querySelector(".js-upload-game-btn").addEventListener("click", next) );


const InitGame = ({tetrominoState, mapState, boardState}) => {
    const updateTetrominoPosition = (state = tetrominoState, action) => {
        switch (action.type) {
            case 'DOWN':
                return {...state, tetromino: moveTetrominoDown(state)};
            case 'HORIZONTAL':
                return {...state, tetromino: moveTetrominoHorizontal(action.direction, state)};
            case 'CHANGE_ORIENTATION':
                return {...state, orientation: changeTetrominoOrientation(state)};
            case 'RESTART':
                return action.newState
            default:
                return state
        }
    }
    const tetromino = redux.createStore(updateTetrominoPosition);
    const getCurrentTetromino = pipe(tetromino.getState, currentTetromino) 
    tetromino.subscribe( pipe(currentTetromino, moveFallingTetromino) )
    
    const updateBinaryMap = (state = mapState, action) => {
        switch (action.type) {
            case 'FILL_SPACE':{
                state[action.y][action.x] = action.fillWith;
                return state;
            }
            case 'ERASE_LINES':{
                const newBinaryMap = state.filter((arrElem, index) => {
                    for (const value of action.yPositions) {
                        if (value === index)  return false;
                    }
                    return true;
                })
                action.yPositions.forEach(()=>newBinaryMap.unshift([...BINARY_MAP_ROW]))
                state = newBinaryMap
                return state;
            }
            case 'SET':
                return action.newBinaryMap
            case 'RESTART':
                return state.map(row=>row.map(()=>0))
            default:
                return state
        }
    }
    
    const binaryMap = redux.createStore(updateBinaryMap);
    const binaryMapState = binaryMap.getState; 
    binaryMap.subscribe(()=>{})

    const updateBoardData = (state = boardState, action) => {
        switch (action.type) {
            case 'HOLD':
                return {...state, hold: action.newTetromino, lockHold: true};
            case 'UNLOCK_HOLD':
                return {...state, lockHold: false}
            case 'HOLD&TETROMINO':{
                state.tetrominoesBank.shift()
                state.tetrominoesBank.push(action.lastInBank)
                return {...state, hold: action.newTetromino, tetrominoesBank: state.tetrominoesBank};
            }
            case 'COMPLETE_LANDING':{
                state.tetrominoesBank.shift()
                state.tetrominoesBank.push(action.lastInBank)
                return {...state, 
                    tetrominoesBank: state.tetrominoesBank,
                    lockHold: false, 
                    totalLines: state.totalLines + action.erasedLines,
                    score: state.score + state.scoreByErasedLines[action.erasedLines-1]
                };
            }
            case 'PARTIAL_LANDING':{
                state.tetrominoesBank.shift()
                state.tetrominoesBank.push(action.lastInBank)
                return {...state, 
                    tetrominoesBank: state.tetrominoesBank,
                    lockHold: false, 
                };
            }
            case 'RESTART':
                return action.newState
            default:
                return state
        }
    }
    const boardData = redux.createStore(updateBoardData);
    boardData.subscribe(state=>{
        const {hold, score, totalLines, tetrominoesBank} = state;
        addHoldToBoard(hold);
        addScoreToBoard(score, totalLines);
        addUpcomingTetrominoesToBoard(tetrominoesBank)
    })

    // const exampleScanTicks = ticks.scan(acc=>({top: acc.top + 1}), {top: 1}).map(acc=>({top: acc.top +3})).subscribe(console.log)
    const actionTicks = ticks.map( pipe(getCurrentTetromino, checkTetrominoCollisionBottom(binaryMapState) ) );
    const movementTicks = actionTicks.filter(inBorder => inBorder);
    const landingTicks = actionTicks.filter(inBorder => !inBorder).map( pipe(getCurrentTetromino, checkTetrominoCollisionTop ) )
    const topLanding = landingTicks.filter(topBorder => topBorder);
    const groundLanding = landingTicks.filter(topBorder => !topBorder);
    movementTicks.subscribe(()=> tetromino.dispatch({ type: 'DOWN' }) );

    const fillMapSpace = color => ({y, x}) => binaryMap.dispatch({type: 'FILL_SPACE', x: x, y: y, fillWith: color});
    groundLanding.subscribe(()=>{
        const newTetromino = boardData.getState().tetrominoesBank[0];
        const nextTetromino = getRandomTetromino();
        
        removeFallingBlocks();
        getCurrentTetromino().forEach( fillMapSpace(tetromino.getState().color) );
        const linesToErase = eraseLines( binaryMapState() );

        tetromino.dispatch({ type: 'RESTART', newState: newTetromino });
        if(linesToErase.length>0){
            binaryMap.dispatch({type: "ERASE_LINES", yPositions: linesToErase})
            boardData.dispatch({ type: 'COMPLETE_LANDING', lastInBank: nextTetromino, erasedLines: linesToErase.length})
        }  
        else boardData.dispatch({ type: 'PARTIAL_LANDING', lastInBank: nextTetromino})

        remapBlocksVisualization( binaryMapState() )
        addTetrominoToBoard(newTetromino, FALLING_BLOCK_CLASS);
    })

    const isDown = event => "ArrowDown" === event.code;
    const isUp = event => "ArrowUp" === event.code;
    const upKeyDowns = keyDowns.filter(isUp)
    const downKeyDowns = keyDowns.filter(isDown).filter( pipe(getCurrentTetromino, checkTetrominoCollisionBottom(binaryMapState) ) )
    upKeyDowns.subscribe(() => tetromino.dispatch({ type: 'CHANGE_ORIENTATION'}));
    downKeyDowns.subscribe(()=>tetromino.dispatch({ type: 'DOWN' }))

    const isC = event => "KeyC" === event.code;
    const cKeyDowns = keyDowns.filter(isC).filter(()=>!boardData.getState().lockHold)
    cKeyDowns.subscribe(() => {
        const {color} = tetromino.getState();
        const {hold, tetrominoesBank} = boardData.getState();
        const fallingTetromino = getSpecificTetromino(color);
        const newTetrominoInBoard = hold || tetrominoesBank[0];
        if(hold === undefined)
            boardData.dispatch({ type: 'HOLD&TETROMINO', newTetromino: fallingTetromino, lastInBank: getRandomTetromino()})    
        else
            boardData.dispatch({ type: 'HOLD', newTetromino: fallingTetromino })    

        tetromino.dispatch({ type: 'RESTART', newState: newTetrominoInBoard})
        updateTetrominoColor(newTetrominoInBoard.color)
    });

    const LEFT = -1;
    const RIGHT = 1;
    const isLeft = event => "ArrowLeft" === event.code;
    const isRight = event => "ArrowRight" === event.code;
    const leftKeyDowns = keyDowns.filter(isLeft).filter( pipe(getCurrentTetromino, checkTetrominoCollisionLeft(binaryMapState) ) ).map(() => LEFT)
    const rightKeyDowns = keyDowns.filter(isRight).filter( pipe(getCurrentTetromino, checkTetrominoCollisionRight(binaryMapState) ) ).map(() => RIGHT);
    const movements = Stream.merge(leftKeyDowns, rightKeyDowns);
    movements.subscribe(direction => tetromino.dispatch({ type: 'HORIZONTAL', direction: direction }));

    const endGame = gameEnded  => {
        if(!gameEnded){
            Stream.pauseAll(movementTicks, upKeyDowns, movements)
            alert("You lose")
        }
    };
    topLanding.scan(flag=>flag + 1, 0).subscribe(gameEnded=>endGame(gameEnded>1));
    pauseGame.scan(paused => !paused, true)
    .subscribe(paused=>paused ? Stream.resumeAll(movementTicks, upKeyDowns, movements) : Stream.pauseAll(movementTicks, upKeyDowns, movements));

    uploadGame.scan(flag=>flag + 1, 0).subscribe(async ()=>{
        Stream.pauseAll(movementTicks, upKeyDowns, movements);
        const tetrominoToSave = tetromino.getState();
        const binaryMapTosave = binaryMap.getState();
        const boardDataToSave = boardData.getState();
        const response = await fetchForUpload(tetrominoToSave, binaryMapTosave, boardDataToSave)
        const data = await response.json();
        alert(`Game save with hash ${data.hash}`)
    });
}

