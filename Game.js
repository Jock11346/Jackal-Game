// Title Scene
class TitleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TitleScene' });
    }

    preload() {
        this.load.image('titleScreen', 'assets/title_screen.png');
    }

    create() {
        this.add.image(400, 300, 'titleScreen').setScale(0.5);

        const startButton = this.add.text(400, 450, 'Start Mission', {
            font: '28px Arial',
            fill: '#FFF',
            backgroundColor: '#333',
            padding: { x: 10, y: 5 },
        }).setOrigin(0.5);

        startButton.setInteractive();
        startButton.on('pointerdown', () => {
            this.scene.start('GameScene');
        });
    }
}

// Game Scene
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        this.load.image('background', 'assets/background.png');
        this.load.image('drone', 'assets/drone.png');
        this.load.image('enemy', 'assets/enemy.png');
        this.load.image('barrel', 'assets/barrel.png');
        this.load.image('crosshair', 'assets/crosshair.png');
    }

    create() {
        this.add.image(400, 300, 'background');

        this.score = 0;
        this.timeLeft = 30;
        this.ammo = 10;

        const scoreText = this.add.text(10, 10, 'Score: 0', { fontSize: '20px', fill: '#FFF' });
        const timerText = this.add.text(10, 40, Time: ${this.timeLeft}, { fontSize: '20px', fill: '#FFF' });
        const ammoText = this.add.text(10, 70, Ammo: ${this.ammo}, { fontSize: '20px', fill: '#FFF' });

        this.time.addEvent({
            delay: 1000,
            callback: () => {
                this.timeLeft -= 1;
                timerText.setText(Time: ${this.timeLeft});
                if (this.timeLeft <= 0) {
                    this.scene.pause();
                    alert('Time’s Up! Final Score: ' + this.score);
                }
            },
            loop: true,
        });

        this.time.addEvent({
            delay: 1000,
            callback: () => this.spawnTarget(scoreText),
            loop: true,
        });

        const crosshair = this.add.image(400, 300, 'crosshair').setScale(0.5);
        this.input.on('pointermove', (pointer) => {
            crosshair.x = pointer.x;
            crosshair.y = pointer.y;
        });

        this.input.on('pointerdown', () => {
            if (this.ammo > 0) {
                this.ammo -= 1;
                ammoText.setText(Ammo: ${this.ammo});
            } else {
                alert('Out of ammo! Reload!');
            }
        });

        this.input.keyboard.on('keydown-R', () => {
            this.ammo = 10;
            ammoText.setText(Ammo: ${this.ammo});
        });
    }

    spawnTarget(scoreText) {
        const targetTypes = ['drone', 'enemy', 'barrel'];
        const type = Phaser.Math.RND.pick(targetTypes);
        const x = Phaser.Math.Between(50, 750);
        const y = Phaser.Math.Between(50, 550);

        const target = this.add.sprite(x, y, type).setInteractive();
        target.on('pointerdown', () => {
            this.score += type === 'barrel' ? 50 : 10;
            scoreText.setText(Score: ${this.score});
            target.destroy();
        });

        this.time.delayedCall(2000, () => target.destroy());
    }
}

// Game Configuration
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: [TitleScene, GameScene],
};

const game = new Phaser.Game(config);
