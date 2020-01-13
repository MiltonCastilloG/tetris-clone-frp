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
const checkTetronimoCollisionBottom = getBinaryMap => tetronimo => tetronimo.map( checkCollisionBottom(getBinaryMap() ) ).reduce(booleanReducer);
const checkTetronimoCollisionRight = getBinaryMap => tetronimo => tetronimo.map(checkCollisionRight(getBinaryMap()) ).reduce(booleanReducer);
const checkTetronimoCollisionLeft = getBinaryMap => tetronimo => tetronimo.map(checkCollisionLeft(getBinaryMap()) ).reduce(booleanReducer);
const topBooleanReducer = (acc, value) => acc || value; 
const checkTetronimoCollisionTop = tetronimo => tetronimo.map(checkTopBorder).reduce(topBooleanReducer);

const tetronimoLanding = () => { 
    
    const erasedLinesLen = eraseLines();
    return erasedLinesLen;
}

const fetchForUpload = async (tetronimoToSave, binaryMapTosave, boardDataToSave) => {
    return await fetch('upload/game', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({tetronimo: tetronimoToSave, binaryMap: binaryMapTosave, boardData: boardDataToSave})
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
