window.radugen = window.radugen || {};
radugen.generators = radugen.generators || {};
radugen.generators.dungeons = radugen.generators.dungeons || {};

radugen.generators.dungeons[radugen.generators.dungeonGenerator.GenV1] = class extends radugen.generators.dungeon {
    /**
     * @param {radugen.generators.dungeonSize} dungeonSize
     */
    constructor(dungeonSize) {
        // const size = radugen.generators.dungeons[radugen.generators.dungeonGenerator.GenV1].getDungeonSize(dungeonSize);
        const roomCount = (() => {
            switch (parseInt(dungeonSize)) {
                case radugen.generators.dungeonSize.Tiny: return 3;
                case radugen.generators.dungeonSize.Small: return 5;
                case radugen.generators.dungeonSize.Medium: return 7;
                default: return 9;
            }
        })();
        
        const directions = Object.freeze({ North: 1, West: 2, South: 3, East: 4 });
        const [rnd, rect] = [radugen.helper.getRndFromNum, radugen.helper.rect];
        const roomSize = new radugen.helper.minMax(4, 12);
        const getRoomSize = () => rnd(roomSize.max - roomSize.min) + roomSize.min;
        const rooms = [
            new rect(0, 0, getRoomSize(), getRoomSize())
        ];

        for (let ri = 1; ri < roomCount; ri++) {
            let success = false;
            while (!success) {
                const ar = rnd(ri) - 1;
                const [w, h, d] = [getRoomSize(), getRoomSize(), rnd(4)];
                let ox = 0, oy = 0;
                switch (d) {
                    case directions.North:
                        ox = rnd(rooms[ar].x2 - rooms[ar].x1) - rnd(w) - 1;
                        oy = rooms[ar].y1 - h - rnd(4);
                        break;
                    case directions.West:
                        ox = rooms[ar].x1 - w - rnd(4);
                        oy = rnd(rooms[ar].y2 - rooms[ar].y1) - rnd(h) - 1;
                        break;
                    case directions.South:
                        ox = rnd(rooms[ar].x2 - rooms[ar].x1) - rnd(w) - 1;
                        oy = rooms[ar].y2 + rnd(4);
                        break;
                    case directions.East:
                        ox = rooms[ar].x1 + rnd(4);
                        oy = rnd(rooms[ar].y2 - rooms[ar].y1) - rnd(h) - 1;
                        break;
                }
                const room = new rect(ox, oy, w, h);
                if (rooms.filter(r => r.expand(1).intersects(room)).length != 0) continue;
                success = true;
                rooms.push(room);
            }
        }

        const offset_x = -Math.min(...rooms.map(r => r.x1)) + 1;
        const offset_y = -Math.min(...rooms.map(r => r.y1)) + 1;
        const w = (Math.max(...rooms.map(r => r.x2)) - Math.min(...rooms.map(r => r.x1))) + 2;
        const h = (Math.max(...rooms.map(r => r.y2)) - Math.min(...rooms.map(r => r.y1))) + 2;

        const grid = [];
        for (let y = 0; y < h; y++) {
            grid[y] = [];
            for (let x = 0; x < w; x++) {
                grid[y][x] = 0;
            }
        }

        for (let room of rooms) {
            for (let y = room.y1; y < room.y2; y++) {
                for (let x = room.x1; x < room.x2; x++) {
                    grid[y + offset_y][x + offset_x] = 1;
                }
            }
        }

        // super(size.width, size.height, 'genV1');
        super(w, h, 'genV1');

        this._map = grid;

        // this._dungeonSize = dungeonSize;
        // this._dungeonRoomCount = null;
        // radugen.generators.dungeons[radugen.generators.dungeonGenerator.GenV1]
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

    // /**
    //  * @type {radugen.generators.dungeonSize} dungeonSize
    //  * @returns {radugen.helper.size}
    //  */
    // static getDungeonSize(dungeonSize){
    //     switch (dungeonSize) {
    //         case radugen.generators.dungeonSize.Tiny:
    //             return new radugen.helper.size(12, 12);
    //         case radugen.generators.dungeonSize.Small:
    //             return new radugen.helper.size(18, 18);
    //         case radugen.generators.dungeonSize.Medium:
    //             return new radugen.helper.size(24, 24);
    //         case radugen.generators.dungeonSize.Large:
    //             return new radugen.helper.size(32, 32);
    //         case radugen.generators.dungeonSize.Huge:
    //             return new radugen.helper.size(42, 42);
    //         case radugen.generators.dungeonSize.Gargantuan:
    //             return new radugen.helper.size(56, 56);
    //         default:
    //             return new radugen.helper.size(24, 24);
    //     }
    // }

    // /**
    //  * @type {radugen.generators.dungeonSize}
    //  */
    // get dungeonSize(){
    //     return this._dungeonSize;
    // }

    // get dungeonRoomCount(){
    //     if (this._dungeonRoomCount == null) {
    //         switch (this.dungeonSize) {
    //             case radugen.generators.dungeonSize.Tiny:
    //                 return 2;
    //             case radugen.generators.dungeonSize.Small:
    //                 return 4;
    //             case radugen.generators.dungeonSize.Medium:
    //                 return 6;
    //             default:
    //                 return 3;
    //         }
    //     }
    //     return this._dungeonRoomCount;
    // }

    // createGrid() {
    //     let grid = [];
    //     for (let y = 0; y < this._height; y++) {
    //         grid[y] = [];
    //         for (let x = 0; x < this._width; x++) {
    //             grid[y][x] = 0;
    //         }
    //     }
    //     return grid;
    // }

    // generate() {
    //     const grid = this.createGrid();

    //     const minRoomSize = 4;
    //     let maxRoomSize = Math.max(Math.floor(Math.min(this.width, this.height) * 0.5), minRoomSize);

    //     let rooms = [];
    //     for (let retry = 0; retry < 1000; retry++) {
    //         if ((retry > 200 || retry > 600) && this._dungeonRoomCount > 2) this._dungeonRoomCount--;
    //         if ((retry > 400 || retry > 800) && maxRoomSize > minRoomSize) maxRoomSize--;

    //         for (let ri = 0; ri < this.dungeonRoomCount; ri++) {
    //             const w = radugen.helper.getRndFromNum(maxRoomSize - minRoomSize) + 4;
    //             const h = radugen.helper.getRndFromNum(maxRoomSize - minRoomSize) + 4;
    //             const x = radugen.helper.getRndFromNum(this.width - w);
    //             const y = radugen.helper.getRndFromNum(this.height - h);
    //             rooms.push(new radugen.helper.rect(x, y, w, h));
    //         }

    //         let succes = true;
    //         for (let ri1 = 0; ri1 < rooms.length; ri1++) {
    //             for (let ri2 = 0; ri2 < rooms.length; ri2++) {
    //                 if (ri1 == ri2) continue;
    //                 if (!rooms[ri1].expand(1).intersects(rooms[ri2])) continue;
    //                 succes = false;
    //                 break;
    //             }
    //         }
    //         if (succes) break;
    //         rooms = [];
    //     }

    //     for (let room of rooms) {
    //         for (let y = room.y1; y < room.y2; y++) {
    //             for (let x = room.x1; x < room.x2; x++) {
    //                 grid[y][x] = 1;
    //             }
    //         }
    //     }

    //     return grid;
    // }
    generate() {
        return this._map;
    }
};