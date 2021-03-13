window.radugen = window.radugen || {};
radugen.helper = {
    uuidv4: () => {
        return 'xxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },
    getRndFromArr: (arr) => {
        return arr[Math.floor(Math.random() * arr.length)];
    },
    /**
     * Because we can
     */
    getRndFromNum: (num) => {
        return Math.floor(Math.random() * num) + 1;
        return radugen.helper.getRndFromArr([...Array(num).keys()]) + 1;
    },
    directions: Object.freeze({ North: 1, West: 2, South: 3, East: 4 }),
    oppositeDirection: (direction) => (direction + 1) % 4 + 1,
    minMax: class {
        /**
         * @param {number} min
         * @param {number} max
         */
        constructor(min, max){
            this._min = min;
            this._max = max;
        }

        /**
         * @type {number}
         */
        get min(){
            return this._min;
        }

        /**
         * @type {number}
         */
        get max(){
            return this._max;
        }
    },
    size: class {
        /**
         * @param {number} width
         * @param {number} height
         */
        constructor(width, height){
            this._width = width;
            this._height = height;
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
    }    ,
    shape: class {
        constructor() {
            // todo
        }

        reproject(offsetLeft, offsetTop){
            this._left += offsetLeft;
            this._top += offsetTop
        }

        /**
         * @type {number}
         */
        get centerX() {
            return 0;
        }

        /**
         * @type {number}
         */
        get centerY() {
            return 0;
        }
    },
    rect: null
};

radugen.helper.rect = class extends radugen.helper.shape {
    /**
     * @param {number} left
     * @param {number} top
     * @param {number} width
     * @param {number} height
     */
    constructor(left, top, width, height) {
        super();

        this._left = left;
        this._top = top;
        this._width = width;
        this._height = height;
    }

    /**
     * @type {number}
     */
    get left() {
        return this._left;
    }

    /**
     * @type {number}
     */
    get top() {
        return this._top;
    }

    /**
     * @type {number}
     */
    get right() {
        return this.x2;
    }

    /**
     * @type {number}
     */
    get bottom() {
        return this.y2;
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
    get x1() {
        return this._left;
    }

    /**
     * @type {number}
     */
    get x2() {
        return this._left + this._width - 1;
    }

    /**
     * @type {number}
     */
    get y1() {
        return this._top;
    }

    /**
     * @type {number}
     */
    get y2() {
        return this._top + this._height - 1;
    }

    /**
     * @type {number}
     */
    get centerX() {
        return this._left + (this._width / 2);
    }

    /**
     * @type {number}
     */
    get centerY() {
        return this._top + (this._height / 2);
    }

    /**
     * @type {number}
     */
    get aspectRatio() {
        return Math.max(this._width, this._height) / Math.min(this._width, this._height);
    }

    /**
     * Expand the rectangle by given number on each side.
     * @param {number} border Border size to add on each side of the rectangle.
     * @returns {radugen.helper.rect}
     */
    expand(border) {
        return new radugen.helper.rect(this._left - border, this._top - border, this._width + (border * 2), this._height + (border * 2));
    }

    /**
     * @param {radugen.helper.rect} rect Rectangle to compare with.
     * @returns {boolean}
     */
    intersects(rect) {
        return !(this.x1 > rect.x2 || this.x2 < rect.x1 || this.y1 > rect.y2 || this.y2 < rect.y1);
    }
    
};