const WebSocket = require('ws');

const serverAddress = 'ws://localhost:5000/';

const ws = new WebSocket(serverAddress, {
	headers: {
		"user-agent": "Mozilla"
	}
});

ws.on('open', function() {
	ws.send("Hello server!");
});

ws.on('message', function(msg) {
	console.log("recived" + msg);
});



/*const ws = new WebSocket('ws://localhost:9898/');
ws.onopen = function() {
    console.log('WebSocket Client Connected');
    ws.send('Hi this is web client.');
};
ws.onmessage = function(e) {
  console.log("Received: '" + e.data + "'");
};


const serverAddress = 'wss://mineswepper-socket.glitch.me/';

const ws = new WebSocket(serverAddress, {
	headers: {
		"user-agent": "Mozilla"
	}
});

ws.on('open', function() {
	ws.send("Hello server!");
});

ws.on('message', function(msg) {
	console.log("recived" + msg);
});*/