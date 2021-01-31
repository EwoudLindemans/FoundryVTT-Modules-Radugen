window.radugen = window.radugen || {};
radugen.generators = radugen.generators || {};
radugen.generators.dungeons = radugen.generators.dungeons || {};

// Define the dungeon generator algorithms
radugen.generators.dungeonGenerator = Object.freeze({
    None: -1,
    Quirks: 0,
    Static: 1,
    Grid: 2
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
     * @param {number} width
     * @param {number} height
     * @returns {radugen.generators.dungeon}
     */
    static generate(dungeonType, width, height){
        const generatorClass = (dungeonType in radugen.generators.dungeons) ? radugen.generators.dungeons[dungeonType] : radugen.generators.dungeon;
        const generator = new generatorClass(width, height);
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
        for (var x = 0; x < this.width; x++) {
            this._map[x] = [];
            for (var y = 0; y < this.height; y++) {
                this._map[x][y] = 0;
            }
        }
    }

    generate() {
        this.createEmptyMap();
    }
};