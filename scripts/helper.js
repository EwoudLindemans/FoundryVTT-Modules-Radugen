window.radugen = window.radugen || {};
radugen.helper = {
    uuidv4: () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
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
        return radugen.helper.getRndFromArr([...Array(num).keys()]) + 1;
    },
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
    }
};