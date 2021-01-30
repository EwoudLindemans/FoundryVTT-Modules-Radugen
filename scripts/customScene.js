window.radugen = window.radugen || {};
radugen.customScene = class extends Scene {
    /**
     * Generate a new random dungeon scene.
     * @param {number} width
     * @param {number} height
     * @param {number} tilesize of 64 128 192 256 ...
     */
    constructor(img) {
        const dungeon_names = ["Vault", "Catacombs", "Dungeon", "Palace", "Eternal", "Repository", "Lair"];
        const curiosities = ["Endless Suffering", "Agony Burrows", "Dream Cells", "Mystic", "Back Itches", "Paper Cuts", "Random Bugs", "Calories"];

        let grid = [20, 20];
        let size = 256;

        super({
            _id: radugen.helper.uuidv4(),
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
    }

    static getImage(imageloaded) {
        let grid = [20, 20];
        let size = 256;

        var vancas = document.createElement('canvas');
        vancas.width = grid[0] * size;
        vancas.height = grid[1] * size;

        

        let ctx = vancas.getContext("2d");
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, vancas.width, vancas.height);
 
        let imgcount = 0;
        console.log(grid[0] * grid[1]);
        for (var x = 0; x < grid[0]; x++) {
            for (var y = 0; y < grid[1]; y++) {
                ((x, y) => {
                    //Get random image
                    var img = new Image();
                    img.onload = function () {
                        

                        //Rotate
                        var r = radugen.helper.getRndFromNum(4)

                        ctx.translate((x * size) + size / 2, (y * size) + size / 2);
                        ctx.rotate((Math.PI / 2) * r);
                        ctx.translate(-(x * size) - size / 2, -(y * size) - size / 2);

                        ctx.drawImage(img, x * size, y * size, size, size);

                        //Reset transform
                        ctx.setTransform(1, 0, 0, 1, 0, 0)

                        imgcount++;
                        console.log(imgcount);
                        console.log(x * size, y * size);
                        if (imgcount == grid[0] * grid[1]) {
                            imageloaded.bind(vancas.toDataURL())();
                        }
                    };
                    img.src = `/modules/Radugen/tiles/rough_${radugen.helper.getRndFromNum(16)}.png`;
                })(x, y);
            }
        }

        
    }
};