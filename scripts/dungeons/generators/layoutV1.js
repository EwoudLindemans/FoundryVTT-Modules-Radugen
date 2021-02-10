window.radugen = window.radugen || {};
radugen.generators = radugen.generators || {};
radugen.generators.dungeons = radugen.generators.dungeons || {};

radugen.generators.dungeons[radugen.generators.dungeonGenerator['LayoutV1 (experimental)']] = class extends radugen.generators.dungeon {
    /**
     * @param {radugen.generators.dungeonSize} dungeonSize
     */
    constructor(dungeonSize) {
        super('layoutV1');
    }

    /**
     * @type {radugen.helper.minMax}
     */
    get minMax() {
        switch (this._size) {
            case radugen.generators.dungeonSize.Tiny:
                return new radugen.helper.minMax(8, 12);
            case radugen.generators.dungeonSize.Small:
                return new radugen.helper.minMax(12, 16);
            case radugen.generators.dungeonSize.Medium:
                return new radugen.helper.minMax(16, 22);
            case radugen.generators.dungeonSize.Large:
                return new radugen.helper.minMax(22, 28);
            case radugen.generators.dungeonSize.Huge:
                return new radugen.helper.minMax(28, 36);
            case radugen.generators.dungeonSize.Gargantuan:
                return new radugen.helper.minMax(36, 48);
            default:
                return new radugen.helper.minMax(10, 30);
        }
    }

    /**
     * @type {number}
     */
    get maxSplitSize() {
        switch (this._size) {
            case radugen.generators.dungeonSize.Tiny:
            case radugen.generators.dungeonSize.Small:
                return 4;
            case radugen.generators.dungeonSize.Medium:
            case radugen.generators.dungeonSize.Large:
                return 5;
            default:
                return 6;
        }
    }

    splitRect(rectToSplit) {
        const [rnd, rect] = [radugen.helper.getRndFromNum, radugen.helper.rect];
        const hw = rnd(2) == 1 ? 'width' : 'height';
        if (rectToSplit[hw] < 8) return null;
        const split = Math.floor(rectToSplit[hw] / 2) - rnd(Math.ceil(rectToSplit[hw] * 0.35));
        if (split < this.maxSplitSize || rectToSplit.width - split - 1 < this.maxSplitSize) return null;

        switch (hw) {
            case 'width':
                return [
                    new rect(rectToSplit.x1, rectToSplit.y1, split, rectToSplit.height),
                    new rect(rectToSplit.x1 + split + 1, rectToSplit.y1, rectToSplit.width - split - 1, rectToSplit.height),
                    radugen.helper.directions.West
                ];
            case 'height':
                return [
                    new rect(rectToSplit.x1, rectToSplit.y1, rectToSplit.width, split),
                    new rect(rectToSplit.x1, rectToSplit.y1 + split + 1, rectToSplit.width, rectToSplit.height - split - 1),
                    radugen.helper.directions.North
                ];
            default:
                return null;
        }
    }

    generate() {
        const [Tile, TileType] = [radugen.classes.tiles.Tile, radugen.classes.tiles.TileType];
        const [roomCount, directions] = [this.roomCount, radugen.helper.directions];
        const [rnd, rect] = [radugen.helper.getRndFromNum, radugen.helper.rect];
        const minMax = this.minMax;
        const [width, height] = Array.from({length: 2}, () => rnd(minMax.max - minMax.min) + minMax.min - 1);

        const rooms = [{
            index: 0,
            adjecent: null,
            direction: null,
            connections: [],
            rect: new rect(0, 0, width, height)
        }];
        for (let ri = 1; ri < roomCount; ri++){
            let success = false;
            for (let retry = 0; retry < 100; retry++) {
                let recta = null, direction = null;
                const adjecent = (() => {
                    const roomSize = rooms.map(room => room.rect.width * room.rect.height);
                    return roomSize.indexOf(Math.max(...roomSize));
                })();
                const split = this.splitRect(rooms[adjecent].rect);
                if (!split || split.find(rect => rect.width <= 2 || rect.height <= 2)) continue;
                [rooms[adjecent].rect, recta, direction] = split;
                success = true;
                rooms.push({
                    index: ri,
                    adjecent: adjecent,
                    direction: direction,
                    connections: [],
                    rect: recta
                });
                break;
            }
            if (!success) return this.generate();
        }
        
        const unaspected = rooms.filter(room => room.rect.aspectRatio > 1.7);
        for (let room of unaspected) {
            let success = false;
            for (let retry = 0; retry < 100; retry++) {
                let recta = null, direction = null;
                const split = this.splitRect(rooms[room.index].rect);
                if (!split || split.find(rect => rect.width <= 2 || rect.height <= 2)) continue;
                [rooms[room.index].rect, recta, direction] = split;
                success = true;
                rooms.push({
                    index: rooms.length,
                    adjecent: room.index,
                    direction: direction,
                    connections: [],
                    rect: recta
                });
                break;
            }
            if (!success) return this.generate();
        }

        const getAdjacentRooms = (room => {
            const output = [];
            switch (room.direction) {
                case directions.West:
                    output.push(...rooms.filter(r => r.rect.intersects(new rect(room.rect.x1 - 2, room.rect.y1, 1, room.rect.height))).map(room => new Object({ index: room.index, direction: directions.West })));
                    break;
                case directions.North:
                    output.push(...rooms.filter(r => r.rect.intersects(new rect(room.rect.x1, room.rect.y1 - 2, room.rect.width, 1))).map(room => new Object({ index: room.index, direction: directions.North })));
                    break;
            };
            return output;
        });

        const map = Array.from({ length: height }).map(_ => Array.from({ length: width }).map(_ => 0));
        for (let room of rooms) {
            const adjacentRooms = getAdjacentRooms(room);
            if (adjacentRooms.length > 0) {
                const ar = adjacentRooms[rnd(adjacentRooms.length) - 1];
                rooms[ar.index].connections.push({ direction: radugen.helper.oppositeDirection(ar.direction), index: room.index });
                room.connections.push({ direction: ar.direction, index: ar.index });
            }

            for (let y = room.rect.y1; y <= room.rect.y2; y++) {
                for (let x = room.rect.x1; x <= room.rect.x2; x++) {
                    map[y][x] = 1;
                }
            }
        }
        
        const getIntersection = (coor, rect1, rect2) => [Math.min(rect1[`${coor}1`], rect2[`${coor}2`]), Math.max(rect1[`${coor}2`], rect2[`${coor}1`])];
        for (let room of rooms) {
            for (let connection of room.connections.filter(connection => connection.index > room.index)) {
                let min, max;
                switch (connection.direction) {
                    case directions.North:
                        [min, max] = getIntersection('x', room.rect, rooms[connection.index].rect);
                        map[room.rect.y1 - 1][rnd(max - min) + min - 1] = 99;
                        break;
                    case directions.West:
                        [min, max] = getIntersection('y', room.rect, rooms[connection.index].rect);
                        map[rnd(max - min) + min - 1][room.rect.x1 - 1] = 99;
                        break;
                    case directions.South:
                        [min, max] = getIntersection('x', room.rect, rooms[connection.index].rect);
                        map[room.rect.y2 + 1][rnd(max - min) + min - 1] = 99;
                        break;
                    case directions.East:
                        [min, max] = getIntersection('y', room.rect, rooms[connection.index].rect);
                        map[rnd(max - min) + min - 1][room.rect.x2 + 1] = 99;
                        break;
                }
            }
        }

        const grid = [];
        for(let x = 0; x < width; x++){
            for(let y = 0; y < height; y++){
                if (map[y][x] == 0) continue;
                
                grid.push(new Tile(x, y, map[y][x] == 99 ? TileType.Corridor : TileType.Room));
            }
        }
        
        this._grid = grid;
        this._rooms = rooms.map(x => new rect(x.rect.x1, x.rect.y1, x.rect.width, x.rect.height));
        this._paths = []; // TODO
        return this._grid;
    }
}