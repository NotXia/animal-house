let map_address_search, form_address_search;
let map;
let marker;
const WEEKS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const TRANSLATE = { "monday": "Lunedì", "tuesday": "Martedì", "wednesday": "Mercoledì", "thursday": "Giovedì", "friday": "Venerdì", "saturday": "Sabato", "sunday": "Domenica" };

const green_icon = new L.Icon({
    iconUrl: "/img/sandrone.jfif",
    iconSize: [25, 25],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

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

    /* Barra di ricerca per autocompletamento indirizzo */
    form_address_search.on("select", async function (location) {
        let coord = new L.LatLng(location.properties.lat, location.properties.lon);

        focusMapOn(location.properties.lat, location.properties.lon);

        $("#data-address-city").val(location.properties.city ? location.properties.city : "");
        $("#data-address-street").val(location.properties.street ? location.properties.street : "");
        $("#data-address-number").val(location.properties.housenumber ? location.properties.housenumber : "");
        $("#data-address-postalcode").val(location.properties.postcode ? location.properties.postcode : "");

        if (marker) { map.removeLayer(marker); }
        marker = new L.Marker(coord, { draggable:true, icon: green_icon});
        map.addLayer(marker);
        
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


    startMode();

    try {
        const hubs = await api_request({
            method: "GET", url: "/hubs/",
            data: { page_size: 20, page_number: 0 }
        });
        
        for (const hub of hubs) {
            addHubToMenu(hub);
            AddMarkerOn(hub.position.coordinates[0], hub.position.coordinates[1]);
        }
        focusMapOn(hubs[0].position.coordinates[0], hubs[0].position.coordinates[1]);
    }
    catch (err) {
        console.error(err);
    }
});


function startMode() {
    $("#hub-form").hide();
}

function viewMode() {
    $("#hub-form").show();
    $("#enable-modify-button-container").show();
    $("#modify-button-container").hide();
    $("#modify-button").attr("type", "button");
    disableForm();
}

function modifyMode() {
    $("#hub-form").show();
    $("#enable-modify-button-container").hide();
    $("#modify-button-container").show();
    $("#modify-button").attr("type", "submit");
    enableForm();
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


function loadHubData(hub) {
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
}

function clearHubData() {
    $("#hub-form").trigger("reset");
    emptyTimeSlots();
}



function focusMapOn(lat, lon) {
    map.flyTo([lat, lon], 16, {animate: true, duration: 0.5});
}

function AddMarkerOn(lat, lon) {
    let coord = new L.LatLng(lat, lon);
    
    marker = new L.Marker(coord, { icon: green_icon});
    map.addLayer(marker);
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
        clearHubData();
        loadHubData(hub);
        focusMapOn(hub.position.coordinates[0], hub.position.coordinates[1]);
        viewMode();
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

    // Validazione intervalli
    // $(`#data-${day_of_week}-${index}-time-start`).rules("add", { 
    //     beforeTime: `#data-${day_of_week}-${index}-time-end`,
    //     required: { depends: (_) => $(`#data-${day_of_week}-${index}-time-end`).val() || $(`#data-${day_of_week}-${index}-hub`).val() }
    // });
    // $(`#data-${day_of_week}-${index}-time-end`).on("change", function () {
    //     $(`#data-${day_of_week}-${index}-time-start`).valid();
    // });

    // Bottone per eliminare la riga
    $(`#data-opening_time-${day_of_week}-${index}-delete`).on("click", function (e) { 
        $(`#opening_time-${day_of_week}-${index}`).remove(); 
    });

    if (focus) { $(`#data-${day_of_week}-${index}-time-start`).focus(); }
}

/* Svuota il form degli slot lavorativi */
function emptyTimeSlots() {
    // time_slot_index = 0;

    for (const day of WEEKS) {
        $(`#${day}-accordion-container`).html("");
    }
}