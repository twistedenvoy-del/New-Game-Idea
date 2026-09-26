let thug = {
    name: "Thug",
    health: 100,
    attack: 20,
    defense: 10,
    speed: 11
};

let mutatedDog = {
    name: "Mutated Dog",
    health: 125,
    attack: 25,
    defense: 7,
    speed: 15,
}

let enemyPool = [thug, mutatedDog];

function getRandomEnemy() {
    const randomIndex = Math.floor(Math.random() * enemyPool.length);
    return enemyPool[randomIndex];
}  
