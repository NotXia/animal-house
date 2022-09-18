import { Navbar } from "/admin/import/Navbar.js";
import { Loading } from "/admin/import/Loading.js";
import { Error } from "/admin/import/Error.js";
import * as CategoryHandler from "./view/categories.js";
import * as SpeciesHandler from "./view/species.js";
import * as Mode from "./mode.js";
import * as Form from "./form.js";

let NavbarHandler;
let LoadingHandler;


$(document).ready(async function() {
    // Caricamento delle componenti esterne
    NavbarHandler = new Navbar("navbar-placeholder");
    LoadingHandler = new Loading("loading-container");
    await LoadingHandler.render();

    await LoadingHandler.wrap(async function() {
        await NavbarHandler.render();
        
        try {
            Mode.start();

            await Form.init();
            window.reset = Form.reset;
    
            await CategoryHandler.init();
            await SpeciesHandler.init();
        }
        catch (err) {
            Mode.error("Si è verificato un errore in fase di inizializzazione");
        }

        $("#button-start-create").on("click", function () {
            Mode.create();
        })
    });
});