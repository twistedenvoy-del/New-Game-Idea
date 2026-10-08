//---combat---//

function startCombat(enemy) {
    currentEnemy = {...enemy};
    document.getElementById("combat-menu").style.display = "block";
    combatLog.innerHTML = "";
    combatMessages = [];
    chargedAttack = null;
    ui.updateUI();
}

let enemyScaling = {health: 0.20, attack: 0.07, defense: 0.04};

function dangerLevel(enemy) {
    let attackValues = enemyPool.map(item => item.attack);
    let lowestAttack = Math.min(...attackValues);
    let highestAttack = Math.max(...attackValues);
    let levelScale = run.currentLevel - 1;
    
    let floor = Math.round(lowestAttack * (1 + levelScale * enemyScaling.attack) * 0.75);
    let ceiling = Math.round(highestAttack * (1 + levelScale * enemyScaling.attack) * 1.2);
    let normalized = (enemy.attack - floor) / (ceiling - floor);
    let high = Math.min(normalized, 1);
    let final = Math.max(high, 0);
    return final;
}

function getSaveChance(chance) {
    let minSave = 0.05;
    let maxSave = 0.20;

    let saveChance = (minSave + chance * (maxSave - minSave));
    return saveChance;
}

function getCurseAmount(dangerNormalized) {
    let minCurse = 1;
    let maxCurse = 3;
    let curseAmount = Math.round(maxCurse - dangerNormalized * (maxCurse - minCurse));
    return curseAmount;
}

let stats = ["str", "dex", "end", "int", "cha", "luck"];

function applyCurse(enemy) {
    let curseAmount = getCurseAmount(dangerLevel(enemy));
    let curse = Math.floor(Math.random() * stats.length);
    let chosenStat = stats[curse];
    let currentValue = run[chosenStat];

    let loopCount = 0;
    
    while (currentValue - curseAmount < 5 && loopCount < 10) {
        curse = Math.floor(Math.random() * stats.length);
        chosenStat = stats[curse];
        currentValue = run[chosenStat];
        loopCount++;
    }
    
    if ( currentValue - curseAmount >= 5) {
            run[chosenStat] -= curseAmount;
            run.cursed[chosenStat] += curseAmount;
        }
}

function attemptSave(enemy) {
    if (!run.hasUsedFirstSave) {
        run.hasUsedFirstSave = true;
        run.currentHealth = Math.floor(getRandomAmount(50, 76) / 100 * run.currentMaxHealth);
        alert("Fate smiled upon you, and the enemey left you clinging to life. Probably shouldn't test the fates again!");
        return true;
    }
    let save = getSaveChance(dangerLevel(enemy));
    let roll = Math.random();

    if (roll < save)  {
        run.currentHealth = 1;
        applyCurse(enemy);
        alert("You somehow managed to survive again, but this time you feel weakened from the encounter.")
        return true;
    }
    return false;
}

function getRandomStat(base, low, high) {
    let roll = getRandomAmount(low, high + 1);
    let multiplier = roll / 100;
    let stat = Math.floor(base * multiplier);
    return stat;
}

function getScaledEnemy(enemy) {
    let scaledEnemy = {...enemy};
    let levelScale = run.currentLevel - 1;
    scaledEnemy.health = getRandomStat(scaledEnemy.health * (1 + levelScale * enemyScaling.health), 90, 110);
    scaledEnemy.maxHealth = scaledEnemy.health;
    scaledEnemy.attack = getRandomStat(scaledEnemy.attack * (1 + levelScale * enemyScaling.attack), 80, 120);
    scaledEnemy.defense = getRandomStat(scaledEnemy.defense * (1 + levelScale * enemyScaling.defense), 80, 120);
    scaledEnemy.speed = getRandomStat(scaledEnemy.speed, 80, 120);
    console.log(scaledEnemy);
    return scaledEnemy;
}

function didEnemeyMiss() {
    let minChance = run.dex / 100;
    let maxChance = Math.min(minChance + 0.05, 0.40);
    let randomChance = Math.random() * (maxChance - minChance) + minChance;
    let roll = Math.random();
    return roll < randomChance;
}

function calculateDamage(attackValue) {
    let minAttack = attackValue * 0.15;
    let endDamage = Math.min(run.end * 0.02, 0.50);
    return Math.floor(Math.max(minAttack, attackValue - (attackValue * endDamage)));
}

function applyEnemyDamage(enemy, damage, chosenAttack) {
    if (isDefending) {
        const reducedDamage = Math.floor(Math.max(0, damage) / 2);
        run.currentHealth -= reducedDamage;
       addMessage(`You defended against the ${enemy.name}'s ${chosenAttack.name}! You took ${reducedDamage} damage.`);
    } else {
        run.currentHealth -= damage;
        addMessage(`The ${enemy.name} attacked with ${chosenAttack.name} for ${damage} damage!`);
    }

    if (run.currentHealth < 0) run.currentHealth = 0;
}

function playerAttack(enemy) {
    let weaponBonus = run.currentRace === "human" ? 10 : 0;
    const rawDamage = run.str * 3 + weaponBonus + (run.currentLevel - 1) * 2;
    const damageReduction = Math.min(enemy.defense * 0.1, 0.5);
    const damage = Math.floor(rawDamage *(1 - damageReduction));
    enemy.health -= damage;
    if (enemy.health < 0) enemy.health = 0;
    addMessage(`You attacked the ${enemy.name} for ${damage} damage!`);
}

function enemyAttack(enemy) {
    let chosenAttack;
    if (chargedAttack) {
        chosenAttack = chargedAttack;
        chargedAttack = null;
    }
     else {
        const randomIndex = Math.floor(Math.random() * enemy.attacks.length);
        chosenAttack = enemy.attacks[randomIndex];
        if (chosenAttack.charged) {
            chargedAttack = chosenAttack;
            addMessage(`The ${enemy.name} is charging up ${chosenAttack.name}!`);
            return;
        }
     }
    let attackValue = Math.floor(enemy.attack * chosenAttack.power);
    
    if (didEnemeyMiss()) {
        addMessage(`The ${enemy.name} missed their attack!`);
        return;
    }

    const damage = calculateDamage(attackValue);
    applyEnemyDamage(enemy, damage, chosenAttack);
}

function fleeCombat() {
    let roll = Math.random();
    if (roll < run.dex / (run.dex + currentEnemy.speed)) {
        currentEnemy = null;
        addMessage("You successfully fled the combat!");
        document.getElementById("combat-menu").style.display = "none";
        document.getElementById("location-screen").style.display = "block";
    } else {
        addMessage("You failed to flee! The enemy attacks you.");
        enemyAttack(currentEnemy);
        checkGameOver();
    }
}

function checkGameOver() {
    if (run.currentHealth <= 0) {
        if (attemptSave(currentEnemy)) {
            currentEnemy = null;
            combatMessages = [];
            combatLog.textContent = "";
            document.getElementById("combat-menu").style.display = "none";
            return;
        }
        addMessage("Game Over! You have been defeated.");
        profile.metaExp += run.currentLevel * 10;
        updateMetaDisplay();
        document.getElementById("combat-menu").style.display = "none";
        currentEnemy = null;
        combatMessages = [];
        combatLog.textContent = "";
        gameScreen.style.display = "none";
        raceSelectDiv.style.display = "block";
        raceSelect.value = "";
        saveProfile();
    }
}