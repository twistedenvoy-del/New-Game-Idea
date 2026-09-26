let currentEnemy = null;
let isDefending = false;
let expGainAmount = 5;
let pointsToAllocate = [0, 0, 0, 0, 0, 0]; 
let staged = { str: 0, dex: 0, end: 0, int: 0, cha: 0, luck: 0 };

function playerAttack(enemy) {
    const damage = Math.max(0, run.str * 2- enemy.defense);
    enemy.health -= damage;
    if (enemy.health < 0) enemy.health = 0;
    console.log(`You attacked the ${enemy.name} for ${damage} damage!`);
}

function enemyAttack(enemy) {
    let roll = Math.random();
    if (roll < 0.15) {
        console.log(`The ${enemy.name} missed their attack!`);
        run.currentHealth -= 0;
        return;
    }
    const damage = Math.max(0, enemy.attack - run.end);
    if (isDefending) {
        const reducedDamage = Math.floor(enemy.attack - run.end) / 2;
        run.currentHealth -= reducedDamage;
        console.log(`You defended against the ${enemy.name}'s attack! You took ${reducedDamage} damage.`);
    } else {
        run.currentHealth -= damage;
        console.log(`The ${enemy.name} attacked you for ${damage} damage!`);
    }

    if (run.currentHealth < 0) run.currentHealth = 0;
    console.log(`The ${enemy.name} attacked you for ${damage} damage!`);
}

function fleeCombat() {
    let roll = Math.random();
    if (roll < run.dex / (run.dex + currentEnemy.speed)) {
        console.log("You successfully fled the combat!");
        currentEnemy = null;
        document.getElementById("combat-menu").style.display = "none";
        document.getElementById("location-screen").style.display = "block";
    } else {
        console.log("You failed to flee! The enemy attacks you.");
        enemyAttack(currentEnemy);
        checkGameOver();
    }
}

function checkGameOver() {
    if (run.currentHealth <= 0) {
        console.log("Game Over! You have been defeated.");
        document.getElementById("combat-menu").style.display = "none";
        currentEnemy = null;
        gameScreen.style.display = "none";
        raceSelectDiv.style.display = "block";
        raceSelect.value = "";
        // Reset the game or handle game over logic here
    }
}


function startCombat(enemy) {
    currentEnemy = {...enemy};
    document.getElementById("combat-menu").style.display = "block";
    ui.updateUI();
}

const handlers = {common: handleCommon, uncommon: handleUncommon, rare: handleRare, legendary: handleLegendary};

function explore() {
    let roll = rollTier(tiers.encounters);

    handlers[roll]();
}

function investigate() {
    let roll = rollTier(tiers.investigate);
    if (roll === "flavor") {
        console.log("You found nothing.");
    } else if (roll === "encounter") {
        console.log("You found a small amount of gold!");
        run.gold += 10;
    } else {
        console.log("You encountered an enemy!");
        startCombat(getRandomEnemy());
    }
}

function expGain(amount) {
    run.currentExp += amount;
    console.log(`You gained ${amount} XP!`);
    checkLevelUp();
}

function checkLevelUp() {
    while (true) {
        let threshold = expToNextLevel();
        if (run.currentExp < threshold) {
            break;
        }
        document.getElementById("location-screen").style.display = "none";
        document.getElementById("combat-menu").style.display = "none";
        document.getElementById("level-up-screen").style.display = "block";
        run.currentLevel++;
        run.currentExp -= threshold;
        run.currentHealth = run.currentMaxHealth;
        run.currentStamina = run.currentMaxStamina;
        run.skillPoints ++;
    }
    document.getElementById("level-up-text").innerText = `Congratulations! You've reached level ${run.currentLevel}! You have ${run.skillPoints} skill points to allocate.`;
        
}

function expToNextLevel() {
    return run.currentLevel * 100;
}
   
function stageStat(stat) {
    if (run.skillPoints > 0) {
        staged[stat]++;
        run.skillPoints--;
        console.log(`Staged 1 point to ${stat}.`);
    } else {
        console.log("No skill points available to stage.");
    }
}

function unstageStat(stat) {
    if (staged[stat] > 0) {
        staged[stat]--;
        run.skillPoints++;
        console.log(`Unstaged 1 point from ${stat}.`);
    } else {
        console.log("No staged points to remove from this stat.");
    }
}

function confirmStatAllocation() {
    for (let stat in staged) {
        run[stat] += staged[stat];
        staged[stat] = 0;
    }
    console.log("Stat allocation confirmed.");
}

function rollTier(tiersObject) {
    let roll = Math.random();
    let total = 0;

    for (let tier in tiersObject) {
        total += tiersObject[tier];
        if (roll < total) {
            return tier
        }
    }
}

function restAtCampsite() {
    let result = rollTier(tiers.rest);
    let healPercentage = 0;
    if (result === "poor") {
        healPercentage = 0.15;
    }
    else if (result === "good") {
        healPercentage = 0.45;
    }
    else {
        healPercentage = 0.85;
    }
    run.currentHealth += run.currentMaxHealth * healPercentage;
    if (run.currentHealth > run.currentMaxHealth) run.currentHealth = run.currentMaxHealth;
    console.log(`You rested and healed ${result} health`);
    ui.updateUI(); 
}