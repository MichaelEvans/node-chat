var util = require("util"),					// Utility resources (logging, object inspection, etc)
	io = require("socket.io");		

var socket;
var users; 

const redis = require('redis');
//const client = redis.createClient();
const subscribe = redis.createClient();
const publish = redis.createClient();
subscribe.subscribe('pubsub'); //#listen to messages from channel pubsub


function init() {
	// Create an empty array to store players
	users = [];

	// Set up Socket.IO to listen on port 8000
	socket = io.listen(8080);

	// Configure Socket.IO
	socket.configure(function() {
		// Only use WebSockets
		socket.set("transports", ["websocket"]);

		// Restrict log output
		socket.set("log level", 2);
	});

	// Start listening for events
	setEventHandlers();
}


var setEventHandlers = function() {
	// Socket.IO
	socket.sockets.on("connection", onSocketConnection);
	
};


// New socket connection
function onSocketConnection(client) {

	util.log("New player has connected: "+client.id);

	// Listen for client disconnected
	client.on("disconnect", onClientDisconnect);

	// Listen for new player message
	client.on("new player", onNewPlayer);
      
     client.on("message", onMessage);
     
    
     subscribe.on("message", function(channel, message) {
        //socket.emit("message", );
        //broadcastMessage(message);
       // var val = {nick: "Mike", message: message};
        client.send(message);
        util.log("From Redis: " + message);
     });
	// Listen for move player message
	//client.on("move player", onMovePlayer);
};

function broadcastMessage(message){
  socket.emit("message", {nick: "Mike", message: message});
};
// Socket client has disconnected
function onClientDisconnect() {
	util.log("Player has disconnected: "+this.id);

	var removePlayer = playerById(this.id);

	// Player not found
	if (!removePlayer) {
		util.log("Player not found: "+this.id);
		return;
	};

	// Remove player from players array
	users.splice(users.indexOf(removePlayer), 1);

	// Broadcast removed player to connected socket clients
	this.broadcast.emit("remove player", {id: this.id});
};

function onMessage(data){
  util.log("Message recieved: " + data.message);
  publish.publish("pubsub", JSON.stringify(data));
};
// New player has joined
function onNewPlayer(data) {
	// Create a new player
	var newPlayer = new Player(data.x, data.y);
	newPlayer.id = this.id;

	// Broadcast new player to connected socket clients
	this.broadcast.emit("new player", {id: newPlayer.id, x: newPlayer.getX(), y: newPlayer.getY()});

	// Send existing players to the new player
	var i, existingPlayer;
	for (i = 0; i < users.length; i++) {
		existingPlayer = users[i];
		this.emit("new player", {id: existingPlayer.id, x: existingPlayer.getX(), y: existingPlayer.getY()});
	};
		
	// Add new player to the players array
	users.push(newPlayer);
};


// Find player by ID
function playerById(id) {
	var i;
	for (i = 0; i < users.length; i++) {
		if (users[i].id == id)
			return users[i];
	};
	
	return false;
};


init();
