const exploreFlavors = {
    foundItem: [
        "You find a mysterious item",
        "You discover a hidden stash of supplies",
        "You stumble upon a rare artifact",
        "You see useful items",
        "You find a treasure chest hidden",
        "You come across a strange bag",
    ],
    discovered: [
        "in a hidden cove.",
        "in a dark cave.",
        "in a dense forest.",
        "in a quiet meadow.",
        "in a bustling marketplace.",
        "in an abandoned ruin.",
    ]
};
const dangerFlavors = {};
const investigateFlavors = {};
const restFlavors = {};
const lootFlavors = {};
const storyEvents = {};

function randomFlavorText(array) {
    let randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
}