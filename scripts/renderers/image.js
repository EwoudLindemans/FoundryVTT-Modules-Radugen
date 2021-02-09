window.radugen = window.radugen || {};
radugen.renderer = radugen.renderer || {};


radugen.renderer.Image = class {
    constructor(grid, tileResolution) {
        this._grid = grid;

        this._imageWidth = this._grid.width * tileResolution;
        this._imageHeight = this._grid.height * tileResolution;

        this._tileResolution = tileResolution;

        this._baseCanvas = this.createCanvas();
        this._baseCtx = this._baseCanvas.getContext("2d");
    }

    getDirectoryContents(src) {
        return FilePicker.browse("data", src);
    }

    getPatternDirectoryContents() {
        return this.getDirectoryContents('modules/Radugen/assets/patterns/');
    }

    async getThemeFileDirectoryContents(theme) {
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

    async render() {
        return new Promise((resolve, reject) => {            
            const floorCanvas = this.createCanvas();
            const floorCtx = floorCanvas.getContext("2d");

            this._baseCtx.save();
            floorCtx.save();
            // floorCtx.imageSmoothingEnabled = false;
            floorCtx.imageSmoothingQuality  = "high";

            this.getThemeFileDirectoryContents({
                floor: "grass",
            }).then(([background]) => {
                //Background
                this._baseCtx.fillStyle = "black";
                this._baseCtx.fillRect(0, 0, this._imageWidth, this._imageHeight);
                return this.loadImage(radugen.helper.getRndFromArr(background.files)).then(img => {
                    this.patternizeContext(this._baseCtx, img, 1);
                    this.renderFloorTilesBg(this._baseCtx);
                    this.resetContext(this._baseCtx);
                });
            }).then(async () => {
                //Floor

                let [floorFiles, wallFiles] = await this.getThemeFileDirectoryContents({
                    floor: "wood",
                    wall: "wood"
                });
                // await this.renderFloorTiles(floorCtx, floorFiles);
                await this.renderFloorTiles(floorCtx, radugen.helper.getRndFromArr(floorFiles.files));
                await this.renderWallTiles(floorCtx, radugen.helper.getRndFromArr(wallFiles.files));

                // let patterns = await this.getPatternDirectoryContents();
                // let patternImage = await this.loadImage(radugen.helper.getRndFromArr(patterns.files))

                //await this.patternizeContext(floorCtx, patternImage, 0.8); 

                //Color overwrite's patter at the moment, we need to fix this someway.
                // const rnd = radugen.helper.getRndFromNum;
                // this.gradientContext(floorCtx, [rnd(255), rnd(255), rnd(255), rnd(100) / 100], [rnd(255), rnd(255), rnd(255),  rnd(100) / 100])

                this.resetContext(floorCtx);
                // this.renderWalls(floorCtx);
                return;
            }).finally(() => {
                //Whatever happens, merge the contexts we do have
                this._baseCtx.drawImage(floorCanvas, 0, 0);
                this._baseCanvas.toBlob(imageBlob => {
                    resolve(imageBlob);
                }, "image/webp", 0.80);
            });
        });
    }

    renderFloorTilesBg(ctx) {
        this._grid.iterate((tile, x, y) => {
            if (tile != 0) {
                ctx.fillStyle = "black";
                ctx.fillRect(x * this._tileResolution, y * this._tileResolution, this._tileResolution, this._tileResolution);
            };
        });
    }

    async renderFloorTiles(ctx, floorTextureSrc) {
        let floorTextureImg = await this.loadImage(floorTextureSrc);

        this._grid.iterate((tile, x, y) => {
            if (tile != 0) {
                ctx.translate(x * this._tileResolution, y * this._tileResolution); // move tile
                // this.rotateContextRandom(ctx);
                ctx.drawImage(floorTextureImg, 0, 0, this._tileResolution, this._tileResolution);
                this.resetContext(ctx);
            };
        });
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
        ctx.globalAlpha = 1;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.globalCompositeOperation = 'source-over';
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


    getTileCoordinate(x, y, direction) {
        switch (direction) {
            case 'top': return this._tileResolution * y;
            case 'right': return this._tileResolution * (x + 1);
            case 'bottom': return this._tileResolution * (y + 1);
            case 'left': return this._tileResolution * x;
            default:
        }
    }

    /**
     * @returns {Array} [x0,y0,x1,y1]
     */
    getWallForSide(x, y, direction) {
        switch (direction) {
            case 'top':
                return [
                    this.getTileCoordinate(x, y, 'left'),
                    this.getTileCoordinate(x, y, 'top'),
                    this.getTileCoordinate(x, y, 'right'),
                    this.getTileCoordinate(x, y, 'top')
                ];
            case 'right':
                return [
                    this.getTileCoordinate(x, y, 'right'),
                    this.getTileCoordinate(x, y, 'top'),
                    this.getTileCoordinate(x, y, 'right'),
                    this.getTileCoordinate(x, y, 'bottom')
                ];
            case 'bottom':
                return [
                    this.getTileCoordinate(x, y, 'right'),
                    this.getTileCoordinate(x, y, 'bottom'),
                    this.getTileCoordinate(x, y, 'left'),
                    this.getTileCoordinate(x, y, 'bottom')
                ];
            case 'left':
                return [
                    this.getTileCoordinate(x, y, 'left'),
                    this.getTileCoordinate(x, y, 'bottom'),
                    this.getTileCoordinate(x, y, 'left'),
                    this.getTileCoordinate(x, y, 'top')
                ];
            default:
        }
    }

    async renderWallTiles(ctx, wallTextureSrc) {
        let wallTextureImg = await this.loadImage(wallTextureSrc);


        let [pillarFiles] = await this.getThemeFileDirectoryContents({
            floor: "rough",
        });

        let pillarImages = [];
        for (let file of pillarFiles.files) {
            let img = await this.loadImage(file);
            pillarImages.push(img);
        }
        


        const walls = [];
        this._grid.iterate((tile, x, y, adjecent) => {
            if (tile != 0) {
                if (adjecent.top == 0) {
                    let [x0, x1, y0, y1] = this.getWallForSide(x, y, 'top');
                    this.drawWall(ctx, x0, x1, y0, y1, wallTextureImg);
                }

                if (adjecent.bottom == 0) {
                    let [x0, x1, y0, y1] = this.getWallForSide(x, y, 'bottom');
                    this.drawWall(ctx, x0, x1, y0, y1, wallTextureImg);
                }

                if(adjecent.left == 0){
                    let [x0, x1, y0, y1] = this.getWallForSide(x, y, 'left');
                    this.drawWall(ctx, x0, x1, y0, y1, wallTextureImg);
                }

                if(adjecent.right == 0){
                    let [x0, x1, y0, y1] = this.getWallForSide(x, y, 'right');
                    this.drawWall(ctx, x0, x1, y0, y1, wallTextureImg);
                }
            }
        });

        this._grid.iterate((tile, x, y, adjecent) => {
            if (tile != 0) {
                if (adjecent.top == 0) { 
                    if(adjecent.left == 0){ //Draw square
                        let [x0, x1, y0, y1] = this.getWallForSide(x, y, 'top');
                        this.drawWallCorner(ctx, x0, x1, pillarImages);
                    }

                    if(adjecent.right == 0){ //Draw square
                        let [x0, x1, y0, y1] = this.getWallForSide(x, y, 'right');
                        this.drawWallCorner(ctx, x0, x1, pillarImages);
                    }
                }

                //check bottom
                if (adjecent.bottom == 0) {
                    if(adjecent.left == 0){ //Draw square
                        let [x0, x1, y0, y1] = this.getWallForSide(x, y, 'left');
                        this.drawWallCorner(ctx, x0, x1, pillarImages);
                    }
                    if(adjecent.right == 0){ //Draw square
                        let [x0, x1, y0, y1] = this.getWallForSide(x, y, 'bottom');
                        this.drawWallCorner(ctx, x0, x1, pillarImages);
                    }
                }

                //Cross checks
                if(adjecent.topRight == 0 && adjecent.top != 0 && adjecent.right != 0){
                    let [x0, x1, y0, y1] = this.getWallForSide(x, y, 'right');
                    this.drawWallCorner(ctx, x0, x1, pillarImages);
                }
                //Cross checks
                if(adjecent.bottomRight == 0 && adjecent.bottom != 0 && adjecent.right != 0){
                    let [x0, x1, y0, y1] = this.getWallForSide(x, y, 'bottom');
                    this.drawWallCorner(ctx, x0, x1, pillarImages);
                }
                //Cross checks
                if(adjecent.bottomLeft == 0 && adjecent.left != 0 && adjecent.bottom != 0){
                    let [x0, x1, y0, y1] = this.getWallForSide(x, y, 'left');
                    this.drawWallCorner(ctx, x0, x1, pillarImages);
                }
                //Cross checks
                if(adjecent.topLeft == 0 && adjecent.top != 0 && adjecent.left != 0){
                    let [x0, x1, y0, y1] = this.getWallForSide(x, y, 'top');
                    this.drawWallCorner(ctx, x0, x1, pillarImages);
                }

                //Middle walls
                if (adjecent.top != 0 && adjecent.left == 0 && adjecent.topLeft == 0) {
                    let [x0, x1, y0, y1] = this.getWallForSide(x, y, 'top');
                    this.drawWallMiddle(ctx, x0, x1, pillarImages);
                }
                if (adjecent.right != 0 && adjecent.top == 0 && adjecent.topRight == 0) {
                    let [x0, x1, y0, y1] = this.getWallForSide(x, y, 'right');
                    this.drawWallMiddle(ctx, x0, x1, pillarImages);
                }
                if (adjecent.bottom != 0 && adjecent.right == 0 && adjecent.bottomRight == 0) {
                    let [x0, x1, y0, y1] = this.getWallForSide(x, y, 'bottom');
                    this.drawWallMiddle(ctx, x0, x1, pillarImages);
                }
                if (adjecent.left != 0 && adjecent.bottom == 0 && adjecent.bottomLeft == 0) {
                    let [x0, x1, y0, y1] = this.getWallForSide(x, y, 'left');
                    this.drawWallMiddle(ctx, x0, x1, pillarImages);
                }
            }
        });

        return walls;
    }


    drawWallMiddle(ctx, centerX, centerY, pillarImages){
        let size = this._tileResolution / 8;
        size = size % 2 == 1 ? size + 1 : size;
        let img = radugen.helper.getRndFromArr(pillarImages);
        ctx.drawImage(img, 0, 0, img.width, img.height, centerX - size / 2, centerY - size / 2, size, size);
    }
    drawWallCorner(ctx, centerX, centerY, pillarImages){
        let size = this._tileResolution / 4;
        let img = radugen.helper.getRndFromArr(pillarImages);
        ctx.drawImage(img, 0, 0, img.width, img.height, centerX - size / 2, centerY - size / 2, size, size);
    }

    drawWall(ctx, x0, y0, x1, y1, wallTextureImg) {
        let size = Math.round(this._tileResolution / 6);
        let wallThickness = size % 2 == 1 ? size + 1 : size;
        let rnd = radugen.helper.getRndFromNum;

        let xstart, xend, ystart, yend;
        if(x0 < x1){
            xstart = x0;
            xend = x1;
        }
        else{
            xstart = x1;
            xend = x0;
        }

        if(y0 < y1){
            ystart = y0;
            yend = y1;
        }
        else{
            ystart = y1;
            yend = y0;
        }

        let width = xend - xstart;
        let height = yend - ystart;

        if(xstart == xend){
            let rndxStart = rnd(wallTextureImg.width - wallThickness);
            let rndyStart = rnd(wallTextureImg.height - height);
            ctx.drawImage(wallTextureImg, rndxStart, rndyStart, wallThickness, height, xstart - wallThickness / 2, ystart, wallThickness, height);
        }
        else{
            let rndxStart = rnd(wallTextureImg.width - width);
            let rndyStart = rnd(wallTextureImg.height - wallThickness);
            ctx.save(); 
            ctx.translate(this._tileResolution / 2, this._tileResolution / 2);
            ctx.translate(xstart - wallThickness / 2, ystart - wallThickness);
            ctx.translate(width / 2, wallThickness / 2);
            ctx.rotate(90 * Math.PI / 180);
            ctx.translate(-width / 2, -wallThickness / 2);
            ctx.drawImage(wallTextureImg, rndxStart, rndyStart, width, wallThickness, 0, 0, wallThickness, width);
            ctx.restore();
        }
    }
};