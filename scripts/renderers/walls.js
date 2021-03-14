window.radugen = window.radugen || {};
radugen.renderer = radugen.renderer || {};
radugen.renderer.Walls = class {
    constructor(grid, tileResolution, wallMode) {
        this._grid = grid;
        this._gridHeight = this._grid.height;
        this._gridWidth = this._grid.width;
        this._wallMode = wallMode;

        this._imageWidth = this._gridWidth * tileResolution;
        this._imageHeight = this._gridHeight * tileResolution;

        this._tileResolution = tileResolution;
    }

    render() {
        if (this._wallMode == 'none') {
            return;
        }
        return this.renderWalls();
    }


    getTilePos(x, y, direction) {
        if (direction.indexOf('-') != -1) {
            const output = [];
            for (let d of direction.split('-')) {
                output.push(this.getTilePos(x, y, d));
            }
            return output;
        }

        switch (direction) {
            case 'top': return this._tileResolution * y;
            case 'right': return this._tileResolution * (x + 1);
            case 'bottom': return this._tileResolution * (y + 1);
            case 'left': return this._tileResolution * x;
            default: throw `direction ${direction} undefined`;
        }
    }

    getWallForSide(x, y, direction) {
        switch (direction) {
            case 'top': return this.getTilePos(x, y, 'left-top-right-top');
            case 'right': return this.getTilePos(x, y, 'right-top-right-bottom');
            case 'bottom': return this.getTilePos(x, y, 'right-bottom-left-bottom');
            case 'left': return this.getTilePos(x, y, 'left-bottom-left-top');
            default: throw `wall ${direction} undefined`;
        }
    }

    getInvisibleWall(x, y, direction) {
        return {
            c: this.getWallForSide(x, y, direction),
            move: CONST.WALL_MOVEMENT_TYPES.NORMAL,
            sense: CONST.WALL_SENSE_TYPES.NONE,
            dir: CONST.WALL_DIRECTIONS.BOTH,
            door: CONST.WALL_DOOR_TYPES.NONE,
            ds: CONST.WALL_DOOR_STATES.CLOSED
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

    getDoor(x, y, direction) {
        return {
            c: this.getWallForSide(x, y, direction),
            move: CONST.WALL_MOVEMENT_TYPES.NORMAL,
            sense: CONST.WALL_SENSE_TYPES.NORMAL,
            dir: CONST.WALL_DIRECTIONS.BOTH,
            door: CONST.WALL_DOOR_TYPES.DOOR,
            ds: CONST.WALL_DOOR_STATES.LOCKED
        }
    }

    getTerrainWall(x, y, direction) {
        return {
            c: this.getWallForSide(x, y, direction),
            move: CONST.WALL_MOVEMENT_TYPES.NORMAL,
            sense: CONST.WALL_SENSE_TYPES.LIMITED,
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
        const walls = [];
        this._grid.iterate((tile, x, y) => {
            //New wall mode
            if (tile.wall.top) {
                walls.push(this.getWall(x, y, 'top'));
            }
            if (tile.wall.left) {
                walls.push(this.getWall(x, y, 'left'));
            }
            if (tile.wall.right) {
                walls.push(this.getWall(x, y, 'right'));
            }
            if (tile.wall.bottom) {
                walls.push(this.getWall(x, y, 'bottom'));
            }

            //Old wall mode
            if (tile.type == 0) {
                let drawTop = false;
                let drawLeft = false;
                let drawRight = false;
                let drawBottom = false;
                let drawCount = 0;

                //check top
                if (tile.adjecent.top.type != 0) {
                    drawTop = true;
                    drawCount++;
                }

                //check left
                if (tile.adjecent.left.type != 0) {
                    drawLeft = true;
                    drawCount++;
                }

                //check right
                if (tile.adjecent.right.type != 0) {
                    drawRight = true;
                    drawCount++;
                }

                //check bottom
                if (tile.adjecent.bottom.type != 0) {
                    drawBottom = true;
                    drawCount++;
                }

                let defaultWallFunction = this.getInvisibleWall.bind(this);
                if (this._wallMode == 'strict') {
                    defaultWallFunction = this.getWall.bind(this);
                }

                if (drawTop) {
                    walls.push(defaultWallFunction(x, y, 'top'));
                }
                if (drawLeft) {
                    walls.push(defaultWallFunction(x, y, 'left'));
                }
                if (drawRight) {
                    walls.push(defaultWallFunction(x, y, 'right'));
                }
                if (drawBottom) {
                    walls.push(defaultWallFunction(x, y, 'bottom'));
                }

                if (this._wallMode == 'pretty') {
                    if (drawCount == 1) {
                        if (drawTop) {
                            walls.push(this.getWall(x, y, 'bottom'));
                        }
                        if (drawLeft) {
                            walls.push(this.getWall(x, y, 'right'));
                        }
                        if (drawRight) {
                            walls.push(this.getWall(x, y, 'left'));
                        }
                        if (drawBottom) {
                            walls.push(this.getWall(x, y, 'top'));
                        }
                    }

                    if (drawCount == 0) {
                        //check top left

                        if (tile.adjecent.topLeft.type != 0) {
                            walls.push(this.getWall(x, y, 'right'));
                            walls.push(this.getWall(x, y, 'bottom'));
                        }

                        //check top right

                        if (tile.adjecent.topRight.type != 0) {
                            walls.push(this.getWall(x, y, 'left'));
                            walls.push(this.getWall(x, y, 'bottom'));
                        }

                        //check bottom left
                        if (tile.adjecent.bottomLeft.type != 0) {
                            walls.push(this.getWall(x, y, 'right'));
                            walls.push(this.getWall(x, y, 'top'));
                        }

                        //check bottom right
                        if (tile.adjecent.bottomRight.type != 0) {
                            walls.push(this.getWall(x, y, 'left'));
                            walls.push(this.getWall(x, y, 'top'));
                        }
                    }
                }
            }
        });

        return walls;
    }
};