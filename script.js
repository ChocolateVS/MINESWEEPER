

/***************************Initialization***************************/
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
};

function drawGrid() {

    //Create Grid Element
    let grid = newElement("grid", "grid", "div", "", [], null, false); 
    newElement("grid_menu", "grid_menu", "div", "", [], grid, true); 

    //Cell Width
    let cell_width;

    /*  GRID SIZING
        - Check the ratio between cells and screen size
        - Use 70% of the screen height
        - For which ever ratio is less > calculate cell width ot fit
        - Set grid size based on this
    */
    if (screen_width / width >= screen_height / height) {
        grid_height = Math.round(screen_height * 0.7);
        cell_width = (grid_height / (height));
        grid_width = cell_width * width;
    }
    else {
        grid_width = Math.round(screen_width * 0.7);
        cell_width = (grid_width / (width));
        grid_height = cell_width * height;
    }

    //Set Grid width and height;
    grid.style.width = grid_width + "px";
    grid.style.height = grid_height + "px";

    //Create other elements
    newElement("title", "title", "h1", "VERY AMAZING MINE SWEEPER ;)", [], body, true);
    newElement("details", "details", "div", "" + score, [], body, true); 
    newElement("score", "score", "h2", "MINES: " + score, [], id("details"), true); 
    id("details").appendChild(timer_elem);
    
    //Make Everything
    for (let i = 0; i < size; i++) {
        /*********************Create Cell*********************/
        let cell = newElement(i, "cell", "div", "", [], null, false);
        let boxshadow = cell_width * 0.05;
        let font_size = cell_width / 1.75;
        cell.style.width = cell_width + "px";
        cell.style.height = cell_width + "px";

        cell.style.boxShadow = "inset 0px 0px 0px " + boxshadow + "px #bfbfbf";
        cell.style.fontSize = font_size + "px";

        //Find type of cell based on surrounding mines
        //Either Number: [1 - 8], Blank or Mine: % )
        var type = checkSurround(i);
        
        //If not blank
        if (type != 0) {
            //If type is a mine, set cell image to a mine
            if (type == "%") newElement("mineimg" + i, "mine", "img", "", [["src", "images/mine.png"]], cell, true);

            //Else set cell type to a number
            else cell.innerHTML = type;
            minesArray[i] = type;
        }
        
        //Set cell color based on type
        cell.style.color = colors[type - 1];
        grid.appendChild(cell);

        /*********************Create Button*********************/
        let btn_div = newElement("btn_div" + i, "button_div", "div", "", [], null, false);
        let btn = newElement("btn" + i, "button", "input", "", [["type", "image"], ["src", "images/bg.png"], ["name", i]], btn_div, false);
        
        //Button Width 
        let btn_width = cell_width - (boxshadow * 2);

        //Set Button width and make visible
        btn.style.width = btn_width + "px";
        btn.style.height = btn_width + "px";
        btn.style.visibility = "visible";

        //Set Button Container width and make visible
        btn_div.style.width = cell_width + "px";
        btn_div.style.height = cell_width + "px";
        btn_div.style.visibility = "visible";

        //Set Button Container Offset and shadow
        btn_div.style.boxShadow = "inset 0px 0px 0px " + boxshadow + "px #bfbfbf";
        btn_div.style.marginLeft = - cell_width + "px";
        
        btn_div.appendChild(btn);
        grid.appendChild(btn_div);
        
        //Button state object for each variable
        let b = {
            id: "btn" + i,
            state: 0
        }
        
        btnState.push(b);
    }

    body.appendChild(grid);
        
    /*********************Create Bottom Menu Button's*********************/

    var bottomMenu = newElement("bottomMenu", "bottomMenu", "div", "", [], null, false);

    newElement("resetBtn", "resetBtn", "button", "NEW GAME (N)", [["onclick", "reset(0)"]], bottomMenu, true);
    newElement("restartBtn", "resetBtn", "button", "PLAY AGAIN (R)", [["onclick", "reset(1)"]], bottomMenu, true);
    newElement("menuBtn", "resetBtn", "button", "MENU (ESC / M)", [["onclick", "menu(0)"]], bottomMenu, true);
    newElement("hostBtn", "resetBtn", "button", "HOST", [["onclick", "host_menu(0)"]], bottomMenu, true);
    newElement("hostBtn", "resetBtn", "button", "JOIN", [["onclick", "join_menu(0)"]], bottomMenu, true);
    newElement("pauseBtn", "resetBtn", "button", "PLAY", [["onclick", "pause()"]], bottomMenu, true);
    newElement("pasued_msg", "msg", "h1", "Game Paused", [], id("grid_menu"), true);
    
    body.appendChild(bottomMenu);
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
            if (minesArray[i] ==  "%") id("btn" + i).setAttribute("src", "images/mine_green.png");
        }                      
    }
}

