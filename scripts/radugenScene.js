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
            img: `modules/Radugen/uploads/scenes/${id}.webp`
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
     * @params {number[]} args
     * @returns {number[]}
     */
    static generateCommand(...args) {
        if (!Array.isArray(args)) args = [args];
        if (args.length == 1 && Array.isArray(args[0])) args = args[0];

        const warnings = [];
        let width = 12, height = 8, tileSize = 256;
        if (args.length >= 2 && !isNaN(args[2])) {
            const [minSize, maxSize, multiple] = [radugen.RadugenScene.tileSizeRange.min, radugen.RadugenScene.tileSizeRange.max, radugen.RadugenScene.tileSizeMultiple];
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
        const [minSize, maxSize] = [radugen.RadugenScene.gridSizeRange.min, radugen.RadugenScene.gridSizeRange.max];
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