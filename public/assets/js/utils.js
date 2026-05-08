const pipe = (...fns) => x => fns.reduce((v, f) => f(v), x);

const isSpaceFilled = number => number !== EMPTY_SPACE;
const isLineFull = map => map.length == map.filter(isSpaceFilled).length;
//const eraseLine = y => BINARY_MAP[y] = BINARY_MAP[y].map(()=>0);
const eraseLines = binaryMap => {
    const linesToErase = binaryMap.reduce((acc, value, index ) => {
        if (isLineFull(value)) acc.push(index)
        return acc;
    },[])
    return linesToErase;
}


const checkTopBorder = ({y}) => y <= 0;
const checkBottomBorder = (rowIndex, binaryMapLen) => rowIndex < binaryMapLen-1;
const checkLeftBorder = columnIndex => columnIndex > 0;
const checkRightBorder = (columnIndex, binaryMapRowLen) => columnIndex < binaryMapRowLen-1;
const checkCollisionBottom = binaryMap => ({y, x}) => checkBottomBorder(y, binaryMap.length) ? !isSpaceFilled(binaryMap[y+1][x]) : false;
const checkCollisionLeft = binaryMap => ({y, x}) => checkLeftBorder(x) ? !isSpaceFilled(binaryMap[y][x-1]) : false;
const checkCollisionRight = binaryMap => ({y, x}) => checkRightBorder(x, binaryMap[0].length) ? !isSpaceFilled(binaryMap[y][x+1]) : false;

const booleanReducer = (acc, value) => acc && value; 
const checkTetrominoCollisionBottom = getBinaryMap => tetromino => tetromino.map( checkCollisionBottom(getBinaryMap() ) ).reduce(booleanReducer);
const checkTetrominoCollisionRight = getBinaryMap => tetromino => tetromino.map(checkCollisionRight(getBinaryMap()) ).reduce(booleanReducer);
const checkTetrominoCollisionLeft = getBinaryMap => tetromino => tetromino.map(checkCollisionLeft(getBinaryMap()) ).reduce(booleanReducer);
const topBooleanReducer = (acc, value) => acc || value; 
const checkTetrominoCollisionTop = tetromino => tetromino.map(checkTopBorder).reduce(topBooleanReducer);

const tetrominoLanding = () => { 
    
    const erasedLinesLen = eraseLines();
    return erasedLinesLen;
}

const fetchForUpload = async (tetrominoToSave, binaryMapTosave, boardDataToSave) => {
    return await fetch('upload/game', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({tetromino: tetrominoToSave, binaryMap: binaryMapTosave, boardData: boardDataToSave})
  });
}

const fetchForSetup = async hash => {
    return await fetch(`fetch/game?hash=${hash}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
        }   
    });
}
