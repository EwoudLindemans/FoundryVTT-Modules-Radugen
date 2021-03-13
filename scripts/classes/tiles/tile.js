window.radugen = window.radugen || {};
radugen.classes = radugen.classes || {};
radugen.classes.tiles = radugen.classes.tiles || {};

radugen.classes.tiles.TileType = Object.freeze({ 
    Void: 0,
    Room: 1,
    Corridor: 99,
    Liquid: 98
});

radugen.classes.tiles.Tile = class {
    /**
     * @param {radugen.classes.tiles.TileType} tileType
     */
    constructor(x, y, tileType) {
        this.x = x;
        this.y = y;
        this._tileType = tileType || radugen.classes.tiles.TileType.Void;
        this.wall = {
            top: false,
            right: false,
            bottom: false,
            left: false,
        };
        this.passage = {
            top: false,
            right: false,
            bottom: false,
            left: false,
        }
        this.room = null;
    }

    /**
     * @type {radugen.classes.tiles.TileType}
     */
    get type() {
        return this._tileType;
    }

    get isPassage(){
        return this.passage.top || this.passage.right || this.passage.bottom || this.passage.left;
    }

    /**
     * @type {boolean}
     */
    get hasDoor() {
        return this._hasDoor;
    }

}
