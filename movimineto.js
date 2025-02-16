class Game {
    constructor() {
        this.canvas = document.getElementById("gameCanvas");
        this.ctx = this.canvas.getContext("2d");
        this.playerImg = "🧺";
        this.fruitIcons = ["🍎", "🍌", "🍒", "🍓", "🍍", "🍇"];
        this.player = { x: 175, y: 450, width: 60, height: 60 };
        this.objects = [];
        this.score = 0;
        this.lives = 3;
        this.gameOver = false;
        this.gameStarted = false;
        this.isPaused = false;
        this.spawnInterval = 2000;
        this.lastSpawnTime = 0;
        this.lastFrameTime = 0;
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('startButton').addEventListener('click', () => this.startGame());
        document.getElementById('pauseButton').addEventListener('click', () => this.togglePause());
        
        document.addEventListener("keydown", (event) => {
            if (!this.gameStarted || this.gameOver || this.isPaused) return;
            
            const moveDistance = 20;
            switch(event.key) {
                case "ArrowLeft":
                    this.player.x = Math.max(0, this.player.x - moveDistance);
                    break;
                case "ArrowRight":
                    this.player.x = Math.min(this.canvas.width - this.player.width, 
                                           this.player.x + moveDistance);
                    break;
                case "p":
                    this.togglePause();
                    break;
            }
        });

        // Control táctil
        let touchStartX = 0;
        this.canvas.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            e.preventDefault();
        });

        this.canvas.addEventListener('touchmove', (e) => {
            if (!this.gameStarted || this.gameOver || this.isPaused) return;
            
            const touchX = e.touches[0].clientX;
            const diff = touchX - touchStartX;
            const sensitivity = 1.5;
            
            this.player.x = Math.max(0, Math.min(
                this.canvas.width - this.player.width,
                this.player.x + (diff * sensitivity)
            ));
            
            touchStartX = touchX;
            e.preventDefault();
        });
    }

    startGame() {
        this.gameStarted = true;
        this.gameOver = false;
        this.isPaused = false;
        this.score = 0;
        this.lives = 3;
        this.objects = [];
        this.spawnInterval = 2000;
        document.getElementById('startButton').textContent = 'Reiniciar';
        document.getElementById('pauseButton').style.display = 'inline-block';
        this.lastFrameTime = performance.now();
        requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        const pauseButton = document.getElementById('pauseButton');
        pauseButton.textContent = this.isPaused ? 'Reanudar' : 'Pausar';
        
        if (!this.isPaused) {
            this.lastFrameTime = performance.now();
            requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
        }
    }

    createObject() {
        const x = Math.random() * (this.canvas.width - 40);
        const icon = this.fruitIcons[Math.floor(Math.random() * this.fruitIcons.length)];
        this.objects.push({
            x,
            y: 0,
            width: 40,
            height: 40,
            speed: 2 + (this.score * 0.1),
            icon
        });
    }

    showDeathEffect() {
        const deathEffect = document.createElement('div');
        deathEffect.style.cssText = `
            position: fixed;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            font-size: 80px;
            color: red;
            pointer-events: none;
            animation: fadeInOut 0.8s ease-in-out;
            z-index: 1000;
        `;
        deathEffect.textContent = '💀';
        
        if (!document.querySelector('#deathEffectStyle')) {
            const style = document.createElement('style');
            style.id = 'deathEffectStyle';
            style.textContent = `
                @keyframes fadeInOut {
                    0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
                    50% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
                    100% { opacity: 0; transform: translate(-50%, -50%) scale(1); }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(deathEffect);
        
        setTimeout(() => {
            deathEffect.remove();
        }, 800);
    }

    showGameOver() {
        const gameOverScreen = document.createElement('div');
        gameOverScreen.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.85);
            padding: 2rem;
            border-radius: 15px;
            text-align: center;
            animation: fadeIn 0.5s ease-in;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
            border: 3px solid #ff6b6b;
            min-width: 300px;
            z-index: 1000;
        `;

        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
                to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            }
            @keyframes bounce {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
            }
        `;
        document.head.appendChild(style);

        gameOverScreen.innerHTML = `
            <div style="margin-bottom: 20px;">
                <span style="font-size: 72px; animation: bounce 2s infinite;">🎮</span>
            </div>
            <h2 style="color: #ff6b6b; font-size: 36px; margin: 0 0 10px 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">
                ¡Game Over!
            </h2>
            <p style="color: #fff; font-size: 24px; margin: 10px 0;">
                Puntuación final: ${this.score}
            </p>
            <p style="color: #ffd700; font-size: 20px; margin: 15px 0;">
                ${this.getGameOverMessage()}
            </p>
            <button 
                onclick="location.reload()" 
                style="
                    background: #ff6b6b;
                    color: white;
                    border: none;
                    padding: 12px 30px;
                    border-radius: 25px;
                    font-size: 18px;
                    cursor: pointer;
                    margin-top: 20px;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
                "
                onmouseover="this.style.transform='scale(1.1)'"
                onmouseout="this.style.transform='scale(1)'">
                Jugar de nuevo
            </button>
        `;

        this.canvas.parentElement.appendChild(gameOverScreen);
    }

    getGameOverMessage() {
        if (this.score === 0) {
            return "¡Inténtalo de nuevo!";
        } else if (this.score < 5) {
            return "¡Buen intento! ¡Puedes hacerlo mejor!";
        } else if (this.score < 10) {
            return "¡Bien jugado! ¡Casi llegas a 10!";
        } else if (this.score < 20) {
            return "¡Impresionante! ¡Eres muy bueno!";
        } else {
            return "¡Increíble! ¡Eres un maestro!";
        }
    }

    checkCollisions(obj, index) {
        if (obj.y + obj.height > this.canvas.height) {
            this.lives--;
            this.showDeathEffect();
            this.objects.splice(index, 1);
            
            if (this.lives <= 0) {
                this.gameOver = true;
                this.showGameOver();
                document.getElementById('pauseButton').style.display = 'none';
            }
            return;
        }

        if (obj.y + obj.height >= this.player.y &&
            obj.x + obj.width >= this.player.x &&
            obj.x <= this.player.x + this.player.width) {
            this.objects.splice(index, 1);
            this.score++;
            if (this.score % 10 === 0) {
                document.body.style.background = 
                    `linear-gradient(${this.score}deg, #ff9a9e, #ffb347, #ffda77, #a8e6cf, #dcedc1)`;
            }
        }
    }

    drawGame() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.font = "40px Arial";
        this.ctx.fillText(this.playerImg, this.player.x, this.player.y + 40);
        
        this.objects.forEach(obj => {
            this.ctx.fillText(obj.icon, obj.x, obj.y + 30);
        });
        
        this.ctx.fillStyle = "black";
        this.ctx.font = "20px Arial";
        this.ctx.fillText(`Puntuación: ${this.score}`, 10, 30);
        this.ctx.fillText(`Vidas: ${this.lives}`, this.canvas.width - 90, 30);
        
        if (this.isPaused) {
            this.ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = "white";
            this.ctx.font = "30px Arial";
            this.ctx.fillText("PAUSADO", this.canvas.width/2 - 60, this.canvas.height/2);
        }
    }

    gameLoop(timestamp) {
        if (this.gameOver || !this.gameStarted || this.isPaused) return;

        const deltaTime = timestamp - this.lastFrameTime;
        this.lastFrameTime = timestamp;

        this.objects.forEach((obj, index) => {
            obj.y += obj.speed * (deltaTime / 16.67);
            this.checkCollisions(obj, index);
        });

        if (timestamp - this.lastSpawnTime > this.spawnInterval) {
            this.createObject();
            this.lastSpawnTime = timestamp;
        }

        this.drawGame();
        requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
    }
}

// Inicializar el juego
const game = new Game();