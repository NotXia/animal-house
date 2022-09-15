import { Navbar } from "/admin/import/Navbar.js";
import { Loading } from "/admin/import/Loading.js";
import { Error } from "/admin/import/Error.js";
import * as OpeningTime from "./view/openingTime.js";
import * as HubMenuHandler from "./view/hubMenu.js";
import * as Map from "./map.js";
import * as Airport from "./iataCode.js";
import * as Form from "./form.js";
import * as Mode from "./mode.js";
import * as HubAPI from "./hubAPI.js";
import { GEOAPIFY_KEY } from "/js/keys.js";

let NavbarHandler, LoadingHandler;
let hub_cache = {}
let selected_hub = undefined;

$(document).ready(async function() {
    // Caricamento delle componenti esterne
    NavbarHandler = new Navbar("navbar-placeholder");
    LoadingHandler = new Loading("loading-container");
    await LoadingHandler.render();

    await LoadingHandler.wrap(async function() {
        await NavbarHandler.render();

        /* Inizializzazione barra di ricerca indirizzi */
        let map_address_search = new autocomplete.GeocoderAutocomplete(document.getElementById("map-search"), GEOAPIFY_KEY, { lang: "it", placeholder: "Cerca indirizzo", bias: "it" });
        let form_address_search = new autocomplete.GeocoderAutocomplete(document.getElementById("data-address"), GEOAPIFY_KEY, { lang: "it", placeholder: "Indirizzo", bias: "it" });

        // Inizializzazione mappa
        Map.init();

        /* Barra di ricerca della mappa */
        map_address_search.on("select", async function (location) {
            Map.focusAt(location.properties.lat, location.properties.lon);
        });

        // Inizializzazione tooltips
        const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));

        OpeningTime.createOpeningTimeForm();

        HubMenuHandler.init(showHub)

        $("#hub-form").validate({
            rules: {
                code: { required: true, hubCode: true },
                name: { required: true },
                phone: { required: false, phoneNumber: true },
                email: { required: false, email: true },
                street: { required: true },
                number: { required: true },
                city: { required: true },
                postalcode: { required: true }
            },
            errorPlacement: function(error, element) {
                Error.showError(element.attr("name"), error);
            },
            submitHandler: async function(form, event) {
                event.preventDefault();

                await LoadingHandler.wrap(async function() {
                    try {
                        let hub_data = getHubData();
                        let res_hub;

                        switch (Mode.current) {
                            case Mode.MODIFY: 
                                res_hub = await HubAPI.modify(selected_hub, hub_data);
                                hub_cache[res_hub.code] = res_hub;
                                HubMenuHandler.updateHubMenu(res_hub);
                                break;
                            case Mode.CREATE: 
                                res_hub = await HubAPI.create(hub_data);
                                hub_cache[res_hub.code] = res_hub;
                                HubMenuHandler.render(Object.values(hub_cache));
                                break;
                        }
                        
                        showHub(res_hub.code);
                    }
                    catch (err) {
                        switch (err.status) {
                            case 400: Error.showErrors(err.responseJSON); break;
                            case 409: Error.showError(err.responseJSON.field, err.responseJSON.message); break;
                            default: console.log(err); break;
                        }
                    }
                });
            }
        });


        /* Barra di ricerca per autocompletamento indirizzo */
        form_address_search.on("select", async function (location) {
            if (!location) { return; }
            let coord = new L.LatLng(location.properties.lat, location.properties.lon);

            // Autocompletamento indirizzo
            Form.fillAddress({
                city: location.properties.city ? location.properties.city : "",
                street: location.properties.street ? location.properties.street : "",
                number: location.properties.housenumber ? location.properties.housenumber : "",
                postal_code: location.properties.postcode ? location.properties.postcode : ""
            });
            Form.enableAddressInput();

            Map.focusAt(location.properties.lat, location.properties.lon);
            
            if (Mode.current == Mode.MODIFY) {
                // Spostamento marker
                const hub_code = $("#data-code").val();
                Map.addMarkerAt(coord.lat, coord.lng, hub_code, Mode.MODIFY);
            }
        
            if (Mode.current == Mode.CREATE) {
                Map.removeTempMarker();
                Map.addTempMarkerAt(coord.lat, coord.lng);

                // Autocompletamento IATA in modalità creazione
                if (!$("#data-code").val()) {
                    $("#search-airport-spinner").show();
                    Airport.getNearestAirportIATA(coord.lat, coord.lng, location.properties.country).then(function (iata) {
                        if (!$("#data-code").val()) { $("#data-code").val(iata) }
                        $("#search-airport-spinner").hide();
                    });
                }
            }
        });


        $("#enable-modify-button").on("click", function () {
            Mode.modify(Map, selected_hub);
        });

        $("#cancel-modify-button").on("click", function () {
            const hub_code = $("#data-code").val();
            Form.clearFormData();
            showHub(hub_code);
        });

        $("#start-delete-button").on("click", function () {
            $("#modal-delete-hub-body").text(`Stai cancellando l'hub ${selected_hub}.`);
        });

        $("#delete-button").on("click", async function () {
            try {
                await HubAPI.remove(selected_hub);

                // Aggiornamento mappa
                Map.removeMarker(selected_hub);
                Map.focusCenter();

                // Aggiornamento menu
                delete hub_cache[selected_hub];
                HubMenuHandler.render(Object.values(hub_cache));

                Mode.start();
            } catch (err) {
                switch (err.status) {
                    case 400: Error.showErrors(err.responseJSON); break;
                    default: console.log(err); break;
                }
            }
        });

        $("#start-create-button").on("click", function () {
            // Deseleziona l'hub corrente
            if (selected_hub) {
                $("#cancel-modify-button").trigger("click"); 
                selected_hub = null; 
            }

            Form.clearFormData();
            Mode.create();
            Map.addTempMarkerAt(Map.CENTER[0], Map.CENTER[1]);
            Map.focusCenter();
        });


        // Inizializzazione lista hub
        try {
            Mode.start();
            const hubs = await HubAPI.get();
            
            HubMenuHandler.render(hubs);
            for (const hub of hubs) {
                hub_cache[hub.code] = hub;
                Map.addMarkerAt(hub.position.coordinates[0], hub.position.coordinates[1], hub.code);
            }
            Map.focusAt(hubs[0].position.coordinates[0], hubs[0].position.coordinates[1]);
        }
        catch (err) {
            console.error(err);
        }
    });
});


function getHubData() {
    let hub_data = Form.getHubData();

    if (Mode.current === Mode.CREATE) {
        hub_data.position = Map.getTempMarkerCoordinates();
    }
    else {
        hub_data.position = Map.getMarkerCoordinatesOf($("#data-code").val());
    }

    return hub_data;
}

function showHub(hub_code) {
    selected_hub = hub_code;
    let hub = hub_cache[hub_code];

    Form.clearFormData();
    Form.loadHubData(hub);

    Map.addMarkerAt(hub.position.coordinates[0], hub.position.coordinates[1], hub.code);
    Map.focusAt(hub.position.coordinates[0], hub.position.coordinates[1]);
    Mode.view(Map, selected_hub);
}