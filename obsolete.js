/***************************CO-ORDINATES***************************/
function getCell(x, y) { return ((y) * width) + x; }

function getXY (cell) {
    let x = (cell % (width));
    let y = ((cell - x) / (width));
    return [x, y];
}

/***************************SURROUNDING MECHANICS***************************/

function checkSurroundBtn(cell, type) {
    //Get X, Y coordinates of the cell
    let c = getXY(cell);

    //Check if cell is an edge case
    let surrounding = checkBoundaries(c);

    let cells = [];

    //Flags and Minea
    let f = 0, m = 0;

    //Lose?
    let l = false;

    //For each surrounding cell to check
    for (let i = 0; i < surrounding.length; i++) {    
        let x = surrounding[i][0] + c[0];
        let y = surrounding[i][1] + c[1];  
        let checkCell = getCell(x, y);

        //Middle Click On Dormant Cell
        if (type == 0) {
            if (btnState[checkCell].state == 0) {
                color("btn" + checkCell, "rgb(89, 89, 89)");
                darkened.push(checkCell);
            }          
        }
        //Check if cell is a mine or a flag
        else if (type == 1) {  
            if (btnState[checkCell].state == 1) f++;
            if (minesArray[checkCell] == "%") m++;
        }
        //Show surrounding cells
        else if (type == 2) {      
            //If surrounding cell is not a mine
            if (minesArray[checkCell] != "%") {
                //If cell was not already hidden
                if (id("btn" + checkCell).style.visibility == "visible") {
                    shownCount++; 
                    hidden("btn" + checkCell);
                }
                color(checkCell, "#9eabb8"); 

                //If cell is blank > Show nearby cells
                if (minesArray[checkCell] == "") {
                    clearSound.play();
                    recursiveShowNearby(checkCell);
                }                    
            }
            //If clicked cell had incorrect surrounding flags - LOSE
            else if (btnState[checkCell].state != 1) {
                cells.push(checkCell);
                l = true;
            }
        }
    }
    if (l) lose(cells);
    if (f == m && minesArray[cell] == f) return true;
}

function checkBoundaries(c) {
    //For Edge Cases (Corners and Sides), return cells to check
    if (c[0] == 0 && c[1] == 0) return [[0, 1], [1, 0], [1, 1]];
    if (c[0] == width - 1 && c[1] == height - 1) return [[0, -1], [-1, 0], [-1, -1]];
    if (c[0] == 0 && c[1] == height - 1) return [[0, -1], [1, 0], [1, -1]];
    if (c[0] == width - 1 && c[1] == 0) return [[0, 1], [-1, 0], [-1, 1]];
    if (c[0] == 0 && c[1] != 0 && c[1] != height - 1) return [[0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
    if (c[0] == width - 1 && c[1] != 0 && c[1] != height - 1) return [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1]];
    if (c[1] == 0 && c[0] != 0 && c[0] != width - 1) return [[-1, 0], [-1, 1], [0, 1], [1, 0], [1, 1]];
    if (c[1] == height - 1 && c[0] != 0 && c[0] != width - 1) return [[-1, -1], [-1, 0], [0, -1], [1, -1], [1, 0]];
    return [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]]; 
}

function recursiveShowNearby(cell) {

    if (id("btn" + cell).style.visibility != "hidden") shownCount++;
    hidden("btn" + cell);
    color(cell, "#9eabb8");
    blankShown.push(cell);

    let c = getXY(cell);
    let surrounding = checkBoundaries(c);

    for (let i = 0; i < surrounding.length; i++) {   
        let x = surrounding[i][0] + c[0];
        let y = surrounding[i][1] + c[1];  
        let checkCell = getCell(x, y);

        if (id("btn" + checkCell).style.visibility != "hidden") shownCount++;

        hidden("btn" + checkCell); 
        color(checkCell,"#9eabb8");

        if (minesArray[checkCell] == "" && !blankShown.includes(checkCell)) {
            recursiveShowNearby(checkCell);
        }                
    }
}

/***************************RESET GAME***************************/
function reset() {

    game_state = 0;
    score = mines;
    shownCount = 0;

    blankShown = [];
    btnState = [];

    //Reset Menu
    menu(1);
    
    //Reset Visual Elements
    id("score").innerHTML = "MINES: " + mines;
    id("timer").style.color = "white";
    id("pauseBtn").style.visibility = "hidden";
    id("pauseBtn").textContent = "PAUSE";

    timer.stop();
    timer.reset();

    paused = true;
}

