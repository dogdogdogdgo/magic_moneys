import { getMovesPawn } from './pieces/pawn.js';
import { getMovesKnight } from './pieces/knight.js';
import { getMovesRoyalPieces } from './pieces/royal-pieces.js';
import { squareSize } from './responsive-position-fixed.js';
import { movePiece, movePieceEnd, movePieceStart } from './pieces-event-listener-functions.js';

export { drawPieces, getMoves, piecesInformation, getKing, getOppositePieces, fetchMoves,
    getPieceTemplate, drawPiece, getPieceById, getPiecesByColor 
};

let piecesInformation = [];

function getPieceById(id){
    for (let i = 0; i<piecesInformation.length; i++){
        if (piecesInformation[i].id === id){
            return piecesInformation[i];
        }
    }
}

function getPiecesByColor(color){
    let pieces = [];
    for (let i = 0; i<piecesInformation.length; i++){

        if (piecesInformation[i].color === color){
            pieces.push(piecesInformation[i]);
        }
    }
    return pieces;
}

//första parameter är för att veta villken pjäs som ska flyttas
//den andra är för att veta om en pjäs kan gå till en av sina egna pjäser
function fetchMoves(pieceObj, goToMyOwnPieces){
    
    //denna raden kracharde någon gång 
    //och när jag restartade funkade det bara igen...
    //nu hände det igen, och jag har ingen aning om varför den krachar
    
    //detta var en fin lösning enligt mig hhihih😁
    //har ingen mer ork för att fixa detta😪, eftersom det ändå funkar som det ska
    if (pieceObj.pieceType){
        switch (pieceObj.pieceType){
            case 'rook':
            case 'bishop':
            case 'queen':
            case 'king':
                return getMovesRoyalPieces(pieceObj, goToMyOwnPieces);;
            case 'pawn':
                return getMovesPawn(pieceObj, goToMyOwnPieces);
            case 'knight':
                return getMovesKnight(pieceObj, goToMyOwnPieces);
        }
    }
    
}

function removePiece(piece){
    for (let i = 0; i<piecesInformation.length; i++){
        if (piecesInformation[i].x === piece.x && 
            piecesInformation[i].y === piece.y &&
            piecesInformation[i].pieceType === piece.pieceType && 
            piecesInformation[i].color === piece.color){
            
            piecesInformation.splice(i, 1);
            return;
        }
    }
}

function getOppositePieces(color){
    let oppositePieces = [];
    for (let i = 0; i<piecesInformation.length; i++){
        if (piecesInformation[i].color !== color){
            oppositePieces.push(piecesInformation[i]);
        }
    }
    return oppositePieces;
}

function getKing(color){
    for (let i = 0; i<piecesInformation.length; i++){
        if(piecesInformation[i].pieceType === 'king' && piecesInformation[i].color === color){
            return piecesInformation[i];
        }
    }
}

function getMoves(pieceToMove){
    let possibleMoves = [];
    //skaffa alla platser den pjästypen kan gå till, från den positionen

    let moves = fetchMoves(pieceToMove, false)

    //ta ur pjäsen som ska flyttas ur piecesInformation
    removePiece(pieceToMove);
    
    //hämta alla andra pjäset
    let oppPieces = getOppositePieces(pieceToMove.color);

    //loopa igenom dem
    for (let m = 0; m<moves.length; m++){
        let adMove = true;

        //stoppa in pjäsen på platsen för movet
        let pieceTmpMove = Object.assign({}, pieceToMove);
        pieceTmpMove.x =  moves[m].x;
        pieceTmpMove.y =  moves[m].y;

        piecesInformation.push(pieceTmpMove);
        
        
        for (let i = 0; i<oppPieces.length; i++){
            //hämta alla möjliga movs för pjäsenTypen på platsen av oppPiece,
            let tmpOppMoves = fetchMoves(oppPieces[i], true)

            for (let t = 0; t<tmpOppMoves.length; t++){
                let king = getKing(pieceToMove.color);
                    
                //när pjäsen står på platsen, kolla om kungen kan bli tagen av motståndaren
                //Om kugen utsatt gör så att PieceToMove inte kan flyttas till den positionen
                if (tmpOppMoves[t].x === king.x && tmpOppMoves[t].y === king.y){
                    
                    //så man kan ta den pjäsen som schackar kungen
                    if (moves[m].x === oppPieces[i].x && moves[m].y === oppPieces[i].y){

                        //syntaxen här kanske är lite konstig, ja..
                        continue;
                    }
                    //gör någon bool som blir false
                    else{
                     
                        adMove = false;
                    }
                }
            }
        }
        if (adMove){
            possibleMoves.push(moves[m])
        }
        else{
            adMove = true;
        }
        //ta bort pjäsen från pltsen, börja om
        removePiece(pieceTmpMove);
    }
    //sätt in pjäsen som tas bort i början
    piecesInformation.push(pieceToMove);

    //detta tar bort rockadmoves om kingen är i chack
    if (pieceToMove.pieceType === 'king'){
        for (let i = 0; i<possibleMoves.length; i++){
            if (possibleMoves[i].castleMove){

                //här får ingen kunna ta kungen
                //eftersom det är en regel för att göra rockad
                let removeMove = false;
                let oppPieces = getOppositePieces(pieceToMove.color);
                for (let o = 0; o<oppPieces.length; o++){
                    
                    let oppPieceMoves = fetchMoves(oppPieces[o], false);
                    //kanske lite taskigt namn...
                    for (let om = 0; om<oppPieceMoves.length; om++){
                        
                        if (oppPieceMoves[om].x === pieceToMove.x && oppPieceMoves[om].y === pieceToMove.y){
                            //då måste rockad draget tas bort
                            removeMove = true;
                            break;

                        }
                    }
                    if (removeMove){
                        break;
                    }

                }
                if (removeMove){
                    possibleMoves.splice(i, 1);
                    i--;
                    removeMove = false;
                }
            }
        }
    }

    return possibleMoves;
}

