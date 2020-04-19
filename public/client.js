var player, game;
var socket;
$(document).ready(onLoad());

function onLoad(){
    socket = io.connect('http://Localhost:3000');
    var p1Color = 0; // Black
    var p2Color = 1; // White

    // Create a new user
    socket.on('new', function(){
        if(document.cookie){
            var name = cookieName();
            $('#userName').val(name);
            socket.emit('newCookie', name);
        }
        else{
            socket.emit('newUser');
        }
    });

    // Create a new cookie
    socket.on('new cookie', function(username){
        document.cookie = `name=${username}`;
        var name = cookieName();
        $('#userName').val(name);
        document.cookie = `theme=1`;
        game.setTheme(cookieTheme());
    });

    // Create a new user
    socket.on('new user', function(username){
        $('#userName').val(username);
    })

    // Update new username
    socket.on('new name', function(username){
        $('#userName').val(username);
    })

    // Update username in cookie
    socket.on('new cookie name', function(username){
        if(document.cookie){
            document.cookie = `name=${username}`;
        }
    });

    // Store the new theme in the cookie
    socket.on('set theme', function(id){
        if(document.cookie){
            document.cookie = `theme=${id}`;
            game.setTheme(cookieTheme());
        }
    });

    // When the "new game" option is clicked, create a new player and a game
    $('#new').on('click', function(){
        var name = $('#userName').val();
        player = new Player(name, p1Color);
        socket.emit('createGame', {name});
    });

    // When the "join game" option is clicked, create a new player and request to join the game
    $('#join').on('click', function(){
        var name = $('#userName').val();
        var roomNum = $('#roomID').val();
        if(!roomNum){
            alert('Please enter a room ID');
            return;
        }
        player = new Player(name, p2Color);
        socket.emit('joinGame', {name, room: roomNum});
        
    });

    // When the "edit name" option is clicked, update the username
    $('#edit').on('click', function(){
        var name = $('#userName').val();
        socket.emit('editName', name);

    });

    // When the "random game" option is clicked, pass it to the server
    $('#random').on('click', function(){
        var name = $('#userName').val();
        var message = "Waiting for another player... ";
        $('#msg').html(message);
       
        socket.emit('randomClicked', {name});
    });

    // Change the color theme when one of these are clicked
    $('#t1').on('click', function(){
        socket.emit('change theme', 1);
    }); 

    $('#t2').on('click', function(){
        socket.emit('change theme', 2);
    });

    $('#t3').on('click', function(){
        socket.emit('change theme', 3);
    });

    // When a game is created, display message about room ID and display the game board
    socket.on('new game', function(data){
        var message = `Hello ${data.name} <br> Game ID: ${data.room} <br> Give the Game ID to your friend for them to join...`
        game = new Game(data.room);
        game.displayBoard(message);
        game.setTheme(cookieTheme());

    });

    // Create a game and a player, used for players that wants a random game
    socket.on('create game', function(data){
        player = new Player(name, p1Color);
        socket.emit('createGame', data);
    });

    // Create a player and request to join a game, used for players that wants a random game
    socket.on('join room', function(data){
        player = new Player(name, p2Color); 
        socket.emit('joinGame', data);
    });

    // Player 1 joins the game, display message and set turn to true (goes first)
    socket.on('player1 joined', function(data){
        $('#players').html(data.message);
        game.setTheme(cookieTheme());
        player.setCurrTurn(true);
    });

    // Player 2 joins the game, display the board and set turn to false (goes second)
    socket.on('player2 joined', function(data){
        game = new Game(data.room);
        game.displayBoard(data.message);
        game.setTheme(cookieTheme());
        player.setCurrTurn(false);
    });

    // After a player played his turn, update board and give turn to the other player
    socket.on('player moved', function(data){
        var row = game.getRow(data.piece);
        var col = game.getCol(data.piece);
        if(player.getPlayerColor() === p1Color){
            var opponentColor = p2Color;         
        }
        else{
            var opponentColor = p1Color;
        }

        game.updateBoard(opponentColor, row, col, data.piece);
        player.setCurrTurn(true);
    });

    // Notify both players that game has ended
    socket.on('game end', function(data){
        game.endGameMessage(data.message);
    });

    // Display error message if needed
    socket.on('err', function(data){
        alert(data.message);
    });

    // Notify the user that the other play has disconnected / automatically wins
    socket.on('user disconnect', function(){
        const message = `You win! Other player was disconnected!`;
        game.endGameMessage(message);
    });
}

// Get the username from the cookie
// https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie
function cookieName(){
    var cookieValue = document.cookie.replace(/(?:(?:^|.*;\s*)name\s*\=\s*([^;]*).*$)|^.*$/, "$1");
    return cookieValue;
}

// Get color theme id from cookie
function cookieTheme(){
    var cookieValue = document.cookie.replace(/(?:(?:^|.*;\s*)theme\s*\=\s*([^;]*).*$)|^.*$/, "$1");
    return cookieValue;
}