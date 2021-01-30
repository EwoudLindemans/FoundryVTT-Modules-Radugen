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

Hooks.on("chatMessage", function (_, message) {
    const command = message.split(' ');
    if (command[0] != '/radugen') return;

    switch (command[1]) {
        case 'generate':
            let width = 16, height = 16;
            if (command.length >= 3){
                if (command[2].indexOf('x') > 0){
                    width = parseInt(command[2].split('x')[0]);
                    height = parseInt(command[2].split('x')[1]);
                } else {
                    width = parseInt(command[2]);
                    height = parseInt(command[2]);
                }
                //TODO: Handle errors
            }

            radugen.customScene.getImage(function () {
                const rdg_scene = new radugen.customScene(width, height, this);
                radugen.compendium.scene.importEntity(rdg_scene);
            }, width, height);
            break;
        default:
            // report error
            console.error(`Unknown command ${command[1]}`);
            return false;
    }
    return false;
});

