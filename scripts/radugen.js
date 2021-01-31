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
        let selectionListHtml = '<select name="dungeonGenerator" style="width: 90%">';
        for (let key of Object.keys(radugen.generators.dungeonGenerator)){
            if (radugen.generators.dungeonGenerator[key] == radugen.generators.dungeonGenerator.None) continue;
            selectionListHtml += `
<option value="${radugen.generators.dungeonGenerator[key]}">${key}</option>`;
        }
        selectionListHtml += `
</select>`;

        const d = new Dialog({
            title: "Radugen Generate Scene",
            content: `<p>Scene options:</p>
<form class="radugen-generate-scene">
<label>Dungeon Generator
${selectionListHtml}
<option value="0">Quirks</option>
<option value="1" selected="selected">Static</option>
</select>
</label>
<label>Width <input type="text" name="width" value="20" style="width: 90%"></label>
<label>Height <input type="text" name="height" value="20" style="width: 90%"></label>
<label>TileSize <input type="text" name="tileSize" value="128" style="width: 90%" /> px</label>
</form>
<br />`,
            buttons: {
                generate: {
                    icon: '<i class="fas fa-check"></i>',
                    label: "Generate!",
                    callback: () => {
                        const settings = {};
                        for (let element of [...document.querySelectorAll(`#app-${d.appId} form.radugen-generate-scene label>*`)]) {
                            settings[element.name] = element.value;
                        }
                        
                        const [width, height, tileSize] = [settings.width, settings.height, settings.tileSize].map(x => parseInt(x));

                        const dungeonGenerator = radugen.generators.dungeon.generate(settings.dungeonGenerator, width, height)
                        const dungeonMap = dungeonGenerator.generate();

                        const wallRenderer = new radugen.renderer.Walls(dungeonMap, tileSize);
                        const walls = wallRenderer.render();


                        const scene = new radugen.RadugenScene(width, height, tileSize, walls);

                        const imageRenderer = new radugen.renderer.Image(dungeonMap, tileSize);
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
        d.render(true);
           
        return CONFIG.FateX.applications.templateSettings.render(true);
    });
});