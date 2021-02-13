window.radugen = window.radugen || {};
radugen.generators = radugen.generators || {};
radugen.generators.dungeons = radugen.generators.dungeons || {};

radugen.generators.dungeons[radugen.generators.dungeonGenerator.Preview] = class extends radugen.generators.dungeon {
    constructor() {
        super('Preview');
    }

    generate() {
        const [Tile, TileType] = [radugen.classes.tiles.Tile, radugen.classes.tiles.TileType];
        this._grid = [
            new Tile(0, 0, TileType.Room), new Tile(1, 0, TileType.Room), new Tile(2, 0, TileType.Room),
            new Tile(0, 1, TileType.Room), new Tile(1, 1, TileType.Room), new Tile(2, 1, TileType.Room),
        ];
        this._rooms = [];
        this._paths = [];

        return this._grid;
    }
};