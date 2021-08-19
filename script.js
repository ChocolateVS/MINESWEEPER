function id(id) { return document.getElementById(id)}

var width = 30;
var height = 16;

var border_width;

var cell_width;
 
var size;
var mines = 99;
var colors = ["blue", "green", "red", "purple", "black", "gray", "maroon", "turquoise"];
let images = ["blank.png", "flag_red.png", "question.png"];
var minesArray = [];
var game_state = 0;
var blankShown = [];
var btnState = [];
let score = mines;
let body = id("gameBody");
let allShown = [];
let shownCount = 0;
let timerStarted = false;

let screen_width = window.screen.width;
let screen_height =window.screen.height;

//let titleDiv = newElement("titlveDiv", "titleDiv", "div", "", [], null, false );
//titleDiv.appendChild(newElement("title", "title", "h1", "VERY AMAZING MINE SWEEPER ;)", [], main_body, false ));
//body.appendChild(titleDiv);
generateMenu();
reset(0);

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
};

function newElement(id, classname, type, text, att, appendTo, append) {
    let element = document.createElement(type);
    if (att.length > 0) att.forEach((e) => { element.setAttribute(e[0], e[1]) } );
    if (type == "h1" || type == "h2") element.innerHTML = text;
    if (classname == "resetBtn") element.textContent = text;
    element.id = id;
    element.className = classname;
    if (append) appendTo.appendChild(element); 
    else return element;
}

function drawGrid() {

    body.innerHTML = "";

    screen_width = window.screen.width;
    screen_height = window.screen.height;

    let grid = newElement("grid", "grid", "div", "", [], null, false); 

    let cell_width;

    if (screen_width / width >= screen_height / height) {
        grid_height = screen_height * 0.7;

        cell_width = (grid_height / (height));

        grid_width = cell_width * width;
    }
    else {
        grid_width = screen_width * 0.7;

        cell_width = (grid_width / (width));

        grid_height = cell_width * height;
    }
    console.log(grid_height, grid_width);
    grid.style.width = grid_width + "px";
    grid.style.height = grid_height + "px";
    newElement("title", "title", "h1", "VERY AMAZING MINE SWEEPER ;)", [], body, true)
    newElement("score", "score", "h2", "MINES: " + score, [], body, true); 
    

    for (let i = 0; i < minesArray.length; i++) {
        let cell = document.createElement("div");
        cell.className = "cell";
        cell.id = i;
        cell.style.width = cell_width + "px";
        cell.style.height = cell_width + "px";
        let boxshadow = cell_width * 0.02;
        cell.style.boxShadow = "0px 0px 0px " + boxshadow + "px #bfbfbf"
        //cell.style.boxShadow = "0px 0px 0px " + boxshadow + "px blue;"

        var type = checkSurround(i);
        
        if (type != 0) {
            if (type == "%") newElement("mineimg" + i, "mine", "img", "", [["src", "mine.png"]], cell, true);
            else cell.innerHTML = type;
            minesArray[i] = type;
        }
        
        cell.style.color = colors[type - 1];

        grid.appendChild(cell);

        let button = newElement("btn" + i, "button", "input", "", [["type", "image"], ["src", images[0]], ["name", i], ["onclick", "cellClicked(" + i + ")"]], null, false);
        button_width = cell_width + border_width;
        button_height = cell_width + border_width;
        button.style.width = button_width + "px";
        button.style.height = button_height + "px";
        button.style.marginLeft = - button_width + "px";
        //grid.appendChild(button);

        let btn = {
            id: "btn" + i,
            state: 0
        }
        btnState.push(btn);
        
    }

    body.appendChild(grid);
        
    var bottomMenu = newElement("bottomMenu", "bottomMenu", "div", "", [], null, false);

    newElement("menuBtn", "resetBtn", "button", "MENU (ESC / M)", [["onclick", "menu(0)"]], bottomMenu, true);
    newElement("resetBtn", "resetBtn", "button", "NEW GAME (N)", [["onclick", "reset(0)"]], bottomMenu, true);
    newElement("restartBtn", "resetBtn", "button", "PLAY AGAIN (R)", [["onclick", "reset(1)"]], bottomMenu, true);
    
    body.appendChild(bottomMenu);
}

function cellClicked(cell) {
    if (game_state == 0) {        
        if (btnState[cell].state == 0) {
            id("btn" + cell).style.visibility = "hidden";
            id(cell).style.backgroundColor = "#9eabb8";
            shownCount++;
            if (minesArray[cell] == "%") {
                if (shownCount == 1) {
                    reset(0);
                    cellClicked(cell);
                    return;
                }
                alert("UR BADDDDDDDDD HAHAHAHA :)");
                game_state == 1;
                for (let i = 0; i < minesArray.length; i++) {
                    if (btnState[i].state == "1") {
                        if (minesArray[i] == "%") {
                            id("mineimg" + i).setAttribute("src", "flag_green2.png");                           
                        }
                        else if (minesArray[i] != "%") {
                            id("btn" + i).setAttribute("src", "flag_red2.png");                          
                        }
                        id(i).style.backgroundColor = "#9eabb8";
                    }
                    id("btn" + i).style.visibility = "hidden";
                }
                id("mineimg" + cell).setAttribute("src", "mine_red.png");
            }
            else if (minesArray[cell] == ""){
                blankShown = [];
                recursiveShowNearby(cell);
            }
            if (size - mines == shownCount) {
                for (let i = 0; i < minesArray.length; i++) {
                    if (minesArray[i] ==  "%" || minesArray[i] == "") id("btn" + i).setAttribute("src", "mine_green.png");
                }
                game_state = 1;
                alert("YOU WIN!!!!!!!!!!!");                              
            }
        }
    }
}

