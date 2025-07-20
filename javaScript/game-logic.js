import { drawBoard, resetBoard, lastMovedPieceColor, getGameState, squares } from "./board.js";
import { drawPieces, drawPiece } from "./pieces.js";
import { startBot, botColor, botMovePiece, changeBotColor } from "./superAIbot.js";
import { getPieceTemplate, getPieceById, getMoves } from './pieces.js';
import { swapSides, removePiece } from './judge.js';

export { someOneMoved, toggleBackgroundsBlur, getGameOverPopUp, toggleHighlightSquares };


let popUpSingleplayer;

drawBoard();
drawPieces();


let gameOverPopUp = getGameOverPopUp();
let gameOverContinueButton = gameOverPopUp.querySelector('button');
gameOverContinueButton.addEventListener('click', function(){

    gameOverPopUp.classList.toggle('invisible');
    toggleBackgroundsBlur();
});

function toggleBackgroundsBlur(){
    let backgroundBlur = document.getElementById('background-blur');
    backgroundBlur.classList.toggle('invisible');
}

function getGameOverPopUp(){
    return document.getElementById('game-over-pop-up');
}

let welcomeContinueButton = document.getElementById('welcome-continue-button');
welcomeContinueButton.addEventListener('click', function(){

    document.getElementById('welcome-pop-up').classList.toggle('invisible');    
});

let popUpSelectPawnUppgrade = document.getElementById('decide-pawn-uppgrade');

let piecesToChose = ['queen', 'knight', 'rook', 'bishop'];
for (let i = 0; i<piecesToChose.length; i++){

    let pieceContainer = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    pieceContainer.setAttributeNS(null, 'viewBox', '0 0 100 100');
    let tmpPiece = getPieceTemplate(piecesToChose[i]);
    pieceContainer.appendChild(tmpPiece);
    popUpSelectPawnUppgrade.appendChild(pieceContainer);
}

let svgElements = popUpSelectPawnUppgrade.querySelectorAll('svg');
svgElements[0].addEventListener('click', () => selectPieceType('queen'));
svgElements[1].addEventListener('click', () => selectPieceType('knight'));
svgElements[2].addEventListener('click', () => selectPieceType('rook'));
svgElements[3].addEventListener('click', () => selectPieceType('bishop'));

function selectPieceType(pieceType){

    //removePiece vet saker eftersom den globala variablen pawnToUppgradeId
    let pawnToUppgrade = removePiece();
    drawPiece(pieceType, pawnToUppgrade.color, pawnToUppgrade.x, pawnToUppgrade.y, pawnToUppgrade.id);
    popUpSelectPawnUppgrade.classList.toggle('invisible');
    if (popUpSelectPawnUppgrade.classList.contains('light')){
        popUpSelectPawnUppgrade.classList.toggle('light');
    }
    else{

        popUpSelectPawnUppgrade.classList.toggle('dark');
    }

    //så att det kommer upp om det blir shackmat eller så när man valt
    //hur man vill uppgradera bonden
    let piece = getPieceById(pawnToUppgrade.id);    
    if (!botColor){
        getGameState(piece);
    }
    else {
        getGameState(piece);
        botMovePiece();
    }
    
    toggleBackgroundsBlur();
}

let menu = document.getElementById('menu');
let singlePlayer = menu.children[0];
let multiplayer = menu.children[1];
let swapSidesButton = menu.children[2];

singlePlayer.addEventListener('click', gamemodeSinglePlayer);
multiplayer.addEventListener('click', gamemodeMultiplayer); 
swapSidesButton.addEventListener('click', swapSides);

let selectGamemode = document.getElementById('select-gamemode');
selectGamemode.children[1].addEventListener('click', () => popUpGamemode('singleplayer'));
selectGamemode.children[2].addEventListener('click', () => popUpGamemode('multiplayer'));

function popUpGamemode(gamemode){
    
    if (gamemode === 'singleplayer'){
        gamemodeSinglePlayer();
    }
    else {
        toggleBackgroundsBlur();
        gamemodeMultiplayer();
    }
    let selectGamemode = document.getElementById('select-gamemode');
    selectGamemode.classList.toggle('invisible');
}

//när singlePlayer är activerat
function someOneMoved(){
 
    if (botColor !== null && lastMovedPieceColor !== botColor){
        botMovePiece();
    }
    else if (botColor === 'light' && lastMovedPieceColor === null){
        botMovePiece();
    }
}

function gamemodeSinglePlayer(){
    if (singlePlayer.classList.contains('inactive')){
        singlePlayer.classList.toggle('inactive');
    }
    if (!multiplayer.classList.contains('inactive')){
        multiplayer.classList.toggle('inactive');
    }
    let backgroundBlur = document.getElementById('background-blur');
    if (backgroundBlur.classList.contains('invisible')){
        toggleBackgroundsBlur();
    }
    resetBoard();
    
    //när man trycker på denna knapp ska en ruta komme upp, den vilken färg man vill spela som
    //svaret ska sedan åka till superAIbot filen
    popUpSingleplayer = document.getElementById('single-player-menue');
    popUpSingleplayer.classList.toggle('invisible');

    let buttons = popUpSingleplayer.querySelectorAll('button');
    //den vita button
    buttons[0].addEventListener('click', playerWantsWhite);
    //den svarta knappen
    buttons[1].addEventListener('click', playerWantsBlack);
}

function playerWantsBlack(){
    toggleBackgroundsBlur();
    popUpSingleplayer.classList.toggle('invisible');
    swapSides();
    startBot('light');
    someOneMoved();
}

function playerWantsWhite(){
    toggleBackgroundsBlur();
    
    popUpSingleplayer.classList.toggle('invisible');
    startBot('dark');
}

//funktionen som körn när man trycker på multiplayer knappen
function gamemodeMultiplayer(){

    if (!singlePlayer.classList.contains('inactive')){
        singlePlayer.classList.toggle('inactive');
    }
    if (multiplayer.classList.contains('inactive')){
        multiplayer.classList.toggle('inactive');
    }
    
    let swapButton = document.getElementById('swap-button');
    if (swapButton.classList.contains('invisible')){
        swapButton.classList.toggle('invisible');
    }
    resetBoard();
    changeBotColor(null);
}


//den togglar rutorna som man kan gå till, om den andra parametern är true
//av togglas alla rutor
function toggleHighlightSquares(pieceId, toggleOfAll){
    let tmpSquare;

    if (toggleOfAll){

        for (let i = 0; i<squares.length; i++){
            tmpSquare = document.getElementById(squares[i].id);
            if (tmpSquare.classList.contains('highlight')){
                tmpSquare.classList.toggle('highlight');
            }
        }
        return;
    }
    
    let piece = getPieceById(pieceId);
    let squaresToHL = getMoves(piece);
    
    
    for (let i = 0; i<squaresToHL.length; i++){
        for (let s = 0; s<squares.length; s++){

            if (squaresToHL[i].x === squares[s].x &&
                squaresToHL[i].y === squares[s].y){

                tmpSquare = document.getElementById(squares[s].id);
                tmpSquare.classList.toggle('highlight');
                break;
            }
        }     
    }
}