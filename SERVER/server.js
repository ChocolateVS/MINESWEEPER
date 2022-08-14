const WebSocket = require('ws');

const port = 8080;

const wsServer = new WebSocket.Server({
    port: port
})

let GAMES = {};
let CLIENTS = [];

console.log( (new Date()) + "Server is listening on port " + port);

wsServer.on('connection', function (socket) {

  console.log("[Server] Connection!");

  socket.on('message', function (msg) {

    console.log('[Server] Recieved message from client: ' + msg);
    try {
        let m = JSON.parse(msg);
        handleMessage(m, socket);
    }
    catch (err) {
        console.log("[Error] Method not JSON format");
    }

  });
});

function get_id() {
  return '#' + Math.random().toString(36).substr(2, 5);
};

function handleMessage(m, socket) {

  if (m.method == undefined) {
      return;
  }

  let method = m.method;

  if (method) {

      if (handlers[method]) {
          let handler = handlers[method];
          try {
            handler(m, socket);
          }
          catch (e) {
            console.log(e);
          }
          
      } 
      else {
          console.log('[Client] No handler defined for method ' + method + '.');
      }

  }
}

let handlers = {
  // Client Connecting
  "connect": function(m, socket) { client_connection(m, socket) },
  
  //New Game
  "new-game": function(m) { newGame(m) },

  //Play Again
  "play-again": function(m) { playAgain(m) },

  //Cell Left Clicked
  "cell-left-clicked": function(m) { 
    updateTime(m);
    cellLeftClicked(m) 
  },

  //Cell Left Clicked
  "cell-right-clicked": function(m) { 
    updateTime(m);
    cellRightClicked(m) 
  },

  //Cell Left Clicked
  "cell-middle-clicked": function(m) { 
    updateTime(m);
    cellMiddleClicked(m) 
  },
  
  //Join Game
  "join-game": function(m) { joinGame(m) },

  //Pause
  "pause": function(m) { pause(m) }
};

function client_connection(m, socket) {
  //If new client connecting
  if (CLIENTS[m.params.id] != undefined) {
      console.log('[Server] Client ' + m.params.id + 'Reconnected.');
      return;
  }
  //Create a new client
  let new_id = get_id();

  //Store client and client socket
  CLIENTS[new_id] = {
      socket: socket,
  }

  console.log('[Server] New Client Connected.');

  //Send Client Details to the client
  socket.send(JSON.stringify({
      method: 'set-client-id',
      params: {
        game_id: new_id,
        client_id: new_id
      }
  }));

  console.log('[Server] Sent Client ID ' + new_id);

    //Create Blank Game
    GAMES[new_id] = {
      clients: {},
      settings: {
          screen: {
              width:undefined,
              height:undefined
          },
          mines: undefined,
          width: undefined,
          height: undefined,
          size: undefined,
          
      },
      data: {
          minesArray: undefined,
          grid_size: undefined,
      },
      gameinfo: {
          game_state: 0,
          blankShown: [],
          btnState: [],
          shownCount: 0,
          darkened: [],
          paused: true,
          clock: 0,
          score: undefined,
          state_def: 0,
          cells: []
      }
  };

  console.log('[Server] Blank Game Created ', GAMES[new_id]);

  //Add Client to Game
  GAMES[new_id].clients[new_id] = CLIENTS[new_id];

  console.log('[Server] Client Added to Game ', GAMES[new_id]);
}

function newGame(m) {
  let p = m.params;

  reset(m.params.id);

  GAMES[m.params.id].settings.screen.width = p.screen.width;
  GAMES[m.params.id].settings.screen.height = p.screen.height;
  GAMES[m.params.id].settings.mines = p.size.mines;
  GAMES[m.params.id].settings.width = p.size.width;
  GAMES[m.params.id].settings.height = p.size.height;
  GAMES[m.params.id].settings.size = p.size.width * p.size.height;
  GAMES[m.params.id].data.score = p.size.mines;
      
  resetBtnState(m.params.id);

  setMinesArray(GAMES[m.params.id]);
  setSize(GAMES[m.params.id]);

  for(let client in GAMES[m.params.id].clients) {
    CLIENTS[client].socket.send(JSON.stringify({
      method: 'new-game',
      params: GAMES[m.params.id].data
    }));
  } 
}

