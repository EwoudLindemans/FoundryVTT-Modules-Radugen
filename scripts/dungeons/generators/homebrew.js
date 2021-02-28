window.radugen = window.radugen || {};
radugen.generators = radugen.generators || {};
radugen.generators.dungeons = radugen.generators.dungeons || {};

radugen.generators.dungeons[radugen.generators.dungeonGenerator.Homebrew] = class extends radugen.generators.dungeon {
    constructor() {
        super('default');

        const rnd = radugen.helper.getRndFromNum;
        this.liquidChance = Math.max(0, rnd(100) - 20);
    }

    vladVille(startPoints, endPoints){
        const [Tile, TileType, rnd] = [radugen.classes.tiles.Tile, radugen.classes.tiles.TileType, radugen.helper.getRndFromNum];
        let iterateStack = [];

        const offsetX = this.minX, offsetY = this.minY;
        const rasterizedGrid = this.rasterizeReal()._grid;
        const gridMinX = this.minX - offsetX, gridMaxX = this.maxX - offsetX, gridMinY = this.minY - offsetY, gridMaxY = this.maxY - offsetY;
        let vladzerizedGrid = Array.from({length: this.height}).map((_, y) => Array.from({length: this.width}).map((_, x) => null));
        const winners = [];
        const dracula = (x, y, grid, countDracula) => {
            //Check if point exists on grid
            if (x < gridMinX || y < gridMinY || x > gridMaxX  || y > gridMaxY) {return;} 

            //Check if we already processed this tile
            if (grid[y][x] != null){ 
                return;
            } 

            //Check if we have a winning condition
            for(let i = 0; i < endPoints.length; i++){ 
                if(x + offsetX == endPoints[i].x && y + offsetY == endPoints[i].y){
                    grid[y][x] = countDracula;
                    winners.push([x, y, countDracula]);
                    return true;
                }
            }
            // if(rasterizedGrid[y][x].type == TileType.Corridor){
            //     winners.push([x, y, countDracula]);
            //     return true;
            // }

            // Check if we have to evade this tile
            if(rasterizedGrid[y][x].type == TileType.Room && countDracula != 0){
                return;
            } 

            // if(rasterizedGrid[y][x].type == TileType.Void){
            //     let tile = new Tile(x + offsetX, y + offsetY, TileType.Corridor);
            //     tile.debug = `rgba(254,0,${countDracula * 30}, 1)`;
            //     tile.debugInfo = countDracula;
            //     this._grid.push(tile)
            // }

            grid[y][x] = countDracula;
            const diagonal = false;
            for (let a = 0; a < 360; a += diagonal ? 45 : 90){
                const rad = a * Math.PI / 180;
                const [xx,yy] = [Math.round(Math.sin(rad)), Math.round(Math.cos(rad))];

                //Make sure we dont hit walls
                if (rasterizedGrid[y][x].wall.left && xx == -1 ||
                    rasterizedGrid[y][x].wall.top && yy == -1 ||
                    rasterizedGrid[y][x].wall.right && xx == 1 ||
                    rasterizedGrid[y][x].wall.bottom && yy == 1) 
                {
                    continue;
                }

                iterateStack.push(() => dracula(x + xx, y + yy, grid, countDracula + 1));
            }
        }

        //Start dracula
        for (let startPoint of startPoints){ dracula(startPoint.x - offsetX, startPoint.y - offsetY, vladzerizedGrid, 0); };
        for(let i = 0; i < iterateStack.length; i++){ if(iterateStack[i]() == true){ break; } }

        iterateStack = [];
        const alucard = (x, y, grid, countAlucard, start) => {
            if (x < gridMinX || y < gridMinY || x > gridMaxX  || y > gridMaxY) {return;} //Check if point exists on grid
            if(countAlucard == 0){return true;}
            if(countAlucard == grid[y][x]){
                if (start != grid[y][x]) {
                    let tile = new Tile(x + offsetX, y + offsetY, TileType.Corridor)
                    tile.debug = `rgba(${countAlucard * 30},200,254, 1)`;
                    tile.debugInfo = countAlucard;
                    this._grid.push(tile);
                }

                const diagonal = false;
                //Go to a random count thats lower than the current
                let randomOffset = rnd(4) - 1;
                randomOffset = randomOffset * 90;
                for (let a = 0; a < 360; a += diagonal ? 45 : 90) {
                    const rad = a * Math.PI / 180;
                    const [xx, yy] = [Math.round(Math.sin(rad)), Math.round(Math.cos(rad))];

                    if (x + xx < gridMinX || y + yy < gridMinY || x + xx > gridMaxX || y + yy > gridMaxY) { continue; }

                    // //Make sure we dont hit walls
                    // if (rasterizedGrid[y][x].wall.left && xx == -1 ||
                    //     rasterizedGrid[y][x].wall.top && yy == -1 ||
                    //     rasterizedGrid[y][x].wall.right && xx == 1 ||
                    //     rasterizedGrid[y][x].wall.bottom && yy == 1) 
                    // {
                    //     continue;
                    // }

                    if (grid[y + yy][x + xx] == countAlucard - 1) {
                        iterateStack.push(() => alucard(x + xx, y + yy, grid, countAlucard - 1));
                        break;
                    }
                }
            }
        }

        //Start alucard
        for(let i = 0; i < winners.length; i++){ //Check if we have a winning condition
            alucard(winners[i][0], winners[i][1], vladzerizedGrid, winners[i][2], winners[i][2]);
        }
        for(let i = 0; i < iterateStack.length; i++){ //Iterate the grid
            if(iterateStack[i]() == true){break;}
        }

        return vladzerizedGrid;
    }

    getCorridorTiles(room, invertAxis) {
        const [Tile, TileType] = [radugen.classes.tiles.Tile, radugen.classes.tiles.TileType];
        
        if(!room.adjecent){
            return;
        }

        //Handle these var's as array
        let startPoints = room.tiles.filter(x => x.isPassage && x.passage.target == room.adjecent.index);
        let endPoints = room.adjecent.tiles.filter(x => x.isPassage && x.passage.target == room.index);
        
        if (startPoints.length == 0 || endPoints.length == 0){
            return;
        }
        
        this.vladVille(startPoints, endPoints, function(tile){
            return tile.type != TileType.Room;
        });
    }
    
    createEntrance(room1, room2, invertAxis){
        const [rnd] = [radugen.helper.getRndFromNum];

        let room1Info = this.getSize(room1.tiles);
        let room2Info = this.getSize(room2.tiles);

        let x1 = invertAxis ? room2Info.left + rnd(room2Info.width - 1) : room2Info.left;
        let x2 = invertAxis ? room1Info.left + rnd(room1Info.width - 1) : room1Info.right + 1;
        let y1 = invertAxis ? room2Info.top : room2Info.top + rnd(room2Info.height - 1);
        let y2 = invertAxis ? room1Info.bottom + 1 : room1Info.top + rnd(room1Info.height - 1);

        //TODO: if walls bang, make corridor

        //Register tiles as entrance on the room
        for (let tile of room2.tiles) {
            if (tile.x == x1 && tile.y == y1) {
                if (invertAxis) {
                    tile.room.connections += 1;
                    tile.debug = 'red';
                    tile.disallowObjectPlacement = true;
                    tile.wall.top = false;
                    tile.passage.top = true;
                    tile.passage.target = room1.index;
                }
                else {
                    tile.room.connections += 1;
                    tile.debug = 'orange';
                    tile.disallowObjectPlacement = true;
                    tile.wall.left = false;
                    tile.passage.left = true;
                    tile.passage.target = room1.index;
                }
            }
        }
        for (let tile of room1.tiles) {
            if (tile.x == x2 && tile.y == y2 - 1) {
                tile.room.connections += 1;
                tile.debug = 'blue';
                tile.disallowObjectPlacement = true;
                tile.wall.bottom = false;
                tile.passage.bottom = true;
                tile.passage.target = room2.index;
            }
            if (tile.x == x2 - 1 && tile.y == y2) {
                tile.room.connections += 1;
                tile.debug = 'green';
                tile.disallowObjectPlacement = true;
                tile.wall.right = false;
                tile.passage.right = true;
                tile.passage.target = room2.index;
            }
        }
    }

    getRandomSquareWithinSquare(x, y, w, h) {
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
        for (let x = ox; x < ox + w; x++) {
            for(let y = oy; y < oy + h; y++) {
                tiles.push(new Tile(x, y, TileType.Room));
            }
        }
        return tiles;
    }

    getRoomTiles(ox, oy, w, h, room) {
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
        else {
            room.liquid = false;
        }

        for (let x = ox; x < ox + w; x++) {
            for (let y = oy; y < oy + h; y++) {
                let roomtile = TileType.Room
                if (lavasquares.indexOf(`${x},${y}`) != -1) {
                    roomtile = TileType.Liquid
                }

                let tile = new Tile(x, y, roomtile);
                tile.room = room;
                if (x == ox) { tile.wall.left = true; }
                if (x == ox + w - 1) { tile.wall.right = true; }
                if (y == oy) { tile.wall.top = true; }
                if (y == oy + h - 1) { tile.wall.bottom = true; }
                tiles.push(tile);
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
                if (room.adjecent != null || room.direction != null) {
                    let directions = radugen.helper.directions;

                    switch (room.direction) {
                        case directions.North:
                            this.createEntrance(room, room.adjecent, true);
                            break;
                        case directions.West:
                            this.createEntrance(room, room.adjecent, false);
                            break;
                        case directions.South:
                            this.createEntrance(room.adjecent, room, true);
                            break;
                        case directions.East:
                            this.createEntrance(room.adjecent, room, false)
                            break;
                    }
                }

                for (let tile of room.tiles) { this._grid.push(tile); }
                rooms.push(room);
            }
        }
        

        //Pathfinding
        let corridors = [];
        for(let room of rooms){
            if(room.adjecent){
                let corridor = this.getCorridorTiles(room, rooms[room.adjecent]);
                corridors.push(corridor);
            }
        }

        // for (var corridor of corridors) { 
        //     this._grid.push(corridor); 
        // }

        this._rooms = rooms;
        this._corridors = corridors;
    }

    generate() {
        this.generateRooms();
    }
};


