// Create a game class
// Some logic taken from https://ayushgp.github.io/Tic-Tac-Toe-Socket-IO/
class Game {
    constructor(roomId) {
        this.roomId = roomId;
        // Stores each pieces on the board
        this.board = [];
        // Total number of moves
        this.movesNum = 0;
    }

    createBoard(){
        // Handler when a piece is clicked
        function pieceHandler() {
            var row, col;

            row = game.getRow(this.id);
            col = game.getCol(this.id);
          
            // Display error message if it is not the player's turn
            if(!player.getCurrTurn()){
                alert('It is not your turn yet!');
                return;
            }

            // Display error message if player tries to make an illegal move
            if($(this).prop('disabled')){
                alert('This place already has a piece!');
                return;
            }

            // Update board after player's turn, and check if there is a winner
            game.playTurn(this);
            game.updateBoard(player.getPlayerColor(), row, col, this.id);
            game.checkWinner();
            player.setCurrTurn(false);
            
          
        }
        // Create tiles for the board
        game.createTiles(pieceHandler);
    }

    // Create tiles for the board
    createTiles(clickHandler){
        // Create buttons that act as tiles, and attach handlers to each button
        for(var i = 0; i < 14; i++){
            for(var j = 0; j < 14; j++){
                $('.boardRow').append(`<button class="cell" id="btn_${i}-${j}"><div id="${i}-${j}" class="circle" style="display: none"></div></button>`);
            }
        }
        for (var i = 0; i < 14; i++) {
            this.board.push(['']);
            for (var j = 0; j < 14; j++) {      
              $(`#btn_${i}-${j}`).on('click', clickHandler);
              this.board[i][j] = -1;
            }
        }
    }

    // Hide the menu ui and display board
    displayBoard(message){
        $('.box').css('display', 'none');
        $('.board').css('display', 'block');
        $('.header').css('display', 'block')
        $('#players').html(message);
        this.createBoard();
    }
    
    // Set the theme based on the id passed in
    setTheme(id){

        $(`#t${id}`).css('background-color', 'rgb(66, 65, 62)');
        $(`#t${id}`).prop('disabled', true);
        // Normal theme
        if(id == 1){
            $(`#t2`).css('background-color', 'rgb(185, 156, 59)');
            $(`#t2`).prop('disabled', false);

            $(`#t3`).css('background-color', 'rgb(185, 156, 59)');
            $(`#t3`).prop('disabled', false);

            $('body').css('background-color', 'rgb(187, 183, 179)');
            $('.header').css('color', 'black');
            $('.cell').css('background-color', 'rgb(170, 155, 138)');
            $('.cell').css('border', '1px solid rgb(70, 47, 47)');
        }
        // Dark mode
        else if(id == 2){
            $(`#t1`).css('background-color', 'rgb(185, 156, 59)');
            $(`#t1`).prop('disabled', false);

            $(`#t3`).css('background-color', 'rgb(185, 156, 59)');
            $(`#t3`).prop('disabled', false);

            $('body').css('background-color', 'rgb(49, 47, 47)');
            $('.header').css('color', 'white');
            $('.cell').css('background-color', 'rgb(83, 80, 80)');
            $('.cell').css('border', '1px solid white');
        }
        // Weird theme
        else{
            $(`#t1`).css('background-color', 'rgb(185, 156, 59)');
            $(`#t1`).prop('disabled', false);

            $(`#t2`).css('background-color', 'rgb(185, 156, 59)');
            $(`#t2`).prop('disabled', false);

            $('body').css('background-color', 'rgb(180, 92, 21)');
            $('.header').css('color', 'rgb(0, 255, 157)');
            $('.cell').css('background-color', 'rgb(61, 162, 221)');
            $('.cell').css('border', '1px solid white');
        }
    }

    // Update the board once a player plays their turn
    updateBoard(color, row, col, tile){
        var piece = tile.slice(4);
        $(`#${piece}`).css('display', 'block');
        if(color === 1){
            $(`#${piece}`).css('background-color', 'white');
        }
        else{
            $(`#${piece}`).css('background-color', 'black');
        }
        // Disble the tile that was just played on
        $(`#${tile}`).prop('disabled', true);
        // Store the piece in the board array and increment number of moves
        this.board[row][col] = color;
        this.movesNum++;
    }

