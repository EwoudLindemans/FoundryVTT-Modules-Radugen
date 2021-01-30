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
            const [width, height, tileSize] = radugen.customScene.generateCommand(command.length < 3 ? [] : command[2].split(/[\\*x., ]/).map(n => parseInt(n)));

            const rdg_scene = new radugen.customScene(width, height, tileSize);
            rdg_scene.getImage(width, height, tileSize);

            

            break;
        default:
            // report error
            console.error(`Unknown command ${command[1]}`);
            return false;
    }
    return false;
});

