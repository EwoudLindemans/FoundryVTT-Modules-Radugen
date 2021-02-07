window.radugen = window.radugen || {};
radugen.generators = radugen.generators || {};
radugen.generators.dungeons = radugen.generators.dungeons || {};

radugen.generators.dungeons[radugen.generators.dungeonGenerator.GenV1] = class extends radugen.generators.dungeon {
    /**
     * @param {radugen.generators.dungeonSize} dungeonSize
     */
    constructor(dungeonSize) {
        super('genV1');
    }

    generate() {
        const grid = [];
        const rooms = new radugen.generators.dungeons.rooms.crossRoomGenerator(grid, this.roomCount).generate();
        const paths = new radugen.generators.dungeons.pathfinding.adjecentPathfinding(grid).generate(rooms);

        this._grid = grid;
        this._rooms = rooms;
        this._paths = paths;
        return grid;
    }
};