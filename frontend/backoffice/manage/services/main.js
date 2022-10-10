import { Navbar } from "/admin/import/Navbar.js";
import { Loading } from "/admin/import/Loading.js";
// import { Error } from "/admin/import/Error.js";
import { api_request } from "/js/auth.js";
// import * as Form from "./form.js";
import * as Mode from "./mode.js";
import * as ServiceRow from "./view/serviceRow.js";

let NavbarHandler;
let LoadingHandler;

let service_cache;

$(async function () {
    // Caricamento delle componenti esterne
    NavbarHandler = new Navbar("navbar-placeholder");
    LoadingHandler = new Loading("loading-container");
    await LoadingHandler.render();

    await LoadingHandler.wrap(async function () {
        await NavbarHandler.render();
        
        await showServices();
    })
})

/* Caricamento dei servizi */
async function showServices() {
    service_cache = await fetchServices();
    displayServices(service_cache);
}

/* Estrae tutti i servizi */
async function fetchServices() {
    try {
        let service = await api_request({
            type: "GET", url: `/services/`
        })

        // Ordinamento alfabetico
        service.sort((s1, s2) => s1.name.toLowerCase().localeCompare(s2.name.toLowerCase()));

        return service;
    } catch (err) {
        Mode.error(err.responseJSON.message ? err.responseJSON.message : "Si è verificato un errore");
    }
}

/**
 * Mostra a schermo dei dati servizi
 * @param serviceList   Servizi da visualizzare
 */
function displayServices(serviceList) {
    $("#service-container").html("");
    let index = 0;

    for (const service of serviceList) {
        $("#service-container").append(ServiceRow.render(service, index));

        index++;
    }
}