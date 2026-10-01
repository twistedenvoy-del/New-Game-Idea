let ui = {
    updateUI: function () {
        // Update the UI elements based on the current state of the run
        document.getElementById("health").innerText = `Health: ${run.currentHealth}/${run.currentMaxHealth}`;
        document.getElementById("stamina").innerText = `Stamina: ${run.currentStamina}/${run.currentMaxStamina}`;
        document.getElementById("day").innerText = `Day: ${run.day}`;
        document.getElementById("gold").innerText = `Gold: ${run.gold}`;
        document.getElementById("str").innerText = `Strength: ${run.str} ${run.cursed.str > 0 ? `(-${run.cursed.str})` : ""}`;
        document.getElementById("dex").innerText = `Dexterity: ${run.dex} ${run.cursed.dex > 0 ? `(-${run.cursed.dex})` : ""}`;
        document.getElementById("end").innerText = `Endurance: ${run.end} ${run.cursed.end > 0 ? `(-${run.cursed.end})` : ""}`;
        document.getElementById("int").innerText = `Intelligence: ${run.int} ${run.cursed.int > 0 ? `(-${run.cursed.int})` : ""}`;
        document.getElementById("cha").innerText = `Charisma: ${run.cha} ${run.cursed.cha > 0 ? `(-${run.cursed.cha})` : ""}`;
        document.getElementById("luck").innerText = `Luck: ${run.luck} ${run.cursed.luck > 0 ? `(-${run.cursed.luck})` : ""}`;
        document.getElementById("perks").innerText = `Perks: ${run.perks.join(", ")}`;
        document.getElementById("skills").innerText = `Skills: ${run.skills.join(", ")}`;
        document.getElementById("currentRace").innerText = `Current Race: ${run.currentRace}`;
        document.getElementById("enemy-name").innerText = currentEnemy ? `Enemy: ${currentEnemy.name}` : "No enemy";
        document.getElementById("enemy-health").innerText = currentEnemy ? `Enemy Health: ${currentEnemy.health}` : "";
        document.getElementById("combat-menu").style.display = currentEnemy ? "block" : "none";
        document.getElementById("location-screen").style.display = (currentEnemy || inventoryOpen) ? "none" : "block";
        document.getElementById("inventory-screen").style.display = inventoryOpen ? "block" : "none";
        document.getElementById("exp").innerText = `EXP: ${run.currentExp}`;
        document.getElementById("level").innerText = `Level: ${run.currentLevel}`;
        document.getElementById("exp").textContent = `EXP: ${run.currentExp} / ${expToNextLevel()}`;
        document.getElementById("Str").innerText = `Strength: ${run.str + staged.str}`;
        document.getElementById("Dex").innerText = `Dexterity: ${run.dex + staged.dex}`;
        document.getElementById("End").innerText = `Endurance: ${run.end + staged.end}`;
        document.getElementById("Int").innerText = `Intelligence: ${run.int + staged.int}`;
        document.getElementById("Cha").innerText = `Charisma: ${run.cha + staged.cha}`;
        document.getElementById("Luck").innerText = `Luck: ${run.luck + staged.luck}`;
        exploreButton.style.display = investigateAvailable ? "none" : "";
        restButton.style.display = investigateAvailable ? "none" : "";
        inventoryButton.style.display = investigateAvailable ? "none" : "";
        shopButton.style.display = investigateAvailable ? "none" : "";
        inventoryItem.innerHTML = "";
        run.inventory.forEach(item => {
            let result = document.createElement("div");
            result.innerText = item;
            inventoryItem.appendChild(result);
        });
    },
};
let gameScreen = document.getElementById("game-screen");
let startButton = document.getElementById("confirm-race");
let raceSelect = document.getElementById("race-dropdown");
let raceSelectDiv = document.getElementById("race-select");
let attackButton = document.getElementById("attack-button");
let defendButton = document.getElementById("defend-button");
let useItemButton = document.getElementById("use-item-button");
let fleeButton = document.getElementById("flee-button");
let exploreButton = document.getElementById("explore-button");
let shopButton = document.getElementById("shop-button");
let inventoryButton = document.getElementById("inventory-button");
let investigateButton = document.getElementById("investigate-button");
let restButton = document.getElementById("rest-button");
let sidebarButton = document.getElementById("toggle-sidebar");
let strengthButton = document.getElementById("str-up");
let returnStrButton = document.getElementById("str-down");
let dexterityButton = document.getElementById("dex-up");
let returnDexButton = document.getElementById("dex-down");
let enduranceButton = document.getElementById("end-up");
let returnEndButton = document.getElementById("end-down");
let intelligenceButton = document.getElementById("int-up");
let returnIntButton = document.getElementById("int-down");
let charismaButton = document.getElementById("cha-up");
let returnChaButton = document.getElementById("cha-down");
let luckButton = document.getElementById("luck-up");
let returnLuckButton = document.getElementById("luck-down");
let confirmLevelUpButton = document.getElementById("confirm-level-up");
let exitButton = document.getElementById("exit-button");
let inventoryItem = document.getElementById("inventory-items");
let useInventory = document.getElementById("use-inventory-button");

