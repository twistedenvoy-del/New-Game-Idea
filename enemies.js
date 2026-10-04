let thug = {
    name: "Thug",
    health: 100,
    attacks: [{name: "Stab", power: 0.7}, {name: "Slash", power: 1}],
    attack: 18,
    defense: 10,
    speed: 11
}

let mutatedDog = {
    name: "Mutated Dog",
    health: 125,
    attacks: [{name: "Bite", power: 0.8}, {name: "Claw", power: 1}, {name: "Flurry Swipe", power: 2, charged: true}],
    attack: 22,
    defense: 5,
    speed: 15,
}

let zombie = {
    name: "Zombie",
    health: 150,
    attacks: [{name: "Lunge", power: 0.6}, {name: "Scratch", power: 1}],
    attack: 15,
    defense: 12,
    speed: 7
}

let werewolf = {
    name: "Savage Werewolf",
    health: 95,
    attacks: [{name: "Frenzy Bite", power: 0.6}, {name: "Vicious Claw", power: 1.3}, {name: "Shred", power:2.2, charged: true}],
    attack: 26,
    defense: 2,
    speed: 20
}

let enemyPool = [thug, mutatedDog, zombie, werewolf];

function getRandomEnemy() {
    const randomIndex = Math.floor(Math.random() * enemyPool.length);
    return enemyPool[randomIndex];
}  
