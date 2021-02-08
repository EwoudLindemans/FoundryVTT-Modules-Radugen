window.radugen = window.radugen || {};
radugen.generators = radugen.generators || {};
radugen.generators.dungeons = radugen.generators.dungeons || {};

// Define the dungeon generator algorithms
radugen.generators.dungeonGenerator = Object.freeze({
    GenV2: 2,
    GenV1: 1,
    LayoutV1: 3,
});

// Define the dungeon sizes
radugen.generators.dungeonSize = Object.freeze({
    Tiny: 1,
    Small: 2,
    Medium: 2,
    Large: 3,
    Huge: 4,
    Gargantuan: 5
});

radugen.generators.dungeon = class {
    /**
     * @param {string} name
     */
    constructor(name) {
        this._name = name || 'Dummy';
        this._grid = [];
        this._rooms = [];
        this._paths = [];
    }

    /**
     * @param {radugen.generators.dungeonGenerator} dungeonType
     * @param {radugen.generators.dungeonSize} dungeonSize
     * @returns {radugen.generators.dungeon}
     */
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
        }
    };

    rasterize(){
        const TileType = radugen.classes.tiles.TileType;
        const grid = Array.from({ length: this.height + 2 }).map(_ => Array.from({ length: this.width + 2 }).map(_ => TileType.Void));

        const minY = this.minY;
        const minX = this.minX;

        for(let tile of this._grid){
            grid[tile.y - minY + 1][tile.x - minX + 1] = tile.type;
        }

        return grid;
    }
/*

        const offset_x = -Math.min(...rooms.map(r => r.rect.x1)) + 1;
        const offset_y = -Math.min(...rooms.map(r => r.rect.y1)) + 1;
        const w = (Math.max(...rooms.map(r => r.rect.x2)) - Math.min(...rooms.map(r => r.rect.x1))) + 1;
        const h = (Math.max(...rooms.map(r => r.rect.y2)) - Math.min(...rooms.map(r => r.rect.y1))) + 1;
*/

    /**
     * @type {number}
     */
    get minX(){
        return Math.min(...this._grid.map(pos => pos.x));
    }

    /**
     * @type {number}
     */
    get maxX(){
        return Math.max(...this._grid.map(pos => pos.x));
    }

    /**
     * @type {number}
     */
    get minY(){
        return Math.min(...this._grid.map(pos => pos.y));
    }

    /**
     * @type {number}
     */
    get maxY(){
        return Math.max(...this._grid.map(pos => pos.y));
    }

     /**
     * @type {number}
     */
    get width(){
        return this.maxX - this.minX + 1;
    }

    /**
     * @type {number}
     */
    get height(){
        return this.maxY - this.minY + 1;
    }

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
     * @type {radugen.helper.rect[]}
     */
    get rooms(){
        return this._rooms;
    }

    /**
     * @type {Array.<number[]>}
     */
    get map(){
        return this._grid;
    }
};