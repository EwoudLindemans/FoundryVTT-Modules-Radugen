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
    if (message.indexOf('/radugen') != 0) return;


    radugen.customScene.getImage(function () {
        const rdg_scene = new radugen.customScene(this);
        radugen.compendium.scene.importEntity(rdg_scene);
    })

    



    return false;
});

