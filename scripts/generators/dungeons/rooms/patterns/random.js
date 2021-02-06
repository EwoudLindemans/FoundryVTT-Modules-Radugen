window.radugen = window.radugen || {};
radugen.generators = radugen.generators || {};
radugen.generators.dungeons = radugen.generators.dungeons || {};
radugen.generators.dungeons.rooms = radugen.generators.dungeons.rooms || {};
radugen.generators.dungeons.rooms.patterns = radugen.generators.dungeons.rooms.patterns || {};

radugen.generators.dungeons.rooms.patterns.random = class{
    constructor(roomCount){
        this._roomCount = roomCount;
        this._rooms = [];
    }

    generate() {
        const [rect, rnd, directions] = [radugen.helper.rect, radugen.helper.getRndFromNum, radugen.helper.directions];
        const [width, height] = radugen.generators.dungeons.rooms.getRoomSize();
        const rooms = [{
            index: 0,
            adjecent: null,
            direction: null,
            rect: new rect(0, 0, width, height)
        }];
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