    // Get row number from the button id
    getRow(id){
        var index = id.slice(4)
        index = index.split('-');
        var row = index[0];
        return row;
    }

    // Get column number from button id
    getCol(id){
        var index = id.slice(4)
        index = index.split('-');
        var col = index[1];
        return col;
    }

    // Get room id
    getRoomId() {
        return this.roomId;
    }

    // Notify the other player that a turn was played
    playTurn(piece) {
        const clickedTile = $(piece).attr('id');
        //Emit that turn was played by player
        socket.emit('playTurn', {
          piece: clickedTile,
          room: this.getRoomId(),
        });
    }

    // Check if there are 5 consecutive pieces in a row
    checkHorizontal(color){
        var count = 0;
        for(var i = 0; i < 14; i++){
            count = 0;
            for(var j = 0; j < 14; j++){
                if(game.board[i][j] != color){
                    count = 0;
                }
                else{
                    count++;
                }
                if(count == 5){
                    this.announceWinner();
                    return;
                }
            }
        }
    }

    // Check if there are 5 consecutive pieces in a column
    checkVertical(color){
        var count = 0;
        for(var j = 0; j < 14; j++){
            count = 0;
            for(var i = 0; i < 14; i++){
                if(game.board[i][j] != color){
                    count = 0;
                }
                else{
                    count++;
                }
                if(count == 5){
                    this.announceWinner();
                    return;
                }
            }
        }
    }

    // Check if there are 5 consecutive pieces on the two diagonals
    // Code from https://stackoverflow.com/questions/37480515/connect-4-check-diagonal-win
    checkInDiagonalTopLeftBottomRight(color){
        for(let col = 0; col < 10; col++){
          for(let row = 0; row < 10; row++)
          {
              let match = true;
              for(let i = 0; i < 5; i++)
              {
                  if(color != game.board[row + i][col + i]){
                    match = false;
                  }                     
              }
              if(match){
                this.announceWinner();
                return;
              }
          }
        }  
      }
  
      checkInDiagonalTopRightBottomLeft(color){
        for(let col = 0; col < 15; col++){
          if(col>4){
            for(let row = 0; row < 10; row++)
            {
                let match = true;
                  for(let i = 0; i < 5; i++)
                  {
                      if(color != game.board[row + i][col - i]){
                        match = false;
                      }                     
                  }
              
                if(match){
                  this.announceWinner();
                  return;
                }
            }
          }
        }  
    }

    // Check if there is a draw
    checkDraw(){
        if(this.movesNum >= 14 * 14){
            var drawMessage = 'Game ended with draw!';
            socket.emit('gameOver',{
                room: this.getRoomId(),
                message: drawMessage
            });
            this.endGameMessage(drawMessage);
        }
        
    }

    // Check if there is a winner by checking all directions and draw
    checkWinner(){
       
        this.checkHorizontal(player.getPlayerColor());
        this.checkVertical(player.getPlayerColor());
        this.checkInDiagonalTopLeftBottomRight(player.getPlayerColor());
        this.checkInDiagonalTopRightBottomLeft(player.getPlayerColor());
        this.checkDraw();
    }

    // Announce the winner if there is one
    announceWinner(){
        const message = player.getPlayerColor();
        // Let the other player know
        socket.emit('gameOver', {
            room: this.getRoomId(),
            message: message
        });
        this.endGameMessage(message);
    }

    // Send message about the winner to each player
    endGameMessage(msg){
        $('.cell').attr('disabled', true);
        
        var message = String(msg);
        if(message.includes(player.getPlayerColor())){
            alert("You Win!");
            $('#turn').text("You Win!");
        }
        else if(message.includes('disconnected')){
            alert(message);
            $('#turn').text(message);
        }
        else if(message.includes('draw')){
            alert(message);
            $('#turn').text(message);
        }
        else{
            alert("You Lose!")
            $('#turn').text("You Lose!");
        }
        // Refresh the page after 5 seconds
        setTimeout(function(){
            location.reload();
          }, 5000);
    }
}