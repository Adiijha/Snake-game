//To Select the elements
const gameBoard = document.querySelector('.board-grid');
const scoreBoard = document.querySelector('.score');
const highScoreBoard = document.querySelector('.b-score');
const controller = document.querySelectorAll('.controller i');
const scoreForm = document.querySelector('#score-form');
const leaderboard = document.querySelector('#leaderboard');

//To declare the variables
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

//To randomize the food position
const changeFoodPosition = () => {
    foodX = Math.floor(Math.random() * 15) + 1;
    foodY = Math.floor(Math.random() * 15) + 1;
};

//To change the direction of the snake
const changeDirection = (event) => {
    let key = event.key || event.target.dataset.key;
    console.log(`Key pressed: ${key}`);
    if (key === 'ArrowUp' && velocityY !== 1) {
        velocityX = 0;
        velocityY = -1;
    }
    if (key === 'ArrowDown' && velocityY !== -1) {
        velocityX = 0;
        velocityY = 1;
    }
    if (key === 'ArrowLeft' && velocityX !== 1) {
        velocityX = -1;
        velocityY = 0;
    }
    if (key === 'ArrowRight' && velocityX !== -1) {
        velocityX = 1;
        velocityY = 0;
    }
};

//To change the direction of the snake with buttons
controller.forEach(key => {
    key.addEventListener("click", changeDirection);
});

document.addEventListener('keydown', (event) => {
    if (!gameOver) {
        changeDirection(event);
        initGame();
    }
});


//To Game Over Function
const handleGameOver = () => {
    clearInterval(setIntervalID);
    alert('Game Over. Press OK to restart');
    if (score === 0) {
        window.location.reload();
    } else {
        scoreForm.style.display = 'block';
        scoreForm.addEventListener('submit', submitScore);
       
    }
};


let playerName = '';

//To submit the score
const submitScore = (event) => {
    event.preventDefault();
    const nameInput = document.getElementById('name');
    playerName = nameInput.value;

    if (playerName) {
        fetch('/api/score', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: playerName, score }),
        })
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
                scoreForm.style.display = 'none';
                displayLeaderboard();
                window.location.reload();
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }
};

scoreForm.addEventListener('submit', submitScore);

document.addEventListener('keydown', (event) => {
    if (!gameOver) {
        changeDirection(event);
        initGame();
    }
});

//To display the leaderboard
const displayLeaderboard = () => {
    fetch('/api/leaderboard')
        .then(response => response.json())
        .then(data => {

            data.sort((a, b) => b.score - a.score);


            const maxEntries = window.innerWidth < 768 ? 5 : 10;


            let leaderboardHTML = '<span>🏆 Leaderboard 🏆</span><ol>';
            for (let i = 0; i < Math.min(maxEntries, data.length); i++) {
                let trophyEmoji = '';
                switch (i) {
                    case 0:
                        trophyEmoji = '🥇';
                        break;
                    case 1:
                        trophyEmoji = '🥈';
                        break;
                    case 2:
                        trophyEmoji = '🥉';
                        break;
                    default:
                        trophyEmoji = '';
                }
                leaderboardHTML += `<li class="player-name">${trophyEmoji} ${data[i].name} : ${data[i].score}</li>`;
            }
            leaderboardHTML += '</ol>';


            document.getElementById('leaderboard').innerHTML = leaderboardHTML;
        })
        .catch(error => console.error('Error fetching leaderboard:', error));
};

document.addEventListener('DOMContentLoaded', displayLeaderboard);


//To get the snake image
const getSnakeImage = (index, segment) => {
    let prevSegment = index > 0 ? snakeBody[index - 1] : null;
    let nextSegment = index < snakeBody.length - 1 ? snakeBody[index + 1] : null;

    if (index === 0) {
        if (velocityX === 1) return 'head_right.png';
        if (velocityX === -1) return 'head_left.png';
        if (velocityY === 1) return 'head_down.png';
        if (velocityY === -1) return 'head_up.png';
    }
    else if (index === snakeBody.length - 1) {
        if (prevSegment[0] < segment[0]) return 'tail_right.png';
        if (prevSegment[0] > segment[0]) return 'tail_left.png';
        if (prevSegment[1] < segment[1]) return 'tail_down.png';
        if (prevSegment[1] > segment[1]) return 'tail_up.png';
    }
    else {
        if (prevSegment[0] === segment[0] && nextSegment[0] === segment[0]) {
            return 'body_vertical.png';
        }
        if (prevSegment[1] === segment[1] && nextSegment[1] === segment[1]) {
            return 'body_horizontal.png';
        }

        if (prevSegment[0] < segment[0] && nextSegment[1] < segment[1]) {
            return 'body_bottomright.png';
        }
        if (prevSegment[0] < segment[0] && nextSegment[1] > segment[1]) {
            return 'body_topright.png';
        }
        if (prevSegment[0] > segment[0] && nextSegment[1] < segment[1]) {
            return 'body_bottomleft.png';
        }
        if (prevSegment[0] > segment[0] && nextSegment[1] > segment[1]) {
            return 'body_topleft.png';
        }
    }

    return 'body_horizontal.png';
};

//Main Function
const initGame = () => {
    if (gameOver) {
        return handleGameOver();
    }
    let htmlMarkup = `<div class="food" style="grid-area: ${foodY} / ${foodX}"></div>`;
    snakeX += velocityX;
    snakeY += velocityY;

    if (snakeX === foodX && snakeY === foodY) {
        changeFoodPosition();
        snakeBody.push([foodX, foodY]);
        score++;
        highScore = score >= highScore ? score : highScore;
        localStorage.setItem('b-score', highScore);
        scoreBoard.innerText = `Score : ${score}`;
        highScoreBoard.innerText = `High Score : ${highScore}`;
    }

    for (let i = snakeBody.length - 1; i > 0; i--) {
        snakeBody[i] = snakeBody[i - 1];
    }
    snakeBody[0] = [snakeX, snakeY];

    for (let i = 0; i < snakeBody.length; i++) {
        htmlMarkup += `<div class="snake" style="grid-area: ${snakeBody[i][1]} / ${snakeBody[i][0]}; background-image: url('Graphics/${getSnakeImage(i, snakeBody[i])}')"></div>`;
        if (i !== 0 && snakeBody[0][1] === snakeBody[i][1] && snakeBody[0][0] === snakeBody[i][0]) {
            gameOver = true;
        }
    }

    if (snakeX < 1 || snakeX > 15 || snakeY < 1 || snakeY > 15) {
        gameOver = true;
    }

    gameBoard.innerHTML = htmlMarkup;
};


//Function to start the game
changeFoodPosition();
setIntervalID = setInterval(initGame, 150);
initGame();
document.addEventListener('keydown', changeDirection);


