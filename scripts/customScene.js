window.radugen = window.radugen || {};
radugen.customScene = class extends Scene{
    constructor(){
        const dungeon_names = ["Vault", "Catacombs", "Dungeon", "Palace", "Eternal"];
        const curiosities = ["Endless Suffering", "Agony Burrows", "Dream Cells", "Mystic", "Back Itches", "Paper Cuts"];

        let grid = [20, 20];
        let size = 256;

        super({
            _id: radugen.helper.uuidv4(),
            name: `The ${radugen.helper.getRndFromArr(dungeon_names)} of ${radugen.helper.getRndFromArr(curiosities)}`,
            shiftX: 0,
            shiftY: 0,
            width: grid[0] * size,
            height: grid[1] * size,
            padding: 0,
            img: 
        });
    }
};