let currentEnemy = null;
let isDefending = false;
let expGainAmount = 5;
let staged = { str: 0, dex: 0, end: 0, int: 0, cha: 0, luck: 0 };
let investigateAvailable = false;
let inventoryOpen = false;
let chosenItem = null;
let selectedElement = null;

//---utilities---//

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

function getRandomAmount(min, max) {
    let span = max-min;

    let amount = Math.floor(Math.random() * span + min);
    return amount;
}

//---Exploration and encounters---//

const handlers = {
    common: handleCommon, 
    uncommon: handleUncommon, 
    rare: handleRare, 
    legendary: handleLegendary
};

function loot(goldMin, goldMax, expMin, expMax) {
    let result = Math.random() < 0.50;

    if (result) {
        let goldAmount = getRandomAmount(goldMin, goldMax);
        run.gold += goldAmount;
        alert(`You received ${goldAmount} gold`);
    }
    else {
        let expAmount = getRandomAmount(expMin, expMax);
        expGain(expAmount);
        alert(`You received ${expAmount} exp`);
    }
}

function explore() {
    let roll = rollTier(tiers.encounters);
    console.log(roll);
    handlers[roll]();
}

const commonHandlers = {
    rest: restAtCampsite,
    combat: function() { startCombat(getScaledEnemy(getRandomEnemy())); },
    investigate: function() { investigateAvailable = true; document.getElementById("investigate-button").style.display = "block"; },
    flavor: function() { console.log("You found nothing of interest."); },
};

function handleCommon () {
    let outcome = rollTier(tiers.commonOutcomes);
    commonHandlers[outcome]();
    console.log(outcome);;
}

const uncommonHandlers = {
    combat: function() { startCombat(getScaledEnemy(getRandomEnemy())); },
    investigate: function() { investigateAvailable = true; document.getElementById("investigate-button").style.display = "block"; },
    flavor: function() { console.log("You found nothing of interest."); },
    loot: function() { loot(5, 15, 10, 20); }
};

function handleUncommon() {
    let outcome = rollTier(tiers.eventOutcomes);
    uncommonHandlers[outcome]();
    console.log(outcome);
}

const rareHandlers = {
    combat: function() { startCombat(getScaledEnemy(getRandomEnemy())); },
    investigate: function() { investigateAvailable = true; document.getElementById("investigate-button").style.display = "block"; },
    flavor: function() { console.log("You found nothing of interest."); },
    loot: function() { loot(25, 35, 30, 40); }
};

function handleRare() {
    let outcome = rollTier(tiers.eventOutcomes);
    rareHandlers[outcome]();
    console.log(outcome);
}

function handleLegendary() {
    loot(70, 90, 130, 150);
}

const lootHandlers = {
    gold:() => {let gold = getRandomAmount(5,16); run.gold += gold;},
    exp: () => {let random = getRandomAmount(5, 21); expGain(random);},
    loot: () => {let item = Math.floor(Math.random() * itemList.length);
    run.inventory.push(itemList[item]);
    }
}

const investigateHandlers = {
    flavor: () => {alert("You found Nothing.")},
    danger: () => {startCombat(getScaledEnemy(getRandomEnemy()));},
    loot: () => {let result =rollTier(tiers.lootOutcomes); lootHandlers[result]();}
}

function investigate() {
    let roll = rollTier(tiers.investigate);
    investigateHandlers[roll]();
}

//---combat---//

function startCombat(enemy) {
    currentEnemy = {...enemy};
    document.getElementById("combat-menu").style.display = "block";
    ui.updateUI();
}

let enemyScaling = {health: 0.15, attack: 0.07, defense: 0.02};

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

function getScaledEnemy(enemy) {
    let scaledEnemy = {...enemy};
    let rolledTier = rollTier(tiers.enemyStrength);
    let multiplier = tiers.enemyStrengthMultiplier[rolledTier];
    let levelScale = run.currentLevel - 1;
    scaledEnemy.health = Math.round(scaledEnemy.health * (1 + levelScale * enemyScaling.health) * multiplier);
    scaledEnemy.maxHealth = scaledEnemy.health;
    scaledEnemy.attack = Math.round(scaledEnemy.attack * (1 + levelScale * enemyScaling.attack) * multiplier);
    scaledEnemy.defense = Math.round(scaledEnemy.defense * (1 + levelScale * enemyScaling.defense) * multiplier);
    return scaledEnemy;
}

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
        return;
    }
    const damage = Math.max(0, enemy.attack - run.end);
    if (isDefending) {
        const reducedDamage = Math.floor(Math.max(0, enemy.attack - run.end) / 2);
        run.currentHealth -= reducedDamage;
        console.log(`You defended against the ${enemy.name}'s attack! You took ${reducedDamage} damage.`);
    } else {
        run.currentHealth -= damage;
        console.log(`The ${enemy.name} attacked you for ${damage} damage!`);
    }

    if (run.currentHealth < 0) run.currentHealth = 0;
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
        if (attemptSave(currentEnemy)) {
            currentEnemy = null;
            document.getElementById("combat-menu").style.display = "none";
            return;
        }
        console.log("Game Over! You have been defeated.");
        document.getElementById("combat-menu").style.display = "none";
        currentEnemy = null;
        gameScreen.style.display = "none";
        raceSelectDiv.style.display = "block";
        raceSelect.value = "";
        // Reset the game or handle game over logic here
    }
}

//---rest---//

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

//---leveling---//

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
   
//---stats---//

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