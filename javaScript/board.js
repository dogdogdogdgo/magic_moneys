import { piecesInformation, getMoves, getKing, getOppositePieces, fetchMoves, drawPieces } from './pieces.js';
import { toggleBackgroundsBlur, getGameOverPopUp } from './game-logic.js';
import { changeBotColor, resettBotMadeItsFirstMove } from './superAIbot.js';
import { resetLightSideDown, changeLastMovedPieceColor, lastMovedPieceColor, changePositionOfPiece } from './judge.js';
import { xCoords, yCoords } from './pieces-event-listener-functions.js';
import { squareSize, positionBoardCenter, resizeBoard, setSymbolPosition } from './responsive-position-fixed.js';

export { drawBoard, resetBoard, piecesInformation, lastMovedPieceColor,
    kingInCheck, getGameState, gameOver, positionValid, symbols, getSymbol, squares 
};



let gameOver = false;
let symbols = [];
let squares = [];


function drawBoard(){
    //Lucas was here 2025 hihihi
    //den sätter storleken på brädet först, men även när fönstret byter storlek
    resizeBoard();

    let boardBackground = document.getElementById('board-background');

    let groupe = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    let square = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    square.setAttributeNS(null, 'height', `${squareSize}vw`);
    square.setAttributeNS(null, 'width', `${squareSize}vw`);

    let tmpSquare;
    let xCoords = 0;
    let yCoords = 0;
    let squarePosX = 0;
    let squarePosY = 0;
    for (let i = 1; i <= 64; i++){
        //eftersom square är en referenstyp
        tmpSquare = square.cloneNode();
        tmpSquare.setAttributeNS(null, 'x', `${xCoords}vw`);
        tmpSquare.setAttributeNS(null, 'y', `${yCoords}vw`);
        tmpSquare.setAttribute('id', `square:${squarePosX},${squarePosY}`);
        
        let tmpSquareObj = {
            id: `square:${squarePosX},${squarePosY}`,
            x: squarePosX,
            y: squarePosY
        };
        squares.push(tmpSquareObj);
    
        //så varanann ruta får varannan färg
        if (((yCoords/squareSize) + i) % 2 === 0){ 
            tmpSquare.setAttributeNS(null, 'fill', '#C6AC8F');
        }
        else {
            tmpSquare.setAttributeNS(null, 'fill', '#EAE0D5');
        }
        groupe.appendChild(tmpSquare);
        

        //följande kodblock lägg en bokstav beroende på kanterna av brädet
        //lägg bokstaven i en div med position absolute klistrat till bordet. 
        if (squarePosY === 7 && squarePosX === 7){
            
            let ySym = createSymbolDiv(squarePosY, 'x');
            addSymbolContainer(ySym, 8, 7);
            
            let xSym = createSymbolDiv(squarePosX, 'y');
            addSymbolContainer(xSym, 7, 8);
        }
        else {
            if (squarePosX === 7){
                let sym = createSymbolDiv(squarePosY, 'x');
                addSymbolContainer(sym, 8, squarePosY);

            }
            else if (squarePosY === 7){
                let sym = createSymbolDiv(squarePosX, 'y');
                addSymbolContainer(sym, squarePosX, 8);
            }
        }   

        squarePosX += 1;
        xCoords += squareSize;
        if (i % 8 === 0) {
            squarePosX = 0;
            squarePosY += 1; 
            xCoords = 0;
            yCoords += squareSize;
        }
    }
    
    setSymbolPosition();

    groupe.setAttributeNS(null, 'id', 'squares');
    boardBackground.appendChild(groupe);

    let piecesContainer = document.getElementById('pieces-container');
    piecesContainer.style.width = `${squareSize * 8}vw`;
    piecesContainer.style.height = `${squareSize * 8}vw`;
    document.getElementById('chess-main').appendChild(piecesContainer);

    positionBoardCenter();
}

function addSymbolContainer(symbol, xPos, yPos){

    symbol.symbolDiv.setAttribute('id', `${symbol.symbol}`);
    let symObj = {
        id: symbol.symbol,
        //tvärt om här! för att det ska bli rätt
        x: yPos,
        y: xPos
    };
    let piecesContainer = document.getElementById('pieces-container');
    piecesContainer.appendChild(symbol.symbolDiv);
    symbols.push(symObj);
}


function createSymbolDiv(symbolAsNum, direktion){
    let symbolContainer = document.createElement('div');
    symbolContainer.setAttribute('class', 'symbol');

    let symbol = getSymbol(symbolAsNum, direktion);
    let symbolAsTextnode = document.createTextNode(symbol);
    symbolContainer.appendChild(symbolAsTextnode);
    return {symbolDiv:symbolContainer,symbol:symbol};
}

function getSymbol(symbolAsNum, dir){
    let symbol;
    if (dir === 'y'){
        symbol = symbolAsNum +1; 
    }
    else {
        // Lägg till 65 för att få ASCII-värdet för A om symboleAsNum = 0
        symbol = String.fromCharCode(symbolAsNum + 65); 
    }
    return symbol;
}


