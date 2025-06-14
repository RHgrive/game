class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });
    }

    preload() {
        this.load.audio('clear', 'assets/sfx/clear.mp3');
        this.load.audio('move', 'assets/sfx/move.mp3');
        this.load.spritesheet('tiles', 'assets/img/tiles.png', { frameWidth: 32, frameHeight: 32 });
    }

    create() {
        this.scene.start('MenuScene');
    }
}
