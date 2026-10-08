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

//---metaUpgrades---//

function getUpgradeCost(upgrade) {
    let startingCost = upgrades[upgrade].cost;
    let total = profile.upgrades[upgrade] || 0;
    return startingCost * (total + 1);
}

function purchaseUpgrade(upgrade) {
    if (profile.metaExp >= getUpgradeCost(upgrade)) {
        profile.metaExp -= getUpgradeCost(upgrade);
        profile.upgrades[upgrade] = (profile.upgrades[upgrade] || 0) + 1;
        saveProfile();
    }
}