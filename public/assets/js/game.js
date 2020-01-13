const { Stream, redux } = window;

const ticks = new Stream( next => setInterval(next, INTIAL_CLOCK_SPEED) )
const keyDowns = new Stream(next => document.addEventListener("keydown", next) );
const pauseGame = new Stream(next => document.querySelector(".js-pause-btn").addEventListener("click", next) );
const uploadGame = new Stream(next => document.querySelector(".js-upload-game-btn").addEventListener("click", next) );


const InitGame = ({tetronimoState, mapState, boardState}) => {
    const updateTetronimoPosition = (state = tetronimoState, action) => {
        switch (action.type) {
            case 'DOWN':
                return {...state, tetronimo: moveTetronimoDown(state)};
            case 'HORIZONTAL':
                return {...state, tetronimo: moveTetronimoHorizontal(action.direction, state)};
            case 'CHANGE_ORIENTATION':
                return {...state, orientation: changeTetronimoOrientation(state)};
            case 'RESTART':
                return action.newState
            default:
                return state
        }
    }
    const tetronimo = redux.createStore(updateTetronimoPosition);
    const getCurrentTetronimo = pipe(tetronimo.getState, currentTetronimo) 
    tetronimo.subscribe( pipe(currentTetronimo, moveFallingTetronimo) )
    
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
                return {...state, hold: action.newTetronimo, lockHold: true};
            case 'UNLOCK_HOLD':
                return {...state, lockHold: false}
            case 'HOLD&TETRONIMO':{
                state.tetronimoesBank.shift()
                state.tetronimoesBank.push(action.lastInBank)
                return {...state, hold: action.newTetronimo, tetronimoesBank: state.tetronimoesBank};
            }
            case 'COMPLETE_LANDING':{
                state.tetronimoesBank.shift()
                state.tetronimoesBank.push(action.lastInBank)
                return {...state, 
                    tetronimoesBank: state.tetronimoesBank,
                    lockHold: false, 
                    totalLines: state.totalLines + action.erasedLines,
                    score: state.score + state.scoreByErasedLines[action.erasedLines-1]
                };
            }
            case 'PARTIAL_LANDING':{
                state.tetronimoesBank.shift()
                state.tetronimoesBank.push(action.lastInBank)
                return {...state, 
                    tetronimoesBank: state.tetronimoesBank,
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
        const {hold, score, totalLines, tetronimoesBank} = state;
        if(hold !== undefined)
            addHoldToBoard(hold);
        addScoreToBoard(score, totalLines);
        addUpcomingTetronimoesToBoard(tetronimoesBank)
    })

    // const exampleScanTicks = ticks.scan(acc=>({top: acc.top + 1}), {top: 1}).map(acc=>({top: acc.top +3})).subscribe(console.log)
    const actionTicks = ticks.map( pipe(getCurrentTetronimo, checkTetronimoCollisionBottom(binaryMapState) ) );
    const movementTicks = actionTicks.filter(inBorder => inBorder);
    const landingTicks = actionTicks.filter(inBorder => !inBorder).map( pipe(getCurrentTetronimo, checkTetronimoCollisionTop ) )
    const topLanding = landingTicks.filter(topBorder => topBorder);
    const groundLanding = landingTicks.filter(topBorder => !topBorder);
    movementTicks.subscribe(()=> tetronimo.dispatch({ type: 'DOWN' }) );

    const fillMapSpace = color => ({y, x}) => binaryMap.dispatch({type: 'FILL_SPACE', x: x, y: y, fillWith: color});
    groundLanding.subscribe(()=>{
        const newTetronimo = boardData.getState().tetronimoesBank[0];
        const nextTetronimo = getRandomTetronimo();
        
        removeFallingBlocks();
        getCurrentTetronimo().forEach( fillMapSpace(tetronimo.getState().color) );
        const linesToErase = eraseLines( binaryMapState() );

        tetronimo.dispatch({ type: 'RESTART', newState: newTetronimo });
        if(linesToErase.length>0){
            binaryMap.dispatch({type: "ERASE_LINES", yPositions: linesToErase})
            boardData.dispatch({ type: 'COMPLETE_LANDING', lastInBank: nextTetronimo, erasedLines: linesToErase.length})
        }  
        else boardData.dispatch({ type: 'PARTIAL_LANDING', lastInBank: nextTetronimo})

        remapBlocksVisualization( binaryMapState() )
        addTetronimoToBoard(newTetronimo, FALLING_BLOCK_CLASS);
    })

    const isDown = event => "ArrowDown" === event.code;
    const isUp = event => "ArrowUp" === event.code;
    const upKeyDowns = keyDowns.filter(isUp)
    const downKeyDowns = keyDowns.filter(isDown).filter( pipe(getCurrentTetronimo, checkTetronimoCollisionBottom(binaryMapState) ) )
    upKeyDowns.subscribe(() => tetronimo.dispatch({ type: 'CHANGE_ORIENTATION'}));
    downKeyDowns.subscribe(()=>tetronimo.dispatch({ type: 'DOWN' }))

    const isC = event => "KeyC" === event.code;
    const cKeyDowns = keyDowns.filter(isC).filter(()=>!boardData.getState().lockHold)
    cKeyDowns.subscribe(() => {
        const {color} = tetronimo.getState();
        const {hold, tetronimoesBank} = boardData.getState();
        const fallingTetronimo = getSpecificTetronimo(color);
        const newTetronimoInBoard = hold || tetronimoesBank[0];
        if(hold === undefined)
            boardData.dispatch({ type: 'HOLD&TETRONIMO', newTetronimo: fallingTetronimo, lastInBank: getRandomTetronimo()})    
        else
            boardData.dispatch({ type: 'HOLD', newTetronimo: fallingTetronimo })    

        tetronimo.dispatch({ type: 'RESTART', newState: newTetronimoInBoard})
        updateTetronimoColor(newTetronimoInBoard.color)
    });

    const LEFT = -1;
    const RIGHT = 1;
    const isLeft = event => "ArrowLeft" === event.code;
    const isRight = event => "ArrowRight" === event.code;
    const leftKeyDowns = keyDowns.filter(isLeft).filter( pipe(getCurrentTetronimo, checkTetronimoCollisionLeft(binaryMapState) ) ).map(() => LEFT)
    const rightKeyDowns = keyDowns.filter(isRight).filter( pipe(getCurrentTetronimo, checkTetronimoCollisionRight(binaryMapState) ) ).map(() => RIGHT);
    const movements = Stream.merge(leftKeyDowns, rightKeyDowns);
    movements.subscribe(direction => tetronimo.dispatch({ type: 'HORIZONTAL', direction: direction }));

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
        const tetronimoToSave = tetronimo.getState();
        const binaryMapTosave = binaryMap.getState();
        const boardDataToSave = boardData.getState();
        const response = await fetchForUpload(tetronimoToSave, binaryMapTosave, boardDataToSave)
        const data = await response.json();
        alert(`Game save with hash ${data.hash}`)
    });
}

