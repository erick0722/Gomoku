var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');

// Number of rooms
var roomNum = 0;

// Player array and index
var playerList = [];
var playerCount = 0;

// List of players that selected "random game" option
var randomList = [];
var randomCount = 0;

// Flag for creating and joining a random game
var createRandom = false;
var joinRandom = false;

app.use(express.static(path.join(__dirname, "public")));

io.on('connection', function(socket){

    console.log('a user connected');

    // Make the array 2D
    for (var i = 0; i < 20; i++) {
        playerList.push(['']);
    }
    // Create a new user
    socket.emit('new');

    // Set up nickname and cookie for the new user
    socket.on('newUser', function() {
        var nickname = randomUsername();
        socket.name = nickname;
        socket.emit('new user', nickname);
        socket.emit('new cookie', nickname);
    });

    // Create new cookie
    socket.on('newCookie', function(nick){
        socket.name = nick;
        socket.emit('new user', socket.name);
    });

    // Edit the username, also change name in cookie
    socket.on('editName', function(newName){
        socket.name = newName;
        socket.emit('new cookie name', socket.name);
        socket.emit('new name', socket.name);
    });

    // Change the color theme
    socket.on('change theme', function(id){
        socket.emit('set theme', id);
    });

    // Create a game room
    socket.on('createGame', function(data){
        
        // Create a random room for users who selected random option
        if(createRandom){
            ++roomNum;
            socket.join(roomNum.toString());
            socket.emit('new game', {name: data.name, room: roomNum});
            playerList[roomNum][playerCount] = data.name;
            ++playerCount;
            createRandom = false;
        }
        // Let the second player join the random game room
        else if(joinRandom){
            socket.emit('join room', {name: randomList[randomCount - 1], room: roomNum});
            joinRandom = false;
        }
        // Otherwise, create a normal room
        else{
            ++roomNum;
            socket.join(roomNum.toString());
            socket.emit('new game', {name: data.name, room: roomNum});
            playerList[roomNum][playerCount] = data.name;
            ++playerCount;
        }
        
    });

    // Connect player 2 to the room that he requested, show error if room is full or does not exist
    socket.on('joinGame', function(data){

        var room = io.sockets.adapter.rooms[data.room];
        
        // Check if room exists or have less than two people
        if(room && room.length < 2){
            socket.join(data.room);
            
            // Insert the name into playList array and generate a message
            playerList[data.room][playerCount] = data.name;
            ++playerCount;
            var msg = `${playerList[data.room][playerCount - 2]} vs. ${playerList[data.room][playerCount - 1]}`;
            socket.broadcast.to(data.room).emit('player1 joined', {name: playerList[data.room][playerCount - 2], room: data.room, message: msg});
            socket.emit('player2 joined', {name: playerList[data.room][playerCount - 1], room: data.room, message: msg});
            
        }
        else{
            // Output error message if cannot join room
            socket.emit('err', {message: 'Cannot join room!'});
            return;
        }
    });

    // Handler for when the random option is clicked
    socket.on('randomClicked', function(data){

        // If the button is clicked "even" times, add the username to the random player array and wait 
        if(randomCount % 2 == 0){
            randomList[randomCount] = data.name;
            randomCount++;
        }
        // When a second player hits the option, create a game for them
        else{
            randomList[randomCount] = data.name;
            randomCount++;
            io.emit('create game', {name: randomList[randomCount - 2]});      
            createRandom = true;
            joinRandom = true;
        }
        
    });

    // Notify the other player that a turn has been played
    socket.on('playTurn', function(data){
        socket.broadcast.to(data.room).emit('player moved', {piece: data.piece, room: data.room});
    });

    // Notify players about winner
    socket.on('gameOver', function(data){
        roomNum--;
        socket.broadcast.to(data.room).emit('game end', data);
    });

    // Notify player about disconnecting
    socket.on('disconnect', function(){
        if(roomNum >= 1){
            roomNum--;
        }
        socket.emit('user disconnect');
        socket.leave();
    });

});

// Listen on port 3000
http.listen(3000, function(){
    console.log('listening on *:3000');
});

// Generate a random username
// Code from https://jsfiddle.net/ygo5a48r/
function randomUsername() {
	let parts = [];
    parts.push( ["Star", "Magician", "Hermit", "Hierophant", "Silver", "Ebony", "Crazy", "Killer", "King"] );
    parts.push( ["Platinum", "Red", "Purple", "Green", "Chariot", "Devil", "Diamond", "Queen", "Crimson"] );
    username = "";

    for(part of parts) {
    	username += part[Math.floor(Math.random()*part.length)];
    }
    return username;
}