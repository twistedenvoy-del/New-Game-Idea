let profile = {
    level: 1,
    metaExp: 0,
    unlockedRaces: ["human", "wolf", "vampire"],
    upgrades: {}
};

let defaultRun = {
    currentLevel: 1,
    currentExp: 0,
    currentRace: null,
    currentHealth: 100,
    currentMaxHealth: 100,
    currentStamina: 100,
    currentMaxStamina: 100,
    skills: [],
    skillPoints: 0,
    day: 1,
    str: 10,
    dex: 10,
    end: 10,
    int: 10,
    cha: 10,
    luck: 10,
    gold: 0,
    inventory: [],
    perks: [],
    abilities: [],
    confirmLevelUpButtonDisabled: false,
    hasUsedFirstSave: false,
    cursed: {str: 0, dex: 0, end: 0, int: 0, cha: 0, luck: 0}
};

let run = { ...defaultRun };

function saveProfile() {
    localStorage.setItem("profile", JSON.stringify(profile));
}

function loadProfile() {
    const savedProfile = localStorage.getItem("profile");
    if (savedProfile) {
        profile = JSON.parse(savedProfile);
    }
}

function startNewRun(raceName) {
    let race = getRace(raceName);
    run = { ...defaultRun };
    run.currentRace = raceName;
    run.currentHealth += race.healthMod;
    run.currentMaxHealth += race.healthMod;
    run.currentStamina += race.staminaMod;
    run.currentMaxStamina += race.staminaMod;
    run.str += race.strMod;
    run.dex += race.dexMod;
    run.end += race.endMod;
    run.int += race.intMod;
    run.cha += race.chaMod;
    run.luck += race.luckMod;
    run.gold += race.gold;
    run.inventory = [...race.inventory];
    run.perks = [...race.perks];
    run.skills = [...race.skills];
    run.skillPoints = 0;
    run.cursed = {str: 0, dex: 0, end: 0, int: 0, cha: 0, luck: 0};
    for (let key in profile.upgrades) {
        run[upgrades[key].stat] += upgrades[key].amount * profile.upgrades[key];
    } 
    saveRun();
}

function saveRun() {
    localStorage.setItem("run", JSON.stringify(run));
}

function loadRun() {
    const savedRun = localStorage.getItem("run");
    if (savedRun) {
        run = JSON.parse(savedRun);
    }
}