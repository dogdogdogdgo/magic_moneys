import { piecesInformation } from "../pieces.js";

export { getMovesRoyalPieces };

let stopMoves;

function getMovesRoyalPieces(pieceObj, goToMyOwnPieces){

    let moves = [];
    let startX = pieceObj.x;
    let startY = pieceObj.y;
    let possibleSteps = 8;

    if (pieceObj.pieceType === 'king'){
        possibleSteps = 2;
    }
    
    for (let dirX = -1; dirX < 2; dirX++){
        for (let dirY = -1; dirY < 2; dirY++){

            //fråga inte varför den sitter i forlooparna..
            switch (pieceObj.pieceType){
                case 'rook':
                    if ((dirX === 0 && dirY === 0 ) || (dirX !== 0 && dirY !== 0)){
                        continue;
                    }
                break;
                case 'bishop':
                    if ((dirX === 0 && dirY === 0 ) || (dirX === 0 || dirY === 0)){
                        continue;
                    }
                break;   
                case 'queen':
                case 'king':
                    if ((dirX === 0 && dirY === 0 )){
                        continue;
                    }
                break;
            }
            
            for (let steps = 1; steps < possibleSteps; steps++){

                let move = {
                    x: startX + steps * dirX,
                    y: startY + steps * dirY
                };
                
                //så att den inte kan få utanför bordet
                //och så att startpositioenn inte tas med
                if ((move.x <= 7 && move.x >= 0 && move.y <= 7 && move.y >= 0) 
                && !(move.x == startX && move.y == startY)){ 
                    
                    for (let i = 0; i < piecesInformation.length; i++){
                        
                        if (piecesInformation[i].y === move.y && piecesInformation[i].x === move.x){
                            //Följande kod gör så de kan ta pjäser
                            //|| goTOMyOwnPieces gör så att validateMoves algoritmen vet om en pjäs
                            //blir shyddad eller inte, beronde på om kungen ska kunna ta just den pjäsen
                            if (piecesInformation[i].color !== pieceObj.color || goToMyOwnPieces){
                                moves.push(move);
                            }
                            stopMoves = true;
                            break;
                        }
                    }
                    
                    if (stopMoves){
                        stopMoves = false;
                        break;
                    }
                    moves.push(move);
                }   
            }
        }
    }

    if (pieceObj.pieceType === 'king' && !pieceObj.moved){

        let shouldContinue = false;
        let rooks = getRooks(pieceObj.color);
        for (let i = 0; i<rooks.length; i++){

            //kollar enbart om den ska undersöka om man får castla
            //undersöker senare om tornen har flyttats igen
            if (!rooks[i].moved){
                shouldContinue = true;
            }
        }
        
        if (shouldContinue){
            let castleMoves = getCastleMoves(pieceObj, rooks)
            
            for (let c = 0; c<castleMoves.length; c++){
                
                let rook = castleMoves[c].rook;
                let rookHasMoved = true;
                for (let i = 0; i<piecesInformation.length; i++){
                    if (piecesInformation[i].x === rook.x && piecesInformation[i].y === rook.y &&
                        piecesInformation[i].moved === false){
                        rookHasMoved = false;
                        break;
                    }
                }
                if (!rookHasMoved){
                    moves.push(castleMoves[c]);
                }
            }
        }
    }

    return moves;
}


