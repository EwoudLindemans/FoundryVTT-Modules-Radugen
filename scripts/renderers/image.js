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

    getJsonObject(src){
        return new Promise(function(resove, reject){
            let request = new XMLHttpRequest();
            request.open('GET', src, true);
            request.send(null);
            request.onreadystatechange = function () {
                if (request.readyState === 4 && request.status === 200) {
                    resove(JSON.parse(request.responseText));
                }
            }
        });
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


    async loadThemes(themeName){
        return (await this.getDirectoryContents(`modules/Radugen/assets/themes/`)).dirs;
    }

    async loadTheme(themeFolder){
        let theme = {};
        let themeFolderStructure = await this.getDirectoryContents(themeFolder);
        let themeFolders = themeFolderStructure.dirs;


        theme.settings = {
            "floor": {
                "allowMultiple": false,
                "allowTexture": false,
                "allowHue": false,
                "allowRotate": false,
                "allowFlip": false
            }
        }
        if(themeFolderStructure.files.length){
            theme.settings = await this.getJsonObject(themeFolderStructure.files[0]);
        }

        for(let subFolder of themeFolders){
            let name = subFolder.substring(subFolder.lastIndexOf("/") + 1, subFolder.length);
            theme[name] = (await this.getDirectoryContents(subFolder)).files;
            
        }

        return theme;
    }

    createCanvas() {
        const canvas = document.createElement('canvas');
        canvas.width = this._imageWidth;
        canvas.height = this._imageHeight;
        return canvas;
    }

    async render() {
        const rnd = radugen.helper.getRndFromNum;
        const themes = await this.loadThemes();
        this._theme = await this.loadTheme(radugen.helper.getRndFromArr(themes));
        // this._theme = await this.loadTheme("modules/Radugen/assets/themes/Random%20Dungeon");
        return new Promise(async (resolve, reject) => {            
            
            this._baseCtx.save();
            
            let hue = [[rnd(255), rnd(255), rnd(255), rnd(100) / 100], [rnd(255), rnd(255), rnd(255),  rnd(100) / 100]];

            //Background
            if(this._theme.background.length){
                this._baseCtx.fillStyle = "black";
                this._baseCtx.fillRect(0, 0, this._imageWidth, this._imageHeight);
                let backgroundImg = await this.loadImage(radugen.helper.getRndFromArr(this._theme.background));
                this.patternizeContext(this._baseCtx, backgroundImg, 1);
                this.renderFloorTilesBg(this._baseCtx);
                this._baseCtx.restore();
            }

            //Floor
            if(this._theme.floor.length){
                const floorCanvas = this.createCanvas();
                const floorCtx = floorCanvas.getContext("2d");
                floorCtx.save();
                floorCtx.imageSmoothingQuality  = "high";

                await this.renderFloorTiles(floorCtx);

                if(this._theme.settings.floor.allowHue){
                    this.gradientContext(floorCtx, hue)
                }

                this._baseCtx.drawImage(floorCanvas, 0, 0);
            }


            if(this._theme.wall.length){
                const wallCanvas = this.createCanvas();
                const wallCtx = wallCanvas.getContext("2d");
                wallCtx.save();
                wallCtx.imageSmoothingQuality  = "high";
                await this.renderWallTiles(wallCtx, radugen.helper.getRndFromArr(this._theme.wall));

                // if(this._theme.settings.floor.allowHue){
                //     this.gradientContext(wallCtx, hue)
                // }

                this._baseCtx.drawImage(wallCanvas, 0, 0);
            }

             //Whatever happens, merge the contexts we do have
             this._baseCanvas.toBlob(imageBlob => {
                 resolve(imageBlob);
             }, "image/webp", 0.80);
        });
    }

    renderFloorTilesBg(ctx) {
        this._grid.iterate((tile, x, y) => {
            if (tile.type != 0) {
                ctx.fillStyle = "black";
                ctx.fillRect(x * this._tileResolution, y * this._tileResolution, this._tileResolution, this._tileResolution);
            };
        });
    }

    async renderFloorTiles(ctx) {
        //preload all floor tiles
        let floorTextureImages = [];
        if(this._theme.settings.floor.allowMultiple){
            for(let floortile of this._theme.floor){
                floorTextureImages.push(await this.loadImage(floortile));
            }
        }

        let floorTextureImg = await this.loadImage(radugen.helper.getRndFromArr(this._theme.floor));

        this._grid.iterate((tile, x, y) => {
            if (tile.type != 0) {
                ctx.save();
                //Grab a new image
                if(this._theme.settings.floor.allowMultiple){
                    floorTextureImg = radugen.helper.getRndFromArr(floorTextureImages);
                }

                if(this._theme.settings.floor.allowFlip){
                    this.flipContextRandom(ctx, x, y);
                }
                else{
                    ctx.translate(x * this._tileResolution, y * this._tileResolution); // move tile
                }
5
                if(this._theme.settings.floor.allowRotate){
                    this.rotateContextRandom(ctx);
                }
                ctx.drawImage(floorTextureImg, 0, 0, this._tileResolution, this._tileResolution);
                ctx.restore();
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

    gradientContext(ctx, rgba){
        let rgbaStart = rgba[0];
        let rgbaEnd = rgba[1];
        ctx.save();
        ctx.globalCompositeOperation = 'source-atop';
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
        ctx.restore();
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


        let pillarImages = [];
        if(this._theme.pillar){
            for (let file of this._theme.pillar) {
                let img = await this.loadImage(file);
                pillarImages.push(img);
            }
        }
        
        this._grid.iterate((tile, x, y, adjecent) => {
            if (tile.type != 0) {
                if (adjecent.top.type == 0) {
                    let [x0, x1, y0, y1] = this.getWallForSide(x, y, 'top');
                    this.drawWall(ctx, x0, x1, y0, y1, wallTextureImg);
                }

                if (adjecent.bottom.type == 0) {
                    let [x0, x1, y0, y1] = this.getWallForSide(x, y, 'bottom');
                    this.drawWall(ctx, x0, x1, y0, y1, wallTextureImg);
                }

                if(adjecent.left.type == 0){
                    let [x0, x1, y0, y1] = this.getWallForSide(x, y, 'left');
                    this.drawWall(ctx, x0, x1, y0, y1, wallTextureImg);
                }

                if(adjecent.right.type == 0){
                    let [x0, x1, y0, y1] = this.getWallForSide(x, y, 'right');
                    this.drawWall(ctx, x0, x1, y0, y1, wallTextureImg);
                }
            }
        });

        this._grid.iterate((tile, x, y, adjecent) => {
            if (tile.type != 0) {
                if (adjecent.top.type == 0) { 
                    if(adjecent.left.type == 0){ //Draw square
                        let [x0, x1, y0, y1] = this.getWallForSide(x, y, 'top');
                        this.drawWallCorner(ctx, x0, x1, pillarImages);
                    }

                    if(adjecent.right.type == 0){ //Draw square
                        let [x0, x1, y0, y1] = this.getWallForSide(x, y, 'right');
                        this.drawWallCorner(ctx, x0, x1, pillarImages);
                    }
                }

                //check bottom
                if (adjecent.bottom.type == 0) {
                    if(adjecent.left.type == 0){ //Draw square
                        let [x0, x1, y0, y1] = this.getWallForSide(x, y, 'left');
                        this.drawWallCorner(ctx, x0, x1, pillarImages);
                    }
                    if(adjecent.right.type == 0){ //Draw square
                        let [x0, x1, y0, y1] = this.getWallForSide(x, y, 'bottom');
                        this.drawWallCorner(ctx, x0, x1, pillarImages);
                    }
                }

                //Cross checks
                if(adjecent.topRight.type == 0 && adjecent.top.type != 0 && adjecent.right.type != 0){
                    let [x0, x1, y0, y1] = this.getWallForSide(x, y, 'right');
                    this.drawWallCorner(ctx, x0, x1, pillarImages);
                }
                //Cross checks
                if(adjecent.bottomRight.type == 0 && adjecent.bottom.type != 0 && adjecent.right.type != 0){
                    let [x0, x1, y0, y1] = this.getWallForSide(x, y, 'bottom');
                    this.drawWallCorner(ctx, x0, x1, pillarImages);
                }
                //Cross checks
                if(adjecent.bottomLeft.type == 0 && adjecent.left.type != 0 && adjecent.bottom.type != 0){
                    let [x0, x1, y0, y1] = this.getWallForSide(x, y, 'left');
                    this.drawWallCorner(ctx, x0, x1, pillarImages);
                }
                //Cross checks
                if(adjecent.topLeft.type == 0 && adjecent.top.type != 0 && adjecent.left.type != 0){
                    let [x0, x1, y0, y1] = this.getWallForSide(x, y, 'top');
                    this.drawWallCorner(ctx, x0, x1, pillarImages);
                }

                //Middle walls
                if (adjecent.top.type != 0 && adjecent.left.type == 0 && adjecent.topLeft.type == 0) {
                    let [x0, x1, y0, y1] = this.getWallForSide(x, y, 'top');
                    this.drawWallMiddle(ctx, x0, x1, pillarImages);
                }
                if (adjecent.right.type != 0 && adjecent.top.type == 0 && adjecent.topRight.type == 0) {
                    let [x0, x1, y0, y1] = this.getWallForSide(x, y, 'right');
                    this.drawWallMiddle(ctx, x0, x1, pillarImages);
                }
                if (adjecent.bottom.type != 0 && adjecent.right.type == 0 && adjecent.bottomRight.type == 0) {
                    let [x0, x1, y0, y1] = this.getWallForSide(x, y, 'bottom');
                    this.drawWallMiddle(ctx, x0, x1, pillarImages);
                }
                if (adjecent.left != 0 && adjecent.bottom.type == 0 && adjecent.bottomLeft.type == 0) {
                    let [x0, x1, y0, y1] = this.getWallForSide(x, y, 'left');
                    this.drawWallMiddle(ctx, x0, x1, pillarImages);
                }
            }
        });
    }


    drawWallMiddle(ctx, centerX, centerY, pillarImages){
        if(pillarImages.length){
            let size = this._tileResolution / 8;
            size = size % 2 == 1 ? size + 1 : size;
            let img = radugen.helper.getRndFromArr(pillarImages);
            ctx.drawImage(img, 0, 0, img.width, img.height, centerX - size / 2, centerY - size / 2, size, size);
        }
    }
    drawWallCorner(ctx, centerX, centerY, pillarImages){
        if(pillarImages.length){
            let size = this._tileResolution / 4;
            let img = radugen.helper.getRndFromArr(pillarImages);
            ctx.drawImage(img, 0, 0, img.width, img.height, centerX - size / 2, centerY - size / 2, size, size);
        }
    }

    drawWall(ctx, x0, y0, x1, y1, wallTextureImg) {
        if(wallTextureImg){
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
    }
};