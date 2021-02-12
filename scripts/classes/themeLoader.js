window.radugen = window.radugen || {};
radugen.classes = radugen.classes || {};
radugen.classes.ThemeLoader = class {

    constructor() {
    }

    static async getJsonObject(src) {
        return new Promise(function(resove, reject){
            let request = new XMLHttpRequest();
            request.open('GET', src, true);
            request.send(null);
            request.onreadystatechange = function () {
                if (request.readyState === 4 && request.status === 200) {
                    resove(JSON.parse(request.responseText));
                }
            }
        });
    }

    static async loadThemes(){
        let themeFolderData = await FilePicker.browse("data", `modules/Radugen/assets/themes/`);
        return themeFolderData.dirs;
    }

    static async loadThemesObject(){
        let themes = {};
        let themeFolders = await this.loadThemes();
        for(let subFolder of themeFolders){
            let name = decodeURIComponent(subFolder.split("/").pop());
            themes[name] = subFolder;
        }
        return themes;
    }

    static async loadTheme(themeFolder){
        let themeFolderStructure = await FilePicker.browse("data", themeFolder);
        let themeFolders = themeFolderStructure.dirs;

        let theme = {
            settings : {
                floor: {
                    allowMultiple: false,
                    allowTexture: false,
                    allowHue: false,
                    allowRotate: false,
                    allowFlip: false
                }
            }
        }

        if(themeFolderStructure.files.length){
            theme.settings = await this.getJsonObject(themeFolderStructure.files[0]);
        }

        for(let subFolder of themeFolders){
            let name = subFolder.substring(subFolder.lastIndexOf("/") + 1, subFolder.length);
            theme[name] = (await FilePicker.browse("data",subFolder)).files;
            
        }

        return theme;
    }
}
