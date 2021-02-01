window.radugen = window.radugen || {};
radugen.renderer = radugen.renderer || {};
radugen.renderer.Image = class {
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

    getPatternDirectoryContents() {
        return this.getDirectoryContents('modules/Radugen/assets/patterns/');
    }

    getThemeFileDirectoryContents(theme) {
        const promises = [];
        for (var key in theme) {
            if (theme.hasOwnProperty(key)) {
                promises.push(this.getDirectoryContents(`modules/Radugen/assets/themes/${theme[key]}/${key}/`));
            }
        }

        return Promise.all(promises);
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
            
            const floorCanvas = self.createCanvas();
            const floorCtx = floorCanvas.getContext("2d");

            baseCtx.save();
            floorCtx.save();

            self.getThemeFileDirectoryContents({
                floor: "cobble",
            }).then(function ([background]) {
                //Background
                baseCtx.fillStyle = "black";
                baseCtx.fillRect(0, 0, self._imageWidth, self._imageHeight);
                return self.loadImage(radugen.helper.getRndFromArr(background.files)).then(function (img) {
                    self.patternizeContext(baseCtx, img, 0.1);
                    self.renderFloorTilesBg(baseCtx);
                    self.resetContext(baseCtx);
                });
            }).then(function () {
                //Floor
                return self.getThemeFileDirectoryContents({
                    floor: "rough",
                    walls: "rough"
                }).then(function ([floorFiles, wallFiles]) {
                    return self.renderFloorTiles(floorCtx, floorFiles)
                }).then(function () {
                    return self.getPatternDirectoryContents()
                }).then(function (patterns) {
                    return self.loadImage(radugen.helper.getRndFromArr(patterns.files))
                }).then(function (img) {
                    self.patternizeContext(floorCtx, img, 0.8); 
                });
            }).finally(function () {
                //Whatever happens, merge the contexts we do have
                baseCtx.drawImage(floorCanvas, 0, 0);
                baseCanvas.toBlob(function (imageBlob) {
                    resolve(imageBlob);
                }, "image/webp", 0.80);
            });
        });
    }

    renderFloorTilesBg(ctx) {
        let self = this;
        this.iterateMap(function (x, y) {
            if (self._map[x][y] == 1) {
                ctx.fillStyle = "black";
                ctx.fillRect(x * self._tileResolution, y * self._tileResolution, self._tileResolution, self._tileResolution);
            };
        })
    }

    renderFloorTiles(ctx, themeFiles) {
        let self = this;
        let promises = [];

        this.iterateMap(function (x, y) {
            if (self._map[x][y] == 1) {
                promises.push(
                    self.loadImage(radugen.helper.getRndFromArr(themeFiles.files)).then(function (img) {
                        self.flipContextRandom(ctx, x, y);
                        self.rotateContextRandom(ctx);
                        ctx.drawImage(img, 0, 0, self._tileResolution, self._tileResolution);
                        self.resetContext(ctx);
                    })
                )
            };
        })

        return Promise.all(promises);
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

    rotateContextRandom(ctx) {
        ctx.translate(this._tileResolution / 2, this._tileResolution / 2);
        ctx.rotate((Math.PI / 2) * radugen.helper.getRndFromNum(4)); // rotate tile
        ctx.translate(-this._tileResolution / 2, -this._tileResolution / 2);
    }

    flipContextRandom(ctx, x, y) {
        if (radugen.helper.getRndFromNum(2) == 1) {
            ctx.transform(-1, 0, 0, 1, (x + 1) * this._tileResolution, y * this._tileResolution); // flip and move tile
        } else {
            ctx.translate(x * this._tileResolution, y * this._tileResolution); // move tile
        }
    }

    /**
     * @param {string} expression see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/filter
     */
    filterContext(ctx, expression) {
        ctx.filter = expression;
    }

    patternizeContext(ctx, texture, opacity) {
        let pattern = ctx.createPattern(texture, "repeat");
        
        ctx.fillStyle = pattern;
        ctx.globalAlpha = opacity;

        ctx.globalCompositeOperation = 'source-atop';
        ctx.fillRect(0, 0, this._imageWidth, this._imageHeight);
        ctx.restore();
    }

    hueContextRandom(ctx) {

    }
};