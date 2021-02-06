window.radugen = window.radugen || {};
radugen.generators = radugen.generators || {};
radugen.generators.dungeons = radugen.generators.dungeons || {};

// Define the dungeon generator algorithms
radugen.generators.dungeonGenerator = Object.freeze({
    GenV3: 5,
    GenV2: 4,
    GenV1: 3,
    Grid: 2,
    Static: 1,
    LayoutV1: 6,
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
    WTF: 6
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
     */f
    static generate(dungeonType, dungeonSize){
        const generatorClass = (dungeonType in radugen.generators.dungeons) ? radugen.generators.dungeons[dungeonType] : radugen.generators.dungeon;
        const generator = new generatorClass(dungeonSize);
        generator._type = dungeonType;
        generator._size = dungeonSize;
        generator.generate();
        return generator;
    }


    /**
     * @type {number}
     */
    get roomCount(){
        switch (parseInt(this.size)) {
            case radugen.generators.dungeonSize.Tiny: return 3;
            case radugen.generators.dungeonSize.Small: return 5;
            case radugen.generators.dungeonSize.Medium: return 7;
            case radugen.generators.dungeonSize.Large: return 9;
            case radugen.generators.dungeonSize.Huge: return 11;
            case radugen.generators.dungeonSize.Gargantuan: return 14;
            case radugen.generators.dungeonSize.WTF: return 100;
        }
    };

    /**
     * Whether the dungeon is valid, probably.
     * @type {boolean}
     */
    get valid(){
        return this._width > 0 && this._height > 0;
    }

    /**
     * @type {radugen.generators.dungeonGenerator}
     */
    get type(){
        return this._type;
    }

    /**
     * @type {radugen.generators.dungeonSize}
     */
    get size(){
        return this._size;
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

    /**
     * @type {radugen.helper.shape[]}
     */
    get rooms(){
        return this._rooms;
    }

    /**
     * @type {Array.<number[]>}
     */
    get map(){
        return this._map;
    }

    /**
     * @param {width} number
     * @param {height} number
     * @returns {Array.<number[]>}
     */
    createEmptyMap(width, height) {
        const grid = [];
        for (let y = 0; y < height; y++) {
            grid[y] = [];
            for (let x = 0; x < width; x++) {
                grid[y][x] = 0;
            }
        }
        return grid;
    }

    generate() {
        this._map = this.createEmptyMap(16, 12);
    }
};