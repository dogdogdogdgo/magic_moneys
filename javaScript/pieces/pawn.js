import { piecesInformation } from "../pieces.js";
import { lightSideDown } from "../judge.js";

export { getMovesPawn };


function getMovesPawn(pieceObj, goToMyOwnPieces){

    let moves = [];
    let stopMoves;
    let dirY;
    let startX = pieceObj.x;
    let startY = pieceObj.y;
    let possibleSteps = 2;
    
    if (lightSideDown){
        //gör så att pjäserna kan gå två steg i början
        if ((pieceObj.y === 6 && pieceObj.color === 'light') || (pieceObj.y === 1 && pieceObj.color === 'dark')){
            possibleSteps = 3;
        }

        if (pieceObj.color === 'dark'){
            dirY = 1;
        }
        else {
            dirY = -1;
        }
    }
    else {
        //gör så att pjäserna kan gå två steg i början
        if ((pieceObj.y === 6 && pieceObj.color === 'dark') || (pieceObj.y === 1 && pieceObj.color === 'light')){
            possibleSteps = 3;
        }

        if (pieceObj.color === 'dark'){
            dirY = -1;
        }
        else {
            dirY = 1;
        }
    }
    
    
    for (let dirX = -1; dirX < 2; dirX++){
        for (let steps = 1; steps < possibleSteps; steps++){

            let move = {
                x: startX + dirX,
                y: startY + (dirY * steps)
            };
            if ((move.x <= 7 && move.x >= 0 && move.y <= 7 && move.y >= 0) && 
            //detta kanske kan tas bort eftersom steps startar på 1 här
            !(move.x === startX && move.y === startY)){

                //så att den lägger till det movet rakt fram
                if (dirX === 0){ 
                    
                    for (let i = 0; i < piecesInformation.length; i++){
                        if (move.y === piecesInformation[i].y && move.x === piecesInformation[i].x){
                            stopMoves = true;
                            break;
                        }
                    }
                    if (stopMoves){
                        stopMoves = false;
                        break;
                    }//de funkar tror jag hihihi!!!
                    moves.push(move);
                    continue;
                }
                // så att den inte gör flera moves åt sidorna vid början när den kan gå två steg
                if (steps !== 1){
                    continue;
                }
                
                //kollar om det sitter pjäer på sidorna som den kan ta, och isf lägger till det movet
                //|| goTOMyOwnPieces gör så att validateMoves algoritmen vet om en pjäs
                //blir shyddad eller inte, beronde på om kungen ska kunna ta just den pjäsen
                for (let i = 0; i < piecesInformation.length; i++){
                    if ((move.x === piecesInformation[i].x && move.y === piecesInformation[i].y) 
                    && pieceObj.color !== piecesInformation[i].color || goToMyOwnPieces){ 
                        
                        moves.push(move);
                    }
                }
            }
        } 
    }

    return moves;
}