window.radugen = window.radugen || {};
radugen.renderer = radugen.renderer || {};
radugen.renderer.Tilemap = class {
    constructor(map, tileResolution) {
        this._map = map;
        this._gridHeight = map.length
        this._gridWidth = map[0].length;

        this._imageWidth = this._gridWidth * tileResolution;
        this._imageHeight = this._gridHeight * tileResolution;

        this._tileResolution = tileResolution;
    }

    getDirectoryContents(src) {
        return FilePicker.browse("data", src);
    }

    getTilemapDirectoryContents(theme) {
        return this.getDirectoryContents(`modules/Radugen/assets/tilesets/${theme}/`);
    }

    createCanvas() {
        const canvas = document.createElement('canvas');
        canvas.width = this._imageWidth;
        canvas.height = this._imageHeight;
        return canvas;
    }

    render() {
        return new Promise((resolve, reject) => {
            const baseCanvas = this.createCanvas();
            const baseCtx = baseCanvas.getContext("2d");
            baseCtx.imageSmoothingEnabled = false;
            
            //Load tilemap
            this.getTilemapDirectoryContents("zelda").then(tileMapFiles => {

                const json = tileMapFiles.files.find(p => {
                    return p.indexOf('definition.json') != -1
                });

                const tilemap = tileMapFiles.files.find(p => {
                    return p.indexOf('tilemap') != -1
                });

                $.getJSON(json, data => {
                    this.loadImage(tilemap).then(image => {
                        this.renderTileMap(baseCtx, data, image);
                        baseCanvas.toBlob(imageBlob => {
                            resolve(imageBlob);
                        }, "image/webp", 0.80);
                    });
                });
            }).finally(() => {
                //Whatever happens, merge the contexts we do have
                
            });
        });
    }

    renderTileMap(ctx, definition, tileMap) {
        console.log(definition, tileMap);

        this.iterateMap((x, y) => {
            if (this._map[y][x] == 1) {
                this.drawMapPart(ctx, definition, tileMap, 'floor', x, y);
            };

            if (this._map[y][x] == 0) {
                let drawTop = false;
                let drawLeft = false;
                let drawRight = false;
                let drawBottom = false;
                let drawCount = 0;

                //check top
                if (y != 0) {
                    if (this._map[y - 1][x] != 0) {
                        drawTop = true;
                        drawCount++;
                    }
                }

                //check left
                if (x != 0) {
                    if (this._map[y][x - 1] != 0) {
                        drawLeft = true;
                        drawCount++;
                    }
                }

                //check right
                if (x != this._gridWidth - 1) {
                    if (this._map[y][x + 1] != 0) {
                        drawRight = true;
                        drawCount++;
                    }
                }

                //check bottom
                if (y != this._gridHeight - 1) {
                    if (this._map[y + 1][x] != 0) {
                        drawBottom = true;
                        drawCount++;
                    }
                }

                if (drawCount == 1) {
                    if (drawTop) {
                        this.drawMapPart(ctx, definition, tileMap, 'wall_bottom', x, y);
                    }
                    if (drawLeft) {
                        this.drawMapPart(ctx, definition, tileMap, 'wall_right', x, y);
                    }
                    if (drawRight) {
                        this.drawMapPart(ctx, definition, tileMap, 'wall_left', x, y);
                    }
                    if (drawBottom) {
                        this.drawMapPart(ctx, definition, tileMap, 'wall_top', x, y);
                    }
                }

                let inverseWalls = false;

                if (drawCount == 0) {
                    //check top left
                    if (y != 0 && x != 0) {
                        if (this._map[y - 1][x - 1] != 0) {
                            this.drawMapPart(ctx, definition, tileMap, 'wall_bottomright_out', x, y);
                        }
                    }

                    //check top right
                    if (y != 0 && x != this._gridWidth - 1) {
                        if (this._map[y - 1][x + 1] != 0) {
                            this.drawMapPart(ctx, definition, tileMap, 'wall_bottomleft_out', x, y);
                        }
                    }

                    //check bottom left
                    if (y != this._gridHeight - 1 && x != 0) {
                        if (this._map[y + 1][x - 1] != 0) {
                            this.drawMapPart(ctx, definition, tileMap, 'wall_topright_out', x, y);
                        }
                    }

                    //check bottom right
                    if (y != this._gridHeight - 1 && x != this._gridWidth - 1) {
                        if (this._map[y + 1][x + 1] != 0) {
                            this.drawMapPart(ctx, definition, tileMap, 'wall_topleft_out', x, y);
                        }
                    }
                }

                
                //inward walls
                if (drawCount == 2) {
                    console.log(drawCount);
                    if (drawTop && drawLeft) {
                        this.drawMapPart(ctx, definition, tileMap, 'wall_topleft_in', x, y);
                    }
                    if (drawTop && drawRight) {
                        this.drawMapPart(ctx, definition, tileMap, 'wall_topright_in', x, y);
                    }
                    if (drawBottom && drawLeft) {
                        this.drawMapPart(ctx, definition, tileMap, 'wall_bottomleft_in', x, y);
                    }
                    if (drawBottom && drawRight) {
                        this.drawMapPart(ctx, definition, tileMap, 'wall_bottomright_in', x, y);
                    }
                }
            }

        });
    }

    drawMapPart(ctx, definition, tileMap, part, x, y) {
        if (!definition.size) {
            console.error(`property size is missing in tiledefinition`);
            return;
        }
        if (!definition.hasOwnProperty(part)) {
            console.error(`property ${part} is missing in tiledefinition`);
            return;
        }
        if (definition[part].length < 2) {
            console.error(`missing x y position for property ${part}`);
            return;
        }
        ctx.drawImage(tileMap,                      //image
            definition.size * definition[part][0],  //sourceX
            definition.size * definition[part][1],  //sourceY
            definition.size,                        //sourceWidth
            definition.size,                        //sourceHeight
            x * this._tileResolution,               //destinationX
            y * this._tileResolution,               //destinationY
            this._tileResolution,                   //destinationWidth
            this._tileResolution)                   //destinationHeight
    }
  

    iterateMap(callback) {
        for (let x = 0; x < this._gridWidth; x++) {
            for (let y = 0; y < this._gridHeight; y++) {
                callback(x, y);
            }
        }
    }

    loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = function () {
                resolve(img);
            };
            img.src = src
        });
    }
};