/***************************RESET GAME***************************/
function reset(type) {

    //Clear Body
    body.innerHTML = "";

    //Reset Screen Width
    screen_width = window.screen.width;
    screen_height = window.screen.height;

    game_state = 0;
    score = mines;
    shownCount = 0;

    blankShown = [];
    btnState = [];

    //Grid Size
    size = width * height;

    //If New Game - Re-Initialize
    if (type == 0) {
        minesArray = [];
        for (let i = 0; i < size; i++)  minesArray[i] = "";
        for (let i = 0; i < mines; i++) { minesArray[i] = "%";}
        shuffleArray(minesArray);
    }

    //Reset Menu
    menu(1);

    //Re-Draw Grid
    drawGrid();
    
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
                    reset(0);
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

/***************************RIGHT CLICK***************************/
document.addEventListener('contextmenu', function(event) {
    let classname = event.target.className;
    if (classname == "button_div" || classname == "button" || classname == "cell") {
        event.preventDefault();
    }
});

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

/***************************CLICK!***************************/
document.addEventListener('mousedown', function(event) {
    let classname = event.target.className;
    //If Clicking a cell
    if (classname == "button_div" || classname == "button" || classname == "cell" && game_state != 2) {

        event.preventDefault();

        //Get Cell Number  
        let cell, btn_id, div_id;

        if (classname == "button_div") {
            div_id = event.target.id;
            cell = div_id.slice(7);
            btn_id = "btn" + cell;
        }
        else if (classname == "button") {
            btn_id = event.target.id;
            cell = btn_id.slice(3);
            div_id = "btn_div" + cell;
        }
        else cell = event.target.id;


        //LEFT CLICK
        if (event.button == 0 && classname == "button") cellClicked(event.target.id.slice(3));

        //RIGHT CLICK
        if (event.button == 2 && classname == "button") cellRightClicked(event.target);

        //Middle Click
        if (event.button == 1) { 
            middleClick.play();           
            
            if (classname == "button_div" && id(btn_id).style.visibility == "hidden" && checkSurroundBtn(cell, 1)) {
                hidden(div_id);
                hidden(btn_id);
                if (minesArray[cell] != "%" && minesArray[cell] != "") {
                    checkSurroundBtn(cell, 2);
                }
            }
            else checkSurroundBtn(cell, 0);
            checkWin();
        }
        
    }
});

/***************************UN MIDDLE CLICK***************************/
document.addEventListener('mouseup', function(event) {
    if (game_state != 2 && event.button == 1) {
        middleUnClick.play();
        darkened.forEach(e => {
            id("btn" + e).style.backgroundColor = "rgb(127, 127, 127)";
        });
        darkened = [];
    } 
});

/***************************KEY PRESSES***************************/
document.addEventListener('keydown', function(event) {
    let key = event.key;
    if (key == "r") reset(1);
    else if (key == "n") reset(0);
    else if (key == "p" && game_state == 1) pause();
});

/***************************SURROUNDING MECHANICS***************************/
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

function checkSurround(cell) {
    //If Cell is a mine > return mine
    if (minesArray[cell] == "%") return "%";

    //Surrounding Mines
    surrMines = 0;

    //Get X, Y coordinate from cell number
    let c = getXY(cell);

    //Check if cell is an edge case
    let surrounding = checkBoundaries(c);
    
    //For each surrounding cell to check
    for (let i = 0; i < surrounding.length; i++) {  
        //Calculate cell to check  
        let x = surrounding[i][0] + c[0];
        let y = surrounding[i][1] + c[1]; 
        
        //Convert x, y coordinates to cell number
        let checkCell = getCell(x, y);
        
        //If cell is a mine increment surrounding mines
        if (minesArray[checkCell] == "%") {
            surrMines++;
        }
    }

    return surrMines;
}

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

/***************************CO-ORDINATES***************************/
function getCell(x, y) { return ((y) * width) + x; }

function getXY (cell) {
    let x = (cell % (width));
    let y = ((cell - x) / (width));
    return [x, y];
}

/***************************ITEM PROPERTIES***************************/
function visible(i) {
    id(i).style.visibility = "visible";
}

function hidden(i) {
    id(i).style.visibility = "hidden";
}

function color (i, c) {
    id(i).style.backgroundColor = c;
}

/***************************PAUSE***************************/
function pause() {
    //Set width of grid cover in case browser resized
    id("grid_menu").style.width = id("grid").style.width;
    id("grid_menu").style.height = id("grid").style.height;

    //If Paused - Pnpause
    if (paused && game_state == 1) {
        paused = false;
        timer.start();
        id("grid_menu").style.visibility = "hidden";      
        id("pauseBtn").textContent = "PAUSE";
    }
    //If Unpaused - Pause
    else if (!paused && game_state == 1) {
        paused = true;
        timer.stop();
        id("grid_menu").style.visibility = "visible";
        id("pauseBtn").textContent = "PLAY";
    }

}
