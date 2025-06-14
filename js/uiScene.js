class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene', active: false });
    }

    create() {
        this.scoreText = this.add.text(650, 50, 'SCORE: 0', { fontSize: '24px', fill: '#fff' });
        this.levelText = this.add.text(650, 100, 'LEVEL: 1', { fontSize: '24px', fill: '#fff' });
        this.nextText = this.add.text(650, 150, 'NEXT', { fontSize: '20px', fill: '#fff' });
        this.nextContainer = this.add.container(650, 180);
        this.holdText = this.add.text(650, 350, 'HOLD', { fontSize: '20px', fill: '#fff' });
        this.holdContainer = this.add.container(650, 380);

        this.scene.get('GameScene').events.on('scoreUpdate', (score, level, nextPiece, holdPiece) => {
            this.scoreText.setText('SCORE: ' + score);
            this.levelText.setText('LEVEL: ' + level);
            this.renderPreview(this.nextContainer, nextPiece);
            this.renderPreview(this.holdContainer, holdPiece);
        });

        this.scene.get('GameScene').events.on('pause', () => {
            this.showPauseMenu();
        });

        this.scene.get('GameScene').events.on('gameover', score => {
            this.showGameOver(score);
        });
    }

    renderPreview(container, piece) {
        container.removeAll(true);
        if (!piece) {
            return;
        }
        const { shape } = piece;
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    const block = this.add.rectangle(col * 24, row * 24, 24, 24);
                    container.add(block);
                }
            }
        }
    }

    showPauseMenu() {
        const { width, height } = this.cameras.main;
        const pauseBg = this.add.rectangle(width / 2, height / 2, 400, 300, 0x000000, 0.7);
        const resumeButton = this.add.dom(width / 2, height / 2 - 50, 'button', null, '再開');
        resumeButton.addListener('click');
        resumeButton.on('click', () => {
            pauseBg.destroy();
            resumeButton.destroy();
            this.scene.resume('GameScene');
        });
    }

    showGameOver(finalScore) {
        const { width, height } = this.cameras.main;
        const gameOverBg = this.add.rectangle(width / 2, height / 2, 500, 400, 0x000000, 0.8);
        this.add.text(width / 2 - 80, height / 2 - 80, 'GAME OVER', { fontSize: '36px', fill: '#fff' });
        this.add.text(width / 2 - 60, height / 2 - 20, 'SCORE: ' + finalScore, { fontSize: '28px', fill: '#fff' });
        const retryButton = this.add.dom(width / 2, height / 2 + 60, 'button', null, 'リトライ');
        retryButton.addListener('click');
        retryButton.on('click', () => {
            this.scene.stop();
            this.scene.start('GameScene');
        });
    }
}
