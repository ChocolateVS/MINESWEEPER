function id(id) { return document.getElementById(id)}
//CONSTANTS
var width = 30;//prompt("Please Enter Grid Width");
var height = 16;//prompt("Please Enter Grid Height");

var size = width * height;

var mines = 99;

var colors = ["blue", "green", "red", "purple", "black", "gray", "maroon", "turquoise"];

let images = ["blank2.png", "flag2.png", "question2.png"];

var minesArray = [];

var game_state = 0;

var blankShown = [];

var btnState = [];

let score = mines;

let body = id("body");

let shownCount = 0;

reset();

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
};

function drawGrid() {
    body.innerHTML = '';   

    let header = document.createElement("h1");
    header.innerHTML = "VERY AMAZING MINE SWEEPER ;)";
    body.appendChild(header); 

    let s = document.createElement("h2");
    s.className = "score";
    s.id = "score";
    s.innerHTML = "MINES: " + score;
    body.appendChild(s); 

    let grid = document.createElement("div");
    grid.id = "grid";
    
    for (let i = 0; i < minesArray.length; i++) {
        let cell = document.createElement("div");
             
        cell.className = "cell";
        cell.id = i;

        var type = checkSurround(i);
        
        if (type != 0) {
            if (type == "%") {
                let img = document.createElement("img");
                img.setAttribute("src", "mine2.png");
                img.className = "mine";
                img.id = "mineimg" + i;
                cell.appendChild(img)
            }
            else cell.innerHTML = type;
            minesArray[i] = type;
        }
        
        cell.style.color = colors[type - 1];

        let button = document.createElement("input");
        button.className = "button";
        button.id = "btn" + i;
        button.setAttribute("onclick", "cellClicked(" + i + ")");
        button.setAttribute("type", "image");
        button.setAttribute("src", images[0]);
        button.setAttribute("name", i);
        let btn = {
            id: button.id,
            state: 0
        }
        btnState.push(btn);
        grid.appendChild(cell);
        grid.appendChild(button);
        
        body.appendChild(grid);
    }

    var resetBtn = document.createElement("button");
    resetBtn.className = "resetBtn";
    resetBtn.setAttribute("onclick", "reset()");
    resetBtn.innerHTML = "RESET";
    body.appendChild(resetBtn);
}

function cellClicked(cell) {
    if (game_state == 0) {
        console.log(game_state);
        id("btn" + cell).style.visibility = "hidden";
        shownCount++;
        if (minesArray[cell] == "%") {
            alert("UR BADDDDDDDDD HAHAHAHA :)");
            game_state == 1;
            for (let i = 0; i < minesArray.length; i++) {
                //if (btnState[i].state != 1) 
                id("btn" + i).style.visibility = "hidden";
            }
            id("mineimg" + cell).setAttribute("src", "mine_red.png")
        }
        else if (minesArray[cell] == ""){
            console.log(minesArray[cell]);
            blankShown = [];
            recursiveShowNearby(cell);
        }
        if (size - mines == shownCount) {
            //alert("YOU WIN!!!!!!!!!!!");
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
    id("btn" + cell).style.visibility = "hidden";

    blankShown.push(cell);

    let c = getXY(cell);

    let surrounding = checkBoundaries(c);
    console.log(cell); 
    for (let i = 0; i < surrounding.length; i++) {   
        
        let x = surrounding[i][0] + c[0];
        let y = surrounding[i][1] + c[1];  
        let checkCell = getCell(x, y);
        console.log(checkCell, x ,y); 
        id("btn" + checkCell).style.visibility = "hidden"; 
        
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

function getCell(x, y) {
    return ((y) * 30) + x;
}

function checkBoundaries(c) {
    if (c[0] == 0 && c[1] == 0) return [[0, 1], [1, 0], [1, 1]];
    if (c[0] == 29 && c[1] == 15) return [[0, -1], [-1, 0], [-1, -1]];
    if (c[0] == 0 && c[1] == 15) return [[0, -1], [1, 0], [1, -1]];
    if (c[0] == 29 && c[1] == 0) return [[0, 1], [-1, 0], [-1, 1]];
    if (c[0] == 0 && c[1] != 0 && c[1] != 15) return [[0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
    if (c[0] == 29 && c[1] != 0 && c[1] != 15) return [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1]];
    if (c[1] == 0 && c[0] != 0 && c[0] != 29) return [[-1, 0], [-1, 1], [0, 1], [1, 0], [1, 1]];
    if (c[1] == 15 && c[0] != 0 && c[0] != 29) return [[-1, -1], [-1, 0], [0, -1], [1, -1], [1, 0]];
    return [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]]; 
}

document.addEventListener('contextmenu', function(event) {
    let button = event.target;
    event.preventDefault();
    if (button.className == "button") {
        cellRightClicked(button);
    }
    
});

function cellRightClicked(btn) {
    if(btnState[btn.name].state == 0) score--;
    else if (btnState[btn.name].state == 1) score++;
    id("score").innerHTML = "MINES: " + score;
    btnState[btn.name].state ++;
    if (btnState[btn.name].state == 3) btnState[btn.name].state = 0;
    
    let state = btnState[btn.name].state;
    
    console.log(btnState[btn.name], images[state]);

    id(btn.id).setAttribute("src", images[state]);

}

function reset() {
    minesArray = [];
    game_state = 0;
    blankShown = [];
    btnState = [];
    for (let i = 0; i < size; i++)  minesArray[i] = "";
    for (let i = 0; i < mines; i++) { minesArray[i] = "%";}
    shuffleArray(minesArray);
    drawGrid();
    score = mines;
    shownCount = 0;
}