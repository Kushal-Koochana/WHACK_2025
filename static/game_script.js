const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('highScore');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const gameOverModal = document.getElementById('gameOverModal');
const creditInfoModal = document.getElementById("creditInfoModal");
 
const gridSize = 20;
const tileCountX = canvas.width / gridSize;
const tileCountY = canvas.height / gridSize;
 
let snake = [{ x: 10, y: 10 }];
let food = [];
let goodfoodTypes = ["onTimePayment", "lowCreditUtilisation", "carLoans", "debtPayoff"];
let badfoodTypes = ["missedPayment", "highCreditUtilisation", "default", "newCredit"];
let discoveredFood = [];
let goodFood = 0;
let badFood = 0;
let foodCap = 5;
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let score = 0;
let highScore = 0;
let isLoggedIn = false;
let gameRunning = false;
let gamePaused = false;
let gameLoop;
let foodSpawnInterval;

async function loadHighScore() {
    try {
        const response = await fetch('/api/snake/high');
        const data = await response.json();
        isLoggedIn = !!data.logged_in;
        if (isLoggedIn) {
            // Trust the server's value even if it's genuinely 0 (fresh account / cleared DB).
            highScore = data.high_score;
        } else {
            // Guest: fall back to this browser's local copy.
            highScore = localStorage ? parseInt(localStorage.getItem('snakeHighScore') || '0') : 0;
        }
    } catch (e) {
        console.warn("Falling back to local storage.", e);
        isLoggedIn = false;
        highScore = localStorage ? parseInt(localStorage.getItem('snakeHighScore') || '0') : 0;
    }
    highScoreEl.textContent = highScore;
}
 
async function saveSnakeScore(scoreValue) {
    try {
        await fetch('/api/snake', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ score: scoreValue })
        });
    } catch (e) {
        console.error("Local sync only.", e);
    }
}
 
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}
 
function generateFood() {
    let newFoodType;
    if (goodFood !== foodCap && badFood !== foodCap) {
        let randomVar = Math.random();
        if (randomVar < 0.5) {
            newFoodType = badfoodTypes[getRandomInt(badfoodTypes.length)];
            badFood++;
        } else {
            newFoodType = goodfoodTypes[getRandomInt(goodfoodTypes.length)];
            goodFood++;
        }
    } else if (goodFood !== foodCap) {
        newFoodType = goodfoodTypes[getRandomInt(goodfoodTypes.length)];
        goodFood++;
    } else if (badFood !== foodCap) {
        newFoodType = badfoodTypes[getRandomInt(badfoodTypes.length)];
        badFood++;
    } else {
        return;
    }
 
    let newFood = {
        x: Math.floor(Math.random() * tileCountX),
        y: Math.floor(Math.random() * tileCountY),
        foodType: newFoodType
    };
    for (let segment of snake) {
        if (segment.x === newFood.x && segment.y === newFood.y) {
            generateFood();
            return;
        }
    }
    for (let foodItem of food) {
        if (foodItem.x === newFood.x && foodItem.y === newFood.y) {
            generateFood();
            return;
        }
    }
    food.push(newFood);
}
 
function update() {
    if (gamePaused) return;
 
    direction = nextDirection;
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
 
    if (head.x < 0 || head.x >= tileCountX || head.y < 0 || head.y >= tileCountY) {
        endGame();
        return;
    }
 
    for (let segment of snake) {
        if (head.x === segment.x && head.y === segment.y) {
            endGame();
            return;
        }
    }
 
    snake.unshift(head);
 
    for (let foodItem of food) {
        if (head.x === foodItem.x && head.y === foodItem.y) {
            if (foodItem.foodType === "carLoans") {
                score += 10;
                goodFood--;
                if (!discoveredFood.includes("carLoans")) {
                    discoveredFood.push("carLoans");
                    document.getElementById("creditInfoTitle").textContent = "Car Loans";
                    document.getElementById("creditInfoDetail").textContent = "Taking out a car loan and making timely payments positively impacts your credit mix.";
                    creditInfoModal.className = "credit-info modal-good show";
                    gamePaused = true;
                }
            }
            if (foodItem.foodType === "lowCreditUtilisation") {
                score += 15;
                goodFood--;
                if (!discoveredFood.includes("lowCreditUtilisation")) {
                    discoveredFood.push("lowCreditUtilisation");
                    document.getElementById("creditInfoTitle").textContent = "Low Credit Utilisation";
                    document.getElementById("creditInfoDetail").textContent = "Keeping balances below 30% of your limit is optimal for maintaining high scores.";
                    creditInfoModal.className = "credit-info modal-good show";
                    gamePaused = true;
                }
            }
            if (foodItem.foodType === "onTimePayment") {
                score += 20;
                goodFood--;
                if (!discoveredFood.includes("onTimePayment")) {
                    discoveredFood.push("onTimePayment");
                    document.getElementById("creditInfoTitle").textContent = "On-Time Payments";
                    document.getElementById("creditInfoDetail").textContent = "Consistently paying on time is the single largest factor in credit health.";
                    creditInfoModal.className = "credit-info modal-good show";
                    gamePaused = true;
                }
            }
            if (foodItem.foodType === "debtPayoff") {
                score += 25;
                goodFood--;
                if (!discoveredFood.includes("debtPayoff")) {
                    discoveredFood.push("debtPayoff");
                    document.getElementById("creditInfoTitle").textContent = "Debt Payoff";
                    document.getElementById("creditInfoDetail").textContent = "Eliminating existing outstanding balances boosts available limits.";
                    creditInfoModal.className = "credit-info modal-good show";
                    gamePaused = true;
                }
            }
            if (foodItem.foodType === "missedPayment") {
                score -= 30;
                badFood--;
                if (!discoveredFood.includes("missedPayment")) {
                    discoveredFood.push("missedPayment");
                    document.getElementById("creditInfoTitle").textContent = "Missed Payment";
                    document.getElementById("creditInfoDetail").textContent = "Missing payments remains on your file as a structural default risk for years.";
                    creditInfoModal.className = "credit-info modal-bad show";
                    gamePaused = true;
                }
            }
            if (foodItem.foodType === "highCreditUtilisation") {
                score -= 25;
                badFood--;
                if (!discoveredFood.includes("highCreditUtilisation")) {
                    discoveredFood.push("highCreditUtilisation");
                    document.getElementById("creditInfoTitle").textContent = "High Credit Utilisation";
                    document.getElementById("creditInfoDetail").textContent = "Maxing out credit lines signals potential stress to underwriters.";
                    creditInfoModal.className = "credit-info modal-bad show";
                    gamePaused = true;
                }
            }
            if (foodItem.foodType === "default") {
                score -= 50;
                badFood--;
                if (!discoveredFood.includes("default")) {
                    discoveredFood.push("default");
                    document.getElementById("creditInfoTitle").textContent = "Loan Default";
                    document.getElementById("creditInfoDetail").textContent = "Defaulting severely damages your file, indicating structural insolvency.";
                    creditInfoModal.className = "credit-info modal-bad show";
                    gamePaused = true;
                }
            }
            if (foodItem.foodType === "newCredit") {
                score -= 10;
                badFood--;
                if (!discoveredFood.includes("newCredit")) {
                    discoveredFood.push("newCredit");
                    document.getElementById("creditInfoTitle").textContent = "New Credit Inquiries";
                    document.getElementById("creditInfoDetail").textContent = "Opening multiple accounts rapidly causes temporary rating dips.";
                    creditInfoModal.className = "credit-info modal-bad show";
                    gamePaused = true;
                }
            }
 
            scoreEl.textContent = score;
            food.splice(food.indexOf(foodItem), 1);
            return;
        }
    }
    snake.pop();
}
 
