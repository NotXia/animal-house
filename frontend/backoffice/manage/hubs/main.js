const WEEKS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const TRANSLATE = { "monday": "Lunedì", "tuesday": "Martedì", "wednesday": "Mercoledì", "thursday": "Giovedì", "friday": "Venerdì", "saturday": "Sabato", "sunday": "Domenica" };

let map_address_search, form_address_search;
let map;
let marker = {};

let hub_cache = {}
let curr_mode = "";
let selected_hub = undefined;

$(document).ready(async function() {
    /* Inizializzazione barra di ricerca indirizzi */
    let map_address_search = new autocomplete.GeocoderAutocomplete(document.getElementById("map-search"), GEOAPIFY_KEY, { lang: "it", placeholder: "Cerca indirizzo", bias: "it" });
    let form_address_search = new autocomplete.GeocoderAutocomplete(document.getElementById("data-address"), GEOAPIFY_KEY, { lang: "it", placeholder: "Autocompleta indirizzo", bias: "it" });

    /* Inizializzazione mappa */
    map = L.map('map').setView([0, 0], 13);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
    }).addTo(map);

    /* Barra di ricerca della mappa */
    map_address_search.on("select", async function (location) {
        focusMapOn(location.properties.lat, location.properties.lon);
    });


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
            showError(element.attr("name"), error);
        },
        submitHandler: async function(form, event) {
            event.preventDefault();

            showLoading();

            try {
                let hub_data = getHubData();
                let res_hub;

                // Aggiornamento o creazione
                switch (curr_mode) {
                    case "modify":
                        res_hub = await api_request({ 
                            type: "PUT", url: `/hubs/${encodeURIComponent(selected_hub)}`,
                            data: hub_data
                        });
                        break;
                }

                hub_cache[res_hub.code] = res_hub;
                loadHubData(hub_cache[res_hub.code]);
                viewMode();
            }
            catch (err) {
                if (err.status === 400) {
                    showErrors(err.responseJSON);
                }
                else {
                    console.log(err);
                    // errorMode(err.responseJSON.message);
                }
            }

            hideLoading();
        }
    });


    /* Barra di ricerca per autocompletamento indirizzo */
    form_address_search.on("select", async function (location) {
        let coord = new L.LatLng(location.properties.lat, location.properties.lon);

        focusMapOn(location.properties.lat, location.properties.lon);

        $("#data-address-city").val(location.properties.city ? location.properties.city : "");
        $("#data-address-street").val(location.properties.street ? location.properties.street : "");
        $("#data-address-number").val(location.properties.housenumber ? location.properties.housenumber : "");
        $("#data-address-postalcode").val(location.properties.postcode ? location.properties.postcode : "");

        if (curr_mode == "modify") {
            const hub_code = $("#data-code").val();
            addMarkerAt(coord.lat, coord.lng, hub_code, mode="modify");
        }
        
        if (!$("#data-code").val()) {
            $("#search-airport-spinner").show();
            getNearestAirportIATA(coord.lat, coord.lng, location.properties.country).then(function (iata) {
                if (!$("#data-code").val()) { $("#data-code").val(iata) }
                $("#search-airport-spinner").hide();
            });
        }
    });

    $("#enable-modify-button").on("click", function () {
        modifyMode();
    })


    $("#cancel-modify-button").on("click", function () {
        const hub_code = $("#data-code").val();
        viewMode();
        clearFormData();
        loadHubData(hub_cache[hub_code]);
    })

    startMode();

    try {
        const hubs = await api_request({
            method: "GET", url: "/hubs/",
            data: { page_size: 20, page_number: 0 }
        });
        
        for (const hub of hubs) {
            hub_cache[hub.code] = hub;
            addHubToMenu(hub);
            addMarkerAt(hub.position.coordinates[0], hub.position.coordinates[1], hub.code);
        }
        focusMapOn(hubs[0].position.coordinates[0], hubs[0].position.coordinates[1]);
    }
    catch (err) {
        console.error(err);
    }
});


function startMode() {
    curr_mode = "start";
    $("#hub-form").hide();
}

function viewMode() {
    curr_mode = "view";
    $("#hub-form").show();
    $("#enable-modify-button-container").show();
    $("#modify-button-container").hide();
    $("#modify-button").attr("type", "button");
    disableForm();
    if (selected_hub) {
        marker[selected_hub].dragging.disable();
        marker[selected_hub].setIcon(HUB_MARKER_ICON);
    }
}

