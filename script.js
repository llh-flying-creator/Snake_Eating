// 游戏常量
const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SPEED = 150;
const SPEED_INCREASE = 5;

// 游戏变量
let canvas;
let ctx;
let snake;
let food;
let direction;
let nextDirection;
let score;
let highScore;
let gameSpeed;
let gameLoopId;
let isPaused;
let isGameOver;

// DOM 元素
let scoreElement;
let highScoreElement;
let startButton;
let pauseButton;
let restartButton;
let gameMessage;

// 初始化游戏
function initGame() {
    // 获取DOM元素
    canvas = document.getElementById('game-board');
    ctx = canvas.getContext('2d');
    scoreElement = document.getElementById('score');
    highScoreElement = document.getElementById('high-score');
    startButton = document.getElementById('start-btn');
    pauseButton = document.getElementById('pause-btn');
    restartButton = document.getElementById('restart-btn');
    gameMessage = document.getElementById('game-message');

    // 设置画布尺寸
    canvas.width = GRID_SIZE * CELL_SIZE;
    canvas.height = GRID_SIZE * CELL_SIZE;

    // 加载最高分
    highScore = localStorage.getItem('snakeHighScore') || 0;
    highScoreElement.textContent = highScore;

    // 添加事件监听器
    document.addEventListener('keydown', handleKeyPress);
    startButton.addEventListener('click', startGame);
    pauseButton.addEventListener('click', togglePause);
    restartButton.addEventListener('click', restartGame);

    // 初始化游戏状态
    resetGameState();
    drawGame();
}

// 重置游戏状态
function resetGameState() {
    // 初始化蛇
    snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];

    direction = 'right';
    nextDirection = 'right';
    score = 0;
    gameSpeed = INITIAL_SPEED;
    isPaused = false;
    isGameOver = true;

    // 更新分数显示
    scoreElement.textContent = score;
    gameMessage.textContent = '按开始按钮开始游戏';

    // 生成食物
    generateFood();
}

// 开始游戏
function startGame() {
    if (isGameOver) {
        resetGameState();
        isGameOver = false;
        gameMessage.textContent = '';
        gameLoop();
    } else if (isPaused) {
        isPaused = false;
        gameMessage.textContent = '';
        gameLoop();
    }
}

// 暂停游戏
function togglePause() {
    if (isGameOver) return;

    isPaused = !isPaused;
    if (isPaused) {
        clearInterval(gameLoopId);
        gameMessage.textContent = '游戏已暂停';
    } else {
        gameLoop();
        gameMessage.textContent = '';
    }
}

// 重新开始游戏
function restartGame() {
    clearInterval(gameLoopId);
    resetGameState();
    drawGame();
}

// 处理键盘输入
function handleKeyPress(e) {
    // 防止游戏结束时控制
    if (isGameOver) return;

    // 根据按键设置下一个方向
    switch (e.key) {
        case 'ArrowUp':
            if (direction !== 'down')
                nextDirection = 'up';
            break;
        case 'ArrowDown':
            if (direction !== 'up')
                nextDirection = 'down';
            break;
        case 'ArrowLeft':
            if (direction !== 'right')
                nextDirection = 'left';
            break;
        case 'ArrowRight':
            if (direction !== 'left')
                nextDirection = 'right';
            break;
        case ' ': // 空格键暂停/继续
            togglePause();
            break;
        case 'Enter': // 回车键开始/重新开始
            if (isGameOver)
                startGame();
            break;
    }
}

// 生成食物
function generateFood() {
    let newFood;
    let onSnake;

    // 确保食物不会生成在蛇身上
    do {
        onSnake = false;
        newFood = {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE)
        };

        // 检查是否在蛇身上
        for (let segment of snake) {
            if (segment.x === newFood.x && segment.y === newFood.y) {
                onSnake = true;
                break;
            }
        }
    } while (onSnake);

    food = newFood;
}

