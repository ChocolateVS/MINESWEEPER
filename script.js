function id(id) { return document.getElementById(id)}

var width;
var height;
var border_width;
var cell_width;
var size;
var mines;
var minesArray = [];
var game_state = 0;
var blankShown = [];
var btnState = [];
let score = mines;
let body = id("gameBody");
let shownCount = 0;
let timerStarted = false;
let temp_width;
let temp_height;
let minePer = Math.round(id("minesSlider").value / ((id("widthSlider").value * id("heightSlider").value)) * 100);
let mineDiff = "EEEKKKK";
let diff = ["ONE CLICK...", "EEEEEZZZZ", "OK", "OK OK", "EEEEKKK", "BIG EEEEEK", "GENIUS", "r/MILDY INFURIATING", "IMPOSSIBLE", "GIVE. UP."];
var colors = ["blue", "green", "red", "purple", "black", "gray", "maroon", "turquoise"];
let screen_width = window.screen.width;
let screen_height = window.screen.height;
let darkened = [];
let paused = true;

//SOUNDS
let explosionSound = new Audio("sounds/explosion.mp3"); // buffers automatically when created
let clickSound = new Audio("sounds/click.wav");
let clearSound = new Audio("sounds/clear.wav");
let flagOnSound = new Audio("sounds/flag.wav");
let flagOffSound = new Audio("sounds/unflag.wav");
let winSound = new Audio("sounds/gameWin.wav");
let middleClick = new Audio("sounds/middleClick.wav");
let middleUnClick = new Audio("sounds/middleClickOff.wav");
let timer_started = false;
let timer = new Stopwatch();
let timer_elem = timer.get();

generateMenu();
save();

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
    newElement("grid_menu", "grid_menu", "div", "", [], grid, true); 
    let cell_width;

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

    grid.style.width = grid_width + "px";
    grid.style.height = grid_height + "px";
    newElement("title", "title", "h1", "VERY AMAZING MINE SWEEPER ;)", [], body, true);
    newElement("details", "details", "div", "" + score, [], body, true); 
    newElement("score", "score", "h2", "MINES: " + score, [], id("details"), true); 
    id("details").appendChild(timer_elem);
    
    for (let i = 0; i < minesArray.length; i++) {
        let cell = document.createElement("div");      
        cell.className = "cell";
        cell.id = i;
        cell.style.width = cell_width + "px";
        cell.style.height = cell_width + "px";
        let boxshadow = cell_width * 0.05;
        cell.style.boxShadow = "inset 0px 0px 0px " + boxshadow + "px #bfbfbf";
        let font_size = cell_width / 1.75
        cell.style.fontSize = font_size + "px";

        var type = checkSurround(i);
        
        if (type != 0) {
            if (type == "%") newElement("mineimg" + i, "mine", "img", "", [["src", "images/mine.png"]], cell, true);
            else cell.innerHTML = type;
            minesArray[i] = type;
        }
        
        cell.style.color = colors[type - 1];

        grid.appendChild(cell);

        let button_div = newElement("btn_div" + i, "button_div", "div", "", [], null, false);
        let button = newElement("btn" + i, "button", "input", "", [["type", "image"], ["src", "images/bg.png"], ["name", i], ["onclick", "cellClicked(" + i + ")"]], button_div, false);
        
        border_width = cell_width;
        button_width = border_width - (boxshadow * 2);
        button.style.width = button_width + "px";
        button.style.height = button_width + "px";
        button.style.visibility = "visible";
        button_div.style.width = border_width + "px";
        button_div.style.height = border_width + "px";
        button_div.style.marginLeft = - border_width + "px";
        button_div.style.boxShadow = "inset 0px 0px 0px " + boxshadow + "px #bfbfbf";
        button_div.style.visibility = "visible";

        button_div.appendChild(button);
        grid.appendChild(button_div)
        let btn = {
            id: "btn" + i,
            state: 0
        }
        btnState.push(btn);
    }

    body.appendChild(grid);
        
    var bottomMenu = newElement("bottomMenu", "bottomMenu", "div", "", [], null, false);

    newElement("resetBtn", "resetBtn", "button", "NEW GAME (N)", [["onclick", "reset(0)"]], bottomMenu, true);
    newElement("restartBtn", "resetBtn", "button", "PLAY AGAIN (R)", [["onclick", "reset(1)"]], bottomMenu, true);
    newElement("menuBtn", "resetBtn", "button", "MENU (ESC / M)", [["onclick", "menu(0)"]], bottomMenu, true);
    newElement("pauseBtn", "resetBtn", "button", "PLAY", [["onclick", "pause()"]], bottomMenu, true);
    newElement("pasued_msg", "msg", "h1", "Game Paused", [], id("grid_menu"), true);
    
    body.appendChild(bottomMenu);
}

