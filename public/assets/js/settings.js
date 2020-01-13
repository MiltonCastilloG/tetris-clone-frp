const INTIAL_CLOCK_SPEED = 200; //in ms

const BOARD_WIDTH = 300; //in px
const BOARD_HEIGHT = 600; //in px

const HORIZONTAL_DIMENSIONS = 10; //MUST BE A PAIR NUMBER
const VERTICAL_DIMENSIONS = 20; //MUST BE A PAIR NUMBER
/*
Decided to use numbers instead of booleans since it allows
for a more expansive representation of data  
*/
const EMPTY_SPACE = 0;
const FILLED_SPACE = 1;
const BINARY_MAP_ROW = Array.from({length: HORIZONTAL_DIMENSIONS}, () => 0);
const BINARY_MAP = Array.from({length: VERTICAL_DIMENSIONS}, ()=>[...BINARY_MAP_ROW]);
const HORIZONTAL_MOVEMENT = BOARD_WIDTH/HORIZONTAL_DIMENSIONS;
const VERTICAL_MOVEMENT = BOARD_HEIGHT/VERTICAL_DIMENSIONS;
const TETRONIMO_STARTING_PLACE = HORIZONTAL_DIMENSIONS/2-1

const FALLING_BLOCK_CLASS = "js-falling-block";
const HOLD_TETRONIMO_CLASS = "js-hold-tetronimo";
const SCORE_CLASS = "js-score";
const LINE_SCORE_CLASS = "js-lines-score";
const UPCOMMING_TETRONIMOES = "js-upcomming-tetronimoes";

const BASE_ERASE_SCORE = [40, 100, 300, 400];