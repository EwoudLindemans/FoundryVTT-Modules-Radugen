window.radugen = window.radugen || {};
radugen.generators = radugen.generators || {};
radugen.generators.dungeons = radugen.generators.dungeons || {};

radugen.generators.dungeons[radugen.generators.dungeonGenerator.GenV1] = class extends radugen.generators.dungeon {
    /**
     * @param {radugen.generators.dungeonSize} dungeonSize
     */
    constructor(dungeonSize) {
        const roomCount = (() => {
            switch (parseInt(dungeonSize)) {
                case radugen.generators.dungeonSize.Tiny: return 3;
                case radugen.generators.dungeonSize.Small: return 5;
                case radugen.generators.dungeonSize.Medium: return 7;
                case radugen.generators.dungeonSize.Large: return 9;
                case radugen.generators.dungeonSize.Huge: return 11;
                case radugen.generators.dungeonSize.Gargantuan: return 14;
            }
        })();

        const directions = Object.freeze({ North: 1, West: 2, South: 3, East: 4 });
        const [rnd, rect] = [radugen.helper.getRndFromNum, radugen.helper.rect];
        const roomSizes = [
            { occurance: .1, size: new radugen.helper.minMax(6, 12) },
            { occurance: .3, size: new radugen.helper.minMax(4, 8) },
            { occurance: .6, size: new radugen.helper.minMax(3, 6) },
        ];
        const getRoomSize = () => {
            const rand = Math.random() // get a random number between 0 and 1
            let accumulatedChance = 0 // used to figure out the current

            const dimensions = roomSizes.find(function(e) { // iterate through all elements 
                accumulatedChance += e.occurance // accumulate the chances
                return accumulatedChance >= rand // tests if the element is in the range and if yes this item is stored in 'found'
            });

            return Array.from({length: 2}, () => rnd(dimensions.size.max - dimensions.size.min) + dimensions.size.min);
            // return [rnd(dimensions.size.max - dimensions.size.min) + dimensions.size.min, rnd(dimensions.size.max - dimensions.size.min) + dimensions.size.min];
        };
        const [width, height] = getRoomSize();
        const rooms = [{
            adjecent: null,
            direction: null,
            rect: new rect(0, 0, width, height)
        }];

        const getWidth = () => (Math.max(...rooms.map(r => r.rect.x2)) - Math.min(...rooms.map(r => r.rect.x1))) + 2;
        const getHeight = () => (Math.max(...rooms.map(r => r.rect.y2)) - Math.min(...rooms.map(r => r.rect.y1))) + 2;
        for (let ri = 1; ri < roomCount; ri++) {
            let success = false;
            while (!success) {
                const adjecent = rnd(ri) - 1;
                const [w, h] = getRoomSize();

                const direction = rnd(4);

                let ox = 0, oy = 0;
                switch (direction) {
                    case directions.North:
                        ox = rnd(rooms[adjecent].rect.x2 - rooms[adjecent].rect.x1) - rnd(w) - 1;
                        oy = rooms[adjecent].rect.y1 - h - rnd(3) - 2;
                        break;
                    case directions.West:
                        ox = rooms[adjecent].rect.x1 - w - rnd(3) - 2;
                        oy = rnd(rooms[adjecent].rect.y2 - rooms[adjecent].rect.y1) - rnd(h) - 1;
                        break;
                    case directions.South:
                        ox = rnd(rooms[adjecent].rect.x2 - rooms[adjecent].rect.x1) - rnd(w) - 1;
                        oy = rooms[adjecent].rect.y2 + rnd(3) + 2;
                        break;
                    case directions.East:
                        ox = rooms[adjecent].rect.x2 + rnd(3) + 2;
                        oy = rnd(rooms[adjecent].rect.y2 - rooms[adjecent].rect.y1) - rnd(h) - 1;
                        break;
                }
                const recta = new rect(ox, oy, w, h);
                if (rooms.filter(r => r.rect.expand(1).intersects(recta)).length != 0) continue;
                success = true;
                rooms.push({
                    adjecent: adjecent,
                    direction: direction,
                    rect: recta
                });
            }
        }

        const offset_x = -Math.min(...rooms.map(r => r.rect.x1)) + 1;
        const offset_y = -Math.min(...rooms.map(r => r.rect.y1)) + 1;
        const w = (Math.max(...rooms.map(r => r.rect.x2)) - Math.min(...rooms.map(r => r.rect.x1))) + 2;
        const h = (Math.max(...rooms.map(r => r.rect.y2)) - Math.min(...rooms.map(r => r.rect.y1))) + 2;

        const grid = [];
        for (let y = 0; y < h; y++) {
            grid[y] = [];
            for (let x = 0; x < w; x++) {
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
                xStart = room2.rect.left + offset_x + rnd(room2.rect.width - 1) ; 
                yStart = room2.rect.top + offset_y;

                xEnd = room1.rect.left + offset_x + rnd(room1.rect.width - 1) ; 
                yEnd = room1.rect.bottom + offset_y;

                xDiff = Math.abs(xStart - xEnd);
                yDiff = Math.abs(yStart - yEnd);
                
                let splitY = rnd(yDiff - 2) + Math.min(yStart, yEnd);
                
                for (let y = Math.min(yStart, yEnd); y < Math.max(yStart, yEnd); y++) {
                    if (y < splitY) {
                        grid[y][xEnd] = 1;
                    } else if (y > splitY) {
                        grid[y][xStart] = 1;
                    } else {
                        for (let x = Math.min(xStart, xEnd); x <= Math.max(xStart, xEnd); x++) {
                            grid[y][x] = 1;
                        }
                    }
                }
            };
            const roadsWE = (room1, room2) => {
                //Random y
                xStart = room2.rect.left + offset_x;
                yStart = room2.rect.top + offset_y + rnd(room2.rect.height - 1); 

                xEnd = room1.rect.right + offset_x;
                yEnd = room1.rect.top + offset_y + rnd(room1.rect.height - 1); 

                xDiff = Math.abs(xStart - xEnd);
                yDiff = Math.abs(yStart - yEnd);
                
                let splitX = rnd(xDiff - 2) + Math.min(xStart, xEnd);
                
                for (let x = Math.min(xStart, xEnd); x < Math.max(xStart, xEnd); x++) {
                    if (x < splitX) {
                        grid[yEnd][x] = 1;
                    } else if (x > splitX) {
                        grid[yStart][x] = 1;
                    } else {
                        for (let y = Math.min(yStart, yEnd); y <= Math.max(yStart, yEnd); y++) {
                            grid[y][x] = 1;
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

        super('genV1');

        this._map = grid;
    }

    static get dungeonRoomCount(){
        if (this._dungeonRoomCount == null) {
            switch (this.dungeonSize) {
                case radugen.generators.dungeonSize.Tiny:
                    return 2;
                case radugen.generators.dungeonSize.Small:
                    return 4;
                case radugen.generators.dungeonSize.Medium:
                    return 6;
                default:
                    return 8;
            }
        }
        return this._dungeonRoomCount;
    }

    generate() {
        return this._map;
    }
};