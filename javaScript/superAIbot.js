import { squareSize } from './responsive-position-fixed.js';
import { getMoves, piecesInformation, drawPiece, getPiecesByColor } from './pieces.js';
import { changeLastMovedPieceColor, changePositionOfPiece, removePiece } from './judge.js';
import { logGameState } from './text-log.js';

export { generateRandomMove, startBot, botMovePiece, botColor, changeBotColor, makeQueen, resettBotMadeItsFirstMove };

let botColor = null;
let botMadeItsFirstMove = false;

function resettBotMadeItsFirstMove(){
    botMadeItsFirstMove = false;
}
function changeBotColor(newValue){
    botColor = newValue;
}

function startBot(color){
    botColor = color;

    let swapButton = document.getElementById('swap-button');
    if (!swapButton.classList.contains('invisible')){
        swapButton.classList.toggle('invisible');
    }
}

function botMovePiece(){

    //så att den hindras frän att göra ett move när man inte valt villken pjäs som vill ha istället för bonde
    let continueOn = true;
    for (let i = 0; i<piecesInformation.length; i++){
        if (piecesInformation[i].pieceType === 'pawn'){

            let startY = parseInt(piecesInformation[i].id.charAt(piecesInformation[i].id.length -1));
            if (startY === 1 && piecesInformation[i].y === 7 
            || startY === 6 && piecesInformation[i].y === 0){
                continueOn = false;
                break;
            }
        }
    }

    if (continueOn){
        let moveInformation = generateRandomMove();
        if (moveInformation){
            let piece = document.getElementById(moveInformation.piece.id);

            //annars flygger pjäsen från fel håll när man kör som svart mot botten
            //det såg riktigt buggit ut!!
            if (botMadeItsFirstMove || botColor === 'dark'){

                //den av togglas sedan med en eventListener
                piece.classList.toggle('toggle-transition');
            }
            piece.style = `top:${moveInformation.newPosition.y * squareSize}vw;left:${moveInformation.newPosition.x * squareSize}vw`;
            
            moveInformation.piece.moved = true;
            changePositionOfPiece(moveInformation.newPosition, moveInformation.piece);
            changeLastMovedPieceColor(moveInformation.piece.color);
            logGameState(moveInformation.piece, moveInformation.newPosition);

            botMadeItsFirstMove = true;
        }
    }
    else {
        continueOn = true;
    }    
}

function generateRandomMove(){
    let pieces = getPiecesByColor(botColor);
    let moves;
    let pieceToMove;
    
    while (pieces.length !== 0){

        //för splice returnerar en array med de som den tarbort
        pieceToMove = pieces.splice(Math.floor(Math.random() * (pieces.length-1)), 1)[0];
        moves = getMoves(pieceToMove);
        
        if (moves.length !== 0){
            
            let moveToMake = moves[Math.floor(Math.random() * (moves.length-1))];
            return {piece: pieceToMove, newPosition: moveToMake };
        }
    }
    return null;
}

function makeQueen(pawn){
    for (let i = 0; i<piecesInformation.length; i++){
        if (piecesInformation[i].id === pawn.id){

            //både från listan och visuelt
            //den vet vilken pjäs eftersom pawnToUppgradeId
            removePiece();
        }    
    }
    //eftersom damen förmodligen är bäst i alla fall i detta fallet
    //drawPiece lägger också till pjäserna i listan
    drawPiece('queen', botColor, pawn.x, pawn.y, pawn.id);

}

