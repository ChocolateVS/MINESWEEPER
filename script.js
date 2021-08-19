function id(id) { return document.getElementById(id)}

var width = 30;
var height = 16;
var size = width * height;
var mines = 99;
var colors = ["blue", "green", "red", "purple", "black", "gray", "maroon", "turquoise"];
let images = ["blank2.png", "flag2.png", "question2.png"];
var minesArray = [];
var game_state = 0;
var blankShown = [];
var btnState = [];
let score = mines;
let body = id("gameBody");
let allShown = [];
//let main_body = id("mainBody");
let shownCount = 0;
let timerStarted = false;

//let titleDiv = newElement("titlveDiv", "titleDiv", "div", "", [], null, false );
//titleDiv.appendChild(newElement("title", "title", "h1", "VERY AMAZING MINE SWEEPER ;)", [], main_body, false ));
//body.appendChild(titleDiv);
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
    
    newElement("title", "title", "h1", "VERY AMAZING MINE SWEEPER ;)", [], body, true )
    newElement("score", "score", "h2", "MINES: " + score, [], body, true); 
    let grid = newElement("grid", "grid", "div", "", [], null, false); 
    
    for (let i = 0; i < minesArray.length; i++) {
        let cell = document.createElement("div");
        cell.className = "cell";
        cell.id = i;

        var type = checkSurround(i);
        
        if (type != 0) {
            if (type == "%") newElement("mineimg" + i, "mine", "img", "", [["src", "mine.png"]], cell, true);
            else cell.innerHTML = type;
            minesArray[i] = type;
        }
        
        cell.style.color = colors[type - 1];

        grid.appendChild(cell);

        let button = newElement("btn" + i, "button", "input", "", [["type", "image"], ["src", images[0]], ["name", i], ["onclick", "cellClicked(" + i + ")"]], grid, true);

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
                            id("mineimg" + i).setAttribute("src", "flag_green.png");
                            id(i).style.backgroundColor = "#9eabb8";
                        }

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

function getCell(x, y) { return ((y) * 30) + x; }


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
    if (type == 0) {
        minesArray = [];
        for (let i = 0; i < size; i++)  minesArray[i] = "";
        for (let i = 0; i < mines; i++) { minesArray[i] = "%";}
        shuffleArray(minesArray);
    }
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

/*

- Show correct flags when loose
- Set mines and grid size 
- Sound Effects
- Endgmae, darken shown cells
*/
