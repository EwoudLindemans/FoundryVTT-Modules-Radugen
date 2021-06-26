window.radugen = window.radugen || {};
radugen.tables = radugen.tables || {};
radugen.tables.furnature = new Table();





const FurnatureTable = class {
    constructor() {
        //Bedroom


        let rnd = radugen.helper.getRndFromArr;
        let barracks = new Furnature("Barracks", 
            ``
        );
        barracks
            .add(["Beds", "Bunkbeds"], 0.5)
                .with(["Blanket", "Coushon", "Foot locker"], 0.5);



        console.log(barracks.getItems());
    }
};

radugen.tables.furnature = new FurnatureTable();