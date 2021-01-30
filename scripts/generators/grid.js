window.radugen = window.radugen || {};
radugen.generators = radugen.generators || {};

radugen.generators.Grid = class {
    constructor(width, height) {
        this._width = width;
        this._height = height;
    }

    createGrid() {
        let grid = [];
        for (var x = 0; x < this._width; x++) {
            grid[x] = [];
            for (var y = 0; y < this._height; y++) {
                grid[x][y] = 0;
            }
        }
        return grid
    }

    generate() {
        return this.createGrid();
    }
};