window.radugen = window.radugen || {};
radugen.classes = radugen.classes || {};
radugen.classes.tiles = radugen.classes.tiles || {};

radugen.classes.tiles.TileGrid = class {
    constructor(grid){
        this._grid = grid;
        this._height = grid.length
        this._width = grid[0].length;
    }

    get width(){
        return this._width;
    }
    get height(){
        return this._height;
    }
    topLeft(x, y) {
        if (y != 0 && x != 0) {
            return this._grid[y - 1][x - 1];
        }
    }
    topRight(x, y) {
        if (y != 0 && x != this._width - 1) {
            return this._grid[y - 1][x + 1];
        }
    }
    bottomLeft(x, y) {
        if (y != this._height - 1 && x != 0) {
            return this._grid[y + 1][x - 1];
        }
    }
    bottomRight(x, y) {
        if (y != this._height - 1 && x != this._width - 1) {
            return this._grid[y + 1][x + 1];
        }
    }
    top(x, y) {
        if (y != 0) {
            return this._grid[y - 1][x];
        }
    }
    left(x, y) {
        if (x != 0) {
            return this._grid[y][x - 1];
        }
    }
    right(x, y) {
        if (x != this._width - 1) {
            return this._grid[y][x + 1];
        }
    }
    bottom(x, y) {
        if (y != this._height - 1) {
            return this._grid[y + 1][x];
        }
    }

    iterate(callback) {
        for (let x = 0; x < this._width; x++) {
            for (let y = 0; y < this._height; y++) {
                let tile = this._grid[y][x];
                tile.adjecent = {
                    top: this.top(x, y) || {},
                    topRight:this.topRight(x, y) || {},
                    right:this.right(x, y) || {},
                    bottomRight:this.bottomRight(x, y) || {},
                    bottom:this.bottom(x, y) || {},
                    bottomLeft:this.bottomLeft(x, y) || {},
                    left:this.left(x, y) || {},
                    topLeft:this.topLeft(x, y) || {}
                }

                //Assign navigation to grid item
                callback(tile, x, y, tile.adjecent);
            }
        }
    }

    /**
     * @param {iterateNodesCallback} callback
     */
    iterateNodes(callback) {
        for (let x = 0; x <= this._width; x++) {
            for (let y = 0; y <= this._height; y++) {
                const node = {
                    x: x,
                    y: y,
                    connections: {
                        top: false,
                        right: false,
                        bottom: false,
                        left: false
                    }
                };

                //start check topleft
                if(x != 0 && y != 0){
                    let tile = this.topLeft(x, y);
                    if(tile.wall.right){
                        node.connections.top = true;
                    }
                    if(tile.wall.bottom){
                        node.connections.left = true;
                    }
                }

                //start check topRight
                if(x != this._width && y != 0){
                    let tile = this.top(x, y);
                    if(tile.wall.left){
                        node.connections.top = true;
                    }
                    if(tile.wall.bottom){
                        node.connections.right = true;
                    }
                }

                //start check bottomRight
                if(x != this._width && y != this._height){
                    let tile = this._grid[y][x];
                    if(tile.wall.top){
                        node.connections.right = true;
                    }
                    if(tile.wall.left){
                        node.connections.bottom = true;
                    }
                }

                //start check bottomLeft
                if(x != 0 && y != this._height){
                    let tile = this.left(x, y);
                    if(tile.wall.right){
                        node.connections.bottom = true;
                    }
                    if(tile.wall.top){
                        node.connections.left = true;
                    }
                }

                callback(x, y, node);
            }
        }
    }

    filter(condition) {
        const results = [];
        for (let x = 0; x < this._width; x++) {
            for (let y = 0; y < this._height; y++) {
                if (condition(this._grid[y][x])) results.push(this._grid[y][x]);
            }
        }
        return results;
    }

    find(condition) {
        for (let x = 0; x < this._width; x++) {
            for (let y = 0; y < this._height; y++) {
                if (condition(this._grid[y][x])) return this._grid[y][x];
            }
        }
        return null;
    }
}