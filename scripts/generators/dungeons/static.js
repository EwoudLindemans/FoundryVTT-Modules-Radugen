window.radugen = window.radugen || {};
radugen.generators = radugen.generators || {};
radugen.generators.dungeons = radugen.generators.dungeons || {};

radugen.generators.dungeons[radugen.generators.dungeonGenerator.Static] = class extends radugen.generators.dungeon {
    /**
     * @param {number} width
     * @param {number} height
     */
    constructor(width, height) {
        super(width, height, 'Static');
    }


    generate() {
        let r = 1;
        let h = 1;

        if (this.width == 20 && this.height == 20) {
            return [
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, r, r, r, r, 0, 0, 0, 0, 0, 0, 0, 0, 0, r, r, r, 0, 0],
                [0, 0, r, r, r, r, h, h, h, h, h, 0, 0, 0, 0, r, r, r, 0, 0],
                [0, 0, r, r, r, r, 0, 0, 0, 0, h, 0, 0, 0, 0, r, r, r, 0, 0],
                [0, 0, r, r, r, r, 0, 0, 0, 0, h, 0, 0, 0, 0, r, r, r, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, h, 0, 0, 0, 0, 0, h, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, h, h, h, h, h, h, h, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, h, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, h, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, r, r, r, h, h, h, h, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, r, r, r, 0, 0, 0, h, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, r, r, r, 0, 0, 0, h, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, h, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, r, r, r, r, r, r, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, r, r, r, r, r, r, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, r, r, r, r, r, r, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, r, r, r, r, r, r, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            ]
        }

        return this.createEmptyMap();
    }
};