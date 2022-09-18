import { Navbar } from "/admin/import/Navbar.js";
import { Loading } from "/admin/import/Loading.js";
import { Error } from "/admin/import/Error.js";
import * as CategoryHandler from "./view/categories.js";
import * as TextEditor from "./view/textEditor.js";
import * as SpeciesHandler from "./view/species.js";

let NavbarHandler;
let LoadingHandler;
let editor;

$(document).ready(async function() {
    // Caricamento delle componenti esterne
    NavbarHandler = new Navbar("navbar-placeholder");
    LoadingHandler = new Loading("loading-container");
    await LoadingHandler.render();

    await LoadingHandler.wrap(async function() {
        await NavbarHandler.render();
        
        try {
            editor = await TextEditor.init("#container-item\\.description-editor");
            editor = await TextEditor.init("#container-product\\.description-editor");
    
            await CategoryHandler.init();
            await SpeciesHandler.init();
        }
        catch (err) {
            Error.showError("global", "Si è verificato un errore in fase di inizializzazione");
        }
    });
});