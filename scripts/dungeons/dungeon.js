window.radugen = window.radugen || {};
radugen.generators = radugen.generators || {};
radugen.generators.dungeons = radugen.generators.dungeons || {};

// Define the dungeon generator algorithms
radugen.generators.dungeonGenerator = Object.freeze({
    Simple: 1,
    Homebrew: 2,
    Cave: 3,
    Maze: 4,
    Room: 5,
    Preview: -1,
    randomRoomShape: -2,
});

// Define the dungeon sizes
radugen.generators.dungeonSize = Object.freeze({
    Tiny: 1,
    Small: 2,
    Medium: 3,
    Large: 4,
    Huge: 5,
    Gargantuan: 6
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
    static async generate(dungeonType, dungeonSize){
        const generatorClass = (dungeonType in radugen.generators.dungeons) ? radugen.generators.dungeons[dungeonType] : radugen.generators.dungeon;
        const generator = new generatorClass(dungeonSize);
        generator._type = parseInt(dungeonType);
        generator._size = parseInt(dungeonSize);
        await generator.generate();
        return generator;
    }
    

    /**
     * @type {number}
     */
    get roomCount(){
        switch (this.size) {
            case radugen.generators.dungeonSize.Tiny: return 3;
            case radugen.generators.dungeonSize.Small: return 5;
            case radugen.generators.dungeonSize.Medium: return 7;
            case radugen.generators.dungeonSize.Large: return 9;
            case radugen.generators.dungeonSize.Huge: return 11;
            case radugen.generators.dungeonSize.Gargantuan: return 14;
        }
    };


    intersects(tiles1, tiles2) {
        let tileInfo1 = this.getSize(tiles1);
        let tileInfo2 = this.getSize(tiles2);

        return !(
            tileInfo1.left > tileInfo2.right || 
            tileInfo1.right < tileInfo2.left || 
            tileInfo1.top > tileInfo2.bottom || 
            tileInfo1.bottom < tileInfo2.top
        );
    }

    getSize(tiles){
        let minX = Math.min(...tiles.map(pos => pos.x));
        let maxX = Math.max(...tiles.map(pos => pos.x));
        let minY = Math.min(...tiles.map(pos => pos.y));
        let maxY = Math.max(...tiles.map(pos => pos.y));

        let width = maxX - minX + 1;
        let height = maxY - minY + 1;

        return {
            width: width,
            height: height,
            left: minX,
            top: minY,
            right: maxX,
            bottom: maxY
        };
    }

    rasterizeReal(){
        const TileType = radugen.classes.tiles.TileType;

        const minY = this.minY;
        const minX = this.minX;

        const grid = Array.from({length: this.height}).map((_, y) => Array.from({length: this.width}).map((_, x) => 
            new radugen.classes.tiles.Tile(x + minX, y + minY, TileType.Void)
        ));

        for(let tile of this._grid){
            grid[tile.y - minY][tile.x - minX] = tile;
        }

        return new radugen.classes.tiles.TileGrid(grid);
    }

    rasterize(){
        const TileType = radugen.classes.tiles.TileType;

        const minY = this.minY;
        const minX = this.minX;

        const grid = Array.from({length: this.height + 2}).map((_, y) => Array.from({length: this.width + 2}).map((_, x) => 
            new radugen.classes.tiles.Tile(x + minX, y + minY, TileType.Void)
        ));

        for(let tile of this._grid){
            grid[tile.y - minY + 1][tile.x - minX + 1] = tile;
        }

        return new radugen.classes.tiles.TileGrid(grid);
    }

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