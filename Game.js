// Function to spawn Titan with refined logic
function spawnTitan(scene) {
    // Check if the Titan sprite exists
    if (!scene.textures.exists(TITAN.sprite)) {
        console.error(`Error: Sprite ${TITAN.sprite} not found. Ensure the asset is preloaded.`);
        return null;
    }

    // Spawn Titan
    const titan = scene.physics.add.sprite(TITAN.x, TITAN.y, TITAN.sprite).setScale(2);

    // Assign Titan properties
    titan.health = TITAN.health;
    titan.damage = TITAN.damage;

    // Titan collision with player
    if (player) {
        scene.physics.add.collider(titan, player, () => {
            player.health -= TITAN.damage;
            updateHUD();
            if (player.health <= 0) {
                gameOver(scene);
            }
        });
    } else {
        console.error("Error: Player object is undefined. Ensure player is initialised.");
    }

    // Titan attack logic
    titan.attack = () => {
        const attack = scene.physics.add.sprite(titan.x, titan.y, 'plasmaShockwave');
        attack.setCircle(TITAN.weapon.attackRadius);
        scene.physics.add.overlap(player, attack, () => {
            player.health -= TITAN.weapon.damage;
            updateHUD();
            if (player.health <= 0) {
                gameOver(scene);
            }
        });
        scene.time.addEvent({ delay: 2000, callback: () => attack.destroy() });
    };

    // Trigger attacks at intervals
    scene.time.addEvent({ delay: 3000, callback: titan.attack, loop: true });

    // Victory conditions
    titan.on('destroy', () => {
        currentBossDefeated = true;
        scene.sound.play('victoryMusic', { volume: 0.7 });
        victory(scene);
    });

    return titan;
}
// Title Scene
class TitleScene extends Phaser.Scene {
  constructor() {
    super('TitleScene');
  }

  preload() {
    // Preload the title screen image
    this.load.image('title_screen', ASSETS.titleScreen);
  }

  create() {
    // Add the title screen image
    this.add.image(400, 300, 'title_screen');

    // Listen for a click to start the game
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
    // Preload all assets needed for gameplay
    Object.values(ASSETS).forEach((asset) => {
      const key = asset.split('/').pop().split('.')[0];
      if (asset.endsWith('.png')) {
        this.load.image(key, asset);
      } else if (asset.endsWith('.mp3')) {
        this.load.audio(key, asset);
      }
    });
  }

  create() {
    // Main game setup
    this.add.image(400, 300, 'background');
    this.add.text(100, 100, 'Main Scene: Begin the Adventure', { fontSize: '32px', fill: '#fff' });

    // Call your game logic setup
    setupGameLogic(this);
  }
}

// Phaser Game Configuration
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
    },
  },
  scene: [TitleScene, MainScene], // Include TitleScene and MainScene in the scene list
};

// Initialize the Phaser Game
const game = new Phaser.Game(config);

// Function to set up main game logic
function setupGameLogic(scene) {
  // Initialise player, enemies, and the Titan
  scene.level = 1; // Start at level 1

  // Add player and enemy setup logic here
  const player = scene.physics.add.sprite(100, 100, 'jackal');
  player.health = 100;

  // Example: Progression logic
  checkLevelProgress(scene);

  // Example: Display player HUD
  scene.add.text(10, 10, 'Player Health: ' + player.health, { fontSize: '16px', fill: '#fff' });

  // Add Titan when the level is high enough
  checkLevelProgress(scene);
}

// Level Progression Check
function checkLevelProgress(scene) {
  if (scene.level === 5) {
    startBossBattle(scene); // Trigger the Titan boss battle
  }
} 
