window.radugen = window.radugen || {};
radugen.generators = radugen.generators || {};
radugen.generators.dungeons = radugen.generators.dungeons || {};


radugen.generators.dungeons[radugen.generators.dungeonGenerator.Cave] = class extends radugen.generators.dungeon {
    constructor() {
        super('cave');

        this.chanceToStartAlive = 0.4;
        this.birthLimit = 4;
        this.deathLimit = 3;
        this.numberOfSteps = 6;
    }
 
    initialiseMap(map, width, height) {
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                if (Math.random() < this.chanceToStartAlive) {
                    map[x][y] = true;
                }
            }
        }
        return map;
    }

    doSimulationStep(oldMap) {
        let newMap = Array.from({length: oldMap.length}).map((_, y) => Array.from({length: oldMap[0].length}).map((_, x) => false));

        //Loop over each row and column of the map
        for (let x = 0; x < oldMap.length; x++) {
            for (let y = 0; y < oldMap[0].length; y++) {
                let nbs = this.countAliveNeighbours(oldMap, x, y);
                //The new value is based on our simulation rules
                //First, if a cell is alive but has too few neighbours, kill it.
                if (oldMap[x][y]) {
                    if (nbs < this.deathLimit) {
                        newMap[x][y] = false;
                    }
                    else {
                        newMap[x][y] = true;
                    }
                } //Otherwise, if the cell is dead now, check if it has the right number of neighbours to be 'born'
                else {
                    if (nbs > this.birthLimit) {
                        newMap[x][y] = true;
                    }
                    else {
                        newMap[x][y] = false;
                    }
                }
            }
        }
        return newMap;
    }

    countAliveNeighbours(map, x, y) {
        let count = 0;
        for (let i = -1; i < 2; i++) {
            for (let j = -1; j < 2; j++) {
                let neighbour_x = x + i;
                let neighbour_y = y + j;
                //If we're looking at the middle point
                if (i == 0 && j == 0) {
                    //Do nothing, we don't want to add ourselves in!
                }
                //In case the index we're looking at it off the edge of the map
                else if (neighbour_x < 0 || neighbour_y < 0 || neighbour_x >= map.length || neighbour_y >= map[0].length) {
                    count = count + 1;
                }
                //Otherwise, a normal check of the neighbour
                else if (map[neighbour_x][neighbour_y]) {
                    count = count + 1;
                }
            }
        }
        return count;
    }

    generate(){
        let width = this.roomCount * 4 % 2 == 1 ? this.roomCount * 4 + 1 : this.roomCount * 4;
        let height = this.roomCount * 4 % 2 == 1 ? this.roomCount * 4 + 1 : this.roomCount * 4;

        //Create a new map
        let cellmap = Array.from({length: height}).map((_, y) => Array.from({length: width}).map((_, x) => false));
        //Set up the map with random values
        cellmap = this.initialiseMap(cellmap, width, height);
        //And now run the simulation for a set number of steps
        for (let i = 0; i < this.numberOfSteps; i++) {
            cellmap = this.doSimulationStep(cellmap);
        }

        this._grid = this.renderToGrid(cellmap);
    }


    //Maze without void walls
    renderToGrid(oldMap){
        const [Tile, TileType] = [radugen.classes.tiles.Tile, radugen.classes.tiles.TileType];
        let grid = [];
        for (let y = 0; y < oldMap.length; y++) {
            for (let x = 0; x < oldMap[0].length; x++) {
                if(oldMap[y][x] == false){
                    grid.push(new Tile(x, y, TileType.Room));
                }
                
            }
        }
        return grid;
    }
};