window.radugen = window.radugen || {};
radugen.classes = radugen.classes || {};

radugen.classes.RoomLoader = class {
    constructor() {
        this.rooms = [];
        this.loadRooms();        
    }

    static async getFile(src) {
        return new Promise(function(resove, reject){
            let request = new XMLHttpRequest();
            request.open('GET', src, true);
            request.send(null);
            request.onreadystatechange = function () {
                if (request.readyState === 4 && request.status === 200) {
                    resove(request.responseText);
                }
            }
        });
    }

    static async loadRooms() {
        return await this.getFile('modules/Radugen/assets/rooms/vaults.txt')
            .then(function(text){
                let lines = text.split('\n');
                let room = [];
                let rooms = [];
                let trimLeft = 100; 
                let trimRight = 0;
                for(var i = 0;i < lines.length;i++){
                    let line = lines[i];
                    
                    let isRoomLine = line.indexOf('#') != -1
                    
                    if(isRoomLine){
                        let leftWallIndex = line.indexOf('#');
                        if(leftWallIndex < trimLeft){
                            trimLeft= leftWallIndex;
                        }

                        let rightWallIndex = line.lastIndexOf('#') + 1
                        if(rightWallIndex > trimRight){
                            trimRight = rightWallIndex;
                        }

                        room.push(line);
                    }
                    else{
                        if(room.length > 0){
                            for(var j = 0;j < room.length;j++){
                                room[j] = room[j].substring(trimLeft, trimRight);
                            }
                            trimLeft = 100;
                            rooms.push(room);
                        }
                        room = [];
                    }
                    
                }
                return rooms;
            });
    }
}