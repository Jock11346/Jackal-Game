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
