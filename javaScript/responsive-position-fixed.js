import { getPieceById } from './pieces.js';
import { symbols } from './board.js';

export {
    squareSize, leftMargin, topMargin, convertPxToVw, positionBoardCenter,
    resizeBoard, setSymbolPosition 
};

let squareSize;
let leftMargin;
let topMargin;
let symbolFontSize;


//körs när storleken ändras
window.addEventListener('resize', function () {

    resizeBoard();
    positionBoardCenter();
});

function resizeBoard() {

    //0.65 eftersom gridarean är 65% width 
    let maxBoardWidth = (window.innerWidth * 0.65) * 0.95;
    let maxBoardHeight = window.innerHeight * 0.95;

    if (maxBoardHeight < maxBoardWidth) {

        symbolFontSize = convertPxToVw(maxBoardHeight) / 20;
        squareSize = (convertPxToVw(maxBoardHeight) - symbolFontSize * 1.75) / 8;
    }
    else {

        symbolFontSize = convertPxToVw(maxBoardWidth) / 20;
        squareSize = (convertPxToVw(maxBoardWidth) - symbolFontSize * 1.75) / 8;
    }

    setSquareSizeAndPosition();
    setSymbolPosition();
    setPiecesPositions();
}


function setSquareSizeAndPosition() {

    let boardBackground = document.getElementById('board-background');
    boardBackground.setAttribute('height', `${squareSize * 8}vw`);
    boardBackground.setAttribute('width', `${squareSize * 8}vw`);

    let squares = document.querySelectorAll('rect');

    let xCoords = 0;
    let yCoords = 0;
    for (let i = 0; i < squares.length; i++) {

        squares[i].setAttributeNS(null, 'height', `${squareSize}vw`);
        squares[i].setAttributeNS(null, 'width', `${squareSize}vw`);

        squares[i].setAttributeNS(null, 'x', `${xCoords}vw`);
        squares[i].setAttributeNS(null, 'y', `${yCoords}vw`);

        //i+1 eftersom jag vill ha 1-64 och inte 0-63
        xCoords += squareSize;
        if ((i + 1) % 8 === 0) {
            xCoords = 0;
            yCoords += squareSize;
        }
    }
}

function setSymbolPosition() {

    let tmpSymbolDiv;

    //det funkar ja..JS är ett konstigt språk. detta var Hannes hitte på med requestAnimationFram
    requestAnimationFrame(() => {
        for (let i = 0; i < symbols.length; i++) {
            tmpSymbolDiv = document.getElementById(symbols[i].id);

            if (symbols[i].y === 8) {

                let spaceToCenter = (squareSize - convertPxToVw(tmpSymbolDiv.clientWidth)) / 2;
                tmpSymbolDiv.style = `
                top:${symbols[i].y * squareSize}vw; 
                left:${(symbols[i].x * squareSize) + spaceToCenter}vw; 
                font-size: ${symbolFontSize}vw;`;
            }
            else {

                let spaceToCenter = (squareSize - convertPxToVw(tmpSymbolDiv.clientHeight)) / 2;
                tmpSymbolDiv.style = `
                top:${(symbols[i].y * squareSize) + spaceToCenter}vw; 
                left:${symbols[i].x * squareSize * 1.01}vw; 
                font-size: ${symbolFontSize}vw;`;
            }
        }
    });
}

function setPiecesPositions() {
    let pieces = document.querySelectorAll('.piece-container');

    let tmpPiece;
    for (let i = 0; i < pieces.length; i++) {

        tmpPiece = getPieceById(pieces[i].id);
        pieces[i].style = `top:${tmpPiece.y * squareSize}vw;left:${tmpPiece.x * squareSize}vw`;
        pieces[i].setAttributeNS(null, 'width', `${squareSize}vw`);
    }
}

function positionBoardCenter() {
    let boardSizeInVw = squareSize * 8;
    let boardSize = convertVwToPx(boardSizeInVw);

    topMargin = convertPxToVw((window.innerHeight - boardSize) / 2);
    //0.65 eftersom gridarean är 65% width    
    let chessAreaWidth = window.innerWidth * 0.65;
    leftMargin = convertPxToVw((chessAreaWidth - boardSize) / 2);

    let boards = document.getElementsByClassName('board');
    for (let i = 0; i < boards.length; i++) {
        boards[i].style = `top:${topMargin}vw;left:${leftMargin}vw;`;
    }
}

function convertPxToVw(px) {
    let vw = ((px / window.innerWidth) * 100);
    return vw;
}

function convertVwToPx(vw) {
    let px = ((vw * 0.01) * window.innerWidth);
    return px;
}