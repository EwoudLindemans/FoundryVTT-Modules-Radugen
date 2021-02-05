window.radugen = window.radugen || {};
radugen.generators = radugen.generators || {};
radugen.generators.dungeons = radugen.generators.dungeons || {};

radugen.generators.dungeons[radugen.generators.dungeonGenerator.Grid] = class extends radugen.generators.dungeon {
    /**
     * @param {radugen.generators.dungeonSize} dungeonSize
     */
    constructor(dungeonSize) {
        super('Grid');
    }

    /**
     * @type {radugen.helper.size}
     */
    get dimensions() {
        switch (this._size) {
            case radugen.generators.dungeonSize.Tiny:
                return new radugen.helper.size(10, 6);
            case radugen.generators.dungeonSize.Small:
                return new radugen.helper.size(12, 9);
            case radugen.generators.dungeonSize.Medium:
                return new radugen.helper.size(18, 12);
            case radugen.generators.dungeonSize.Large:
                return new radugen.helper.size(24, 16);
            case radugen.generators.dungeonSize.Huge:
                return new radugen.helper.size(32, 24);
            case radugen.generators.dungeonSize.Gargantuan:
                return new radugen.helper.size(42, 32);
            default:
                return new radugen.helper.size(20, 20);
        }
    }

    createGrid() {
        const grid = [];
        const [width, height] = [this.dimensions.width, this.dimensions.height];
        for (let y = 0; y < height; y++) {
            grid[y] = [];
            for (let x = 0; x < width; x++) {
                grid[y][x] = 1;
            }
        }
        return grid;
    }

    generate() {
        this._map = this.createGrid();
        return this._map;
    }
};