function modifyMode() {
    curr_mode = "modify";
    $("#hub-form").show();
    $("#enable-modify-button-container").hide();
    $("#modify-button-container").show();
    $("#modify-button").attr("type", "submit");
    enableForm();
    $("#data-code").attr("readonly", true);
    marker[selected_hub].dragging.enable();
    marker[selected_hub].setIcon(MODIFY_HUB_MARKER_ICON);
}

function disableForm() {
    $("#hub-form input[type='text']").attr("readonly", true);
    $("#hub-form input[type='time']").attr("readonly", true);
    $("#hub-form button[id*='data-opening_time']").prop("disabled", true);
}

function enableForm() {
    $("#hub-form input[type='text']").attr("readonly", false);
    $("#hub-form input[type='time']").attr("readonly", false);
    $("#hub-form button[id*='data-opening_time']").prop("disabled", false);
}


function getHubData() {
    let hub_data = {
        code: $("#data-code").val(),
        name: $("#data-name").val(),
        phone: $("#data-phone").val() === "" ? undefined : $("#data-phone").val(),
        email: $("#data-email").val() === "" ? undefined : $("#data-email").val(),
        address: {
            city: $("#data-address-city").val(),
            street: $("#data-address-street").val(),
            number: $("#data-address-number").val(),
            postal_code: $("#data-address-postalcode").val()
        },
        position: {
            type: "Point",
            coordinates: [marker[$("#data-code").val()].getLatLng().lat, marker[$("#data-code").val()].getLatLng().lng]
        },
        opening_time: {}
    };

    for (const day of WEEKS) {
        let opening_slots = []
        let input_time_start = $(`#${day}-accordion-container > * input[name*=-time-start]`);
        let input_time_end = $(`#${day}-accordion-container > * input[name*=-time-end]`);

        for (let i=0; i<input_time_start.length; i++) {
            opening_slots.push({
                start: moment(input_time_start[i].value, "HH:mm").format(),
                end: moment(input_time_end[i].value, "HH:mm").format(),
            });
        }
        hub_data.opening_time[day] = opening_slots;
    }

    return hub_data;
}

function loadHubData(hub) {
    selected_hub = hub.code;

    $("#data-code").val(hub.code);
    $("#data-name").val(hub.name);
    $("#data-phone").val(hub.phone);
    $("#data-email").val(hub.email);
    $("#data-address-city").val(hub.address.city);
    $("#data-address-street").val(hub.address.street);
    $("#data-address-number").val(hub.address.number);
    $("#data-address-postalcode").val(hub.address.postal_code);
    for (const day of WEEKS) {
        for (const slot of hub.opening_time[day]) {
            addTimeSlotTo(day, slot.start, slot.end);
        }
    }

    addMarkerAt(hub.position.coordinates[0], hub.position.coordinates[1], hub.code);
}

function clearFormData() {
    $("#hub-form").trigger("reset");
    emptyTimeSlots();
    clearErrors();
}



function focusMapOn(lat, lon) {
    map.flyTo([lat, lon], 16, {animate: true, duration: 0.5});
}


const HUB_MARKER_ICON = new L.Icon({
    iconUrl: "/img/sandrone.jfif",
    iconSize: [25, 25],
    // iconAnchor: [12, 41],
});
const MODIFY_HUB_MARKER_ICON = new L.Icon({
    iconUrl: "/img/santandrea.png",
    iconSize: [25, 25],
    // iconAnchor: [12, 41],
});

function addMarkerAt(lat, lon, hub_code, mode="") {
    let coord = new L.LatLng(lat, lon);
    
    if (marker[hub_code]) { map.removeLayer(marker[hub_code]); } // Rimozione vecchio marker

    switch (mode) {
        case "modify": marker[hub_code] = new L.Marker(coord, { icon: MODIFY_HUB_MARKER_ICON, draggable: true }); break;
        default: marker[hub_code] = new L.Marker(coord, { icon: HUB_MARKER_ICON }); break;
    }
    map.addLayer(marker[hub_code]);
}


async function getNearestAirportIATA(lat, lon, country) {
    const center_coords = new L.LatLng(lat, lon);
    const SEARCH_RANGE = 150000 /* meters */
    let nearest_airport;

    try {
        // Estrazione aeroporti vicini
        const airports_res = await $.ajax({
            method: "GET", url: `https://overpass-api.de/api/interpreter?data=
                [out:json];
                area["name:it"="${country}"];
                ( nwr(area)[aeroway=aerodrome][aerodrome=international][~"iata|icao"~"."](around:${SEARCH_RANGE}, ${center_coords.lat}, ${center_coords.lng}); );
                out center;
            `
        });

        // Seleziona l'aeroporto meno distante
        let curr_best_distance = Infinity;
        for (const airport of airports_res.elements) {
            const airport_coord = new L.LatLng(airport.center.lat, airport.center.lon);
            const iata = airport.tags.iata;

            const distance = center_coords.distanceTo(airport_coord);
            if (distance < curr_best_distance) { 
                curr_best_distance = distance;
                nearest_airport = iata;
            }
        }
    }
    catch (err) {
        console.error(err);
    }

    return nearest_airport;
}


