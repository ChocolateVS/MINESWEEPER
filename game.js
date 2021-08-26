function new_game(m) {
    //Set Grid width and height;
    grid.style.width = m.grid_size.grid_width + "px";
    grid.style.height = m.grid_size.grid_height + "px";
    reset();
    drawGrid(m);
    minesArray = m.minesArray;
}

function play_again(m) {
    reset();
    drawGrid(m);
    id("score").innerHTML = "MINES: " + m.score;
}

function drawGrid(m) {
    
    //Clear Body
    grid.innerHTML = "";

    //Cell Width
    let cell_width = m.grid_size.cell_width;
    
    //Make Everything
    for (let i = 0; i < m.minesArray.length; i++) {
        /*********************Create Cell*********************/
        let cell = newElement(i, "cell", "div", "", [], null, false);
        let boxshadow = cell_width * 0.05;
        let font_size = cell_width / 1.75;
        cell.style.width = cell_width + "px";
        cell.style.height = cell_width + "px";

        cell.style.boxShadow = "inset 0px 0px 0px " + boxshadow + "px #bfbfbf";
        cell.style.fontSize = font_size + "px";
        
        //If type is a mine, set cell image to a mine
        if (m.minesArray[i] == "%") newElement("mineimg" + i, "mine", "img", "", [["src", "images/mine.png"]], cell, true);

        //Else set cell type to a number
        else cell.innerHTML = m.minesArray[i];     
        
        //Set cell color based on type
        cell.style.color = colors[m.minesArray[i] - 1];
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
        
        /*Button state object for each button
        let b = {
            id: "btn" + i,
            state: 0
        }
        
        btnState.push(b);*/
    }

        
    /*********************Create Bottom Menu Button's*********************/
}

/***************************CLICK!***************************/
document.addEventListener('mousedown', function(event) {
    let classname = event.target.className;

    //If Clicking a cell
    if (classname == "button" || classname == "cell" || classname == "button_div") {
        if (game_state != 2) {
            let cell = getCellFromEvent(event);

            event.preventDefault();

            console.log("Cell clicked:", cell);

            if (cell != undefined) {
                //LEFT CLICK
                if (event.button == 0 && classname == "button") cell_clicked('cell-left-clicked', cell);

                //RIGHT CLICK
                if (event.button == 2 && classname == "button") cell_clicked('cell-right-clicked', cell);

                //Middle Click
                if (event.button == 1) cell_clicked('cell-middle-clicked', cell, classname);
            }  
        }
    }
});

/***************************UN MIDDLE CLICK***************************/
document.addEventListener('mouseup', function() {
    if (game_state != 2) {
        sounds["middle_un_click"].play();
        darkened.forEach(cell => {
            color("btn" + cell, "rgb(127, 127, 127)");
        });
        darkened = [];
    }
});

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

function setImage(c, image) {
    id(c).setAttribute("src", images[image]);
}

/***************************KEY PRESSES***************************/
document.addEventListener('keydown', function(event) {
    let key = event.key;
    if (key == "r") reset(1);
    else if (key == "n") reset(0);
    else if (key == "p" && game_state == 1) pause();
});

/***************************PREVENT CONTEXT MENU**************************/
document.addEventListener('contextmenu', function(event) {
    let classname = event.target.className;
    if (classname == "button_div" || classname == "button" || classname == "cell") {
        event.preventDefault();
    }
});

/***************************RESET GAME***************************/
function reset() {

    game_state = 0;

    //Reset Menu
    menu(1);
    
    //Reset Visual Elements
    id("score").innerHTML = "MINES: " + mines;
    id("timer").style.color = "white";
    id("pauseBtn").style.visibility = "hidden";
    id("pauseBtn").textContent = "PAUSE";

    paused = true;

    timer.stop();
    timer.reset();
}

function getCellFromEvent(e) {
    //Get Cell Number  
    //let cell, btn_id, div_id;

    /*if (classname == "button_div") {
        div_id = event.target.id;
        cell = div_id.slice(7);
        btn_id = "btn" + cell;
    }
    else if (classname == "button") {
        btn_id = event.target.id;
        cell = btn_id.slice(3);
        div_id = "btn_div" + cell;
    }
    else cell = event.target.id;*/
    let cell;

    if (e.target.className == "button_div") {
        cell = e.target.id.slice(7);
    }
    else if (e.target.className == "button") {
        cell = e.target.id.slice(3);
    }
    else if (e.target.className == "cell") {
        cell = e.target.id;
    }
    else {
        return undefined;
    }
    return cell;
}

function left_click_update(m) {
    if (m.sound != undefined) sounds[m.sound].play();
    unHide(m.btnState);
}

function right_click_update(m) {
    if (m.sound != undefined) sounds[m.sound].play();
    id("score").innerHTML = "MINES: " + m.score;
    setImage("btn" + m.cell, m.image)
}

function middle_click_update(m) {
    if (m.sound != undefined) {
        sounds["clear_sound"].play();
    } 
    else {
        sounds["middle_click"].play();
    }
    unHide(m.btnState);
}

function middle_unclick_update(m) {
    darkened = m.darkened;
    darkened.forEach(cell => {
        color("btn" + cell, "rgb(89, 89, 89)");
    });
}

function game_lost(m) {

    let btnState = m.btnState;
    sounds['explosion_sound'].play();
    game_state = 2;

    timer.stop();

    id("timer").style.color = "red";
    id("pauseBtn").style.visibility = "hidden";

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

    m.cells.forEach(cell => {
        id("mineimg" + cell).setAttribute("src", "images/mine_red.png");
    });

    for (let i = 0; i < btnState.length; i++) {
        if (btnState[i].state == 1 && minesArray[i] != "%") {
            id("btn" + i).style.visibility = "visible";
            id("btn" + i).setAttribute("src", "images/flag_wrong.png");
        }
    }
}

function game_won() {
    game_state = 2;
    sounds["win_sound"].play();    
    timer.stop(); 

    id("timer").style.color = "green";   
    id("pauseBtn").style.visibility = "hidden";

    id("score").textContent = "MINES: 0";

    //For each mine, make green!
    for (let i = 0; i < minesArray.length; i++) {
        if (minesArray[i] ==  "%") id("btn" + i).setAttribute("src", "images/mine_green.png");
        else hidden("btn" + i);
    }          
}

function unHide(cells) {
    cells.forEach(cell => {
        if (cell.hidden) {
            hidden("btn" + cell.id);
            color(cell.id, "#9eabb8");
        }
        else if (cell.state == 1) {
            setImage("btn" + cell.id, "red_flag");
        }
        else if (cell.state == 2) {
            setImage("btn" + cell.id, "question");
        }
    }); 
}