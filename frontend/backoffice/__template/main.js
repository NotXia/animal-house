import { Navbar } from "/admin/import/Navbar.js";
import { Loading } from "/admin/import/Loading.js";
import { Error } from "../../import/Error.js";

let NavbarHandler;
let LoadingHandler;


$(document).ready(async function() {
    // Caricamento delle componenti esterne
    NavbarHandler = new Navbar("navbar-placeholder");
    LoadingHandler = new Loading("loading-container");
    await LoadingHandler.render();

    await LoadingHandler.wrap(async function() {
        await NavbarHandler.render();

        // Inizializzazione
    });
});