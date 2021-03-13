window.radugen = window.radugen || {};
radugen.generators = radugen.generators || {};
radugen.generators.dungeons = radugen.generators.dungeons || {};


/**
 *
 * @constructor
 */
class Cell {
    constructor() {
        this.init = false;
        this.walls = 0x1111;
    }
}
 
 Cell.walls = {
    UP: 0x1000,
    DOWN: 0x0100,
    LEFT: 0x0010,
    RIGHT: 0x0001
 };
 
 Cell.dummy = new Cell();
 Cell.dummy.init = true;
 
 
 /**
  *
  * @param {number} width
  * @param {number} height
  * @constructor
  */
 class Maze {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.cells = [];
        this.init();
    }
    init() {
        for (let i = 0, len = this.width * this.height; i < len; i++) {
            this.cells.push(new Cell());
        }
    }
    /**
      *
      * @param {number} x
      * @param {number} y
      * @return Cell
      */
    getCell(x, y) {
        const i = y * this.width + x;
        return this.cells[i];
    }

    /**
     *
     * @param {number} i
     */
    getPos = function(i) {
        return {
        x: i % this.width,
        y: parseInt(i / this.height, 10)
        };
    };
 

    /**
      *
      * @param {number} x
      * @param {number} y
      * @param {number} wall
      */
    clearWall(x, y, wall) {
        const i = y * this.width + x;
        this.cells[i].walls ^= wall;
    }
    generate() {
        let stack = [];
        let self = this;
        let keys = ['up', 'down', 'left', 'right'];

        function shuffle(arr) {
            for (let j, x, i = arr.length; i; j = Math.floor(Math.random() * i), x = arr[--i], arr[i] = arr[j], arr[j] = x);
            return arr;
        };

        let carveTo = function (x, y) {
            let cell = self.getCell(x, y);

            if (cell.init) {
                stack.pop();
                let next = stack.pop();
                self.getCell(next.x, next.y).init = false;

                if (stack.length > 0) {
                    carveTo(next.x, next.y);
                }

                return true;
            }

            cell.init = true;
            stack.push({ x: x, y: y });

            let neig = self.getNeighbors(x, y);
            keys = shuffle(keys);
            let check = 0;
            let rand = 0;

            while (check++ < keys.length) {
                rand = keys[check - 1];

                switch (rand) {
                    case 'up':
                        if (!neig.up.init) {
                            self.clearWall(x, y, Cell.walls.UP);
                            self.clearWall(x, y - 1, Cell.walls.DOWN);
                            y--;
                            check = keys.length;
                        }
                        break;

                    case 'down':
                        if (!neig.down.init) {
                            self.clearWall(x, y, Cell.walls.DOWN);
                            self.clearWall(x, y + 1, Cell.walls.UP);
                            y++;
                            check = keys.length;
                        }
                        break;
                    case 'left':
                        if (!neig.left.init) {
                            self.clearWall(x, y, Cell.walls.LEFT);
                            self.clearWall(x - 1, y, Cell.walls.RIGHT);
                            x--;
                            check = keys.length;
                        }
                        break;
                    case 'right':
                        if (!neig.right.init) {
                            self.clearWall(x, y, Cell.walls.RIGHT);
                            self.clearWall(x + 1, y, Cell.walls.LEFT);
                            x++;
                            check = keys.length;
                        }
                        break;
                }
            }

            carveTo(x, y);
        };

        return carveTo(0, 0);
    }
    /**
      *
      * @param {number} x
      * @param {number} y
      * @returns {Array.<Cell>}
      */
    getNeighbors(x, y) {
        return {
            up: (y > 0 ? this.getCell(x, y - 1) : Cell.dummy),
            down: (y < this.height - 1 ? this.getCell(x, y + 1) : Cell.dummy),
            left: (x > 0 ? this.getCell(x - 1, y) : Cell.dummy),
            right: (x < this.width - 1 ? this.getCell(x + 1, y) : Cell.dummy)
        };
    }

    //Maze without void walls
    renderToGrid(){
        let grid = [];
        const [Tile, TileType] = [radugen.classes.tiles.Tile, radugen.classes.tiles.TileType];
        let cells = this.cells;
        for (let i = 0, len = cells.length; i < len; i++) {
            let pos = this.getPos(i);
   
            let tile = new Tile(pos.x, pos.y, TileType.Room)
            if (cells[i].walls & Cell.walls.LEFT) {tile.wall.left = true;}
            if (cells[i].walls & Cell.walls.UP) {tile.wall.top = true;}
            if (pos.x == this.width - 1){
                tile.wall.right = true;
            }
            if(pos.y == this.height - 1){
                tile.wall.bottom = true;
            }
            grid.push(tile);
         }

         return grid;
    }
    

    // renderToGrid(){
    //     let grid = [];
    //     const [Tile, TileType] = [radugen.classes.tiles.Tile, radugen.classes.tiles.TileType];
    //     var cells = this.cells;
    //     for (var i = 0, len = cells.length; i < len; i++) {
    //         let pos = this.getPos(i);
   
            
    //         if (!(cells[i].walls & Cell.walls.LEFT)) {
    //             grid.push(new Tile(pos.x * 3, pos.y * 3 + 1, TileType.Room));
    //         }
   
    //         if (!(cells[i].walls & Cell.walls.UP)) {
    //             grid.push(new Tile(pos.x * 3 + 1, pos.y * 3, TileType.Room));
    //         }
   
    //         if (!(cells[i].walls & Cell.walls.RIGHT)) {
    //             grid.push(new Tile(pos.x * 3 + 2, pos.y * 3 + 1, TileType.Room));
    //         }
   
    //         if (!(cells[i].walls & Cell.walls.DOWN)) {
    //             grid.push(new Tile(pos.x * 3 + 1, pos.y * 3 + 2, TileType.Room));
    //         }
    //         grid.push(new Tile(pos.x * 3 + 1, pos.y * 3 + 1, TileType.Room));


    //      }

    //      for(let i in grid){
    //         let tile = grid[i];
    //         let divX = Math.floor(tile.x / 3);
    //         let divY = Math.floor(tile.y / 3);
    //         tile.x -= divX;
    //         tile.y -= divY;
    //      }

    //      return grid;
    // }
}
 

radugen.generators.dungeons[radugen.generators.dungeonGenerator.Maze] = class extends radugen.generators.dungeon {
    constructor() {
        super('maze');
    }

    generate() {
        let width = this.roomCount * 3 % 2 == 1 ? this.roomCount * 3 + 1 : this.roomCount * 3;
        let height = this.roomCount * 3 % 2 == 1 ? this.roomCount * 3 + 1 : this.roomCount * 3;

        let maze = new Maze(width, height);
        maze.generate();
        this._grid = maze.renderToGrid();

        return this._grid;
    }
};