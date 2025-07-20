import { gameOver, positionValid } from './board.js';
import { leftMargin, topMargin, squareSize } from './responsive-position-fixed.js';
import { lastMovedPieceColor, changePositionOfPiece } from './judge.js';
import { piecesInformation } from './pieces.js';
import { toggleHighlightSquares, someOneMoved } from './game-logic.js';
import { logGameState } from './text-log.js';
import { convertPxToVw } from './responsive-position-fixed.js';

export { xCoords, yCoords, movePiece, movePieceEnd, movePieceStart };


let move = false;
let getElementOnce = true;
let piece;
let left;
let top;
let pieceId;
let xCoords;
let yCoords;


function movePieceStart(event){
    pieceId = event.currentTarget.id;

    for (let i = 0; i<piecesInformation.length; i++){
        if (piecesInformation[i].id === pieceId){

            if (piecesInformation[i].color !== lastMovedPieceColor && lastMovedPieceColor !== null){
        
                move = true;
                break;
            }
            else if (piecesInformation[i].color === 'light' && lastMovedPieceColor === null){
        
                move = true;
                break;
            }
        }
    }
    if (move){
        //om true toggla ser den till att alla rutor är av togglade
        //annars togglar den rutorna som pjäser med idt kan gå till
        toggleHighlightSquares(pieceId, false)
    }
}

function movePiece(event){ 
    
    if (move && !gameOver){

        //annars började den byta pjäser lite hur som hällst.. medan man flyttar den första 
        if (getElementOnce){   

            //currentTarget går så att även om man klickar på barnen så kommer den som klickäventet med, idetta fallet svg elementet
            piece = document.getElementById(event.currentTarget.id);
            getElementOnce = false;
        }
        left = convertPxToVw(event.clientX);
        top = convertPxToVw(event.clientY);

        //lite oefektivt eftersom alla pjäser har samma storlek
        let svgElement = piece.getBoundingClientRect();
        let pieceSize = {
            width: convertPxToVw(svgElement.width),
            height: convertPxToVw(svgElement.height)
        };

        piece.style = `top: ${top - topMargin - (pieceSize.width/2)}vw; left: ${left - leftMargin - (pieceSize.height/2)}vw;`;
    }
}


function movePieceEnd(){
    if (move){
        //om true toggla ser den till att alla rutor är av togglade
        toggleHighlightSquares(pieceId, true);
    }
    move = false;
    getElementOnce = true;
    
    let pieceObj;
    for (let i = 0; i<piecesInformation.length; i++){

        if (piecesInformation[i].id === piece.id){
            pieceObj = piecesInformation[i];
        }
    }
    
    //xCoords & y är den nya positionen, alltså dit man vill flytta
    xCoords = Math.floor((left - leftMargin) / squareSize);
    yCoords = Math.floor((top - topMargin) / squareSize);
    
    //eftersom den redan har ändrats när jag vill använda de gammla värdena..
    let pieceObjCopy = Object.assign({}, pieceObj);
    
    if(positionValid(pieceObj)) {

        let newPosition = {
            x: xCoords,
            y: yCoords
        };
        changePositionOfPiece(newPosition, pieceObj);
        pieceObj.moved = true;

        piece.style = `top:${newPosition.y * squareSize}vw;left:${newPosition.x * squareSize}vw`;


        //den får sin nya plats, så att den kommer i mitten
        //pieceObjCopy håller de gammla positionerna
        //pieceObj håller de nya
        logGameState(pieceObjCopy, pieceObj);

        //används för att veta när botten ska flytta saker i singleplayer
        someOneMoved();

        //så att swapKnappen enbart syns när man kan trycka på den
        let swapButton = document.getElementById('swap-button');
        if (!swapButton.classList.contains('invisible')){
            swapButton.classList.toggle('invisible');
        }
    }
    else{
        //annars flyttas den tillback till ursprungsplatsen
        //om movet inte är validerat alltså 
        piece.style = `left:${pieceObj.x * squareSize}vw;top:${pieceObj.y * squareSize}vw`;
    }
}