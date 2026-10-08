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