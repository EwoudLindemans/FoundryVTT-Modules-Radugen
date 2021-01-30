window.radugen = window.radugen || {};
radugen.customScene = class extends Scene {
    /**
     * Generate a new random dungeon scene.
     * @param {number} width
     * @param {number} height
     * @param {number} tilesize of 64 128 192 256 ...
     */
    constructor(width, height, img) {
        const dungeon_names = ["Vault", "Catacombs", "Dungeon", "Palace", "Eternal", "Repository", "Lair"];
        const curiosities = ["Endless Suffering", "Agony Burrows", "Dream Cells", "Mystic", "Back Itches", "Paper Cuts", "Random Bugs", "Calories"];

        let grid = [width, height];
        let size = 256;

        super({
            name: `The ${radugen.helper.getRndFromArr(dungeon_names)} of ${radugen.helper.getRndFromArr(curiosities)}`,
            shiftX: 0,
            shiftY: 0,
            width: grid[0] * size,
            height: grid[1] * size,
            grid: size,
            padding: 0,
            tiles: [],
            img: img,
        });
        this._id = radugen.helper.uuidv4();
    }

    uploadFile(file) {
        var filePicker = new FilePicker({
            uploadURL: '/Radugen/Scene'
        });

        filePicker.upload(
            `/Radugen/Scene/${this._id}.jpg`,
            path,
            file,
            options
        );

        this._width = width;
        this._height = height;
    }

    static getImage(imageloaded, width, height) {
        let grid = [width, height];
        let size = 256;

        const vancas = document.createElement('canvas');
        vancas.width = grid[0] * size;
        vancas.height = grid[1] * size;

        const ctx = vancas.getContext("2d");
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, vancas.width, vancas.height);
 
        let imgcount = 0;
        for (let x = 0; x < grid[0]; x++) {
            for (let y = 0; y < grid[1]; y++) {
                ((x, y) => {
                    //Get random image
                    const img = new Image();
                    img.onload = function () {
                        //Rotate
                        let r = radugen.helper.getRndFromNum(4)

                        ctx.translate((x * size) + size / 2, (y * size) + size / 2);
                        ctx.rotate((Math.PI / 2) * r);
                        ctx.translate(-(x * size) - size / 2, -(y * size) - size / 2);

                        ctx.drawImage(img, x * size, y * size, size, size);

                        //Reset transform
                        ctx.setTransform(1, 0, 0, 1, 0, 0)

                        imgcount++;
                        if (imgcount == grid[0] * grid[1]) {

                          


                            //ctx.fillStyle = `rgba(${radugen.helper.getRndFromNum(255)},${radugen.helper.getRndFromNum(255)},${radugen.helper.getRndFromNum(255)},0.5)`;
                            //ctx.fillRect(0, 0, vancas.width, vancas.height);

                            imageloaded.bind(vancas.toDataURL())();
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
};