function drawPieces(){
    for (let i = 0; i < 8; i++){
        drawPiece('pawn', 'light', i, 6);
        drawPiece('pawn', 'dark', i, 1);
    }
    
    drawPiece('rook', 'light', 0, 7);
    drawPiece('rook', 'light', 7, 7);
    drawPiece('rook', 'dark', 0, 0);
    drawPiece('rook', 'dark', 7, 0);
    
    drawPiece('knight', 'dark', 1, 0);
    drawPiece('knight', 'dark', 6, 0);
    drawPiece('knight', 'light', 1, 7);
    drawPiece('knight', 'light', 6, 7);
    
    drawPiece('bishop', 'dark', 2, 0);
    drawPiece('bishop', 'dark', 5, 0);
    drawPiece('bishop', 'light', 2, 7);
    drawPiece('bishop', 'light', 5, 7);
    
    drawPiece('queen', 'dark', 3, 0);
    drawPiece('queen', 'light', 3, 7);

    drawPiece('king', 'dark', 4, 0);
    drawPiece('king', 'light', 4, 7);
}


function drawPiece(pieceType, color, x, y, id){
    
    let pieceId;
    let isMoved;

    //detta är till för när metoden kör då en bonde exempelvis ska bli en dam
    if (id){
        pieceId = id;
        isMoved = true;
    }
    else{
        pieceId = `${x},${y}`;
        isMoved = false;
    }

    let pieceContainer = document.createElementNS('http://www.w3.org/2000/svg','svg');
    pieceContainer.setAttributeNS(null, 'viewBox', '0 0 100 100');
    pieceContainer.setAttribute('class', `piece-container ${pieceType} ${color}`);
    pieceContainer.setAttribute('id', pieceId);
    
    pieceContainer.addEventListener('mousedown', movePieceStart);
    pieceContainer.addEventListener('mousemove', movePiece);
    pieceContainer.addEventListener('mouseup', movePieceEnd);
    pieceContainer.addEventListener('transitionend', toggleTransition);
    
    let piece = getPieceTemplate(pieceType, color);
    piece.setAttributeNS(null, 'class', `piece ${color}`);
    
    pieceContainer.appendChild(piece);
    pieceContainer.setAttributeNS(null, 'width', `${squareSize}vw`);
    
    pieceContainer.style = `top:${y * squareSize}vw;left:${x * squareSize}vw`;
    document.getElementById('pieces-container').appendChild(pieceContainer);
    
    
    let pieceObj = {
        pieceType: pieceType,
        color: color,
        x: x,
        y: y,
        id: pieceId,
        moved: isMoved,
    };

    piecesInformation.push(pieceObj);
}

function toggleTransition(event){
    let pieceId = event.currentTarget.id;
    let piece = document.getElementById(pieceId);

    if (piece.classList.contains('toggle-transition')){
        piece.classList.toggle('toggle-transition');
    }
}

function getPieceTemplate(pieceType){

    let pieceTemplate = document.getElementById(`${pieceType}-template`);
    // det måste vara true för att den också ska clona innehållet annas får man enbart g elementet
    let piece = pieceTemplate.cloneNode(true); 
    piece.removeAttribute('id');
    //eftersom annas får pjäserna id som "knight-template" och de är inte snyggt

    piece.setAttributeNS(null, 'transform', decideScale(pieceType));
    return piece;
}

function decideScale(pieceType){
    //härdkordade värden eftersom storlekarna blev konstiga från att de målades i inkscape
    switch (pieceType){
        case 'pawn':
            return 'scale(1.8)';
        case 'rook':
            return 'scale(1.3)';
        case 'knight':
            return 'scale(1.6)';
        case 'bishop':
            return 'scale(2)';
        case 'queen':
            return 'scale(1.5)';
        case 'king':
            return 'scale(2)';       
    }
}