function draw() {
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
 
    let image;
    for (let foodItem of food) {
        image = document.getElementById(foodItem.foodType);
        if (image) {
            ctx.drawImage(image, foodItem.x * gridSize + 1, foodItem.y * gridSize + 1, gridSize - 2, gridSize - 2);
        }
    }
 
    for (let i = 0; i < snake.length; i++) {
        const segment = snake[i];
        const opacity = 1 - (i / snake.length) * 0.3;
        ctx.fillStyle = '#4ade80';
        ctx.globalAlpha = opacity;
        ctx.fillRect(segment.x * gridSize + 1, segment.y * gridSize + 1, gridSize - 2, gridSize - 2);
    }
    ctx.globalAlpha = 1;
 
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2;
    for (let segment of snake) {
        ctx.strokeRect(segment.x * gridSize + 1, segment.y * gridSize + 1, gridSize - 2, gridSize - 2);
    }
}
 
function startFoodSpawner() {
    clearInterval(foodSpawnInterval);
    foodSpawnInterval = setInterval(() => {
        if (gameRunning && !gamePaused) {
            generateFood();
        }
    }, 2000);
}
 
function stopFoodSpawner() {
    clearInterval(foodSpawnInterval);
}
 
function startGame() {
    if (gameRunning) return;
    gameRunning = true;
    gamePaused = false;
    clearInterval(gameLoop);
    gameLoop = setInterval(() => {
        update();
        draw();
    }, 150);
    startFoodSpawner();
}
 
async function endGame() {
    gameRunning = false;
    gamePaused = false;
    clearInterval(gameLoop);
    stopFoodSpawner();

    if (score > highScore) {
        highScore = score;
        highScoreEl.textContent = highScore;
        if (isLoggedIn) {
            // Persist per-user to the backend. Deliberately NOT written to
            // localStorage here, so a logged-in user's score can never leak
            // into another (guest) session sharing this browser.
            await saveSnakeScore(highScore);
        } else if (localStorage) {
            // Guest: keep a local-only fallback.
            localStorage.setItem('snakeHighScore', highScore);
        }
    }

    document.getElementById('finalScore').textContent = `Score: ${score}`;
    gameOverModal.classList.add('show');
}
 
function resetGame() {
    snake = [{ x: 10, y: 10 }];
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    food = [];
    goodFood = 0;
    badFood = 0;
    discoveredFood = [];
    score = 0;
    gameRunning = false;
    gamePaused = false;
    scoreEl.textContent = score;
    clearInterval(gameLoop);
    stopFoodSpawner();
    generateFood();
    draw();
    gameOverModal.classList.remove('show');
}
 
document.addEventListener('keydown', (e) => {
    if (e.key === ' ') {
        e.preventDefault();
        if (gameRunning) gamePaused = !gamePaused;
        return;
    }
 
    const key = e.key.toLowerCase();
    if (key === 'arrowup' || key === 'w') {
        if (direction.y === 0) nextDirection = { x: 0, y: -1 };
    } else if (key === 'arrowdown' || key === 's') {
        if (direction.y === 0) nextDirection = { x: 0, y: 1 };
    } else if (key === 'arrowleft' || key === 'a') {
        if (direction.x === 0) nextDirection = { x: -1, y: 0 };
    } else if (key === 'arrowright' || key === 'd') {
        if (direction.x === 0) nextDirection = { x: 1, y: 0 };
    }
});
 
function resume() {
    creditInfoModal.classList.remove("show");
    gamePaused = false;
}
 
startBtn.addEventListener('click', () => {
    startGame();
});
 
resetBtn.addEventListener('click', () => {
    resetGame();
});
 
generateFood();
draw();
loadHighScore();