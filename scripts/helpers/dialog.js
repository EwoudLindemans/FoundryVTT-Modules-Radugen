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
            if(heynum[key] < 0){continue;}
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

    translateArray(array, fieldName) {
        const toCamelCase = (str) => `${str.substr(0, 1).toLowerCase()}${str.substr(1)}`;
        const returnArr = [];
        for(let i = 0; i < array.length; i++){
            const obj = new Object(array[i]);
            obj[fieldName] = game.i18n.localize(`Radugen.${toCamelCase(obj[fieldName])}`);
            returnArr.push(obj);
        }
        return returnArr;
    }

    async blobToDataURL(blob) {
        return new Promise(function(resolve){
            var a = new FileReader();
            a.onload = function(e) {resolve(e.target.result);}
            a.readAsDataURL(blob);
        });
    }

    async createDungeonGenerationDialog() {
        let themes = this.getKeyValueFromObject(await this._themeLoader.loadThemesObject(), this._selectedFields.dungeonTheme);
        for(let theme of themes){
            const dungeon = radugen.generators.dungeon.generate(radugen.generators.dungeonGenerator.Preview, radugen.generators.dungeonSize.Tiny);
            const grid = dungeon.rasterize();
            const imageRenderer = new radugen.renderer.Image(grid, 16, theme.value);
            const blob = await imageRenderer.render();
            theme.name = decodeURIComponent(theme.value.split('/').pop());
            theme.img = await this.blobToDataURL(blob)
        }

        const html = await renderTemplate(`modules/Radugen/templates/dialog.html`, {
            fields: [
                {
                    label: game.i18n.localize('Radugen.dungeonGenerator'),
                    name: 'dungeonGenerator',
                    select: this.getKeyValueFromObject(radugen.generators.dungeonGenerator, this._selectedFields.dungeonGenerator)
                },
                {
                    label: game.i18n.localize('Radugen.dungeonSize'),
                    name: 'dungeonSize',
                    select: this.translateArray(this.getKeyValueFromObject(radugen.generators.dungeonSize, this._selectedFields.dungeonSize), 'key')
                },
                {
                    label: game.i18n.localize('Radugen.theme'),
                    name: 'dungeonTheme',
                    radio: themes
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