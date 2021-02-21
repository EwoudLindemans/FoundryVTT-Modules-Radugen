window.radugen = window.radugen || {};
radugen.generators = radugen.generators || {};
radugen.generators.dungeons = radugen.generators.dungeons || {};

radugen.generators.dungeons[radugen.generators.dungeonGenerator.GenV3] = class extends radugen.generators.dungeon {
    constructor() {
        super('genV3');

        const rnd = radugen.helper.getRndFromNum;
        //20% no liquid
        //or
        //20 - 80% of the room liquid
        this.liquidChance = Math.max(0, rnd(100) - 20);
    }

    //TODO: corridor size (haha 1 functie :P), ik ben even een uurtje WIE IS DE MOL KIJKEN 
    createCorridorBetweenRooms(room1, room2, invertAxis) {
        const [Tile, TileType, rnd] = [radugen.classes.tiles.Tile, radugen.classes.tiles.TileType, radugen.helper.getRndFromNum];

        let room1Info = this.getSize(room1.tiles);
        let room2Info = this.getSize(room2.tiles);

        let xStart = invertAxis ? room2Info.left + rnd(room2Info.width - 1) : room2Info.left;
        let yStart = invertAxis ? room2Info.top : room2Info.top + rnd(room2Info.height - 1);

        let xEnd = invertAxis ? room1Info.left + rnd(room1Info.width - 1) : room1Info.right + 1;
        let yEnd = invertAxis ? room1Info.bottom + 1 : room1Info.top + rnd(room1Info.height - 1);

        let xDiff = Math.abs(xStart - xEnd);
        let yDiff = Math.abs(yStart - yEnd);

        let split = invertAxis ? rnd(yDiff - 2) + Math.min(yStart, yEnd) : rnd(xDiff - 2) + Math.min(xStart, xEnd);
        let stopAxis = invertAxis ? Math.max(yStart, yEnd) : Math.max(xStart, xEnd);
        for (let axis = invertAxis ? Math.min(yStart, yEnd) : Math.min(xStart, xEnd); axis < stopAxis; axis++) {
            if (axis < split) {
                this._grid.push(new Tile(invertAxis ? xEnd : axis, invertAxis ? axis : yEnd, TileType.Corridor));
            } else if (axis > split) {
                this._grid.push(new Tile(invertAxis ? xStart : axis, invertAxis ? axis : yStart, TileType.Corridor));
            } else {
                let stopOppositeAxis = invertAxis ? Math.max(xStart, xEnd) : Math.max(yStart, yEnd)
                for (let oppositeAxis = invertAxis ? Math.min(xStart, xEnd) : Math.min(yStart, yEnd); oppositeAxis <= stopOppositeAxis; oppositeAxis++) {
                    this._grid.push(new Tile(invertAxis ? oppositeAxis : axis, invertAxis ? axis : oppositeAxis, TileType.Corridor));
                }
            }
        }
    }

    getRandomSquareWithinSquare(x, y, w, h){
        const rnd = radugen.helper.getRndFromNum;
        //What is -3? //A wild magic number has appeared (1. fight, 2. run)
        let xstart = rnd(w - 3) - 1;
        let ystart = rnd(h - 3) - 1;
        let width = rnd(w - xstart);
        let height = rnd(h - ystart);
        xstart += x;
        ystart += y;
        return [xstart, ystart, width, height];
    }

    getTilesForRoom(ox, oy, w, h, room) {
        const [Tile, TileType] = [radugen.classes.tiles.Tile, radugen.classes.tiles.TileType];
        let tiles = [];
        for(let x = ox; x < ox + w; x++){
            for(let y = oy; y < oy + h; y++){
                tiles.push(new Tile(x, y, TileType.Room));
            }
        }
        return tiles;
    }

    pushRoomToGrid(ox, oy, w, h, room){
        const [Tile, TileType, rnd] = [radugen.classes.tiles.Tile, radugen.classes.tiles.TileType, radugen.helper.getRndFromNum];
        let tiles = [];

        let lavasquares = [];
        if (rnd(100) < this.liquidChance) {
            room.liquid = true;
            let [xstart, ystart, width, height] = this.getRandomSquareWithinSquare(ox, oy, w, h);
            //TODO: perhaps add some logic, if width or height == 1 // bias it to the side of the room
            //Would make for more natural feeling
            for (let x = xstart; x < xstart + width; x++) {
                for (let y = ystart; y < ystart + height; y++) {
                    lavasquares.push(`${x},${y}`);
                }
            }
        }
        else{
            room.liquid = false;
        }

        for(let x = ox; x < ox + w; x++){
            for(let y = oy; y < oy + h; y++){
                let roomtile = TileType.Room
                if (lavasquares.indexOf(`${x},${y}`) != -1) {
                    roomtile = TileType.Liquid
                }

                let tile = new Tile(x, y, roomtile);
                tile.room = room;
                if(x == ox){tile.wall.left = true;}
                if(x == ox + w - 1){tile.wall.right = true;}
                if(y == oy){tile.wall.top = true;}
                if(y == oy + h - 1){tile.wall.bottom = true;}
                tiles.push(tile);
                this._grid.push(tile);
            }
        }
        return tiles;
    };

    generateRooms() {
        const [rnd, directions] = [radugen.helper.getRndFromNum, radugen.helper.directions];
        const [width, height] = radugen.generators.dungeons.rooms.getRoomSize();

        let startRoom = {
            adjecent: null,
            direction: null,
            distance: 0
        }
        
        startRoom.tiles = this.pushRoomToGrid(0, 0, width, height, startRoom);

        let rooms = [startRoom];
        let corridors = [];

        for (let roomIndex = 1; roomIndex < this.roomCount; roomIndex++) {
            //We have to create x rooms
            let success = false;
            while (!success) {
                const adjecent = rnd(roomIndex) - 1;
                const [w, h] = radugen.generators.dungeons.rooms.getRoomSize();
        
                const direction = rnd(4);
        
                let ox = 0, oy = 0;

                let adjecentRoomInfo = this.getSize(rooms[adjecent].tiles);

                switch (direction) {
                    case directions.North:
                        ox = adjecentRoomInfo.left + rnd(adjecentRoomInfo.width) - rnd(w) - 1;
                        oy = adjecentRoomInfo.top - h - rnd(4) - 2;
                        break;
                    case directions.West:
                        ox = adjecentRoomInfo.left - w - rnd(4) - 2;
                        oy = adjecentRoomInfo.top + rnd(adjecentRoomInfo.height) - rnd(h) - 1;
                        break;
                    case directions.South:
                        ox = adjecentRoomInfo.left + rnd(adjecentRoomInfo.width) - rnd(w) - 1;
                        oy = adjecentRoomInfo.bottom + rnd(4) + 2;
                        break;
                    case directions.East:
                        ox = adjecentRoomInfo.right + rnd(4) + 2;
                        oy = adjecentRoomInfo.top + rnd(adjecentRoomInfo.height) - rnd(h) - 1;
                        break;
                }

                //Changed this so rooms can be next to eachother
                if (rooms.find(r => this.intersects(r.tiles, this.getTilesForRoom(ox, oy, w, h)))) continue;


                success = true;
                let room = {
                    index: roomIndex,
                    adjecent: rooms[adjecent],
                    direction: direction,
                    distance: rooms[adjecent].distance + 1
                };
                
                room.tiles = this.pushRoomToGrid(ox, oy, w, h, room);

                //generate corridor:
                if (room.adjecent != null || room.direction != null) {
                    let directions = radugen.helper.directions;
                    switch (room.direction) {
                        case directions.North:
                            this.createCorridorBetweenRooms(room, room.adjecent, true);
                            break;
                        case directions.West:
                            this.createCorridorBetweenRooms(room, room.adjecent, false);
                            break;
                        case directions.South:
                            this.createCorridorBetweenRooms(room.adjecent, room, true);
                            break;
                        case directions.East:
                            this.createCorridorBetweenRooms(room.adjecent, room, false)
                            break;
                    }
                }

                rooms.push(room);
            }
        }
        
        this._rooms = rooms;
        this._corridors = corridors;
    }

    generate() {
        this.generateRooms();
    }
};