function getCastleMoves(king, rooks){
    let moves = [];

    let freeSquaresWays = getFreeSquares(king, rooks);    
    let ways = getWays(king, rooks);
    let bools = [];
    let result;
    
    for (let w = 0; w<ways.length; w++){
        for (let fw = 0; fw<freeSquaresWays.length; fw++){

            //nu borde den enbart gemföra samma rutor??
            if (freeSquaresWays[fw].length !== ways[w].length){

                if (fw !== w){
    
                    continue;
                }
            }
            
            let tmpBools = bools.slice();
            result = true;
            //eftersom de måste vara lika långa och sådant..
            //de är fortfarande ganska waky..😅
            for (let i = 0; i<ways[w].length; i++){
                
                //denna if saken borde inte behövs, 
                //men det känns inte bra att inte ha den...
                if (freeSquaresWays[w][i]){
                    
                    if (ways[w][i].x === freeSquaresWays[w][i].x && ways[w][i].y === freeSquaresWays[w][i].y){
                        
                        tmpBools.push(true);
                    }
                    else {
                        tmpBools.push(false) 
                    }
                }
            }

            //kolla om bolarna är true här
            for (let i = 0; i<tmpBools.length; i++){

                if (!tmpBools[i]){
                    result = false;
                }
            }

            
            //funkar på båda sidorna
            //snygga till ifsatserna lite innan vedio saken, måste kunna förklara hur skiten funkar också..
            if (result && tmpBools.length === 2 && ways[w].length === 2){
                
                //gör så den också tar med rookPosition
                let rookPosiiton = {
                    //+1 eftersom detta är alltid åt höger
                    x: ways[w][ways[w].length-1].x +1,
                    y: ways[w][0].y
                }; 
                let move = {
                    x: ways[w][1].x,
                    y: ways[w][1].y,
                    castleMove: ways[w][0],
                    rook: rookPosiiton

                };
                moves.push(move);
                //då är det till höger
                //som man göra rockad åt
                
            }
            if (result && tmpBools.length === 3 && ways[w].length === 3){

                let rookPosiiton = {
                    //+1 eftersom detta är alltid åt vänster
                    x: ways[w][ways[w].length-1].x -1,
                    y: ways[w][0].y
                }; 
                let move = {
                    x: ways[w][1].x,
                    y: ways[w][1].y,
                    castleMove: ways[w][0],
                    rook: rookPosiiton
                };
                moves.push(move);
                //dår är det till venster
                // som man gör rockad åt
            }
        }
    }
    return moves;
}

//denna ska gå steg från kungen tills den kommer till någon av tornen
//den ska sedan spara rutorna, och vända, samt göra samma sak igen år andra hållet
function getFreeSquares(king, rooks){
    
    let freeSquares = [];
    let freeSquaresWays = [];
    
    //så den vet vilka ruten den ska kolla om de är lediga
    let ways = getWays(king, rooks);

    let addFreeSquare = true;

    for (let w = 0; w<ways.length; w++){
        for (let i = 0; i<ways[w].length; i++){

            //bara en dag efter
            //är det nästan som att titta på grekiska...
            for (let p = 0; p<piecesInformation.length; p++){

                if (ways[w][i].x === piecesInformation[p].x && ways[w][i].y === piecesInformation[p].y){
                    
                    addFreeSquare = false;
                    break;
                }
            }  
            if (addFreeSquare){

                let freeSquare = {
                    x: ways[w][i].x,
                    y: ways[w][i].y
                };
                freeSquares.push(freeSquare);
            }
            else {
                addFreeSquare = true;
            }
        }
        freeSquaresWays.push(freeSquares);
        freeSquares = [];
    }
    return freeSquaresWays;
}

//get vägarna från kunge till tornen
function getWays(king, rooks){
    let squares = [];
    let ways = []; 
    
    for (let i = 0; i<rooks.length; i++){
        for (let dir = -1; dir<2; dir+=2){

            //hur gör man för att undervika refärenstyperna här?
            //man använder slice
            let tmpSquares = squares.slice();
            let tmpX;
            for (let steps = 1; steps <= 4; steps++){
                
                tmpX = king.x;
                tmpX = tmpX + (steps * dir);
                let tmpSquare = {
                    x: tmpX,
                    y: king.y
                };
                
                if (tmpX === rooks[i].x){
                    ways.push(tmpSquares);
                    break;
                    
                }
                tmpSquares.push(tmpSquare);
            }     
        }
    }
    
    return ways;
}

function getRooks(color){
    let rooks = [];
    for (let i = 0; i<piecesInformation.length; i++){
        if (piecesInformation[i].pieceType === 'rook' && piecesInformation[i].color === color){
            rooks.push(piecesInformation[i]);
        }
    }
    return rooks;
}

