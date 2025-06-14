const config = {
    type: Phaser.CANVAS,
    parent: 'game-container',
    backgroundColor: '#000000',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 768,
        height: 1024
    },
    dom: {
        createContainer: true
    },
    scene: [BootScene, PreloadScene, MenuScene, GameScene, UIScene]
};

new Phaser.Game(config);
