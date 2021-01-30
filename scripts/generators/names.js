window.radugen = window.radugen || {};
radugen.generators = radugen.generators || {};

const NameGenerators = class{
    constructor(){
        this._dungeon_names = ["Vault", "Catacombs", "Dungeon", "Palace", "Eternal", "Repository", "Lair", "Crypt", "Caves", "Maze"];
        this._curiosities = ["Endless Suffering", "Agony Burrows", "Dream Cells", "Mystic", "Back Itches", "Paper Cuts", "Random Bugs", "Calories", "Disappointments", "Lurking Dangers", "Eery Silence"];
    }

    /**
     * @type {string[]}
     */
    get dungeonNames(){
        return this._dungeon_names;
    }

    /**
     * @type {string[]}
     */
    get curiosities(){
        return this._curiosities;
    }

    /**
     * @returns {string}
     */
    dungeonName(){
        return `The ${radugen.helper.getRndFromArr(this.dungeonNames)} of ${radugen.helper.getRndFromArr(this.curiosities)}`;
    }
};

radugen.generators.names = new NameGenerators();