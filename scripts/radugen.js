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
        Hooks.on("init", () => {
            radugen.settings.register();
            radugen.helpers.Dialog = new radugen.helpers.DialogClass();
        });
    }
    hookReady() {
        Hooks.on("ready", () => {
            radugen.compendium.scene = game.packs.find(p => {
                return p.metadata.label === radugen.name
            });

            if (radugen.compendium.scene == null) {
                CompendiumCollection.createCompendium({ entity: "Scene", label: radugen.name }).then(function (pack) {
                    radugen.compendium.scene = pack;
                });
            }
        });
    }
    hookSceneDirectory() {
        Hooks.on('renderSceneDirectory', (app, html, data) => {
            if (!game.user.isGM) {
                return;
            }
            const importButton = $(`<button class="radugen-generate-scene"><i class="fas fa-hat-wizard"></i>${game.i18n.localize('Radugen.generate-dungeon')}</button>`);

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
            const importButton = $(`<button class="radugen-generate-sidebar"><i class="fas fa-hat-wizard"></i>${game.i18n.localize('Radugen.generate-dungeon')}</button>`);

            html.find('.radugen-generate-sidebar').remove();
            html.find('button[data-action="configure"]').after(importButton);

            // Handle button clicks
            importButton.click(ev => {
                ev.preventDefault();
                this.createRadugenDialog();
            });
        });
    }

    async createRadugenDialog() {
        let settings = await radugen.helpers.Dialog.createDungeonGenerationDialog();
        this.createScene(settings);
    }

    async createScene(settings) {
        switch (game.settings.get("Radugen", "tileResolution")) {
            case 'small':
                settings.resolution = 64;
                break;
            case 'medium':
                settings.resolution = 128;
                break;
            case 'large':
                settings.resolution = 192;
                break;
            case 'huge':
                settings.resolution = 256;
                break;
            default:
        }

        settings.wallMode = game.settings.get("Radugen", "wallMode");

        const dungeon = await radugen.generators.dungeon.generate(settings.dungeonGenerator, settings.dungeonSize);

        const grid = dungeon.rasterize();

        let walls = [];
        if (settings.wallMode != 'none') {
            walls = new radugen.renderer.Walls(grid, settings.resolution, settings.wallMode).render();
        }

        const scene = new radugen.RadugenScene(grid.width, grid.height, settings.resolution, walls);
        
        const imageRenderer = new radugen.renderer.Image(grid, settings.resolution, settings.dungeonTheme);
        const blob = await imageRenderer.render();

        //Upload file
        let file = new File([blob], `${scene.id}.webp`);

        let upload = await FilePicker.upload("data", `${game.settings.get("Radugen", "dungeonUploadPath")}/`, file);

       

        //Save scene
        await radugen.compendium.scene.importDocument(scene).then((importedScene) => {
            importedScene.createThumbnail().then((data) => {
                importedScene.update({thumb:data.thumb}, {diff: false});
            });

            game.scenes.importFromCompendium(radugen.compendium.scene, importedScene.data._id, {}, { renderSheet: false }).then((compendiumScene) => {
                compendiumScene.createThumbnail().then((data) => {
                    compendiumScene.update({thumb:data.thumb}, {diff: false});
                });
            });
        });

        

    }
}

radugen.init = new RadugenInit();