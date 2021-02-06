window.radugen = window.radugen || {};
radugen.renderer = radugen.renderer || {};
radugen.renderer.Image = class {
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

    getPatternDirectoryContents() {
        return this.getDirectoryContents('modules/Radugen/assets/patterns/');
    }

    getThemeFileDirectoryContents(theme) {
        const promises = [];
        for (let key in theme) {
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
        return new Promise((resolve, reject) => {
            const baseCanvas = this.createCanvas();
            const baseCtx = baseCanvas.getContext("2d");
            
            const floorCanvas = this.createCanvas();
            const floorCtx = floorCanvas.getContext("2d");

            baseCtx.save();
            floorCtx.save();

            this.getThemeFileDirectoryContents({
                floor: "cobble",
            }).then(([background]) => {
                //Background
                baseCtx.fillStyle = "black";
                baseCtx.fillRect(0, 0, this._imageWidth, this._imageHeight);
                return this.loadImage(radugen.helper.getRndFromArr(background.files)).then(img => {
                    this.patternizeContext(baseCtx, img, 0.1);
                    this.renderFloorTilesBg(baseCtx);
                    this.resetContext(baseCtx);
                });
            }).then(() => {
                //Floor
                return this.getThemeFileDirectoryContents({
                    floor: "rough",
                    walls: "rough"
                }).then(([floorFiles, wallFiles]) => {
                    return this.renderFloorTiles(floorCtx, floorFiles)
                }).then(() => {
                    return this.getPatternDirectoryContents()
                }).then((patterns) => {
                    return this.loadImage(radugen.helper.getRndFromArr(patterns.files))
                }).then((img) => {
                    this.patternizeContext(floorCtx, img, 0.8); 

                    //Color overwrite's patter at the moment, we need to fix this someway.
                    const rnd = radugen.helper.getRndFromNum;
                    this.gradientContext(floorCtx, [rnd(255), rnd(255), rnd(255), rnd(100) / 100], [rnd(255), rnd(255), rnd(255),  rnd(100) / 100])
                });
            }).finally(() => {
                //Whatever happens, merge the contexts we do have
                
                baseCtx.drawImage(floorCanvas, 0, 0);
                baseCanvas.toBlob(imageBlob => {
                    resolve(imageBlob);
                }, "image/webp", 0.80);
            });
        });
    }

    renderFloorTilesBg(ctx) {
        this.iterateMap((x, y) => {
            if (this._map[y][x] != 0) {
                ctx.fillStyle = "black";
                ctx.fillRect(x * this._tileResolution, y * this._tileResolution, this._tileResolution, this._tileResolution);
            };
        })
    }

    renderFloorTiles(ctx, themeFiles) {
        let promises = [];

        this.iterateMap((x, y) => {
            if (this._map[y][x] != 0) {
                promises.push(
                    this.loadImage(radugen.helper.getRndFromArr(themeFiles.files)).then(img => {
                        this.flipContextRandom(ctx, x, y);
                        this.rotateContextRandom(ctx);
                        ctx.drawImage(img, 0, 0, this._tileResolution, this._tileResolution);
                        this.resetContext(ctx);
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
        throw Error("This is only available in css");
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

    hueContext(ctx, rgba){
        let [r,g,b,a] = rgba;
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
        ctx.fillRect(0, 0,  this._imageWidth, this._imageHeight);
    }

    gradientContext(ctx, rgbaStart, rgbaEnd){
        let [r, g, b, a] = rgbaStart;
        const rnd = radugen.helper.getRndFromNum

        let directionXStart = rnd(this._imageWidth);
        let directionXEnd = this._imageWidth - directionXStart;

        let directionYStart = rnd(this._imageHeight);
        let directionYEnd = this._imageHeight - directionYStart;

        let gradient = ctx.createLinearGradient(directionXStart, directionYStart, directionXEnd, directionYEnd);
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${a})`);

        [r, g, b, a] = rgbaEnd;
        gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, ${a})`);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this._imageWidth, this._imageHeight);
    }
};