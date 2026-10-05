let currentEnemy = null;
let isDefending = false;
let expGainAmount = 5;
let staged = { str: 0, dex: 0, end: 0, int: 0, cha: 0, luck: 0 };
let investigateAvailable = false;
let inventoryOpen = false;
let chosenItem = null;
let selectedElement = null;
let combatMessages = [];
let chargedAttack = null;

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

function addMessage(message) {
    if (!currentEnemy) {
        combatMessages = [];
    }
    combatMessages.push(message);
    if (combatMessages.length > 4) {
        combatMessages.shift();
    }
    combatLog.innerHTML = combatMessages.join("<br>");
}

function applyPerk(perk) {
    run[perk.stat] += perk.amount;
}


function generatePerk(perkKey) {
    let randomIndex = Math.floor(Math.random() * perkKey.length);
    let perk = perkKey[randomIndex];

    let selectedPerk = perks[perk];
    perkKey.splice(randomIndex, 1);
    return perk;
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
        addMessage(`You received ${goldAmount} gold`);
    }
    else {
        let expAmount = getRandomAmount(expMin, expMax);
        expGain(expAmount);
        addMessage(`You received ${expAmount} exp`);
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
    flavor: function() { addMessage(randomFlavorText(exploreFlavors.foundItem) + " " + randomFlavorText(exploreFlavors.discovered))},
};

function handleCommon () {
    let outcome = rollTier(tiers.commonOutcomes);
    commonHandlers[outcome]();
    console.log(outcome);;
}

const uncommonHandlers = {
    combat: function() { startCombat(getScaledEnemy(getRandomEnemy())); },
    investigate: function() { investigateAvailable = true; document.getElementById("investigate-button").style.display = "block"; },
    flavor: function() { { addMessage(randomFlavorText(exploreFlavors.foundItem) + " " + randomFlavorText(exploreFlavors.discovered))}; },
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
    flavor: function() { { addMessage(randomFlavorText(exploreFlavors.foundItem) + " " + randomFlavorText(exploreFlavors.discovered))}; },
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
    flavor: () => {addMessage("You found Nothing.")},
    danger: () => {startCombat(getScaledEnemy(getRandomEnemy()));},
    loot: () => {let result =rollTier(tiers.lootOutcomes); lootHandlers[result]();}
}

function investigate() {
    let roll = rollTier(tiers.investigate);
    investigateHandlers[roll]();
    addMessage(`You noticed something interesting and decided to investigate.`);
}

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
    const damageReduction = Math.min(enemy.defense * 0.2, 0.5);
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
        document.getElementById("combat-menu").style.display = "none";
        currentEnemy = null;
        combatMessages = [];
        combatLog.textContent = "";
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
    run.currentHealth += Math.round(run.currentMaxHealth * healPercentage);
    if (run.currentHealth > run.currentMaxHealth) run.currentHealth = run.currentMaxHealth;
    addMessage(`You rested and healed ${result} health`);
    ui.updateUI(); 
}

//---leveling---//

function expGain(amount) {
    let intBonus = Math.max(0, run.int - 10) * 0.01;
    amount += Math.floor(amount * intBonus);
    run.currentExp += amount;
    addMessage(`You gained ${amount} XP!`);
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
        run.currentMaxHealth += 20;
        run.currentMaxStamina += 5;
        
        let chance = Math.random();
        let additionalPoint = Math.min(0.25, Math.max(0, run.luck - 10) * 0.01);
        
        if (chance < additionalPoint) {
            run.skillPoints += 1;
        }
        run.skillPoints ++;
        confirmLevelUpButton.disabled = true
        let perkKey = Object.keys(perks);
        
        let perk1 = generatePerk(perkKey);
        let perk2 = generatePerk(perkKey);
        let perk3 = generatePerk(perkKey);
        let perkSelection = document.getElementById("perk-selection");
        perkSelection.innerHTML = `<h3>Choose a perk:</h3>
            <button id="perk1" data-perk = "${perk1}">${perks[perk1].name} (${perks[perk1].effect})</button>
            <button id="perk2" data-perk = "${perk2}">${perks[perk2].name} (${perks[perk2].effect})</button>
            <button id="perk3" data-perk = "${perk3}">${perks[perk3].name} (${perks[perk3].effect})</button>`;
            perkSelection.querySelectorAll("button").forEach(button => {
                button.addEventListener("click", function() {
                    confirmLevelUpButton.disabled = false;
                    let selectedPerk = this.getAttribute("data-perk");
                    applyPerk(perks[selectedPerk]);
                    run.currentHealth = run.currentMaxHealth;
                    run.currentStamina = run.currentMaxStamina;
                    addMessage(`You selected the perk: ${perks[selectedPerk].name}`);
                    perkSelection.innerHTML = "";
                    run.perks.push(perks[selectedPerk].name);
                    ui.updateUI();
                });
            });
            
    }
    document.getElementById("level-up-text").innerText = `Congratulations! You've reached level ${run.currentLevel}! You have ${run.skillPoints} skill points to allocate.`;
        
}

function perkCount(list) {
    let count = {};
    list.forEach(perk => {
        count[perk] = (count[perk] || 0) +1
        console.log(count[perk]);
    });
    return Object.keys(count).map(name => (count[name] > 1 ? `${name} (${count[name]})` : name)).join(", ");
}

function expToNextLevel() {
    return run.currentLevel * 100;
}
   
//---stats---//

function stageStat(stat) {
    if (run.skillPoints > 0) {
        staged[stat]++;
        run.skillPoints--;
        addMessage(`Staged 1 point to ${stat}.`);
    } else {
        addMessage("No skill points available to stage.");
    }
}

function unstageStat(stat) {
    if (staged[stat] > 0) {
        staged[stat]--;
        run.skillPoints++;
        addMessage(`Unstaged 1 point from ${stat}.`);
    } else {
        addMessage("No staged points to remove from this stat.");
    }
}

function confirmStatAllocation() {
    for (let stat in staged) {
        run[stat] += staged[stat];
        staged[stat] = 0;
    }
    addMessage("Stat allocation confirmed.");
}