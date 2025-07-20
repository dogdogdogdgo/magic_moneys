import { piecesInformation } from '../pieces.js';

export { getMovesKnight };


function getMovesKnight(pieceObj, goToMyOwnPieces){
    let moves = [];

    let startX = pieceObj.x;
    let startY = pieceObj.y;
    

    for (let dirX = -1; dirX < 2; dirX++){
        for (let dirY = -1; dirY < 2; dirY++){
            if ((dirX === 0 && dirY === 0 ) || (dirX !== 0 && dirY !== 0)){
                continue;
            }
            for (let steps = -1; steps < 2; steps+=2){ 
                
                let move = {
                    x: startX + dirX * 2,
                    y: startY + dirY * 2
                };

                if (dirX === 0){
                    move.x = move.x + steps;
                }
                else if (dirY === 0){
                    move.y = move.y + steps;
                } 
  
                if ((move.x <= 7 && move.x >= 0 && move.y <= 7 && move.y >= 0) 
                && !(move.x === startX && move.y === startY)){
                    moves.push(move);
                }
            }
        }
    }

    for (let p = 0; p < piecesInformation.length; p++){
        for(let m = 0; m < moves.length; m++){

            //går så att det går bestämma med en parameter om man kan gå till sina egna pjäser
            if (!goToMyOwnPieces){

                //tar bort de moves som ligger på sina egna pjäser
                //fråga inte varför jag gjorde på detta sättet med hästarna...
                if (moves[m].y === piecesInformation[p].y
                    && moves[m].x === piecesInformation[p].x 
                    && piecesInformation[p].color === pieceObj.color){ 
                        
                        moves.splice(m, 1);    
                        m--;
                }
            }
        }
    }
    return moves;
}