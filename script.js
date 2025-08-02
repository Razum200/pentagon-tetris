class PentagonTetris {
    constructor() {
        // Инициализация Telegram WebApp
        this.initTelegramWebApp();
        
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.nextCanvas = document.getElementById('nextCanvas');
        this.nextCtx = this.nextCanvas.getContext('2d');
        
        this.BOARD_WIDTH = 10;
        this.BOARD_HEIGHT = 16;
        this.BLOCK_SIZE = 40;
        
        // Адаптируем размеры под экран
        this.adaptToScreen();
        
        this.board = [];
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.gameRunning = false;
        this.isPaused = false;
        
        this.currentPiece = null;
        this.nextPiece = null;
        
        this.dropTime = 0;
        this.dropInterval = 1000; // миллисекунды
        this.chaosMode = false;
        this.chaosBlocks = []; // Хранит информацию о хаотичных блоках
        this.difficultySettings = {
            easy: { speed: 1500, scoreMultiplier: 0.5 },
            normal: { speed: 1000, scoreMultiplier: 1 },
            hard: { speed: 600, scoreMultiplier: 1.5 },
            extreme: { speed: 300, scoreMultiplier: 2 }
        };
        
        this.colors = [
            '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', 
            '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd'
        ];
        
        this.initializeBoard();
        this.setupEventListeners();
        this.createTetrominos();
    }
    
    initializeBoard() {
        this.board = Array(this.BOARD_HEIGHT).fill().map(() => Array(this.BOARD_WIDTH).fill(0));
        this.chaosBlocks = Array(this.BOARD_HEIGHT).fill().map(() => 
            Array(this.BOARD_WIDTH).fill().map(() => ({
                rotation: 0,
                offsetX: 0,
                offsetY: 0,
                scale: 1,
                stabilized: false
            }))
        );
    }
    
    createTetrominos() {
        // Простые фигуры из пятиугольников
        this.pieces = [
            // I-образная фигура
            {
                shape: [
                    [1],
                    [1],
                    [1],
                    [1]
                ],
                color: 0
            },
            // O-образная фигура
            {
                shape: [
                    [1, 1],
                    [1, 1]
                ],
                color: 1
            },
            // T-образная фигура
            {
                shape: [
                    [0, 1, 0],
                    [1, 1, 1]
                ],
                color: 2
            },
            // L-образная фигура
            {
                shape: [
                    [1, 0],
                    [1, 0],
                    [1, 1]
                ],
                color: 3
            },
            // J-образная фигура
            {
                shape: [
                    [0, 1],
                    [0, 1],
                    [1, 1]
                ],
                color: 4
            },
            // S-образная фигура
            {
                shape: [
                    [0, 1, 1],
                    [1, 1, 0]
                ],
                color: 5
            },
            // Z-образная фигура
            {
                shape: [
                    [1, 1, 0],
                    [0, 1, 1]
                ],
                color: 6
            }
        ];
    }
    
    initTelegramWebApp() {
        // Проверяем, доступен ли Telegram WebApp
        if (typeof window.Telegram !== 'undefined' && window.Telegram.WebApp) {
            this.tg = window.Telegram.WebApp;
            
            // Инициализируем WebApp
            this.tg.ready();
            this.tg.expand();
            
            // Применяем тему Telegram
            document.body.style.backgroundColor = this.tg.themeParams.bg_color || '';
            document.body.style.color = this.tg.themeParams.text_color || '';
            
            // Настраиваем главную кнопку
            this.tg.MainButton.text = 'Поделиться результатом';
            this.tg.MainButton.color = this.tg.themeParams.button_color || '#2481cc';
            
            this.isTelegramApp = true;
        } else {
            this.isTelegramApp = false;
            this.tg = null;
        }
    }
    
    adaptToScreen() {
        // Определяем размеры экрана
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        
        // Адаптируем размер блоков для мобильных устройств
        if (screenWidth < 480) {
            this.BLOCK_SIZE = Math.floor(Math.min(screenWidth - 60, 300) / this.BOARD_WIDTH);
            this.canvas.width = this.BOARD_WIDTH * this.BLOCK_SIZE;
            this.canvas.height = this.BOARD_HEIGHT * this.BLOCK_SIZE;
            
            // Показываем мобильные элементы управления
            const mobileControls = document.getElementById('mobileControls');
            if (mobileControls) {
                mobileControls.style.display = 'block';
            }
            
            // Скрываем описание управления клавиатурой
            const controls = document.querySelector('.controls');
            if (controls) {
                controls.style.display = 'none';
            }
        }
        
        // Адаптируем canvas для следующей фигуры
        const nextSize = Math.floor(this.BLOCK_SIZE * 0.6);
        this.nextCanvas.width = nextSize * 4;
        this.nextCanvas.height = nextSize * 4;
    }
    
    shareResult() {
        if (this.isTelegramApp && this.tg) {
            const difficultyText = document.getElementById('difficulty').options[document.getElementById('difficulty').selectedIndex].text;
            const modeText = this.chaosMode ? ' 🌪️ Хаос' : '';
            const message = `🎮 Пятиугольный Тетрис\n🏆 Очки: ${this.score}\n⚡ Сложность: ${difficultyText}${modeText}\n📊 Уровень: ${this.level}\n📈 Линий: ${this.lines}`;
            
            this.tg.sendData(JSON.stringify({
                type: 'game_result',
                score: this.score,
                level: this.level,
                lines: this.lines,
                difficulty: document.getElementById('difficulty').value,
                chaosMode: this.chaosMode,
                message: message
            }));
        } else {
            // Fallback для обычного браузера
            const result = `🎮 Пятиугольный Тетрис - Очки: ${this.score}`;
            if (navigator.share) {
                navigator.share({
                    title: 'Пятиугольный Тетрис',
                    text: result,
                    url: window.location.href
                });
            } else {
                navigator.clipboard.writeText(result).then(() => {
                    alert('Результат скопирован в буфер обмена!');
                });
            }
        }
    }
    
    drawPentagon(x, y, size, color, chaosProps = null) {
        let centerX = x + size / 2;
        let centerY = y + size / 2;
        let radius = size * 0.4;
        let rotation = 0;
        
        // Применяем хаос если включен режим и есть свойства
        if (this.chaosMode && chaosProps) {
            centerX += chaosProps.offsetX;
            centerY += chaosProps.offsetY;
            radius *= chaosProps.scale;
            rotation = chaosProps.rotation;
        }
        
        this.ctx.save();
        this.ctx.fillStyle = color;
        this.ctx.strokeStyle = chaosProps && chaosProps.stabilized ? '#00ff00' : '#ffffff';
        this.ctx.lineWidth = 2;
        
        // Применяем вращение
        this.ctx.translate(centerX, centerY);
        this.ctx.rotate(rotation);
        this.ctx.translate(-centerX, -centerY);
        
        this.ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            let angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
            let currentRadius = radius;
            
            // В режиме хаос добавляем небольшие дополнительные искажения
            if (this.chaosMode && chaosProps && !chaosProps.stabilized) {
                const chaos = 0.15; // Меньше основного хаоса
                angle += (Math.random() - 0.5) * chaos;
                currentRadius += (Math.random() - 0.5) * radius * chaos;
            }
            
            const pointX = centerX + currentRadius * Math.cos(angle);
            const pointY = centerY + currentRadius * Math.sin(angle);
            
            if (i === 0) {
                this.ctx.moveTo(pointX, pointY);
            } else {
                this.ctx.lineTo(pointX, pointY);
            }
        }
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
        
        // Добавляем блик для красоты
        this.ctx.beginPath();
        this.ctx.arc(centerX - radius * 0.3, centerY - radius * 0.3, radius * 0.2, 0, 2 * Math.PI);
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.fill();
        
        this.ctx.restore();
    }
    
    drawPentagonOnNextCanvas(ctx, x, y, size, color) {
        const centerX = x + size / 2;
        const centerY = y + size / 2;
        const radius = size * 0.4;
        
        ctx.save();
        ctx.fillStyle = color;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
            const pointX = centerX + radius * Math.cos(angle);
            const pointY = centerY + radius * Math.sin(angle);
            
            if (i === 0) {
                ctx.moveTo(pointX, pointY);
            } else {
                ctx.lineTo(pointX, pointY);
            }
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }
    
    generatePiece() {
        const pieceIndex = Math.floor(Math.random() * this.pieces.length);
        const piece = JSON.parse(JSON.stringify(this.pieces[pieceIndex]));
        
        return {
            shape: piece.shape,
            color: this.colors[piece.color],
            x: Math.floor(this.BOARD_WIDTH / 2) - Math.floor(piece.shape[0].length / 2),
            y: 0
        };
    }
    
    canMovePiece(piece, dx, dy, rotation = null) {
        const shape = rotation || piece.shape;
        
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x]) {
                    const newX = piece.x + x + dx;
                    const newY = piece.y + y + dy;
                    
                    if (newX < 0 || newX >= this.BOARD_WIDTH || 
                        newY >= this.BOARD_HEIGHT ||
                        (newY >= 0 && this.board[newY][newX])) {
                        return false;
                    }
                }
            }
        }
        return true;
    }
    
    rotatePiece(piece) {
        const rotated = [];
        const shape = piece.shape;
        
        for (let x = 0; x < shape[0].length; x++) {
            rotated[x] = [];
            for (let y = shape.length - 1; y >= 0; y--) {
                rotated[x][shape.length - 1 - y] = shape[y][x];
            }
        }
        
        return rotated;
    }
    
    placePiece(piece) {
        for (let y = 0; y < piece.shape.length; y++) {
            for (let x = 0; x < piece.shape[y].length; x++) {
                if (piece.shape[y][x]) {
                    const boardY = piece.y + y;
                    const boardX = piece.x + x;
                    this.board[boardY][boardX] = piece.color;
                    
                    // В режиме хаос создаем случайные свойства для блока
                    if (this.chaosMode) {
                        this.chaosBlocks[boardY][boardX] = {
                            rotation: Math.random() * Math.PI * 2,
                            offsetX: (Math.random() - 0.5) * this.BLOCK_SIZE * 0.3,
                            offsetY: (Math.random() - 0.5) * this.BLOCK_SIZE * 0.3,
                            scale: 0.8 + Math.random() * 0.4, // от 0.8 до 1.2
                            stabilized: Math.random() < 0.1 // 10% шанс стабилизации
                        };
                    }
                }
            }
        }
    }
    
    clearLines() {
        let linesCleared = 0;
        
        for (let y = this.BOARD_HEIGHT - 1; y >= 0; y--) {
            const filledCells = this.board[y].filter(cell => cell !== 0).length;
            const fillPercent = filledCells / this.BOARD_WIDTH;
            
            let shouldClear = false;
            
            if (this.chaosMode) {
                // В режиме хаос ряд очищается при 80% заполнении (8 из 10 блоков)
                if (fillPercent >= 0.8) {
                    shouldClear = true;
                }
            } else {
                // Обычный режим - 100% заполнение
                shouldClear = fillPercent === 1.0;
            }
            
            if (shouldClear) {
                this.board.splice(y, 1);
                this.chaosBlocks.splice(y, 1);
                this.board.unshift(Array(this.BOARD_WIDTH).fill(0));
                this.chaosBlocks.unshift(Array(this.BOARD_WIDTH).fill().map(() => ({
                    rotation: 0, offsetX: 0, offsetY: 0, scale: 1, stabilized: false
                })));
                linesCleared++;
                y++; // Проверяем ту же строку снова
            }
        }
        
        // Хаотичная гравитация - блоки могут упасть
        if (this.chaosMode && Math.random() < 0.2) {
            this.applyChaoticGravity();
        }
        
        if (linesCleared > 0) {
            this.lines += linesCleared;
            const baseScore = linesCleared * 100 * this.level;
            const multiplier = this.difficultySettings[this.currentDifficulty].scoreMultiplier;
            const chaosBonus = this.chaosMode ? 1.5 : 1;
            this.score += Math.floor(baseScore * multiplier * chaosBonus);
            
            this.level = Math.floor(this.lines / 10) + 1;
            const baseSpeed = this.difficultySettings[this.currentDifficulty].speed;
            this.dropInterval = Math.max(50, baseSpeed - (this.level - 1) * 50);
            this.updateUI();
        }
    }
    
    applyChaoticGravity() {
        // Случайные блоки могут "упасть" на одну позицию
        for (let y = this.BOARD_HEIGHT - 2; y >= 0; y--) {
            for (let x = 0; x < this.BOARD_WIDTH; x++) {
                if (this.board[y][x] !== 0 && this.board[y + 1][x] === 0 && Math.random() < 0.3) {
                    this.board[y + 1][x] = this.board[y][x];
                    this.board[y][x] = 0;
                    
                    this.chaosBlocks[y + 1][x] = this.chaosBlocks[y][x];
                    this.chaosBlocks[y][x] = { rotation: 0, offsetX: 0, offsetY: 0, scale: 1, stabilized: false };
                }
            }
        }
    }
    
    updateChaosBlocks() {
        if (!this.chaosMode) return;
        
        for (let y = 0; y < this.BOARD_HEIGHT; y++) {
            for (let x = 0; x < this.BOARD_WIDTH; x++) {
                if (this.board[y][x] !== 0 && !this.chaosBlocks[y][x].stabilized) {
                    const block = this.chaosBlocks[y][x];
                    
                    // Медленное вращение
                    block.rotation += (Math.random() - 0.5) * 0.1;
                    
                    // Небольшие колебания позиции
                    block.offsetX += (Math.random() - 0.5) * 2;
                    block.offsetY += (Math.random() - 0.5) * 2;
                    
                    // Ограничиваем смещения
                    block.offsetX = Math.max(-15, Math.min(15, block.offsetX));
                    block.offsetY = Math.max(-15, Math.min(15, block.offsetY));
                    
                    // Иногда блок может стабилизироваться
                    if (Math.random() < 0.005) {
                        block.stabilized = true;
                        block.offsetX = 0;
                        block.offsetY = 0;
                        block.rotation = 0;
                        block.scale = 1;
                    }
                }
            }
        }
    }
    
    draw() {
        // Обновляем хаотичные блоки
        this.updateChaosBlocks();
        
        // Очищаем canvas
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Рисуем сетку (менее заметную в режиме хаос)
        this.ctx.strokeStyle = this.chaosMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        
        for (let x = 0; x <= this.BOARD_WIDTH; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * this.BLOCK_SIZE, 0);
            this.ctx.lineTo(x * this.BLOCK_SIZE, this.canvas.height);
            this.ctx.stroke();
        }
        
        for (let y = 0; y <= this.BOARD_HEIGHT; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * this.BLOCK_SIZE);
            this.ctx.lineTo(this.canvas.width, y * this.BLOCK_SIZE);
            this.ctx.stroke();
        }
        
        // Рисуем размещенные блоки
        for (let y = 0; y < this.BOARD_HEIGHT; y++) {
            for (let x = 0; x < this.BOARD_WIDTH; x++) {
                if (this.board[y][x]) {
                    const chaosProps = this.chaosMode ? this.chaosBlocks[y][x] : null;
                    this.drawPentagon(
                        x * this.BLOCK_SIZE,
                        y * this.BLOCK_SIZE,
                        this.BLOCK_SIZE,
                        this.board[y][x],
                        chaosProps
                    );
                }
            }
        }
        
        // Рисуем текущую фигуру (тоже хаотичную в режиме хаос)
        if (this.currentPiece) {
            for (let y = 0; y < this.currentPiece.shape.length; y++) {
                for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                    if (this.currentPiece.shape[y][x]) {
                        let chaosProps = null;
                        if (this.chaosMode) {
                            chaosProps = {
                                rotation: Math.sin(Date.now() * 0.005) * 0.3,
                                offsetX: Math.sin(Date.now() * 0.003 + x) * 3,
                                offsetY: Math.cos(Date.now() * 0.004 + y) * 3,
                                scale: 1 + Math.sin(Date.now() * 0.006) * 0.1,
                                stabilized: false
                            };
                        }
                        
                        this.drawPentagon(
                            (this.currentPiece.x + x) * this.BLOCK_SIZE,
                            (this.currentPiece.y + y) * this.BLOCK_SIZE,
                            this.BLOCK_SIZE,
                            this.currentPiece.color,
                            chaosProps
                        );
                    }
                }
            }
        }
    }
    
    drawNextPiece() {
        this.nextCtx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.nextCtx.fillRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
        
        if (this.nextPiece) {
            const blockSize = 25;
            const offsetX = (this.nextCanvas.width - this.nextPiece.shape[0].length * blockSize) / 2;
            const offsetY = (this.nextCanvas.height - this.nextPiece.shape.length * blockSize) / 2;
            
            for (let y = 0; y < this.nextPiece.shape.length; y++) {
                for (let x = 0; x < this.nextPiece.shape[y].length; x++) {
                    if (this.nextPiece.shape[y][x]) {
                        this.drawPentagonOnNextCanvas(
                            this.nextCtx,
                            offsetX + x * blockSize,
                            offsetY + y * blockSize,
                            blockSize,
                            this.nextPiece.color
                        );
                    }
                }
            }
        }
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('level').textContent = this.level;
        document.getElementById('lines').textContent = this.lines;
    }
    
    gameLoop(timestamp) {
        if (!this.gameRunning || this.isPaused) return;
        
        if (timestamp - this.dropTime > this.dropInterval) {
            this.movePiece(0, 1);
            this.dropTime = timestamp;
        }
        
        this.draw();
        this.drawNextPiece();
        
        requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
    }
    
    movePiece(dx, dy) {
        // В режиме хаос добавляем случайные боковые движения при падении
        if (this.chaosMode && dy > 0 && Math.random() < 0.15) {
            const randomDrift = Math.random() < 0.5 ? -1 : 1;
            if (this.canMovePiece(this.currentPiece, randomDrift, 0)) {
                this.currentPiece.x += randomDrift;
            }
        }
        
        if (this.canMovePiece(this.currentPiece, dx, dy)) {
            this.currentPiece.x += dx;
            this.currentPiece.y += dy;
        } else if (dy > 0) {
            // Фигура достигла дна
            this.placePiece(this.currentPiece);
            this.clearLines();
            this.spawnNewPiece();
        }
    }
    
    spawnNewPiece() {
        this.currentPiece = this.nextPiece || this.generatePiece();
        this.nextPiece = this.generatePiece();
        
        if (!this.canMovePiece(this.currentPiece, 0, 0)) {
            this.gameOver();
        }
    }
    
    gameOver() {
        this.gameRunning = false;
        
        // Разблокируем настройки
        document.getElementById('difficulty').disabled = false;
        document.getElementById('chaosMode').disabled = false;
        document.getElementById('startBtn').disabled = false;
        document.getElementById('pauseBtn').disabled = true;
        
        // Показываем кнопку поделиться
        const shareBtn = document.getElementById('shareBtn');
        if (shareBtn) {
            shareBtn.style.display = 'inline-block';
        }
        
        // Настраиваем Telegram MainButton
        if (this.isTelegramApp && this.tg) {
            this.tg.MainButton.setText('📤 Поделиться результатом');
            this.tg.MainButton.show();
            this.tg.MainButton.onClick(() => this.shareResult());
        }
        
        const difficultyText = document.getElementById('difficulty').options[document.getElementById('difficulty').selectedIndex].text;
        const modeText = this.chaosMode ? ' (Режим Хаос)' : '';
        alert(`Игра окончена!\nСложность: ${difficultyText}${modeText}\nВаш счет: ${this.score}`);
    }
    
    startGame() {
        // Получаем настройки из UI
        const difficulty = document.getElementById('difficulty').value;
        this.chaosMode = document.getElementById('chaosMode').checked;
        
        this.initializeBoard();
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.dropInterval = this.difficultySettings[difficulty].speed;
        this.currentDifficulty = difficulty;
        this.gameRunning = true;
        this.isPaused = false;
        
        this.updateUI();
        this.spawnNewPiece();
        this.gameLoop(0);
        
        document.getElementById('startBtn').disabled = true;
        document.getElementById('pauseBtn').disabled = false;
        
        // Блокируем изменение настроек во время игры
        document.getElementById('difficulty').disabled = true;
        document.getElementById('chaosMode').disabled = true;
        
        // Скрываем кнопку поделиться
        const shareBtn = document.getElementById('shareBtn');
        if (shareBtn) {
            shareBtn.style.display = 'none';
        }
        
        // Скрываем Telegram MainButton
        if (this.isTelegramApp && this.tg) {
            this.tg.MainButton.hide();
        }
    }
    
    togglePause() {
        if (!this.gameRunning) return;
        
        this.isPaused = !this.isPaused;
        
        if (!this.isPaused) {
            this.gameLoop(0);
        }
        
        document.getElementById('pauseBtn').textContent = this.isPaused ? 'Продолжить' : 'Пауза';
    }
    
    setupEventListeners() {
        // Кнопки управления
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        
        // Показ/скрытие информации о режиме хаос
        document.getElementById('chaosMode').addEventListener('change', (e) => {
            const chaosInfo = document.getElementById('chaosInfo');
            chaosInfo.style.display = e.target.checked ? 'block' : 'none';
        });
        
        // Кнопка поделиться результатом
        const shareBtn = document.getElementById('shareBtn');
        if (shareBtn) {
            shareBtn.addEventListener('click', () => this.shareResult());
        }
        
        // Мобильные кнопки управления
        this.setupMobileControls();
        
        // Управление клавиатурой
        document.addEventListener('keydown', (e) => {
            if (!this.gameRunning || this.isPaused) return;
            
            switch(e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.movePiece(-1, 0);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.movePiece(1, 0);
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.movePiece(0, 1);
                    break;
                case ' ':
                    e.preventDefault();
                    const rotated = this.rotatePiece(this.currentPiece);
                    if (this.canMovePiece(this.currentPiece, 0, 0, rotated)) {
                        this.currentPiece.shape = rotated;
                    }
                    break;
                case 'Escape':
                    e.preventDefault();
                    this.togglePause();
                    break;
            }
        });
        
        // Фокус на canvas для управления клавиатурой
        this.canvas.tabIndex = 0;
        this.canvas.focus();
    }
    
    setupMobileControls() {
        // Обработчики для мобильных кнопок
        const buttons = {
            'moveLeft': () => this.movePiece(-1, 0),
            'moveRight': () => this.movePiece(1, 0),
            'softDrop': () => this.movePiece(0, 1),
            'hardDrop': () => {
                while (this.canMovePiece(this.currentPiece, 0, 1)) {
                    this.movePiece(0, 1);
                }
            },
            'rotate': () => {
                const rotated = this.rotatePiece(this.currentPiece);
                if (this.canMovePiece(this.currentPiece, 0, 0, rotated)) {
                    this.currentPiece.shape = rotated;
                }
            },
            'pause': () => this.togglePause()
        };
        
        // Добавляем обработчики событий для каждой кнопки
        Object.keys(buttons).forEach(buttonId => {
            const button = document.getElementById(buttonId);
            if (button) {
                // Touch события для лучшей отзывчивости на мобильных
                button.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    if (this.gameRunning && !this.isPaused) {
                        buttons[buttonId]();
                    }
                });
                
                // Click события как fallback
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (this.gameRunning && !this.isPaused) {
                        buttons[buttonId]();
                    }
                });
            }
        });
        
        // Обработка изменения ориентации экрана
        window.addEventListener('orientationchange', () => {
            setTimeout(() => this.adaptToScreen(), 100);
        });
        
        // Обработка изменения размера окна
        window.addEventListener('resize', () => {
            this.adaptToScreen();
        });
    }
}

// Запуск игры
window.addEventListener('load', () => {
    const game = new PentagonTetris();
});