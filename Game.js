// Assets list
const ASSETS = {
    background: "assets/background.png",
    titleScreen: "assets/title_screen.png",
    jackal: "assets/jackal.png",
    raven: "assets/raven.png",
    titan: "assets/titan.png", // Titan's sprite asset
    drone: "assets/drone.png",
    enemy: "assets/enemy.png",
    barrel: "assets/barrel.png",
    crosshair: "assets/crosshair.png",
    bullets: "assets/bullets.png",
    bossMusic: "assets/boss_music.mp3", // Titan's boss music
    victoryMusic: "assets/victory_music.mp3",
    normalMusic: "assets/normal_music.mp3"
};

// Titan configuration
const TITAN = {
    sprite: 'titan',
    x: 400,
    y: 300,
    health: 250,
    damage: 15,
    speed: 60,
    weapon: {
        type: "plasmaHammer",
        attackRadius: 120,
        damage: 10
    }
};

// Game states
const STATES = {
    TITLE_SCREEN: "TITLE_SCREEN",
    GAME_PLAY: "GAME_PLAY",
    BOSS_BATTLE: "BOSS_BATTLE",
    GAME_OVER: "GAME_OVER",
    VICTORY: "VICTORY"
};

let currentBossDefeated = false;

// Title Scene
class TitleScene extends Phaser.Scene {
    constructor() {
        super('TitleScene');
    }

    preload() {
        this.load.image('title_screen', ASSETS.titleScreen);
    }

    create() {
        this.add.image(400, 300, 'title_screen');
        this.input.once('pointerdown', () => {
            this.scene.start('MainScene');
        });
    }
}

// Main Game Scene
class MainScene extends Phaser.Scene {
    constructor() {
        super('MainScene');
    }

    preload() {
        // Preload all assets
        Object.values(ASSETS).forEach(asset => {
            const key = asset.split('/').pop().split('.')[0];
            if (asset.endsWith('.png')) {
                this.load.image(key, asset);
            } else if (asset.endsWith('.mp3')) {
                this.load.audio(key, asset);
            }
        });
    }

    create() {
        // Setup main gameplay
        this.add.image(400, 300, 'background');
        this.add.text(100, 100, 'Main Scene: Begin the Adventure', { fontSize: '32px', fill: '#fff' });

        this.player = this.physics.add.sprite(100, 100, 'jackal');
        this.player.health = 100;
        this.level = 1;

        // HUD
        this.hud = this.add.text(10, 10, 'Player Health: ' + this.player.health, { fontSize: '16px', fill: '#fff' });

        // Titan encounter logic
        checkLevelProgress(this);
    }

    update() {
        if (this.player.health <= 0) {
            this.scene.start('GameOverScene');
        }
    }
}

// Game Over Scene
class GameOverScene extends Phaser.Scene {
    constructor() {
        super('GameOverScene');
    }

    create() {
        this.add.text(400, 300, 'Game Over', { fontSize: '48px', fill: '#f00' }).setOrigin(0.5);
        this.input.once('pointerdown', () => {
            this.scene.start('TitleScene');
        });
    }
}

// Functions
function checkLevelProgress(scene) {
    if (scene.level === 5) {
        startBossBattle(scene);
    }
}

function startBossBattle(scene) {
    const cutsceneText = [
        "Jackal: So, this is the man behind it all...",
        "Titan: Hah! Man? You overestimate me. I am a force of nature!",
        "Raven: Big words for someone about to fall.",
        "Titan: You amuse me, Raven. Let’s see how long you last!"
    ];

    let index = 0;
    const showNextLine = () => {
        if (index < cutsceneText.length) {
            displayDialog(scene, cutsceneText[index]);
            index++;
            setTimeout(showNextLine, 3000);
        } else {
            spawnTitan(scene);
        }
    };
    showNextLine();
}

function spawnTitan(scene) {
    const titan = scene.physics.add.sprite(TITAN.x, TITAN.y, TITAN.sprite);
    titan.health = TITAN.health;
    titan.setScale(2);

    titan.attack = () => {
        const attack = scene.physics.add.sprite(titan.x, titan.y, 'plasmaShockwave');
        attack.setCircle(TITAN.weapon.attackRadius);
        scene.physics.add.overlap(scene.player, attack, () => {
            scene.player.health -= TITAN.weapon.damage;
            updateHUD(scene);
            if (scene.player.health <= 0) {
                gameOver(scene);
            }
        });
        setTimeout(() => attack.destroy(), 2000);
    };

    scene.time.addEvent({ delay: 3000, callback: titan.attack, loop: true });

    titan.on('destroy', () => {
        currentBossDefeated = true;
        scene.sound.play('victoryMusic', { volume: 0.7 });
        victory(scene);
    });

    return titan;
}

function displayDialog(scene, text) {
    const dialog = scene.add.text(400, 500, text, { fontSize: '24px', fill: '#fff' }).setOrigin(0.5);
    setTimeout(() => dialog.destroy(), 3000);
}

function updateHUD(scene) {
    scene.hud.setText('Player Health: ' + scene.player.health);
}

function victory(scene) {
    scene.add.text(400, 300, 'Congratulations! You defeated Titan!', { fontSize: '32px', fill: '#0f0' }).setOrigin(0.5);
    scene.input.once('pointerdown', () => {
        scene.scene.start('TitleScene');
    });
}

// Game Configuration
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scene: [TitleScene, MainScene, GameOverScene]
};

// Initialise Game
const game = new Phaser.Game(config);
