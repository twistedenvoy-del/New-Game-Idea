let human = {
    name: "human",
    healthMod: -10,
    staminaMod: 0,
    strMod: -2,
    dexMod: 1,
    endMod: 2,
    intMod: 2,
    chaMod: 0,
    luckMod: 0,
    gold: 10,
    inventory: ["Health Potion"],
    perks: ["Survivalist"],
    skills: ["Quick witted"],
};

let wolf = {
    name: "wolf",
    healthMod: 20,
    staminaMod: 10,
    strMod: 3,
    dexMod: 2,
    endMod: 1,
    intMod: -1,
    chaMod: -2,
    luckMod: 0,
    gold: 5,
    inventory: ["Wolf Fang"],
    perks: ["Night Vision"],
    skills: ["Scent Tracking"],
};

let vampire = {
    name: "vampire",
    healthMod: -10,
    staminaMod: 30,
    strMod: 2,
    dexMod: 3,
    endMod: -2,
    intMod: 1,
    chaMod: 2,
    luckMod: -3,
    gold: 15,
    inventory: ["Blood Vial"],
    perks: ["Frenzy"],
    skills: ["Shadow Step"],
};

let races = {
    human: human,
    wolf: wolf,
    vampire: vampire,
};

function getRace(raceName) {
    return races[raceName];
}