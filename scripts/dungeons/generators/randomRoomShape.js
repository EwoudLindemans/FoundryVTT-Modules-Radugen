window.radugen = window.radugen || {};
radugen.generators = radugen.generators || {};
radugen.generators.dungeons = radugen.generators.dungeons || {};

radugen.generators.dungeons[radugen.generators.dungeonGenerator.randomRoomShape] = class extends radugen.generators.dungeon {
    constructor() {
        super('genV2');
    }

    // generateRoundRoom(size){
    //     return this.generateConvexPolyRoom(100, rnd(20) + 4);
    // }

    generateConvexPolyRoom(sides, radius, rotation, width, height)
    {
        const [Tile, TileType] = [radugen.classes.tiles.Tile, radugen.classes.tiles.TileType];


        // convert the rotation degrees to radians.
        rotation *= Math.PI / 180.0;
    
        // make an array size that is sure to fit the room.
        let roomSize =  Math.ceil(Math.max(width, height)*2) + 1;
    
        let room = Array.from({length: roomSize}).map((_, y) => Array.from({length: roomSize}));
    
        
        // first we must create the walls of the room.
        let rchange = (Math.PI * 2.0) / sides;
        for (let r = 0; r < Math.PI * 2; r += rchange)
        {
            // define first point.
            let p1_x = width + Math.cos(r + rotation) * width;
            let p1_y = height + Math.sin(r + rotation) * height;
    
            // define second point (rotated 1 iteration further).
            let p2_x = width + Math.cos(r + rotation + rchange) * width;
            let p2_y = height + Math.sin(r + rotation + rchange) * height;
    
            // get distance between the two points.
            let len = Math.sqrt(Math.pow(p2_x - p1_x, 2) + Math.pow(p2_y - p1_y, 2));
    
            // linearly interpolate between the two points and place walls between them.
            for (let i = 0; i < 1; i += 1.0 / len)
            {
                let place_x = Math.round((1 - i) * p1_x + i * p2_x);
                let place_y = Math.round((1 - i) * p1_y + i * p2_y);
    
                let tile = new Tile(place_x, place_y, TileType.Room);
                this._grid.push(tile);
                room[place_y][place_x] = '#';
            }
        }
    
        // now we have to fill the room with a floor.
        // this is done using something similar to a scanline algorithm.
        for (let scan = 0; scan < roomSize; scan++)
        {
            let left_x = -1;
            let right_x = -1;
            let spaceDetected = false;
    
            for (let i = 0; i < roomSize; i++)
            {
                if (room[scan][i] == '#')
                {
                    if (!spaceDetected)
                        left_x = i;
                    else
                    {
                        right_x = i;
                        break;
                    }
                }
                else if (left_x != -1)
                    spaceDetected = true;
            }
    
            if (right_x != -1)
            {
                for (let i = left_x + 1; i < right_x; i++)
                {
                    room[scan][i] = '.';
                    let tile = new Tile(i, scan, TileType.Room);
                    this._grid.push(tile);
                }
            }
        }
    
        return this._grid;
    }

    //TODO: try to improve intersect, so we dont have a single point of connection (like a corridor) must have a setting
    generateRandomRoom() {
        const [rect, rnd, directions] = [radugen.helper.rect, radugen.helper.getRndFromNum, radugen.helper.directions];
        const [Tile, TileType] = [radugen.classes.tiles.Tile, radugen.classes.tiles.TileType];

        let max_room_width = 20;
        let max_room_height = 20;

        let min_addition_height = 6;
        let max_addition_height = 10;

        let min_addition_width = 6;
        let max_addition_width = 10;

        let shapes = 20;

        const rooms = [];
        const pushRoomToGrid = (ox, oy, w, h) => {
            for(let x = ox; x < ox + w; x++){
                for(let y = oy; y < oy + h; y++){
                    let tile = new Tile(x, y, TileType.Room);
                    this._grid.push(tile);
                }
            }
        };

        for(let i = 0; i < shapes; i++){
            //Get random room
            const [w, h] = [rnd(max_addition_width - min_addition_width) + min_addition_width, rnd(max_addition_height - min_addition_height) + min_addition_height];
            const [x, y] = [rnd(max_room_width - w  + 1), rnd(max_room_height - h + 1)];

            const add = new rect(x, y, w, h);
            //Make sure it intersects one of the existing rooms
            if(i == 0 || rooms.find(r => r.intersects(add))){
                rooms.push(add);
                pushRoomToGrid(x, y, w, h);
            }
            else{
                i--;
            }
        }

        return this._grid;
    }

    generateLShapedRoom(){
        const [rect, rnd, directions] = [radugen.helper.rect, radugen.helper.getRndFromNum, radugen.helper.directions];
        const [Tile, TileType] = [radugen.classes.tiles.Tile, radugen.classes.tiles.TileType];

        let width = 20;
        let height = 20;

        const pushRoomToGrid = (ox, oy, w, h) => {
            for(let x = ox; x < ox + w; x++){
                for(let y = oy; y < oy + h; y++){
                    let tile = new Tile(x, y, TileType.Room);
                    this._grid.push(tile);
                }
            }
        };

        const [w1, h1] = [width, 4];
        const [w2, h2] = [4, height];
        
        const [x, y] = [0, 0];
        pushRoomToGrid(x, y , w1, h1)

        let rndCorner = rnd(4);
        let [x2, y2] = [0, 0]
        if(rndCorner == 1){
            y2 += 0; 
        }
        if(rndCorner == 2){
            x2 += w1 - w2;
        }
        if(rndCorner == 3){ 
            x2 += w1 - w2;
            y2 -= h2 - h1;
        }
        if(rndCorner == 4){
            y2 -= h2 - h1;
        }
        
        
        pushRoomToGrid(x2, y2, w2, h2)
        
        return this._grid;
    }

    getCenterFromArray(array, amount){
        let returnArr = []

        for(let i = 0; i < amount; i++){
            if(array.length % 2 == 0){
                returnArr.push(Math.floor(array.length / 2 - 1) - i);
                returnArr.push(Math.floor(array.length / 2) + i);
            }
            else{
                if(i == 0){
                    returnArr.push(Math.floor(array.length / 2));
                }
                else{
                    returnArr.push(Math.floor(array.length / 2) - i);
                    returnArr.push(Math.floor(array.length / 2) + i);
                }
                
            }
        }
        return returnArr;
    }

    
    generateRoomWithLiquid(width, height, path, north, east, south, west){
        const [rnd] = [radugen.helper.getRndFromNum];
        let room = Array.from({length: height}).map((_, y) => Array.from({length: width}));
        const [Tile, TileType] = [radugen.classes.tiles.Tile, radugen.classes.tiles.TileType];

        //Get array center points x
        let centerXArr = this.getCenterFromArray(room[0], path);
        let centerYArr = this.getCenterFromArray(room, path);
        for(let y = 0; y < room.length; y++){
            for(let x = 0; x < room[0].length; x++){
                room[y][x] = TileType.Liquid;

                for(let cyi = 0; cyi < centerYArr.length; cyi++){
                    for(let cxi = 0; cxi < centerXArr.length; cxi++){
                        let centerX = centerXArr[cxi];
                        let centerY = centerYArr[cyi];

                        if(x == centerX){
                            if(north && y <= centerY){
                                room[y][x] = TileType.Room;
                            }
                            if(south && y >= centerY){
                                room[y][x] = TileType.Room;
                            }
                        }
                        if(y == centerY){
                            if(east && x >= centerX){
                                room[y][x] = TileType.Room;
                            }
                            if(west && x <= centerX){
                                room[y][x] = TileType.Room;
                            }
                        }
                    }
                }
            }
        }

        //Translate to our own grid
        for(let y = 0; y < room.length; y++){
            for(let x = 0; x < room[0].length; x++){
                let tile = new Tile(x, y, room[y][x]);
                tile.wall.top = y == 0;
                tile.wall.bottom = y == height -1;
                tile.wall.right = x == width-1;
                tile.wall.left = x == 0;
                this._grid.push(tile);
            }
        }
        
        return this._grid;
    }

    generatePrefixedRoom(){
        const [rnd] = [radugen.helper.getRndFromNum];
        let arr = [
            this.generateRoomWithLiquid.bind(this, 12, 12, 2, true, false, true, false),
            this.generateRoomWithLiquid.bind(this, 12, 12, 2, false, true, false, true)
        ];
        return arr[rnd(arr.length) - 1]();
    }

    generate() {
        const [rnd] = [radugen.helper.getRndFromNum];

        let north = rnd(2) == 1 ? true: false;
        let east = rnd(2) == 1 ? true: false;
        let south = rnd(2) == 1 ? true: false;
        let west = rnd(2) == 1 ? true: false;   

        //return this.generateRandomRoom();
        return this.generateRoomWithLiquid(rnd(12) + 10, rnd(12) + 10, 3, north, east, south, west);
        //return this.generateLShapedRoom();
        //return this.generateConvexPolyRoom(4, 30, 0, rnd(10) + 5, rnd(10) + 5);
    }
};