function playAgain(m) {
  console.log('[SERVER] Client', m.id, " Playing Again");

  reset(m.id);

  resetBtnState(m.id);

  GAMES[m.id].gameinfo.game_state = 0;

  for(let client in GAMES[m.id].clients) {
    CLIENTS[client].socket.send(JSON.stringify({
      method: 'play-again',
      params: GAMES[m.id].data,
      clock: GAMES[m.id].gameinfo.clock
    }));
  } 
}

function setSize(game) {

  let s = game.settings;
  let grid_width;
  let grid_height;
  let cell_width;

  /*  GRID SIZING
      - Check the ratio between cells and screen size
      - Use 70% of the screen height
      - For which ever ratio is less > calculate cell width ot fit
      - Set grid size based on this
  */

  if (s.screen.width / s.width >= s.screen.height / s.height) {
      grid_height = Math.round(s.screen.height * 0.7)
      cell_width = (grid_height / (s.height))
      grid_width = cell_width * s.width
  }
  else {
      grid_width = Math.round(s.screen.width * 0.7),
      cell_width = (grid_width / (s.width)),
      grid_height = cell_width * s.height
  }

  game.data.grid_size = {
    grid_width: grid_width,
    cell_width: cell_width,
    grid_height: grid_height
  }
}

function setMinesArray(game) {

    let minesArray = [];
    
    for (let i = 0; i < game.settings.size; i++) minesArray[i] = "";
    for (let i = 0; i < game.settings.mines; i++) minesArray[i] = "%";

    minesArray = shuffleArray(minesArray);

    for (let i = 0; i < game.settings.size; i++) {

        var type = checkSurround(i, minesArray, game.settings);
        
        //If a number
        if (type != 0 && type != "%") {
            minesArray[i] = type;
        }
    }
    game.data.minesArray = minesArray;
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

/***************************SURROUNDING MECHANICS***************************/
function checkBoundaries(c, s) {
  //For Edge Cases (Corners and Sides), return cells to check
  if (c[0] == 0 && c[1] == 0) return [[0, 1], [1, 0], [1, 1]];
  if (c[0] == s.width - 1 && c[1] == s.height - 1) return [[0, -1], [-1, 0], [-1, -1]];
  if (c[0] == 0 && c[1] == s.height - 1) return [[0, -1], [1, 0], [1, -1]];
  if (c[0] == s.width - 1 && c[1] == 0) return [[0, 1], [-1, 0], [-1, 1]];
  if (c[0] == 0 && c[1] != 0 && c[1] != s.height - 1) return [[0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
  if (c[0] == s.width - 1 && c[1] != 0 && c[1] != s.height - 1) return [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1]];
  if (c[1] == 0 && c[0] != 0 && c[0] != s.width - 1) return [[-1, 0], [-1, 1], [0, 1], [1, 0], [1, 1]];
  if (c[1] == s.height - 1 && c[0] != 0 && c[0] != s.width - 1) return [[-1, -1], [-1, 0], [0, -1], [1, -1], [1, 0]];
  return [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]]; 
}

function checkSurround(cell, minesArray, s) {
  //If Cell is a mine > return mine
  if (minesArray[cell] == "%") return "%";

  //Surrounding Mines
  surrMines = 0;

  //Get X, Y coordinate from cell number
  let c = getXY(cell, s);

  //Check if cell is an edge case
  let surrounding = checkBoundaries(c, s);

  //For each surrounding cell to check
  for (let i = 0; i < surrounding.length; i++) {  
      //Calculate cell to check  
      let x = surrounding[i][0] + c[0];
      let y = surrounding[i][1] + c[1]; 
      
      //Convert x, y coordinates to cell number
      let checkCell = getCell(x, y, s);
      
      //If cell is a mine increment surrounding mines
      if (minesArray[checkCell] == "%") {
          surrMines++;
      }
  }

  return surrMines;
}

function checkSurroundBtn(cell, type, g) {
  let game = g.id;
  //Get X, Y coordinates of the cell
  let c = getXY(cell, GAMES[game].settings);

  //Check if cell is an edge case
  let surrounding = checkBoundaries(c, GAMES[game].settings);

  let cells = [];

  //Flags and Minea
  let f = 0, m = 0;

  //Lose?
  let l = false;
  let s = false;

  let sound;
  //Reset Darkened Cells
  GAMES[game].gameinfo.darkened = [];

  //For each surrounding cell to check
  for (let i = 0; i < surrounding.length; i++) {    
      let x = surrounding[i][0] + c[0];
      let y = surrounding[i][1] + c[1];  
      let checkCell = getCell(x, y, GAMES[game].settings);

      //Middle Click On Dormant Cell
      if (type == 0) {
          if (GAMES[game].gameinfo.btnState[checkCell].state == 0) {
              GAMES[game].gameinfo.darkened.push(checkCell);
          }          
      }
      //Check if cell is a mine or a flag
      else if (type == 1) {  
          if (GAMES[game].gameinfo.btnState[checkCell].state == 1) f++;
          if (GAMES[game].data.minesArray[checkCell] == "%") m++;
      }
      //Show surrounding cells
      else if (type == 2) {      
          //If surrounding cell is not a mine
          if (GAMES[game].data.minesArray[checkCell] != "%") {

              s = true;

              //If cell was not already hidden
              if (!GAMES[game].gameinfo.btnState[checkCell].hidden) {
                  GAMES[game].gameinfo.shownCount++; 
                  GAMES[game].gameinfo.btnState[checkCell].hidden = true;
                  //hidden("btn" + checkCell);
              }
              //color(checkCell, "#9eabb8"); 

              //If cell is blank > Show nearby cells
              if (GAMES[game].data.minesArray[checkCell] == "") {
                  GAMES[game].gameinfo.blankShown = [];
                  sound = "clear_sound";
                  recursiveShowNearby(g, checkCell);
              }                    
          }
          //If clicked cell had incorrect surrounding flags - LOSE
          else if (GAMES[game].gameinfo.btnState[checkCell].state != 1) {
              cells.push(checkCell);
              l = true;
          }
      }
  }
  if (l) lose(game, cells);
  if (f == m && GAMES[game].data.minesArray[cell] == f) return true;
  if (s) {
    for(let client in GAMES[game].clients) {
      CLIENTS[client].socket.send(JSON.stringify({
        method: 'middle-click-update',
        sound: sound,
        btnState: GAMES[game].gameinfo.btnState
      }));
    }
  }
}
/***************************CO-ORDINATES***************************/
function getCell(x, y, s) { return ((y) * s.width) + x; }

function getXY (cell, s) {
    let x = (cell % (s.width));
    let y = ((cell - x) / (s.width));
    return [x, y];
}

function cellLeftClicked(m) {
  console.log("[Server] Client Left Clicked" + GAMES[m.id].gameinfo.game_state);
  let sound;
  //If Game has not finished
  if (GAMES[m.id].gameinfo.game_state != 2) { 
    //If game has not started > Begin Timer
    if (GAMES[m.id].gameinfo.game_state == 0) {
        GAMES[m.id].gameinfo.game_state = 1;  

        //GAMES[m.id].gameinfo.paused = false;

        for(let client in GAMES[m.id].clients) {
          CLIENTS[client].socket.send(JSON.stringify({
            method: 'unpause',
            clock: GAMES[m.id].gameinfo.clock
          }));
        } 
    }
    //Cell Clicked is a blank cell
    if (GAMES[m.id].gameinfo.btnState[m.cell].state == 0) {

        //Hide the cell
        GAMES[m.id].gameinfo.btnState[m.cell].hidden = true;

        GAMES[m.id].gameinfo.shownCount++;

        //Cell Clicked is Mine
        if (GAMES[m.id].data.minesArray[m.cell] == "%") {
            //If first cell 
            /*if (GAMES[game_id].game_info.shownCount == 1) {
                get_new_game();
                cellClicked(cell);
                return;
            }*/
            //Else you lose
            console.log('[Server] Client Lost');
            lose(m.id, [m.cell]);
        }
        //Cell clicked is blank > show nearby cells
        else if (GAMES[m.id].data.minesArray[m.cell] == ""){
            GAMES[m.id].gameinfo.blankShown = [];
            sound = "clear_sound"; 
            recursiveShowNearby(m, m.cell);
        }
        else sound = "click_sound"; 
        checkWin(m.id);          
    }
    if (GAMES[m.id].gameinfo.game_state) {
      for(let client in GAMES[m.id].clients) {
        CLIENTS[client].socket.send(JSON.stringify({
          method: 'left-click-update',
          sound: sound,
          btnState: GAMES[m.id].gameinfo.btnState,
          clock: GAMES[m.id].gameinfo.clock
        }));
      } 
    }
  }
}

function cellRightClicked(m) {
  let image;
  let sound;

  //If Currently Blank > Switch to flag
  if(GAMES[m.id].gameinfo.btnState[m.cell].state == 0) {
      GAMES[m.id].data.score--;
      image = "red_flag";
      sound = "flag_on_sound";
  }

  //Else If Flag > Switch to question mark
  else if (GAMES[m.id].gameinfo.btnState[m.cell].state == 1) {
      GAMES[m.id].data.score++; 
      image = "question";
      sound = "flag_off_sound";
  }
  //If Question Mark > Switch to blank
  else {
    image = "blank";
    sound = undefined;
  }

  //Increment and loop button state
  GAMES[m.id].gameinfo.btnState[m.cell].state++;
  if (GAMES[m.id].gameinfo.btnState[m.cell].state == 3) {
    GAMES[m.id].gameinfo.btnState[m.cell].state = 0;
  }

  for(let client in GAMES[m.id].clients) {
    CLIENTS[client].socket.send(JSON.stringify({
      method: 'right-click-update',
      cell: m.cell,
      sound: sound,
      image: image,
      score: GAMES[m.id].data.score,
      btnState: GAMES[m.id].gameinfo.btnState,
      clock: GAMES[m.id].gameinfo.clock,
    }));
  } 
}

function cellMiddleClicked(m) {     
  if (m.classname == "button_div" && GAMES[m.id].gameinfo.btnState[m.cell].hidden && checkSurroundBtn(m.cell, 1, m)) {
      if (GAMES[m.id].data.minesArray[m.cell] != "%" && GAMES[m.id].data.minesArray[m.cell] != "") {
          checkSurroundBtn(m.cell, 2, m);
      }
  }
  else {
    checkSurroundBtn(m.cell, 0, m);
    CLIENTS[m.client_id].socket.send(JSON.stringify({
      method: "middle-unclick-update",
      darkened: GAMES[m.id].gameinfo.darkened
    }));
    GAMES[m.id].gameinfo.darkened = [];
  }
  checkWin(m.id);   
}

function reset(game) {

  GAMES[game].gameinfo.game_state = 0;
  GAMES[game].gameinfo.state_def = 0;
  GAMES[game].gameinfo.cells = [];
  
  GAMES[game].data.score = GAMES[game].settings.mines;
  GAMES[game].gameinfo.shownCount = 0;

  GAMES[game].gameinfo.blankShown = [];
  GAMES[game].gameinfo.btnState = [];

  GAMES[game].gameinfo.clock = 0;

  GAMES[game].gameinfo.paused = true;
  GAMES[game].gameinfo.clock = 0;
}

function lose(game, cells) {
  GAMES[game].gameinfo.game_state = 2;
  GAMES[game].gameinfo.state_def = 1;
  GAMES[game].gameinfo.cells = cells;
  GAMES[game].gameinfo.paused = true;

  for(let client in GAMES[game].clients) {
    CLIENTS[client].socket.send(JSON.stringify({
      method: 'game-lost',
      btnState: GAMES[game].gameinfo.btnState,
      cells: cells
    }));
  }
}

function checkWin(game) {
  //If all non-mine cells are shown - Win
  if (GAMES[game].settings.size - GAMES[game].settings.mines == GAMES[game].gameinfo.shownCount) {
      GAMES[game].gameinfo.game_state = 2;
      GAMES[game].gameinfo.state_def = 2;
      GAMES[game].gameinfo.paused = true;
      for(let client in GAMES[game].clients) {
        CLIENTS[client].socket.send(JSON.stringify({
          method: 'game-won',
        }));
      }
      //winSound.play();    
      //timer.stop(); 

      //id("timer").style.color = "green";   
      //id("pauseBtn").style.visibility = "hidden";

      //For each mine, make green!
      /*for (let i = 0; i < minesArray.length; i++) {
          if (minesArray[i] ==  "%") id("btn" + i).setAttribute("src", "images/mine_green.png");
      }      */                
  }
}

function recursiveShowNearby(m, cell) {
  if (!GAMES[m.id].gameinfo.btnState[cell].hidden) GAMES[m.id].gameinfo.shownCount++;
  GAMES[m.id].gameinfo.btnState[cell].hidden = true;

  GAMES[m.id].gameinfo.blankShown.push(cell);

  let c = getXY(cell, GAMES[m.id].settings);
  let surrounding = checkBoundaries(c, GAMES[m.id].settings);

  for (let i = 0; i < surrounding.length; i++) {   
      let x = surrounding[i][0] + c[0];
      let y = surrounding[i][1] + c[1];  
      let checkCell = getCell(x, y, GAMES[m.id].settings);

      if (!GAMES[m.id].gameinfo.btnState[checkCell].hidden) GAMES[m.id].gameinfo.shownCount++;
      GAMES[m.id].gameinfo.btnState[checkCell].hidden = true;

      if (GAMES[m.id].data.minesArray[checkCell] == "" && !GAMES[m.id].gameinfo.blankShown.includes(checkCell)) {
          recursiveShowNearby(m, checkCell);
      }                
  }
}

function resetBtnState(game) {
  GAMES[game].gameinfo.btnState = [];
  for (let i = 0; i < GAMES[game].settings.size; i++) {
    let b = {
        id: i,
        state: 0,
        hidden: false
    }
    GAMES[game].gameinfo.btnState.push(b);
}
}

function joinGame(m) {
  if (GAMES[m.game_id] != undefined) {
    console.log('[SERVER] Client ' + m.client_id + " is joining" + m.game_id);
    GAMES[m.game_id].clients[m.client_id] = CLIENTS[m.client_id];
    console.log(CLIENTS);
    CLIENTS[m.client_id].socket.send(JSON.stringify({
      method: 'join-game',
      game_id: m.game_id,
      settings: GAMES[m.game_id].settings,
      data: GAMES[m.game_id].data,
      gameinfo: GAMES[m.game_id].gameinfo
    }));
  }
  else {
    CLIENTS[m.client_id].socket.send(JSON.stringify({
        method: 'join-error',
        message: "Oh no! I couldn't find the game your looking for :/."
    }));
  }
}

function pause(m) {
  for(let client in GAMES[m.id].clients) {
    CLIENTS[client].socket.send(JSON.stringify({
      method: 'pause'
    }));
  }
}

function updateTime(m) {
  GAMES[m.id].gameinfo.clock = m.clock;
}