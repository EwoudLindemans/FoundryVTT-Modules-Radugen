window.radugen = window.radugen || {};
radugen.generators = radugen.generators || {};
radugen.generators.dungeons = radugen.generators.dungeons || {};
radugen.generators.dungeons.pathfinding = radugen.generators.dungeons.pathfinding || {};

radugen.generators.dungeons.pathfinding.adjecentPathfinding = class{
    constructor(grid){
        this._grid = grid;
    }

    generate(rooms) {
        for (let room of rooms) {
            if (room.adjecent == null || room.direction == null) continue;
            let adjecentRoom = rooms[room.adjecent];

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

    roadsWE(room1, room2) {
        let xStart, yStart, xEnd, yEnd, xDiff, yDiff;
        const rnd = radugen.helper.getRndFromNum;
        const [Tile, TileType] = [radugen.classes.tiles.Tile, radugen.classes.tiles.TileType];

         //Random y
         xStart = room2.rect.left;
         yStart = room2.rect.top + rnd(room2.rect.height - 1); 

         xEnd = room1.rect.right;
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

        xEnd = room1.rect.left + rnd(room1.rect.width - 1) ; 
        yEnd = room1.rect.bottom;

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
}