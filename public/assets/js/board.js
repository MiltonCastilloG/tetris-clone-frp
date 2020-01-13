const getVerticalPosPx = (abstractPos) => abstractPos * VERTICAL_MOVEMENT + document.querySelector(".js-board").getBoundingClientRect().top;
const getHorizontalPosPx = (abstractPos) => abstractPos * VERTICAL_MOVEMENT + document.querySelector(".js-board").getBoundingClientRect().left;

const moveFallingBlock = (element, {y,x}) => {
    element.style.top = `${getVerticalPosPx(y)}px`;
    element.style.left = `${getHorizontalPosPx(x)}px`;
}
const moveFallingTetronimo = tetronimo => document.querySelectorAll(`.${FALLING_BLOCK_CLASS}`).forEach( (element,index)=>moveFallingBlock(element, tetronimo[index]) )
const updateTetronimoColor = color =>document.querySelectorAll(`.${FALLING_BLOCK_CLASS}`).forEach(elem => elem.style.backgroundColor = colorFactory(color))

const addBlockToBoard = ({y, x}, extraClass, color) => {
    const block = document.createElement("div");
    block.className = `block js-block ${extraClass}`;
    block.style.backgroundColor = color;
    block.style.width = `${HORIZONTAL_MOVEMENT-2}px`;
    block.style.height = `${VERTICAL_MOVEMENT-2}px`;
    block.style.border = `1px solid`;
    block.style.top = `${getVerticalPosPx(y)}px`;
    block.style.left = `${getHorizontalPosPx(x)}px`;
    document.querySelector(".js-board").appendChild(block);
};
const addTetronimoToBoard = ({tetronimo,orientation, color}, extraClass) => 
    tetronimo[orientation].forEach(block => 
        addBlockToBoard(block, `${extraClass}`, colorFactory(color) ) 
    )
const removeFallingBlocks = () => document.querySelectorAll(`.${FALLING_BLOCK_CLASS}`).forEach(elem => elem.classList.remove(`.${FALLING_BLOCK_CLASS}`) );

const addHoldToBoard = holdTetronimo => document.querySelector(`.${HOLD_TETRONIMO_CLASS}`).style.backgroundImage = `url(./assets/img/tetronimo_${holdTetronimo.color}.png)`;
const addScoreToBoard = (score, lineScore) => {
    document.querySelector(`.${SCORE_CLASS}`).textContent = score;
    document.querySelector(`.${LINE_SCORE_CLASS}`).textContent = lineScore;
}
const addUpcomingTetronimoesToBoard = tetronimoesBank => {
    const upcommingSpace = document.querySelector(`.${UPCOMMING_TETRONIMOES}`);
    upcommingSpace.innerHTML = "";
    tetronimoesBank.forEach(tetronimo=>{
        const upcomming = document.createElement("div");
        upcomming.className = `upcomming js-upcomming`;
        upcomming.style.backgroundImage = `url(./assets/img/tetronimo_${tetronimo.color}.png)`;
        upcommingSpace.appendChild(upcomming)
    });
}


const remapBlocksVisualization = binaryMap => {
    document.querySelector(".js-board").innerHTML = "";
    binaryMap.forEach( (row, rowIndex) => 
        row.forEach( (spaceNum, columnIndex) => 
            isSpaceFilled(spaceNum) ? addBlockToBoard({y: rowIndex, x: columnIndex}, "", colorFactory(spaceNum)) : false
        )
    );
}