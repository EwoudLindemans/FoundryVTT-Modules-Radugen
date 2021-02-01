window.radugen = window.radugen || {};
radugen.generators = radugen.generators || {};
radugen.generators.dungeons = radugen.generators.dungeons || {};

radugen.generators.dungeons[radugen.generators.dungeonGenerator.GenV1] = class extends radugen.generators.dungeon {
    /**
     * @param {radugen.generators.dungeonSize} dungeonSize
     */
    constructor(dungeonSize) {
        this._width = 24;
        this._height = 16;
    }

    createGrid() {
        let grid = [];
        for (let x = 0; x < this._width; x++) {
            grid[x] = [];
            for (let y = 0; y < this._height; y++) {
                grid[y][x] = 0;
            }
        }
        return grid;
    }

    generate() {
        return this.createGrid();
    }
};