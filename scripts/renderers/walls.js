window.radugen = window.radugen || {};
radugen.renderer = radugen.renderer || {};
radugen.renderer.Walls = class {
    constructor(map, tileResolution) {
        this._map = map;
        this._gridWidth = map.length;
        this._gridHeight = map[0].length

        this._imageWidth = this._gridWidth * tileResolution;
        this._imageHeight = this._gridHeight * tileResolution;

        this._tileResolution = tileResolution;
    }

    render() {
        return this.renderWalls();
    }

    getTileCoordinate(x, y, direction) {
        switch (direction) {
            case 'top':
                return this._tileResolution * y;
            case 'right':
                return this._tileResolution * (x + 1);
            case 'bottom':
                return this._tileResolution * (y + 1);
            case 'left':
                return this._tileResolution * x;
            default:
        }
    }

    getWallForSide(x, y, direction) {
        //[x0,y0,x1,y1]
        switch (direction) {
            case 'top':
                return [
                    this.getTileCoordinate(x, y, 'left'),
                    this.getTileCoordinate(x, y, 'top'),
                    this.getTileCoordinate(x, y, 'right'),
                    this.getTileCoordinate(x, y, 'top')
                ];
            case 'right':
                return [
                    this.getTileCoordinate(x, y, 'right'),
                    this.getTileCoordinate(x, y, 'top'),
                    this.getTileCoordinate(x, y, 'right'),
                    this.getTileCoordinate(x, y, 'bottom')
                ];
            case 'bottom':
                return [
                    this.getTileCoordinate(x, y, 'right'),
                    this.getTileCoordinate(x, y, 'bottom'),
                    this.getTileCoordinate(x, y, 'left'),
                    this.getTileCoordinate(x, y, 'bottom')
                ];
            case 'left':
                return [
                    this.getTileCoordinate(x, y, 'left'),
                    this.getTileCoordinate(x, y, 'bottom'),
                    this.getTileCoordinate(x, y, 'left'),
                    this.getTileCoordinate(x, y, 'top')
                ];
            default:
        }
    }

    getWall(x, y, direction) {
        return {
            c: this.getWallForSide(x, y, direction),
            move: CONST.WALL_MOVEMENT_TYPES.NORMAL,
            sense: CONST.WALL_SENSE_TYPES.NORMAL,
            dir: CONST.WALL_DIRECTIONS.BOTH,
            door: CONST.WALL_DOOR_TYPES.NONE,
            ds: CONST.WALL_DOOR_STATES.CLOSED
        }
    }

    //CONST.WALL_DOOR_TYPES.{NONE: 0, DOOR: 1, SECRET: 2}
    //CONST.WALL_DOOR_STATES.{CLOSED: 0, OPEN: 1, LOCKED: 2}
    //CONST.WALL_MOVEMENT_TYPES.{NONE: 0, NORMAL: 1}
    //CONST.WALL_DIRECTIONS.{BOTH: 0, LEFT: 1, RIGHT: 2}
    //CONST.WALL_SENSE_TYPES.{NONE: 0, NORMAL: 1, LIMITED: 2}
    renderWalls(ctx, themeFiles) {
        var self = this;
        const walls = [];
        this.iterateMap(function (x, y) {
            if (self._map[x][y] == 0) {
                //check top
                if (y != 0) {
                    if (self._map[x][y - 1] != 0) {
                        walls.push(self.getWall(x, y, 'top'));
                    }
                }

                //check left
                if (x != 0) {
                    if (self._map[x - 1][y] != 0) {
                        walls.push(self.getWall(x, y, 'left'));
                    }
                }
               
                //check right
                if (x != self._gridWidth - 1) {
                    if (self._map[x + 1][y] != 0) {
                        walls.push(self.getWall(x, y, 'right'));
                    }
                }

                //check bottom
                if (y != self._gridHeight - 1) {
                    if (self._map[x][y + 1] != 0) {
                        walls.push(self.getWall(x, y, 'bottom'));
                    }
                }
            };
        })

        return walls;
    }

    iterateMap(callback) {
        for (let x = 0; x < this._gridWidth; x++) {
            for (let y = 0; y < this._gridHeight; y++) {
                callback(x, y);
            }
        }
    }
};