// 移动蛇
function moveSnake() {
    // 更新方向
    direction = nextDirection;

    // 获取蛇头
    const head = { ...snake[0] };

    // 根据方向移动蛇头
    switch (direction) {
        case 'up':
            head.y--;
            break;
        case 'down':
            head.y++;
            break;
        case 'left':
            head.x--;
            break;
        case 'right':
            head.x++;
            break;
    }

    // 添加新头部
    snake.unshift(head);

    // 检查是否吃到食物
    if (head.x === food.x && head.y === food.y) {
        // 增加分数
        score += 10;
        scoreElement.textContent = score;

        // 更新最高分
        if (score > highScore) {
            highScore = score;
            highScoreElement.textContent = highScore;
            localStorage.setItem('snakeHighScore', highScore);
        }

        // 生成新食物
        generateFood();

        // 增加游戏速度
        gameSpeed = Math.max(50, gameSpeed - SPEED_INCREASE);

        // 重新启动游戏循环以更新速度
        clearInterval(gameLoopId);
        gameLoop();
    } else {
        // 移除尾部
        snake.pop();
    }
}

// 检查碰撞
function checkCollision() {
    const head = snake[0];

    // 检查边界碰撞
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        return true;
    }

    // 检查自身碰撞
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }

    return false;
}

// 绘制游戏
function drawGame() {
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制网格
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= GRID_SIZE; i++) {
        // 水平线
        ctx.beginPath();
        ctx.moveTo(0, i * CELL_SIZE);
        ctx.lineTo(canvas.width, i * CELL_SIZE);
        ctx.stroke();

        // 垂直线
        ctx.beginPath();
        ctx.moveTo(i * CELL_SIZE, 0);
        ctx.lineTo(i * CELL_SIZE, canvas.height);
        ctx.stroke();
    }

    // 绘制蛇
    snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? '#4CAF50' : '#8BC34A';
        ctx.fillRect(segment.x * CELL_SIZE, segment.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);

        // 绘制蛇的边框
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.strokeRect(segment.x * CELL_SIZE, segment.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);

        // 绘制蛇头眼睛
        if (index === 0) {
            ctx.fillStyle = 'white';
            const eyeSize = CELL_SIZE / 5;
            const eyeOffset = CELL_SIZE / 4;

            if (direction === 'right') {
                ctx.fillRect(segment.x * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize, segment.y * CELL_SIZE + eyeOffset, eyeSize, eyeSize);
                ctx.fillRect(segment.x * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize, segment.y * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize, eyeSize, eyeSize);
            } else if (direction === 'left') {
                ctx.fillRect(segment.x * CELL_SIZE + eyeOffset, segment.y * CELL_SIZE + eyeOffset, eyeSize, eyeSize);
                ctx.fillRect(segment.x * CELL_SIZE + eyeOffset, segment.y * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize, eyeSize, eyeSize);
            } else if (direction === 'up') {
                ctx.fillRect(segment.x * CELL_SIZE + eyeOffset, segment.y * CELL_SIZE + eyeOffset, eyeSize, eyeSize);
                ctx.fillRect(segment.x * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize, segment.y * CELL_SIZE + eyeOffset, eyeSize, eyeSize);
            } else if (direction === 'down') {
                ctx.fillRect(segment.x * CELL_SIZE + eyeOffset, segment.y * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize, eyeSize, eyeSize);
                ctx.fillRect(segment.x * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize, segment.y * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize, eyeSize, eyeSize);
            }
        }
    });

    // 绘制食物
    ctx.fillStyle = '#f44336';
    ctx.beginPath();
    ctx.arc(food.x * CELL_SIZE + CELL_SIZE / 2, food.y * CELL_SIZE + CELL_SIZE / 2, CELL_SIZE / 2, 0, Math.PI * 2);
    ctx.fill();
}

// 游戏循环
function gameLoop() {
    clearInterval(gameLoopId);
    gameLoopId = setInterval(() => {
        moveSnake();

        // 检查碰撞
        if (checkCollision()) {
            clearInterval(gameLoopId);
            isGameOver = true;
            gameMessage.textContent = '游戏结束! 得分: ' + score + ' 按开始按钮重新开始';
            return;
        }

        drawGame();
    }, gameSpeed);
}

// 当页面加载完成后初始化游戏
window.addEventListener('load', initGame);