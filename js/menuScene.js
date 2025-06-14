class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
        this.add.image(centerX, centerY - 200, 'logo').setScale(0.6);
        const startButton = this.add.dom(centerX, centerY, 'button', null, 'ゲームスタート');
        startButton.addListener('click');
        startButton.on('click', () => {
            this.scene.start('GameScene');
            this.scene.launch('UIScene');
        });
    }
}
