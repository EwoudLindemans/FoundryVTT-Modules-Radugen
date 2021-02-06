window.radugen = window.radugen || {};
radugen.generators = radugen.generators || {};
radugen.generators.dungeons = radugen.generators.dungeons || {};

radugen.generators.dungeons[radugen.generators.dungeonGenerator.GenV3] = class extends radugen.generators.dungeon {
    /**
     * @param {radugen.generators.dungeonSize} dungeonSize
     */
    constructor(dungeonSize) {
        super('genV3');
    }

    generate() {
        const [roomCount, directions] = [this.roomCount, radugen.helper.directions];
        const [rnd, rect] = [radugen.helper.getRndFromNum, radugen.helper.rect];
        
        const rooms = new radugen.generators.dungeons.rooms.patterns.random(roomCount).generate();

        const offset_x = -Math.min(...rooms.map(r => r.rect.x1)) + 1;
        const offset_y = -Math.min(...rooms.map(r => r.rect.y1)) + 1;
        const w = (Math.max(...rooms.map(r => r.rect.x2)) - Math.min(...rooms.map(r => r.rect.x1))) + 1;
        const h = (Math.max(...rooms.map(r => r.rect.y2)) - Math.min(...rooms.map(r => r.rect.y1))) + 1;

        const grid = [];
        for (let y = 0; y <= h; y++) {
            grid[y] = [];
            for (let x = 0; x <= w; x++) {
                grid[y][x] = 0;
            }
        }

        for (let room of rooms) {
            for (let y = room.rect.y1; y < room.rect.y2; y++) {
                for (let x = room.rect.x1; x < room.rect.x2; x++) {
                    grid[y + offset_y][x + offset_x] = 1;
                }
            }

            //Calculate weggetje
            if (room.adjecent == null || room.direction == null) continue;
            const adjecentRoom = rooms[room.adjecent];
            
            //todo: search out corner doors percentage yes.
            // i do not stand this under
            // yoda absent language worse
            let xStart, yStart, xEnd, yEnd, xDiff, yDiff;

            const roadsNS = (room1, room2) => {
                //Random x 
                xStart = room2.rect.left + offset_x + rnd(room2.rect.width - 2); 
                yStart = room2.rect.top + offset_y;

                xEnd = room1.rect.left + offset_x + rnd(room1.rect.width - 2); 
                yEnd = room1.rect.bottom + offset_y;

                xDiff = Math.abs(xStart - xEnd);
                yDiff = Math.abs(yStart - yEnd);
                
                let splitY = rnd(yDiff - 2) + Math.min(yStart, yEnd);
                
                for (let y = Math.min(yStart, yEnd); y < Math.max(yStart, yEnd); y++) {
                    if (y < splitY) {
                        grid[y][xEnd] = 99;
                    } else if (y > splitY) {
                        grid[y][xStart] = 99;
                    } else {
                        for (let x = Math.min(xStart, xEnd); x <= Math.max(xStart, xEnd); x++) {
                            grid[y][x] = 99;
                        }
                    }
                }
            };
            const roadsWE = (room1, room2) => {
                //Random y
                xStart = room2.rect.left + offset_x;
                yStart = room2.rect.top + offset_y + rnd(room2.rect.height - 2);

                xEnd = room1.rect.right + offset_x;
                yEnd = room1.rect.top + offset_y + rnd(room1.rect.height - 2);

                xDiff = Math.abs(xStart - xEnd);
                yDiff = Math.abs(yStart - yEnd);
                
                let splitX = rnd(xDiff - 2) + Math.min(xStart, xEnd);
                
                for (let x = Math.min(xStart, xEnd); x < Math.max(xStart, xEnd); x++) {
                    if (x < splitX) {
                        grid[yEnd][x] = 99;
                    } else if (x > splitX) {
                        grid[yStart][x] = 99;
                    } else {
                        for (let y = Math.min(yStart, yEnd); y <= Math.max(yStart, yEnd); y++) {
                            grid[y][x] = 99;
                        }
                    }
                }
            };

            switch (room.direction) {
                case directions.North:
                    roadsNS(room, adjecentRoom);
                    break;
                case directions.West:
                    roadsWE(room, adjecentRoom);
                    break;
                case directions.South:
                    roadsNS(adjecentRoom, room);
                    break;
                case directions.East:
                    roadsWE(adjecentRoom, room)
                    break;
            }
        }

        this._rooms = rooms.map(x => new rect(x.rect.x1 + offset_x, x.rect.y1 + offset_y, x.rect.width, x.rect.height));
        this._map = grid;
        return this._map;
    }
};