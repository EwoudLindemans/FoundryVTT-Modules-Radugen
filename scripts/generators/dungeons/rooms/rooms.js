window.radugen = window.radugen || {};
radugen.generators = radugen.generators || {};
radugen.generators.dungeons = radugen.generators.dungeons || {};
radugen.generators.dungeons.rooms = radugen.generators.dungeons.rooms || {};


radugen.generators.dungeons.rooms.roomSizes = [
    { occurance: .1, size: new radugen.helper.minMax(6, 12) },
    { occurance: .3, size: new radugen.helper.minMax(4, 8) },
    { occurance: .6, size: new radugen.helper.minMax(3, 6) },
];
radugen.generators.dungeons.rooms.getRoomSize = () => {
    const rand = Math.random() // get a random number between 0 and 1
    let accumulatedChance = 0 // used to figure out the current

    const dimensions = radugen.generators.dungeons.rooms.roomSizes.find(function(e) { // iterate through all elements 
        accumulatedChance += e.occurance // accumulate the chances
        return accumulatedChance >= rand // tests if the element is in the range and if yes this item is stored in 'found'
    });

    return Array.from({length: 2}, () => radugen.helper.getRndFromNum(dimensions.size.max - dimensions.size.min) + dimensions.size.min);
    // return [rnd(dimensions.size.max - dimensions.size.min) + dimensions.size.min, rnd(dimensions.size.max - dimensions.size.min) + dimensions.size.min];
};