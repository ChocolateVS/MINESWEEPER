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