//den pjäsen som ska undersökas sickas in
function getGameState(pieceObjCopy){

    let oppKing;
    if (pieceObjCopy.color === 'light'){
        oppKing = getKing('dark');
    }
    else{
        oppKing = getKing('light');
    }
    
    let movesOppKing = getMoves(oppKing);
    let oppKingIsInCheck = false;
    let oppHaveMoves = false;

    //funktionen kollar om "motståndar" kugen är i schack och returnerar en bool
    oppKingIsInCheck = kingInCheck(oppKing);

    //följande block kollar om motständaren kan röra några pjäser
    let oppPieces = getOppositePieces(pieceObjCopy.color);
    for (let i = 0; i<oppPieces.length; i++){

        let tmpMovesOppPieces = getMoves(oppPieces[i]);
        if (tmpMovesOppPieces.length !== 0){
            
            oppHaveMoves = true;
            break;
        }
    }

    let gameState = null;    
    if (!oppHaveMoves && oppKingIsInCheck){
        //gör så att man inte kan röra pjäserna mer
        gameOver = true;
        gameState = 'checkmate';
    }
    else if (!oppHaveMoves && movesOppKing.length === 0){

        gameOver = true;
        gameState = 'stalemate';
    }
    else if (oppKingIsInCheck){
        gameState = 'check';        
    }

    if (gameState === 'stalemate' || gameState === 'checkmate'){

        let oppColor;
        let pieceColor;
        if (pieceObjCopy.color === 'light'){
            pieceColor = 'White';
            oppColor = 'Black';
        }
        else{
            pieceColor = 'Black';
            oppColor = 'White';
        }

        toggleBackgroundsBlur();
        let gameOverPopUp = getGameOverPopUp();
        gameOverPopUp.classList.toggle('invisible');

        let message;
        if (gameState === 'staleMate'){
            message = 'No one won';
        }
        else{
            message = `${pieceColor} won over ${oppColor}`;
        }
        //gör så ett medelande görs med rätt information till gameOverPopUp
        let messageNode = document.createTextNode(message);
        let messageContainer = document.getElementById('end-game-comment');
        messageContainer.appendChild(messageNode);
        let h2 = document.createElement('h2');
        let gameStateTextnode = document.createTextNode(gameState);
        h2.appendChild(gameStateTextnode);
        messageContainer.appendChild(h2);
        
        //jag vill också avtoggla så ingen av gamode knapparna är gröna
        let menu = document.getElementById('menu');
        let singlePlayer = menu.children[0];
        let multiPlayer = menu.children[1];
        if (!singlePlayer.classList.contains('inactive')){
            singlePlayer.classList.toggle('inactive');
        }
        if (!multiPlayer.classList.contains('inactive')){
            multiPlayer.classList.toggle('inactive');
        }
    }
    return gameState;
}

function kingInCheck(king){
    //förjande block kollar om kugen är i schack 
    let myPieces = getOppositePieces(king.color);
    let kingIsInCheck = false;
    for (let i = 0; i<myPieces.length; i++){

        //Hämtar moves utan att räkna in att pjäserna skyddar sina egna.
        //eftersom false sickas med som parameter
        let tmpMovesMyPieces = fetchMoves(myPieces[i], false);

        for (let t = 0; t<tmpMovesMyPieces.length; t++){
            //ser om någon av "mina pjäser" kan gå till motståndarkungen
            if (tmpMovesMyPieces[t].x === king.x && tmpMovesMyPieces[t].y === king.y){
                kingIsInCheck = true;

            }
        }
    }
    return kingIsInCheck; 
}


function positionValid(pieceObj){
    let moves = getMoves(pieceObj);
    let isMoveValid = false;
    
    for(let i = 0; i < moves.length; i++){
        if(xCoords === moves[i].x && yCoords === moves[i].y){

            isMoveValid = true;
        }
    }

    //följande kodblock sitter på en mycket dålig plats
    //men vet inte riktigt vart den passar in
    //den gör så tornen flyttas när man gör rokad
    if (pieceObj.pieceType === 'king'){
        for (let i = 0; i<moves.length; i++){
            if(xCoords === moves[i].x && yCoords === moves[i].y){
                if(moves[i].castleMove){
                    
                    let rook = moves[i].rook;
                    let castleMove = moves[i].castleMove;
                    
                    let rookObj = null;
                    for (let p = 0; p<piecesInformation.length; p++){
                        if (piecesInformation[p].x === rook.x && piecesInformation[p].y === rook.y){        
                            rookObj = piecesInformation[p];
                        }
                    }

                    changePositionOfPiece(castleMove, rookObj);
                    let svgRook = document.getElementById(rookObj.id)
                    svgRook.style = `left:${castleMove.x * squareSize}vw;top:${castleMove.y * squareSize}vw`;
                    
                    changeLastMovedPieceColor(pieceObj.color);
                    return true;
                }
                else {
                    if (isMoveValid){
                        changeLastMovedPieceColor(pieceObj.color);
                    }
                    return isMoveValid; 
                }
            }
        }
    }
    else{
        if (isMoveValid){
            changeLastMovedPieceColor(pieceObj.color);
        }
        return isMoveValid;
    }
}

function resetBoard(){

    let piecesContainer = document.getElementById('pieces-container');
    let pieces = piecesContainer.querySelectorAll('svg');

    removeList(pieces);
    piecesInformation.splice(0, piecesInformation.length);
    drawPieces();

    //tar bort komentarerna
    let textLog = document.getElementById('text-log');
    let messages = textLog.querySelectorAll('div');
    removeList(messages);

    //följande block tar bort den den gammla gameOver commentaren om det finns någon sådan
    //den tar bort elementet och lägger till det igen även om det redan är tommt
    let gameOverComment = document.getElementById('end-game-comment');
    //inte true i cloneNode eftersom jag bara vill ha diven så att säga, och inte inerhåller som ska bort
    let commentContainer = gameOverComment.cloneNode();
    gameOverComment.remove();
    let gameOverPopup = document.getElementById('game-over-pop-up');
    gameOverPopup.insertBefore(commentContainer, gameOverPopup.children[1]);

    gameOver = false;
    changeLastMovedPieceColor(null);
    changeBotColor(null);
    resettBotMadeItsFirstMove();
    resetLightSideDown();
}

function removeList(list){
    for (let i = 0; i<list.length; i++){
        list[i].remove();
    }
}
