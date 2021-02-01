window.radugen = window.radugen || {};
radugen.generators = radugen.generators || {};
radugen.generators.dungeons = radugen.generators.dungeons || {};

// Define the dungeon generator algorithms
radugen.generators.dungeonGenerator = Object.freeze({
    None: -1,
    Static: 1,
    Grid: 2,
    GenV1: 3,
});

// Define the dungeon sizes
radugen.generators.dungeonSize = Object.freeze({
    Custom: 0,
    Tiny: 1,
    Small: 2,
    Medium: 2,
    Large: 3,
    Huge: 4,
    Gargantuan: 5,
});

radugen.generators.dungeon = class {
    /**
     * @param {number} width
     * @param {number} height
     * @param {string} name
     */
    constructor(width, height, name) {
        this._name = name || 'Dummy';
        this._width = width;
        this._height = height;
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
        return this._width;
    }

    /**
     * @type {number}
     */
    get height(){
        return this._height;
    }

    createEmptyMap() {
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