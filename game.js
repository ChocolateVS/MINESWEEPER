//WEBSOCKET
////////////////////////////////////////TIMER
var Stopwatch = function(elem, options) {

    var timer = createTimer(),
        offset,
        clock,
        interval;

    timer.className = "timer";
    timer.id = "timer";

    let seconds;
    let minutes;

    function createTimer() {
        return document.createElement("span");
    }

    function setTime(time) {
      clock = time;
    }

    function getTime(time) {
      return clock;
    }

    // default options
    options = options || {};
    options.delay = options.delay || 0;
    
  
    // initialize
    reset();

    // public API
    this.start  = start;
    this.stop   = stop;
    this.reset  = reset;  
    this.get = get;
    this.setTime = setTime;
    this.getTime = getTime;
    
    function get() {
        return timer;
    }
  
    function start() {
      if (!interval) {
        offset   = Date.now();
        interval = setInterval(update, options.delay);
      }
    }
  
    function stop() {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    }
  
    function reset() {
      seconds = 0;
      minutes = 0;
      clock = 0;
      render();
    }
  
    function update() {
      clock += delta();
      render();
    }
  
    function render() {
        seconds = Math.floor(clock/1000) % 60;
        minutes = Math.floor(clock/1000/60);
        let s = seconds;
        let m = minutes;
        if (seconds < 10) s = "0" + seconds;
        if (minutes < 10) m = "0" + minutes;
        timer.innerHTML = m + ":" + s;  
    }
  
    function delta() {
      var now = Date.now(),
          d   = now - offset;
      offset = now;
      return d;
    }
  
  };
  
let client_id;
let game_id;

let time_synced = true;

let loaded = false;

let sounds = {
    explosion_sound: new Audio("sounds/explosion.mp3"),
    click_sound: new Audio("sounds/click.wav"),
    clear_sound: new Audio("sounds/clear.wav"),
    flag_on_sound: new Audio("sounds/flag.wav"),
    flag_off_sound: new Audio("sounds/unflag.wav"),
    win_sound: new Audio("sounds/gameWin.wav"),
    middle_click: new Audio("sounds/middleClick.wav"),
    middle_un_click: new Audio("sounds/middleClickOff.wav")
}

let images = {
    blank: "images/bg.png",
    red_flag: "images/flag_red.png",
    wrong_flag: "images/flag_wrong.png",
    mine: "images/mine.png",
    green_mine: "images/mine_green.png",
    red_mine: "images/red_mine.png",
    question: "images/question.png"
}
//Id Function Returns element of given id
function id(id) { return document.getElementById(id)}

//Place where cells are put!
let grid = id("grid");

//Screen Width
let screen_width;
let screen_height;

//Game Area Width
var width = id("widthSlider").value;
var height = id("heightSlider").value;;
let size = width * height;

//General game variables
var mines = id("minesSlider").value;;
var minesArray = [];
let score;

//Stores recursive empty cells shown
var blankShown = [];
var btnState = [];

//Game initial state
var game_state = 0;

//Number of shown cells
let shownCount = 0;

//Temp for when in un-saved menu
let temp_width;
let temp_height;

//Mine Percentage
let minePer = Math.round(id("minesSlider").value / ((id("widthSlider").value * id("heightSlider").value)) * 100);

//Difficulty
let mineDiff = "EEEKKKK";

//Difficulties
let diff = ["ONE CLICK...", "EEEEEZZZZ", "OK", "OK OK", "EEEEKKK", "BIG EEEEEK", "GENIUS", "r/MILDY INFURIATING", "IMPOSSIBLE", "GIVE. UP."];

//Number Colors
var colors = ["blue", "green", "red", "purple", "black", "gray", "maroon", "turquoise"];

//Darkened on middle click
let darkened = [];

//Timer Initialize
let paused = true;
let timer = new Stopwatch();
let timer_elem = timer.get();
id("details").appendChild(timer_elem);

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

/////////////////////////////////////////WEB SOCKET
//Initialize Connection

//LOCAL SERVER
//const serverAddress = 'ws://localhost:8080/';
//ONLINE SERVER
const serverAddress = 'wss://minesweeper-socket.glitch.me/';

let ws;

function connect() {
    ws = new WebSocket(serverAddress);

    ws.addEventListener('open', () => {
        attempts = 0;

        ws.send(JSON.stringify({
            method: 'connect',
            params: {
                id: game_id,
                client_id: client_id
            }
        }));

        console.log("[Client] Server Connection established");
    });

    ws.onmessage = function(msg) {
        try {
            let message = JSON.parse(msg.data);
            console.log("Message Received", message);
            handleMessage(message);
        }
        catch (err) {
            console.log("[ERROR] Method not JSON format", err);
        }

    };

    ws.onerror = function(error) {
        console.log(`[Error] ${error.message}`);
    };

    ws.addEventListener('close', () => {
        if (ws.readyState == 3) {
            console.log('[Client] Server closed unexpectedly.');
            connection = false;
            setTimeout(function() {
                connect();
            }, 2000);
        }
        else {
            console.log('[Client] Manually Disconnected From Server Somehow');
        }
    });
}

function handleMessage(m) {

    if (m.method == undefined) {
        return;
    }

    if (m.clock != undefined && game_state == 1) {
        sync(m.clock);
        if (!time_synced) {
            time_synced = true;
            unpause();
        }
    }

    let method = m.method;

    if (method) {

        if (handlers[method]) {
            let handler = handlers[method];
            handler(m);
        } else {
            console.log('[Client] No handler defined for method ' + method + '.');
        }

    }
}