function pause() {
    id("grid_menu").style.width = id("grid").style.width;
    id("grid_menu").style.height = id("grid").style.height;

    if (paused && game_state == 1) {
        paused = false;
        id("grid_menu").style.visibility = "hidden";
        timer.start();
        id("pauseBtn").textContent = "PAUSE";
    }
    else if (!paused && game_state == 1) {
        paused = true;
        id("grid_menu").style.visibility = "visible";
        id("pauseBtn").textContent = "PLAY";
        timer.stop();
    }

}
function cellClicked(cell) {
    if (game_state != 2) { 
        if (game_state == 0) {
            game_state = 1;   
            id("pauseBtn").style.visibility = "visible"; 
            pause();
        }
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
                loose([cell]);
            }
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

function checkWin() {
    if (size - mines == shownCount) {
        for (let i = 0; i < minesArray.length; i++) {
            if (minesArray[i] ==  "%" || minesArray[i] == "") id("btn" + i).setAttribute("src", "images/mine_green.png");
        }
        id("pauseBtn").style.visibility = "hidden";
        game_state = 2;
        winSound.play();    
        timer.stop(); 
        id("timer").style.color = "green";                         
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

function checkSurroundBtn(cell, type) {
    let c = getXY(cell);
    let surrounding = checkBoundaries(c);
    let cells = [];
    let f = 0, m = 0;
    let l = false;
    for (let i = 0; i < surrounding.length; i++) {    
        let x = surrounding[i][0] + c[0];
        let y = surrounding[i][1] + c[1];  
        let checkCell = getCell(x, y);
        if (type == 0) {
            if (btnState[checkCell].state == 0) {
                id("btn" + checkCell).style.backgroundColor = "rgb(89, 89, 89)";
                darkened.push(checkCell);
            }          
        }
        else if (type == 1) {  
            if (btnState[checkCell].state == 1) f++;
            if (minesArray[checkCell] == "%") m++;
        }
        else if (type == 2) {      
            if (minesArray[checkCell] != "%") {
                if (id("btn" + checkCell).style.visibility == "visible") {
                    shownCount++; 
                    id("btn" + checkCell).style.visibility = "hidden";  
                }
                //id("btn_div" + checkCell).style.visibility = "hidden";  
                id(checkCell).style.backgroundColor = "#9eabb8";                      
                if (minesArray[checkCell] == "") {
                    clearSound.play();
                    recursiveShowNearby(checkCell);
                }                    
            }
            else if (btnState[checkCell].state != 1) {
                cells.push(checkCell);
                l = true;
            }
        }
    }
    if (l) loose(cells);
    if (f == m && minesArray[cell] == f) return true;
}

function unMiddleClick() {
    darkened.forEach(e => {
        id("btn" + e).style.backgroundColor = "rgb(127, 127, 127)";
    });
    darkened = [];
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
    if(btnState[btn.name].state == 0) {
        score--;
        flagOnSound.play();
        id(btn.id).setAttribute("src", "images/flag_red.png");
    }
    else if (btnState[btn.name].state == 1) {
        score++; 
        flagOffSound.play();
        id(btn.id).setAttribute("src", "images/question.png");
    }
    else id(btn.id).setAttribute("src", "images/bg.png");

    id("score").innerHTML = "MINES: " + score;

    btnState[btn.name].state ++;
    if (btnState[btn.name].state == 3) btnState[btn.name].state = 0;
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
    id("score").innerHTML = "MINES: " + mines;
    timer_started = false;
    timer.stop();
    timer.reset();
    id("timer").style.color = "white";
    id("pauseBtn").style.visibility = "hidden";
    id("pauseBtn").textContent = "PAUSE";
    paused = true;
}

document.addEventListener('contextmenu', function(event) {
    let button = event.target;
    event.preventDefault();
    if (button.className == "button") {
        cellRightClicked(button);
    }
});

document.addEventListener('mousedown', function(event) {
    if (game_state != 2 && event.button == 1) { 
        event.preventDefault();
        middleClick.play();
        let class_name = event.target.className;
        let cell;
        let div_id;
        let btn_id;
        if (class_name == "button_div") {
            div_id = event.target.id;
            cell = div_id.slice(7);
            btn_id = "btn" + cell;
        }
        else if (class_name == "button") {
            btn_id = event.target.id;
            cell = btn_id.slice(3);
            div_id = "btn_div" + cell;
        }
        else cell = event.target.id;
        if (class_name == "button_div" && id(btn_id).style.visibility == "hidden" && checkSurroundBtn(cell, 1)) {
            id(div_id).style.visibility = "hidden";
            id(btn_id).style.visibility = "hidden";  
            if (minesArray[cell] != "%" && minesArray[cell] != "") {
                checkSurroundBtn(cell, 2);
            }
        }
        else checkSurroundBtn(cell, 0);
        checkWin();
    }
});

document.addEventListener('mouseup', function(event) {
    if (game_state != 2 && event.button == 1) {
        middleUnClick.play();
        unMiddleClick();
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
    id("mineCount").textContent = mines;
    id("widthCount").textContent = width;
    id("heightCount").textContent = height;
    id("minesSlider").value = mines;
    id("widthSlider").value = width;
    id("heightSlider").value = height;
    id("percentage").textContent = "MINES: ~ " + minePer  + " %";
    id("difficulty").textContent = "DIFFICULTY: " + mineDiff;
}

function save() {
    width = id("widthSlider").value;
    height = id("heightSlider").value;
    temp_height = height;
    temp_width = width;
    mines = id("minesSlider").value;
    estDiff(1);
    reset(0);
}
id("minesSlider").addEventListener("input", function() {
    id("mineCount").textContent = id("minesSlider").value;
    estDiff();
}, false);

id("widthSlider").addEventListener("input", function() {
    id("widthCount").textContent = id("widthSlider").value;
    temp_width = id("widthSlider").value;
    id("minesSlider").setAttribute("max", (temp_width * temp_height) - 1 );
    id("mineCount").textContent = id("minesSlider").value;
    estDiff();
}, false);

id("heightSlider").addEventListener("input", function() {
    id("heightCount").textContent = id("heightSlider").value;
    temp_height = id("heightSlider").value;
    id("minesSlider").setAttribute("max", (temp_width * temp_height) - 1);
    id("mineCount").textContent = id("minesSlider").value;
    estDiff();
}, false);

function estDiff(t) {
    let p = Math.round(id("minesSlider").value / ((id("widthSlider").value * id("heightSlider").value)) * 100);;
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

    if (t == 1) {
        minePer = p;
        mineDiff = diff[d];
    }
    id("percentage").textContent = "MINES: ~ " + p + " %";
    id("difficulty").textContent = "DIFFICULTY: " + diff[d];

}

function loose(cells) {
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


