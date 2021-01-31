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
            const [width, height, tileSize] = radugen.RadugenScene.generateCommand(command.length < 3 ? [] : command[2].split(/[\\*x., ]/).map(n => parseInt(n)));

            const dungeonGenerator = radugen.generators.dungeon.generate(radugen.generators.dungeonGenerator.Static, width, height)
            const dungeonMap = dungeonGenerator.generate();

            const wallRenderer = new radugen.renderer.Walls(dungeonMap, tileSize);
            const walls = wallRenderer.render();


            const scene = new radugen.RadugenScene(width, height, tileSize, walls);

            const imageRenderer = new radugen.renderer.Image(dungeonMap, tileSize);
            imageRenderer.render().then(function (blob) {
                let file = new File([blob], `${scene._id}.webp`);
                FilePicker.upload("data", `modules/Radugen/uploads/scenes/`, file).then(function () {
                    //Save scene to compedium
                    radugen.compendium.scene.importEntity(scene);
                });
            });


            break;
        default:
            // report error
            console.error(`Unknown command ${command[1]}`);
            return false;
    }
    return false;
});