startButton.addEventListener("click", function () {
    let selectedRace = raceSelect.value;
    if (selectedRace === "") {
    alert("Please select a race before starting.");
    return;
}
    startNewRun(selectedRace);
    gameScreen.style.display = "block";
    raceSelectDiv.style.display = "none";
    ui.updateUI();
});

inventoryButton.addEventListener("click", function () {
    inventoryOpen = true;
    ui.updateUI();
});

exitButton.addEventListener("click", function () {
    inventoryOpen = false;
    ui.updateUI();
});

inventoryItem.addEventListener("click", function(event) {
    chosenItem = event.target.innerText;
    if (selectedElement) {selectedElement.classList.remove("selected")}
    event.target.classList.add("selected");
    selectedElement = event.target;
});

sidebarButton.addEventListener("click", function () {
    let sidebar = document.getElementById("sidebar-menu");
    if (sidebar.style.display === "none" || sidebar.style.display === "") {
        sidebar.style.display = "block";
    } else {
        sidebar.style.display = "none";
    }
});

attackButton.addEventListener("click", function () {
    if (currentEnemy) {
        playerAttack(currentEnemy);
        if (currentEnemy.health <= 0) {
            alert(`You defeated the ${currentEnemy.name}!`);
            expGain(Math.floor(expGainAmount + (currentEnemy.maxHealth * 0.2)));
            currentEnemy = null;
            document.getElementById("combat-menu").style.display = "none";
            
        } else {
            enemyAttack(currentEnemy);
            checkGameOver();
        }
        ui.updateUI();
    } else {
        alert("No enemy to attack!");
    }
});

defendButton.addEventListener("click", function () {
    isDefending = true;
    enemyAttack(currentEnemy);
    isDefending = false;
    checkGameOver();
    ui.updateUI();
});

useItemButton.addEventListener("click", function () {
    useSelectedItem();
    alert("You used an item!");
    ui.updateUI();
});

useInventory.addEventListener("click", function() {
    useSelectedItem();
    ui.updateUI();
});

fleeButton.addEventListener("click", function () {
    if (currentEnemy) {
        fleeCombat();
        ui.updateUI();
    } else {
        alert("No enemy to flee from!");
    }
});

exploreButton.addEventListener("click", function () {
    explore();
    ui.updateUI();
});

restButton.addEventListener("click", function () {
    restAtCampsite();
});

investigateButton.addEventListener("click", function () {
    if (investigateAvailable) {
        investigate();
        investigateAvailable = false;
        document.getElementById("investigate-button").style.display = "none";
    ui.updateUI();
    }
});

strengthButton.addEventListener("click", function () {
    stageStat("str");
    ui.updateUI();
});

returnStrButton.addEventListener("click", function () {
    unstageStat("str");
    ui.updateUI();
});

dexterityButton.addEventListener("click", function () {
    stageStat("dex");
    ui.updateUI();
});

returnDexButton.addEventListener("click", function() {
    unstageStat("dex");
    ui.updateUI();
});

enduranceButton.addEventListener("click", function () {
    stageStat("end");
    ui.updateUI();
});

returnEndButton.addEventListener("click", function() {
    unstageStat("end");
    ui.updateUI();
});

intelligenceButton.addEventListener("click", function () {
    stageStat("int");
    ui.updateUI();
});

returnIntButton.addEventListener("click", function() {
    unstageStat("int");
    ui.updateUI();
});

charismaButton.addEventListener("click", function () {
    stageStat("cha");
    ui.updateUI();
});

returnChaButton.addEventListener("click", function() {
    unstageStat("cha");
    ui.updateUI();
});

luckButton.addEventListener("click", function () {
    stageStat("luck");

    ui.updateUI();
});

returnLuckButton.addEventListener("click", function() {
    unstageStat("luck");
    ui.updateUI();
});

confirmLevelUpButton.addEventListener("click", function () {
    confirmStatAllocation();
    document.getElementById("level-up-screen").style.display = "none";
    document.getElementById("location-screen").style.display = "block";
    ui.updateUI();
    saveRun();
});