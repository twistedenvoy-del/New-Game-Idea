const itemList = [
    "Black Box Cure"
];

let itemEffects = {
    "Black Box Cure": function () {
        stats.forEach(item => {
    run[item] += run.cursed[item];
    run.cursed[item] = 0;
});
    }
};

function useSelectedItem() {
    let effect = itemEffects[chosenItem];

    if (effect) {
        effect();
        run.inventory.splice(run.inventory.indexOf(chosenItem), 1);
    }
}