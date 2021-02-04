window.radugen = window.radugen || {};
radugen.generators = radugen.generators || {};
radugen.generators.dungeons = radugen.generators.dungeons || {};

// Define the dungeon generator algorithms
radugen.generators.dungeonGenerator = Object.freeze({
    GenV1: 3,
    Grid: 2,
    Static: 1,
});

// Define the dungeon sizes
radugen.generators.dungeonSize = Object.freeze({
    Tiny: 1,
    Small: 2,
    Medium: 2,
    Large: 3,
    Huge: 4,
    Gargantuan: 5,
    Custom: 0,
});

radugen.generators.dungeon = class {
    /**
     * @param {string} name
     */
    constructor(name) {
        this._name = name || 'Dummy';
        this._map = [];
        this._rooms = [];
    }

    /**
     * @param {radugen.generators.dungeonGenerator} dungeonType
     * @param {radugen.generators.dungeonSize} dungeonSize
     * @returns {radugen.generators.dungeon}
     */
    static generate(dungeonType, dungeonSize){
        const generatorClass = (dungeonType in radugen.generators.dungeons) ? radugen.generators.dungeons[dungeonType] : radugen.generators.dungeon;
        const generator = new generatorClass(dungeonSize);
        generator.generate();
        return generator;
    }

    get valid(){
        return this._width > 0 && this._height > 0;
    }

    /**
     * The dungeon generator name.
     * @type {string}
     */
    get name(){
        return this._name;
    }

    /**
     * @type {number}
     */
    get width(){
        return this.height == 0 ? 0 : this._map[0].length;
    }

    /**
     * @type {number}
     */
    get height(){
        return this._map.length;
    }

    createEmptyMap() {
        const [width, height] = [16, 12];
        this._map = [];
        for (let y = 0; y < this.height; y++) {
            this._map[y] = [];
            for (let x = 0; x < this.width; x++) {
                this._map[y][x] = 0;
            }
        }
    }

    generate() {
        this.createEmptyMap();
    }
};