window.radugen = window.radugen || {};
radugen.helpers = {};

radugen.helpers.Dialog = new class {
    constructor() { }

    getKeyValueFromObject(heynum) {
        let returnArr = [];
        for (let key of Object.keys(heynum)) {
            returnArr.push({
                key: key,
                value: heynum[key]
            });
        }
        return returnArr;
    }

    getFormFields(html) {
        const form = html[0].querySelector("form");
        const fd = new FormDataExtended(form);
        return fd.toObject();
    }

    async createDungeonGenerationDialog() {
        const html = await renderTemplate(`modules/Radugen/templates/dialog.html`, {
            fields: [
                {
                    label: 'Dungeon Generator',
                    name: 'dungeonGenerator',
                    select: this.getKeyValueFromObject(radugen.generators.dungeonGenerator)
                },
                {
                    label: 'Dungeon Size',
                    name: 'dungeonSize',
                    select: this.getKeyValueFromObject(radugen.generators.dungeonSize)
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