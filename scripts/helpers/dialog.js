window.radugen = window.radugen || {};
radugen.helpers = {};

radugen.helpers.DialogClass = class {
    constructor() {
        this._themeLoader = radugen.classes.ThemeLoader;

        game.settings.register("Radugen", "dungeonGenerationSelectedFields", {
            scope: "world", 
            config: false,     
            type: String,
            default: "{}",
          });

        this._selectedFields = JSON.parse(game.settings.get("Radugen", "dungeonGenerationSelectedFields"));
     }

    getKeyValueFromObject(heynum, selected) {
        let returnArr = [];
        for (let key of Object.keys(heynum)) {
            returnArr.push({
                key: key,
                value: heynum[key],
                selected : selected == heynum[key]
            });
        }
        return returnArr;
    }

    getFormFields(html) {
        const form = html[0].querySelector("form");
        const fd = new FormDataExtended(form);
        this._selectedFields = fd.toObject();
        game.settings.set("Radugen", "dungeonGenerationSelectedFields", JSON.stringify(this._selectedFields));
        return this._selectedFields;
    }

    async createDungeonGenerationDialog() {
        const html = await renderTemplate(`modules/Radugen/templates/dialog.html`, {
            fields: [
                {
                    label: 'Dungeon Generator',
                    name: 'dungeonGenerator',
                    select: this.getKeyValueFromObject(radugen.generators.dungeonGenerator, this._selectedFields.dungeonGenerator)
                },
                {
                    label: 'Dungeon Size',
                    name: 'dungeonSize',
                    select: this.getKeyValueFromObject(radugen.generators.dungeonSize, this._selectedFields.dungeonSize)
                },
                {
                    label: 'Theme',
                    name: 'dungeonTheme',
                    select: this.getKeyValueFromObject(await this._themeLoader.loadThemesObject(), this._selectedFields.dungeonTheme)
                }
            ]
        });

        return await Dialog.prompt({
            title: "Radugen Generate Scene",
            content: html,
            label: 'Generate',
            callback: html => {
                return this.getFormFields(html);
            }
        });
    }
}