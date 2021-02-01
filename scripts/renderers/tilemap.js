window.radugen = window.radugen || {};
radugen.renderer = radugen.renderer || {};
radugen.renderer.Tilemap = class {
    constructor(map, tileResolution) {
        this._map = map;
        this._gridWidth = map.length;
        this._gridHeight = map[0].length

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
        var self = this;
        return new Promise(function (resolve, reject) {
            const baseCanvas = self.createCanvas();
            const baseCtx = baseCanvas.getContext("2d");
            baseCtx.imageSmoothingEnabled = false;
            
            //Load tilemap
            self.getTilemapDirectoryContents("zelda").then(function (tileMapFiles) {

                var json = tileMapFiles.files.find(p => {
                    return p.indexOf('definition.json') != -1
                });

                var tilemap = tileMapFiles.files.find(p => {
                    return p.indexOf('tilemap') != -1
                });

                $.getJSON(json, function (data) {
                    self.loadImage(tilemap).then(function (image) {
                        self.renderTileMap(baseCtx, data, image);
                        baseCanvas.toBlob(function (imageBlob) {
                            resolve(imageBlob);
                        }, "image/webp", 0.80);
                    })
                });
            }).finally(function () {
                //Whatever happens, merge the contexts we do have
                
            });
        });
    }

    renderTileMap(ctx, definition, tileMap) {
        console.log(definition, tileMap);
        let self = this;

        this.iterateMap(function (x, y) {
            if (self._map[x][y] == 1) {
                self.drawMapPart(ctx, definition, tileMap, 'floor', x, y);
            };

            if (self._map[x][y] == 0) {
                let drawTop = false;
                let drawLeft = false;
                let drawRight = false;
                let drawBottom = false;
                let drawCount = 0;

                //check top
                if (y != 0) {
                    if (self._map[x][y - 1] != 0) {
                        drawTop = true;
                        drawCount++;
                    }
                }

                //check left
                if (x != 0) {
                    if (self._map[x - 1][y] != 0) {
                        drawLeft = true;
                        drawCount++;
                    }
                }

                //check right
                if (x != self._gridWidth - 1) {
                    if (self._map[x + 1][y] != 0) {
                        drawRight = true;
                        drawCount++;
                    }
                }

                //check bottom
                if (y != self._gridHeight - 1) {
                    if (self._map[x][y + 1] != 0) {
                        drawBottom = true;
                        drawCount++;
                    }
                }

                if (drawCount == 1) {
                    if (drawTop) {
                        self.drawMapPart(ctx, definition, tileMap, 'wall_bottom', x, y);
                    }
                    if (drawLeft) {
                        self.drawMapPart(ctx, definition, tileMap, 'wall_right', x, y);
                    }
                    if (drawRight) {
                        self.drawMapPart(ctx, definition, tileMap, 'wall_left', x, y);
                    }
                    if (drawBottom) {
                        self.drawMapPart(ctx, definition, tileMap, 'wall_top', x, y);
                    }
                }

                let inverseWalls = false;

                if (drawCount == 0) {
                    //check top left
                    if (y != 0 && x != 0) {
                        if (self._map[x - 1][y - 1] != 0) {
                            self.drawMapPart(ctx, definition, tileMap, 'wall_bottomright_out', x, y);
                        }
                    }

                    //check top right
                    if (y != 0 && x != self._gridWidth - 1) {
                        if (self._map[x + 1][y - 1] != 0) {
                            self.drawMapPart(ctx, definition, tileMap, 'wall_bottomleft_out', x, y);
                        }
                    }

                    //check bottom left
                    if (y != self._gridHeight - 1 && x != 0) {
                        if (self._map[x - 1][y + 1] != 0) {
                            self.drawMapPart(ctx, definition, tileMap, 'wall_topright_out', x, y);
                        }
                    }

                    //check bottom right
                    if (y != self._gridHeight - 1 && x != self._gridWidth - 1) {
                        if (self._map[x + 1][y + 1] != 0) {
                            self.drawMapPart(ctx, definition, tileMap, 'wall_topleft_out', x, y);
                        }
                    }
                }

                
                //inward walls
                if (drawCount == 2) {
                    console.log(drawCount);
                    if (drawTop && drawLeft) {
                        self.drawMapPart(ctx, definition, tileMap, 'wall_topleft_in', x, y);
                    }
                    if (drawTop && drawRight) {
                        self.drawMapPart(ctx, definition, tileMap, 'wall_topright_in', x, y);
                    }
                    if (drawBottom && drawLeft) {
                        self.drawMapPart(ctx, definition, tileMap, 'wall_bottomleft_in', x, y);
                    }
                    if (drawBottom && drawRight) {
                        self.drawMapPart(ctx, definition, tileMap, 'wall_bottomright_in', x, y);
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
        return new Promise(function (resolve, reject) {
            const img = new Image();
            img.onload = function () {
                resolve(img);
            };
            img.src = src
        });
    }


    resetContext(ctx) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.restore();
    }
};