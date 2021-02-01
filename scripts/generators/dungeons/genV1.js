window.radugen = window.radugen || {};
radugen.generators = radugen.generators || {};
radugen.generators.dungeons = radugen.generators.dungeons || {};

radugen.generators.dungeons[radugen.generators.dungeonGenerator.GenV1] = class extends radugen.generators.dungeon {
    /**
     * @param {radugen.generators.dungeonSize} dungeonSize
     */
    constructor(dungeonSize) {
        const size = getDungeonSize(dungeonSize);

        super(size.width, size.height);

        this._dungeonSize = dungeonSize;
    }

    /**
     * @type {radugen.generators.dungeonSize} dungeonSize
     * @returns {radugen.helper.size}
     */
    static getDungeonSize(dungeonSize){
        switch (dungeonSize) {
            case radugen.generators.dungeonSize.Tiny:
                return new radugen.helper.size(12, 8);
            case radugen.generators.dungeonSize.Small:
                return new radugen.helper.size(18, 12);
            case radugen.generators.dungeonSize.Medium:
                return new radugen.helper.size(24, 16);
            case radugen.generators.dungeonSize.Large:
                return new radugen.helper.size(32, 24);
            case radugen.generators.dungeonSize.Huge:
                return new radugen.helper.size(42, 32);
            case radugen.generators.dungeonSize.Gargantuan:
                return new radugen.helper.size(56, 40);
            default:
                return new radugen.helper.size(24, 16);
        }
    }

    get dungeonSize(){
        return this._dungeonSize;
    }

    createGrid() {
        let grid = [];
        for (let y = 0; y < this._height; y++) {
            grid[y] = [];
            for (let x = 0; x < this._width; x++) {
                grid[y][x] = 0;
            }
        }
        return grid;
    }

    generate() {
        return this.createGrid();
    }
};