/***************************LEFT CLICK***************************/
function cellClicked(cell) {
    
    //If Game has not finished
    if (game_state != 2) { 
        //If game has not started > Begin Timer
        if (game_state == 0) {
            game_state = 1;   
            id("pauseBtn").style.visibility = "visible"; 
            pause();
        }
        //Cell Clicked is a blank cell
        if (btnState[cell].state == 0) {
            //Hide the cell
            hidden("btn" + cell);
            color(cell, "#9eabb8");
            shownCount++;

            //Cell Clicked is Mine
            if (minesArray[cell] == "%") {
                //If first cell 
                if (shownCount == 1) {
                    get_new_game();
                    cellClicked(cell);
                    return;
                }
                //Else you lose
                lose([cell]);
            }
            //Cell clicked is blank > show nearby cells
            else if (minesArray[cell] == ""){
                blankShown = [];
                clearSound.play();
                recursiveShowNearby(cell);
            }
            else clickSound.play(); 
            checkWin();          
        }
    }
}

function cellRightClicked(btn) {
    //If Currently Blank > Switch to flag
    if(btnState[btn.name].state == 0) {
        score--;
        flagOnSound.play();
        id(btn.id).setAttribute("src", "images/flag_red.png");
    }
    //Else If Flag > Switch to question mark
    else if (btnState[btn.name].state == 1) {
        score++; 
        flagOffSound.play();
        id(btn.id).setAttribute("src", "images/question.png");
    }
    //If Question Mark > Switch to blank
    else id(btn.id).setAttribute("src", "images/bg.png");

    //Update Score
    id("score").innerHTML = "MINES: " + score;

    //Increment and loop button state
    btnState[btn.name].state ++;
    if (btnState[btn.name].state == 3) btnState[btn.name].state = 0;
}

/***************************WIN / LOSE***************************/
function lose(cells) {
    explosionSound.play();
    timer.stop();
    id("timer").style.color = "red";
    id("pauseBtn").style.visibility = "hidden";
    game_state = 2;
    for (let i = 0; i < minesArray.length; i++) {
        if (btnState[i].state == "1") {
            if (minesArray[i] == "%") {
                id("mineimg" + i).setAttribute("src", "images/flag_green.png");                           
            }
            else if (minesArray[i] != "%") {
                id("btn" + i).setAttribute("src", "images/bg.png");                          
            }
            id(i).style.backgroundColor = "#9eabb8";
        }
        id("btn" + i).style.visibility = "hidden";
    }
    cells.forEach(cell => {
        id("mineimg" + cell).setAttribute("src", "images/mine_red.png");
    });
    for (let i = 0; i < btnState.length; i++) {
        if (btnState[i].state == 1 && minesArray[i] != "%") {
            id("btn" + i).style.visibility = "visible";
            id("btn" + i).setAttribute("src", "images/flag_wrong.png");
        }
    }
}

function checkWin() {
    //If all non-mine cells are shown - Win
    if (size - mines == shownCount) {
      
        game_state = 2;
        winSound.play();    
        timer.stop(); 

        id("timer").style.color = "green";   
        id("pauseBtn").style.visibility = "hidden";

        //For each mine, make green!
        for (let i = 0; i < minesArray.length; i++) {
            hidden("btn_div" + i);
            if (minesArray[i] ==  "%") id("btn" + i).setAttribute("src", "images/mine_green.png");
        }                      
    }
}

///////
//Middle Click
/*if (event.button == 1) { 
    middleClick.play();           
    
    if (classname == "button_div" && id(btn_id).style.visibility == "hidden" && checkSurroundBtn(cell, 1)) {
        hidden(div_id);
        hidden(btn_id);
        if (minesArray[cell] != "%" && minesArray[cell] != "") {
            checkSurroundBtn(cell, 2);
        }
    }
    else checkSurroundBtn(cell, 0);
    checkWin();*/

//Middle release
/*if (game_state != 2 && event.button == 1) {
    middleUnClick.play();
    darkened.forEach(e => {
        id("btn" + e).style.backgroundColor = "rgb(127, 127, 127)";
    });
    darkened = [];
} */