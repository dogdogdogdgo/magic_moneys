import { piecesInformation, getPiecesByColor } from './pieces.js';
import { leftMargin, topMargin, squareSize } from './responsive-position-fixed.js';
import { botColor, makeQueen } from './superAIbot.js';

export { swapSides, lightSideDown, resetLightSideDown, changeLastMovedPieceColor, lastMovedPieceColor, changePositionOfPiece,
    pawnToUppgradeId, removePiece 
};


let lightSideDown = true;
let lastMovedPieceColor = null;
let pawnToUppgradeId;


function resetLightSideDown(){
    lightSideDown = true;
}

function changeLastMovedPieceColor(color){
    lastMovedPieceColor = color;
}

function swapSides(){
    
    //hämtar jag respektiva pjäs med samma x och pjäs typ från varje lag, och byter platts på dem.
    let lightPieces = getPiecesByColor('light');
    let darkPieces = getPiecesByColor('dark');
    
    let tmpPiece;
    for (let l = 0; l<lightPieces.length; l++){        
        for (let d = 0; d<darkPieces.length; d++){
            if (lightPieces[l].x === darkPieces[d].x && lightPieces[l].pieceType === darkPieces[d].pieceType){
                
                //här ska saker bytas
                tmpPiece = Object.assign({}, darkPieces[d]);
                darkPieces[d].y = lightPieces[l].y;
                lightPieces[l].y = tmpPiece.y;
                
                break;
            }
        }
    }
    uppdatePositions();
}

function uppdatePositions(){

    if (lightSideDown){
        lightSideDown = false;
    }
    else {
        lightSideDown = true;
    }

    let tmpSvgPiece;
    for (let i = 0; i<piecesInformation.length; i++){
        
        tmpSvgPiece = document.getElementById(piecesInformation[i].id);

        //avtogglas med en eventlistnener efter animationen är slut
        tmpSvgPiece.classList.toggle('toggle-transition');
        tmpSvgPiece.style = `left:${piecesInformation[i].x * squareSize}vw;top:${piecesInformation[i].y * squareSize}vw`;
    }
}


function changePositionOfPiece(newPosition, pieceToMove){

    //om pjäsen tar någon motständarpjäs när den flyttas
    for (let i = 0; i<piecesInformation.length; i++){
        if (piecesInformation[i].x === newPosition.x && piecesInformation[i].y === newPosition.y){
            
            let possibleElimination = piecesInformation[i];
            if (pieceToMove.color !== possibleElimination.color){
                takePiece(possibleElimination);
            }
        }
    }
    
    //uppdaterar piecesInformation
    //if-sattsen används för att lokalicera pjäsen i arrayen som man vill flytta
    for (let i = 0; i < piecesInformation.length; i++){ 
        if (piecesInformation[i].x == pieceToMove.x && piecesInformation[i].y == pieceToMove.y){
            
            //och här uppdateras informationsListan
            piecesInformation[i].x = newPosition.x;
            piecesInformation[i].y = newPosition.y;
            break;
        }  
    }

    //kollar om bonden ska kunna uppgraderas
    if (pieceToMove.pieceType === 'pawn'){

        //startY utgår alltid från att ljusa sidan är nere och mörka uppe
        let startY = parseInt(pieceToMove.id.charAt(pieceToMove.id.length -1));

        //samma här, med det lilla fulhacket..., men orkar inte fixa något bättre sätt
        if (lightSideDown){
            if (startY === 1 && newPosition.y === 7 || 
                startY === 6 && newPosition.y === 0){
                   
                //nu ska någon bliu dAM
                pawnToUppgradeId = pieceToMove.id;
                uppgradePawn(pieceToMove);
            }
        }
        else {
            if (startY === 1 && newPosition.y === 0 || 
                startY === 6 && newPosition.y === 7){
                   
                //nu ska någon bliu dAM
                pawnToUppgradeId = pieceToMove.id;
                uppgradePawn(pieceToMove);
            }
        }
    }
}

function uppgradePawn(pawn){
    
    if (!botColor || botColor !== pawn.color){
    
        //en ruta men respektive pjäs som bonden kan uppgraderas till
        let popUp = document.getElementById('decide-pawn-uppgrade');
        popUp.classList.toggle('invisible');

        let backgroundBlur = document.getElementById('background-blur');
        backgroundBlur.classList.toggle('invisible');

        if (pawn.color === 'light'){

            popUp.classList.toggle('light');
        }
        else {
            popUp.classList.toggle('dark');
        }

        //+0,25 för att få den i mitten
        //boxen har padding 0.25vw och pjäserna i boxen har höjden 5vw 
        popUp.style = `left:${pawn.x * squareSize + squareSize + leftMargin}vw;top:${pawn.y * squareSize + topMargin + 0.25 }vw`;
    }
    else {
        //botten väljer alltid en dam
        makeQueen(pawn);
    }
}


//denna används när en pjäs ska ta någon annan pjäs
function takePiece(pieceToKill){

    for (let i = 0; i < piecesInformation.length; i++){
        
        if (piecesInformation[i].id === pieceToKill.id){
            //tar bort det visuella
            document.getElementById(piecesInformation[i].id).remove();

            //tar bort från listan
            piecesInformation.splice(i, 1);
            return;
        }    
    }
}

//denna används när en bonde ska uppgraderas
function removePiece(){
    let pawnToUppgrade;
    for (let i = 0; i<piecesInformation.length; i++){

        if (piecesInformation[i].id === pawnToUppgradeId){
            pawnToUppgrade = Object.assign({}, piecesInformation[i]);
            document.getElementById(piecesInformation[i].id).remove();
            piecesInformation.splice(i, 1);
            break;
        }
    }
    return pawnToUppgrade;
}