function checkSurround(cell) {
    if (minesArray[cell] == "%") return "%";

    surrMines = 0;

    let c = getXY(cell);
    let surrounding = checkBoundaries(c);
    
    for (let i = 0; i < surrounding.length; i++) {    
        let x = surrounding[i][0] + c[0];
        let y = surrounding[i][1] + c[1];  
        let checkCell = getCell(x, y);
        
        if (minesArray[checkCell] == "%") {
            surrMines++;
        }
    }

    return surrMines;
}

function recursiveShowNearby(cell) {

    if (id("btn" + cell).style.visibility != "hidden") shownCount++;
    id("btn" + cell).style.visibility = "hidden";
    id(cell).style.backgroundColor = "#9eabb8"
    blankShown.push(cell);

    let c = getXY(cell);

    let surrounding = checkBoundaries(c);
    for (let i = 0; i < surrounding.length; i++) {   
        let x = surrounding[i][0] + c[0];
        let y = surrounding[i][1] + c[1];  
        let checkCell = getCell(x, y);
        if (id("btn" + checkCell).style.visibility != "hidden") shownCount++;
        id("btn" + checkCell).style.visibility = "hidden"; 
        id(checkCell).style.backgroundColor = "#9eabb8";

        if (minesArray[checkCell] == "" && !blankShown.includes(checkCell)) {
            recursiveShowNearby(checkCell);
        }                
    }
}

function getXY (cell) {
    let x = (cell % (width));
    let y = ((cell - x) / (width));
    return [x, y];
}

function getCell(x, y) { return ((y) * width) + x; }


function checkBoundaries(c) {
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

function cellRightClicked(btn) {
    if(btnState[btn.name].state == 0) score--;
    else if (btnState[btn.name].state == 1) score++;
    id("score").innerHTML = "MINES: " + score;
    btnState[btn.name].state ++;
    if (btnState[btn.name].state == 3) btnState[btn.name].state = 0;
    
    let state = btnState[btn.name].state;

    id(btn.id).setAttribute("src", images[state]);

}

function reset(type) {
    size = width * height;

    if (type == 0) {
        minesArray = [];
        for (let i = 0; i < size; i++)  minesArray[i] = "";
        for (let i = 0; i < mines; i++) { minesArray[i] = "%";}
        shuffleArray(minesArray);
    }
    menu(1);
    game_state = 0;
    blankShown = [];
    btnState = [];
    drawGrid();
    score = mines;
    shownCount = 0;
}

document.addEventListener('contextmenu', function(event) {
    let button = event.target;
    event.preventDefault();
    if (button.className == "button") {
        cellRightClicked(button);
    }
});

document.addEventListener('keydown', function(event) {
    let key = event.key;
    if (key == "r") reset(1);
    else if (key == "n") reset(0);
});

function generateMenu() {
    //Buttons
    newElement("buttons_div", "buttons_div", "div", "", [], id("menu"), true);
    newElement("saveBtn", "resetBtn", "button", "**SAVE**", [["onclick", "save()"]], id("buttons_div"), true);
    newElement("resetBtn", "resetBtn", "button", "NEW GAME (N)", [["onclick", "reset(0)"]], id("buttons_div"), true);
    newElement("restartBtn", "resetBtn", "button", "PLAY AGAIN (R)", [["onclick", "reset(1)"]], id("buttons_div"), true);
    newElement("closeBtn", "resetBtn", "button", "CLOSE MENU", [["onclick", "menu(1)"]], id("buttons_div"), true);

}

function menu(i) {
    if (i == 1) {
        id("menu").style.visibility = "hidden";
        return;
    }
    id("menu").style.visibility = "visible";
}

function save() {
    width = id("widthSlider").value;
    height = id("heightSlider").value;
    mines = id("minesSlider").value;
    console.log(width, height);
    reset(0);
}
id("minesSlider").addEventListener("input", function() {
    id("mineCount").textContent = id("minesSlider").value;
    estDiff();
}, false);

id("widthSlider").addEventListener("input", function() {
    id("widthCount").textContent = id("widthSlider").value;
    //id("minesSlider").setAttribute("max", width * height);
    estDiff();
}, false);

id("heightSlider").addEventListener("input", function() {
    id("heightCount").textContent = id("heightSlider").value;
    //id("minesSlider").setAttribute("max", width * height - 1);
    estDiff();
}, false);

function estDiff() {
    let size = id("widthSlider").value * id("heightSlider").value;
    let p = Math.round(id("minesSlider").value / size * 100);   
    let d;

    if (p <= 5) d = 0;
    else if (p <= 10) d = 1;
    else if (p <= 15) d = 2;
    else if (p <= 20) d = 3;
    else if (p <= 25) d = 4;
    else if (p <= 30) d = 5;
    else if (p <= 40) d = 6;
    else if (p <= 50) d = 7;
    else if (p <= 80) d = 8;
    else d = 9;

    id("percentage").innerHTML = "MINES: ~" + p + " %";
    id("difficulty").innerHTML = "DIFFICULTY: " + diff[d];
}

let diff = ["ONE CLICK...", "EEEEEZZZZ", "OK", "OK OK", "EEEEEKKKK", "BIG EEEEEK", "GENIUS", "r/MILDY INFURIATING", "IMPOSSIBLE", "GIVE. UP."];
/*
- Menu Overlay for customisation - Set mines and grid size 
- Sound Effects
- Middle Click
- Timer
*/
