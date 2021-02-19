window.radugen = window.radugen || {};
radugen.generators = radugen.generators || {};
radugen.generators.dungeons = radugen.generators.dungeons || {};
radugen.generators.dungeons.rooms = radugen.generators.dungeons.rooms || {};

radugen.generators.dungeons.rooms.randomRoomGenerator = class{
    constructor(grid, roomCount){
        this._grid = grid;
        this._roomCount = roomCount;
        this._rooms = [];
    }

    generate() {
        const [Tile, TileType] = [radugen.classes.tiles.Tile, radugen.classes.tiles.TileType];
        const [rect, rnd, directions] = [radugen.helper.rect, radugen.helper.getRndFromNum, radugen.helper.directions];


        const pushRoomToGrid = (ox, oy, w, h) => {
            //Give room 20% chance to spawn in liquid tiles
            
            let lavasquares = [];
            if(rnd(5) == 1){
                //determine lava size
                let width = rnd(w);
                let height = rnd(h);
                let xstart = ox <= 0 ? ox : rnd(ox);
                let ystart = oy <= 0 ? oy : rnd(oy);

                for(let x = xstart; x < xstart + width; x++){
                    for(let y = ystart; y < ystart + height; y++){
                        lavasquares.push(`${x},${y}`);
                    }
                }
            }

            for(let x = ox; x < ox + w; x++){
                for(let y = oy; y < oy + h; y++){
                    let roomtile = TileType.Room
                    if (lavasquares.indexOf(`${x},${y}`) != -1) {
                        roomtile = TileType.Liquid
                    }

                    let tile = new Tile(x, y, roomtile);
                    // if(x == ox){tile.wall.left = true;}
                    // if(x == ox + w - 1){tile.wall.right = true;}
                    // if(y == oy){tile.wall.top = true;}
                    // if(y == oy + h - 1){tile.wall.bottom = true;}
                    this._grid.push(tile);
                }
            }
        };

        
        const [width, height] = radugen.generators.dungeons.rooms.getRoomSize();
        let rooms = [{
            adjecent: null,
            direction: null,
            rect: new rect(0, 0, width, height)
        }];
        pushRoomToGrid(0, 0, width, height);
        for (let ri = 1; ri < this._roomCount; ri++) {
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
        return rooms;
    }
}