function addHubToMenu(hub) {
    $("#hub-menu-container").append(`
        <li class="nav-item mb-2">
            <button id="show-hub-${hub.code}" class="w-100 btn btn-outline-dark">
                <div class="w-100 p-1 text-start">
                    <p class="my-0"><span class="fw-bold">${he.encode(hub.code)}</span> ${he.encode(hub.name)}</p>
                    <p class="my-0">${he.encode(hub.address.street)} ${he.encode(hub.address.number)}, ${he.encode(hub.address.city)}</p>
                </div>
            </button>
        </li>
    `);

    $(`#show-hub-${hub.code}`).on("click", function () {
        viewMode();
        clearFormData();
        loadHubData(hub_cache[hub.code]);
        focusMapOn(hub_cache[hub.code].position.coordinates[0], hub_cache[hub.code].position.coordinates[1]);
    });
}

let time_slot_index = 0; // Per differenziare i vari slot
/* Crea un nuovo slot lavorativo per un giorno della settimana */
function addTimeSlotTo(day_of_week, start_time, end_time, focus=false) {
    const index = time_slot_index;
    time_slot_index++;

    $(`#${day_of_week}-accordion-container`).append(`
        <div id="opening_time-${day_of_week}-${index}">
            <div class="row mb-1">
                <div class="col-12 col-lg-8 offset-lg-2">
                    <div class="d-flex justify-content-center">
                        <div class="w-50">
                            <label for="data-${day_of_week}-${index}-time-start">Inizio</label>
                            <input type="time" class="form-control" name="opening_time-${day_of_week}-${index}-time-start" id="data-${day_of_week}-${index}-time-start" value="${start_time ? moment(start_time).format("HH:mm") : ""}">
                        </div>
                        <div class="w-50">
                            <label for="data-${day_of_week}-${index}-time-end">Fine</label>
                            <input type="time" class="form-control" name="opening_time-${day_of_week}-${index}-time-end" id="data-${day_of_week}-${index}-time-end" value="${end_time ? moment(end_time).format("HH:mm") : ""}">
                        </div>
                    </div>
                </div>
                <div class="col-1">
                    <div class="d-flex justify-content-center align-items-center h-100">
                        <button type="button" class="btn-close" aria-label="Cancella riga" id="data-opening_time-${day_of_week}-${index}-delete" name="opening_time-delete"></button>
                    </div>
                </div>
            </div>
            <div class="row mb-3">
                <div class="col-12">
                    <div id="data-opening_time-${day_of_week}-${index}-time-start-feedback" class="invalid-feedback d-block text-center" aria-live="polite"></div>
                    <div id="data-opening_time-${day_of_week}-${index}-time-end-feedback" class="invalid-feedback d-block text-center" aria-live="polite"></div>
                </div>
            </div>
        </div>
    `);

    //Validazione intervalli
    $(`#data-${day_of_week}-${index}-time-start`).rules("add", { 
        beforeTime: `#data-${day_of_week}-${index}-time-end`,
        required: { depends: (_) => $(`#data-${day_of_week}-${index}-time-end`).val() || $(`#data-${day_of_week}-${index}-hub`).val() }
    });
    $(`#data-${day_of_week}-${index}-time-end`).on("change", function () {
        $(`#data-${day_of_week}-${index}-time-start`).valid();
    });

    // Bottone per eliminare la riga
    $(`#data-opening_time-${day_of_week}-${index}-delete`).on("click", function (e) { 
        $(`#opening_time-${day_of_week}-${index}`).remove(); 
    });

    if (focus) { $(`#data-${day_of_week}-${index}-time-start`).focus(); }
}

/* Svuota il form degli slot lavorativi */
function emptyTimeSlots() {
    for (const day of WEEKS) {
        $(`#${day}-accordion-container`).html("");
    }
}


function showError(field, message) {
    $(`#data-${field}-feedback`).html(message);
    $(`#data-${field}-feedback`).show();
}

function showErrors(errors) {
    clearErrors();
    for (const error of errors) {
        showError(error.field, error.message);
    }
}

function clearError(field) {
    $(`#data-${field}-feedback`).html("");
    $(`#data-${field}-feedback`).hide();
}

function clearErrors() {
    for (const error of $(`div[id*="-feedback"]`)) {
        $(error).html("");
        $(error).hide();
    }
}
