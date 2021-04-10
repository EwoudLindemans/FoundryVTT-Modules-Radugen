window.radugen = window.radugen || {};
radugen.generators = radugen.generators || {};
radugen.generators.dungeons = radugen.generators.dungeons || {};

radugen.generators.dungeons[radugen.generators.dungeonGenerator.Simple] = class extends radugen.generators.dungeon {
    constructor() {
        super('Simple');
    }

    getCorridorTiles(room1, room2, invertAxis) {
        const tiles = [];
        const [Tile, TileType, rnd] = [radugen.classes.tiles.Tile, radugen.classes.tiles.TileType, radugen.helper.getRndFromNum];

        let room1Info = this.getSize(room1.tiles);
        let room2Info = this.getSize(room2.tiles);

        let x1 = invertAxis ? room2Info.left + rnd(room2Info.width - 1) : room2Info.left;
        let x2 = invertAxis ? room1Info.left + rnd(room1Info.width - 1) : room1Info.right + 1;
        let y1 = invertAxis ? room2Info.top : room2Info.top + rnd(room2Info.height - 1);
        let y2 = invertAxis ? room1Info.bottom + 1 : room1Info.top + rnd(room1Info.height - 1);

        let xDiff = Math.abs(x1 - x2);
        let yDiff = Math.abs(y1 - y2);

        let split = invertAxis ? rnd(yDiff) - 1 + Math.min(y1, y2) : rnd(xDiff) - 1 + Math.min(x1, x2);
        let stopAxis = invertAxis ? Math.max(y1, y2) : Math.max(x1, x2);
        for (let axis = invertAxis ? Math.min(y1, y2) : Math.min(x1, x2); axis < stopAxis; axis++) {
            if (axis < split) {
                let tile = new Tile(invertAxis ? x2 : axis, invertAxis ? axis : y2, TileType.Corridor);
                tile.debug = 'green';
                tiles.push(tile);

            } else if (axis > split) {
                let tile = new Tile(invertAxis ? x1 : axis, invertAxis ? axis : y1, TileType.Corridor);
                tile.debug = 'blue';
                tiles.push(tile);
            } else if (axis == split) {
                let stopOppositeAxis = invertAxis ? Math.max(x1, x2) : Math.max(y1, y2);
                for (let oppositeAxis = invertAxis ? Math.min(x1, x2) : Math.min(y1, y2); oppositeAxis <= stopOppositeAxis; oppositeAxis++) {
                    let tile = new Tile(invertAxis ? oppositeAxis : axis, invertAxis ? axis : oppositeAxis, TileType.Corridor);
                    tile.debugInfo = oppositeAxis;

                    tile.debug = 'orange';

                    tiles.push(tile);
                }
            }
            else {
                console.error('wtf', axis, split);
            }
        }
        return tiles;
    }

    getTilesForRoom(ox, oy, w, h, room) {
        const [Tile, TileType] = [radugen.classes.tiles.Tile, radugen.classes.tiles.TileType];
        let tiles = [];
        for (let x = ox; x < ox + w; x++) {
            for(let y = oy; y < oy + h; y++) {
                tiles.push(new Tile(x, y, TileType.Room));
            }
        }
        return tiles;
    }   

    generateRooms() {
        const [Tile, TileType] = [radugen.classes.tiles.Tile, radugen.classes.tiles.TileType];
        const pushRoomToGrid = (ox, oy, w, h) => {
            for(let x = ox; x < ox + w; x++){
                for(let y = oy; y < oy + h; y++){
                    let tile = new Tile(x, y, TileType.Room);
                    this._grid.push(tile);
                }
            }
        };

        const [rect, rnd, directions] = [radugen.helper.rect, radugen.helper.getRndFromNum, radugen.helper.directions];
        const [width, height] = radugen.generators.dungeons.rooms.getRoomSize();
        let startRoom = {
            adjecent: null,
            direction: null,
            index: 0,
            distance: 0,
            connections: 0,
            tiles: []
        }

        startRoom.tiles = this.getRoomTiles(0, 0, width, height, startRoom);
        for (let tile of startRoom.tiles) { this._grid.push(tile); }
        let rooms = [startRoom];

        for (let roomIndex = 1; roomIndex < this.roomCount; roomIndex++) {
            //We have to create x rooms
            let success = false;
            while (!success) {
                const adjecent = rnd(roomIndex) - 1;
                const [w, h] = radugen.generators.dungeons.rooms.getRoomSize();
                const direction = rnd(4);
        
                let adjecentRoomInfo = this.getSize(rooms[adjecent].tiles);

                let ox = 0, oy = 0;
                switch (direction) {
                    case directions.North:
                        ox = adjecentRoomInfo.left + rnd(adjecentRoomInfo.width) - rnd(w) - 1;
                        oy = adjecentRoomInfo.top - h - rnd(3) - 2;
                        break;
                    case directions.West:
                        ox = adjecentRoomInfo.left - w - rnd(3) - 2;
                        oy = adjecentRoomInfo.top + rnd(adjecentRoomInfo.height) - rnd(h) - 1;
                        break;
                    case directions.South:
                        ox = adjecentRoomInfo.left + rnd(adjecentRoomInfo.width) - rnd(w) - 1;
                        oy = adjecentRoomInfo.bottom + rnd(3) + 2;
                        break;
                    case directions.East:
                        ox = adjecentRoomInfo.right + rnd(3) + 2;
                        oy = adjecentRoomInfo.top + rnd(adjecentRoomInfo.height) - rnd(h) - 1;
                        break;
                }

                if (rooms.find(r => this.intersects(r.tiles, this.getTilesForRoom(ox, oy, w, h)))) continue;

                success = true;

                let room = {
                    connections: 0,
                    index: roomIndex,
                    adjecent: rooms[adjecent],
                    direction: direction,
                    distance: rooms[adjecent].distance + 1,
                    tiles: []
                };

                room.tiles = this.getRoomTiles(ox, oy, w, h, room);


                for (let tile of room.tiles) { this._grid.push(tile); }
                rooms.push(room);
            }
        }

        this._rooms = rooms;

        let corridor = {
            tiles: []
        };
        for (let room of this._rooms) {
            if (room.adjecent != null || room.direction != null) {
                let directions = radugen.helper.directions;

                switch (room.direction) {
                    case directions.North:
                        corridor.tiles = this.getCorridorTiles(room, room.adjecent, true);
                        break;
                    case directions.West:
                        corridor.tiles = this.getCorridorTiles(room, room.adjecent, false);
                        break;
                    case directions.South:
                        corridor.tiles = this.getCorridorTiles(room.adjecent, room, true);
                        break;
                    case directions.East:
                        corridor.tiles = this.getCorridorTiles(room.adjecent, room, false)
                        break;
                }
            }

            for (var tile of corridor.tiles) { this._grid.push(tile); }
        }
    }

    getRoomTiles(ox, oy, w, h, room) {
        const [Tile, TileType] = [radugen.classes.tiles.Tile, radugen.classes.tiles.TileType];
        let tiles = [];

        for (let x = ox; x < ox + w; x++) {
            for (let y = oy; y < oy + h; y++) {
                let tile = new Tile(x, y, TileType.Room);
                tile.room = room;
                tiles.push(tile);
            }
        }
        return tiles;
    };


    generate() {
        this.generateRooms();
        return this._grid;
    }
};