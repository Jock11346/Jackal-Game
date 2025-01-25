// Updated code to integrate Titan, the head of the enemy faction, into the game storyline and gameplay mechanics. Updated title to "Jackal: Rise of Raven and Titan".

// Assets list
const ASSETS = {
    background: "assets/background.png",
    titleScreen: "assets/title_screen.png",
    jackal: "assets/jackal.png",
    raven: "assets/raven.png",
    titan: "assets/titan.png", // Added Titan's sprite asset
    drone: "assets/drone.png",
    enemy: "assets/enemy.png",
    barrel: "assets/barrel.png",
    crosshair: "assets/crosshair.png",
    bullets: "assets/bullets.png",
    bossMusic: "assets/boss_music.mp3", // Added Titan's boss music
    victoryMusic: "assets/victory_music.mp3", // Victory music added
    normalMusic: "assets/normal_music.mp3"
};

// Titan character configuration
const TITAN = {
    sprite: 'titan',
    x: 400,
    y: 300,
    health: 250, // Adjusted Titan's health for balance
    damage: 15, // Adjusted damage to ensure a fair fight
    speed: 60, // Slightly increased speed for challenge
    weapon: {
        type: "plasmaHammer",
        attackRadius: 120, // Adjusted radius for balance
        damage: 10 // Added specific weapon damage
    }
};

// Game states
const STATES = {
    TITLE_SCREEN: "TITLE_SCREEN",
    GAME_PLAY: "GAME_PLAY",
    BOSS_BATTLE: "BOSS_BATTLE", // Added a new state for the Titan boss battle
    GAME_OVER: "GAME_OVER",
    VICTORY: "VICTORY"
};

let currentBossDefeated = false;

// Function to spawn Titan
function spawnTitan(scene) {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    const titan = scene.physics.add.sprite(TITAN.x, TITAN.y, TITAN.sprite);
    titan.health = TITAN.health;
    titan.damage = TITAN.damage;
    titan.setScale(2);

    // Titan's behaviour
    scene.physics.add.collider(titan, player, () => {
        player.health -= TITAN.damage;
        updateHUD();
        if (player.health <= 0) {
            gameOver(scene);
        }
    });

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

// Updated game flow to include Titan
function updateGameFlow(scene) {
    if (!currentBossDefeated) {
        // Trigger boss battle
        scene.state = STATES.BOSS_BATTLE;
        scene.sound.stopAll();
        scene.sound.play('bossMusic');
        spawnTitan(scene);
    } else {
        scene.state = STATES.VICTORY;
        victory(scene);
    }
}

// Boss battle initiation in storyline
function startBossBattle(scene) {
    // Cutscene before Titan appears
    const cutsceneText = [
        "Jackal: So, this is the man behind it all...",
        "Titan: Hah! Man? You overestimate me. I am a force of nature!",
        "Raven: Big words for someone about to fall.",
        "Titan: You amuse me, Raven. Let’s see how long you last!"
    ];

    let index = 0;
    const showNextLine = () => {
        if (index < cutsceneText.length) {
            displayDialog(cutsceneText[index]);
            index++;
            setTimeout(showNextLine, 3000);
        } else {
            updateGameFlow(scene);
        }
    };
    showNextLine();
}

// Call startBossBattle at the appropriate mission level
function checkLevelProgress(scene) {
    if (scene.level === 5) { // Example: Titan appears at level 5
        startBossBattle(scene);
    }
}

// Victory screen update
function victory(scene) {
    scene.add.image(400, 300, 'victoryScreen');
    scene.sound.stopAll();
    scene.sound.play('victoryMusic');
    displayDialog("Congratulations! Titan has been defeated.");
    scene.input.once('pointerdown', () => {
        scene.state = STATES.TITLE_SCREEN;
        resetGame(scene);
    });
}

// Integrate Titan into storyline and gameplay
addEventListener('load', () => {
    preloadAssets();
    createScenes();
    const scene = initializeScene();
    checkLevelProgress(scene);
});
