console.log("Hello World! This code runs immediately when the file is loaded.");
CONFIG.debug.hooks = true;
Hooks.on("init", function () {
    console.log("This code runs once the Foundry VTT software begins it's initialization workflow.");
});

Hooks.on("ready", function () {
    console.log("This code runs once core initialization is ready and game data is available.");
});

const dungeon_names = ["Vault", "Catacombs", "Dungeon", "Palace", "Eternal"];
const curiosities = ["Endless Suffering", "Agony Burrows", "Dream Cells", "Mystic", "Back Itches", "Paper Cuts"];

function getRndFromArr(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

Hooks.on("chatMessage", function (_, message) {
    if (message.indexOf('/radugen') != 0) return;

    var id = uuidv4();
    const rdg_scene = new Scene({
        _id: id,
        name: `The ${getRndFromArr(dungeon_names)} of ${getRndFromArr(curiosities)}`
    });

    const pack = Compendium.create({ entity: "Scene", label: "Radugen" }).then(function () {
        pack.importEntity(rdg_scene);



    })
    

    game.scenes.entities[id] = rdg_scene;
    rdg_scene.activate().then(function () {
       
    });

    console.log("You typed /radugen congrats!")
    return false;
});

