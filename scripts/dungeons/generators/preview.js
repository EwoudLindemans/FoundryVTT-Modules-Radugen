window.radugen = window.radugen || {};
radugen.generators = radugen.generators || {};
radugen.generators.dungeons = radugen.generators.dungeons || {};

radugen.generators.dungeons[radugen.generators.dungeonGenerator.GenV2] = class extends radugen.generators.dungeon {
    constructor() {
        super('preview');
    }

    generate() {
        this._grid = [
            [new Tile(x, y, TileType.Room), new Tile(x, y, TileType.Room)]
            [new Tile(x, y, TileType.Room), new Tile(x, y, TileType.Room)]
        ];
        return this._grid;
    }
};