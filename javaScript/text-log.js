import { getGameState, getSymbol } from './board.js';

export { logToTextbox, logGameState };


//pieceObjCopy, har de ursprungs positionen, pieceObj har nya positionen, dvs dit man flyttat
function logGameState(pieceObjCopy, pieceObj){
    
    let comment = document.createElement('div');

    let pieceCopyColor;
    if (pieceObjCopy.color === 'light'){
        pieceCopyColor = 'White';
    }
    else {
        pieceCopyColor = 'Black';
    }

    let text = document.createTextNode(`${pieceCopyColor} ${pieceObjCopy.pieceType} to 
    ${getSymbol(pieceObj.x, 'x')}${getSymbol(pieceObj.y, 'y')} from ${getSymbol(pieceObjCopy.x, 'x')}${getSymbol(pieceObjCopy.y, 'y')}`);

    comment.appendChild(text);
    
    let gameState = getGameState(pieceObjCopy);
    if (gameState){
        
        let oppColor;
        if (pieceObj.color === 'dark'){
            oppColor = 'White'
        }
        else{
            oppColor = 'Black'
        }
        let br = document.createElement('br');
        comment.appendChild(br);
        let gameStateText = document.createTextNode(gameState);

        comment.appendChild(gameStateText);
    }
    logToTextbox(comment);
}

let heightsToPush = [];

function logToTextbox(comment){

    comment.setAttribute('class', 'comment');
    //för att man inte kan göra clientHeight på element som inte är i htmldocumentet..
    let commentHeight = getElementSize(comment, 'y');
    let space = 10;

    let textLog = document.getElementById('text-log');
    //gör så att komentaren stoppas in övert i text-boxen saken
    textLog.insertBefore(comment, textLog.firstChild);
    
    let comments = document.getElementsByClassName('comment');
    heightsToPush.unshift(-(commentHeight-space));

    for (let i = 0; i<heightsToPush.length; i++){

        //för att varje element ska få rätt förstjutning
        heightsToPush[i] += (commentHeight+space);
    } 
    for (let i = 0; i<comments.length; i++){

        comments[i].style.transform = `translateY(${heightsToPush[i]}px)`;
    }
}

//följande block ger höjden eller widthen an komentaren i variablen "commentHeight"
//beroende på om dir === x eller y
function getElementSize(element, dir){

    let elementCopy = element.cloneNode(true);
    elementCopy.setAttribute('opacity', 0);
    elementCopy.setAttribute('position', 'absolute');
    let elementCopyId = 'tmpElement';
    elementCopy.setAttribute('id', elementCopyId);

    let textLog = document.getElementById('text-log');
    textLog.appendChild(elementCopy);

    let elementHeight
    if (dir === 'y'){

        elementHeight = elementCopy.clientHeight;
    }
    else{
        elementHeight = elementCopy.clientWidth;
    }
    document.getElementById(elementCopyId).remove();
    return elementHeight;
}
