window.radugen = window.radugen || {};
radugen.name = "Radugen";
radugen.compendium = {};

class RadugenInit {
    constructor() {
        this.hookInit();
        this.hookReady();
        this.hookSceneDirectory();
        this.hookSideBarTab();
    }

    hookInit() {
        Hooks.on("init", () => { });
    }
    hookReady() {
        Hooks.on("ready", () => {
            radugen.compendium.scene = game.packs.find(p => {
                return p.metadata.label === radugen.name
            });

            if (radugen.compendium.scene == null) {
                let pack = Compendium.create({ entity: "Scene", label: radugen.name }).then(function () {
                    radugen.compendium.scene = pack;
                });
            }

            radugen.settings.register();
        });
    }
    hookSceneDirectory() {
        Hooks.on('renderSceneDirectory', (app, html, data) => {
            if (!game.user.isGM) {
                return;
            }
            const importButton = $('<button class="radugen-generate-scene"><i class="fas fa-hat-wizard"></i> Generate Dungeon</button>');

            html.find('.radugen-generate-scene').remove();
            html.find('.directory-footer').append(importButton);

            // Handle button clicks
            importButton.click(ev => {
                ev.preventDefault();
                this.createRadugenDialog();
            });
        });
    }
    hookSideBarTab() {
        // Add extra button to foundrys settings menu
        Hooks.on("renderSidebarTab", (app, html) => {
            if (!game.user.isGM) {
                return;
            }
            const importButton = $('<button class="radugen-generate-sidebar"><i class="fas fa-hat-wizard"></i> Generate Dungeon</button>');

            html.find('.radugen-generate-sidebar').remove();
            html.find('button[data-action="configure"]').after(importButton);

            // Handle button clicks
            importButton.click(ev => {
                ev.preventDefault();
                this.createRadugenDialog();
            });
        });
    }

    createRadugenDialog() {
        radugen.helpers.RadugenDialog.create().then((settings) => {
            this.createScene(settings);
        }, function () {
            console.log('The operation was cancelled');
        });
    }

    createScene(settings) {
        switch (game.settings.get("radugen", "tileResolution")) {
            case 'small':
                settings.resolution = 64;
            case 'medium':
                settings.resolution = 128
            case 'large':
                settings.resolution = 256
            default:
        }

        settings.wallMode = game.settings.get("radugen", "wallMode");

        const dungeonGenerator = radugen.generators.dungeon.generate(settings.dungeonGenerator, settings.dungeonSize)
        const dungeonMap = dungeonGenerator.generate();

        let walls = [];
        if (settings.wallMode != 'none') {
            walls = new radugen.renderer.Walls(dungeonMap, settings.resolution, settings.wallMode).render();
        }

        const scene = new radugen.RadugenScene(dungeonGenerator.width, dungeonGenerator.height, settings.resolution, walls);

        const imageRenderer = new radugen.renderer.Image(dungeonMap, settings.resolution);
        imageRenderer.render().then(function (blob) {
            //Upload file
            let file = new File([blob], `${scene._id}.webp`);
            FilePicker.upload("data", `modules/Radugen/uploads/scenes/`, file).then(function () {
                //Save scene to compedium
                radugen.compendium.scene.importEntity(scene);
            });
        });
    }
}

radugen.init = new RadugenInit();