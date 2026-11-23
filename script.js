

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const scoreElement = document.getElementById("score");
const recordElement = document.getElementById("record");
const message = document.getElementById("message");

const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");

const box = 20;
const total = canvas.width / box;

let snake;
let food;
let direction;
let nextDirection;
let score = 0;
let speed = 150;
let gameInterval = null;
let running = false;

let record = Number(localStorage.getItem("snakeRecord")) || 0;

recordElement.textContent = record;

// Reinicia o jogo
function resetGame() {
    snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];

    direction = "RIGHT";
    nextDirection = "RIGHT";

    score = 0;
    speed = 150;

    scoreElement.textContent = score;

    createFood();
    drawGame();
}

// Cria comida aleatória
function createFood() {
    do {
        food = {
            x: Math.floor(Math.random() * total),
            y: Math.floor(Math.random() * total)
        };
    } while (
        snake.some(part =>
            part.x === food.x && part.y === food.y
        )
    );
}

// Desenha o cenário
function drawGame() {
    ctx.fillStyle = "#160a27";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grade
    ctx.strokeStyle = "#ffffff12";
    ctx.lineWidth = 1;

    for (let i = 0; i <= canvas.width; i += box) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
    }

    // Comida roxa
    ctx.fillStyle = "#b44dff";
    ctx.shadowColor = "#d65cff";
    ctx.shadowBlur = 15;

    ctx.beginPath();
    ctx.arc(
        food.x * box + box / 2,
        food.y * box + box / 2,
        box / 2 - 3,
        0,
        Math.PI * 2
    );
    ctx.fill();

    ctx.shadowBlur = 0;

    // Cobrinha rosa
    snake.forEach((part, index) => {
        ctx.fillStyle = index === 0 ? "#ffb3e6" : "#ff55b8";

        ctx.shadowColor = "#ff36b8";
        ctx.shadowBlur = 10;

        ctx.beginPath();
        ctx.roundRect(
            part.x * box + 1,
            part.y * box + 1,
            box - 2,
            box - 2,
            5
        );
        ctx.fill();
    });

    ctx.shadowBlur = 0;
}

// Atualiza a partida
function updateGame() {
    direction = nextDirection;

    const head = { ...snake[0] };

    if (direction === "RIGHT") head.x++;
    if (direction === "LEFT") head.x--;
    if (direction === "UP") head.y--;
    if (direction === "DOWN") head.y++;

    // Colisão com paredes
    if (
        head.x < 0 ||
        head.x >= total ||
        head.y < 0 ||
        head.y >= total
    ) {
        gameOver();
        return;
    }

    const eating = head.x === food.x && head.y === food.y;

    const body = eating ? snake : snake.slice(0, -1);

    // Colisão com o próprio corpo
    if (body.some(part =>
        part.x === head.x && part.y === head.y
    )) {
        gameOver();
        return;
    }

    snake.unshift(head);

    if (eating) {
        score += 10;
        scoreElement.textContent = score;

        createFood();

        if (speed > 55) {
            speed -= 5;

            clearInterval(gameInterval);
            gameInterval = setInterval(updateGame, speed);
        }
    } else {
        snake.pop();
    }

    drawGame();
}

// Inicia o jogo
function startGame() {
    if (running) return;

    resetGame();

    running = true;
    message.style.display = "none";

    gameInterval = setInterval(updateGame, speed);
}

// Finaliza a partida
function gameOver() {
    running = false;
    clearInterval(gameInterval);

    if (score > record) {
        record = score;

        localStorage.setItem("snakeRecord", record);
        recordElement.textContent = record;
    }

    message.innerHTML = `
        <h2>Game Over! 💗</h2>
        <p>Sua pontuação: ${score}</p>
        <button id="playAgain">Jogar novamente</button>
    `;

    message.style.display = "flex";

    document.getElementById("playAgain").addEventListener(
        "click",
        startGame
    );
}

// Controles do teclado
document.addEventListener("keydown", function(event) {
    const keys = {
        ArrowUp: "UP",
        ArrowDown: "DOWN",
        ArrowLeft: "LEFT",
        ArrowRight: "RIGHT"
    };

    const newDirection = keys[event.key];

    if (!newDirection || !running) return;

    event.preventDefault();

    if (
        (newDirection === "UP" && nextDirection !== "DOWN") ||
        (newDirection === "DOWN" && nextDirection !== "UP") ||
        (newDirection === "LEFT" && nextDirection !== "RIGHT") ||
        (newDirection === "RIGHT" && nextDirection !== "LEFT")
    ) {
        nextDirection = newDirection;
    }
});

// Botão de início
startBtn.addEventListener("click", startGame);

// Botão de reinício
restartBtn.addEventListener("click", function() {
    running = false;
    clearInterval(gameInterval);

    resetGame();

    message.innerHTML = `
        <h2>Snake Game 💜</h2>
        <p>Está pronta para jogar?</p>
        <button id="startBtn">Começar jogo</button>
    `;

    message.style.display = "flex";

    document.getElementById("startBtn").addEventListener(
        "click",
        startGame
    );
});

// Preparação inicial
resetGame();
