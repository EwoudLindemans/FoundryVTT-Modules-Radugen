window.radugen = window.radugen || {};
radugen.helpers = {};

radugen.helpers.RadugenDialog = new class {
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

    html() {
        return renderTemplate(`modules/radugen/templates/dialog.html`, {
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
    }

    getRadugenDialogOptions(dialog) {
        const settings = {};
        for (let element of [...document.querySelectorAll(`#app-${dialog.appId} form.radugen-generate-scene label>*`)]) {
            settings[element.name] = element.value;
        }
        return settings;
    }

    create(html) {
        return this.html().then((html) => {
            new Promise((resolve, reject) => {
                const dialog = new Dialog({
                    title: "Radugen Generate Scene",
                    content: html,
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
                    render: html => { },
                    close: html => { }
                });
                dialog.render(true);
            });
        });
    }
}