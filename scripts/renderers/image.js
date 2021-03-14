window.radugen = window.radugen || {};
radugen.renderer = radugen.renderer || {};


radugen.renderer.Image = class {
    constructor(grid, tileResolution, theme) {
        this._grid = grid;

        this._imageWidth = this._grid.width * tileResolution;
        this._imageHeight = this._grid.height * tileResolution;

        this._tileResolution = tileResolution;

        this._baseCanvas = this.createCanvas();
        this._baseCtx = this._baseCanvas.getContext("2d");

        this._themeLoader = radugen.classes.ThemeLoader;
        this._theme = theme;
    }

    createCanvas() {
        const canvas = document.createElement('canvas');
        canvas.width = this._imageWidth;
        canvas.height = this._imageHeight;
        return canvas;
    }

    async render() {
        const [rnd] = [radugen.helper.getRndFromNum];
        const [TileType] = [radugen.classes.tiles.TileType];
        this._theme = await this._themeLoader.loadTheme(this._theme);

        let gradient =  [[rnd(255), rnd(255), rnd(255), 0.2 + rnd(60) / 100], [rnd(255), rnd(255), rnd(255), 0.2 + rnd(60) / 100]];
        let gradientDirection = this.getRandomDirection();
        return new Promise(async (resolve, reject) => {            
            this._baseCtx.save();

            if(this._theme.background.length){
                const backgroundCanvas = this.createCanvas();
                const backgroundCtx = backgroundCanvas.getContext("2d");
                backgroundCtx.fillStyle = "black";
                backgroundCtx.fillRect(0, 0, this._imageWidth, this._imageHeight);
                let backgroundImg = await this.loadImage(radugen.helper.getRndFromArr(this._theme.background));
                this.patternizeContext(backgroundCtx, backgroundImg, 1);
                this.renderFloorTilesBg(backgroundCtx);

                this.applyGenericFilters(backgroundCtx, this._theme.settings.background);
                this._baseCtx.drawImage(backgroundCanvas, 0, 0);
            }

            if(this._theme.floor.length){
                const floorCanvas = this.createCanvas();
                const floorCtx = floorCanvas.getContext("2d");
                floorCtx.save();
                floorCtx.imageSmoothingQuality  = "high";


                //Liquid
                const liquidCanvas = this.createCanvas();
                const liquidCtx = liquidCanvas.getContext("2d");
                liquidCtx.imageSmoothingQuality  = "high";

                const liquidBelowCanvas = this.createCanvas();
                const liquidBelowCtx = liquidBelowCanvas.getContext("2d");
                liquidBelowCtx.imageSmoothingQuality  = "high";

                if(this._theme.liquid.length){
                    let pattern = await this.loadImage(radugen.helper.getRndFromArr(this._theme.liquid));

                    // //Create liquid beneath tiles
                    // this.createBaseLayer(liquidBelowCtx, TileType.Room);
                    // this.patternizeContext(liquidBelowCtx, pattern, 1);
                    
                    await this.renderFloorTiles(floorCtx, floorCanvas, liquidCtx);
                    
                    //Create liquid on liquid tiles
                    this.createBaseLayer(liquidCtx, TileType.Liquid);
                    this.patternizeContext(liquidCtx, pattern, 1);
                }
                else{
                    await this.renderFloorTiles(floorCtx, floorCanvas, liquidCtx);
                }
                
                await this.renderFloorTiles(floorCtx, floorCanvas, liquidCtx);
                

                this.applyGenericFilters(floorCtx, this._theme.settings.floor, gradient, gradientDirection);
                this._baseCtx.drawImage(liquidBelowCanvas, 0, 0);
                this._baseCtx.drawImage(floorCanvas, 0, 0);
                this._baseCtx.drawImage(liquidCanvas, 0, 0);
            }       

            if(this._theme.wall.length){
                const wallCanvas = this.createCanvas();
                const wallCtx = wallCanvas.getContext("2d");
                wallCtx.save();
                wallCtx.imageSmoothingQuality  = "high";
                await this.renderWallTiles(wallCtx, radugen.helper.getRndFromArr(this._theme.wall));

                this.applyGenericFilters(wallCtx, this._theme.settings.wall, gradient, gradientDirection);
                this._baseCtx.drawImage(wallCanvas, 0, 0);
            }

             //Whatever happens, merge the contexts we do have
             this._baseCanvas.toBlob(imageBlob => {
                 resolve(imageBlob);
             }, "image/webp", 0.80);
        });
    }

    applyGenericFilters(ctx, themeSettings, gradient, gradientDirection){
        if(themeSettings.gradient == "random"){
            this.gradientContext(ctx, gradient, gradientDirection);
        }
    }

    renderFloorTilesBg(ctx) {
        this._grid.iterate((tile, x, y) => {
            if (tile.type != 0) {
                ctx.fillStyle = "black";
                ctx.fillRect(x * this._tileResolution, y * this._tileResolution, this._tileResolution, this._tileResolution);
            };
        });
    }

    async renderFloorTiles(ctx, canvas, liquidCtx) {
        const [TileType] = [radugen.classes.tiles.TileType];
        //preload all floor tiles
        let floorTextureImages = [];
        if(this._theme.settings.floor.mode == 'multiple'){
            for(let floortile of this._theme.floor){
                floorTextureImages.push(await this.loadImage(floortile));
            }
        }

        let floorTextureImg = await this.loadImage(radugen.helper.getRndFromArr(this._theme.floor));
        let flipRnd = radugen.helper.getRndFromNum(2);
        let rotateRnd = radugen.helper.getRndFromNum(4);
        this._grid.iterate((tile, x, y) => {
            if (tile.type == TileType.Room || tile.type == TileType.Corridor || tile.type == TileType.Liquid) {
                ctx.save();
                //Grab a new image
                if(this._theme.settings.floor.mode == 'multiple'){
                    floorTextureImg = radugen.helper.getRndFromArr(floorTextureImages);
                }

                // move tile
                ctx.translate(x * this._tileResolution, y * this._tileResolution); 
                if(this._theme.settings.floor.flip != 'none'){
                    if(this._theme.settings.floor.flip == 'random'){
                        flipRnd = radugen.helper.getRndFromNum(2);
                    }
                    this.flipContext(ctx, x, y, flipRnd);
                }

                if(this._theme.settings.floor.rotate != 'none'){
                    if(this._theme.settings.floor.rotate == 'random'){
                        rotateRnd = radugen.helper.getRndFromNum(4);
                    }
                    this.rotateContext(ctx, rotateRnd);
                }

                ctx.drawImage(floorTextureImg, 0, 0, this._tileResolution, this._tileResolution);
                ctx.restore();
            };
        });
    }
    
    async renderLiquidBelow(liquidCtx, pattern){
        const [TileType] = [radugen.classes.tiles.TileType];

        liquidCtx.save();
        this._grid.iterate((tile, x, y) => {
            if (tile.type == TileType.Room) {
                liquidCtx.translate(x * this._tileResolution, y * this._tileResolution);
                liquidCtx.fillStyle = 'black';
                liquidCtx.fillRect(0, 0, this._tileResolution, this._tileResolution);
            }
        });
        liquidCtx.restore();

        liquidCtx.save();
        liquidCtx.globalCompositeOperation = "source-atop";
        if(this._theme.liquid.length){
            let image = await this.loadImage(radugen.helper.getRndFromArr(this._theme.liquid));
            this.patternizeContext(liquidCtx, pattern, 1);
        }
        liquidCtx.restore();
    }

    async createBaseLayer(ctx, tileType){      
        ctx.save();
        this._grid.iterate((tile, x, y) => {
            if (tile.type == tileType) {
                ctx.fillStyle = 'black';
                ctx.fillRect(x * this._tileResolution, y * this._tileResolution, this._tileResolution, this._tileResolution);
            }
        });
        ctx.restore();
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

    rotateContext(ctx, rotate) {
        ctx.translate(this._tileResolution / 2, this._tileResolution / 2);
        ctx.rotate((Math.PI / 2) * rotate); // rotate tile
        ctx.translate(-this._tileResolution / 2, -this._tileResolution / 2);
    }

    flipContext(ctx, x, y, flip) {
        if (flip == 1) {
            ctx.transform(-1, 0, 0, 1, this._tileResolution, 0); // flip and move tile
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
        ctx.save();
        ctx.fillStyle = pattern;
        ctx.globalAlpha = opacity;

        ctx.globalCompositeOperation = 'source-atop';
        ctx.fillRect(0, 0, this._imageWidth, this._imageHeight);
        ctx.restore();
    }

    hueContext(ctx, rgba){
        let [r,g,b,a] = rgba;
        ctx.save();
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
        ctx.fillRect(0, 0,  this._imageWidth, this._imageHeight);
        ctx.restore();
    }

    getRandomDirection(){
        const [rnd] = [radugen.helper.getRndFromNum];

        let directionXStart = rnd(this._imageWidth);
        let directionXEnd = this._imageWidth - directionXStart;

        let directionYStart = rnd(this._imageHeight);
        let directionYEnd = this._imageHeight - directionYStart;

        return [directionXStart, directionYStart, directionXEnd, directionYEnd];
    }

    gradientContext(ctx, rgba, direction){
        let rgbaStart = rgba[0];
        let rgbaEnd = rgba[1];

        ctx.save();
        ctx.globalCompositeOperation = 'source-atop';
        const rnd = radugen.helper.getRndFromNum

        let gradient = ctx.createLinearGradient(direction[0], direction[1], direction[2], direction[3]);

        let [r, g, b, a] = rgbaStart;
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${a})`);

        [r, g, b, a] = rgbaEnd;
        gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, ${a})`);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this._imageWidth, this._imageHeight);
        ctx.restore();
    }


    getTilePos(x, y, direction) {
        if (direction.indexOf('-') != -1) {
            const output = [];
            for (let d of direction.split('-')) {
                output.push(this.getTilePos(x, y, d));
            }
            return output;
        }

        switch (direction) {
            case 'top': return this._tileResolution * y;
            case 'right': return this._tileResolution * (x + 1);
            case 'bottom': return this._tileResolution * (y + 1);
            case 'left': return this._tileResolution * x;
            default: throw `direction ${direction} undefined`;
        }
    }

    async renderWallTiles(ctx, wallTextureSrc) {
        let wallTextureImg = await this.loadImage(wallTextureSrc);


        let pillarTextureImages = [];
        if(this._theme.pillar){
            for (let file of this._theme.pillar) {
                let img = await this.loadImage(file);
                pillarTextureImages.push(img);
            }
        }

        //Mirror walls on tiles, so the new calculations are easy
        this._grid.iterate((tile, x, y, adjecent) => {
            if(tile.wall.top){ adjecent.top.wall.bottom = true; }
            if(tile.wall.right){ adjecent.right.wall.left = true; }
            if(tile.wall.bottom){ adjecent.bottom.wall.top = true; }
            if(tile.wall.left){ adjecent.left.wall.right = true; }
        });

        //Walls
        this._grid.iterate((tile, x, y, adjecent) => {
            if (tile.wall.top || (tile.type != 0 && adjecent.top.type == 0)) {
                this.drawWall(ctx, this.getTilePos(x, y,'left-top'), this.getTilePos(x, y,'right-top'), wallTextureImg);
            }
            if (tile.wall.right || (tile.type != 0 && adjecent.right.type == 0)) {
                this.drawWall(ctx, this.getTilePos(x, y,'right-top'), this.getTilePos(x, y,'right-bottom'), wallTextureImg);
            }
            if (tile.wall.bottom || (tile.type != 0 && adjecent.bottom.type == 0)) {
                this.drawWall(ctx, this.getTilePos(x, y,'right-bottom'), this.getTilePos(x, y,'left-bottom'), wallTextureImg);
            }
            if (tile.wall.left || (tile.type != 0 && adjecent.left.type == 0)) {
                this.drawWall(ctx, this.getTilePos(x, y,'left-bottom'), this.getTilePos(x, y,'left-top'), wallTextureImg);
            }
        });

        //Draw nodes
        if (pillarTextureImages.length) {
            let pillarTextureImage = pillarTextureImages[0];
            this._grid.iterateNodes((x, y, node) => {
                //Grab a new image
                if(this._theme.settings.pillar.mode == 'multiple'){
                    pillarTextureImage = radugen.helper.getRndFromArr(pillarTextureImages);
                }

                let connectionCount = 0;
                if(node.connections.top){connectionCount++;}
                if(node.connections.right){connectionCount++;}
                if(node.connections.bottom){connectionCount++;}
                if(node.connections.left){connectionCount++;}
                
                switch (connectionCount) {
                    case 0:
                        return;
                    default: 
                        this.drawWalnoot(ctx, [x * this._tileResolution, y * this._tileResolution], pillarTextureImage);
                        return;
                }
            });
        }

        //Wallnut (wall-node)
        // let wallnuts = [];
        // const addWallNut = ([wallnut, size]) => {
        //     if (wallnuts.indexOf(wallnut) != -1) return;
        //     wallnuts.push(wallnut);
        // };

        // if (pillarTextureImages.length) {
        //     let pillarTextureImage = pillarTextureImages[0];
        //     this._grid.iterate((tile, x, y, adjecent) => {
                


        //         //Corner points
        //         if (tile.wall.top || (tile.type != 0 && adjecent.top.type == 0)) { 
        //             if(tile.wall.left || (tile.type != 0 && adjecent.left.type == 0)){ //Draw square
        //                 // this.drawCorner(ctx, this.getTilePos(x, y, 'left-top'), pillarTextureImage);
        //                 wallnuts.push([this.getTilePos(x, y, 'left-top'), 1])
        //             }
        //             if(tile.wall.right || (tile.type != 0 && adjecent.right.type == 0)){ //Draw square
        //                 // this.drawCorner(ctx, this.getTilePos(x, y, 'right-top'), pillarTextureImage);
        //             }
        //         }
        //         if (tile.wall.bottom || (tile.type != 0 && adjecent.bottom.type == 0)) {
        //             if(tile.wall.left || (tile.type != 0 && adjecent.left.type == 0)){ //Draw square
        //                 // this.drawCorner(ctx, this.getTilePos(x, y, 'left-bottom'), pillarTextureImage);
        //             }
        //             if(tile.wall.right || (tile.type != 0 && adjecent.right.type == 0)){ //Draw square
        //                 // this.drawCorner(ctx, this.getTilePos(x, y, 'right-bottom'), pillarTextureImage);
        //             }
        //         }


        //         if (tile.wall.top) {
        //             this.drawWalnoot(ctx, this.getTilePos(x, y,'left-top'), wallTextureImg);
        //             this.drawWalnoot(ctx, this.getTilePos(x, y,'right-top'), wallTextureImg);
        //         }
        //         if (tile.wall.right) {
        //             this.drawWalnoot(ctx, this.getTilePos(x, y,'right-top'), wallTextureImg);
        //             this.drawWalnoot(ctx, this.getTilePos(x, y,'right-bottom'), wallTextureImg);
        //         }
        //         if (tile.wall.bottom) {
        //             this.drawWalnoot(ctx, this.getTilePos(x, y,'right-bottom'), wallTextureImg);
        //             this.drawWalnoot(ctx, this.getTilePos(x, y,'left-bottom'), wallTextureImg);
        //         }
        //         if (tile.wall.left) {
        //             this.drawWalnoot(ctx, this.getTilePos(x, y,'left-bottom'), wallTextureImg);
        //             this.drawWalnoot(ctx, this.getTilePos(x, y,'left-top'), wallTextureImg);
        //         }


        //         //Grab a new image
        //         if(this._theme.settings.pillar.mode == 'multiple'){
        //             pillarTextureImage = radugen.helper.getRndFromArr(pillarTextureImages);
        //         }

                

        //         if(tile.type != 0 ){
        //             //Cross checks
        //             if (adjecent.topRight.type == 0 && adjecent.top.type != 0 && adjecent.right.type != 0) {
        //                 this.drawCorner(ctx, this.getTilePos(x, y, 'right-top'), pillarTextureImage);
        //             }
        //             //Cross checks
        //             if (adjecent.bottomRight.type == 0 && adjecent.bottom.type != 0 && adjecent.right.type != 0) {
        //                 this.drawCorner(ctx, this.getTilePos(x, y, 'right-bottom'), pillarTextureImage);
        //             }
        //             //Cross checks
        //             if (adjecent.bottomLeft.type == 0 && adjecent.left.type != 0 && adjecent.bottom.type != 0) {
        //                 this.drawCorner(ctx, this.getTilePos(x, y, 'left-bottom'), pillarTextureImage);
        //             }
        //             //Cross checks
        //             if (adjecent.topLeft.type == 0 && adjecent.top.type != 0 && adjecent.left.type != 0) {
        //                 this.drawCorner(ctx, this.getTilePos(x, y, 'left-top'), pillarTextureImage);
        //             }

        //             //Middle walls
        //             if (adjecent.top.type != 0 && adjecent.left.type == 0 && adjecent.topLeft.type == 0) {
        //                 this.drawWalnoot(ctx, this.getTilePos(x, y, 'left-top'), pillarTextureImage);
        //             }
        //             if (adjecent.right.type != 0 && adjecent.top.type == 0 && adjecent.topRight.type == 0) {
        //                 this.drawWalnoot(ctx, this.getTilePos(x, y, 'right-top'), pillarTextureImage);
        //             }
        //             if (adjecent.bottom.type != 0 && adjecent.right.type == 0 && adjecent.bottomRight.type == 0) {
        //                 this.drawWalnoot(ctx, this.getTilePos(x, y, 'right-bottom'), pillarTextureImage);
        //             }
        //             if (adjecent.left != 0 && adjecent.bottom.type == 0 && adjecent.bottomLeft.type == 0) {
        //                 this.drawWalnoot(ctx, this.getTilePos(x, y, 'left-bottom'), pillarTextureImage);
        //             }
        //         }
        //     });
        // }
    }

    drawWalnoot(ctx, pos, img) {
        let size = this._tileResolution / 4;
        size = size % 2 == 1 ? size + 1 : size;
        ctx.drawImage(img, 0, 0, img.width, img.height, pos[0] - size / 2, pos[1] - size / 2, size, size);
    }
    drawCorner(ctx, pos, img){
        let size = this._tileResolution / 3;
        ctx.drawImage(img, 0, 0, img.width, img.height, pos[0] - size / 2, pos[1] - size / 2, size, size);
    }

    drawWall(ctx, startPos, endPos, wallTextureImg) {
        if(wallTextureImg){
            let size = Math.round(this._tileResolution / 6);
            let wallThickness = size % 2 == 1 ? size + 1 : size;
            let rnd = radugen.helper.getRndFromNum;

            let xstart, xend, ystart, yend;
            if(startPos[0] < endPos[0]){
                xstart = startPos[0];
                xend = endPos[0];
            }
            else{
                xstart = endPos[0];
                xend = startPos[0];
            }

            if(startPos[1] < endPos[1]){
                ystart = startPos[1];
                yend = endPos[1];
            }
            else{
                ystart = endPos[1];
                yend = startPos[1];
            }

            let width = xend - xstart;
            let height = yend - ystart;

            if(xstart == xend){
                let rndxStart = rnd(wallTextureImg.width - wallThickness);
                let rndyStart = rnd(wallTextureImg.height - height);
                ctx.drawImage(wallTextureImg, rndxStart, rndyStart, wallThickness, height, xstart - wallThickness / 2, ystart, wallThickness, height);
            }
            else{
                //TODO: the texture is all broken here
                let rndxStart = rnd(wallTextureImg.width - width);
                let rndyStart = rnd(wallTextureImg.height - wallThickness);
                ctx.save(); 
                ctx.translate(this._tileResolution / 2, this._tileResolution / 2);
                ctx.translate(xstart - wallThickness / 2, ystart - wallThickness);
                ctx.translate(width / 2, wallThickness / 2);
                ctx.rotate(90 * Math.PI / 180);
                ctx.translate(-width / 2, -wallThickness / 2);
                ctx.drawImage(wallTextureImg, rndxStart, rndyStart, wallThickness, width, 0, 0, wallThickness, width);
                ctx.restore();
            }
        }
    }
};