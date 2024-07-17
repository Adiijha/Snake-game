
const gameBoard = document.querySelector('.board-grid');
const scoreBoard = document.querySelector('.score');
const highScoreBoard = document.querySelector('.b-score');
const controller = document.querySelectorAll('.controller i');

let gameOver = false;
let setIntervalID;
let score = 0;
let highScore = localStorage.getItem('b-score') || 0;
highScoreBoard.innerText = `High Score : ${highScore}`;

let foodX = 13;
let foodY = 10;

let snakeX = 4;
let snakeY = 3;
let snakeBody = [];


let velocityX = 0;
let velocityY = 0;

const changeFoodPosition = () => {
    foodX = Math.floor(Math.random() * 15) + 1;
    foodY = Math.floor(Math.random() * 15) + 1;

}

const  changeDirection=(e)=>{
    if(e.key === 'ArrowUp' && velocityY != 1){
        velocityX = 0;
        velocityY = -1;
        
    }
    if(e.key === 'ArrowDown' && velocityY != -1){
        velocityX = 0;
        velocityY = 1;
    }
    if(e.key === 'ArrowLeft' && velocityX != 1){
        velocityX = -1;
        velocityY = 0;
    }
    if(e.key === 'ArrowRight' && velocityX != -1){
        velocityX = 1;
        velocityY = 0;
    }  
    initGame();
 
}

controller.forEach(key => {
    key.addEventListener("click", ()=> changeDirection({key : key.dataset.key})) ;
});

const handleGameOver = () => {
    clearInterval(setIntervalID);
    alert('Game Over Press OK to restart');
    location.reload();
}


const getSnakeImage = (index, segment) => {
    let prevSegment = index > 0 ? snakeBody[index - 1] : null;
    let nextSegment = index < snakeBody.length - 1 ? snakeBody[index + 1] : null;

    if (index === 0) { // Head
        if (velocityX === 1) return 'head_right.png';
        if (velocityX === -1) return 'head_left.png';
        if (velocityY === 1) return 'head_down.png';
        if (velocityY === -1) return 'head_up.png';
    } else if (index === snakeBody.length - 1) { // Tail
        if (prevSegment[0] < segment[0]) return 'tail_right.png';
        if (prevSegment[0] > segment[0]) return 'tail_left.png';
        if (prevSegment[1] < segment[1]) return 'tail_down.png';
        if (prevSegment[1] > segment[1]) return 'tail_up.png';
    } else { // Body
        if (prevSegment[0] === segment[0] && nextSegment[0] === segment[0]) {
            return 'body_vertical.png';  // Straight vertical
        }
        if (prevSegment[1] === segment[1] && nextSegment[1] === segment[1]) {
            return 'body_horizontal.png';  // Straight horizontal
        }

        // Check for corners
        if (prevSegment[0] < segment[0] && nextSegment[1] < segment[1]) {
            return 'body_bottomright.png';  // Top-right corner
        }
        if (prevSegment[0] < segment[0] && nextSegment[1] > segment[1]) {
            return 'body_topright.png';  // Bottom-right corner
        }
        if (prevSegment[0] > segment[0] && nextSegment[1] < segment[1]) {
            return 'body_bottomleft.png';  // Top-left corner
        }
        if (prevSegment[0] > segment[0] && nextSegment[1] > segment[1]) {
            return 'body_topleft.png';  // Bottom-left corner
        }
    }

    return 'body_horizontal.png';  // Default image for any unmatched case
}



const initGame=()=>{
    if(gameOver){
        return handleGameOver();
    }
    let htmlMarkup = `<div class="food" style="grid-area: ${foodY} / ${foodX}"></div>`;
    // htmlMarkup += `
    //     <div class="snake" style="grid-area: 4 / ${snakeTail};"></div>
    //     <div class="snake" style="grid-area: 4 / ${snakeBody};"></div>
    //     <div class="snake" style="grid-area: 4 / ${snakeHead};"></div>
    // `;
    snakeX += velocityX;
    snakeY += velocityY;

    if(snakeX === foodX && snakeY === foodY){
        changeFoodPosition();
        snakeBody.push([ foodX,foodY]);
        score++;
        
        highScore = score >= highScore ? score : highScore;
        localStorage.setItem('b-score', highScore);
        
        scoreBoard.innerText = `Score : ${score}`;
        highScoreBoard.innerText = `High Score : ${highScore}`;
    }

    
    for (let i = snakeBody.length - 1; i > 0; i--) {
        snakeBody[i] = snakeBody[i - 1];
        
    }
    snakeBody[0]=[snakeX,snakeY];
    
    for(let i = 0; i < snakeBody.length; i++){
        htmlMarkup += `<div class="snake" style="grid-area: ${snakeBody[i][1]} / ${snakeBody[i][0]}; background-image: url('Graphics/${getSnakeImage(i, snakeBody[i])}')"></div>`;
        if(i!== 0 && snakeBody[0][1] === snakeBody[i][1] && snakeBody[0][0] === snakeBody[i][0]){
                gameOver = true;
            }
    }

    if(snakeX < 1 || snakeX > 15 || snakeY < 1 || snakeY > 15){
        gameOver = true;
    }


    gameBoard.innerHTML = htmlMarkup;
}



changeFoodPosition();
setIntervalID = setInterval(initGame,150);
initGame();



document.addEventListener('keydown',changeDirection);
