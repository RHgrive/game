const PIECE_COLORS = {
    I: 0x00ffff,
    J: 0x0000ff,
    L: 0xff7f00,
    O: 0xffff00,
    S: 0x00ff00,
    T: 0x800080,
    Z: 0xff0000
};

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.grid = [];
        this.currentPiece = null;
        this.nextPiece = null;
        this.holdPiece = null;
        this.canHold = true;
        this.score = 0;
        this.level = 1;
        this.linesCleared = 0;
        this.dropInterval = 1000;
        this.lastDropTime = 0;
        this.gridGraphics = null;
        this.pieceGraphics = null;
    }

    create() {
        this.gridGraphics = this.add.graphics();
        this.pieceGraphics = this.add.graphics();
        this.initGrid();
        this.generatePieces();
        this.input.keyboard.on('keydown', this.handleKey, this);
        this.createTouchControls();
    }

    initGrid() {
        for (let row = 0; row < 20; row++) {
            this.grid[row] = Array(10).fill(0);
        }
    }

    generatePieces() {
        this.currentPiece = this.getRandomTetromino();
        this.nextPiece = this.getRandomTetromino();
        this.holdPiece = null;
    }

    getRandomTetromino() {
        const types = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
        const type = Phaser.Utils.Array.GetRandom(types);
        return { type, shape: this.getShape(type), x: 3, y: -1, rotation: 0 };
    }

    getShape(type) {
        const shapes = {
            I: [[1, 1, 1, 1]],
            J: [[1, 0, 0], [1, 1, 1]],
            L: [[0, 0, 1], [1, 1, 1]],
            O: [[1, 1], [1, 1]],
            S: [[0, 1, 1], [1, 1, 0]],
            T: [[0, 1, 0], [1, 1, 1]],
            Z: [[1, 1, 0], [0, 1, 1]]
        };
        return shapes[type];
    }

    handleKey(event) {
        switch (event.code) {
            case 'ArrowLeft':
                this.movePiece(-1);
                break;
            case 'ArrowRight':
                this.movePiece(1);
                break;
            case 'ArrowUp':
                this.rotatePiece();
                break;
            case 'ArrowDown':
                this.softDrop();
                break;
            case 'Space':
                this.hardDrop();
                break;
            case 'KeyC':
                this.holdCurrent();
                break;
            case 'KeyP':
                this.scene.pause();
                this.scene.bringToTop('UIScene');
                this.events.emit('pause');
                break;
        }
    }

    createTouchControls() {
        const { width, height } = this.sys.game.canvas;
        this.add.rectangle(width * 0.2, height * 0.8, 100, 100)
            .setInteractive()
            .on('pointerdown', () => this.movePiece(-1));
        this.add.rectangle(width * 0.4, height * 0.8, 100, 100)
            .setInteractive()
            .on('pointerdown', () => this.movePiece(1));
        this.add.rectangle(width * 0.8, height * 0.8, 100, 100)
            .setInteractive()
            .on('pointerdown', () => this.rotatePiece());
        this.add.rectangle(width * 0.6, height * 0.8, 100, 100)
            .setInteractive()
            .on('pointerdown', () => this.softDrop());
    }

    update(time) {
        if (time - this.lastDropTime > this.dropInterval) {
            this.lastDropTime = time;
            this.softDrop();
        }
        this.drawGrid();
        this.drawPiece(this.currentPiece);
    }

    movePiece(offset) {
        this.currentPiece.x += offset;
        if (this.checkCollision()) {
            this.currentPiece.x -= offset;
        } else {
            this.sound.play('move');
        }
    }

    rotatePiece() {
        const prevRotation = this.currentPiece.rotation;
        this.currentPiece.rotation = (prevRotation + 1) % 4;
        this.currentPiece.shape = Phaser.Utils.Array.Rotate(this.currentPiece.shape);
        if (this.checkCollision()) {
            this.currentPiece.rotation = prevRotation;
            this.currentPiece.shape = Phaser.Utils.Array.Rotate(this.currentPiece.shape, -1);
        } else {
            this.sound.play('move');
        }
    }

    softDrop() {
        this.currentPiece.y++;
        if (this.checkCollision()) {
            this.currentPiece.y--;
            this.lockPiece();
        }
    }

    hardDrop() {
        while (!this.checkCollision()) {
            this.currentPiece.y++;
        }
        this.currentPiece.y--;
        this.lockPiece();
    }

    holdCurrent() {
        if (!this.canHold) {
            return;
        }
        if (this.holdPiece === null) {
            this.holdPiece = this.currentPiece;
            this.currentPiece = this.nextPiece;
            this.nextPiece = this.getRandomTetromino();
        } else {
            [this.currentPiece, this.holdPiece] = [this.holdPiece, this.currentPiece];
        }
        this.currentPiece.x = 3;
        this.currentPiece.y = -1;
        this.canHold = false;
    }

    checkCollision() {
        const { shape, x, y } = this.currentPiece;
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    const newX = x + col;
                    const newY = y + row;
                    if (newX < 0 || newX >= 10 || newY >= 20 || (newY >= 0 && this.grid[newY][newX])) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    lockPiece() {
        const { shape, x, y, type } = this.currentPiece;
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col] && y + row >= 0) {
                    this.grid[y + row][x + col] = type;
                }
            }
        }
        this.sound.play('clear');
        this.clearLines();
        this.currentPiece = this.nextPiece;
        this.nextPiece = this.getRandomTetromino();
        this.canHold = true;
        if (this.checkCollision()) {
            this.scene.restart();
            this.events.emit('gameover', this.score);
        }
    }

    clearLines() {
        let lines = 0;
        this.grid = this.grid.filter(row => {
            if (row.every(cell => cell)) {
                lines++;
                return false;
            }
            return true;
        });
        while (this.grid.length < 20) {
            this.grid.unshift(Array(10).fill(0));
        }
        if (lines) {
            this.linesCleared += lines;
            this.score += (100 * lines) * this.level;
            this.level = Math.floor(this.linesCleared / 10) + 1;
            this.dropInterval = Math.max(100, 1000 - (this.level - 1) * 100);
            this.events.emit('scoreUpdate', this.score, this.level, this.nextPiece, this.holdPiece);
        }
    }

    drawGrid() {
        this.gridGraphics.clear();
        for (let row = 0; row < 20; row++) {
            for (let col = 0; col < 10; col++) {
                if (this.grid[row][col]) {
                    const color = PIECE_COLORS[this.grid[row][col]] || 0xffffff;
                    this.gridGraphics.fillStyle(color, 1);
                    this.gridGraphics.fillRect(col * 32, row * 32, 32, 32);
                }
                this.gridGraphics.lineStyle(1, 0x222222);
                this.gridGraphics.strokeRect(col * 32, row * 32, 32, 32);
            }
        }
    }

    drawPiece(piece) {
        this.pieceGraphics.clear();
        const { shape, x, y, type } = piece;
        this.pieceGraphics.fillStyle(PIECE_COLORS[type], 1);
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    this.pieceGraphics.fillRect((x + col) * 32, (y + row) * 32, 32, 32);
                }
            }
        }
    }
}
