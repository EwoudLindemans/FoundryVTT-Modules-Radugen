window.radugen = window.radugen || {};
radugen.generators = radugen.generators || {};
radugen.generators.dungeons = radugen.generators.dungeons || {};


radugen.generators.dungeons[radugen.generators.dungeonGenerator.Room] = class extends radugen.generators.dungeon {
    constructor() {
        super('room');
    }


    renderToGrid(room) {
        let grid = [];
        const [Tile, TileType] = [radugen.classes.tiles.Tile, radugen.classes.tiles.TileType];
        
        for (let x = 0; x < room.length; x++) {
            for (let y = 0; y < room[x].length; y++) {
                if(room[x][y] == "."){
                    let tile = new Tile(x, y, TileType.Room)
                    grid.push(tile);
                }
            }
        }

        return grid;
    }


    async generate() {
        let rooms = await radugen.classes.RoomLoader.loadRooms();
        let room = rooms[Math.floor(Math.random() * rooms.length)];

        this._grid = this.renderToGrid(room);

        return this._grid;
    }
};