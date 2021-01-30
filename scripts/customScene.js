window.radugen = window.radugen || {};
radugen.customScene = class extends Scene {
    /**
     * Generate a new random dungeon scene.
     * @param {number} width
     * @param {number} height
     * @param {number} tileSize of 64 128 192 256 ...
     */   
    constructor(width, height, tileSize, img) {
        const dungeon_names = ["Vault", "Catacombs", "Dungeon", "Palace", "Eternal", "Repository", "Lair", "Crypt", "Caves", "Maze"];
        const curiosities = ["Endless Suffering", "Agony Burrows", "Dream Cells", "Mystic", "Back Itches", "Paper Cuts", "Random Bugs", "Calories", "Disappointments", "Lurking Dangers", "Eery Silence"];
        const id = radugen.helper.uuidv4();
        super({
            _id: id,
            name: `The ${radugen.helper.getRndFromArr(dungeon_names)} of ${radugen.helper.getRndFromArr(curiosities)}`,
            shiftX: 0,
            shiftY: 0,
            width: width * tileSize,
            height: height * tileSize,
            grid: tileSize,
            padding: 0,
            tiles: [],
            img: `modules/Radugen/uploads/scenes/${id}.webp`
        });

        this._width = width;
        this._height = height;
        this._tileSize = tileSize;
    }

    /**
     * @type {number}
     */
    static get tileSizeMultiple(){
        return 64;
    }

    /**
     * @type {radugen.helper.minMax}
     */
    static get tileSizeRange(){
        return new radugen.helper.minMax(
            radugen.customScene.tileSizeMultiple * 1, // 64
            radugen.customScene.tileSizeMultiple * 4, // 256
        );
    }

    /**
     * @type {radugen.helper.minMax}
     */
    static get gridSizeRange(){
        return new radugen.helper.minMax(
            4,
            64
        );
    }

    /**
     * @type {number}
     */
    static get gridSizeMax(){
        return 4;
    }

    /**
     * @params {number[]} args
     * @returns {number[]}
     */
    static generateCommand(...args){
        if (!Array.isArray(args)) args = [args];
        if (args.length == 1 && Array.isArray(args[0])) args = args[0];
        
        const warnings = [];
        let width = 12, height = 8, tileSize = 256;
        if (args.length >= 2 && !isNaN(args[2])) {
            const [minSize, maxSize, multiple] = [radugen.customScene.tileSizeRange.min, radugen.customScene.tileSizeRange.max, radugen.customScene.tileSizeMultiple];
            if (args[2] < minSize) {
                warnings.push(`Tilesize ${args[2]} is below minimum value. Using minimal value instead: ${minSize}`);
                tileSize = minSize;
            } else if (args[2] > maxSize) {
                warnings.push(`Tilesize ${args[2]} is above maximum value. Using maximum value instead: ${maxSize}`);
                tileSize = maxSize;
            } else {
                tileSize = args[2];
            }
            
            if (tileSize % multiple != 0) {
                tileSize = Math.max(minSize, tileSize - (tileSize % multiple));
                warnings.push(`Tilesize ${tileSize} is not a multiple of ${multiple}. Using ${tileSize} instead.`);
            }
        }
        const [minSize, maxSize] = [radugen.customScene.gridSizeRange.min, radugen.customScene.gridSizeRange.max];
        if (args.length >= 1 && !isNaN(args[1])) {
            if (args[0] < minSize) {
                warnings.push(`Grid width ${args[0]} is below minimum value. Using minimal value instead: ${minSize}`);
                width = minSize;
            } else if (args[0] > maxSize) {
                warnings.push(`Grid width ${args[0]} is above maximum value. Using minimal value instead: ${maxSize}`);
                width = maxSize;
            } else {
                width = args[0];
            }

            if (args[1] < minSize) {
                warnings.push(`Grid height ${args[1]} is below minimum value. Using minimal value instead: ${minSize}`);
                height = minSize;
            } else if (args[1] > maxSize) {
                warnings.push(`Grid height ${args[1]} is above maximum value. Using minimal value instead: ${maxSize}`);
                height = maxSize;
            } else {
                height = args[1];
            }
        } else if (args.length == 1 && !isNaN(args[0])) {
            if (args[0] < minSize) {
                warnings.push(`Grid size ${args[0]} is below minimum value. Using minimal value instead: ${minSize}`);
                [width, height] = [minSize, minSize];
            } else if (args[0] > maxSize) {
                warnings.push(`Grid size ${args[0]} is above maximum value. Using minimal value instead: ${maxSize}`);
                [width, height] = [maxSize, maxSize];
            } else {
                [width, height] = [args[0], args[0]];
            }
        }

        // TODO: Report warnings to user
        warnings.forEach(x => console.warn(x));

        return [width, height, tileSize];
    }

    uploadFile(blob) {
        let file = new File([blob], `${this._id}.webp`);
        let self = this;
        FilePicker.upload(
            "data",
            `modules/Radugen/uploads/scenes/`,
            file
        ).then(function () {
            radugen.compendium.scene.importEntity(self);
        });
    }

    getImage(width, height, tileSize) {
        let self = this;
        let grid = [width, height];

        const canvas = document.createElement('canvas');
        canvas.width = grid[0] * tileSize;
        canvas.height = grid[1] * tileSize;

        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
 
        let imgcount = 0;
        for (let x = 0; x < grid[0]; x++) {
            for (let y = 0; y < grid[1]; y++) {
                ((x, y) => {
                    //Get random image
                    const img = new Image();
                    img.onload = function () {
                        if (radugen.helper.getRndFromNum(2) == 1) {
                            ctx.transform(-1, 0, 0, 1, (x + 1) * tileSize, y * tileSize); // flip and move tile
                        } else {
                            ctx.translate(x * tileSize, y * tileSize); // move tile
                        }
                        ctx.translate(tileSize / 2, tileSize / 2);
                        ctx.rotate((Math.PI / 2) * radugen.helper.getRndFromNum(4)); // rotate tile
                        ctx.translate(-tileSize / 2, -tileSize / 2);

                        ctx.drawImage(img, 0, 0, tileSize, tileSize);

                        //Reset transform
                        ctx.setTransform(1, 0, 0, 1, 0, 0);

                        imgcount++;
                        if (imgcount == grid[0] * grid[1]) {

                            canvas.toBlob(function (imageBlob) {
                                self.uploadFile(imageBlob);
                            }, "image/webp", 0.80);


                            //ctx.fillStyle = `rgba(${radugen.helper.getRndFromNum(255)},${radugen.helper.getRndFromNum(255)},${radugen.helper.getRndFromNum(255)},0.5)`;
                            //ctx.fillRect(0, 0, vancas.width, vancas.height);
                            
                            //imageloaded.bind(this, canvas.toDataURL())();
                        }
                    };
                    img.src = `/modules/Radugen/tiles/rough_${radugen.helper.getRndFromNum(16)}.png`;
                })(x, y);
            }
        }

        
    }

    /**
     * @type {number}
     */
    get width(){
        return this._width;
    }

    /**
     * @type {number}
     */
    get height(){
        return this._height;
    }

    /**
     * @type {number}
     */
    get tileSize(){
        return this._tileSize;
    }
};