let tiers = {
    rest: { poor: 0.50, good: 0.30, restful: 0.20 },
    encounters: { common: 0.50, uncommon: 0.45, rare: 0.04, legendary: 0.01 },
    commonOutcomes: {rest: 0.25, combat: 0.25, investigate: 0.25, flavor: 0.25},
    eventOutcomes: {flavor: 0.25, combat: 0.25, investigate: 0.25, loot: 0.25},
    investigate: { flavor: 0.50, encounter: 0.30, danger: 0.20},
    enemyStrength: {weak: 0.20, normal: 0.60, strong: 0.20},
    enemyStrengthMultiplier: {weak: 0.75, normal: 1, strong: 1.2}
};