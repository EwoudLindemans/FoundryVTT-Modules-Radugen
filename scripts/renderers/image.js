window.radugen = window.radugen || {};
radugen.renderer = radugen.renderer || {};
radugen.renderer.Image = class {
    constructor(map, tileSize) {
        this._map = map;
        this._width = map.length;
        this._height = map[0].length
        this._tileSize = tileSize;
    }

    loadThemeFiles(theme) {
        const promises = [];
        for (var key in theme) {
            if (theme.hasOwnProperty(key)) {
                promises.push(FilePicker.browse("data", `modules/Radugen/themes/${theme[key]}/${key}/`),)
            }
        }

        return Promise.all(promises);
    }

    render(tileSize) {
        var self = this;
        return new Promise(function (resolve, reject) {
            const canvas = document.createElement('canvas');
            canvas.width = self._width * tileSize;
            canvas.height = self._height * tileSize;
            const ctx = canvas.getContext("2d");
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            self.loadThemeFiles({
                floor: "wood",
                walls: "rough"
            }).then(function (themeFiles) {
                
                self.renderFloorTiles(ctx, themeFiles[0]).then(function () {
                    canvas.toBlob(function (imageBlob) {
                        resolve(imageBlob);
                    }, "image/webp", 0.80);
                });
            });
        });
    }


    renderFloorTiles(ctx, themeFiles) {
        let self = this;
        let promises = [];
        for (let x = 0; x < this._width; x++) {
            for (let y = 0; y < this._height; y++) {
                ((x, y) => {
                    if (this._map[x][y] == 0) {
                        promises.push(
                            this.loadImage(radugen.helper.getRndFromArr(themeFiles.files)).then(function (img) {
                                self.flipContextRandom(ctx, x, y);
                                self.rotateContextRandom(ctx);
                                ctx.drawImage(img, 0, 0, self._tileSize, self._tileSize);
                                self.resetContext(ctx);
                            })
                        )
                    };
                })(x, y);
            }
        }
        return Promise.all(promises);
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
    }

    rotateContextRandom(ctx) {
        ctx.translate(this._tileSize / 2, this._tileSize / 2);
        ctx.rotate((Math.PI / 2) * radugen.helper.getRndFromNum(4)); // rotate tile
        ctx.translate(-this._tileSize / 2, -this._tileSize / 2);
    }

    flipContextRandom(ctx, x, y) {
        if (radugen.helper.getRndFromNum(2) == 1) {
            ctx.transform(-1, 0, 0, 1, (x + 1) * this._tileSize, y * this._tileSize); // flip and move tile
        } else {
            ctx.translate(x * this._tileSize, y * this._tileSize); // move tile
        }
    }
};