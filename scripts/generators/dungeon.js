window.radugen = window.radugen || {};
radugen.generators = radugen.generators || {};

radugen.generators.simpleDungeonGenerator = class {
    constructor(width, height) {
        this.map = [];
        this.width = width;
        this.height = height;
        this.rooms = [];
    }

    createEmptyMap() {
        this.map = [];
        for (var x = 0; x < this.width; x++) {
            this.map[x] = [];
            for (var y = 0; y < this.height; y++) {
                this.map[x][y] = 0;
            }
        }
    }

    getRandom(low, high) {
        return ~~(Math.random() * (high - low)) + low;
    }

    generate() {
        this.createEmptyMap();

        var room_count = this.getRandom(5, 8);
        var min_size = this.getRandom(2, 8);
        var max_size = this.getRandom(2, 8);

        for (var i = 0; i < room_count; i++) {
            var room = {};

            room.x = this.getRandom(1, this.width - max_size - 1);
            room.y = this.getRandom(1, this.height - max_size - 1);
            room.w = this.getRandom(min_size, max_size);
            room.h = this.getRandom(min_size, max_size);

            if (this.doesCollide(room)) {
                i--;
                continue;
            }
            room.w--;
            room.h--;

            this.rooms.push(room);
        }

        this.squashRooms();

        for (i = 0; i < room_count; i++) {
            var roomA = this.rooms[i];
            var roomB = this.findClosestRoom(roomA);

            let pointA = {
                x: this.getRandom(roomA.x, roomA.x + roomA.w),
                y: this.getRandom(roomA.y, roomA.y + roomA.h)
            };
            let pointB = {
                x: this.getRandom(roomB.x, roomB.x + roomB.w),
                y: this.getRandom(roomB.y, roomB.y + roomB.h)
            };

            while ((pointB.x != pointA.x) || (pointB.y != pointA.y)) {
                if (pointB.x != pointA.x) {
                    if (pointB.x > pointA.x) pointB.x--;
                    else pointB.x++;
                } else if (pointB.y != pointA.y) {
                    if (pointB.y > pointA.y) pointB.y--;
                    else pointB.y++;
                }

                this.map[pointB.x][pointB.y] = 1;
            }
        }

        for (i = 0; i < room_count; i++) {
            var room = this.rooms[i];
            for (var x = room.x; x < room.x + room.w; x++) {
                for (var y = room.y; y < room.y + room.h; y++) {
                    this.map[x][y] = 1;
                }
            }
        }

        for (var x = 0; x < this.width; x++) {
            for (var y = 0; y < this.height; y++) {
                if (this.map[x][y] == 1) {
                    for (var xx = x - 1; xx <= x + 1; xx++) {
                        for (var yy = y - 1; yy <= y + 1; yy++) {
                            if (this.map[xx][yy] == 0) this.map[xx][yy] = 2;
                        }
                    }
                }
            }
        }
    }

    findClosestRoom(room) {
        var mid = {
            x: room.x + (room.w / 2),
            y: room.y + (room.h / 2)
        };
        var closest = null;
        var closest_distance = 1000;
        for (var i = 0; i < this.rooms.length; i++) {
            var check = this.rooms[i];
            if (check == room) continue;
            var check_mid = {
                x: check.x + (check.w / 2),
                y: check.y + (check.h / 2)
            };
            var distance = Math.min(Math.abs(mid.x - check_mid.x) - (room.w / 2) - (check.w / 2), Math.abs(mid.y - check_mid.y) - (room.h / 2) - (check.h / 2));
            if (distance < closest_distance) {
                closest_distance = distance;
                closest = check;
            }
        }
        return closest;
    }

    squashRooms() {
        for (var i = 0; i < 10; i++) {
            for (var j = 0; j < this.rooms.length; j++) {
                var room = this.rooms[j];
                while (true) {
                    var old_position = {
                        x: room.x,
                        y: room.y
                    };
                    if (room.x > 1) room.x--;
                    if (room.y > 1) room.y--;
                    if ((room.x == 1) && (room.y == 1)) break;
                    if (this.doesCollide(room, j)) {
                        room.x = old_position.x;
                        room.y = old_position.y;
                        break;
                    }
                }
            }
        }
    }

    doesCollide(room, ignore) {
        for (var i = 0; i < this.rooms.length; i++) {
            if (i == ignore) continue;
            var check = this.rooms[i];
            if (!((room.x + room.w < check.x) || (room.x > check.x + check.w) || (room.y + room.h < check.y) || (room.y > check.y + check.h))) return true;
        }

        return false;
    }
};