const tetronimoIndexReducer = columnIndex => (acc,rowElem,rowIndex)=> {
    if(isSpaceFilled(rowElem)) acc.push({
        y: columnIndex,
        x: rowIndex
    });
    return acc;
} 
const getInitialTetronimoState = (tetronimo,xSum)=>  tetronimo.map(te => te.map(block => ({...block, x: block.x + xSum}) ) );
const getNewTetronimo= newTetronimo => {
    const formsPositions = newTetronimo.forms.map(form =>
        form.flatMap((row, columnIndex) => row.reduce( tetronimoIndexReducer(columnIndex), []) ).filter(arr=>arr.length!=0)
    )
    return {
        color: newTetronimo.color,
        tetronimo: getInitialTetronimoState(formsPositions, TETRONIMO_STARTING_PLACE),
        orientation: 0
    }
}
const getRandomTetronimo = () => getNewTetronimo(TETRONIMOES[Math.floor(Math.random() * TETRONIMOES.length)]);
const getSpecificTetronimo = color => getNewTetronimo(TETRONIMOES[color-1]);
const moveTetronimoHorizontal = (direction, {tetronimo}) => tetronimo.map(te => te.map(block=>({...block, x: block.x+direction}) ) );
const moveTetronimoDown = ({tetronimo}) => tetronimo.map(te => te.map( block=>({...block, y: block.y+1}) ) );
const changeTetronimoOrientation = ({tetronimo,orientation}) => orientation<tetronimo.length-1 ? orientation+1 : 0;
const currentTetronimo = ({tetronimo,orientation}) => tetronimo[orientation];