let handlers = {
    "new-game": function (m) { new_game(m.params) },
    "play-again": function (m) { play_again(m.params) },
    "join-game": function (m) { game_joined(m) },
    "join-error": function (m) { join_error(m.message) },
    "left-click-update": function (m) { left_click_update(m) },
    "right-click-update": function (m) { right_click_update(m) },
    "middle-click-update": function (m) { middle_click_update(m) },
    "middle-unclick-update": function (m) { middle_unclick_update(m) },
    "game-lost": function (m) { game_lost(m) },
    "game-won": function (m) { game_won(m) },
    "unpause": function (m) { unpause(m) },
    "pause": function () { pause_game() },
    "set-client-id": function(m) {
        console.log('[Client] Set Client ID.');
        setGameId(m.params.game_id);
        setClientId(m.params.client_id);
        console.log('[Client] ID is ' + client_id);
        if (!loaded) {
            get_new_game();
            loaded = true;
        }
    }
};

function new_game_object() {
    let new_game_object = 
    {
        method: 'new-game',
        params: {
            id: game_id,
            client_id: client_id,
            
            screen: {
                width: window.screen.width,
                height: window.screen.height
            },
            size: {
                width: width,
                height: height,
                mines: mines
            }
        }
    }
    return new_game_object;
}

function get_new_game() {
    ws.send(JSON.stringify(new_game_object()));
}

function set_play_again() {
    ws.send(JSON.stringify({
        method: 'play-again',
        id: game_id,
        client_id: client_id
    }));
}

function cell_clicked(method, cell, classname) {
    ws.send(JSON.stringify({
        method: method,
        id: game_id,
        client_id: client_id,
        cell: cell,
        classname: classname,
        clock: timer.getTime()
    }));
}

function join() {
    time_synced = false;
    let game_code = id("joinCodeInput").value;
    if (game_code != "" & game_code.length == 6) {
        ws.send(JSON.stringify({
            method: 'join-game',
            client_id: client_id,
            game_id: game_code
        }));
    }
    else {
        join_error('Please check that your game code matches the format #AAAAA');
    }
}

function game_joined(m) {
    hidden("join_menu");
    id("join_error").textContent = "";
    setGameId(m.game_id);
    grid.style.width = m.data.grid_size.grid_width + "px";
    grid.style.height = m.data.grid_size.grid_height + "px";
    reset();
    minesArray = m.data.minesArray;
    drawGrid(m.data);
    updateGameInfo(m.gameinfo);
    unHide(btnState);
    timer.setTime(m.gameinfo.clock);
    paused = true;

    if (m.gameinfo.state_def == 1) {
        game_lost(m);
    }
    else if (m.gameinfo.state_def == 2) {
        game_won();
    }

    if (m.gameinfo.game_state == 1) {
        //unpause(m.gameinfo)
        id("timer").textContent = "Synchronising...";
    }
}

function setGameId(g_id) {
    game_id = g_id;
    id("game_id").textContent = "GAME ID: " + g_id;
}

function setClientId(c_id) {
    client_id = c_id;
    id("client_id").textContent = "CLIENT ID: " + client_id;
}

function updateGameInfo(m) {
    game_state = m.game_state;
    btnState = m.btnState;
}

function join_error(e) {
    id("join_error").textContent = e;
}

function unpause(m) {
    game_state = 1;
    id("pauseBtn").style.visibility = "visible";
    pause_game();
    sync(m.clock);
}

/***************************PAUSE***************************/
function pause() {
    ws.send(JSON.stringify({
        method: "pause",
        id: game_id
    }));
}

function pause_game() {
    console.log("HMHMHMHMHMHMHMHMH");
    //Set width of grid cover in case browser resized
    id("grid_menu").style.width = grid.style.width;
    id("grid_menu").style.height = grid.style.height;
    
    //If Paused - Unpause
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

function sync(clock) {
    timer.setTime(clock);
}

////////////////////////////////////////MENU
/***************************Main Menu***************************/
generateMenu();
connect();

function generateMenu() {
    //Buttons
    newElement("buttons_div", "buttons_div", "div", "", [], id("menu"), true);
    newElement("saveBtn", "resetBtn", "button", "**SAVE**", [["onclick", "save()"]], id("buttons_div"), true);
    newElement("resetBtn", "resetBtn", "button", "NEW GAME (N)", [["onclick", "reset(0)"]], id("buttons_div"), true);
    newElement("restartBtn", "resetBtn", "button", "PLAY AGAIN (R)", [["onclick", "reset(1)"]], id("buttons_div"), true);
    newElement("closeBtn", "resetBtn", "button", "CLOSE MENU", [["onclick", "menu(1)"]], id("buttons_div"), true);
}

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

function save() {
    width = id("widthSlider").value;
    height = id("heightSlider").value;
    size = width * height;
    temp_height = height;
    temp_width = width;
    mines = id("minesSlider").value;
    estDiff(1);
    get_new_game();
}

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

function host_menu(i) {
    if (i == 0) visible("host_menu");
    else if (i == 1) hidden("host_menu");
}

function join_menu(i) {
    if (i == 0) visible("join_menu");
    else if (i == 1) hidden("join_menu");
}
