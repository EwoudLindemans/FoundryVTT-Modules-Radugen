window.radugen = window.radugen || {};
radugen.helpers = {};

radugen.helpers.RadugenDialog = new class {
    constructor() { }

    html() {
        //return renderTemplate(`$modules/radugen/templates/dialog.html`, {
        //    selects: [
        //        this.createSelect('dungeonGenerator', radugen.generators.dungeonGenerator, function (keyvalue) {
        //            return keyvalue == radugen.generators.dungeonGenerator.None ? true : false;
        //        }),
        //        this.createSelect('dungeonGenerator', radugen.generators.dungeonGenerator, function (keyvalue) {
        //            return keyvalue == radugen.generators.dungeonGenerator.None ? true : false;
        //        })
        //    ]

        //});

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

    create() {
        let promise = new Promise((resolve, reject) => {
            const dialog = new Dialog({
                title: "Radugen Generate Scene",
                content: this.html(),
                buttons: {
                    generate: {
                        icon: '<i class="fas fa-check"></i>',
                        label: "Generate!",
                        callback: () => {
                            const settings = this.getRadugenDialogOptions(dialog);
                            resolve(settings);
                        }
                    },
                    cancel: {
                        icon: '<i class="fas fa-times"></i>',
                        label: "Cancel",
                        callback: () => {
                            reject("cancel");
                        }
                    }
                },
                default: "cancel",
                render: html => {},
                close: html => {}
            });
            dialog.render(true);
        });
        return promise;
    }
}