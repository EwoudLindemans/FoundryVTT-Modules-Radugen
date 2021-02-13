window.radugen = window.radugen || {};


class RadugenSettings extends FormApplication  {
    constructor(...args) {
        super(...args);
    }
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.title = "Random dungeon generator settings";
        options.id = "Radugen";
        options.template = "modules/Radugen/templates/thanks.html";
        return options;
    }
}

window.radugen.settings = class extends FormApplication {
    constructor(entity, options) {
        super(entity, options);
    }

    static register() {
        game.settings.register("Radugen", "dungeonUploadPath", {
            name: "Scene upload path",
            hint: "This is where we will store the generated dungeons",
            scope: "world",     // This specifies a client-stored setting
            config: true,        // This specifies that the setting appears in the configuration view
            type: window.Azzu.SettingsTypes.DirectoryPicker,
            default: "modules/Radugen/uploads/scenes",        // The default value for the setting
            restricted: true
        });

        game.settings.register("Radugen", "tileResolution", {
            name: "Tile Resolution",
            hint: "In pixels, higher resolutions might cause issue's depending on your computer's performance",
            scope: "world",     // This specifies a client-stored setting
            config: true,        // This specifies that the setting appears in the configuration view
            type: String,
            choices: {           // If choices are defined, the resulting setting will be a select menu
                small: "64x64",
                medium: "128x128",
                large: "192x192",
                huge: "256x256",
            },
            default: "small",        // The default value for the setting
            restricted: true
        });

        game.settings.register("Radugen", "wallMode", {
            name: "Wall Mode",
            hint: "This determines how wall object are rendered",
            scope: "world",     // This specifies a client-stored setting
            config: true,        // This specifies that the setting appears in the configuration view
            type: String,
            choices: {           // If choices are defined, the resulting setting will be a select menu
                none: "None (No walls will be created)",
                pretty: "Pretty (Walls will be rendered for player quality)",
                strict: "Strict (In this mode there will be no corner peeking)",
            },
            default: "strict",        // The default value for the setting
            restricted: true
        });

        game.settings.registerMenu("Radugen", 'radugenMenu', {
            name: "Radugen",
            hint: "See the project maintainers, and their donation profile's",
            config: true,
            label: "Support us!",
            icon: 'fas fa-heart',
            type: RadugenSettings,
            restricted: true
         });
    }
}



