window.radugen = window.radugen || {};
radugen.generators = radugen.generators || {};
radugen.generators.dungeons = radugen.generators.dungeons || {};

radugen.generators.dungeons[radugen.generators.dungeonGenerator.GenV2] = class extends radugen.generators.dungeon {
    /**
     * @param {radugen.generators.dungeonSize} dungeonSize
     */
    constructor(dungeonSize) {
        super('genV2');
    }

    generate() {
        const grid = [];
        const rooms = new radugen.generators.dungeons.rooms.randomRoomGenerator(grid, this.roomCount).generate();
        const paths = new radugen.generators.dungeons.pathfinding.adjecentPathfinding(grid).generate(rooms);

        this._grid = grid;
        this._rooms = rooms;
        this._paths = paths;
        return grid;
    }
};