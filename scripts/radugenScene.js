window.radugen = window.radugen || {};
radugen.RadugenScene = class extends Scene {
    /**
     * Generate a new random dungeon scene.
     * @param {number} width
     * @param {number} height
     * @param {number} tileSize of 64 128 192 256 ...
     */
    constructor(width, height, tileSize, walls) {
        const id = radugen.helper.uuidv4();
        super({
            _id: id,
            name: radugen.generators.names.dungeonName(),
            shiftX: 0,
            shiftY: 0,
            width: width * tileSize,
            height: height * tileSize,
            grid: tileSize,
            backgroundColor: '#000000',
            padding: 0,
            tiles: [],
            gridAlpha: 0,
            tokenVision: true,
            fogExploration: false,
            walls: walls,
            img: `${game.settings.get("Radugen", "dungeonUploadPath")}/${id}.webp`
        });

        this._width = width;
        this._height = height;
        this._tileSize = tileSize;
    }

    /**
     * @type {number}
     */
    static get tileSizeMultiple() {
        return 64;
    }

    /**
     * @type {radugen.helper.minMax}
     */
    static get tileSizeRange() {
        return new radugen.helper.minMax(
            radugen.RadugenScene.tileSizeMultiple * 1, // 64
            radugen.RadugenScene.tileSizeMultiple * 4, // 256
        );
    }

    /**
     * @type {radugen.helper.minMax}
     */
    static get gridSizeRange() {
        return new radugen.helper.minMax(
            4,
            64
        );
    }

    /**
     * @type {number}
     */
    static get gridSizeMax() {
        return 4;
    }

    /**
     * @type {number}
     */
    get width() {
        return this._width;
    }

    /**
     * @type {number}
     */
    get height() {
        return this._height;
    }

    /**
     * @type {number}
     */
    get tileSize() {
        return this._tileSize;
    }
};