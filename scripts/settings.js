window.radugen = window.radugen || {};


window.radugen.settings = class extends FormApplication {
    constructor(entity, options) {
        super(entity, options);
    }

    static register() {
        //game.settings.registerMenu("radugen", 'setupMenu', {
        //    name: "Radugen",
        //    label: "random dungeon generator",
        //    hint: "radugen.setup.hint",
        //    icon: 'fas fa-wrench',
        //    type: window.radugen.settings,
        //    restricted: true
        //});

        game.settings.register("radugen", "dungeonUploadPath", {
            name: "Scene upload path",
            hint: "This is where we will store the generated dungeons",
            scope: "client",     // This specifies a client-stored setting
            config: true,        // This specifies that the setting appears in the configuration view
            type: String,
            default: "medium",        // The default value for the setting
            onChange: value => { // A callback function which triggers when the setting is changed
                game.settings.set("radugen", "dungeonUploadPath", value);
            }
        });

        game.settings.register("radugen", "tileResolution", {
            name: "Tile Resolution",
            hint: "In pixels, higher resolutions might cause issue's depending on your computer's performance",
            scope: "client",     // This specifies a client-stored setting
            config: true,        // This specifies that the setting appears in the configuration view
            type: String,
            choices: {           // If choices are defined, the resulting setting will be a select menu
                small: "64x64",
                medium: "128x128",
                large: "192x192",
                huge: "256x256",
            },
            default: "medium",        // The default value for the setting
            onChange: value => { // A callback function which triggers when the setting is changed
                game.settings.set("radugen", "tileResolution", value);
            }
        });

        game.settings.register("radugen", "wallMode", {
            name: "Wall Mode",
            hint: "This determines how wall object are rendered",
            scope: "client",     // This specifies a client-stored setting
            config: true,        // This specifies that the setting appears in the configuration view
            type: String,
            choices: {           // If choices are defined, the resulting setting will be a select menu
                none: "None (No walls will be created)",
                pretty: "Pretty (Walls will be rendered for player quality)",
                strict: "Strict (In this mode there will be no corner peeking)",
            },
            default: "pretty",        // The default value for the setting
            onChange: value => { // A callback function which triggers when the setting is changed
                game.settings.set("radugen", "wallMode", value);
            }
        });
    }
}



