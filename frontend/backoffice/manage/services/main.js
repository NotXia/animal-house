import { Navbar } from "/admin/import/Navbar.js";
import { Loading } from "/admin/import/Loading.js";
// import { Error } from "/admin/import/Error.js";
// import { api_request } from "/js/auth.js";
// import * as Form from "./form.js";
// import * as Mode from "./mode.js";
// import * as ServiceRow from "./view/serviceRow.js"

let NavbarHandler;
let LoadingHandler;

$(async function () {
    // Caricamento delle componenti esterne
    NavbarHandler = new Navbar("navbar-placeholder");
    LoadingHandler = new Loading("loading-container");
    await LoadingHandler.render();

    await LoadingHandler.wrap(async function () {
        await NavbarHandler.render();
    })
})