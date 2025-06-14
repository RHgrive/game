class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    init() {
        this.scale.on('resize', this.resize, this);
    }

    preload() {
        this.load.image('logo', 'assets/img/logo.png');
    }

    create() {
        this.scene.start('PreloadScene');
    }

    resize(gameSize) {
        const width = gameSize.width;
        const height = gameSize.height;
        this.cameras.resize(width, height);
    }
}
