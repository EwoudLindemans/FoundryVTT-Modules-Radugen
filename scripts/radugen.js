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
            const importButton = $('<button class="radugen-generate" style="min-width: 96%;"><i class="fas fa-hat-wizard"></i> Generate Dungeon</button>');

            html.find('.radugen-generate').remove();
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
            if (!(app instanceof Settings) || !game.user.isGM) {
                return;
            }

            const configureButton = html.find('button[data-action="configure"]');
            configureButton.before(`
                <button data-fatex="templates">
                    <i class="fas fa-hat-wizard"></i> Radugen: Generate Scene
                </button>
            `);

            html.on("click", 'button[data-fatex="templates"]', () => {
                this.createRadugenDialog();
            });
        });
    }

    createRadugenDialogHtml() {
        return `
        <p>Scene options:</p>
            <form class="radugen-generate-scene">
                <label>Dungeon Generator
                    ${this.createSelect('dungeonGenerator', radugen.generators.dungeonGenerator, function (keyvalue) {
                        return keyvalue == radugen.generators.dungeonGenerator.None ? true : false;
                    })}
                </label>
                <label>Dungeon Size
                    ${this.createSelect('dungeonSize', radugen.generators.dungeonSize, function (keyvalue) {
                        return keyvalue == radugen.generators.dungeonSize.Custom ? true : false;
                    })}
                </label>
            </form>
        <br />`;
    }

    createSelect(name, heynum, filter) {
        let select = `<select name="${name}" style="width: 90%">`
        for (let key of Object.keys(heynum)) {
            if (filter(heynum[key])) { continue; }
            select += `<option value="${heynum[key]}">${key}</option>`;
        }
        return select + '</select>';
    }

    getRadugenDialogOptions(dialog) {
        const settings = {};
        for (let element of [...document.querySelectorAll(`#app-${dialog.appId} form.radugen-generate-scene label>*`)]) {
            settings[element.name] = element.value;
        }
        return settings;
    }

    createRadugenDialog() {
        const dialog = new Dialog({
            title: "Radugen Generate Scene",
            content: this.createRadugenDialogHtml(),
            buttons: {
                generate: {
                    icon: '<i class="fas fa-check"></i>',
                    label: "Generate!",
                    callback: () => {
                        const settings = this.getRadugenDialogOptions(dialog);

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
                },
                cancel: {
                    icon: '<i class="fas fa-times"></i>',
                    label: "Cancel",
                    callback: () => console.log("Chose Two")
                }
            },
            default: "cancel",
            render: html => {
            },
            close: html => {
            }
        });
        dialog.render(true);
    }
}

radugen.init = new RadugenInit();