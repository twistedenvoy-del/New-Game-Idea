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