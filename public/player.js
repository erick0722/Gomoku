// Create a player class
class Player {
    constructor(name, color) {
        this.name = name;
        
        // Player's piece's color
        this.color = color;
        this.currTurn = false;
    }

    // Set player's current turn to the given value and generate corresponding message
    setCurrTurn(turn) {
        this.currTurn = turn;
        var message;
        if(this.currTurn){
            message = 'It is your turn';
        }
        else{
            message = 'Waiting for Opponent';
        }
        $('#turn').text(message);
    }

    getPlayerName() {
        return this.name;
    }

    getPlayerColor() {
        return this.color;
    }

    getCurrTurn(){
        return this.currTurn;
    }

    getInGame(){
        return this.inGame;
    }
}
