window.radugen = window.radugen || {};
radugen.name = "Radugen";
radugen.compendium = {};

Hooks.on("init", function () { });
Hooks.on("ready", function () {
    radugen.compendium.scene = game.packs.find(p => {
        return p.metadata.label === radugen.name
    });

    if (radugen.compendium.scene == null) {
        let pack = Compendium.create({ entity: "Scene", label: radugen.name }).then(function () {
            radugen.compendium.scene = pack;
        });
    }
});

// const dungeon_names = ["Vault", "Catacombs", "Dungeon", "Palace", "Eternal"];
// const curiosities = ["Endless Suffering", "Agony Burrows", "Dream Cells", "Mystic", "Back Itches", "Paper Cuts"];

// function getRndFromArr(arr) {
//     return arr[Math.floor(Math.random() * arr.length)];
// }

// function uuidv4() {
//     return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
//         let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
//         return v.toString(16);
//     });
// }

Hooks.on("chatMessage", function (_, message) {
    if (message.indexOf('/radugen') != 0) return;

    // var id = uuidv4();
    const rdg_scene = new radugen.customScene();

    radugen.compendium.scene.importEntity(rdg_scene);
    console.log(rdg_scene._id);

    game.scenes.entities[rdg_scene._id] = rdg_scene;
    rdg_scene.activate().then(function () {

    });

    return false;
});

