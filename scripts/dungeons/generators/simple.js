window.radugen = window.radugen || {};
radugen.generators = radugen.generators || {};
radugen.generators.dungeons = radugen.generators.dungeons || {};

radugen.generators.dungeons[radugen.generators.dungeonGenerator.Simple] = class extends radugen.generators.dungeon {
    constructor() {
        super('Simple');
    }

    roadsWE(room1, room2) {
        let xStart, yStart, xEnd, yEnd, xDiff, yDiff;
        const rnd = radugen.helper.getRndFromNum;
        const [Tile, TileType] = [radugen.classes.tiles.Tile, radugen.classes.tiles.TileType];

         //Random y
         xStart = room2.rect.left;
         yStart = room2.rect.top + rnd(room2.rect.height - 1); 

         xEnd = room1.rect.right + 1;
         yEnd = room1.rect.top + rnd(room1.rect.height - 1); 

         xDiff = Math.abs(xStart - xEnd);
         yDiff = Math.abs(yStart - yEnd);
         
         let splitX = rnd(xDiff - 2) + Math.min(xStart, xEnd);
         
         for (let x = Math.min(xStart, xEnd); x < Math.max(xStart, xEnd); x++) {
             if (x < splitX) {
                this._grid.push(new Tile(x, yEnd, TileType.Corridor));
             } else if (x > splitX) {
                this._grid.push(new Tile(x, yStart, TileType.Corridor));
             } else {
                 for (let y = Math.min(yStart, yEnd); y <= Math.max(yStart, yEnd); y++) {
                    this._grid.push(new Tile(x, y, TileType.Corridor));
                 }
             }
         }
    };

    roadsNS(room1, room2) {
        let xStart, yStart, xEnd, yEnd, xDiff, yDiff;
        const rnd = radugen.helper.getRndFromNum;
        const [Tile, TileType] = [radugen.classes.tiles.Tile, radugen.classes.tiles.TileType];

        //Random x 
        xStart = room2.rect.left + rnd(room2.rect.width - 1) ; 
        yStart = room2.rect.top;

        xEnd = room1.rect.left + rnd(room1.rect.width - 1);
        yEnd = room1.rect.bottom + 1;

        xDiff = Math.abs(xStart - xEnd);
        yDiff = Math.abs(yStart - yEnd);
        
        let splitY = rnd(yDiff - 2) + Math.min(yStart, yEnd);
        
        for (let y = Math.min(yStart, yEnd); y < Math.max(yStart, yEnd); y++) {
            if (y < splitY) {
                this._grid.push(new Tile(xEnd, y, TileType.Corridor));
            } else if (y > splitY) {
                this._grid.push(new Tile(xStart, y, TileType.Corridor));
            } else {
                for (let x = Math.min(xStart, xEnd); x <= Math.max(xStart, xEnd); x++) {
                    this._grid.push(new Tile(x, y, TileType.Corridor));
                }
            }
        }
    };

    generateRooms() {
        const [Tile, TileType] = [radugen.classes.tiles.Tile, radugen.classes.tiles.TileType];
        const pushRoomToGrid = (ox, oy, w, h) => {
            for(let x = ox; x < ox + w; x++){
                for(let y = oy; y < oy + h; y++){
                    let tile = new Tile(x, y, TileType.Room);
                    // if(x == ox){tile.wall.left = true;}
                    // if(x == ox + w - 1){tile.wall.right = true;}
                    // if(y == oy){tile.wall.top = true;}
                    // if(y == oy + h - 1){tile.wall.bottom = true;}
                    this._grid.push(tile);
                }
            }
        };

        const [rect, rnd, directions] = [radugen.helper.rect, radugen.helper.getRndFromNum, radugen.helper.directions];
        const [width, height] = radugen.generators.dungeons.rooms.getRoomSize();
        let rooms = [{
            adjecent: null,
            direction: null,
            rect: new rect(0, 0, width, height)
        }];
        pushRoomToGrid(0, 0, width, height);
        for (let ri = 1; ri < this.roomCount; ri++) {
            //We have to create x rooms
            let success = false;
            while (!success) {
                const adjecent = rnd(ri) - 1;
                const [w, h] = radugen.generators.dungeons.rooms.getRoomSize();
        
                const direction = rnd(4);
        
                let ox = 0, oy = 0;
                switch (direction) {
                    case directions.North:
                        ox = rooms[adjecent].rect.x1 + rnd(rooms[adjecent].rect.width) - rnd(w) - 1;
                        oy = rooms[adjecent].rect.y1 - h - rnd(3) - 2;
                        break;
                    case directions.West:
                        ox = rooms[adjecent].rect.x1 - w - rnd(3) - 2;
                        oy = rooms[adjecent].rect.y1 + rnd(rooms[adjecent].rect.height) - rnd(h) - 1;
                        break;
                    case directions.South:
                        ox = rooms[adjecent].rect.x1 + rnd(rooms[adjecent].rect.width) - rnd(w) - 1;
                        oy = rooms[adjecent].rect.y2 + rnd(3) + 2;
                        break;
                    case directions.East:
                        ox = rooms[adjecent].rect.x2 + rnd(3) + 2;
                        oy = rooms[adjecent].rect.y1 + rnd(rooms[adjecent].rect.height) - rnd(h) - 1;
                        break;
                }

                const recta = new rect(ox, oy, w, h);
                if (rooms.find(r => r.rect.expand(1).intersects(recta))) continue;

                success = true;
                pushRoomToGrid(ox, oy, w, h);

                rooms.push({
                    index: ri,
                    adjecent: adjecent,
                    direction: direction,
                    rect: recta
                });
            }
        }

        this._rooms = rooms;
    }

    generatePaths(){
        for (let room of this._rooms) {
            if (room.adjecent == null || room.direction == null) continue;
            let adjecentRoom = this._rooms[room.adjecent];

            let directions = radugen.helper.directions;
            switch (room.direction) {
                case directions.North:
                    this.roadsNS(room, adjecentRoom);
                    break;
                case directions.West:
                    this.roadsWE(room, adjecentRoom);
                    break;
                case directions.South:
                    this.roadsNS(adjecentRoom, room);
                    break;
                case directions.East:
                    this.roadsWE(adjecentRoom, room)
                    break;
            }
        }
    }

    generate() {
        this.generateRooms();
        this.generatePaths();
        return this._grid;
    }
};